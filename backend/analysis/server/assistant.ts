import type { AudioRms, FeatureName, FeatureStatus, Shots, Silence, Transcript, TranscriptWord, VideoMetadata, Yolo } from './contracts';

export type CitationKind = 'transcript' | 'silence' | 'shot' | 'object' | 'metadata' | 'audio';
export interface Citation { kind: CitationKind; startMs: number; endMs?: number; label: string }

/** The only media operation the editor can execute today: keep one continuous source range. */
export interface EditProposal { type: 'trim'; startMs: number; endMs: number; reason: string }

export interface Suggestion {
  id: string;
  kind: 'trim' | 'review' | 'info';
  title: string;
  detail: string;
  citations: Citation[];
  proposal?: EditProposal;
  limitation?: string;
}

export interface AssistantReply {
  text: string;
  citations: Citation[];
  proposal: EditProposal | null;
  engine: 'rules' | 'llm';
  unsupported?: boolean;
}

export interface Evidence {
  durationMs: number;
  features: FeatureStatus[];
  metadata?: VideoMetadata;
  transcript?: Transcript;
  silence?: Silence;
  shots?: Shots;
  yolo?: Yolo;
  audio?: AudioRms;
}

export interface ChatContext { currentTrim?: { startMs: number; endMs: number } | null }

export const formatTime = (ms: number) => {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
};
const range = (startMs: number, endMs: number) => `${formatTime(startMs)}–${formatTime(endMs)}`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const featureError = (evidence: Evidence, feature: FeatureName) => {
  const status = evidence.features.find((row) => row.feature === feature);
  if (!status) return 'it was not run';
  return status.status === 'success' ? null : status.error || status.status;
};

const words = (evidence: Evidence): TranscriptWord[] => evidence.transcript?.segments.flatMap((segment) => segment.words) ?? [];
const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}']+/gu, ' ').trim();

function speechBounds(evidence: Evidence) {
  const spoken = words(evidence);
  if (spoken.length) return { startMs: spoken[0].startMs, endMs: spoken[spoken.length - 1].endMs, basis: 'transcript' as const };
  const segments = evidence.transcript?.segments ?? [];
  if (segments.length) return { startMs: segments[0].startMs, endMs: segments[segments.length - 1].endMs, basis: 'transcript' as const };
  return null;
}

/** Measured quiet time at the start/end; transcript word timing takes priority over the RMS threshold. */
export function deadAir(evidence: Evidence) {
  const duration = evidence.durationMs;
  const speech = speechBounds(evidence);
  const intervals = evidence.silence?.intervals ?? [];
  const leadingSilence = intervals.find((interval) => interval.startMs <= 100);
  const trailingSilence = [...intervals].reverse().find((interval) => interval.endMs >= duration - 150);
  const leadingMs = speech ? speech.startMs : leadingSilence?.endMs ?? 0;
  const trailingStartMs = speech ? speech.endMs : trailingSilence?.startMs ?? duration;
  const citations: Citation[] = [];
  if (speech) {
    citations.push({ kind: 'transcript', startMs: speech.startMs, label: 'First transcribed word' }, { kind: 'transcript', startMs: speech.endMs, label: 'Last transcribed word' });
  } else {
    if (leadingSilence) citations.push({ kind: 'silence', startMs: leadingSilence.startMs, endMs: leadingSilence.endMs, label: 'Quiet opening' });
    if (trailingSilence) citations.push({ kind: 'silence', startMs: trailingSilence.startMs, endMs: trailingSilence.endMs, label: 'Quiet ending' });
  }
  const basis = speech ? 'transcribed word timings' : 'audio quiet intervals';
  return { leadingMs, trailingMs: Math.max(0, duration - trailingStartMs), keepStartMs: Math.max(0, leadingMs - 200), keepEndMs: Math.min(duration, trailingStartMs + 300), citations, basis, available: Boolean(speech || intervals.length) };
}

function clipFrom(evidence: Evidence, startMs: number, targetMs: number): { endMs: number; citation?: Citation } {
  const duration = evidence.durationMs;
  const limit = Math.min(duration, startMs + targetMs);
  const segments = (evidence.transcript?.segments ?? []).filter((segment) => segment.endMs > startMs && segment.endMs <= limit + 250);
  const last = segments[segments.length - 1];
  // End on a sentence boundary when one exists inside the requested length; otherwise use the exact length.
  if (last && last.endMs - startMs >= Math.min(targetMs * 0.5, 3000)) {
    return { endMs: Math.min(duration, last.endMs + 250), citation: { kind: 'transcript', startMs: last.startMs, endMs: last.endMs, label: `Segment ends: “${last.text.slice(-60)}”` } };
  }
  return { endMs: limit };
}

