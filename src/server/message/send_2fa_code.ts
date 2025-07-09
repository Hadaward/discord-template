import { getPlayerName } from "@/common/database/darkmice";
import { create2FAMessage } from "@/common/database/local";
import { sendFakeDMMessage } from "@/common/util/fake_dm";

interface MessageData {
	type: "send_2fa_code";
	discordUserId: string;
	code: string;
}

export async function onSend2FACode(message: MessageData) {
	const { discordUserId, code } = message;

	const playerName = await getPlayerName(discordUserId);

	if (!playerName) {
		console.warn(`Player name not found for Discord user ID ${discordUserId}. Cannot send 2FA code.`);

		return;
	}

	const channelMessage = await sendFakeDMMessage(discordUserId, {
		content: `<@${discordUserId}>`,
		embeds: [
			{
				title: "🔐 Acesso à conta detectado",
				description: `Olá, **${playerName}**!

        Recebemos uma tentativa de acesso à sua conta do DarkMice, e um código de acesso foi solicitado.

        🧩 **Seu código de acesso é:**  
        \`\`\`${code}\`\`\`

        Se **você mesmo** solicitou esse código, basta usá-lo normalmente para acessar sua conta no jogo.

        ⚠️ **Se NÃO foi você**, por favor ignore esta mensagem ou entre em contato com a administração imediatamente para garantir a segurança da sua conta.`,
				color: 0xFFAA00, // laranja
			},
		],
	});

	if (!channelMessage) {
		console.warn(`Failed to send 2FA code message to Discord user ID ${discordUserId}.`);

		return;
	}

	await create2FAMessage(discordUserId, channelMessage.id);
}
