import { getCommands } from "@/common/manager/command";
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export const builder = new SlashCommandBuilder().
	setName("commands").
	setNameLocalization("pt-BR", "comandos").
	setDescription("List of available commands.").
	setDescriptionLocalization("pt-BR", "Lista de comandos disponíveis.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
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
			content: "No commands are available to you at this time.",
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
