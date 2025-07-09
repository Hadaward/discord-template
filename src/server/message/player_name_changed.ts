import { getDiscordUserId, isDiscordAccountLinked } from "@/common/database/discord";
import { DARKMICE_CLIENT } from "../darkmice";

interface MessageData {
	type: "player_name_changed";
	playerId: number;
	newPlayerName: string;
}

export async function onPlayerNameChanged(message: MessageData) {
	const { playerId, newPlayerName } = message;

	const discordUserId = await getDiscordUserId(playerId);

	if (!discordUserId) {
		console.warn(`No Discord user linked to player ID ${playerId}. Cannot update name.`);

		return;
	}

	const isLinked = await isDiscordAccountLinked(discordUserId);

	if (!isLinked) {
		console.warn(`Discord user ${discordUserId} is not linked. Cannot update name.`);

		return;
	}
	const guild = DARKMICE_CLIENT.discord?.guilds.cache.get(process.env.DISCORD_GUILD_ID || "");

	if (!guild) {
		console.warn(`Guild not found. Cannot update name for user ${discordUserId}.`);

		return;
	}
	const member = await guild.members.fetch(discordUserId).catch(() => null);

	if (!member) {
		console.warn(`Member not found in guild. Cannot update name for user ${discordUserId}.`);

		return;
	}

	try {
		await member.setNickname(newPlayerName);
		console.log(`Updated nickname for user ${discordUserId} to ${newPlayerName}.`);
	} catch (error) {
		console.error(`Failed to update nickname for user ${discordUserId}:`, error);
	}
}
