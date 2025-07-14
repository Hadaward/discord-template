import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { isDiscordAccountLinked } from "@/common/database/discord";
import { getCommands } from "@/common/manager/command";

export const builder = new SlashCommandBuilder().
	setName("commands").
	setNameLocalization("pt-BR", "comandos").
	setDescription("List of available commands.").
	setDescriptionLocalization("pt-BR", "Lista de comandos disponíveis.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!await isDiscordAccountLinked(interaction.user.id)) {
		await interaction.reply({
			content: "Você precisa vincular sua conta do DarkMice ao Discord antes de usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const commandsList = Array.from(getCommands().values());

	const filteredCommands = commandsList.filter((command) => {
		const requiredPermissions = command.builder.default_member_permissions;

		if (!requiredPermissions) {
			return true;
		}

		return requiredPermissions === null || interaction.memberPermissions?.has(BigInt(requiredPermissions));
	});

	if (filteredCommands.length === 0) {
		await interaction.reply({
			content: "Nenhum comando disponível no momento.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const commandDescriptions = filteredCommands.map((command) => `**/${command.builder.name_localizations?.["pt-BR"] || command.builder.name}**: ${command.builder.description_localizations?.["pt-BR"] || command.builder.description}`).join("\n");

	await interaction.reply({
		content: `**Available Commands:**\n${commandDescriptions}`,
		flags: MessageFlags.Ephemeral,
	});
}
