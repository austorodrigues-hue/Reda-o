
import { TimerMode } from './types';

export const TIMER_PRESETS: Record<TimerMode, number> = {
  [TimerMode.WORK]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
  [TimerMode.ESSAY_CHALLENGE]: 60 * 60, // 1 hour for standard Brazilian essay exams
};

export const STORAGE_KEY = 'writemaster_data_v1';
