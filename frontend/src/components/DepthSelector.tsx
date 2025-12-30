import React from 'react';
import { DepthLevel } from '../../../backend/src/types/index.ts';
import { Layers, BookOpen, BrainCircuit } from 'lucide-react';

interface Props {
  currentDepth: DepthLevel;
  onChange: (depth: DepthLevel) => void;
  disabled?: boolean;
}

export const DepthSelector: React.FC<Props> = ({ currentDepth, onChange, disabled }) => {
  const options = [
    { value: DepthLevel.Core, label: 'Core', icon: Layers, desc: 'Essentials' },
    { value: DepthLevel.Applied, label: 'Applied', icon: BookOpen, desc: 'Practice' },
    { value: DepthLevel.Mastery, label: 'Mastery', icon: BrainCircuit, desc: 'Deep Dive' },
  ];

  return (
    <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-sm flex gap-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentDepth === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/50 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon size={18} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[10px] opacity-70">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
};