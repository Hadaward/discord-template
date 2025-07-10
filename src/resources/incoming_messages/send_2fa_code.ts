import { BaseIncomingMessage } from "@/server/message/base";
import { create2FAMessage } from "@/common/database/local";
import { getPlayerName } from "@/common/database/darkmice";
import { sendFakeDMMessage } from "@/common/util/fake_dm";

interface Payload {
	discordUserId: string;
	code: string;
}

export default class Send2FACodeMessageHandler extends BaseIncomingMessage<Payload> implements Payload {
	public static override readonly type = "send_2fa_code";

	discordUserId: string;
	code: string;

	constructor(message: Payload) {
		super(message);

		this.discordUserId = this.getRequired("discordUserId");
		this.code = this.getRequired("code");
	}

	public override async handle(): Promise<void> {
		const playerName = await getPlayerName(this.discordUserId);

		if (!playerName) {
			console.warn(`Player name not found for Discord user ID ${this.discordUserId}. Cannot send 2FA code.`);

			return;
		}

		const channelMessage = await sendFakeDMMessage(this.discordUserId, {
			content: `<@${this.discordUserId}>`,
			embeds: [
				{
					title: "🔐 Acesso à conta detectado",
					description: `Olá, **${playerName}**!
	
			Recebemos uma tentativa de acesso à sua conta do DarkMice, e um código de acesso foi solicitado.
	
			🧩 **Seu código de acesso é:**  
			\`\`\`${this.code}\`\`\`

			Se **você mesmo** solicitou esse código, basta usá-lo normalmente para acessar sua conta no jogo.
	
			⚠️ **Se NÃO foi você**, por favor ignore esta mensagem ou entre em contato com a administração imediatamente para garantir a segurança da sua conta.`,
					color: 0xFFAA00, // laranja
				},
			],
		});

		if (!channelMessage) {
			console.warn(`Failed to send 2FA code message to Discord user ID ${this.discordUserId}.`);

			return;
		}

		await create2FAMessage(this.discordUserId, channelMessage.id);
	}
}
