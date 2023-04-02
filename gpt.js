const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const basePrompt = 'You are an advanced conversational bot with a funny and charming personality and you have been placed in charge of hosting a livestream. While in charachter';

function generatePrompt(statement, conversationType) { // Conversational text input
  const inputStatement = statement[0].toUpperCase() + statement.slice(1).toLowerCase();
  // Vary response based on live event
  switch(conversationType.liveEvent) {
    case 'chat':
      return `${basePrompt}, Come up with a brief, ${conversationType.conversationTone} response to the statement ${inputStatement}`;
    case 'gift':
      return `${basePrompt}, Come up with an excited response thanking user ${inputStatement}`;
    case 'follow':
      return `${basePrompt}, Come up with an brief, unique response thanking ${inputStatement} for following you on tiktok`;
    case 'emote':
      return `${basePrompt}, Come up with an brief, unique response thanking ${inputStatement} for sharing an emote on your tiktok livestream`;
  }
}

async function chat (input, responseType, callback) {
    if (!configuration.apiKey) {
      console.log({
        error: {
          message: "OpenAI API key not configured, please follow instructions in README.md",
        }
      });
      return;
    }
  
    try {
  
      const completion = await openai.createCompletion({ // Text generation AI
        model: "text-davinci-002",
        prompt: generatePrompt(input, responseType), // Prompt that you want ai to respond to
        temperature: 0.9,
        max_tokens: 150
      });
      const response = completion.data.choices[0].text;
      callback(response);
  
    } catch(error) {
  
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        console.log(error.response.status);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        console.log({
          error: {
            message: 'An error occurred during your request.',
          }
        });
      }
  
    }
  }

module.exports = chat;
