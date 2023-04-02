const voice = require('elevenlabs-node');
require('dotenv').config();
const apiKey = process.env.ELEVEN_API_KEY;
const voiceID = process.env.ELEVEN_VOICE_ID;

async function vocaliser(text, respondingTo) {
    const filename = `audio/${respondingTo}--${new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString()}.mp3`;

    try {
      await voice.textToSpeech(apiKey, voiceID, filename, text).then(res => {
            console.log(`Success, Audio saved as: ${filename}`);
        });

        return filename;
      } catch (error) {
        console.error(error);
      }
}

module.exports = vocaliser;