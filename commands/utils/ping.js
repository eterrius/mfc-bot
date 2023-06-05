const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.deferReply({ fetchReply: true });
        await interaction.followUp(`:mahjong: ${interaction.user} Pong!\n:stopwatch: Uptime: ${Math.round(interaction.client.uptime / 60000)} minutes\n:sparkling_heart: Websocket heartbeat: ${interaction.client.ws.ping}ms.\n:round_pushpin: Round-trip Latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};
