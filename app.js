const chat = require('./gpt.js');
const vocaliser = require('./voice.js');
const sound = require("sound-play");
const path = require("path");
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
    let lastChatActivity = Date.now();
    let liveEvents = [];

    // Create a new wrapper object and pass the username
    let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

    // Connect to the chat (await can be used as well)
    tiktokLiveConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
        console.error('Failed to connect', err);
    });

    // In this case we listen to chat messages (comments)
    tiktokLiveConnection.on('chat', data => {
        // Wait for response
        if (!speaking) {
            speaking = true;

            console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
            // Generate response
            respondingTo = data.uniqueId;
            responseGenerator(data.comment, 'chat', respondingTo).then(response => {
                // Complete response
                speaking = false;
            });

            lastChatActivity = Date.now();
        }
    });

    tiktokLiveConnection.on('gift', data => {
        // Generate response
        respondingTo = data.uniqueId;
        const statement = `${data.uniqueId} for gifting ${data.repeatCount} ${data.giftName}`
        // Wait for response
        if (!speaking) {
            speaking = true;

            if (data.giftType === 1 && data.repeatEnd) {
                console.log(`${data.uniqueId} (userId:${data.nickname}) gifted: ${data.repeatCount} x ${data.giftName}`);
                // Streak ended or non-streakable gift => process the gift with final repeat_count
                responseGenerator(statement, 'gift', respondingTo).then(response => {
                    // Complete response
                    speaking = false;
                });
            }

            lastChatActivity = Date.now();
        }
        else {
            if (data.giftType === 1 && data.repeatEnd) {
                // Streak ended or non-streakable gift => process the gift with final repeat_count
                liveEvents.push({
                    respondingTo, respondingTo,
                    statement: statement,
                    event: 'gift'
                });
            }
        }
    })

    tiktokLiveConnection.on('follow', (data) => {
        // Generate response
        respondingTo = data.uniqueId;
        const statement = `${data.uniqueId}`

        // Wait for response
        if (!speaking) {
            speaking = true;
            console.log(`${data.uniqueId} (userId:${data.uniqueId}) followed`);
            responseGenerator(statement, 'follow', respondingTo).then(response => {
                // Complete response
                speaking = false;
            });

            lastChatActivity = Date.now();
        }
        else {
            liveEvents.push({
                respondingTo: respondingTo,
                statement: statement,
                event: 'follow'
            });
        }
    });

    tiktokLiveConnection.on('emote', data => {
        // Generate response
        respondingTo = data.uniqueId;
        const statement = `${data.uniqueId}`

        // Wait for response
        if (!speaking) {
            speaking = true;
            console.log(`${data.uniqueId} (userId:${data.nickname}) emoted`);
            responseGenerator(statement, 'emote', respondingTo).then(response => {
                // Complete response
                speaking = false;
            });

            lastChatActivity = Date.now();
        }
        else {
            liveEvents.push({
                respondingTo: respondingTo,
                statement: statement,
                event: 'emote'
            });
        }
    });

    // When there is no livestream activity for more than 120 seconds
    while(Date.now() - lastChatActivity > 120000 && speaking === false){
        console.log("Stream Idle. Passing some time...");
        speaking = true;

        responseGenerator('Come up with a story or tell us something about yourself to pass the time', 'chat', 'Everyone').then(response => {
            // Complete response
            speaking = false;
        });

        lastChatActivity = Date.now();
    }

    // Stores special livestream events (gifting, follow, emote) and responds to them after the bot has finished responding to the chat
    while(liveEvents.length > 0 && speaking === false){
        console.log(`LIVE: ${liveEvents}`)
        if (!speaking) {
            speaking = true;
            liveEvents.map(async value => {
                await responseGenerator(value.statement, value.event, value.respondingTo);
            });
            liveEvents = [];
            speaking = false;
        }
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

async function responseGenerator(statement, liveEvent, respondingTo) {
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
        vocaliser(textResponse, respondingTo).then(async response => {
            console.log(`RES: ${response}`); // TODO: Await playing audio to complete before ending function
            
            const filePath = path.join(__dirname, response);
            await sound.play(filePath);
            console.log("done");
        });
    });
    // Manual delay to give bot response time
    await new Promise(resolve => setTimeout(resolve, 40000));
}

liveStream();