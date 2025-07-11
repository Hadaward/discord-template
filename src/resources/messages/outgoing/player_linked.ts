import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {playerId: number;}

export class PlayerLinkedMessage extends BaseOutgoingMessage<Payload> {
	public override type = "player_linked";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in PlayerLinkedMessage");
		}
	}
}
