import chalk from "chalk";
import { RESOURCES_PATH } from "@/common/init";
import { initCommands } from "@/common/manager/command";
import { initMessageHandlers } from "@/common/manager/message";
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export const builder = new SlashCommandBuilder().
	setName("reload").
	setDescription("Ban a player from the DarkMice server through Discord.").
	setDescriptionLocalization("pt-BR", "Banir um jogador do DarkMice através do Discord.").
	setDefaultMemberPermissions(0).
	addSubcommand((subcommand) => subcommand.setName("commands").
		setDescription("Reload all commands.").
		setDescriptionLocalization("pt-BR", "Recarregar todos os comandos.")).
	addSubcommand((subcommand) => subcommand.setName("messages").
		setDescription("Reload all message handlers.").
		setDescriptionLocalization("pt-BR", "Recarregar todos os manipuladores de mensagens.")).
	addSubcommand((subcommand) => subcommand.setName("game").
		setDescription("Reload all game modules.").
		setDescriptionLocalization("pt-BR", "Recarregar todos os módulos do servidor do jogo."));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const subcommand = interaction.options.getSubcommand();

	try {
		switch (subcommand) {
		case "commands":
			await reloadCommands();
			await interaction.reply({
				content: "Todos os comandos foram recarregados com sucesso.",
				flags: MessageFlags.Ephemeral,
			});
			break;
		case "messages":
			await reloadMessages();
			await interaction.reply({
				content: "Todos os manipuladores de mensagens foram recarregados com sucesso.",
				flags: MessageFlags.Ephemeral,
			});
			break;
		case "game":
			await reloadGameModules(interaction);
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
			content: "Ocorreu um erro ao recarregar.",
			flags: MessageFlags.Ephemeral,
		});
	}
}

async function reloadCommands(): Promise<void> {
	console.log(chalk.blueBright("> Reloading commands..."));
	await initCommands(RESOURCES_PATH);
}

async function reloadMessages(): Promise<void> {
	console.log(chalk.blueBright("> Reloading message handlers..."));
	await initMessageHandlers(RESOURCES_PATH);
}

async function reloadGameModules(interaction: ChatInputCommandInteraction): Promise<void> {
	// Logic to reload game modules
	console.log(chalk.blueBright("> Reloading game modules..."));
	await interaction.reply({
		content: "Não implementado ainda.",
		flags: MessageFlags.Ephemeral,
	});
}
