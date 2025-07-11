import { isDiscordAccountLinked, linkDiscordAccount, unlinkDiscordAccount, validateDiscordCode } from "@/common/database/discord";
import { type ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getDiscordUserInGamePlayerId, getPlayerName } from "@/common/database/darkmice";
import { DarkMiceClient } from "@/server/darkmice";
import { PlayerLinkedMessage } from "@/resources/messages/outgoing/player_linked";

export const builder = new SlashCommandBuilder().
	setName("vincular").
	setDescription("Link your DarkMice account to Discord.").
	setDescriptionLocalization("pt-BR", "Vincular sua conta do DarkMice ao Discord.").
	setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands).
	addStringOption((option) => option.setName("code").
		setDescription("Your DarkMice linking code.").
		setDescriptionLocalization("pt-BR", "Seu código de vinculação do DarkMice.").
		setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	console.log("teste do reload");

	if (interaction.channelId !== process.env.DISCORD_LINKING_CHANNEL_ID) {
		await interaction.reply({
			content: `Este comando só pode ser usado no canal <#${process.env.DISCORD_LINKING_CHANNEL_ID}>.`,
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	if (await isDiscordAccountLinked(interaction.user.id)) {
		await interaction.reply({
			content: "Sua conta do Discord já está vinculada a uma conta do DarkMice.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const code = interaction.options.getString("code", true);

	if (!code) {
		await interaction.reply({
			content: "Você deve fornecer um código de vinculação válido.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	const isValid = await validateDiscordCode(code);

	if (!isValid) {
		await interaction.reply({
			content: "Você forneceu um código de vinculação inválido ou já utilizado.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	await linkDiscordAccount(interaction.user.id, code);

	const playerName = await getPlayerName(interaction.user.id);

	if (!playerName) {
		await unlinkDiscordAccount(interaction.user.id);

		await interaction.reply({
			content: "Não foi possível encontrar o nome do jogador vinculado ao seu Discord.",
			flags: MessageFlags.Ephemeral,
		});

		return;
	}

	try {
		const { guild } = interaction;
		const verifiedRoleId = process.env.DISCORD_VERIFIED_ROLE_ID;

		if (guild && verifiedRoleId) {
			const member = await guild.members.fetch(interaction.user.id);

			if (member && !member.roles.cache.has(verifiedRoleId)) {
				await member.roles.add(verifiedRoleId);
			}

			try {
				await member.setNickname(playerName);
			} catch {}
		}
	} catch (error) {
		await unlinkDiscordAccount(interaction.user.id);

		await interaction.reply({
			content: "Erro ao adicionar cargo de verificação. Por favor, entre em contato com o suporte.",
			flags: MessageFlags.Ephemeral,
		});

		console.error("Erro ao adicionar cargo de verificação ao usuário:", error);

		return;
	}

	await interaction.reply({
		content: `🎉 Parabéns, ${playerName}! Sua conta do DarkMice foi vinculada ao Discord com sucesso.
🏆 Para resgatar suas recompensas, digite o comando /discord novamente no chat do jogo.
⚠️ Lembre-se: as recompensas são concedidas apenas na primeira vinculação da conta. Novos vínculos não garantem prêmios adicionais.`,
		flags: MessageFlags.Ephemeral,
	});

	const playerId = await getDiscordUserInGamePlayerId(interaction.user.id);

	if (playerId === null) {
		console.error(`Não foi possível encontrar o ID do jogador vinculado ao Discord user ID ${interaction.user.id}.`);

		return;
	}
	DarkMiceClient.instance.sendMessage(new PlayerLinkedMessage({ playerId }));
}
