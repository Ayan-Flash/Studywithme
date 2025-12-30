import React from 'react';
import { Activity, Zap } from 'lucide-react';

interface Props {
  avgAlignment: number;
  avgClarity: number;
}

export const SystemHealth: React.FC<Props> = ({ avgAlignment, avgClarity }) => {
  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Activity size={120} />
      </div>
      
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Zap className="text-yellow-400" /> System Health
      </h3>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-300">Depth Alignment Score</span>
            <span className="font-bold text-emerald-400">{(avgAlignment * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${avgAlignment * 100}%` }}></div>
          </div>
        </div>

        <div>
           <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-300">Response Clarity Index</span>
            <span className="font-bold text-blue-400">{(avgClarity * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${avgClarity * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-500">
        Metrics computed real-time via internal rule-based evaluation.
      </div>
    </div>
  );
};