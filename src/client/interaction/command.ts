import { MessageFlags, type CommandInteraction } from "discord.js";
import { getCommand } from "@/common/manager/command";
import chalk from "chalk";

export async function commandInteractionHandler(interaction: CommandInteraction): Promise<void> {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const command = await getCommand(interaction.commandName);

	if (!command) {
		await interaction.reply({ content: "Este comando não existe.", flags: MessageFlags.Ephemeral });

		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		const text = "Ocorreu um erro ao executar este comando. Por favor, tente novamente mais tarde.";

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: text, flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: text, flags: MessageFlags.Ephemeral });
		}

		console.error(`${chalk.red.bold("[ERROR]")} [${chalk.yellow(`Client::Interaction::Command.commandInteractionHandler::${command.builder.name}`)}] The following error occurred while executing the command:\n`, error);
	}
}
