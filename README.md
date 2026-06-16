# Discord Edge TTS Bot

Free Discord text-to-speech bot using Microsoft Edge neural TTS.

Users can run:

```text
/say text:"hello world"
```

The bot joins the user's current voice channel, generates speech with Edge neural TTS, and plays it through Discord voice.

## Features

- Free Microsoft Edge neural TTS via `@andresaya/edge-tts`
- No ElevenLabs and no paid API
- Slash commands:
  - `/join`
  - `/leave`
  - `/say text:string`
  - `/voice voice:string`
  - `/voices`
  - `/stop`
- Per-server voice selection
- Per-server queued speech playback
- `ffmpeg-static` bundled for local audio transcoding

## Requirements

- Node.js 20 or newer
- A Discord application and bot token
- A test Discord server where you can invite the bot

## Discord Developer Portal Setup

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**.
3. Give it a name, then open the application.
4. Go to **Bot**.
5. Click **Reset Token** or **View Token**, then copy the token into `.env` as `DISCORD_TOKEN`.
6. Go to **OAuth2**.
7. Copy the **Client ID** into `.env` as `DISCORD_CLIENT_ID`.
8. Under **OAuth2 > URL Generator**, select these scopes:
   - `bot`
   - `applications.commands`
9. Select these bot permissions:
   - `View Channels`
   - `Send Messages`
   - `Connect`
   - `Speak`
   - `Use Voice Activity`
10. Open the generated invite URL and add the bot to your server.
11. Optional for development: enable Discord developer mode, right-click your test server, and copy the server ID into `.env` as `DISCORD_GUILD_ID`.

If `DISCORD_GUILD_ID` is set, guild commands are used so command updates appear quickly in that server. If it is blank, global commands are registered instead and work anywhere the bot is invited.

## Installation

```bash
npm install
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in:

```dotenv
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_application_client_id_here
DISCORD_GUILD_ID=
DEFAULT_VOICE=en-US-JennyNeural
```

`DISCORD_CLIENT_ID` is required to register slash commands for your Discord application. `DISCORD_GUILD_ID` is optional: leave it blank for global commands, or set it while developing for faster command updates in one test server.

## Scripts

```bash
npm run register
npm run dev
npm run build
npm run start
```

- `register`: registers slash commands globally, or in `DISCORD_GUILD_ID` when that value is set
- `dev`: runs the bot with TypeScript watch mode
- `build`: compiles TypeScript into `dist`
- `start`: runs the compiled bot from `dist`

## Voices

`/voices` lists this curated set:

- `en-US-JennyNeural`
- `en-US-AriaNeural`
- `en-US-GuyNeural`
- `en-GB-SoniaNeural`
- `pl-PL-ZofiaNeural`
- `pl-PL-MarekNeural`

The default is `en-US-JennyNeural`. You can change it with `DEFAULT_VOICE` or per server with `/voice`.

## Acceptance Test

```bash
npm install
cp .env.example .env
# Fill Discord env vars
npm run register
npm run dev
```

Then:

1. Join a Discord voice channel in a server where the bot is invited.
2. Run `/say text:"hello from edge tts"`.
3. The bot should join your voice channel and speak the text.

## Notes

- This bot uses a free, unofficial Edge TTS package. It does not require Microsoft Edge, Azure, ElevenLabs, or any paid API key.
- Do not commit `.env`; it contains your Discord bot token.
- Keep the bot token secret. If it is exposed, reset it in the Discord Developer Portal.
