import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  Message
} from "discord.js";
import { loadConfig } from "./config.js";
import { CURATED_VOICES, isCuratedVoice } from "./voices.js";
import { VoiceSessionManager } from "./voiceSession.js";

const config = loadConfig();
const voiceSessions = new VoiceSessionManager(config.defaultVoice);
const textListeners = new Map<string, string>();
const MAX_LISTEN_MESSAGE_LENGTH = 500;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    await handleCommand(interaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Command failed.";
    console.error(message, error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  await handleListenedMessage(message);
});

async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: "Use this bot in a server.", ephemeral: true });
    return;
  }

  switch (interaction.commandName) {
    case "join": {
      await interaction.deferReply({ ephemeral: true });
      const channel = await voiceSessions.join(interaction);
      await interaction.editReply(`Joined ${channel.name}.`);
      return;
    }

    case "leave": {
      textListeners.delete(interaction.guildId);
      voiceSessions.leave(interaction.guildId);
      await interaction.reply({ content: "Left voice and cleared the queue.", ephemeral: true });
      return;
    }

    case "listen": {
      const channel = interaction.options.getChannel("channel", true);

      if (channel.type !== ChannelType.GuildText) {
        await interaction.reply({ content: "Choose a text channel.", ephemeral: true });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
      await voiceSessions.join(interaction);
      textListeners.set(interaction.guildId, channel.id);
      await interaction.editReply(`Now reading new messages from ${channel}.`);
      return;
    }

    case "unlisten": {
      const wasListening = textListeners.delete(interaction.guildId);
      await interaction.reply({
        content: wasListening ? "Stopped reading text-channel messages." : "No text-channel listener was active.",
        ephemeral: true
      });
      return;
    }

    case "say": {
      const text = interaction.options.getString("text", true).trim();

      if (!text) {
        await interaction.reply({ content: "Text cannot be empty.", ephemeral: true });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
      const { channel, position } = await voiceSessions.enqueue(interaction, text);
      await interaction.editReply(`Queued in ${channel.name}. Position: ${position}.`);
      return;
    }

    case "voice": {
      const voice = interaction.options.getString("voice", true);

      if (!isCuratedVoice(voice)) {
        await interaction.reply({
          content: `Unsupported voice. Use one of: ${CURATED_VOICES.join(", ")}`,
          ephemeral: true
        });
        return;
      }

      voiceSessions.setVoice(interaction.guildId, voice);
      await interaction.reply({ content: `Voice set to ${voice}.`, ephemeral: true });
      return;
    }

    case "voices": {
      const currentVoice = voiceSessions.getVoice(interaction.guildId);
      await interaction.reply({
        content: `Curated voices:\n${CURATED_VOICES.map((voice) => {
          const marker = voice === currentVoice ? " (current)" : "";
          return `- ${voice}${marker}`;
        }).join("\n")}`,
        ephemeral: true
      });
      return;
    }

    case "stop": {
      voiceSessions.stop(interaction.guildId);
      await interaction.reply({ content: "Stopped playback and cleared the queue.", ephemeral: true });
      return;
    }

    default:
      await interaction.reply({ content: "Unknown command.", ephemeral: true });
  }
}

async function handleListenedMessage(message: Message): Promise<void> {
  if (!message.guildId || message.author.bot) {
    return;
  }

  const listenedChannelId = textListeners.get(message.guildId);
  if (message.channelId !== listenedChannelId) {
    return;
  }

  const text = normalizeMessageForSpeech(message);
  if (!text) {
    return;
  }

  try {
    voiceSessions.enqueueForGuild(message.guildId, text, message.author.tag);
  } catch (error) {
    console.error(`[${message.guildId}] Failed to enqueue listened message:`, error);
  }
}

function normalizeMessageForSpeech(message: Message): string {
  const content = message.cleanContent.trim().replace(/\s+/g, " ");

  if (!content) {
    return "";
  }

  if (content.length <= MAX_LISTEN_MESSAGE_LENGTH) {
    return content;
  }

  return `${content.slice(0, MAX_LISTEN_MESSAGE_LENGTH)}...`;
}

await client.login(config.discordToken);
