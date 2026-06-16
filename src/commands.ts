import { SlashCommandBuilder } from "discord.js";
import { CURATED_VOICES } from "./voices.js";

export const slashCommands = [
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your current voice channel."),
  new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the current voice channel and clear the TTS queue."),
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
    .setName("stop")
    .setDescription("Stop current speech and clear queued messages.")
].map((command) => command.toJSON());
