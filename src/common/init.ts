import { deployCommands, initCommands } from "@/common/manager/command";
import chalk from "chalk";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const RESOURCES_PATH = join(__dirname, "../resources");

export async function init(): Promise<boolean> {
	try {
		await initCommands(RESOURCES_PATH);

		if (process.env.DEPLOY_COMMANDS?.toLowerCase() === "true") {
			await deployCommands();
		}

		return true;
	} catch (error) {
		console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("::init")}] Impossible to load common modules due to an error:\n`, error);

		return false;
	}
}
