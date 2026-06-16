import "dotenv/config";
import { DEFAULT_VOICE, isCuratedVoice } from "./voices.js";

export interface BotConfig {
  discordToken: string;
  discordClientId: string;
  discordGuildId?: string;
  defaultVoice: string;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadConfig(): BotConfig {
  const defaultVoice = process.env.DEFAULT_VOICE?.trim() || DEFAULT_VOICE;

  if (!isCuratedVoice(defaultVoice)) {
    throw new Error(
      `DEFAULT_VOICE must be one of: ${DEFAULT_VOICE}, en-US-AriaNeural, en-US-GuyNeural, en-GB-SoniaNeural, pl-PL-ZofiaNeural, pl-PL-MarekNeural`
    );
  }

  return {
    discordToken: requireEnv("DISCORD_TOKEN"),
    discordClientId: requireEnv("DISCORD_CLIENT_ID"),
    discordGuildId: process.env.DISCORD_GUILD_ID?.trim() || undefined,
    defaultVoice
  };
}
