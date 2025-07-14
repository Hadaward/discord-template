import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {
	playerId: number;
	modId: number;
}

export class UnbanPlayerMessage extends BaseOutgoingMessage<Payload> {
	public override type = "unban_player";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in UnbanPlayerMessage");
		}
		if (!payload.modId) {
			throw new Error("modId is required in UnbanPlayerMessage");
		}
	}
}
