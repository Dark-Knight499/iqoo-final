export type SharpnessCandidate = { timestampMs: number; sharpness: number };

/** Keep only the sharpest timestamp seen in the current shot; no image is saved. */
export function selectSharpestTimestamp(current: SharpnessCandidate | undefined, candidate: SharpnessCandidate): SharpnessCandidate {
  return !current || candidate.sharpness > current.sharpness ? candidate : current;
}
