/**
 * 轻量诊断日志与同步/异步调用追踪模块。
 *
 * 日志用于排查业务调用链，不参与游戏结算，也不应成为游戏运行的前置条件。
 * 日志默认保存在当前浏览器 localStorage，最多保留 MAX_LOGS 条；
 * 存储失败时应降级处理，不能阻断玩家操作。
 *
 * traceSync 通过 traceId 关联嵌套调用，并记录 START、完成、慢调用和异常。
 * 注意：该模块的日志数据不是玩家存档，清理日志不应影响游戏进度。
 */
const STORAGE_KEY = 'saga_galaxy_debug_logs_v1';
const MAX_LOGS = 2000;
let memoryLogs = null;
const listeners = new Set();
const traceStack = [];
let sequence = 0;
let incompleteChecked = false;
let diagnosticCollector = null;
let consoleWarningCaptureInstalled = false;

function detectIncomplete() {
  if (incompleteChecked || !memoryLogs) return;
  incompleteChecked = true;
  const pending = new Map();
  for (const item of memoryLogs) {
    const key = [item.traceId, item.module, item.function].join('|');
    if (item.event === 'START') {
      const list = pending.get(key) || [];
      list.push(item);
      pending.set(key, list);
    } else if (['END', 'RETURN', 'ERROR', 'SLOW', 'INCOMPLETE'].includes(item.event) || (item.event === 'WARN' && item.duration != null)) {
      const list = pending.get(key) || [];
      list.pop();
      if (list.length) pending.set(key, list);
      else pending.delete(key);
    }
  }
  for (const list of pending.values()) {
    for (const start of list) {
      memoryLogs.push({
        id: 'sg-incomplete-' + (++sequence),
        timestamp: new Date().toISOString(),
        level: 'WARN',
        module: start.module,
        function: start.function,
        event: 'INCOMPLETE',
        traceId: start.traceId,
        duration: null,
        detail: { startedAt: start.timestamp, reason: 'No matching completion record in the previous browser session; possible interruption.' },
      });
    }
  }
  if (memoryLogs.length > MAX_LOGS) memoryLogs.splice(0, memoryLogs.length - MAX_LOGS);
  if (pending.size) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLogs)); } catch { /* diagnostic only */ }
  }
}
function readLogs() {
  if (memoryLogs) return memoryLogs;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    memoryLogs = Array.isArray(parsed) ? parsed.slice(-MAX_LOGS) : [];
  } catch { memoryLogs = []; }
  detectIncomplete();
  return memoryLogs;
}
/**
 * 统一构造并分发一条日志。diagnosticCollector 存在时仅收集警告/错误，
 * 供诊断任务临时使用，避免把诊断过程写入常规日志。
 */
function emit(level, moduleName, functionName, event, traceId, detail = {}, duration = null) {
  try {
    const entry = {
      id: 'sg-' + Date.now().toString(36) + '-' + (++sequence).toString(36),
      timestamp: new Date().toISOString(), level,
      module: moduleName || 'App', function: functionName || 'unknown',
      event, traceId: traceId || 'untracked', duration, detail,
    };
    if (diagnosticCollector) {
      if (level === 'WARN' || level === 'ERROR') diagnosticCollector.push(entry);
      return entry;
    }
    const list = readLogs();
    list.push(entry);
    if (list.length > MAX_LOGS) list.splice(0, list.length - MAX_LOGS);
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
      catch (error) { console.warn('[SagaLogger] Log storage unavailable', error); }
    }
    const method = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'info';
    console[method]('[SagaLogger]', entry);
    listeners.forEach((listener) => { try { listener([...list].reverse()); } catch { /* isolated listener */ } });
    return entry;
  } catch { return null; }
}
function createTraceId() {
  sequence += 1;
  return 'SG-' + Date.now().toString(36) + '-' + sequence.toString(36);
}
export function logInfo(moduleName, functionName, detail = {}) {
  return emit('INFO', moduleName, functionName, 'INFO', traceStack[traceStack.length - 1] || 'untracked', detail);
}
export function logWarn(moduleName, functionName, detail = {}) {
  return emit('WARN', moduleName, functionName, 'WARN', traceStack[traceStack.length - 1] || 'untracked', detail);
}
/**
 * 包装一次同步或异步调用并记录完整生命周期。
 * callback 抛错时记录 ERROR 后原样重新抛出，不吞掉业务异常；
 * callback 返回 Promise 时，在 Promise settle 后记录最终结果。
 */
export function traceSync(name, callback, detail = {}) {
  const parts = name.split('.');
  const moduleName = parts[0];
  const functionName = parts.slice(1).join('.') || name;
  const traceId = traceStack[traceStack.length - 1] || createTraceId();
  const start = performance.now();
  traceStack.push(traceId);
  emit('INFO', moduleName, functionName, 'START', traceId, detail);
  let result;
  try { result = callback(); }
  catch (error) {
    traceStack.pop();
    emit('ERROR', moduleName, functionName, 'ERROR', traceId, {
      message: error?.message || String(error), stack: error?.stack || null,
    }, Math.round(performance.now() - start));
    throw error;
  }
  traceStack.pop();
  if (result && typeof result.then === 'function') {
    emit('INFO', moduleName, functionName, 'ASYNC', traceId, { status: 'pending' });
    return Promise.resolve(result).then(
      (value) => {
        const duration = Math.round(performance.now() - start);
        const warning = duration >= 500;
        emit(warning ? 'WARN' : 'INFO', moduleName, functionName, duration >= 1000 ? 'SLOW' : warning ? 'WARN' : 'END', traceId, { status: 'resolved' }, duration);
        return value;
      },
      (error) => {
        emit('ERROR', moduleName, functionName, 'ERROR', traceId, {
          message: error?.message || String(error), stack: error?.stack || null, status: 'rejected',
        }, Math.round(performance.now() - start));
        throw error;
      },
    );
  }
  const duration = Math.round(performance.now() - start);
  const isReturn = result === null || result === false;
  const warning = duration >= 500;
  const verySlow = duration >= 1000;
  emit(warning ? 'WARN' : 'INFO', moduleName, functionName,
    isReturn ? 'RETURN' : verySlow ? 'SLOW' : warning ? 'WARN' : 'END', traceId,
    isReturn ? { ...detail, reason: result === null ? 'returned_null' : 'returned_false' } : detail, duration);
  return result;
}
export function getLogs() { return [...readLogs()].reverse(); }
export function subscribeLogs(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function clearLogs() {
  memoryLogs = [];
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* keep gameplay running */ }
  listeners.forEach((listener) => { try { listener([]); } catch { /* isolated listener */ } });
}

export async function captureDiagnosticLogs(callback) {
  const previous = diagnosticCollector;
  const captured = [];
  diagnosticCollector = captured;
  try { const value = await callback(); return { value, records: [...captured] }; }
  finally { diagnosticCollector = previous; }
}

export function installConsoleWarningCapture() {
  if (consoleWarningCaptureInstalled || typeof console === 'undefined') return;
  consoleWarningCaptureInstalled = true;
  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    originalWarn(...args);
    if (args[0] === '[SagaLogger]') return;
    const message = args.map((item) => {
      if (item instanceof Error) return item.message;
      if (typeof item === 'string') return item;
      try { return JSON.stringify(item); } catch { return String(item); }
    }).join(' ');
    emit('WARN', 'Console', 'warn', 'CONSOLE_WARN', 'untracked', {
      message: message.slice(0, 1200), stack: new Error('Console warning capture').stack || null, source: 'console.warn',
    });
  };
}