export function validateProposal(evidence: Evidence, proposal: EditProposal | null | undefined): EditProposal | null {
  if (!proposal || proposal.type !== 'trim') return null;
  const startMs = Math.round(Number(proposal.startMs));
  const endMs = Math.round(Number(proposal.endMs));
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs < 0 || endMs > evidence.durationMs + 1 || endMs - startMs < 100) return null;
  return { type: 'trim', startMs, endMs: Math.min(endMs, evidence.durationMs), reason: String(proposal.reason || 'Proposed range').slice(0, 400) };
}

export function buildSuggestions(evidence: Evidence): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const duration = evidence.durationMs;
  if (!duration) return suggestions;

  const air = deadAir(evidence);
  if (air.available && (air.leadingMs >= 700 || air.trailingMs >= 700) && air.keepEndMs - air.keepStartMs >= 1000) {
    suggestions.push({
      id: 'trim-dead-air',
      kind: 'trim',
      title: 'Trim quiet opening/ending',
      detail: `Starts ${seconds(air.leadingMs)} before the first sound of speech and ends ${seconds(air.trailingMs)} after it, based on ${air.basis}. Keep ${range(air.keepStartMs, air.keepEndMs)}.`,
      citations: air.citations,
      proposal: { type: 'trim', startMs: air.keepStartMs, endMs: air.keepEndMs, reason: `Remove quiet opening/ending measured from ${air.basis}.` },
    });
  }

  const speech = speechBounds(evidence);
  if (speech && duration > 20_000) {
    const target = duration > 60_000 ? 30_000 : 15_000;
    const start = Math.max(0, speech.startMs - 200);
    const clip = clipFrom(evidence, start, target);
    if (clip.endMs - start >= 3000 && clip.endMs - start < duration - 1000) {
      suggestions.push({
        id: `short-${target / 1000}`,
        kind: 'trim',
        title: `${target / 1000}s opening clip`,
        detail: `Keeps ${range(start, clip.endMs)}${clip.citation ? ', ending at a transcript segment boundary' : ''}. This is based on timing only; it does not predict engagement.`,
        citations: [{ kind: 'transcript', startMs: speech.startMs, label: 'First transcribed word' }, ...(clip.citation ? [clip.citation] : [])],
        proposal: { type: 'trim', startMs: start, endMs: clip.endMs, reason: `Opening ${target / 1000}s clip ending on a transcript segment boundary.` },
      });
    }
  }

  const pauses = (evidence.silence?.intervals ?? [])
    .filter((interval) => interval.startMs > 150 && interval.endMs < duration - 150 && interval.endMs - interval.startMs >= 1000)
    .sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs)).slice(0, 3);
  if (pauses.length) {
    suggestions.push({
      id: 'review-pauses',
      kind: 'review',
      title: `Review ${pauses.length} long pause${pauses.length === 1 ? '' : 's'}`,
      detail: pauses.map((pause) => `${range(pause.startMs, pause.endMs)} (${seconds(pause.endMs - pause.startMs)})`).join(', '),
      citations: pauses.map((pause) => ({ kind: 'silence' as const, startMs: pause.startMs, endMs: pause.endMs, label: `Quiet for ${seconds(pause.endMs - pause.startMs)}` })),
      limitation: 'Removing a pause from the middle needs split editing; the editor currently keeps one continuous range.',
    });
  }

  const shots = evidence.shots?.shots ?? [];
  if (shots.length > 1) {
    suggestions.push({
      id: 'review-cuts',
      kind: 'review',
      title: `${shots.length} detected shots`,
      detail: 'Cut points detected from visual change. Use them to choose clean start or end points.',
      citations: shots.slice(0, 6).map((shot) => ({ kind: 'shot' as const, startMs: shot.startMs, endMs: shot.endMs, label: `Shot ${shot.id}` })),
      limitation: 'Detected shots are visual cuts, not semantic scenes.',
    });
  }

  const audio = evidence.audio?.windows ?? [];
  if (audio.length) {
    const sorted = audio.map((window) => window.rms).sort((a, b) => b - a);
    const loud = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.1)));
    const peak = loud.reduce((sum, value) => sum + value, 0) / loud.length;
    if (peak < 0.03) {
      suggestions.push({
        id: 'quiet-audio',
        kind: 'info',
        title: 'Audio is quiet',
        detail: `The loudest 10% of audio averages ${peak.toFixed(3)} RMS. Check the recording level before publishing.`,
        citations: [{ kind: 'audio', startMs: 0, endMs: duration, label: 'Measured audio level' }],
        limitation: 'RMS is a signal level, not a calibrated loudness (LUFS) measurement.',
      });
    }
  }
  return suggestions;
}

