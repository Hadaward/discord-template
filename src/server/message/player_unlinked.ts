import { DARKMICE_CLIENT } from "../darkmice";
import { sendFakeDMMessage } from "@/common/util/fake_dm";

interface MessageData {
	type: "player_unlinked";
	playerId: number;
	playerName: string;
	discordUserId: string;
}

export async function onPlayerUnlinked(message: MessageData) {
	const { discordUserId } = message;

	const user = await DARKMICE_CLIENT.discord?.users.fetch(discordUserId);

	if (!user) {
		return;
	}

	const guild = DARKMICE_CLIENT.discord?.guilds.cache.get(process.env.DISCORD_GUILD_ID || "");

	if (!guild) {
		return;
	}

	const member = await guild.members.fetch(user.id).catch(() => null);

	if (!member) {
		return;
	}

	const verifiedRoleId = process.env.DISCORD_VERIFIED_ROLE_ID;

	if (verifiedRoleId && member.roles.cache.has(verifiedRoleId)) {
		await member.roles.remove(verifiedRoleId);
		try {
			await user.send({
				embeds: [
					{
						title: "❗ Conta desvinculada do DarkMice",
						description: `Olá, **${message.playerName}**!\n\nSua conta foi desvinculada do DarkMice e, por isso, você perdeu o cargo de verificado e seus benefícios no Discord.\n\nSe desejar recuperar o cargo, acesse o canal de verificação <#${process.env.DISCORD_LINKING_CHANNEL_ID}> e siga as instruções para vincular sua conta novamente usando o comando /vincular.`,
						color: 0xED4245,
					},
				],
			});
		} catch {
			await sendFakeDMMessage(user.id, {
				embeds: [
					{
						title: "❗ Conta desvinculada do DarkMice",
						description: `Olá, **${message.playerName}**!\n\nSua conta foi desvinculada do DarkMice e, por isso, você perdeu o cargo de verificado e seus benefícios no Discord.\n\nSe desejar recuperar o cargo, acesse o canal de verificação <#${process.env.DISCORD_LINKING_CHANNEL_ID}> e siga as instruções para vincular sua conta novamente usando o comando /vincular.`,
						color: 0xED4245,
					},
				],
			});
		}
	}
}
