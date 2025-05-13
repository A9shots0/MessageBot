import { Message, User, TextChannel, ThreadChannel, DiscordAPIError } from 'discord.js';
import { Trigger } from '../interfaces/Trigger';

export class ResponseService {
  private stats = {
    dmsSent: 0,
    threadsFallback: 0,
    publicReplies: 0,
    failures: 0
  };

  async sendResponse(message: Message, trigger: Trigger): Promise<boolean> {
    try {
      // Try DM first
      const dmSuccess = await this.sendDM(message.author, trigger.response);
      if (dmSuccess) {
        this.stats.dmsSent++;
        return true;
      }

      // If DM fails, try private thread
      const threadSuccess = await this.createPrivateThread(message, trigger.response);
      if (threadSuccess) {
        this.stats.threadsFallback++;
        return true;
      }

      // If both fail, send a minimal public reply
      await this.sendPublicReply(message);
      this.stats.publicReplies++;
      return true;
    } catch (error) {
      console.error('Error sending response:', error);
      this.stats.failures++;
      return false;
    }
  }

  private async sendDM(user: User, content: string): Promise<boolean> {
    try {
      await user.send(content);
      return true;
    } catch (error) {
      console.error('Failed to send DM:', error);
      return false;
    }
  }

  private async createPrivateThread(message: Message, content: string): Promise<boolean> {
    try {
      if (!(message.channel instanceof TextChannel)) {
        return false;
      }

      // Create private thread
      const thread = await message.startThread({
        name: `Help for ${message.author.username}`,
        autoArchiveDuration: 60, // 1 hour
      });

      // Add user to thread
      await thread.members.add(message.author.id);

      // Send response in thread
      await thread.send(content);
      
      return true;
    } catch (error) {
      console.error('Failed to create thread:', error);
      return false;
    }
  }

  private async sendPublicReply(message: Message): Promise<void> {
    await message.reply('I tried to send you a DM with helpful information, but it seems your DMs are closed. Please enable DMs from server members to receive help.');
  }

  getStats() {
    return { ...this.stats };
  }
} 