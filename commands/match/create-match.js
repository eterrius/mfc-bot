const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-match')
		.setDescription('Request for a MFC match')

        // Required options
        // -- Team options
        .addUserOption(option => option
            .setName('team1player1')
            .setDescription('A player of first team to include for the match')
            .setRequired(true))
        .addUserOption(option => option
            .setName('team2player1')
            .setDescription('A player of second team to include for the match')
            .setRequired(true))

        // -- Star rating
        .addNumberOption(option => option
            .setName('starrating')
            .setDescription('Star rating of the pool')
            .setRequired(true))

        // -- Showcase
        .addBooleanOption(option => option
            .setName('showcase')
            .setDescription('Choose if you want a showcase for the pool')
            .setRequired(true))

        // Additional options

        // -- Team 1 players
        .addUserOption(option => option
            .setName('team1player2')
            .setDescription('A player of first team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team1player3')
            .setDescription('A player of first team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team1player4')
            .setDescription('A player of first team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team1player5')
            .setDescription('A player of first team to include for the match')
            .setRequired(false))

        // -- Team 2 players
        .addUserOption(option => option
            .setName('team2player2')
            .setDescription('A player of second team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team2player3')
            .setDescription('A player of second team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team2player4')
            .setDescription('A player of second team to include for the match')
            .setRequired(false))
        .addUserOption(option => option
            .setName('team2player5')
            .setDescription('A player of second team to include for the match')
            .setRequired(false))

        // -- Special requests
        .addStringOption(option => option
            .setName('specialreq')
            .setDescription('Special requests of the pool')
            .setRequired(false))

        .setDMPermission(false),
	async execute(interaction) {
        // Get team 1
        const team1 = [interaction.options.getUser('team1player1'), 
                       interaction.options.getUser('team1player2'), 
                       interaction.options.getUser('team1player3'), 
                       interaction.options.getUser('team1player4'), 
                       interaction.options.getUser('team1player5')].filter(function (name) { if (name != null) { return name; };})

        // Get team 2
        const team2 = [interaction.options.getUser('team2player1'), 
                       interaction.options.getUser('team2player2'), 
                       interaction.options.getUser('team2player3'), 
                       interaction.options.getUser('team2player4'), 
                       interaction.options.getUser('team2player5')].filter(function (name) { if (name != null) { return name; };})

        // Get star rating
        const sr = interaction.options.getNumber('starrating').toString();

        // Get showcase option
        var showcase = '';

        if (interaction.options.getBoolean('showcase') === true) {
            showcase = ':white_check_mark:';
        } else {
            showcase = ':negative_squared_cross_mark:';
        }

        // Get special requests
        let req = interaction.options.getString('specialreq');

        if (req === null) {
            req = 'None';
        }

        // something something check for duplicate users entered
        let dupes = [];

        let team1_ids = team1.map(player => player.id);
        let team2_ids = team2.map(player => player.id);

        // Get duplicates in team 1
        var dupe_id = team1_ids.filter((e, i, a) => a.indexOf(e) !== i);
        if (dupe_id.length >= 1) {
            for (id of dupe_id) {
                console.log(id, team1.find(player => player.id === id))
                dupes.push(team1.find(player => player.id === id));
            }
        }

        // Get duplicates in team 2
        var dupe_id = team2_ids.filter((e, i, a) => a.indexOf(e) !== i);
        if (dupe_id.length >= 1) {
            for (id of dupe_id) {
                console.log(id, team2.find(player => player.id === id))
                dupes.push(team2.find(player => player.id === id));
            }
        }

        // Get duplicates across teams
        for (player of team1) {
            if (team2.some(function(compare) { return compare === player; })) {
                dupe = true;
                dupes.push(player);
            }
        }

        dupes = new Set(dupes);

        let reply = ``;

        if (dupes.size > 0) {
            reply = `The same user(s) `;

            for (player of dupes) {
                reply += `\`${player.username}#${player.discriminator}\` `;
            }

            reply += `exists in multiple times! Please check your input.`;

            reply = { 
                description: reply,
                color: 0xFF3333 }

        } else {
            reply = new EmbedBuilder()
            .setColor(0x33CC33)
            .setTitle('MFC Match')
            .addFields(
                { name: 'Team 1', value: team1.join(' ') },
                { name: 'Team 2', value: team2.join(' ') },
                { name: '\u200B', value: '\u200B' },
                { name: 'Star Rating', value: sr, inline: true },
                { name: 'Showcase', value: showcase, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Special Requests', value: req })
            .setTimestamp();
        }

        await interaction.reply({ embeds: [reply] });
    },
};
