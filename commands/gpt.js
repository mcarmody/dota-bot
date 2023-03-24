const { SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

async function getInfo(query) {
  console.log("getInfo function: " + query);
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI chatbot using GPT-4." },
        { role: "user", content: query },
      ],
      max_tokens: 1024,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const assistantMessage = completion.data.choices[0].message.content.trim();

    return assistantMessage;
  } catch (error) {
    console.error(`Error while calling OpenAI API: ${error.message}`);
    return `An error occurred while processing your request. Please try again later. \nError: ${error.message}`;
  }
}

async function isAboutDota(query) {
  const aboutDotaQuery = `Is this question about Dota? (Only answer with a single word, yes or no.) "${query}"`;
  const response = await getInfo(aboutDotaQuery);

  // Check if the response from GPT-4 indicates that the question is about Dota
  return response.toLowerCase().includes("yes");
}

module.exports = {
  data: new SlashCommandBuilder()

    .setName("gpt4")
    .setDescription("Get information using GPT-4 API")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The query you want to ask GPT-4 API")
        .setRequired(true)
    ),
  async execute(interaction) {
    const botDevRole = interaction.guild.roles.cache.find(
      (role) => role.name === "Bot Dev"
    );
    if (!interaction.member.roles.cache.has(botDevRole.id)) {
      await interaction.reply({
        content:
          "You do not have the required role (Bot Dev) to use this command.",

        ephemeral: true,
      });
      return;
    }
    // Defer the reply
    await interaction.deferReply();

    const query = interaction.options.getString("query");
    const isDotaRelated = await isAboutDota(query);

    if (!isDotaRelated) {
      await interaction.reply(
        "This command only accepts questions about Dota."
      );
      return;
    }

    console.log("interaction query: " + query);

    // Call the getInfo function after deferring the reply
    const result = await getInfo(query);

    if (result) {
      await interaction.editReply(result);
    } else {
      await interaction.editReply(
        "Sorry, I could not find any information for that query."
      );
    }
  },
};