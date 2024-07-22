# Instagram Discord Bot

This Discord bot allows users to download and post images from an Instagram profile using the `/insta` command. The bot uses Instaloader to fetch images and is deployed as a Docker container.

## Features

* **Image Download:** Download images from Instagram profiles using the `/insta <profile>` command.
* **Image Posting:** Automatically posts downloaded images to the channel where the command was issued.
* **Daily Updates:** The bot remembers requested profiles and automatically fetches the latest images daily at 7 AM PST.

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

2. Create a `.env` file in the root directory with your Discord bot token and client ID:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_application_client_id_here
   ```

3. Build the Docker image:
   ```
   docker build -t instagram-discord-bot .
   ```

4. Run the Docker container:
   ```
   docker run -d --name instagram-discord-bot --env-file .env instagram-discord-bot
   ```

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application or select an existing one.
3. Go to the "Bot" section and create a bot if you haven't already.
4. Copy the bot token and add it to your `.env` file.
5. Go to the "OAuth2" section, then "URL Generator".
6. Select the following scopes:
   - bot
   - applications.commands
7. Select the following bot permissions:
   - Send Messages
   - Attach Files
   - Use Slash Commands
8. Copy the generated URL and use it to invite the bot to your server.

## Registering Slash Commands

After setting up the bot, you need to register the slash commands:

1. Install dependencies locally:
   ```
   npm install
   ```

2. Run the command registration script:
   ```
   npm run register-commands
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

## Troubleshooting

If you encounter any issues:

1. Check the console logs for detailed error messages.
2. Ensure the bot has the necessary permissions in your Discord server.
3. Verify that your `.env` file contains the correct Discord token and client ID.
4. Make sure Instaloader is properly installed in the Docker container.

## Notes

- This bot uses Instaloader to download Instagram images. Make sure to comply with Instagram's terms of service and respect user privacy.
- The bot will only download public profiles or profiles that the associated Instagram account has access to.
- Video downloads are disabled by default to reduce bandwidth usage.
- The bot splits long Instaloader outputs into multiple messages to comply with Discord's message length limits.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This bot is for educational purposes only. Use responsibly and respect Instagram's terms of service and user privacy.
