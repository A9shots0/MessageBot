import { Trigger, TriggerType } from '../interfaces/Trigger';
import fs from 'fs';
import path from 'path';

export class TriggerService {
  private triggers: Trigger[] = [];

  constructor() {
    this.loadTriggers();
  }

  private loadTriggers(): void {
    try {
      const triggerFilePath = path.join(process.cwd(), 'triggers.json');
      const triggerData = fs.readFileSync(triggerFilePath, 'utf-8');
      const { triggers } = JSON.parse(triggerData);
      this.triggers = triggers;
    } catch (error) {
      console.error('Failed to load triggers:', error);
      this.triggers = [];
    }
  }

  private saveTriggers(): void {
    try {
      const triggerFilePath = path.join(process.cwd(), 'triggers.json');
      fs.writeFileSync(
        triggerFilePath,
        JSON.stringify({ triggers: this.triggers }, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save triggers:', error);
    }
  }

  private matchExact(input: string, pattern: string): boolean {
    return input.toLowerCase() === pattern.toLowerCase();
  }

  private matchRegex(input: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(input);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return false;
    }
  }

  private matchFuzzy(input: string, pattern: string): boolean {
    // Simple fuzzy matching - check if all words in pattern appear in input
    const inputWords = input.toLowerCase().split(/\s+/);
    const patternWords = pattern.toLowerCase().split(/\s+/);
    
    return patternWords.every(word => inputWords.some(inputWord => inputWord.includes(word)));
  }

  private matchTrigger(input: string, trigger: Trigger): boolean {
    switch (trigger.type) {
      case 'exact':
        return this.matchExact(input, trigger.pattern);
      case 'regex':
        return this.matchRegex(input, trigger.pattern);
      case 'fuzzy':
        return this.matchFuzzy(input, trigger.pattern);
      default:
        return false;
    }
  }

  getMatchingTrigger(input: string): Trigger | null {
    for (const trigger of this.triggers) {
      if (this.matchTrigger(input, trigger)) {
        return trigger;
      }
    }
    return null;
  }

  getAllTriggers(): Trigger[] {
    return [...this.triggers];
  }

  addTrigger(trigger: Trigger): boolean {
    if (this.triggers.some(t => t.id === trigger.id)) {
      return false;
    }
    this.triggers.push(trigger);
    this.saveTriggers();
    return true;
  }

  removeTrigger(triggerId: string): boolean {
    const initialLength = this.triggers.length;
    this.triggers = this.triggers.filter(t => t.id !== triggerId);
    
    if (this.triggers.length !== initialLength) {
      this.saveTriggers();
      return true;
    }
    return false;
  }
} 