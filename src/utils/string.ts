export function parsePlayerName(playerName: string): string {
	if (playerName.startsWith("*") || playerName.startsWith("+")) {
		return playerName[0] + playerName.slice(1).toLowerCase().
			replace(/^\w/u, (c) => c.toUpperCase());
	}

	return playerName.toLowerCase().replace(/^\w/u, (c) => c.toUpperCase());
}
