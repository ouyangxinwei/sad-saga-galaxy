import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Download, Play, RefreshCw } from 'lucide-react';
import { analyzeWarningRecords, readDiagnosisHistory, runWarningSimulation, saveDiagnosisReport } from '@/lib/warningDiagnosis';
import { getLogs } from '@/lib/logger';

function downloadReport(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'saga-warning-diagnosis-' + report.id + '.json'; anchor.click(); URL.revokeObjectURL(url);
}

export default function WarningDiagnosis() {
  const [running, setRunning] = useState(false), [report, setReport] = useState(null);
  const [history, setHistory] = useState(() => readDiagnosisHistory());
  const [liveGroups, setLiveGroups] = useState(() => analyzeWarningRecords(getLogs().filter((item) => item.level === 'WARN' || item.level === 'ERROR')));
  const [error, setError] = useState('');
  const refreshLive = () => setLiveGroups(analyzeWarningRecords(getLogs().filter((item) => item.level === 'WARN' || item.level === 'ERROR')));
  const run = async () => {
    if (running) return;
    setRunning(true); setError('');
    try { const result = await runWarningSimulation(); setReport(result); saveDiagnosisReport(result); setHistory(readDiagnosisHistory()); refreshLive(); }
    catch (cause) { setError(cause?.message || String(cause)); }
    finally { setRunning(false); }
  };
  useEffect(() => { refreshLive(); }, []);
  return <div className="space-y-3">
    <section className="saga-panel space-y-3 p-3">
      <div className="flex items-center gap-2"><Activity size={16} className="text-primary" /><div className="min-w-0 flex-1"><p className="text-[12px] font-semibold">Automated Warning Diagnosis</p><p className="text-[9px] text-muted-foreground">Isolated battle simulation · no game-save writes</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] text-emerald-200">Save-safe</span></div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">Runs four repeatable scenarios using temporary battle units. Diagnostic logger output is isolated from normal Debug Console history. This checks covered paths, not every possible player action.</p>
      <button onClick={run} disabled={running} className="tap flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[11px] font-semibold text-primary-foreground disabled:opacity-50">{running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}{running ? 'Running simulations…' : 'Run Warning Simulation'}</button>
      {error && <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-[10px] text-rose-200">{error}</p>}
    </section>
    <section className="saga-panel space-y-3 p-3">
      <div className="flex items-center justify-between"><div><p className="text-[11px] font-semibold">Real gameplay warning records</p><p className="text-[9px] text-muted-foreground">From the existing local Debug Logger</p></div><button onClick={refreshLive} className="tap rounded-lg border border-white/10 p-2 text-muted-foreground"><RefreshCw size={13} /></button></div>
      {liveGroups.length === 0 ? <p className="text-[10px] text-muted-foreground">No stored WARN / ERROR records found.</p> : liveGroups.slice(0, 12).map((item) => <div key={item.key} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2"><div className="flex items-center justify-between gap-2"><p className="min-w-0 truncate text-[10px]">{item.module}.{item.function}</p><span className="shrink-0 text-[9px] text-amber-200">×{item.count}</span></div><p className="mt-1 text-[9px] text-muted-foreground">{item.classification.title} · {item.classification.category}</p><p className="mt-1 text-[9px] leading-relaxed text-foreground/70">{item.classification.recommendation}</p></div>)}
    </section>
    {report && <section className="saga-panel space-y-3 p-3">
      <div className="flex items-center gap-2"><CheckCircle2 size={16} className={report.warningCount ? 'text-amber-200' : 'text-emerald-300'} /><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold">Latest simulation report</p><p className="text-[9px] text-muted-foreground">{new Date(report.completedAt).toLocaleString()}</p></div><button onClick={() => downloadReport(report)} className="tap rounded-lg border border-white/10 p-2"><Download size={13} /></button></div>
      <div className="grid grid-cols-3 gap-2"><div className="rounded-lg bg-white/[0.04] p-2"><p className="text-xl tabular-nums">{report.scenarioCount}</p><p className="text-[8px] text-muted-foreground">Scenarios</p></div><div className="rounded-lg bg-white/[0.04] p-2"><p className="text-xl tabular-nums">{report.warningCount}</p><p className="text-[8px] text-muted-foreground">Captured WARN</p></div><div className="rounded-lg bg-white/[0.04] p-2"><p className="text-[10px] font-semibold">{report.status === 'simulation-clean' ? 'Clean' : 'Review'}</p><p className="text-[8px] text-muted-foreground">Result</p></div></div>
      {report.scenarios.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2"><div><p className="text-[10px]">{item.label}</p><p className="text-[8px] text-muted-foreground">{item.rounds} rounds · {item.events} events</p></div><span className="text-[9px] text-foreground/70">{item.result}</span></div>)}
      {report.groups.map((item) => <div key={item.key} className="rounded-lg border border-amber-300/20 p-2 text-[9px]"><p>{item.classification.title} ×{item.count}</p><p className="mt-1 text-muted-foreground">{item.classification.recommendation}</p></div>)}
      <p className="text-[9px] leading-relaxed text-muted-foreground">{report.note}</p>
    </section>}
    <section className="saga-panel space-y-2 p-3"><p className="text-[11px] font-semibold">Diagnosis history</p>
      {history.length === 0 ? <p className="text-[9px] text-muted-foreground">No reports yet.</p> : history.map((item) => <button key={item.id} onClick={() => setReport(item)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/[0.07] p-2 text-left"><span className="min-w-0"><span className="block truncate text-[9px]">{new Date(item.completedAt).toLocaleString()}</span><span className="block text-[8px] text-muted-foreground">{item.scenarioCount} scenarios · {item.warningCount} warnings</span></span>{item.warningCount ? <AlertTriangle size={13} className="text-amber-200" /> : <CheckCircle2 size={13} className="text-emerald-300" />}</button>)}
    </section>
  </div>;
}
