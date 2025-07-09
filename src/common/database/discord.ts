import { getDatabase } from "@/common/database/database";
import type { DatabaseDiscordModelOnlyId } from "@/common/types/models";

export async function validateDiscordCode(code: string): Promise<boolean> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyId[]>(
		"SELECT player_id FROM discord WHERE discord_code = ? AND verified = 0",
		[ code ],
	);

	return (rows as DatabaseDiscordModelOnlyId[]).length > 0;
}

export async function isDiscordAccountLinked(discordUserId: string): Promise<boolean> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyId[]>(
		"SELECT player_id FROM discord WHERE discord_user_id = ? AND verified = 1",
		[ discordUserId ],
	);

	return (rows as DatabaseDiscordModelOnlyId[]).length > 0;
}

export async function linkDiscordAccount(discordUserId: string, code: string): Promise<void> {
	const db = getDatabase();

	await db.execute(
		"UPDATE discord SET discord_user_id = ?, verified = 1, discord_code = '' WHERE discord_code = ?",
		[ discordUserId, code ],
	);
}

export async function unlinkDiscordAccount(discordUserId: string): Promise<void> {
	const db = getDatabase();

	await db.execute(
		"UPDATE discord SET discord_user_id = '', verified = 0 WHERE discord_user_id = ?",
		[ discordUserId ],
	);
}

export async function getDiscordUserId(playerId: number): Promise<string | null> {
	const db = getDatabase();

	const [ rows ] = await db.execute<DatabaseDiscordModelOnlyId[]>(
		"SELECT discord_user_id FROM discord WHERE player_id = ? AND verified = 1",
		[ playerId ],
	);

	if (rows.length === 0) {
		return null;
	}

	return rows[0].discord_user_id;
}
