import chalk from "chalk";
import { Client, GatewayIntentBits } from "discord.js";
import { commandInteractionHandler } from "@/client/interaction/command";
import { buttonInteractionHandler } from "./interaction/button";

export class DiscordClient {
	public static readonly instance = new DiscordClient();
	private _client: Client | null = null;

	public get client(): Client | null {
		return this._client;
	}

	private constructor() {
		if (DiscordClient.instance) {
			throw new Error("DiscordClient is a singleton and cannot be instantiated multiple times. Use DiscordClient.instance instead.");
		}
	}

	async connect(): Promise<void> {
		if (this._client) {
			console.log(chalk.green("> Discord client is already connected. No need to reconnect."));

			return;
		}

		if (!process.env.DISCORD_TOKEN) {
			console.error(`${chalk.red.bold("[ERROR]")} DISCORD_TOKEN is not set in the environment variables.`);

			return;
		}

		if (!process.env.DISCORD_CLIENT_ID) {
			console.error(`${chalk.red.bold("[ERROR]")} DISCORD_CLIENT_ID is not set in the environment variables.`);

			return;
		}

		console.log(chalk.blueBright("> Initializing Discord client..."));
		this._client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers ] });

		this._client.on("ready", ({ user }) => {
			console.log(chalk.magentaBright(`> Logged in as ${chalk.yellow(user.tag)}!`));
		});

		this._client.on("interactionCreate", async (interaction) => {
			if (interaction.isChatInputCommand()) {
				await commandInteractionHandler(interaction);

				return;
			}

			if (interaction.isButton()) {
				await buttonInteractionHandler(interaction);
			}
		});

		await this._client.login(process.env.DISCORD_TOKEN);
	}
}
