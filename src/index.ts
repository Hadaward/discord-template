import { DiscordClient } from "@/client/discord";
import { init } from "@/common/init";
import chalk from "chalk";

const allModulesLoaded = await init();

if (allModulesLoaded) {
	await DiscordClient.instance.connect();
	console.log(chalk.green("> All common modules loaded successfully."));
} else {
	console.log(chalk.red("> All common modules need to be loaded. Exiting process."));
}
