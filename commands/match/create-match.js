const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, WebhookClient } = require('discord.js');
const config = require('../../config.json')

module.exports = {
    cooldown: 10,
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

        // -- Pool size
        .addStringOption(option => option
            .setName('poolsize')
            .setDescription('Pool size; Specify pool structure if custom')
            .setAutocomplete(true)
            .setRequired(true)
        )

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

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices;

        if (focusedOption.name === 'poolsize') {
            choices = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Finals', 'Grandfinals'];
        }

        const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value));

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        )
    }, 

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

        // Get pool size
        const poolsize = interaction.options.getString('poolsize');

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
                dupes.push(team1.find(player => player.id === id));
            }
        }

        // Get duplicates in team 2
        var dupe_id = team2_ids.filter((e, i, a) => a.indexOf(e) !== i);
        if (dupe_id.length >= 1) {
            for (id of dupe_id) {
                dupes.push(team2.find(player => player.id === id));
            }
        }

        // Get duplicates across teams
        for (player of team1) {
            if (team2.some(function(compare) { return compare === player; })) {
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

            await interaction.reply({ embeds: [reply] })

        } else {
            reply = new EmbedBuilder()
            .setColor(0x33CC33)
            .setTitle('MFC Match')
            .addFields(
                { name: 'Team 1', value: team1.join(' ') },
                { name: 'Team 2', value: team2.join(' ') },
                { name: '\u200B', value: '\u200B' },
                { name: 'Pool Size', value: poolsize, inline: true },
                { name: 'Star Rating', value: sr, inline: true },
                { name: 'Showcase', value: showcase, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Special Requests', value: req })
            .setTimestamp();

            // Buttons
            const submit = new ButtonBuilder()
            .setCustomId('submit')
            .setLabel('Submit')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('1055172257179258991');

            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1108592153455759412');

            const row = new ActionRowBuilder()
                .addComponents(submit, cancel);

            response = await interaction.reply({ embeds: [reply], components: [row] });

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                if (confirmation.customId === 'submit') {
                    // Role creation for queue
                    var newRole;

                    await interaction.guild.roles.create({
                        name: 'MFC Queue',
                        color: 0x693333,
                        reason: 'New queue for matchmake'
                    })
                    .then(role => newRole = role)
                    .catch(err => console.log(err));

                    for (member of team1) {
                        member.roles.add(newRole);
                    }

                    for (member of team2) {
                        member.roles.add(newRole);
                    }

                    await confirmation.update({ content: `Submitted, processing...`, components: [] });

                    await interaction.followUp({ content: `<@&${newRole.id}>, your match request is currently being reviewed. 
        Please note that you will be pinged on futher updates such as whether the match is created or not.`});

                    // Webhook followup
                    var { webhookId } = require('../../config.json');

                    var message = await response.fetch();

                    const adminRoles = config.roleId;
                    let content = ``;

                    for (var role of adminRoles) {
                        content += `<@&${role}>`;
                    }
                    
                    for (var id of webhookId) {
                        var webhook = await interaction.guild.client.fetchWebhook(id);

                        const embed = new EmbedBuilder()
                            .setTitle('New MFC Submission')
                            .setDescription(`A new potential match has been made! Please review it from the message link below.`)
                            .addFields(
                                { name: 'Message', value: `https://discord.com/channels/@me/${message.channelId}/${message.id}` }
                            );

                        webhook.send({
                            content: content,
                            embeds: [embed]
                        })
                    };

                } else if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: 'Matchmake cancelled', components: [] });
                }
                
            } catch (e) {
                console.log(e);
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling...', components: [] });
            }
        }  
    },
};
