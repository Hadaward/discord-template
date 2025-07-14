import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {playerId: number;}

export class ReloadGameMessage extends BaseOutgoingMessage<Payload> {
	public override type = "reload_game";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in ReloadGameMessage");
		}
	}
}
