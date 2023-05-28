const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs')
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mfc-updates')
        .setDescription('Sets the update channel for new MFC submissions')

        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to receive the updates')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        
        .setDMPermission(false),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const webhook = await channel.createWebhook({
            name: 'MFC Updates'
        });

        const embed = new EmbedBuilder()
            .setTitle('First message')
            .setDescription(`If you're seeing this message, that means that the webhook has been successfully setup! `);

        try {
            await webhook.send({
                embeds: [embed]
            });

            await interaction.reply(`Webhook created at ${channel}!`);

            const id = webhook.id;

            if (config.hasOwnProperty('webhookId')) {
                config.webhookId.push(id);
            } else {
                config.webhookId = [id];
            }
            
            const jsonString = JSON.stringify(config, null, 2);
            fs.writeFileSync('./config.json', jsonString, err => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    console.log('Successfully wrote file');
                }
            })

        } catch (e) {
            await interaction.reply(`Something went wrong. Please try again.`);
            console.log(e);
        }
        
    }
}