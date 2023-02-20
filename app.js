var chat = require('./gpt.js');
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
    })

    // And here we receive gifts sent to the streamer
    tiktokLiveConnection.on('gift', data => {
        console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
    })
}

async function textResponseGenerator(comment){
    // Sentiment analysis
    var result = sentiment.analyze(comment);
    console.log(result.score);    // Score: -2, Comparative: -0.666

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

    const chatResponse = await chat(comment, conversationTone).then(r => {
        console.log("RES: ", r)
    });
}

console.log(textResponseGenerator("Are you smart or just stupid"));