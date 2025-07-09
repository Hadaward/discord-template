import chalk from "chalk";
import { Client, GatewayIntentBits } from "discord.js";
import { commandInteractionHandler } from "@/client/interaction/command";
import { buttonInteractionHandler } from "./interaction/button";

export async function initDiscordClient(): Promise<Client | null> {
	if (!process.env.DISCORD_TOKEN) {
		console.error(`${chalk.red.bold("[ERROR]")} DISCORD_TOKEN is not set in the environment variables.`);

		return null;
	}

	if (!process.env.DISCORD_CLIENT_ID) {
		console.error(`${chalk.red.bold("[ERROR]")} DISCORD_CLIENT_ID is not set in the environment variables.`);

		return null;
	}

	console.log(chalk.blueBright("> Initializing Discord client..."));
	const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers ] });

	client.on("ready", ({ user }) => {
		console.log(chalk.magentaBright(`> Logged in as ${chalk.yellow(user.tag)}!`));
	});

	client.on("interactionCreate", async (interaction) => {
		if (interaction.isChatInputCommand()) {
			await commandInteractionHandler(interaction);

			return;
		}

		if (interaction.isButton()) {
			await buttonInteractionHandler(interaction);
		}
	});

	await client.login(process.env.DISCORD_TOKEN);

	return client;
}
