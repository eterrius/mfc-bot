const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs')
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mfc-updates')
        .setDescription('Settings of the update channel(s) for new MFC matchmake submissions')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Adds a new channel to follow new MFC matchmake submissions')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to receive the updates')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))

        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Removes a channel that is following the MFC matchmake submissions')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to stop the updates')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)))

        .setDMPermission(false),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'add') {
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
                });
                
                await interaction.reply(`Webhook created at ${channel}!`);
    
            } catch (e) {
                await interaction.reply(`Something went wrong. Please try again.`);
                console.log(e);
            }


        } else if (subcommand === 'remove') {
            const webhooks = await channel.fetchWebhooks();

            webhooks.forEach(webhook => {
                webhook.delete();

                if (config.hasOwnProperty('webhookId')) {
                    if (webhook.id in config.webhookId) {
                        config.webhookId.pop(webhook.id);
                    }
                }
                
            });

            const jsonString = JSON.stringify(config, null, 2);

            fs.writeFileSync('./config.json', jsonString, err => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    console.log('Successfully wrote file');
                }
            });

            await interaction.reply(`All webhooks removed from ${channel}.`);
        }
    }
}