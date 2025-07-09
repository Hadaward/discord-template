import { getDiscordUserInGamePrivLevel, getDiscordUserInGamePlayerId, getPlayerInGamePrivLevel, getPlayerIdByName } from "@/common/database/darkmice";
import { isDiscordAccountLinked } from "@/common/database/discord";
import { DARKMICE_CLIENT } from "@/server/darkmice";
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

export const builder = new SlashCommandBuilder().
	setName("ban").
	setDescription("Ban a player from the DarkMice server through Discord.").
	setDescriptionLocalization("pt-BR", "Banir um jogador do DarkMice através do Discord.").
	setDefaultMemberPermissions(0).
	addStringOption((option) => option.setName("nickname").
		setDescription("The nickname of the player to ban.").
		setDescriptionLocalization("pt-BR", "O apelido do jogador a ser banido.").
		setRequired(true)).
	addIntegerOption((option) => option.setName("hours").
		setDescription("The number of hours to ban the player.").
		setDescriptionLocalization("pt-BR", "O número de horas para banir o jogador.").
		setRequired(true)).
	addStringOption((option) => option.setName("reason").
		setDescription("The reason for the ban.").
		setDescriptionLocalization("pt-BR", "O motivo do banimento.").
		setRequired(false)).
	addBooleanOption((option) => option.setName("reset_records").
		setDescription("Whether to reset the player's records.").
		setDescriptionLocalization("pt-BR", "Se deve resetar os recordes do jogador.").
		setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	if (!await isDiscordAccountLinked(interaction.user.id)) {
		await interaction.reply({
			content: "Você precisa vincular sua conta do DarkMice ao Discord antes de usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	/**
	 * if client.privLevel < privLevel:
	 * client.sendMessage("<V>[•]</V> <R>Você não pode banir este jogador.</R>")
	 * client.sendStaffMessage(7, "<R>%s</R> tentou banir <J>%s</J> mas suas permissões não são suficientes." % (client.playerName, playerName))
	 * return
	 */

	const nickname = interaction.options.getString("nickname", true);
	const hours = interaction.options.getInteger("hours", true);
	const reason = interaction.options.getString("reason");
	const resetRecords = interaction.options.getBoolean("reset_records") ?? false;

	if (!nickname) {
		await interaction.reply({
			content: "Você deve fornecer um apelido válido.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (hours <= 0) {
		await interaction.reply({
			content: "O número de horas deve ser maior que zero.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const playerId = await getPlayerIdByName(nickname);

	if (!playerId) {
		await interaction.reply({
			content: `Jogador "${nickname}" não encontrado.`,
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const privLevel = await getDiscordUserInGamePrivLevel(interaction.user.id);
	const playerPrivLevel = await getPlayerInGamePrivLevel(playerId);

	if (privLevel < 6) {
		await interaction.reply({
			content: "Você não tem permissão para usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (privLevel < playerPrivLevel) {
		await interaction.reply({
			content: "Você não pode banir este jogador.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const banMessage = {
		type: "ban_player",
		modId: await getDiscordUserInGamePlayerId(interaction.user.id),
		playerId,
		hours,
		reason: reason ?? "",
		resetRecords,
	};

	if (!DARKMICE_CLIENT.connected) {
		await interaction.reply({
			content: "Não foi possível banir o jogador pois não há conexão com o servidor do DarkMice.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	DARKMICE_CLIENT.socket?.write(JSON.stringify(banMessage));

	await interaction.reply({
		content: `Jogador "${nickname}" banido por ${hours} horas. Motivo: ${reason ?? "Nenhum motivo fornecido."}`,
		flags: MessageFlags.Ephemeral,
	});
}