function parseTime(token: string): number | null {
  const value = token.trim().toLowerCase();
  let match = /^(\d+):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d+))?$/.exec(value);
  if (match) {
    const parts = [match[1], match[2], match[3]].filter((part) => part !== undefined).map(Number);
    const secondsValue = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
    return Math.round((secondsValue + Number(`0.${match[4] ?? 0}`)) * 1000);
  }
  match = /^(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?\s*(?:(\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?)?$/.exec(value);
  if (match && (match[1] || match[2])) return Math.round((Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0)) * 1000);
  return null;
}

const TIME = String.raw`(\d+:\d{1,2}(?::\d{1,2})?(?:\.\d+)?|\d+(?:\.\d+)?\s*(?:s|sec|secs|second|seconds|m|min|mins|minute|minutes)\b(?:\s*\d+(?:\.\d+)?\s*(?:s|sec|secs|second|seconds)\b)?)`;
const findTimes = (text: string) => [...text.matchAll(new RegExp(TIME, 'gi'))].map((match) => parseTime(match[1])).filter((value): value is number => value !== null);

function findPhrase(evidence: Evidence, phrase: string) {
  const target = normalize(phrase).split(' ').filter(Boolean);
  if (!target.length) return [];
  const spoken = words(evidence);
  const tokens = spoken.map((word) => normalize(word.word));
  const hits: Array<{ startMs: number; endMs: number; text: string }> = [];
  for (let index = 0; index + target.length <= tokens.length; index++) {
    if (target.every((part, offset) => tokens[index + offset] === part)) {
      hits.push({ startMs: spoken[index].startMs, endMs: spoken[index + target.length - 1].endMs, text: spoken.slice(index, index + target.length).map((word) => word.word).join(' ') });
    }
  }
  if (hits.length || spoken.length) return hits;
  // Segment-level fallback when a transcriber returned no word timings.
  return (evidence.transcript?.segments ?? []).filter((segment) => normalize(segment.text).includes(target.join(' '))).map((segment) => ({ startMs: segment.startMs, endMs: segment.endMs, text: segment.text }));
}

const quoted = (text: string) => /["“']([^"”']{2,120})["”']/.exec(text)?.[1] ?? null;

const HELP = 'I can answer from this video\'s measured analysis: what is said at a time, where a phrase is said, pauses, detected shots, sampled objects, and audio level. I can also propose one continuous cut, e.g. “trim the dead air”, “keep 0:05 to 0:20”, “make a 15 second clip starting where I say \\"hello\\"”, “start at 3s”. Proposed cuts are not applied until you review them in the editor.';

const unsupportedEdit = /\b(captions?|subtitles?|zoom|b-?roll|music|colou?r|grade|filters?|reframe|effects?|transitions?|speed up|slow motion|slow-mo|stabili[sz]e|denoise|noise reduction|thumbnail)\b/i;

