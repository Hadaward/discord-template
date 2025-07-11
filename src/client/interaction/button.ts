import { getUserIdByFakeDMChannel, deleteFakeDMChannel } from "@/common/database/local";
import { type ButtonInteraction, MessageFlags } from "discord.js";
import { sendFakeDMMessage } from "@/common/util/fake_dm";

export async function buttonInteractionHandler(interaction: ButtonInteraction): Promise<void> {
	if (interaction.customId === "delete_dm_channel") {
		try {
			const dmChannelId = interaction.message?.channelId;

			if (!dmChannelId) {
				await interaction.reply({ content: "Canal de DM não encontrado.", flags: [ MessageFlags.Ephemeral ] });

				return;
			}

			const userId = await getUserIdByFakeDMChannel(dmChannelId);

			if (userId !== null && userId !== interaction.user.id) {
				await interaction.reply({ content: "Você não pode excluir este canal.", flags: [ MessageFlags.Ephemeral ] });

				return;
			}

			const dmChannel = await interaction.guild?.channels.fetch(dmChannelId).catch(() => null);

			if (!dmChannel || !dmChannel.isTextBased()) {
				await interaction.reply({ content: "Canal de DM inválido ou não encontrado.", flags: [ MessageFlags.Ephemeral ] });

				return;
			}

			await interaction.reply({ content: "Canal excluído com sucesso.", flags: [ MessageFlags.Ephemeral ] });

			await dmChannel.delete().catch(() => null);
			await deleteFakeDMChannel(interaction.user.id, dmChannelId);
		} catch {
			await sendFakeDMMessage(interaction.user.id, "Ocorreu um erro ao tentar excluir o canal de DM. Por favor, tente novamente mais tarde.");
		}
	}
}
