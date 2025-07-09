import chalk from "chalk";
import { initializeDatabase } from "@/common/database/database";
import { dirname, join } from "path";
import { deployCommands, initCommands } from "@/common/manager/command";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function init (): Promise<boolean> {
	try {
		await initializeDatabase();
		await initCommands(join(__dirname, "../resources"));

		if (process.env.DEPLOY_COMMANDS?.toLowerCase() === "true") {
			await deployCommands();
		}

		return true;
	} catch (error) {
		console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("::init")}] Impossible to load common modules due to an error:\n`, error);

		return false;
	}
}
