import { sendFakeDMMessage } from "@/common/util/fake_dm";
import { MessagePayload, MessageCreateOptions } from "discord.js";

interface MessageData {
	type: "send_fake_dm";
	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions
}

export async function onSendFakeDM(message: MessageData) {
	const { discordUserId, content } = message;

	await sendFakeDMMessage(discordUserId, content);
}
