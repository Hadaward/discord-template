import { commandInteractionHandler } from "@/client/interaction/command";
import { buttonInteractionHandler } from "@/client/interaction/button";
import { Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import chalk from "chalk";

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
		this._client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages, 
            	GatewayIntentBits.MessageContent 
			]
		});

		this._client.on("ready", ({ user }) => {
			console.log(chalk.magentaBright(`> Logged in as ${chalk.yellow(user.tag)}!`));
		});

		this._client.on("error", (error) => {
			console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("DiscordClient.onError")}] An error occurred:\n`, error);
		});

		this._client.on("messageCreate", async (message) => {
			if (message.author.bot) return; // Ignore messages from bots

			if (message.channelId === process.env.DISCORD_LINKING_CHANNEL_ID) {
				const embed = new EmbedBuilder()
					.setColor(0xffcc00)
					.setTitle("Atenção!")
					.setDescription(
						"Por favor, evite enviar mensagens neste canal de verificação.\n\n" +
						"Se precisar de suporte, crie um ticket no canal de tickets.\n\n" +
						"Para vincular sua conta do DarkMice ao Discord, utilize o comando `/vincular`.\n" +
						"Esse comando já está registrado no servidor do Discord."
					);
				
				const msg = await message.reply({ embeds: [embed] });

				msg.createMessageComponentCollector({ time: 8000 }).on("end", async () => {
					try {
						await msg.delete();
					} catch (error) {
						console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("DiscordClient.onMessageCreate")}] Failed to delete message:\n`, error);
					}
				});

				await message.delete().catch(() => null);
			}
		});

		this._client.on("interactionCreate", async (interaction) => {
			try {
				if (interaction.isChatInputCommand()) {
					await commandInteractionHandler(interaction);

					return;
				}

				if (interaction.isButton()) {
					await buttonInteractionHandler(interaction);
				}
			} catch (error) {
				console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("DiscordClient.onInteractionCreate")}] An error occurred while handling an interaction:\n`, error);
			}
		});

		await this._client.login(process.env.DISCORD_TOKEN);
	}
}
