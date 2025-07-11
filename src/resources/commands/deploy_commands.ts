import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { deployCommands } from "@/common/manager/command";

export const builder = new SlashCommandBuilder().
	setName("redeploy").
	setDescription("Re-deploy all commands and message handlers.").
	setDescriptionLocalization("pt-BR", "Reimplantar todos os comandos.").
	setDefaultMemberPermissions(0);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		await deployCommands();
		await interaction.editReply({ content: "Todos os comandos foram reimplantados com sucesso." });
	} catch (error) {
		console.error("[ERROR] [redeploy.execute] An error occurred while re-deploying commands:\n", error);
		await interaction.editReply({ content: "Ocorreu um erro ao reimplantar os comandos." });
	}
}
