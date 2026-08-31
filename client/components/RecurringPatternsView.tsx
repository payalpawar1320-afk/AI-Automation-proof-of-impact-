'use client';

import React, { useState } from 'react';
import { RecurringPatternCluster, DomainType } from '@/lib/types';
import { 
  AlertOctagon, 
  Sparkles, 
  MapPin, 
  Cpu, 
  CheckCircle2,
  Calendar,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface RecurringPatternsViewProps {
  patterns: RecurringPatternCluster[];
  currentDomain: DomainType;
  onOpenIssue: (id: string) => void;
}

export const RecurringPatternsView: React.FC<RecurringPatternsViewProps> = ({
  patterns,
  currentDomain,
  onOpenIssue
}) => {
  const [createdOrderAlert, setCreatedOrderAlert] = useState<string | null>(null);

  const domainPatterns = patterns.filter(p => p.domain === currentDomain);

  const handleCreatePreventativeOrder = (pattern: RecurringPatternCluster) => {
    setCreatedOrderAlert(`Permanent Fix Work Order sent for: ${pattern.title}. Repair team has been alerted!`);
    setTimeout(() => setCreatedOrderAlert(null), 4500);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-black text-white">
              Repeat Problem Finder & <span className="text-gradient-vibrant">Root-Cause Alerts</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Fix Once, Fix Right
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            AI finds problems that keep breaking repeatedly so your team can fix the real root cause permanently instead of applying quick surface patches.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-rose-300 flex items-center space-x-2 shadow-sm">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>{domainPatterns.length} Repeating Issues Found</span>
        </div>
      </div>

      {createdOrderAlert && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-xs font-bold text-emerald-200 flex items-center space-x-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{createdOrderAlert}</span>
        </div>
      )}

      {/* Repeating Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {domainPatterns.map(pattern => (
          <div
            key={pattern.id}
            className="glass-card glass-card-hover rounded-3xl p-5 sm:p-6 border border-slate-700/80 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-900/80 text-rose-200 border border-rose-600">
                      {pattern.severity} Urgency
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                      {pattern.patternType === 'TEMPORAL_CYCLE' ? 'Happens on Schedule' : pattern.patternType === 'WEATHER_CORRELATED' ? 'Happens in Rain' : 'Equipment Degradation'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {pattern.title}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0 bg-slate-950/90 px-3 py-1.5 rounded-2xl border border-slate-800">
                  <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                    {pattern.frequencyCount}x
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold">
                    Repeats
                  </span>
                </div>
              </div>

              {/* Location & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{pattern.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{pattern.timeframe}</span>
                </div>
              </div>

              {/* Root Cause Diagnostic */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Why it keeps breaking (AI Root Cause):</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {pattern.rootCauseHypothesis}
                </p>
              </div>

              {/* Recommended Fix */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-cyan-500/50 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Permanent Fix Recommendation:</span>
                </div>
                <p className="text-xs text-slate-100 leading-relaxed font-medium">
                  {pattern.aiRecommendation}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400 font-medium">
                Related: {pattern.issueIds.join(', ')}
              </span>

              <button
                onClick={() => handleCreatePreventativeOrder(pattern)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md transition active:scale-95"
              >
                <span>Send Work Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
