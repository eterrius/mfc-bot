const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs')
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mfc-staff-role')
        .setDescription('Settings of the accepted MFC staff roles')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Adds a new role to gain access to this bot\'s restricted commands')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to add')
                .setRequired(true)))

        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Removes a role that has access to this bot\'s restricted commands')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to remove')
                .setRequired(true)))

        .setDMPermission(false),

    async execute(interaction) {
        // Restrict command to admin roles
        if (interaction.member.permissions.has([
            PermissionsBitField.Flags.Administrator, 
            PermissionsBitField.Flags.AddReactions, 
            PermissionsBitField.Flags.ManageGuild])) {

                const role = interaction.options.getRole('role');
                const subcommand = interaction.options.getSubcommand();
                
                if (subcommand === 'add') {
                    if (config.hasOwnProperty('roleId')) {
                        config.roleId.push(role.id);
                    } else {
                        config.roleId = [role.id];
                    }

                    const jsonString = JSON.stringify(config, null, 2);

                    fs.writeFileSync('./config.json', jsonString, err => {
                        if (err) {
                            console.log('Error writing file', err);
                        } else {
                            console.log('Successfully wrote file');
                        }
                    });
            
                    try {
                        await interaction.reply(`<@&${role.id}> has been successfully added.`);
            
                    } catch (e) {
                        await interaction.reply(`Something went wrong. Please try again.`);
                        console.log(e);
                    }

                } else if (subcommand === 'remove') {
                    const guildRoles = await interaction.guild.roles.fetch();

                    guildRoles.forEach(role => {
                        if (config.hasOwnProperty('roleId')) {
                            if (config.roleId.indexOf(role.id) !== -1) {
                                config.roleId = config.roleId.filter(id => id !== role.id);
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

                    await interaction.reply(`<@&${role.id}> removed from the admin list.`);
                }

        } else {
            await interaction.reply({
                content: 'Sorry, but you do not have permission to use this command.',
                ephemeral: true
            });
        }
    }
}