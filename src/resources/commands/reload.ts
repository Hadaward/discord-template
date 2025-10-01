import { RESOURCES_PATH } from "@/common/init";
import { initCommands } from "@/common/manager/command";
import chalk from "chalk";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export const builder = new SlashCommandBuilder().
	setName("reload").
	setDescription("Reload <module>.").
	setDescriptionLocalization("pt-BR", "Recarregar <módulo>.").
	setDefaultMemberPermissions(0).
	addSubcommand((subcommand) => subcommand.setName("commands").
		setDescription("Reload all commands.").
		setDescriptionLocalization("pt-BR", "Recarregar todos os comandos."));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand = interaction.options.getSubcommand();

	try {
		switch (subcommand) {
		case "commands":
			await reloadCommands();
			await interaction.reply({
				content: "All commands have been reloaded.",
				flags: MessageFlags.Ephemeral,
			});
			break;
		default:
			await interaction.reply({
				content: "Unknown subcommand.",
				flags: MessageFlags.Ephemeral,
			});
		}
	} catch (error) {
		console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("reload.execute")}] An error occurred while reloading:\n`, error);
		await interaction.reply({
			content: "An error occurred while reloading.",
			flags: MessageFlags.Ephemeral,
		});
	}
}

async function reloadCommands(): Promise<void> {
	console.log(chalk.blueBright("> Reloading commands..."));
	await initCommands(RESOURCES_PATH);
}
