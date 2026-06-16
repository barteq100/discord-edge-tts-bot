import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel
} from "@discordjs/voice";
import type {
  ChatInputCommandInteraction,
  GuildMember,
  VoiceBasedChannel
} from "discord.js";
import ffmpegStatic from "ffmpeg-static";
import { DEFAULT_TTS_SETTINGS, synthesizeToTempFile, type TtsSettings } from "./tts.js";

const ffmpegPath = ffmpegStatic as unknown as string | null;

if (ffmpegPath) {
  process.env.FFMPEG_PATH = ffmpegPath;
}

interface QueuedSpeech {
  text: string;
  voice: string;
  settings: TtsSettings;
  requestedBy: string;
}

interface GuildVoiceSession {
  connection?: VoiceConnection;
  player: AudioPlayer;
  queue: QueuedSpeech[];
  isProcessing: boolean;
  voice: string;
  settings: TtsSettings;
}

export class VoiceSessionManager {
  private readonly sessions = new Map<string, GuildVoiceSession>();

  constructor(private readonly defaultVoice: string) {}

  getVoice(guildId: string): string {
    return this.getSession(guildId).voice;
  }

  setVoice(guildId: string, voice: string): void {
    this.getSession(guildId).voice = voice;
  }

  getSettings(guildId: string): TtsSettings {
    return { ...this.getSession(guildId).settings };
  }

  setRate(guildId: string, rate: number): void {
    this.getSession(guildId).settings.rate = rate;
  }

  setPitch(guildId: string, pitch: number): void {
    this.getSession(guildId).settings.pitch = pitch;
  }

  setVolume(guildId: string, volume: number): void {
    this.getSession(guildId).settings.volume = volume;
  }

  async join(interaction: ChatInputCommandInteraction): Promise<VoiceBasedChannel> {
    const channel = this.getUserVoiceChannel(interaction);
    const session = this.getSession(interaction.guildId!);

    const existingConnection = getVoiceConnection(interaction.guildId!);
    if (existingConnection) {
      session.connection = existingConnection;
      session.connection.subscribe(session.player);
      return channel;
    }

    session.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    session.connection.subscribe(session.player);
    await entersState(session.connection, VoiceConnectionStatus.Ready, 20_000);

    return channel;
  }

  async enqueue(
    interaction: ChatInputCommandInteraction,
    text: string
  ): Promise<{ channel: VoiceBasedChannel; position: number }> {
    const channel = await this.join(interaction);
    const guildId = interaction.guildId!;
    const position = this.enqueueForGuild(guildId, text, interaction.user.tag);

    return { channel, position };
  }

  enqueueForGuild(guildId: string, text: string, requestedBy: string): number {
    const session = this.getSession(guildId);

    if (!session.connection && !getVoiceConnection(guildId)) {
      throw new Error("The bot is not connected to a voice channel.");
    }

    session.queue.push({
      text,
      voice: session.voice,
      settings: { ...session.settings },
      requestedBy
    });

    const position = session.queue.length;
    void this.processQueue(guildId);

    return position;
  }

  stop(guildId: string): void {
    const session = this.getSession(guildId);
    session.queue = [];
    session.player.stop(true);
    session.isProcessing = false;
  }

  leave(guildId: string): void {
    const session = this.sessions.get(guildId);

    if (!session) {
      getVoiceConnection(guildId)?.destroy();
      return;
    }

    session.queue = [];
    session.player.stop(true);
    session.connection?.destroy();
    this.sessions.delete(guildId);
  }

  private getSession(guildId: string): GuildVoiceSession {
    let session = this.sessions.get(guildId);

    if (!session) {
      const player = createAudioPlayer();
      session = {
        player,
        queue: [],
        isProcessing: false,
        voice: this.defaultVoice,
        settings: { ...DEFAULT_TTS_SETTINGS }
      };
      this.sessions.set(guildId, session);
    }

    return session;
  }

  private getUserVoiceChannel(interaction: ChatInputCommandInteraction): VoiceBasedChannel {
    if (!interaction.guildId || !interaction.guild) {
      throw new Error("This command can only be used in a server.");
    }

    const member = interaction.member as GuildMember | null;
    const channel = member?.voice.channel;

    if (!channel) {
      throw new Error("Join a voice channel first.");
    }

    return channel;
  }

  private async processQueue(guildId: string): Promise<void> {
    const session = this.getSession(guildId);

    if (session.isProcessing) {
      return;
    }

    session.isProcessing = true;

    while (session.queue.length > 0) {
      const item = session.queue.shift()!;
      let cleanup: (() => Promise<void>) | undefined;

      try {
        console.log(
          `[${guildId}] Speaking for ${item.requestedBy} with ${item.voice} rate=${item.settings.rate} pitch=${item.settings.pitch} volume=${item.settings.volume}`
        );
        const audio = await synthesizeToTempFile(item.text, item.voice, item.settings);
        cleanup = audio.cleanup;
        const resource = createAudioResource(audio.path);

        session.player.play(resource);
        await entersState(session.player, AudioPlayerStatus.Idle, 120_000);
      } catch (error) {
        console.error(`[${guildId}] Failed to play queued TTS:`, error);
      } finally {
        if (cleanup) {
          await cleanup();
        }
      }
    }

    session.isProcessing = false;
  }
}
