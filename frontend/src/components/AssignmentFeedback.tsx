import React, { useState } from 'react';
import { AssignmentStructure, AssignmentFeedback, DepthLevel } from '../types/index.ts';
import { AssignmentRoutes } from '../services/api.ts';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface Props {
  depth: DepthLevel;
  onClose: () => void;
}

export const AssignmentFeedbackPanel: React.FC<Props> = ({ depth, onClose }) => {
  const [topic, setTopic] = useState('');
  const [assignment, setAssignment] = useState<AssignmentStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [feedback, setFeedback] = useState<AssignmentFeedback | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setFeedback(null);
    setStudentAnswer('');

    const result = await AssignmentRoutes.generate(topic, depth);
    if (result.success && result.data) {
      setAssignment(result.data);
    }
    setLoading(false);
  };

  const handleEvaluate = async () => {
    if (!assignment || !studentAnswer.trim()) return;
    setLoading(true);
    const result = await AssignmentRoutes.evaluate(assignment, studentAnswer);
    if (result.success && result.data) {
      setFeedback(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-96 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          Auto-Practice
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">Close</button>
      </div>

      {!assignment ? (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
            <label className="block text-sm font-medium text-slate-300 mb-2">Topic to Practice</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
              placeholder="e.g. Photosynthesis, React Hooks..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Generate Assignment'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
            <span className="inline-block px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold rounded-md mb-2 border border-emerald-900/50">
              {assignment.difficulty}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mb-1">{assignment.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{assignment.objective}</p>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4">
              <p className="font-medium text-slate-200">Q: {assignment.questions[0]}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Your Answer</label>
              <textarea
                className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none placeholder:text-slate-600"
                placeholder="Type your reasoning here..."
                value={studentAnswer}
                onChange={e => setStudentAnswer(e.target.value)}
              />
            </div>
          </div>

          {!feedback ? (
            <button
              onClick={handleEvaluate}
              disabled={loading || !studentAnswer}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit for Feedback'}
            </button>
          ) : (
            <div className="bg-slate-800 p-5 rounded-xl border border-indigo-900/50 shadow-md ring-1 ring-indigo-900/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-100">Evaluation</h4>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-indigo-400">{feedback.conceptualScore}</span>
                  <span className="text-sm text-slate-500">/100</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{feedback.feedback}</p>

              {feedback.misconceptions.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <AlertCircle size={12} /> Key Misconceptions
                  </h5>
                  <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    {feedback.misconceptions.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              <div className="bg-emerald-900/20 p-3 rounded-lg flex items-start gap-3 border border-emerald-900/30">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <h5 className="text-xs font-bold text-emerald-500 uppercase mb-1">Next Steps</h5>
                  <p className="text-sm text-emerald-100/80">{feedback.nextSteps}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAssignment(null);
                  setFeedback(null);
                  setTopic('');
                }}
                className="w-full mt-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1"
              >
                Try Another <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};