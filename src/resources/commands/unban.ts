import { getDiscordUserInGamePrivLevel, getDiscordUserInGamePlayerId, getPlayerIdByName, getModeratorNameWhoBannedPlayer, getPlayerBanHours } from "@/common/database/darkmice";
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { UnbanPlayerMessage } from "@/resources/messages/outgoing/unban_player";
import { isDiscordAccountLinked } from "@/common/database/discord";
import { DarkMiceClient } from "@/server/darkmice";
import { parsePlayerName } from "@/utils/string";

export const builder = new SlashCommandBuilder().
	setName("unban").
	setDescription("Unban a player from the DarkMice server through Discord.").
	setDescriptionLocalization("pt-BR", "Desbanir um jogador do DarkMice através do Discord.").
	setDefaultMemberPermissions(0).
	addStringOption((option) => option.setName("nickname").
		setDescription("The nickname of the player to unban.").
		setDescriptionLocalization("pt-BR", "O apelido do jogador a ser desbanido.").
		setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!await isDiscordAccountLinked(interaction.user.id)) {
		await interaction.reply({
			content: "Você precisa vincular sua conta do DarkMice ao Discord antes de usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const nickname = interaction.options.getString("nickname", true);

	if (!nickname) {
		await interaction.reply({
			content: "Você deve fornecer um apelido válido.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const playerId = await getPlayerIdByName(parsePlayerName(nickname));

	if (!playerId) {
		await interaction.reply({
			content: `Jogador "${nickname}" não encontrado.`,
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const privLevel = await getDiscordUserInGamePrivLevel(interaction.user.id);

	if (privLevel < 6) {
		await interaction.reply({
			content: "Você não tem permissão para usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const modPlayerId = await getDiscordUserInGamePlayerId(interaction.user.id);

	if (!modPlayerId) {
		await interaction.reply({
			content: "Não foi possível encontrar o ID do jogador associado ao seu Discord.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const playerBanHours = await getPlayerBanHours(playerId);

	if (playerBanHours === null || playerBanHours <= 0) {
		await interaction.reply({
			content: `O jogador "${nickname}" não está banido.`,
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (privLevel < 10) {
		const moderatorName = await getModeratorNameWhoBannedPlayer(parsePlayerName(nickname));

		if (!moderatorName) {
			await interaction.reply({
				content: `Não foi possível encontrar o moderador que baniu o jogador "${nickname}".`,
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		const moderatorIdWhoBanned = await getPlayerIdByName(parsePlayerName(moderatorName));

		if (!moderatorIdWhoBanned) {
			await interaction.reply({
				content: "Não foi possível encontrar o ID do moderador que baniu o jogador.",
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		if (moderatorIdWhoBanned !== modPlayerId) {
			await interaction.reply({
				content: `Você não pode desbanir o jogador "${nickname}" pois ele foi banido por outro moderador.`,
				flags: MessageFlags.Ephemeral,
			});

			return;
		}
	}

	DarkMiceClient.instance.sendMessage(new UnbanPlayerMessage({
		modId: modPlayerId,
		playerId,
	}));

	await interaction.reply({
		content: `Jogador "${nickname}" desbanido com sucesso.`,
		flags: MessageFlags.Ephemeral,
	});
}
