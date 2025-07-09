import chalk from "chalk";
import { Client } from "discord.js";
import { createConnection, Socket } from "node:net";
import { onPlayerUnlinked } from "@/server/message/player_unlinked";
import { onPlayerNameChanged } from "@/server/message/player_name_changed";
import { onSendFakeDM } from "@/server/message/send_fake_dm";
import { onSend2FACode } from "@/server/message/send_2fa_code";
import { onUpdate2FAMessage } from "@/server/message/update_2fa_message";

interface DarkMiceClient {
	connected: boolean;
	socket: Socket | null;
	discord: Client | null;
}

export const DARKMICE_CLIENT: DarkMiceClient = {
	connected: false,
	socket: null,
	discord: null,
};

export function initDarkMiceClient(discord: Client | null): void {
	if (!process.env.DARKMICE_SERVER_ADDRESS) {
		console.error(`${chalk.red.bold("[ERROR]")} DARKMICE_SERVER_ADDRESS is not set in the environment variables.`);

		return;
	}

	if (!process.env.DARKMICE_SERVER_PORT) {
		console.error(`${chalk.red.bold("[ERROR]")} DARKMICE_SERVER_PORT is not set in the environment variables.`);

		return;
	}

	if (!process.env.DARKMICE_AUTH_KEY) {
		console.error(`${chalk.red.bold("[ERROR]")} DARKMICE_AUTH_KEY is not set in the environment variables.`);

		return;
	}

	if (!discord) {
		console.error(`${chalk.red.bold("[ERROR]")} Discord client is not initialized.`);

		return;
	}

	DARKMICE_CLIENT.discord = discord;

	console.log(chalk.blueBright("> Initializing DarkMice client..."));
	DARKMICE_CLIENT.socket = createConnection({ host: process.env.DARKMICE_SERVER_ADDRESS, port: Number(process.env.DARKMICE_SERVER_PORT) }, () => {
		console.log(chalk.blueBright("> Initialized DarkMice client and connected to the server!"));

		DARKMICE_CLIENT.connected = true;
		DARKMICE_CLIENT.socket?.write(`Authorization: ${process.env.DARKMICE_AUTH_KEY}\n`);
	});

	DARKMICE_CLIENT.socket?.on("data", async (rawData) => {
		const promises: Promise<void>[] = [];

		for (const data of rawData.toString().split("\0")) {
			if (!data || data.trim() === "") {
				continue;
			}

			if (data.startsWith("<auth_success>")) {
				return;
			}

			try {
				const message = JSON.parse(data);

				if (message.type === "player_unlinked") {
					promises.push(onPlayerUnlinked(message));
				} else if (message.type === "player_name_changed") {
					promises.push(onPlayerNameChanged(message));
				} else if (message.type === "send_fake_dm") {
					promises.push(onSendFakeDM(message));
				} else if (message.type === "send_2fa_code") {
					promises.push(onSend2FACode(message));
				} else if (message.type === "update_2fa_message") {
					promises.push(onUpdate2FAMessage(message));
				}
			} catch (err) {
				console.error(chalk.red("> Failed to parse message from DarkMice server:", err, `\n\t${data.toString()}`));
			}
		}
		if (promises.length === 0) {
			console.warn(chalk.yellow("> No valid messages received from DarkMice server. Ignoring..."));

			return;
		}
		await Promise.all(promises);
	});

	DARKMICE_CLIENT.socket?.on("error", (err) => {
		console.log(chalk.red("> Error occurred in DarkMice client:", `${err.message}\n\t${err.stack}`));

		DARKMICE_CLIENT.connected = false;
		DARKMICE_CLIENT.socket = null;

		setTimeout(() => {
			reconnectDarkMiceClient();
		}, 5000);
	});

	DARKMICE_CLIENT.socket?.on("end", () => {
		console.log(chalk.yellow("> Disconnected from DarkMice server."));
		DARKMICE_CLIENT.connected = false;
		DARKMICE_CLIENT.socket = null;

		setTimeout(() => {
			reconnectDarkMiceClient();
		}, 5000);
	});
}

function reconnectDarkMiceClient(): void {
	if (DARKMICE_CLIENT.connected) {
		console.log(chalk.green("> DarkMice client is already connected. No need to reconnect."));

		return;
	}

	if (!DARKMICE_CLIENT.socket) {
		console.log(chalk.blueBright("> Reconnecting DarkMice client..."));
		initDarkMiceClient(DARKMICE_CLIENT.discord);
	}
}
