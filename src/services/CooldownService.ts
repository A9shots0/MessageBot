import { CooldownData } from '../interfaces/Cooldown';

export class CooldownService {
  private cooldowns: Map<string, number> = new Map();
  private readonly DEFAULT_COOLDOWN_HOURS = 24;

  constructor(private cooldownHours: number = 24) {}

  private getKey(userId: string, triggerId: string): string {
    return `${userId}-${triggerId}`;
  }

  isOnCooldown(userId: string, triggerId: string): boolean {
    const key = this.getKey(userId, triggerId);
    const cooldownTimestamp = this.cooldowns.get(key);
    
    if (!cooldownTimestamp) return false;
    
    const now = Date.now();
    const cooldownTime = this.cooldownHours * 60 * 60 * 1000;
    return now - cooldownTimestamp < cooldownTime;
  }

  setCooldown(userId: string, triggerId: string): void {
    const key = this.getKey(userId, triggerId);
    this.cooldowns.set(key, Date.now());
  }

  resetCooldown(userId: string, triggerId: string): boolean {
    const key = this.getKey(userId, triggerId);
    if (!this.cooldowns.has(key)) return false;
    
    this.cooldowns.delete(key);
    return true;
  }

  getAllCooldowns(): CooldownData[] {
    const cooldownArray: CooldownData[] = [];
    
    this.cooldowns.forEach((timestamp, key) => {
      const [userId, triggerId] = key.split('-');
      cooldownArray.push({ userId, triggerId, timestamp });
    });
    
    return cooldownArray;
  }
} 