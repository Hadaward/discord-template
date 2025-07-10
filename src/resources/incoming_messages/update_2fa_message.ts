import { get2FAMessage, delete2FAMessage } from "@/common/database/local";
import { getGuildFakeDMChannel, sendFakeDMMessage } from "@/common/util/fake_dm";
import { BaseIncomingMessage } from "@/server/message/base";
import { MessagePayload, MessageCreateOptions } from "discord.js";

interface Payload {
	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions
}

export class MessageHandler extends BaseIncomingMessage<Payload> implements Payload {
	public static override readonly type = "update_2fa_message";

	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions;

	constructor(message: Payload) {
		super(message);

		this.discordUserId = this.getRequired("discordUserId");
		this.content = this.getRequired("content");
	}

	public override async handle(): Promise<void> {
		const messageId = await get2FAMessage(this.discordUserId);

		if (messageId) {
			const dmChannel = await getGuildFakeDMChannel(this.discordUserId);

			if (dmChannel) {
				const existingMessage = await dmChannel.messages.fetch(messageId).catch(() => null);

				if (existingMessage && existingMessage.editable) {
					await delete2FAMessage(this.discordUserId, messageId);
					await existingMessage.delete().catch(() => null);
				}
			}
		}

		await sendFakeDMMessage(this.discordUserId, this.content);
	}
}
