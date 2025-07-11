import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface DiscordCommand {
	builder: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}
