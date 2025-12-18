
export enum AppTab {
  EDITOR = 'editor',
  HISTORY = 'history',
  GUIDE = 'guide'
}

export enum TimerMode {
  WORK = 'work',
  SHORT_BREAK = 'short',
  LONG_BREAK = 'long',
  ESSAY_CHALLENGE = 'challenge'
}

export interface EssayFeedback {
  score: number;
  competencies: {
    label: string;
    score: number;
    comment: string;
  }[];
  generalComments: string;
  suggestions: string[];
}

export interface SavedEssay {
  id: string;
  title: string;
  content: string;
  notes: string;
  date: string;
  feedback?: EssayFeedback;
}

export interface TimerState {
  secondsRemaining: number;
  isActive: boolean;
  mode: TimerMode;
}
