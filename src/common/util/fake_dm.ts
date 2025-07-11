import { MessagePayload, MessageCreateOptions, ChannelType, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, Message } from "discord.js";
import { createFakeDMChannel, deleteFakeDMChannel, getFakeDMChannel } from "@/common/database/local";
import { DiscordClient } from "@/client/discord";

export async function getGuildFakeDMChannel(userId: string) {
	const dmCategoryId = process.env.DISCORD_GUILD_DM_CATEGORY_ID;

	if (!dmCategoryId) {
		console.warn("DISCORD_GUILD_DM_CATEGORY_ID não definido. Não foi possível criar canal de DM.");

		return null;
	}

	const user = await DiscordClient.instance.client?.users.fetch(userId);

	if (!user) {
		console.warn(`User with ID ${userId} not found. Cannot create DM channel.`);

		return null;
	}

	const guild = DiscordClient.instance.client?.guilds.cache.get(process.env.DISCORD_GUILD_ID || "");

	if (!guild) {
		console.warn(`Guild not found. Cannot create DM channel for user ${userId}.`);

		return null;
	}

	const dmChannelId = await getFakeDMChannel(userId);

	if (dmChannelId && guild.channels.cache.has(dmChannelId)) {
		const dmChannel = guild.channels.cache.get(dmChannelId);

		if (dmChannel && dmChannel.isTextBased()) {
			return dmChannel;
		}
	}

	return null;
}

export async function sendFakeDMMessage(userId: string, message: string | MessagePayload | MessageCreateOptions): Promise<null | Message<true>> {
	const dmCategoryId = process.env.DISCORD_GUILD_DM_CATEGORY_ID;

	if (!dmCategoryId) {
		console.warn("DISCORD_GUILD_DM_CATEGORY_ID não definido. Não foi possível criar canal de DM.");

		return null;
	}

	const user = await DiscordClient.instance.client?.users.fetch(userId);

	if (!user) {
		console.warn(`User with ID ${userId} not found. Cannot create DM channel.`);

		return null;
	}

	const guild = DiscordClient.instance.client?.guilds.cache.get(process.env.DISCORD_GUILD_ID || "");

	if (!guild) {
		console.warn(`Guild not found. Cannot create DM channel for user ${userId}.`);

		return null;
	}

	const dmChannelId = await getFakeDMChannel(userId);

	if (dmChannelId) {
		if (!guild.channels.cache.has(dmChannelId)) {
			await deleteFakeDMChannel(userId, dmChannelId);

			return null;
		}

		const dmChannel = guild.channels.cache.get(dmChannelId);

		if (dmChannel && dmChannel.isTextBased()) {
			return await dmChannel.send(message);
		} else if (dmChannel) {
			await dmChannel.delete().catch(() => null);
			await deleteFakeDMChannel(userId, dmChannelId);
			console.warn(`DM channel with ID ${dmChannelId} is not text-based. Deleting it.`);

			return null;
		}
	}

	const dmChannel = await guild.channels.create({
		name: user.username,
		type: ChannelType.GuildText,
		parent: dmCategoryId,
		permissionOverwrites: [
			{
				id: guild.roles.everyone.id,
				deny: [ PermissionFlagsBits.ViewChannel ],
			},
			{
				id: user.id,
				allow: [ PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory ],
			},
		],
	});

	await createFakeDMChannel(userId, dmChannel.id);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().
			setCustomId("delete_dm_channel").
			setLabel("Excluir canal").
			setStyle(ButtonStyle.Danger),
	);

	const sentMessage = await dmChannel.send({
		content: `<@${user.id}>`,
		embeds: [
			{
				title: "Canal de Mensagens Diretas",
				description: "Olá!\n\nSuas mensagens diretas estão bloqueadas neste servidor, então criamos este canal privado para que você possa receber mensagens do bot diretamente aqui.\n\nVocê pode excluir este canal a qualquer momento usando o botão abaixo. Este canal será removido automaticamente após 24 horas.",
				color: 0x5865F2, // Cor azul padrão do Discord
			},
		],
		components: [ row ],
	});

	const collector = sentMessage.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 24 * 60 * 60 * 1000, // 24 horas
	});

	collector.on("end", async () => {
		if (dmChannel && dmChannel.deletable) {
			if (dmChannel.deletable) {
				await dmChannel.delete().catch(() => null);
				await deleteFakeDMChannel(user.id, dmChannel.id);
			}
		}
	});

	return await dmChannel.send(message);
}
