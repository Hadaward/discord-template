import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeDatabase } from "@/common/database/database";
import { initMessageHandlers } from "@/common/manager/message";
import { deployCommands, initCommands } from "@/common/manager/command";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const RESOURCES_PATH = join(__dirname, "../resources");
export const INCOMING_MESSAGES_PATH = join(RESOURCES_PATH, "incoming_messages");

export async function init (): Promise<boolean> {
	try {
		await initializeDatabase();
		await initCommands(RESOURCES_PATH);
		await initMessageHandlers(INCOMING_MESSAGES_PATH);

		if (process.env.DEPLOY_COMMANDS?.toLowerCase() === "true") {
			await deployCommands();
		}

		return true;
	} catch (error) {
		console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow("::init")}] Impossible to load common modules due to an error:\n`, error);

		return false;
	}
}
