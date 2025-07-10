import { BaseIncomingMessageConstructor } from "@/server/message/base";
import { recursiveReadDir } from "@/utils/filesystem";
import { access } from "fs/promises";
import { join, relative } from "path";
import chalk from "chalk";

const handlers = new Map<string, BaseIncomingMessageConstructor<unknown>>();

export async function initMessageHandlers(resourcePath: string): Promise<void> {
	handlers.clear();

	console.log(chalk.blueBright("> Loading message handlers..."));

	const handlersPath = join(resourcePath, "incoming_messages");

	try {
		await access(handlersPath);
	} catch {
		console.warn(chalk.yellow(`> Message handler directory does not exist: ${handlersPath}`));

		return;
	}

	const handlerFiles = await recursiveReadDir(handlersPath, (entry) => entry.isFile() && entry.name.endsWith(".js"));

	const importPromises = handlerFiles.map(async (file) => {
		const importPath = relative(import.meta.dirname, file).replace(/\\/gu, "/");

		try {
			const handler = await import(`${importPath}?d=${Date.now()}`) as BaseIncomingMessageConstructor<unknown>;

			if (!handler || !handler.type || !handler.prototype.handle) {
				throw new Error(`Invalid handler structure in ${importPath}`);
			}

			registerIncomingMessageHandler(handler);
		} catch (error) {
			console.error(`${chalk.bold.red("[ERROR]")} [${chalk.yellow("MessageManager.initMessageHandlers::import")}] Impossible to load handler ${chalk.blueBright(importPath)} due to an error:\n`, error);
		}
	});

	await Promise.all(importPromises);

	console.log(chalk.green(`> Loaded ${handlers.size} message handlers.`));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerIncomingMessageHandler<T extends BaseIncomingMessageConstructor<any>>(handler: T): void {
	if (!handler) {
		console.error(chalk.red("> Invalid message handler registration:"), { handler });

		return;
	}

	if (typeof handler !== "function") {
		console.error(chalk.red("> Handler must be a function:"), { handler });

		return;
	}

	// Prevent registration of abstract classes
	if (Object.getPrototypeOf(handler) === Function.prototype) {
		console.error(chalk.red("> Cannot register abstract class as handler:"), { handler });

		return;
	}

	if (handlers.has(handler.type)) {
		console.warn(chalk.yellow(`> Overriding existing handler for type: ${handler.type}`));
	}

	handlers.set(handler.type, handler);
}

export async function handleIncomingMessage(message: Record<string, unknown>): Promise<void> {
	if (!message || typeof message !== "object") {
		console.error(chalk.red("> Invalid message format received:"), message);

		return;
	}

	const { type } = message;

	if (!type || typeof type !== "string") {
		console.error(chalk.red("> Message type is missing:"), message);

		return;
	}

	const MessageHandler = handlers.get(type);

	if (!MessageHandler) {
		console.error(chalk.red("> No handler registered for message type:"), type);

		return;
	}

	try {
		await new MessageHandler(message).handle();
	} catch (error) {
		console.error(chalk.red("> Error handling incoming message:"), { error, message });
	}
}
