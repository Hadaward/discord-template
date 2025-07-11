import chalk from "chalk";
import { init } from "@/common/init";
import { DiscordClient } from "@/client/discord";
import { DarkMiceClient } from "@/server/darkmice";

const allModulesLoaded = await init();

if (allModulesLoaded) {
	await DiscordClient.instance.connect();
	DarkMiceClient.instance.connect();

	console.log(chalk.green("> All common modules loaded successfully."));
} else {
	console.log(chalk.red("> All common modules need to be loaded. Exiting process."));
}
