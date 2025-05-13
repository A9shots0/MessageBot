import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js'; // Client is needed for CommandHandler
import { CommandHandler } from './handlers/CommandHandler';
import { TriggerService } from './services/TriggerService';
import { CooldownService } from './services/CooldownService';
import { ResponseService } from './services/ResponseService';

dotenv.config();

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID; // Make sure CLIENT_ID is in your .env file
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error(
    'Error: BOT_TOKEN, CLIENT_ID, and GUILD_ID must be provided in environment variables.'
  );
  process.exit(1);
}

// Instantiate a minimal client
// CommandHandler expects a Client instance, but for deployment, it doesn't need to connect.
const client = new Client({
  intents: [], // No intents needed for command deployment
});

// Instantiate services
// These are needed for CommandHandler constructor. 
// Assuming they can be instantiated without complex dependencies for command registration.
const triggerService = new TriggerService();
const cooldownService = new CooldownService();
const responseService = new ResponseService();

// Instantiate CommandHandler
const commandHandler = new CommandHandler(
  client,
  triggerService,
  cooldownService,
  responseService
);

(async () => {
  try {
    console.log('Attempting to deploy commands...');
    // Call the existing deployCommands method from CommandHandler
    // This method already contains the REST and Routes logic.
    await commandHandler.deployCommands(clientId!, guildId!); // Using non-null assertion as we check them above
    console.log('Commands deployed successfully by CommandHandler.');
  } catch (error) {
    console.error('Error during command deployment process:', error);
  }
})(); 