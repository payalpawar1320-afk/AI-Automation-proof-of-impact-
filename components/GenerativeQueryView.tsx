'use client';

import React, { useState } from 'react';
import { AIQueryResponse, DomainType } from '@/lib/types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3,
  Cpu
} from 'lucide-react';

interface GenerativeQueryViewProps {
  currentDomain: DomainType;
}

export const GenerativeQueryView: React.FC<GenerativeQueryViewProps> = ({ currentDomain }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIQueryResponse | null>(null);

  const sampleQueries = [
    'What breaks the most this month?',
    'Which team has the best verified fix rate?',
    'Show repeating problems with Lab 3 Wi-Fi',
    'Summarize overall repair performance'
  ];

  const handleRunQuery = async (queryText: string) => {
    setQuery(queryText);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, domain: currentDomain })
      });

      if (res.ok) {
        const data: AIQueryResponse = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-black text-white">
              Ask AI Assistant: <span className="text-gradient-vibrant">Instant Insights</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Plain English Q&A
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Type any question in plain English to see what is broken, which teams are performing best, and what needs immediate attention.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center space-x-2 shadow-sm">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>AI Operations Copilot</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-700/80 space-y-3 shadow-lg">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (query.trim()) handleRunQuery(query);
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'What breaks the most this month?')..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/30 transition disabled:opacity-50 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 mr-1">Try asking:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleRunQuery(q)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-blue-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 transition shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer Output */}
      {loading ? (
        <div className="glass-card rounded-3xl p-8 border border-slate-700 text-center space-y-3 animate-pulse shadow-xl">
          <Cpu className="w-8 h-8 mx-auto text-cyan-400 animate-spin" />
          <h4 className="text-sm font-black text-white">AI is analyzing reports and verified fix logs...</h4>
          <p className="text-xs text-slate-300 font-medium">Gathering statistics, finding repeating patterns, and writing summary.</p>
        </div>
      ) : result ? (
        <div className="glass-card rounded-3xl p-6 border border-cyan-500/50 space-y-4 animate-fade-in shadow-2xl">
          {/* Main Answer */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI Answer:</span>
            </div>
            <p className="text-sm sm:text-base text-white font-bold leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              {result.answer}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Key Points */}
            {result.keyInsights && result.keyInsights.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Key Findings:</span>
                </span>
                <ul className="space-y-2 text-xs text-slate-200 font-medium">
                  {result.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Next Actions */}
            {result.suggestedActions && result.suggestedActions.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-cyan-500/40 space-y-2">
                <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Recommended Next Actions:</span>
                </span>
                <ul className="space-y-2 text-xs text-slate-200 font-medium">
                  {result.suggestedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Simple Data Distribution */}
          {result.chartData && result.chartData.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <span className="text-xs font-black text-white uppercase tracking-wider block">
                Breakdown:
              </span>
              <div className="space-y-2.5">
                {result.chartData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-cyan-400 font-mono font-black">{item.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                        style={{ width: `${Math.min(100, (item.value / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
