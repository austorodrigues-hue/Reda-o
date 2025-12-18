
import React, { useState, useEffect, useCallback } from 'react';
import { TimerMode } from '../types';
import { TIMER_PRESETS } from '../constants';

interface PomodoroTimerProps {
  onTimeUp?: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onTimeUp }) => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [secondsRemaining, setSecondsRemaining] = useState(TIMER_PRESETS[TimerMode.WORK]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
      if (onTimeUp) onTimeUp();
      // Play a subtle sound or alert here if desired
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, onTimeUp]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode;
    setMode(targetMode);
    setSecondsRemaining(TIMER_PRESETS[targetMode]);
    setIsActive(false);
  }, [mode]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass p-6 rounded-3xl shadow-xl flex flex-col items-center gap-6">
      <div className="flex bg-gray-100 p-1 rounded-xl w-full">
        {(Object.keys(TIMER_PRESETS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => resetTimer(m)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              mode === m ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === TimerMode.WORK && 'Pomodoro'}
            {m === TimerMode.SHORT_BREAK && 'Curta'}
            {m === TimerMode.LONG_BREAK && 'Longa'}
            {m === TimerMode.ESSAY_CHALLENGE && 'Redação'}
          </button>
        ))}
      </div>

      <div className="text-6xl font-bold font-mono tracking-tighter text-indigo-950 tabular-nums">
        {formatTime(secondsRemaining)}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-3 px-6 rounded-2xl font-semibold text-white transition-all transform active:scale-95 ${
            isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={() => resetTimer()}
          className="p-3 rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
