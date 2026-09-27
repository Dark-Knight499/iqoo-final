import { useState } from 'react';
import ProcessingScreen from './processing';

export default function InputScreen() {
  const [file, setFile] = useState<File | null>(null);
  const [sampleIntervalMs, setSampleIntervalMs] = useState(2000);
  if (file) return <ProcessingScreen file={file} sampleIntervalMs={sampleIntervalMs} onBack={() => setFile(null)} />;
  return <main className="page">
    <header className="brand"><span className="brand-mark">C</span><span>Creator <b>Analysis</b></span></header>
    <section className="hero">
      <p className="eyebrow">LOCAL VIDEO WORKSPACE</p>
      <h1>Understand what’s<br /><em>inside your video.</em></h1>
      <p className="intro">Choose a video to extract metadata, audio levels, silence, noise, shots and representative timestamps. Analysis runs locally on this machine.</p>
      <label className="dropzone">
        <input type="file" accept="video/*,.mp4,.mov,.mkv,.webm,.m4v" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <span className="upload-icon">↑</span>
        <strong>Choose a video</strong>
        <span>MP4, MOV, MKV or WebM · saved output stays on this machine</span>
      </label>
      <div className="options">
        <label htmlFor="interval">YOLO sample interval</label>
        <select id="interval" value={sampleIntervalMs} onChange={(event) => setSampleIntervalMs(Number(event.target.value))}>
          <option value={1000}>Every 1 second</option><option value={2000}>Every 2 seconds</option><option value={3000}>Every 3 seconds</option><option value={5000}>Every 5 seconds</option>
        </select>
      </div>
    </section>
    <footer>Analysis JSON is written to <code>/output</code>. Model-based features report an isolated status if their local model is unavailable.</footer>
  </main>;
}
