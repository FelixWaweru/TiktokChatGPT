const fs  = require("fs");
const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.ELEVEN_API_KEY;
const voice_id = process.env.ELEVEN_VOICE_ID;

async function vocaliser(text) {
    const filename = `audio/${new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString()}.mp3`;

    try {
        var voice= "https://api.elevenlabs.io/v1/text-to-speech/"+voice_id;
        let file = fs.createWriteStream(filename);
        const response = await axios({
          method: 'post',
          url: voice,
          data: {
            "text": text,
            "voice_settings": {
              "stability": 0,
              "similarity_boost": 0
            }
          },
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'stream'
        });

        response.data.pipe(file);
        file.on('finish', function() {
            file.close();  // close() is async, call cb after close completes.
        });
        console.log(`Success, Audio saved as: ${filename}`);

        return filename;
      } catch (error) {
        console.error(error);
      }
}

module.exports = vocaliser;