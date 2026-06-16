export const CURATED_VOICES = [
  "en-US-JennyNeural",
  "en-US-AriaNeural",
  "en-US-GuyNeural",
  "en-GB-SoniaNeural",
  "pl-PL-ZofiaNeural",
  "pl-PL-MarekNeural"
] as const;

export type CuratedVoice = (typeof CURATED_VOICES)[number];

export const DEFAULT_VOICE = "en-US-JennyNeural";

export function isCuratedVoice(voice: string): voice is CuratedVoice {
  return CURATED_VOICES.includes(voice as CuratedVoice);
}
