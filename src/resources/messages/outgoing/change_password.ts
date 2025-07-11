import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {
	modId: number;
	playerId: number;
	newPassword: string;
}

export class ChangePlayerPasswordMessage extends BaseOutgoingMessage<Payload> {
	public override type = "change_player_password";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in ChangePlayerPasswordMessage");
		}
		if (!payload.modId) {
			throw new Error("modId is required in ChangePlayerPasswordMessage");
		}
		if (typeof payload.newPassword !== "string") {
			throw new Error("newPassword must be a string in ChangePlayerPasswordMessage");
		}
	}
}
