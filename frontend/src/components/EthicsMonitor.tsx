import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  flagCount: number;
  totalInteractions: number;
}

export const EthicsMonitor: React.FC<Props> = ({ flagCount, totalInteractions }) => {
  const safePercent = totalInteractions > 0 
    ? ((totalInteractions - flagCount) / totalInteractions) * 100 
    : 100;

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <ShieldCheck className="text-indigo-500" /> Ethics & Compliance
      </h3>

      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="text-indigo-500 transition-all duration-1000"
              strokeDasharray={`${safePercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-slate-100">{safePercent.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-500 uppercase">Compliance</span>
          </div>
        </div>

        <div className="w-full flex justify-between px-4 py-2 bg-slate-950 rounded-lg border border-slate-800">
          <div className="text-center">
            <span className="block text-xs text-slate-500">Interventions</span>
            <span className="block text-lg font-bold text-amber-500">{flagCount}</span>
          </div>
           <div className="text-center">
            <span className="block text-xs text-slate-500">Total Queries</span>
            <span className="block text-lg font-bold text-slate-300">{totalInteractions}</span>
          </div>
        </div>

        {flagCount > 0 && (
          <div className="mt-4 flex items-start gap-2 text-left p-3 bg-amber-950/30 rounded-lg border border-amber-900/50 text-xs text-amber-400">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p>
              {flagCount} attempts to solicit direct answers were detected and neutralized by the Ethics Guard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};