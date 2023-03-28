const {
  SlashCommandBuilder,
  Client,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dota")
    .setDescription("Pings all dota people")
    .addIntegerOption((option) =>
      option
        .setName("stacksize")
        .setDescription("The minimum number of people you need to play")
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption((option) =>
      option
        .setName("timeout")
        .setDescription("How long you're willing to wait - in minutes")
        .setRequired(true)
        .setMaxValue(30)
        .setMinValue(5)
    ),
  async execute(interaction) {
    let stackSize = interaction.options.getInteger("stacksize");
    let timeOutInMin = interaction.options.getInteger("timeout");
    let timeOutInMS = timeOutInMin * 60000;
    const role = interaction.guild.roles.cache.find(
      (role) => role.id === "1071259658943217745"
    );
    /*
    const reactionEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "dotes"
    );
    */
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + timeOutInMin * 60;
    const formattedStartTime = `<t:${currentTime}:F>`;
    const formattedEndTime = `<t:${endTime}:R>`;

    // just attempting to add a button that does nothing yet, adding more comments to force a deploy
    const joinButton = new ButtonBuilder()
      .setCustomId("join_dota")
      .setLabel("Test")
      .setStyle(ButtonStyle.Primary);
    //.setEmoji(reactionEmoji);

    const row = new ActionRowBuilder().addComponents(joinButton);

    const message = await interaction.reply({
      content:
        `Hello <@&${role.id}>, **${interaction.user.username}** would like to play with a **stack of ${stackSize}** ${formattedEndTime}! Please react if you'd like to be pinged when a stack forms. \n*(` +
        interaction.user.username +
        `, I have reacted for you. But not anymore cuz its a button but you don't have to click it.)*`,
      fetchReply: true,
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      ComponentType: ComponentType.Button,
      time: timeOutInMS,
    });

    let idArray = [];
    idArray.push(interaction.user.id);

    collector.on("collect", (i) => {
      if (!idArray.includes(i.user.id)) {
        idArray.push(i.user.id);
        i.reply({
          content: `Thanks for clicking! I'll notify you if/when a stack forms`,
          ephemeral: true,
        });
      } else if (i.user == interaction.user) {
        i.reply({
          content: `I told you that you didn't have to click on it, dummy.`,
          ephemeral: true,
        });
      } else if (idArray.includes(i.user.id)) {
        i.reply({
          content: `Dont' be greedy, you've already clicked once.`,
          ephemeral: true,
        });
      }
      if (idArray.length == stackSize) {
        collector.stop();
      }
    });

    collector.on("end", (collected) => {
      if (idArray.length == stackSize) {
        let replyMessage = `It's time to play!`;
        for (let i = 0; i < idArray.length; i++) {
          replyMessage = replyMessage.concat(` `, `<@${idArray[i]}>`);
        }
        message.reply(replyMessage);

        const formedTime = Math.floor(Date.now() / 1000);

        message.edit(
          `*The stack of ${stackSize} requested by ${interaction.user.username} formed <t:${formedTime}:R>.*`
        );
      } else {
        message.reply("Not enough for a stack right now. Try again later!");
        message.edit(
          `*The stack didn't form in time for ${interaction.user.username}.*`
        );
      }
    });

    /*
    message.react("👍");
    const filter = (reaction, user) => {
      return ["👍"].includes(reaction.emoji.name);
    };
    const collector = message.createReactionCollector({
      filter,
      time: timeOutInMS,
      dispose: true,
    });
    let idArray = [];
    collector.on("collect", (reaction, user) => {
      if (user != interaction.user && !idArray.includes(user.id)) {
        idArray.push(user.id);
      }
      if (idArray.length == stackSize) {
        collector.stop();
      }
    });

    collector.on("remove", (reaction, user) => {
      if (user != interaction.user) {
        index = idArray.indexOf(user.id);
        idArray.splice(index, 1);
      }
    });

    collector.on("end", (collected) => {
      idArray.shift();
      idArray.push(interaction.user.id);
      if (idArray.length == stackSize) {
        let replyMessage = `It's time to play!`;
        for (let i = 0; i < idArray.length; i++) {
          replyMessage = replyMessage.concat(` `, `<@${idArray[i]}>`);
        }
        message.reply(replyMessage);

        const formedTime = Math.floor(Date.now()/1000)

        message.edit(`*The stack of ${stackSize} requested by ${interaction.user.username} formed <t:${formedTime}:R>.*`);
      } else {
        message.reply("Not enough for a stack right now. Try again later!");
         message.edit(`*The stack didn't form in time for ${interaction.user.username}.*`);
      }
    });
    */
  },
};
