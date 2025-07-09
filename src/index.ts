import { init } from "@/common/init";
import chalk from "chalk";
import { initDiscordClient } from "@/client/discord";
import { initDarkMiceClient } from "./server/darkmice";

const allModulesLoaded = await init();

if (allModulesLoaded) {
	const client = await initDiscordClient();

	initDarkMiceClient(client);
	console.log(chalk.green("> All common modules loaded successfully. Discord client initialized."));
} else {
	console.log(chalk.red("> All common modules need to be loaded. Exiting process."));
}
