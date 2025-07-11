import type { DiscordCommand } from "@/common/types/command";
import { recursiveReadDir } from "@/utils/filesystem";
import { REST, Routes } from "discord.js";
import { join, relative } from "path";
import { access } from "fs/promises";
import chalk from "chalk";

const commands = new Map<string, DiscordCommand>();

export async function initCommands(resourcePath: string): Promise<void> {
	commands.clear();

	console.log(chalk.blueBright("> Loading commands..."));

	const commandsPath = join(resourcePath, "commands");

	try {
		await access(commandsPath);
	} catch {
		console.warn(chalk.yellow(`> Command directory does not exist: ${commandsPath}`));

		return;
	}

	const commandFiles = await recursiveReadDir(commandsPath, (entry) => entry.isFile() && entry.name.endsWith(".js"));

	const importPromises = commandFiles.map(async (file) => {
		const importPath = relative(import.meta.dirname, file).replace(/\\/gu, "/");

		try {
			const command = await import(`${importPath}?d=${Date.now()}`) as DiscordCommand;

			if (!command || !command.builder || !command.execute) {
				throw new Error(`Invalid command structure in ${importPath}`);
			}

			commands.set(command.builder.name, command);
		} catch (error) {
			console.error(`${chalk.bold.red("[ERROR]")} [${chalk.yellow("CommandManager.initCommands::import")}] Impossible to load command ${chalk.blueBright(importPath)} due to an error:\n`, error);
		}
	});

	await Promise.all(importPromises);

	console.log(chalk.green(`> Loaded ${commands.size} commands.`));
}

export async function deployCommands(): Promise<void> {
	if (commands.size === 0) {
		console.log(chalk.yellow("> Ignored commands deployment because there is no command to deploy."));

		return;
	}

	const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

	try {
		console.log(chalk.blueBright(`> Started refreshing ${chalk.yellow(commands.size)} application (/) commands.`));

		const data = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
			{ body: [ ...commands.values() ].map((command) => command.builder.toJSON()) },
		) as [];

		console.log(chalk.green(`> Successfully reloaded ${chalk.yellow(data.length)} application (/) commands.`));
	} catch (error) {
		console.error(`${chalk.bold.red("[ERROR]")} [${chalk.yellow("CommandManager.deployCommands")}] Impossible to deploy commands due to an error:\n`, error);
	}
}

export function getCommand(name: string): DiscordCommand | undefined {
	return commands.get(name);
}
