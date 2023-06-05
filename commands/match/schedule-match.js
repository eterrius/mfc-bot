const { Guild } = require('discord.js');
const { SlashCommandBuilder, GuildScheduledEvent, GuildScheduledEventManager } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule-match')
        .setDescription('Settings to schedule the match for a particular MFC match')
        .addStringOption(match => match
            .setName('match_id')
            .setDescription('The MFC match ID to schedule, e.g. M76')
            .setRequired(true))

        .addStringOption(date => date
            .setName('date')
            .setDescription('Scheduled date for the match, in YYYY-MM-DD format')
            .setRequired(true))
            
        .addStringOption(time => time
            .setName('time')
            .setDescription('Scheduled time for the match, in HH:MM UTC+0 format')
            .setRequired(true))

        .setDMPermission(false),

    async execute(interaction) {
        const config = require('../../config.json')

        // Restrict command to member roles
        const match = await interaction.options.getString('match_id');
        const roles = await interaction.member.roles.cache.map(role => role.name);

        if (roles.indexOf(match) !== -1) {
                const date = await interaction.options.getString('date');
                const time = await interaction.options.getString('time');

                try {
                    const datetime = new Date(date + 'T' + time + 'Z');
                    const endtime = new Date(datetime.getTime() + 60*60000);

                    if (datetime.toString() === 'Invalid Date') {
                        throw new TypeError(datetime);

                    } else {
                        var epoch = datetime.getTime() / 1000;
                        await interaction.reply(`${match} scheduled at <t:${epoch}:f>`);

                        const eventManager = new GuildScheduledEventManager(interaction.guild);
                        
                        // Create event on MFC match
                        let event = await eventManager.create({
                            name: match,
                            description: 'team1 vs team2 (to be imported from sheet)',
                            entityType: 3,
                            privacyLevel: 2,
                            entityMetadata: { location: 'MFC Affiliate Streamer' },
                            scheduledStartTime: datetime,
                            scheduledEndTime: endtime
                        });
                    }

                } catch (e) {
                    console.log(e);

                    await interaction.reply({
                        content: 'Something went wrong. Make sure that your input fits the criteria.',
                        ephemeral: true
                    })
                }

                

        } else {
            await interaction.reply({
                content: 'Sorry, but you do not have permission to use this command.',
                ephemeral: true
            });
        }
    }
}