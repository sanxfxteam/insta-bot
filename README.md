# Instagram Discord Bot

This Discord bot allows users to download and post images from an Instagram profile using the `/insta` command.

## Prerequisites

- Docker
- Discord Bot Token
- Node.js (for local development)

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/instagram-discord-bot.git
   cd instagram-discord-bot
   ```

2. Create a `.env` file in the root directory with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

3. Build the Docker image:
   ```
   docker build -t instagram-discord-bot .
   ```

4. Run the Docker container:
   ```
   docker run -d --name instagram-discord-bot --env-file .env instagram-discord-bot
   ```

## Usage

In any Discord channel where the bot is present, use the following command:

```
/insta <profile>
```

Replace `<profile>` with the Instagram profile username you want to download images from.

## Development

To run the bot locally for development:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the bot:
   ```
   npm start
   ```

## Notes

- This bot uses Instaloader to download Instagram images. Make sure to comply with Instagram's terms of service and respect user privacy.
- The bot will only download public profiles or profiles that the associated Instagram account has access to.
- Video downloads are disabled by default to reduce bandwidth usage.

## License

This project is licensed under the MIT License.
```

This project creates a Discord bot that can download and post images from an Instagram profile using the `/insta` command. The bot is containerized using Docker for easy deployment.

To use this bot, you'll need to:

1. Set up a Discord application and bot account to get the Discord token.
2. Build the Docker image and run the container with the provided instructions.
3. Invite the bot to your Discord server and use the `/insta` command.

Remember to handle the Instagram data responsibly and in compliance with Instagram's terms of service.
