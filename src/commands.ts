import { ChannelType, SlashCommandBuilder } from "discord.js";
import { CURATED_VOICES } from "./voices.js";

export const slashCommands = [
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your current voice channel."),
  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the current voice channel and clear the TTS queue."),
  new SlashCommandBuilder()
    .setName("listen")
    .setDescription("Read new messages from a text channel into your current voice channel.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Text channel to read aloud.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("unlisten")
    .setDescription("Stop reading messages from the current text channel listener."),
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Speak text in your current voice channel.")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text to speak.")
        .setRequired(true)
        .setMaxLength(1000)
    ),
  new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Set the TTS voice for this server.")
    .addStringOption((option) => {
      const withChoices = option
        .setName("voice")
        .setDescription("Voice to use.")
        .setRequired(true);

      for (const voice of CURATED_VOICES) {
        withChoices.addChoices({ name: voice, value: voice });
      }

      return withChoices;
    }),
  new SlashCommandBuilder()
    .setName("voices")
    .setDescription("List the curated voices supported by this bot."),
  new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Set speech rate for this server.")
    .addIntegerOption((option) =>
      option
        .setName("value")
        .setDescription("Speech rate from -50 slower to 50 faster.")
        .setRequired(true)
        .setMinValue(-50)
        .setMaxValue(50)
    ),
  new SlashCommandBuilder()
    .setName("pitch")
    .setDescription("Set speech pitch for this server.")
    .addIntegerOption((option) =>
      option
        .setName("value")
        .setDescription("Pitch in Hz from -50 lower to 50 higher.")
        .setRequired(true)
        .setMinValue(-50)
        .setMaxValue(50)
    ),
  new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set speech volume for this server.")
    .addIntegerOption((option) =>
      option
        .setName("value")
        .setDescription("Volume from 0 to 100.")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),
  new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Show current TTS voice, rate, pitch, and volume."),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop current speech and clear queued messages.")
].map((command) => command.toJSON());
