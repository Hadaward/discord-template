import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {
	playerId: number;
	modId: number;
	hours: number;
	reason: string;
	resetRecords: boolean;
}

export class BanPlayerMessage extends BaseOutgoingMessage<Payload> {
	public override type = "ban_player";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in BanPlayerMessage");
		}
		if (!payload.modId) {
			throw new Error("modId is required in BanPlayerMessage");
		}
		if (payload.hours <= 0) {
			throw new Error("hours must be greater than 0 in BanPlayerMessage");
		}
		if (typeof payload.reason !== "string") {
			throw new Error("reason must be a string in BanPlayerMessage");
		}
		if (typeof payload.resetRecords !== "boolean") {
			throw new Error("resetRecords must be a boolean in BanPlayerMessage");
		}
	}
}
