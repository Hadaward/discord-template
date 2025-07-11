import chalk from "chalk";
import { createConnection, Socket } from "node:net";
import { handleIncomingMessage } from "@/common/manager/message";
import { BaseOutgoingMessage } from "./base_message";

export class DarkMiceClient {
	public static readonly instance = new DarkMiceClient();

	private _connected = false;
	private _socket: Socket | null = null;

	private _queuedMessages: BaseOutgoingMessage<unknown>[] = [];

	get connected(): boolean {
		return this._connected;
	}

	private constructor() {
		if (DarkMiceClient.instance) {
			throw new Error("DarkMiceClient is a singleton and cannot be instantiated multiple times. Use DarkMiceClient.instance instead.");
		}
	}

	public sendMessage<T>(message: BaseOutgoingMessage<T>) {
		if (!this._connected || !this._socket) {
			console.warn(chalk.yellow("> DarkMice client is not connected. Queuing message for later."));

			this._queuedMessages.push(message);

			return;
		}

		this._socket.write(message.toJSON());
	}

	connect() {
		if (this._connected) {
			console.log(chalk.green("> DarkMice client is already connected. No need to reconnect."));

			return;
		}

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

		console.log(chalk.blueBright("> Connecting to DarkMice server..."));
		this._socket = createConnection({ host: process.env.DARKMICE_SERVER_ADDRESS, port: Number(process.env.DARKMICE_SERVER_PORT) }, () => {
			console.log(chalk.blueBright("> Connected to DarkMice server!"));

			this._connected = true;
			this._socket?.write(`Authorization: ${process.env.DARKMICE_AUTH_KEY}\n`);
		});

		this._socket.on("data", async (rawData) => {
			const promises: Promise<void>[] = [];

			for (const data of rawData.toString().split("\0")) {
				if (!data || data.trim() === "") {
					continue;
				}

				if (data.startsWith("<auth_success>")) {
					for (const queuedMessage of this._queuedMessages) {
						this.sendMessage(queuedMessage);
					}
					this._queuedMessages = [];

					return;
				}

				try {
					const message = JSON.parse(data);

					promises.push(handleIncomingMessage(message));
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

		this._socket.on("error", (err) => {
			console.log(chalk.red("> Error occurred in DarkMice client:", `${err.message}\n\t${err.stack}`));

			this._connected = false;
			this._socket = null;

			setTimeout(() => {
				this.reconnect();
			}, 5000);
		});

		this._socket.on("end", () => {
			console.log(chalk.yellow("> Disconnected from DarkMice server."));
			this._connected = false;
			this._socket = null;

			setTimeout(() => {
				this.reconnect();
			}, 5000);
		});
	}

	reconnect() {
		if (this._connected) {
			console.log(chalk.green("> DarkMice client is already connected. No need to reconnect."));

			return;
		}

		if (!this._socket) {
			console.log(chalk.blueBright("> Reconnecting DarkMice client..."));
			this.connect();
		}
	}
}
