export const CURATED_VOICES = [
  "en-US-JennyNeural",
  "en-US-AnaNeural",
  "en-US-AriaNeural",
  "en-US-AvaNeural",
  "en-US-AvaMultilingualNeural",
  "en-US-EmmaNeural",
  "en-US-EmmaMultilingualNeural",
  "en-US-GuyNeural",
  "en-US-MichelleNeural",
  "en-AU-NatashaNeural",
  "en-CA-ClaraNeural",
  "en-GB-LibbyNeural",
  "en-GB-MaisieNeural",
  "en-GB-SoniaNeural",
  "ko-KR-SunHiNeural",
  "zh-CN-XiaoxiaoNeural",
  "pl-PL-ZofiaNeural",
  "pl-PL-MarekNeural"
] as const;

export type CuratedVoice = (typeof CURATED_VOICES)[number];

export const DEFAULT_VOICE = "en-US-JennyNeural";

export function isCuratedVoice(voice: string): voice is CuratedVoice {
  return CURATED_VOICES.includes(voice as CuratedVoice);
}
