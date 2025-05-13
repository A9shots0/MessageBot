export type TriggerType = 'exact' | 'regex' | 'fuzzy';

export interface Trigger {
  id: string;
  pattern: string;
  type: TriggerType;
  response: string;
} 