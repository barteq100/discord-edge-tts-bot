import { REST, Routes } from "discord.js";
import { slashCommands } from "./commands.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.discordToken);
const route = config.discordGuildId
  ? Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId)
  : Routes.applicationCommands(config.discordClientId);
const scope = config.discordGuildId ? `guild ${config.discordGuildId}` : "global";

console.log(`Registering ${slashCommands.length} ${scope} slash commands...`);

await rest.put(route, { body: slashCommands });

console.log("Slash commands registered.");
