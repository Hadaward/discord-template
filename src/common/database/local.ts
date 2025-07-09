import Database from "better-sqlite3";

export const localStorage = new Database("darkmice.db");

interface DiscordFakeDMRow {channel_id: string;}

// Create a discord_fake_dm table if it doesn't exist
localStorage.exec(`
	CREATE TABLE IF NOT EXISTS discord_fake_dm (
		user_id TEXT NOT NULL,
		channel_id TEXT NOT NULL
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_user_channel ON discord_fake_dm (user_id, channel_id);
`);

localStorage.exec(`
	CREATE TABLE IF NOT EXISTS discord_2fa_message (
		user_id TEXT NOT NULL,
		message_id TEXT NOT NULL
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_user_channel ON discord_2fa_message (user_id, message_id);
`);

export function getFakeDMChannel(userId: string) {
	const stmt = localStorage.prepare<string, DiscordFakeDMRow>("SELECT channel_id FROM discord_fake_dm WHERE user_id = ?");
	const row = stmt.get(userId);

	if (row) {
		return row.channel_id;
	}

	return null;
}

export function getUserIdByFakeDMChannel(channelId: string) {
	const stmt = localStorage.prepare<string, { user_id: string }>("SELECT user_id FROM discord_fake_dm WHERE channel_id = ?");
	const row = stmt.get(channelId);

	if (row) {
		return row.user_id;
	}

	return null;
}

export function createFakeDMChannel(userId: string, channelId: string) {
	const stmt = localStorage.prepare("INSERT INTO discord_fake_dm (user_id, channel_id) VALUES (?, ?)");

	stmt.run(userId, channelId);
}

export function deleteFakeDMChannel(userId: string, channelId: string) {
	const stmt = localStorage.prepare("DELETE FROM discord_fake_dm WHERE user_id = ? AND channel_id = ?");

	stmt.run(userId, channelId);
}

export function get2FAMessage(userId: string) {
	const stmt = localStorage.prepare<string, { message_id: string }>("SELECT message_id FROM discord_2fa_message WHERE user_id = ?");
	const row = stmt.get(userId);

	if (row) {
		return row.message_id;
	}

	return null;
}

export function create2FAMessage(userId: string, messageId: string) {
	const stmt = localStorage.prepare("INSERT INTO discord_2fa_message (user_id, message_id) VALUES (?, ?)");

	stmt.run(userId, messageId);
}

export function delete2FAMessage(userId: string, messageId: string) {
	const stmt = localStorage.prepare("DELETE FROM discord_2fa_message WHERE user_id = ? AND message_id = ?");

	stmt.run(userId, messageId);
}
