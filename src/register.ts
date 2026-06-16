import { REST, Routes } from "discord.js";
import { slashCommands } from "./commands.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.discordToken);

console.log(`Registering ${slashCommands.length} guild slash commands...`);

await rest.put(
  Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId),
  { body: slashCommands }
);

console.log("Slash commands registered.");
