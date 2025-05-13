import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { TriggerService } from './services/TriggerService';
import { CooldownService } from './services/CooldownService';
import { ResponseService } from './services/ResponseService';
import { MessageHandler } from './handlers/MessageHandler';
import { CommandHandler } from './handlers/CommandHandler';

// Load environment variables
dotenv.config();

// Initialize Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel, // Required for DM
    Partials.Message
  ]
});

// Initialize services
const triggerService = new TriggerService();
const cooldownService = new CooldownService();
const responseService = new ResponseService();

// Initialize handlers
const messageHandler = new MessageHandler(triggerService, cooldownService, responseService);
const commandHandler = new CommandHandler(client, triggerService, cooldownService, responseService);

// Log when client is ready
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot logged in as ${readyClient.user.tag}`);
  
  // Deploy slash commands
  // const guildId = process.env.GUILD_ID;
  // if (guildId) {
  //   commandHandler.deployCommands(readyClient.user.id, guildId);
  // } else {
  //   console.warn('GUILD_ID not provided in environment variables. Slash commands will not be deployed.');
  // }
});

// Handle incoming messages
client.on(Events.MessageCreate, async (message) => {
  await messageHandler.handleMessage(message);
});

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await commandHandler.handleInteraction(interaction);
  }
});

// Handle errors
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

// Login with the bot token
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN not found in environment variables');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
}); 