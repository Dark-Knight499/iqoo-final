import { useEffect, useState } from 'react';
import type { FeatureStatus } from './src/static-analysis/contracts';

type Props = { file: File; sampleIntervalMs: number; onBack: () => void };
type OutputFile = { name: string; url: string };

export default function ProcessingScreen({ file, sampleIntervalMs, onBack }: Props) {
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [outputFolder, setOutputFolder] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const data = new FormData();
      data.append('video', file, file.name);
      data.append('sampleIntervalMs', String(sampleIntervalMs));
      try {
        const response = await fetch('/api/analyze', { method: 'POST', body: data, signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Analysis failed.');
        setFeatures(result.features as FeatureStatus[]);
        setOutputFolder(result.outputFolder as string);
        const filesResponse = await fetch(`/api/outputs/${encodeURIComponent(result.outputFolder)}`, { signal: controller.signal });
        setOutputs(await filesResponse.json() as OutputFile[]);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
      } finally { if (!controller.signal.aborted) setBusy(false); }
    };
    void run();
    return () => controller.abort();
  }, [file, sampleIntervalMs]);

  return <main className="page">
    <header className="brand"><span className="brand-mark">C</span><span>Creator <b>Analysis</b></span></header>
    <section className="results">
      <button className="back" onClick={onBack}>← Choose another video</button>
      <p className="eyebrow">STATIC ANALYSIS</p>
      <h1>{busy ? 'Analyzing your video…' : error ? 'Analysis stopped.' : 'Analysis complete.'}</h1>
      <p className="intro file-name">{file.name} <span>·</span> {(file.size / 1024 / 1024).toFixed(1)} MB</p>
      {busy && <div className="progress"><span /></div>}
      {error && <p className="error">{error}</p>}
      <div className="feature-list">
        {features.map((feature) => <div className="feature" key={feature.feature}>
          <span className={`status status-${feature.status}`}>{feature.status === 'success' ? '✓' : feature.status === 'partial' ? '!' : '×'}</span>
          <div><strong>{feature.feature.replaceAll('_', ' ')}</strong>{feature.error && <p>{feature.error}</p>}</div>
          <span className="state-label">{feature.status}</span>
        </div>)}
        {busy && !features.length && <p className="muted">Preparing local analysis tools…</p>}
      </div>
      {outputs.length > 0 && <section className="output-panel"><h2>JSON output</h2><div className="output-links">
        {outputs.map((output) => <a key={output.name} href={output.url} target="_blank" rel="noreferrer">{output.name}<span>↗</span></a>)}
      </div><p>Files are in <code>output/{outputFolder}</code>.</p></section>}
      {!busy && <button className="secondary" onClick={onBack}>Analyze another video</button>}
    </section>
  </main>;
}
