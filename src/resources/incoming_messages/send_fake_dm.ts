import { sendFakeDMMessage } from "@/common/util/fake_dm";
import { BaseIncomingMessage } from "@/server/message/base";
import { MessagePayload, MessageCreateOptions } from "discord.js";

interface Payload {
	discordUserId: string;
	content: string | MessagePayload | MessageCreateOptions
}

export default class SendFakeDMMessageHandler extends BaseIncomingMessage<Payload> implements Payload {
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
