import { getDiscordUserInGamePrivLevel, getDiscordUserInGamePlayerId, getPlayerInGamePrivLevel, getPlayerIdByName } from "@/common/database/darkmice";
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { ChangePlayerPasswordMessage } from "@/resources/messages/outgoing/change_password";
import { isDiscordAccountLinked } from "@/common/database/discord";
import { DarkMiceClient } from "@/server/darkmice";
import { parsePlayerName } from "@/utils/string";

export const builder = new SlashCommandBuilder().
	setName("change_pwd").
	setNameLocalization("pt-BR", "change_pass").
	setDescription("Change the password of a player in the DarkMice server through Discord.").
	setDescriptionLocalization("pt-BR", "Alterar a senha de um jogador do DarkMice através do Discord.").
	setDefaultMemberPermissions(0).
	addStringOption((option) => option.setName("nickname").
		setDescription("The nickname of the player to change the password.").
		setDescriptionLocalization("pt-BR", "O apelido do jogador cuja senha será alterada.").
		setRequired(true)).
	addStringOption((option) => option.setName("new_password").
		setDescription("The new password for the player.").
		setDescriptionLocalization("pt-BR", "A nova senha para o jogador.").
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
	const newPassword = interaction.options.getString("new_password", true);

	if (!nickname) {
		await interaction.reply({
			content: "Você deve fornecer um apelido válido.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (!newPassword) {
		await interaction.reply({
			content: "Você deve fornecer uma nova senha válida.",
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

	const modPlayerId = await getDiscordUserInGamePlayerId(interaction.user.id);

	if (!modPlayerId) {
		await interaction.reply({
			content: "Não foi possível encontrar o ID do jogador associado ao seu Discord.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const privLevel = await getDiscordUserInGamePrivLevel(interaction.user.id);
	const playerPrivLevel = await getPlayerInGamePrivLevel(playerId);

	if (privLevel < 11) {
		await interaction.reply({
			content: "Você não tem permissão para usar este comando.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (privLevel < playerPrivLevel) {
		await interaction.reply({
			content: "Você não pode alterar a senha de um jogador com nível de privilégio maior que o seu.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (!DarkMiceClient.instance.connected) {
		await interaction.reply({
			content: "Não foi possível alterar a senha do jogador pois não há conexão com o servidor do DarkMice.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	DarkMiceClient.instance.sendMessage(new ChangePlayerPasswordMessage({
		modId: modPlayerId,
		playerId,
		newPassword,
	}));

	await interaction.reply({
		content: `Senha do jogador "${nickname}" alterada com sucesso.`,
		flags: MessageFlags.Ephemeral,
	});
}
