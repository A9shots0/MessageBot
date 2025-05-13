import { Client, ChatInputCommandInteraction, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { TriggerService } from '../services/TriggerService';
import { CooldownService } from '../services/CooldownService';
import { ResponseService } from '../services/ResponseService';
import { Trigger, TriggerType } from '../interfaces/Trigger';

export class CommandHandler {
  private commands: any[] = []; 
  
  constructor(
    private client: Client,
    private triggerService: TriggerService,
    private cooldownService: CooldownService,
    private responseService: ResponseService
  ) {
    this.registerCommands();
  }

  private registerCommands(): void {
    // Add trigger command
    const addTriggerCommand = new SlashCommandBuilder()
      .setName('trigger')
      .setDescription('Manage trigger phrases')
      .addSubcommand(subcommand =>
        subcommand
          .setName('add')
          .setDescription('Add a new trigger phrase')
          .addStringOption(option => 
            option.setName('id')
              .setDescription('Unique identifier for the trigger')
              .setRequired(true))
          .addStringOption(option => 
            option.setName('pattern')
              .setDescription('The pattern to match messages against')
              .setRequired(true))
          .addStringOption(option => 
            option.setName('type')
              .setDescription('Type of matching to use')
              .setRequired(true)
              .addChoices(
                { name: 'Exact match', value: 'exact' },
                { name: 'Regex pattern', value: 'regex' },
                { name: 'Fuzzy match', value: 'fuzzy' }
              ))
          .addStringOption(option => 
            option.setName('response')
              .setDescription('The response message to send')
              .setRequired(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('remove')
          .setDescription('Remove a trigger phrase')
          .addStringOption(option => 
            option.setName('id')
              .setDescription('ID of the trigger to remove')
              .setRequired(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setDescription('List all triggers')
      );

    // Cooldown reset command
    const cooldownCommand = new SlashCommandBuilder()
      .setName('cooldown')
      .setDescription('Reset the cooldown for a user')
      .addSubcommand(subcommand =>
        subcommand
          .setName('reset')
          .setDescription('Reset a user\'s cooldown for a specific trigger')
          .addUserOption(option => 
            option.setName('user')
              .setDescription('The user to reset cooldown for')
              .setRequired(true))
          .addStringOption(option => 
            option.setName('trigger_id')
              .setDescription('ID of the trigger to reset')
              .setRequired(true))
      );

    // Stats command
    const statsCommand = new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Display bot statistics');

    this.commands = [
      addTriggerCommand,
      cooldownCommand,
      statsCommand
    ];
  }

  async deployCommands(clientId: string, guildId: string): Promise<void> {
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN || '');
      
      console.log('Started refreshing application (/) commands.');
      
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: this.commands.map(command => command.toJSON()) }
      );
      
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error deploying commands:', error);
    }
  }

  async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    try {
      if (commandName === 'trigger') {
        const subcommand = options.getSubcommand();
        
        if (subcommand === 'add') {
          await this.handleTriggerAdd(interaction);
        } else if (subcommand === 'remove') {
          await this.handleTriggerRemove(interaction);
        } else if (subcommand === 'list') {
          await this.handleTriggerList(interaction);
        }
      } else if (commandName === 'cooldown') {
        const subcommand = options.getSubcommand();
        
        if (subcommand === 'reset') {
          await this.handleCooldownReset(interaction);
        }
      } else if (commandName === 'stats') {
        await this.handleStats(interaction);
      }
    } catch (error) {
      console.error('Error handling command:', error);
      
      // Reply with error if interaction hasn't been responded to
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: 'There was an error executing this command!', 
          ephemeral: true 
        });
      }
    }
  }

  private async handleTriggerAdd(interaction: ChatInputCommandInteraction): Promise<void> {
    const id = interaction.options.getString('id', true);
    const pattern = interaction.options.getString('pattern', true);
    const type = interaction.options.getString('type', true) as TriggerType;
    const response = interaction.options.getString('response', true);

    const newTrigger: Trigger = {
      id,
      pattern,
      type,
      response
    };

    const success = this.triggerService.addTrigger(newTrigger);

    if (success) {
      await interaction.reply({ 
        content: `Trigger \`${id}\` added successfully!`, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: `Failed to add trigger. A trigger with ID \`${id}\` already exists.`, 
        ephemeral: true 
      });
    }
  }

  private async handleTriggerRemove(interaction: ChatInputCommandInteraction): Promise<void> {
    const id = interaction.options.getString('id', true);
    
    const success = this.triggerService.removeTrigger(id);

    if (success) {
      await interaction.reply({ 
        content: `Trigger \`${id}\` removed successfully!`, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: `Failed to remove trigger. No trigger with ID \`${id}\` found.`, 
        ephemeral: true 
      });
    }
  }

  private async handleTriggerList(interaction: ChatInputCommandInteraction): Promise<void> {
    const triggers = this.triggerService.getAllTriggers();
    
    if (triggers.length === 0) {
      await interaction.reply({ 
        content: 'No triggers are currently configured.', 
        ephemeral: true 
      });
      return;
    }

    const triggerList = triggers.map(trigger => 
      `**ID:** \`${trigger.id}\`, **Type:** \`${trigger.type}\`, **Pattern:** \`${trigger.pattern}\``
    ).join('\n');

    await interaction.reply({ 
      content: `**Available Triggers:**\n${triggerList}`, 
      ephemeral: true 
    });
  }

  private async handleCooldownReset(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user', true);
    const triggerId = interaction.options.getString('trigger_id', true);
    
    const success = this.cooldownService.resetCooldown(user.id, triggerId);

    if (success) {
      await interaction.reply({ 
        content: `Cooldown reset for user ${user.username} on trigger \`${triggerId}\`.`, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: `No active cooldown found for user ${user.username} on trigger \`${triggerId}\`.`, 
        ephemeral: true 
      });
    }
  }

  private async handleStats(interaction: ChatInputCommandInteraction): Promise<void> {
    const responseStats = this.responseService.getStats();
    
    const statsMessage = [
      `**Bot Statistics:**`,
      `DMs sent: ${responseStats.dmsSent}`,
      `Thread fallbacks: ${responseStats.threadsFallback}`,
      `Public replies: ${responseStats.publicReplies}`,
      `Failures: ${responseStats.failures}`,
      `Total triggers: ${this.triggerService.getAllTriggers().length}`
    ].join('\n');

    await interaction.reply({ 
      content: statsMessage, 
      ephemeral: true 
    });
  }
} 