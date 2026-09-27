import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { FeatureName, FeatureStatus } from './contracts';
import { DATA_DIR } from './media-runtime';

export type AnalysisState = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AnalysisRecord {
  id: string;
  projectId: string | null;
  mediaId: string | null;
  originalName: string;
  sizeBytes: number;
  sha256: string | null;
  status: AnalysisState;
  runningFeature: FeatureName | null;
  features: FeatureStatus[];
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ChatRecord {
  id: string;
  analysisId: string;
  role: 'user' | 'assistant';
  text: string;
  payload: unknown;
  createdAt: string;
}

type Row = Record<string, string | number | null>;

/** Small metadata index. Large media artifacts live on the filesystem under each analysis directory. */
export function openDatabase(file = path.join(DATA_DIR, 'analysis.db')) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      media_id TEXT,
      original_name TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      sha256 TEXT,
      status TEXT NOT NULL,
      running_feature TEXT,
      features_json TEXT NOT NULL DEFAULT '[]',
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS analyses_project ON analyses(project_id, created_at);
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      payload_json TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS chat_analysis ON chat_messages(analysis_id, created_at);
  `);
  const now = () => new Date().toISOString();
  const toAnalysis = (row: Row | undefined): AnalysisRecord | null => row ? {
    id: String(row.id),
    projectId: row.project_id === null ? null : String(row.project_id),
    mediaId: row.media_id === null ? null : String(row.media_id),
    originalName: String(row.original_name),
    sizeBytes: Number(row.size_bytes),
    sha256: row.sha256 === null ? null : String(row.sha256),
    status: String(row.status) as AnalysisState,
    runningFeature: row.running_feature === null ? null : String(row.running_feature) as FeatureName,
    features: JSON.parse(String(row.features_json)) as FeatureStatus[],
    error: row.error === null ? null : String(row.error),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    completedAt: row.completed_at === null ? null : String(row.completed_at),
  } : null;

  // A process restart cannot resume an in-memory FFmpeg/Python run; report that truthfully.
  db.prepare(`UPDATE analyses SET status = 'failed', running_feature = NULL, error = 'Interrupted because the analysis service restarted.', updated_at = ? WHERE status IN ('queued', 'running')`).run(now());

  return {
    close: () => db.close(),
    createAnalysis(input: { id: string; projectId?: string | null; mediaId?: string | null; originalName: string; sizeBytes: number }) {
      const time = now();
      db.prepare(`INSERT INTO analyses (id, project_id, media_id, original_name, size_bytes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)`)
        .run(input.id, input.projectId ?? null, input.mediaId ?? null, input.originalName, input.sizeBytes, time, time);
      return this.getAnalysis(input.id)!;
    },
    updateAnalysis(id: string, patch: Partial<Pick<AnalysisRecord, 'status' | 'runningFeature' | 'features' | 'error' | 'sha256' | 'completedAt'>>) {
      const current = this.getAnalysis(id);
      if (!current) return null;
      const next = { ...current, ...patch };
      db.prepare(`UPDATE analyses SET status = ?, running_feature = ?, features_json = ?, error = ?, sha256 = ?, completed_at = ?, updated_at = ? WHERE id = ?`)
        .run(next.status, next.runningFeature, JSON.stringify(next.features), next.error, next.sha256, next.completedAt, now(), id);
      return this.getAnalysis(id);
    },
    getAnalysis(id: string) {
      return toAnalysis(db.prepare('SELECT * FROM analyses WHERE id = ?').get(id) as Row | undefined);
    },
    listForProject(projectId: string) {
      return (db.prepare('SELECT * FROM analyses WHERE project_id = ? ORDER BY created_at DESC').all(projectId) as Row[]).map((row) => toAnalysis(row)!);
    },
    deleteAnalysis(id: string) {
      db.prepare('DELETE FROM chat_messages WHERE analysis_id = ?').run(id);
      return Number(db.prepare('DELETE FROM analyses WHERE id = ?').run(id).changes) > 0;
    },
    addMessage(message: Omit<ChatRecord, 'createdAt'>) {
      db.prepare('INSERT INTO chat_messages (id, analysis_id, role, text, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(message.id, message.analysisId, message.role, message.text, message.payload === undefined ? null : JSON.stringify(message.payload), now());
    },
    listMessages(analysisId: string): ChatRecord[] {
      return (db.prepare('SELECT * FROM chat_messages WHERE analysis_id = ? ORDER BY created_at, rowid').all(analysisId) as Row[]).map((row) => ({
        id: String(row.id),
        analysisId: String(row.analysis_id),
        role: String(row.role) as ChatRecord['role'],
        text: String(row.text),
        payload: row.payload_json === null ? null : JSON.parse(String(row.payload_json)),
        createdAt: String(row.created_at),
      }));
    },
  };
}

export type AnalysisDatabase = ReturnType<typeof openDatabase>;
