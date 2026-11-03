import { useMemo, useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Download, Search, Trash2 } from 'lucide-react';

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR'];
const EVENTS = ['ALL', 'START', 'END', 'RETURN', 'ASYNC', 'SLOW', 'ERROR', 'WARN', 'INCOMPLETE'];

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DebugConsole({ logs, onClear, onRefresh }) {
  const [level, setLevel] = useState('ALL');
  const [event, setEvent] = useState('ALL');
  const [moduleName, setModuleName] = useState('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const filtered = useMemo(() => logs.filter((item) => {
    const levelMatch = level === 'ALL' || item.level === level;
    const eventMatch = event === 'ALL' || item.event === event;
    const moduleMatch = moduleName === 'ALL' || item.module === moduleName;
    const haystack = [item.module, item.function, item.traceId, item.event, item.level, JSON.stringify(item.detail || {})].join(' ').toLowerCase();
    return levelMatch && eventMatch && moduleMatch && haystack.includes(query.toLowerCase());
  }), [logs, level, event, moduleName, query]);
  const errors = logs.filter((item) => item.level === 'ERROR').length;
  const warnings = logs.filter((item) => item.level === 'WARN').length;

  const exportLogs = (format) => {
    const ordered = [...logs].reverse();
    const content = format === 'json'
      ? JSON.stringify(ordered, null, 2)
      : ordered.map((item) => '[' + item.timestamp + '] [' + item.level + '] [' + item.module + '] ' + item.function + ' ' + item.event + ' trace=' + item.traceId + ' duration=' + (item.duration == null ? '-' : item.duration) + 'ms ' + JSON.stringify(item.detail || {})).join('\n');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile('saga-debug-logs-' + stamp + (format === 'json' ? '.json' : '.txt'), content, format === 'json' ? 'application/json' : 'text/plain');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="saga-panel p-3"><p className="text-2xl tabular-nums text-primary">{logs.length}</p><p className="text-[9px] text-muted-foreground">Stored / 2,000</p></div>
        <div className="saga-panel p-3"><p className="text-2xl tabular-nums text-rose-300">{errors}</p><p className="text-[9px] text-muted-foreground">Errors</p></div>
        <div className="saga-panel p-3"><p className="text-2xl tabular-nums text-amber-200">{warnings}</p><p className="text-[9px] text-muted-foreground">Warnings</p></div>
      </div>
      <section className="saga-panel space-y-3 p-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search module, function, Trace ID..." className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-[11px] outline-none focus:border-primary/50" />
          </div>
          <button onClick={onRefresh} className="tap rounded-xl border border-white/10 p-2 text-muted-foreground hover:text-primary" title="Refresh"><Activity size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <select value={moduleName} onChange={(e) => setModuleName(e.target.value)} className="rounded-full border border-white/10 bg-[#111426] px-3 py-1 text-[9px] text-foreground"><option value="ALL">All modules</option>{[...new Set(logs.map((item) => item.module))].sort().map((name) => <option key={name} value={name}>{name}</option>)}</select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((item) => <button key={item} onClick={() => setLevel(item)} className={'rounded-full border px-2.5 py-1 text-[9px] ' + (level === item ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground')}>{item}</button>)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EVENTS.map((item) => <button key={item} onClick={() => setEvent(item)} className={'rounded-full border px-2.5 py-1 text-[9px] ' + (event === item ? 'border-accent/50 bg-accent/10 text-accent' : 'border-white/10 text-muted-foreground')}>{item}</button>)}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/[0.07] pt-3">
          <button onClick={() => exportLogs('json')} className="tap inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] text-foreground/80"><Download size={13} /> Export JSON</button>
          <button onClick={() => exportLogs('txt')} className="tap inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[10px] text-foreground/80"><Download size={13} /> Export TXT</button>
          <button onClick={onClear} className="tap ml-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-400/20 px-3 py-2 text-[10px] text-rose-300"><Trash2 size={13} /> Clear</button>
        </div>
      </section>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1"><p className="text-[10px] tracking-widest text-muted-foreground">EXECUTION RECORDS</p><p className="text-[9px] text-muted-foreground">{filtered.length} matching</p></div>
        {filtered.length === 0 ? <div className="saga-panel p-8 text-center text-[11px] text-muted-foreground">No matching logs. Start using the game to collect execution records.</div> : filtered.map((item) => {
          const isOpen = Boolean(expanded[item.id]);
          const color = item.level === 'ERROR' ? 'text-rose-300 border-rose-400/25 bg-rose-400/10' : item.level === 'WARN' ? 'text-amber-200 border-amber-300/25 bg-amber-300/10' : 'text-sky-200 border-sky-300/20 bg-sky-300/10';
          return (
            <article key={item.id} className="saga-panel overflow-hidden">
              <button onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))} className="flex w-full items-start gap-2 p-3 text-left">
                <span className={'mt-0.5 shrink-0 rounded-md border px-1.5 py-1 text-[8px] ' + color}>{item.event}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] text-foreground">{item.module}.{item.function}</span>
                  <span className="mt-1 block truncate font-mono text-[8px] text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()} · {item.traceId} · {item.duration == null ? '—' : item.duration + 'ms'}</span>
                </span>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>
              {isOpen && <div className="space-y-2 border-t border-white/[0.07] px-3 py-3">
                <div className="grid grid-cols-2 gap-2 text-[9px]"><div><span className="text-muted-foreground">Level</span><p>{item.level}</p></div><div><span className="text-muted-foreground">Timestamp</span><p>{item.timestamp}</p></div><div><span className="text-muted-foreground">Trace ID</span><p className="break-all font-mono">{item.traceId}</p></div><div><span className="text-muted-foreground">Duration</span><p>{item.duration == null ? '—' : item.duration + 'ms'}</p></div></div>
                <pre className="saga-scroll max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-2 font-mono text-[9px] leading-relaxed text-foreground/80">{JSON.stringify(item.detail || {}, null, 2)}</pre>
              </div>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
