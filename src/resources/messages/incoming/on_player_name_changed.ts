import { BaseIncomingMessage } from "@/server/base_message";
import { getDiscordUserId, isDiscordAccountLinked } from "@/common/database/discord";
import { DiscordClient } from "@/client/discord";

interface Payload {
	playerId: number;
	newPlayerName: string;
}

export class MessageHandler extends BaseIncomingMessage<Payload> implements Payload {
	public static override readonly type = "player_name_changed";

	playerId: number;
	newPlayerName: string;

	constructor(message: Payload) {
		super(message);

		this.playerId = this.getRequired("playerId");
		this.newPlayerName = this.getRequired("newPlayerName");
	}

	public override async handle(): Promise<void> {
		const discordUserId = await getDiscordUserId(this.playerId);

		if (!discordUserId) {
			console.warn(`No Discord user linked to player ID ${this.playerId}. Cannot update name.`);

			return;
		}

		const isLinked = await isDiscordAccountLinked(discordUserId);

		if (!isLinked) {
			console.warn(`Discord user ${discordUserId} is not linked. Cannot update name.`);

			return;
		}
		const guild = DiscordClient.instance.client?.guilds.cache.get(process.env.DISCORD_GUILD_ID || "");

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
			await member.setNickname(this.newPlayerName);
			console.log(`Updated nickname for user ${discordUserId} to ${this.newPlayerName}.`);
		} catch (error) {
			console.error(`Failed to update nickname for user ${discordUserId}:`, error);
		}
	}
}
