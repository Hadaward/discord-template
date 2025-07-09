import { getDatabase } from "@/common/database/database";
import type { DatabaseDarkMicePlayerOnlyName, DatabaseDiscordModelOnlyPlayerId } from "../types/models";

export async function getPlayerName(discordUserId: string): Promise<string | null> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyPlayerId[]>(
		"SELECT player_id FROM discord WHERE discord_user_id = ? AND verified = 1",
		[ discordUserId ],
	);

	if (rows.length === 0) {
		return null;
	}

	const playerId = rows[0].player_id;
	const [ playerRows ] = await db.execute<DatabaseDarkMicePlayerOnlyName[]>(
		"SELECT Username FROM users WHERE PlayerID = ?",
		[ playerId ],
	);

	if (playerRows.length === 0) {
		return null;
	}

	return playerRows[0].Username;
}

export async function getPlayerIdByName(playerName: string): Promise<number | null> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDarkMicePlayerOnlyName[]>(
		"SELECT PlayerID FROM users WHERE Username = ?",
		[ playerName ],
	);

	if (rows.length === 0) {
		return null;
	}

	return rows[0].PlayerID;
}

export async function getDiscordUserInGamePlayerId(discordUserId: string): Promise<number | null> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyPlayerId[]>(
		"SELECT player_id FROM discord WHERE discord_user_id = ? AND verified = 1",
		[ discordUserId ],
	);

	if (rows.length === 0) {
		return null;
	}

	return rows[0].player_id;
}

export async function getPlayerInGamePrivLevel(playerId: number): Promise<number> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyPlayerId[]>(
		"SELECT PrivLevel FROM users WHERE PlayerID = ?",
		[ playerId ],
	);

	if (rows.length === 0) {
		return 1;
	}

	return rows[0].PrivLevel ?? 1;
}

export async function getDiscordUserInGamePrivLevel(discordUserId: string): Promise<number> {
	const db = getDatabase();

	const playerId = await getDiscordUserInGamePlayerId(discordUserId);

	if (playerId === null) {
		return 1;
	}

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyPlayerId[]>(
		"SELECT PrivLevel FROM users WHERE PlayerID = ?",
		[ playerId ],
	);

	if (rows.length === 0) {
		return 1;
	}

	return rows[0].PrivLevel ?? 1;
}
