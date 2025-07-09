import { delete2FAMessage, get2FAMessage } from "@/common/database/local";
import { getGuildFakeDMChannel, sendFakeDMMessage } from "@/common/util/fake_dm";
import { MessagePayload, MessageCreateOptions } from "discord.js";

interface MessageData {
	type: "update_2fa_message";
	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions
}

export async function onUpdate2FAMessage(message: MessageData) {
	const { discordUserId, content } = message;

	const messageId = await get2FAMessage(discordUserId);

	if (messageId) {
		const dmChannel = await getGuildFakeDMChannel(discordUserId);

		if (dmChannel) {
			const existingMessage = await dmChannel.messages.fetch(messageId).catch(() => null);

			if (existingMessage && existingMessage.editable) {
				await delete2FAMessage(discordUserId, messageId);
				await existingMessage.delete().catch(() => null);
			}
		}
	}

	await sendFakeDMMessage(discordUserId, content);
}
