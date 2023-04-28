const chat = require('./gpt.js');
const vocaliser = require('./voice.js');
const player = require('play-sound')(opts = {})
const {
    WebcastPushConnection
} = require('tiktok-live-connector');
const Sentiment = require('sentiment');
require('dotenv').config();

var sentiment = new Sentiment();
var respondingTo = '';

async function liveStream() {
    // Username of someone who is currently live
    let tiktokUsername = process.env.TIKTOK_USERNAME;
    let speaking = false;

    // Create a new wrapper object and pass the username
    let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    // Connect to the chat (await can be used as well)
    tiktokLiveConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
        console.error('Failed to connect', err);
    });

    if (!speaking) {
        // In this case we listen to chat messages (comments)
        tiktokLiveConnection.on('chat', data => {
            // Wait for response
            speaking = true;

            console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
            // Generate response
            respondingTo = data.nickname;
            responseGenerator(data.comment, 'chat').then(response => {
                // Complete response
                speaking = false;
            });
        });

        tiktokLiveConnection.on('gift', data => {
            // Wait for response
            speaking = true;

            if (data.giftType === 1 && data.repeatEnd) {
                console.log(`${data.uniqueId} (userId:${data.nickname}) gifted: ${data.repeatCount} x ${data.giftName}`);
                // Streak ended or non-streakable gift => process the gift with final repeat_count
                // Generate response
                respondingTo = data.nickname;
                const statement = `${data.nickname} by name for gifting ${data.repeatCount} ${data.giftName}`
                responseGenerator(statement, 'gift').then(response => {
                    // Complete response
                    speaking = false;
                });
            }
        })

        tiktokLiveConnection.on('follow', (data) => {
            // Wait for response
            speaking = true;

            console.log(`${data.uniqueId} (userId:${data.nickname}) followed`);
            // Generate response
            respondingTo = data.nickname;
            const statement = `${data.nickname} by name`
            responseGenerator(statement, 'follow').then(response => {
                // Complete response
                speaking = false;
            });
        });

        tiktokLiveConnection.on('emote', data => {
            // Wait for response
            speaking = true;

            console.log(`${data.uniqueId} (userId:${data.nickname}) emoted`);
            // Generate response
            respondingTo = data.nickname;
            const statement = `${data.nickname} by name`
            responseGenerator(statement, 'emote').then(response => {
                // Complete response
                speaking = false;
            });
        });
    }
}

async function textResponseGenerator(statement, liveEvent, callback) {
    // Sentiment analysis
    var result = sentiment.analyze(statement); // Score: -2, Comparative: -0.666

    // Response types
    const positive = ["funny", "witty", "empathetic", "flirty", "hillarious"];
    const neutral = ["mildly sarcastic", "neutral", "normal", "serious"];
    const negative = ["sarcastic", "very sarcastic", "angry"];

    // vary response type based on sentiment analysis
    let conversationType = {};
    let conversationTone = "";
    if (result.score >= 4) {
        conversationTone = positive[Math.floor(Math.random() * positive.length)];
    } else if (result.score >= 1 || result.score < 4) {
        conversationTone = neutral[Math.floor(Math.random() * neutral.length)];
    } else if (result.score <= 0) {
        conversationTone = negative[Math.floor(Math.random() * negative.length)];
    }

    conversationType = {
        conversationTone: conversationTone,
        liveEvent: liveEvent
    };


    await chat(statement, conversationType, function(result) {
        callback(result);
    });
}

async function responseGenerator(statement, liveEvent) {
    // Generate Text response from chatGPT
    let textResponse = "";
    await textResponseGenerator(statement, liveEvent, function(result) {
        switch (liveEvent) {
            case 'chat':
                textResponse = `${result}`;
                break;
            case 'gift':
                textResponse = `Yo! ${respondingTo}! ${result}`;
                break;
            case 'emote':
                textResponse = `Hey ${respondingTo}. ${result}`;
                break;
            case 'follow':
                textResponse = `Welcome to the club ${respondingTo}. ${result}`;
                break;
        
            default:
                break;
        }

        // Pass the response to the vocal module
        vocaliser(textResponse, respondingTo).then(response => {
            console.log(`RES: ${response}`); // TODO: Await playing audio to complete before ending function
            player.play(response, function(err) {
                if (err) {
                    console.log(`ERR: ${err}`)
                }
            });
        });
    });
}

liveStream();