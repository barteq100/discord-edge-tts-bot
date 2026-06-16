import { EdgeTTS, Constants } from "@andresaya/edge-tts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export interface TtsAudioFile {
  path: string;
  cleanup: () => Promise<void>;
}

export async function synthesizeToTempFile(text: string, voice: string): Promise<TtsAudioFile> {
  const dir = await mkdtemp(path.join(tmpdir(), "discord-edge-tts-"));
  const basePath = path.join(dir, "speech");
  const tts = new EdgeTTS();

  await tts.synthesize(text, voice, {
    outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  });

  const audioPath = await tts.toFile(basePath);

  return {
    path: audioPath,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    }
  };
}
