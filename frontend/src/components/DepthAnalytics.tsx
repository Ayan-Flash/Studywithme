import React from 'react';
import { DepthLevel } from '../../../backend/src/types/index.ts';

interface Props {
  distribution: Record<DepthLevel, number>;
  total: number;
}

export const DepthAnalytics: React.FC<Props> = ({ distribution, total }) => {
  const getPercent = (count: number) => total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-200 mb-6">Learning Depth Distribution</h3>
      
      <div className="space-y-6">
        <Bar 
          label="Core (Fundamentals)" 
          percent={getPercent(distribution[DepthLevel.Core])} 
          count={distribution[DepthLevel.Core]}
          color="bg-blue-500" 
        />
        <Bar 
          label="Applied (Practice)" 
          percent={getPercent(distribution[DepthLevel.Applied])} 
          count={distribution[DepthLevel.Applied]}
          color="bg-emerald-500" 
        />
        <Bar 
          label="Mastery (Deep Dive)" 
          percent={getPercent(distribution[DepthLevel.Mastery])} 
          count={distribution[DepthLevel.Mastery]}
          color="bg-purple-500" 
        />
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          * Shows the proportion of interactions at each depth level across all sessions.
        </p>
      </div>
    </div>
  );
};

const Bar = ({ label, percent, count, color }: any) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-200">{count} ({percent.toFixed(1)}%)</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full transition-all duration-500 ${color} shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);