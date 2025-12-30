import React, { useEffect, useState } from 'react';
import { LayoutDashboard, LogOut, RefreshCcw } from 'lucide-react';
import { DashboardRoutes } from '../services/api.ts';
import { DashboardMetrics } from '../types/index.ts';

// Components
import { ProgressSummary } from '../components/ProgressSummary.tsx';
import { DepthAnalytics } from '../components/DepthAnalytics.tsx';
import { EthicsMonitor } from '../components/EthicsMonitor.tsx';
import { SystemHealth } from '../components/SystemHealth.tsx';

interface Props {
  onBack: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teacher' | 'institution'>('teacher');

  const fetchMetrics = async () => {
    setLoading(true);
    const result = await DashboardRoutes.getMetrics();
    if (result.success && result.data) {
      setMetrics(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">

      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg border border-indigo-500/30">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-100">StudyWithMe Dashboard</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {activeTab === 'teacher' ? 'Teacher View' : 'Institution Audit'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 p-1 rounded-lg flex text-sm font-medium border border-slate-800">
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'teacher' ? 'bg-slate-800 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Teacher
            </button>
            <button
              onClick={() => setActiveTab('institution')}
              className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'institution' ? 'bg-slate-800 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Institution
            </button>
          </div>

          <button onClick={fetchMetrics} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-400 transition-colors">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <div className="h-6 w-px bg-slate-800"></div>

          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <LogOut size={16} />
            Exit Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading || !metrics ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-slate-800 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

            {activeTab === 'teacher' && (
              <>
                <section>
                  <h2 className="text-xl font-bold text-slate-200 mb-4">Class Progress Overview</h2>
                  <ProgressSummary metrics={metrics.teacher} />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DepthAnalytics
                    distribution={metrics.institution.depthDistribution}
                    total={metrics.institution.totalInteractions}
                  />
                  <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <h3 className="text-lg font-bold text-indigo-300 mb-2">Instructor Insight</h3>
                    <p className="text-indigo-200/70 mb-4">
                      Based on recent activity, <strong>Core</strong> concepts are well understood. Consider assigning more <strong>Applied</strong> tasks to bridge the gap to Mastery.
                    </p>
                    <button className="self-start bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20">
                      Generate Applied Assignment
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'institution' && (
              <>
                <section>
                  <h2 className="text-xl font-bold text-slate-200 mb-4">System Audit</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SystemHealth
                      avgAlignment={metrics.institution.avgDepthAlignment}
                      avgClarity={metrics.institution.avgClarity}
                    />
                    <EthicsMonitor
                      flagCount={metrics.institution.ethicsFlagCount}
                      totalInteractions={metrics.institution.totalInteractions}
                    />
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-200 mb-4">Depth Compliance</h3>
                      <p className="text-sm text-slate-500 mb-4">Ensure system is not defaulting to surface-level answers.</p>
                      <DepthAnalytics
                        distribution={metrics.institution.depthDistribution}
                        total={metrics.institution.totalInteractions}
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-200 mb-2">Transparency Log</h3>
                  <p className="text-sm text-slate-500 mb-6">Recent system interventions and policy triggers.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Time</th>
                          <th className="px-4 py-3">Mode</th>
                          <th className="px-4 py-3">Depth</th>
                          <th className="px-4 py-3">Ethics Flag</th>
                          <th className="px-4 py-3 rounded-r-lg">Quality Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {[...Array(5)].map((_, i) => (
                          <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-slate-500">Just now</td>
                            <td className="px-4 py-3 font-medium text-slate-300">Learning</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold">Core</span>
                            </td>
                            <td className="px-4 py-3 text-emerald-500">Pass</td>
                            <td className="px-4 py-3 font-bold text-slate-200">0.98</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
};