/** Deterministic, citation-first assistant. It never invents content that is absent from the analysis. */
export function answer(evidence: Evidence, message: string, context: ChatContext = {}): AssistantReply {
  const text = message.trim();
  const lower = text.toLowerCase();
  const duration = evidence.durationMs;
  const reply = (body: string, citations: Citation[] = [], proposal: EditProposal | null = null, unsupported = false): AssistantReply =>
    ({ text: body, citations, proposal: validateProposal(evidence, proposal), engine: 'rules', ...(unsupported ? { unsupported } : {}) });
  const transcriptError = featureError(evidence, 'transcript');
  const needTranscript = () => reply(`The transcript is unavailable for this analysis (${transcriptError}). I can still use audio pauses, shots and objects.`, [], null, true);

  if (!text) return reply(HELP);
  const isEdit = /\b(cut|trim|keep|clip|shorten|tighten|make (?:a|it|this)|remove|delete|start (?:at|from)|begin (?:at|from)|end (?:at|by)|first \d|last \d|reel|short)\b/i.test(lower);

  if (isEdit && unsupportedEdit.test(lower)) {
    return reply(`I can't apply that here yet. The editor can currently keep one continuous section of the source video; ${lower.match(unsupportedEdit)?.[0]} is not an executable operation. I can propose a cut instead.`, [], null, true);
  }

  if (isEdit) {
    const times = findTimes(lower);
    const current = context.currentTrim ?? { startMs: 0, endMs: duration };

    // “remove the pause at 7s” — interior removal needs split editing, which is not supported.
    if (/\b(remove|delete|cut out)\b/.test(lower) && /\b(pause|silence|gap|dead air)\b/.test(lower) && !/\b(start|beginning|end|ending|opening)\b/.test(lower)) {
      const pauses = (evidence.silence?.intervals ?? []).filter((interval) => interval.startMs > 150 && interval.endMs < duration - 150);
      const target = times.length ? pauses.find((pause) => times[0] >= pause.startMs - 500 && times[0] <= pause.endMs + 500) : pauses.sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs))[0];
      const air = deadAir(evidence);
      if (!target && air.available && (air.leadingMs >= 500 || air.trailingMs >= 500)) {
        return reply(`There is no long interior pause to remove, but there is quiet time at the edges. Proposed cut keeps ${range(air.keepStartMs, air.keepEndMs)} (based on ${air.basis}).`, air.citations, { type: 'trim', startMs: air.keepStartMs, endMs: air.keepEndMs, reason: 'Trim quiet opening/ending' });
      }
      return reply(target
        ? `The pause at ${range(target.startMs, target.endMs)} is in the middle of the video. Removing it needs split editing, which the editor does not support yet; I can only keep one continuous range, for example everything before or after it.`
        : 'I found no interior pause of at least 300ms to remove.', target ? [{ kind: 'silence', startMs: target.startMs, endMs: target.endMs, label: 'Detected pause' }] : [], null, Boolean(target));
    }

    if (/\b(dead air|silence|quiet|tighten|pauses? at the (?:start|beginning|end))\b/.test(lower) || (/\b(trim|remove)\b/.test(lower) && /\b(start|beginning|end|ending|opening)\b/.test(lower) && !times.length)) {
      const air = deadAir(evidence);
      if (!air.available) return reply(`I can't measure quiet time for this video (transcript: ${transcriptError ?? 'ok'}; silence: ${featureError(evidence, 'silence') ?? 'none found'}).`, [], null, true);
      if (air.leadingMs < 300 && air.trailingMs < 300) return reply(`Speech starts at ${formatTime(air.leadingMs)} and continues to within ${seconds(air.trailingMs)} of the end, so there is no dead air worth trimming.`, air.citations);
      return reply(`Proposed cut keeps ${range(air.keepStartMs, air.keepEndMs)}, removing ${seconds(air.keepStartMs)} at the start and ${seconds(duration - air.keepEndMs)} at the end (based on ${air.basis}).`, air.citations, { type: 'trim', startMs: air.keepStartMs, endMs: air.keepEndMs, reason: `Trim quiet opening/ending from ${air.basis}` });
    }

    const lengthMatch = /(\d+(?:\.\d+)?)\s*(?:-|\s)?(s|sec|secs|second|seconds|min|minute|minutes)\b/.exec(lower);
    const wantsLength = /\b(clip|reel|short|version|cut|make)\b/.test(lower) && lengthMatch && !/\b(from|between|to|until)\b/.test(lower.replace(/start(?:ing)? from/, ''));
    const firstLast = /\b(first|last)\s+(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds|min|minutes?)\b/.exec(lower);
    if (firstLast) {
      const length = Number(firstLast[2]) * (/^m/.test(firstLast[3]) ? 60_000 : 1000);
      const start = firstLast[1] === 'first' ? 0 : Math.max(0, duration - length);
      const end = firstLast[1] === 'first' ? Math.min(duration, length) : duration;
      return reply(`Proposed cut keeps the ${firstLast[1]} ${seconds(end - start)}: ${range(start, end)}.`, [{ kind: 'metadata', startMs: start, endMs: end, label: 'Requested range' }], { type: 'trim', startMs: start, endMs: end, reason: `Keep the ${firstLast[1]} ${seconds(end - start)}` });
    }

    if (wantsLength && lengthMatch) {
      const length = Number(lengthMatch[1]) * (/^m/.test(lengthMatch[2]) ? 60_000 : 1000);
      const phrase = quoted(text) ?? /\b(?:where|when) i (?:say|mention|talk about)\s+(.{2,80}?)[.?!]*$/i.exec(text)?.[1] ?? null;
      let start: number | null = null;
      const citations: Citation[] = [];
      if (phrase) {
        if (transcriptError) return needTranscript();
        const hit = findPhrase(evidence, phrase)[0];
        if (!hit) return reply(`I couldn't find “${phrase}” in the transcript, so I didn't propose a cut.`);
        start = Math.max(0, hit.startMs - 150);
        citations.push({ kind: 'transcript', startMs: hit.startMs, endMs: hit.endMs, label: `“${hit.text}”` });
      } else {
        const startTime = /\b(?:start(?:ing)?|begin(?:ning)?|from)\s+(?:at\s+)?/.test(lower) ? findTimes(lower.slice(lower.search(/\b(?:start(?:ing)?|begin(?:ning)?|from)\b/)))[0] : undefined;
        if (startTime !== undefined) start = startTime;
        else { const speech = speechBounds(evidence); start = speech ? Math.max(0, speech.startMs - 200) : 0; if (speech) citations.push({ kind: 'transcript', startMs: speech.startMs, label: 'First transcribed word' }); }
      }
      if (start >= duration - 100) return reply(`That start point is past the end of the ${seconds(duration)} video.`);
      const clip = clipFrom(evidence, start, length);
      if (clip.citation) citations.push(clip.citation);
      const note = clip.endMs - start < length - 500 ? ` It is ${seconds(clip.endMs - start)} because ${clip.citation ? 'it ends on the last complete transcript segment' : 'the video ends'}.` : '';
      return reply(`Proposed ${seconds(length)} clip: ${range(start, clip.endMs)}.${note}`, citations, { type: 'trim', startMs: start, endMs: clip.endMs, reason: `${seconds(length)} clip${phrase ? ` starting at “${phrase}”` : ''}` });
    }

    if (times.length >= 2) {
      const [a, b] = times;
      const start = Math.min(a, b); const end = Math.min(duration, Math.max(a, b));
      if (start >= duration) return reply(`${formatTime(start)} is past the end of this ${seconds(duration)} video.`);
      return reply(`Proposed cut keeps ${range(start, end)}.`, [{ kind: 'metadata', startMs: start, endMs: end, label: 'Requested range' }], { type: 'trim', startMs: start, endMs: end, reason: `Keep ${range(start, end)} as requested` });
    }
    if (times.length === 1) {
      const at = times[0];
      if (at >= duration) return reply(`${formatTime(at)} is past the end of this ${seconds(duration)} video.`);
      if (/\b(end|finish|stop)\b/.test(lower)) return reply(`Proposed cut keeps ${range(current.startMs, at)}.`, [{ kind: 'metadata', startMs: current.startMs, endMs: at, label: 'Requested end' }], { type: 'trim', startMs: current.startMs, endMs: at, reason: `End at ${formatTime(at)}` });
      return reply(`Proposed cut keeps ${range(at, current.endMs)}.`, [{ kind: 'metadata', startMs: at, endMs: current.endMs, label: 'Requested start' }], { type: 'trim', startMs: at, endMs: current.endMs, reason: `Start at ${formatTime(at)}` });
    }
    const phrase = quoted(text);
    if (phrase) {
      if (transcriptError) return needTranscript();
      const hit = findPhrase(evidence, phrase)[0];
      if (!hit) return reply(`I couldn't find “${phrase}” in the transcript.`);
      const start = /\b(end|finish|stop)\b/.test(lower) ? current.startMs : Math.max(0, hit.startMs - 150);
      const end = /\b(end|finish|stop)\b/.test(lower) ? Math.min(duration, hit.endMs + 250) : current.endMs;
      return reply(`Proposed cut keeps ${range(start, end)}, using where you say “${hit.text}”.`, [{ kind: 'transcript', startMs: hit.startMs, endMs: hit.endMs, label: `“${hit.text}”` }], { type: 'trim', startMs: start, endMs: end, reason: `${start === current.startMs ? 'End' : 'Start'} at “${hit.text}”` });
    }
    return reply('Tell me which part to keep, for example “keep 0:05 to 0:20”, “trim the dead air”, or “make a 15 second clip starting where I say \\"welcome\\"”.');
  }

  // ---- Questions ----
  const times = findTimes(lower);
  if (times.length && /\b(said|say|saying|talk|talking|speak|spoken|words?|line|at)\b/.test(lower) && !/\b(object|see|visible|shot)\b/.test(lower)) {
    if (transcriptError) return needTranscript();
    const at = times[0];
    if (at > duration) return reply(`${formatTime(at)} is past the end of this ${seconds(duration)} video.`);
    const segment = evidence.transcript!.segments.find((row) => at >= row.startMs - 250 && at <= row.endMs + 250);
    if (!segment) {
      const quiet = evidence.silence?.intervals.find((interval) => at >= interval.startMs && at <= interval.endMs);
      return reply(`No transcribed speech at ${formatTime(at)}${quiet ? `; audio is quiet from ${range(quiet.startMs, quiet.endMs)}` : ''}.`, quiet ? [{ kind: 'silence', startMs: quiet.startMs, endMs: quiet.endMs, label: 'Quiet interval' }] : []);
    }
    return reply(`At ${range(segment.startMs, segment.endMs)}: “${segment.text}”`, [{ kind: 'transcript', startMs: segment.startMs, endMs: segment.endMs, label: segment.text.slice(0, 80) }]);
  }

  const searchPhrase = quoted(text) ?? /\b(?:where|when)\s+(?:do|did)\s+i\s+(?:say|mention|talk about)\s+(.{2,80}?)[?.!]*$/i.exec(text)?.[1] ?? /\b(?:find|search(?: for)?)\s+(.{2,80}?)[?.!]*$/i.exec(text)?.[1];
  if (searchPhrase && !/\b(objects?|shots?)\b/.test(lower)) {
    if (transcriptError) return needTranscript();
    const hits = findPhrase(evidence, searchPhrase);
    if (!hits.length) return reply(`“${searchPhrase}” does not appear in the transcript.`);
    return reply(`“${searchPhrase}” appears ${hits.length} time${hits.length === 1 ? '' : 's'}: ${hits.slice(0, 5).map((hit) => formatTime(hit.startMs)).join(', ')}.`, hits.slice(0, 5).map((hit) => ({ kind: 'transcript' as const, startMs: hit.startMs, endMs: hit.endMs, label: `“${hit.text}”` })));
  }

  if (/\b(pause|pauses|silence|silent|quiet|dead air|gap)\b/.test(lower)) {
    const error = featureError(evidence, 'silence');
    if (error) return reply(`Pause detection is unavailable (${error}).`, [], null, true);
    const intervals = [...(evidence.silence?.intervals ?? [])].sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs));
    if (!intervals.length) return reply('No quiet intervals of 300ms or longer were detected.');
    const total = intervals.reduce((sum, interval) => sum + interval.endMs - interval.startMs, 0);
    return reply(`${intervals.length} quiet interval${intervals.length === 1 ? '' : 's'} (${seconds(total)} total). Longest: ${intervals.slice(0, 5).map((interval) => `${range(interval.startMs, interval.endMs)}`).join(', ')}.`,
      intervals.slice(0, 5).map((interval) => ({ kind: 'silence' as const, startMs: interval.startMs, endMs: interval.endMs, label: `Quiet ${seconds(interval.endMs - interval.startMs)}` })));
  }

  if (/\b(shots?|cuts?|scenes?|camera change)\b/.test(lower)) {
    const error = featureError(evidence, 'shots');
    if (error) return reply(`Shot detection is unavailable (${error}).`, [], null, true);
    const shots = evidence.shots?.shots ?? [];
    return reply(`${shots.length} detected shot${shots.length === 1 ? '' : 's'} (visual cuts, not semantic scenes): ${shots.slice(0, 8).map((shot) => `#${shot.id} ${range(shot.startMs, shot.endMs)}`).join(', ')}.`,
      shots.slice(0, 8).map((shot) => ({ kind: 'shot' as const, startMs: shot.startMs, endMs: shot.endMs, label: `Shot ${shot.id}` })));
  }

  if (/\b(objects?|see|seen|visible|detect|detected|appear|appears|is there|are there|show|shown)\b/.test(lower)) {
    const error = featureError(evidence, 'yolo');
    if (error) return reply(`Object detection is unavailable (${error}).`, [], null, true);
    const samples = evidence.yolo?.detections ?? [];
    const counts = new Map<string, { count: number; first: number; confidence: number }>();
    for (const sample of samples) for (const object of sample.objects) {
      const entry = counts.get(object.name) ?? { count: 0, first: sample.startMs, confidence: 0 };
      entry.count++; entry.confidence = Math.max(entry.confidence, object.confidence); counts.set(object.name, entry);
    }
    const label = [...counts.keys()].find((name) => new RegExp(`\\b${name}s?\\b`, 'i').test(lower));
    const interval = evidence.yolo?.sampleIntervalMs ?? 0;
    if (label) {
      const matches = samples.filter((sample) => sample.objects.some((object) => object.name === label));
      return reply(`“${label}” was detected in ${matches.length} of ${samples.length} sampled frames (one frame every ${seconds(interval)}), first at ${formatTime(matches[0].startMs)}.`,
        matches.slice(0, 5).map((sample) => ({ kind: 'object' as const, startMs: sample.startMs, label: `${label} (${Math.round(Math.max(...sample.objects.filter((object) => object.name === label).map((object) => object.confidence)) * 100)}%)` })));
    }
    if (!counts.size) return reply(`No objects were detected in ${samples.length} sampled frames.`);
    const top = [...counts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    return reply(`Detected in sampled frames (every ${seconds(interval)}; not continuous tracking): ${top.map(([name, entry]) => `${name} ×${entry.count}`).join(', ')}.`,
      top.map(([name, entry]) => ({ kind: 'object' as const, startMs: entry.first, label: name })));
  }

  if (/\b(audio|loud|volume|level|noise|noisy)\b/.test(lower)) {
    const windows = evidence.audio?.windows ?? [];
    if (!windows.length) return reply(`Audio levels are unavailable (${featureError(evidence, 'audio_rms') ?? 'no audio'}).`, [], null, true);
    const values = windows.map((window) => window.rms);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const peak = windows.reduce((best, window) => window.rms > best.rms ? window : best, windows[0]);
    return reply(`Average audio level ${mean.toFixed(3)} RMS; loudest at ${formatTime(peak.startMs)} (${peak.rms.toFixed(3)} RMS). These are signal levels, not calibrated loudness.`, [{ kind: 'audio', startMs: peak.startMs, endMs: peak.endMs, label: 'Loudest window' }]);
  }

  if (/\b(transcript|what (?:do|did) i say|what is said|what'?s said)\b/.test(lower)) {
    if (transcriptError) return needTranscript();
    const segments = evidence.transcript!.segments;
    if (!segments.length) return reply('No speech was transcribed.');
    return reply(segments.slice(0, 4).map((segment) => `${formatTime(segment.startMs)} “${segment.text}”`).join('\n') + (segments.length > 4 ? `\n…${segments.length - 4} more segments in Preview.` : ''),
      segments.slice(0, 4).map((segment) => ({ kind: 'transcript' as const, startMs: segment.startMs, endMs: segment.endMs, label: segment.text.slice(0, 80) })));
  }

  if (/\b(summary|summari[sz]e|overview|about|describe|what'?s in|what is in|analysis)\b/.test(lower)) {
    const segments = evidence.transcript?.segments ?? [];
    const silenceTotal = (evidence.silence?.intervals ?? []).reduce((sum, interval) => sum + interval.endMs - interval.startMs, 0);
    const labels = new Set((evidence.yolo?.detections ?? []).flatMap((sample) => sample.objects.map((object) => object.name)));
    const lines = [
      `${seconds(duration)} ${evidence.metadata?.orientation ?? ''} video${evidence.metadata?.width ? ` (${evidence.metadata.width}×${evidence.metadata.height})` : ''}.`,
      transcriptError ? `Transcript unavailable (${transcriptError}).` : `${segments.length} transcript segment${segments.length === 1 ? '' : 's'}${segments[0] ? `, opening with “${segments[0].text.slice(0, 100)}”` : ''}.`,
      `${evidence.shots?.shots.length ?? 0} detected shot(s); ${seconds(silenceTotal)} of quiet audio.`,
      labels.size ? `Objects in sampled frames: ${[...labels].slice(0, 6).join(', ')}.` : 'No objects detected in sampled frames.',
      'This is a measured summary, not an interpretation of meaning or quality.',
    ];
    return reply(lines.join(' '), segments[0] ? [{ kind: 'transcript', startMs: segments[0].startMs, endMs: segments[0].endMs, label: 'Opening line' }] : []);
  }

  return reply(HELP);
}
