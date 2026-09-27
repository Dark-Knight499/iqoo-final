import type { AssistantReply, ChatContext, Citation, EditProposal, Evidence } from './assistant';
import { formatTime, validateProposal } from './assistant';

/**
 * Optional OpenAI-compatible reasoning layer. It receives only compact measured evidence and a
 * deterministic draft. Every citation and proposal it returns is validated before use.
 */
export interface LlmConfig { baseUrl: string; apiKey: string; model: string; timeoutMs: number }

export function llmConfig(env = process.env): LlmConfig | null {
  const apiKey = env.ANALYSIS_LLM_API_KEY || env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (env.ANALYSIS_LLM_BASE_URL || env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: env.ANALYSIS_LLM_MODEL || 'gpt-4o-mini',
    timeoutMs: Number(env.ANALYSIS_LLM_TIMEOUT_MS || 30_000),
  };
}

function compactEvidence(evidence: Evidence) {
  let budget = 12_000;
  const transcript = [] as Array<{ startMs: number; endMs: number; text: string }>;
  for (const segment of evidence.transcript?.segments ?? []) {
    budget -= segment.text.length + 30;
    if (budget < 0) break;
    transcript.push({ startMs: segment.startMs, endMs: segment.endMs, text: segment.text });
  }
  return {
    durationMs: evidence.durationMs,
    featureStatus: evidence.features.map(({ feature, status, error }) => ({ feature, status, ...(error ? { error: error.slice(0, 160) } : {}) })),
    video: evidence.metadata ? { width: evidence.metadata.width, height: evidence.metadata.height, fps: evidence.metadata.fps, orientation: evidence.metadata.orientation } : null,
    transcript,
    transcriptTruncated: transcript.length < (evidence.transcript?.segments.length ?? 0),
    quietIntervals: (evidence.silence?.intervals ?? []).slice(0, 60),
    shots: (evidence.shots?.shots ?? []).slice(0, 60),
    objectSamples: (evidence.yolo?.detections ?? []).filter((sample) => sample.objects.length).slice(0, 60)
      .map((sample) => ({ startMs: sample.startMs, labels: [...new Set(sample.objects.map((object) => object.name))] })),
  };
}

/** Accept a citation only when it points at an interval actually present in the evidence. */
function groundCitations(evidence: Evidence, citations: unknown): Citation[] {
  if (!Array.isArray(citations)) return [];
  const anchors: Citation[] = [
    ...(evidence.transcript?.segments ?? []).map((segment) => ({ kind: 'transcript' as const, startMs: segment.startMs, endMs: segment.endMs, label: segment.text.slice(0, 80) })),
    ...(evidence.silence?.intervals ?? []).map((interval) => ({ kind: 'silence' as const, startMs: interval.startMs, endMs: interval.endMs, label: 'Quiet interval' })),
    ...(evidence.shots?.shots ?? []).map((shot) => ({ kind: 'shot' as const, startMs: shot.startMs, endMs: shot.endMs, label: `Shot ${shot.id}` })),
    ...(evidence.yolo?.detections ?? []).filter((sample) => sample.objects.length).map((sample) => ({ kind: 'object' as const, startMs: sample.startMs, label: [...new Set(sample.objects.map((object) => object.name))].join(', ') })),
  ];
  const grounded: Citation[] = [];
  for (const item of citations.slice(0, 8)) {
    const at = Number((item as { startMs?: unknown })?.startMs);
    if (!Number.isFinite(at)) continue;
    const anchor = anchors.find((candidate) => at >= candidate.startMs - 300 && at <= (candidate.endMs ?? candidate.startMs) + 300);
    if (anchor && !grounded.some((existing) => existing.startMs === anchor.startMs && existing.kind === anchor.kind)) grounded.push(anchor);
  }
  return grounded;
}

export async function llmAnswer(config: LlmConfig, evidence: Evidence, message: string, draft: AssistantReply, context: ChatContext, history: Array<{ role: string; text: string }>): Promise<AssistantReply> {
  const system = [
    'You are the analysis assistant inside a creator video editor.',
    'Answer ONLY from the supplied measured evidence JSON. If the evidence cannot answer, say what is unavailable.',
    'Never claim you watched the video, recognised emotions, speakers, meaning of visuals, engagement, or virality.',
    'Shots are visual cut intervals, not semantic scenes. Objects come from sampled frames, not tracking.',
    'The only executable edit is keeping ONE continuous source range [startMs, endMs). Captions, zoom, music, B-roll, reframing and removing interior pauses are NOT executable; say so.',
    'A deterministic draft answer is provided; improve its wording or reasoning, but keep numbers consistent with evidence.',
    'Return strict JSON: {"answer": string, "citations": [{"startMs": number}], "proposal": {"startMs": number, "endMs": number, "reason": string} | null}.',
    'Cite the start time of every transcript segment, quiet interval, shot or object sample you rely on. Times are milliseconds.',
  ].join('\n');
  const body = {
    model: config.model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      ...history.slice(-6).map((item) => ({ role: item.role === 'assistant' ? 'assistant' : 'user', content: item.text.slice(0, 1500) })),
      { role: 'user', content: JSON.stringify({ evidence: compactEvidence(evidence), currentTrim: context.currentTrim ?? null, deterministicDraft: { text: draft.text, proposal: draft.proposal }, request: message }) },
    ],
  };
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  if (!response.ok) throw new Error(`LLM request failed (${response.status}).`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM returned no content.');
  const parsed = JSON.parse(content) as { answer?: unknown; citations?: unknown; proposal?: Partial<EditProposal> | null };
  if (typeof parsed.answer !== 'string' || !parsed.answer.trim()) throw new Error('LLM returned no answer.');
  const proposal = parsed.proposal ? validateProposal(evidence, { type: 'trim', startMs: Number(parsed.proposal.startMs), endMs: Number(parsed.proposal.endMs), reason: String(parsed.proposal.reason ?? 'LLM proposal') }) : null;
  const citations = groundCitations(evidence, parsed.citations);
  const note = parsed.proposal && !proposal ? ' (A proposed range was outside this video and was discarded.)' : '';
  return {
    text: `${parsed.answer.trim().slice(0, 2000)}${note}`,
    citations: citations.length ? citations : draft.citations,
    proposal,
    engine: 'llm',
    ...(draft.unsupported ? { unsupported: true } : {}),
  };
}

export const describeProposal = (proposal: EditProposal) => `${formatTime(proposal.startMs)}–${formatTime(proposal.endMs)}`;
