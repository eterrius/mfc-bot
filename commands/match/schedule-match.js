const {
  Guild,
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const {
  SlashCommandBuilder,
  GuildScheduledEvent,
  GuildScheduledEventManager,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("schedule-match")
    .setDescription("Settings to schedule the match for a particular MFC match")
    .addStringOption((match) =>
      match
        .setName("match_id")
        .setDescription("The MFC match ID to schedule, e.g. M76")
        .setRequired(true)
    )

    .addStringOption((date) =>
      date
        .setName("date")
        .setDescription("Scheduled date for the match, in YYYY-MM-DD format")
        .setRequired(true)
    )

    .addStringOption((time) =>
      time
        .setName("time")
        .setDescription("Scheduled time for the match, in HH:MM UTC+0 format")
        .setRequired(true)
    )

    .setDMPermission(false),

  async execute(interaction) {
    const config = require("../../config.json");

    // Restrict command to member roles
    const match = await interaction.options.getString("match_id");
    const roleNames = await interaction.member.roles.cache.map(
      (role) => role.name
    );
    const roleIDs = await interaction.member.roles.cache.map((role) => role.id);

    if (roleNames.indexOf(match) !== -1) {
      const date = await interaction.options.getString("date");
      const time = await interaction.options.getString("time");

      try {
        const datetime = new Date(date + "T" + time + "Z");
        const endtime = new Date(datetime.getTime() + 60 * 60000);

        if (datetime.toString() === "Invalid Date") {
          throw new TypeError(datetime);
        } else {
          var epoch = datetime.getTime() / 1000;
          var timestamp = "<t:" + epoch + ":f>";

          reply = new EmbedBuilder()
            .setColor(0x33cc33)
            .setTitle("MFC Match " + match)
            .setDescription(
              "Please double-check the timings with staffs and your teammates/opponents before confirming. "
            )
            .addFields({ name: "Datetime", value: timestamp })
            .setTimestamp();

          // Buttons
          const submit = new ButtonBuilder()
            .setCustomId("submit")
            .setLabel("Submit")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("1055172257179258991");

          const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("1108592153455759412");

          const row = new ActionRowBuilder().addComponents(submit, cancel);

          const response = await interaction.reply({
            embeds: [reply],
            components: [row],
          });

          const collectorFilter = (i) => i.user.id === interaction.user.id;

          try {
            const confirmation = await response.awaitMessageComponent({
              filter: collectorFilter,
            });

            if (confirmation.customId === "submit") {
              const eventManager = new GuildScheduledEventManager(
                interaction.guild
              );

              // Create event on MFC match
              let event = eventManager.create({
                name: match,
                description: "team1 vs team2 (to be imported from sheet)",
                entityType: 3,
                privacyLevel: 2,
                entityMetadata: { location: "MFC Affiliate Streamer" },
                scheduledStartTime: datetime,
                scheduledEndTime: endtime,
              });

              await confirmation.update({
                content: `Submitted, processing...`,
                components: [],
              });

              await new Promise((response) => setTimeout(response, 1000)); // 1 second delay

              interaction.followUp(
                `<@&${
                  roleIDs[roleNames.indexOf(match)]
                }>, your match has been successfully scheduled to ${timestamp}. Please check the Discord Event for more information.`
              );
            } else if (confirmation.customId === "cancel") {
              await confirmation.update({
                content: "Scheduling cancelled by user, please re-schedule.",
                components: [],
              });
            }
          } catch (e) {
            console.log(e);
            await interaction.editReply({
              content: "An unexpected error occured, cancelling...",
              components: [],
            });
          }
        }
      } catch (e) {
        console.log(e);

        await interaction.reply({
          content:
            "Something went wrong. Make sure that your input fits the criteria.",
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: "Sorry, but you do not have permission to use this command.",
        ephemeral: true,
      });
    }
  },
};
