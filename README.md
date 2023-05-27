<p align="center">
  <p align="center">
    <img width="100px" src="./docs/images/tiktok.png" align="center" alt="TikTok" />
    <img width="100px" src="./docs/images/openai.svg" align="center" alt="TikTok" />
  </p>
 <h2 align="center">TiktokChatGPT</h2>
 <p align="center">A conversational bot for tiktok livestreams built on ChatGPT.</p>
</p>
  <p align="center">
    <a>
      <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E"/>
    </a>
  </p>

  <p align="center">
    <a href="https://github.com/FelixWaweru/TiktokChatGPT/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/FelixWaweru/TiktokChatGPT/issues/new/choose">Request Feature</a>
  </p>
</p>

<p align="center">Love the project? Please consider <a href="https://ko-fi.com/whyweru">donating</a> to help it improve!</p>

## Getting Started
To run this code, you require an API key from ElevenLabs and OpenAI.

### ElevenLabs API Key
- Sign up [here](https://beta.elevenlabs.io/sign-up) for a free account.

### OpenAI API Key
- Sign up [here](https://platform.openai.com/signup) for a free account.

### Config
- First, add your OpenAI and ElevenLabs API keys as well as the name of the TikTok account that's livestreaming in the `.env.example` file


- Next, rename the `.env.example` file to `.env`


- Finally, to run the project, run:

```bash
mkdir audio
# then
mkdir logs
# then
npm install
# then
npm start
```

## Setup

```bash    
TiktokChatGPT
├── docs         # Documentation
│   ├── images
│   └── CONTRIBUTING.md
├── audio        # Response audio file store
│   └── example.mp3
├── logs         # Log file store
│   └── access.log
├── app.js       # Tiktok livestream responder
├── gpt.js       # OpenAI prompt and response function
├── voice.js     # ElevenLabs vocal response function
├── .env         # Credentials and environment variables
├── package.json
├── README.md
```

## Contribution
Contributions are welcome. Checkout the [CONTRIBUTING.md](https://github.com/FelixWaweru/TiktokChatGPT/tree/main/docs/CONTRIBUTING.md) to learn more.