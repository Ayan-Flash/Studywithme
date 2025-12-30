import React from 'react';
import { TaskMode } from '../../../backend/src/types/index.ts';
import { GraduationCap, PenTool } from 'lucide-react';

interface Props {
  currentMode: TaskMode;
  onChange: (mode: TaskMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<Props> = ({ currentMode, onChange, disabled }) => {
  return (
    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
      <button
        onClick={() => onChange(TaskMode.Learning)}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          currentMode === TaskMode.Learning
            ? 'bg-slate-700 text-indigo-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <GraduationCap size={16} />
        Learning
      </button>
      <button
        onClick={() => onChange(TaskMode.Assignment)}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
          currentMode === TaskMode.Assignment
            ? 'bg-slate-700 text-amber-500 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <PenTool size={16} />
        Assignment
      </button>
    </div>
  );
};