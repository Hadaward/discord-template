import { sendFakeDMMessage } from "@/common/util/fake_dm";
import { BaseIncomingMessage } from "@/server/base_message";
import { MessagePayload, MessageCreateOptions } from "discord.js";

interface Payload {
	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions
}

export class MessageHandler extends BaseIncomingMessage<Payload> implements Payload {
	public static override readonly type = "send_fake_dm";

	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions;

	constructor(message: Payload) {
		super(message);

		this.discordUserId = this.getRequired("discordUserId");
		this.content = this.getRequired("content");
	}

	public override async handle(): Promise<void> {
		await sendFakeDMMessage(this.discordUserId, this.content);
	}
}
