import { BaseOutgoingMessage } from "@/server/base_message";

interface Payload {
	modId: number;
	playerId: number;
	newNickname: string;
}

export class ChangePlayerNicknameMessage extends BaseOutgoingMessage<Payload> {
	public override type = "change_player_nickname";

	constructor(payload: Payload) {
		super(payload);

		if (!payload.playerId) {
			throw new Error("playerId is required in ChangePlayerNicknameMessage");
		}
		if (!payload.modId) {
			throw new Error("modId is required in ChangePlayerNicknameMessage");
		}
		if (typeof payload.newNickname !== "string") {
			throw new Error("newNickname must be a string in ChangePlayerNicknameMessage");
		}
	}
}
