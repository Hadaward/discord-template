import { RowDataPacket } from "mysql2/promise";

export interface DatabaseDiscordModel extends RowDataPacket {
	player_id: number;
	discord_user_id: string;
	discord_code: string;
	verified: boolean;
}

export interface DatabaseDiscordModelOnlyId extends RowDataPacket {
	player_id: number;
	discord_user_id: string;
}

export interface DatabaseDiscordModelOnlyPlayerId extends RowDataPacket {player_id: number;}

export interface DatabaseDarkMicePlayerOnlyName extends RowDataPacket {Username: string;}
