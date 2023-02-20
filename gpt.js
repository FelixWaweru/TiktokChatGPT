const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generatePrompt(statement, conversationTone) { // Conversational text input
  const inputStatement =
    statement[0].toUpperCase() + statement.slice(1).toLowerCase();
  return `Come up with a brief, ${conversationTone} response to the statement ${inputStatement}`;
}

async function chat (input, responseType) {
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
        temperature: 0.6,
      });
      const response = completion.data.choices[0].text;
      return response;
  
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
