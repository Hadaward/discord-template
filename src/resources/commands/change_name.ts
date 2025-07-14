import { getDiscordUserInGamePrivLevel, getDiscordUserInGamePlayerId, getPlayerIdByName } from "@/common/database/darkmice";
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { isDiscordAccountLinked } from "@/common/database/discord";
import { DarkMiceClient } from "@/server/darkmice";
import { parsePlayerName } from "@/utils/string";
import { ChangePlayerNicknameMessage } from "../messages/outgoing/change_nickname";

export const builder = new SlashCommandBuilder().
	setName("change_nick").
	setNameLocalization("pt-BR", "change_name").
	setDescription("Change the nickname of a player in the DarkMice server through Discord.").
	setDescriptionLocalization("pt-BR", "Alterar o apelido de um jogador do DarkMice através do Discord.").
	setDefaultMemberPermissions(0).
	addStringOption((option) => option.setName("nickname").
		setDescription("The nickname of the player to change the nickname.").
		setDescriptionLocalization("pt-BR", "O apelido do jogador cujo apelido será alterado.").
		setRequired(true)).
	addStringOption((option) => option.setName("new_nickname").
		setDescription("The new nickname for the player.").
		setDescriptionLocalization("pt-BR", "O novo apelido para o jogador.").
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
	const newNickname = interaction.options.getString("new_nickname", true);

	if (!nickname) {
		await interaction.reply({
			content: "Você deve fornecer um apelido válido.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (!newNickname) {
		await interaction.reply({
			content: "Você deve fornecer um novo apelido válido.",
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

	if (!/^[+A-Za-z][+A-Za-z0-9_]{2,11}$/u.test(newNickname)) {
		await interaction.reply({
			content: "O novo apelido deve começar com uma letra ou sinal de mais (+), seguido por letras, números ou sublinhados, e ter entre 3 e 12 caracteres.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (await getPlayerIdByName(parsePlayerName(newNickname))) {
		await interaction.reply({
			content: `Já existe um jogador com o apelido "${newNickname}".`,
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

	if (privLevel < 11) {
		await interaction.reply({
			content: "Você não tem permissão para usar este comando.",
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

	DarkMiceClient.instance.sendMessage(new ChangePlayerNicknameMessage({
		modId: modPlayerId,
		playerId,
		newNickname,
	}));

	await interaction.reply({
		content: `Apelido do jogador "${nickname}" alterado com sucesso para "${newNickname}".`,
		flags: MessageFlags.Ephemeral,
	});
}
