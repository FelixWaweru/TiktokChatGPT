var chat = require('./gpt.js');
var vocaliser = require('./voice.js');
var player = require('play-sound')(opts = {})
const { WebcastPushConnection } = require('tiktok-live-connector');
var Sentiment = require('sentiment');
require('dotenv').config();

var sentiment = new Sentiment();

async function liveStream(){
    // Username of someone who is currently live
    let tiktokUsername = process.env.TIKTOK_USERNAME;

    // Create a new wrapper object and pass the username
    let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    // Connect to the chat (await can be used as well)
    tiktokLiveConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
        console.error('Failed to connect', err);
    })

    // In this case we listen to chat messages (comments)
    tiktokLiveConnection.on('chat', data => {
        console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
        // Generate response
        responseGenerator(data.comment);
    })

    // And here we receive gifts sent to the streamer
    tiktokLiveConnection.on('gift', data => {
        console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
    })
}

async function textResponseGenerator(statement, callback){
    // Sentiment analysis
    var result = sentiment.analyze(statement); // Score: -2, Comparative: -0.666

    // Response types
    const positive = ["funny", "witty", "empathetic"];
    const neutral = ["mildly sarcastic", "neutral"];
    const negative = ["sarcastic", "very sarcastic", "angry"];

    // vary response type based on sentiment analysis
    let conversationTone = "";
    if (result.score >= 4){
        conversationTone = positive[Math.floor(Math.random() * positive.length)];
    }
    else if (result.score >= 1 || result.score < 4){
        conversationTone = neutral[Math.floor(Math.random() * neutral.length)];
    }
    else if (result.score <= 0){
        conversationTone = negative[Math.floor(Math.random() * negative.length)];
    }

    await chat(statement, conversationTone, function(result){
        callback(result);
    });
}

async function responseGenerator(statement){
    // Generate Text response from chatGPT
    let textResponse = "";
    await textResponseGenerator(statement, function(result){
        textResponse = result;
    });
    
    // Pass the response to the vocal module
    vocaliser(textResponse).then(response => {
        console.log(`RES: ${response}`)
        player.play(response, function(err){
            if (err) {
                console.log(`ERR: ${err}`)
            }
          });
    });
}

responseGenerator("How is your day going")