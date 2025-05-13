# Discord Solution Bot

A Discord bot that monitors public channels for trigger phrases and automatically responds by sending helpful information through direct messages (DMs), private threads, or public replies.

## Features

- 🔍 **Smart Trigger Detection**: 
  - Monitors messages for specific phrases
  - Supports three matching types:
    - Exact match (case-insensitive)
    - Regex patterns with word boundaries
    - Fuzzy matching for flexible detection
- ⏱️ **Cooldown System**: 
  - Prevents spam by limiting responses
  - Default 24-hour cooldown per trigger/user
  - Admins can reset cooldowns manually
- 📨 **Intelligent Response Delivery**: 
  - Primary: Attempts to send via DM
  - Fallback 1: Creates a private thread
  - Fallback 2: Replies in the public channel
- 🛠️ **Slash Commands**: 
  - `/trigger add` - Create new triggers
  - `/trigger remove` - Delete existing triggers
  - `/trigger list` - View all triggers
  - `/cooldown reset` - Reset user cooldowns
  - `/stats` - View usage statistics
- 📊 **Performance Tracking**: 
  - Monitors successful/failed deliveries
  - Tracks DMs, threads, and public replies
  - Reports statistics via command

## Prerequisites

1. Node.js 16.9.0 or higher
2. npm (comes with Node.js)
3. A Discord account
4. Permission to add bots to a Discord server

## Bot Setup

### 1. Discord Application Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name your bot
3. Go to the "Bot" section
   - Click "Add Bot"
   - Under "Privileged Gateway Intents", enable:
     - Message Content Intent
     - Server Members Intent
     - Presence Intent
4. Save your bot token (you'll need this later)
5. Go to OAuth2 > URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions:
     - Send Messages
     - Create Public Threads
     - Create Private Threads
     - Send Messages in Threads
     - Manage Messages
     - Read Message History
6. Use the generated URL to invite the bot to your server

### 2. Local Setup
1. Clone this repository:
   ```bash
   git clone [repository-url]
   cd messagebot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_discord_bot_token
   GUILD_ID=your_discord_server_id
   CLIENT_ID=your_bot_client_id
   ```
   - `BOT_TOKEN`: From the Bot section in Developer Portal
   - `GUILD_ID`: Right-click your server > Copy Server ID
   - `CLIENT_ID`: Your Application ID from General Information

4. Build the project:
   ```bash
   npm run build
   ```

5. Deploy slash commands:
   ```bash
   npm run deploy-commands
   ```

6. Start the bot:
   ```bash
   npm start
   ```

For development, use:
```bash
npm run dev
```

## Trigger Configuration

Triggers are stored in `triggers.json`. Example structure:

```json
{
  "triggers": [
    {
      "id": "help",
      "pattern": "\\b(help|need help|how|where|what)\\b",
      "type": "regex",
      "response": "Hey there! 👋 Here's some help information..."
    }
  ]
}
```

### Trigger Types
1. **Exact**: Matches the exact phrase (case-insensitive)
   ```json
   {
     "type": "exact",
     "pattern": "hello"
   }
   ```

2. **Regex**: Uses regular expressions with word boundaries
   ```json
   {
     "type": "regex",
     "pattern": "\\b(help|support)\\b"
   }
   ```

3. **Fuzzy**: Matches if all words in the pattern appear in the message
   ```json
   {
     "type": "fuzzy",
     "pattern": "how install"
   }
   ```

## Command Usage

### Managing Triggers
- Add a trigger:
  ```
  /trigger add id:welcome pattern:"welcome" type:exact response:"Welcome to the server!"
  ```
- Remove a trigger:
  ```
  /trigger remove id:welcome
  ```
- List all triggers:
  ```
  /trigger list
  ```

### Managing Cooldowns
- Reset a user's cooldown:
  ```
  /cooldown reset user:@username trigger_id:welcome
  ```

### Viewing Statistics
- Check bot performance:
  ```
  /stats
  ```

## Troubleshooting

1. **Bot Not Responding**
   - Verify bot is online in Discord
   - Check if all intents are enabled
   - Ensure bot has correct permissions
   - Verify trigger patterns are correct

2. **Commands Not Working**
   - Run `npm run deploy-commands` again
   - Check if CLIENT_ID is correct in .env
   - Verify bot has applications.commands scope

3. **DMs Not Being Sent**
   - Check if users have DMs enabled
   - Verify bot has permission to send DMs
   - Look for errors in bot console

## License

ISC 