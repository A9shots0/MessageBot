import { Message } from 'discord.js';
import { TriggerService } from '../services/TriggerService';
import { CooldownService } from '../services/CooldownService';
import { ResponseService } from '../services/ResponseService';

export class MessageHandler {
  private ignoredChannels: string[];
  
  constructor(
    private triggerService: TriggerService,
    private cooldownService: CooldownService,
    private responseService: ResponseService
  ) {
    this.ignoredChannels = process.env.IGNORED_CHANNELS?.split(',') || [];
  }

  async handleMessage(message: Message): Promise<void> {
    // Ignore bot messages and messages from ignored channels
    if (message.author.bot || this.ignoredChannels.includes(message.channel.id)) {
      return;
    }

    // Check if message content matches any trigger
    const trigger = this.triggerService.getMatchingTrigger(message.content);
    if (!trigger) {
      return;
    }

    // Check if user is on cooldown for this trigger
    if (this.cooldownService.isOnCooldown(message.author.id, trigger.id)) {
      return;
    }

    // Set cooldown and send response
    this.cooldownService.setCooldown(message.author.id, trigger.id);
    
    // Add a small random delay to make it feel more natural (1-3 seconds)
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    await this.responseService.sendResponse(message, trigger);
  }
} 