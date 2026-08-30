'use client';

import React from 'react';
import { Issue, DepartmentMetric, RecurringPatternCluster } from '@/lib/types';
import { 
  CheckCircle2, 
  TrendingUp, 
  AlertOctagon, 
  Clock, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface MetricsOverviewProps {
  issues: Issue[];
  departments: DepartmentMetric[];
  recurringPatterns: RecurringPatternCluster[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  issues,
  departments,
  recurringPatterns
}) => {
  const verifiedCount = issues.filter(i => i.status === 'VERIFIED_CLOSED').length;
  const pendingCount = issues.filter(i => i.status === 'PENDING_VERIFICATION').length;
  const failedCount = issues.filter(i => i.status === 'VERIFICATION_FAILED').length;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'REPORTED').length;

  const claimedTotal = verifiedCount + pendingCount + failedCount;
  const verifiedRate = claimedTotal > 0 ? Math.round((verifiedCount / claimedTotal) * 100) : 0;

  const avgImpactScore = departments.length > 0
    ? Math.round(departments.reduce((acc, d) => acc + d.impactScore, 0) / departments.length)
    : 85;

  const cards = [
    {
      title: 'Verified Fix Rate',
      value: `${verifiedRate}%`,
      subtitle: `${verifiedCount} verified of ${claimedTotal} claimed`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      tag: 'Real Fixes',
      gradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/30 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Overall Impact Score',
      value: `${avgImpactScore}/100`,
      subtitle: 'Score based on verified quality',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      tag: 'True Index',
      gradient: 'from-cyan-500/15 via-blue-500/5 to-transparent',
      border: 'border-cyan-500/30 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Waiting for AI Check',
      value: `${pendingCount}`,
      subtitle: `${inProgressCount} currently under repair`,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      tag: 'Pending Proof',
      gradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
      border: 'border-amber-500/30 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-400'
    },
    {
      title: 'Repeat Problems Found',
      value: `${recurringPatterns.length}`,
      subtitle: `${failedCount} poor patches rejected & reopened`,
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      tag: 'Root-Cause Alert',
      gradient: 'from-rose-500/15 via-pink-500/5 to-transparent',
      border: 'border-rose-500/30 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      textColor: 'text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`glass-card glass-card-hover bg-gradient-to-br ${card.gradient} rounded-3xl p-5 sm:p-6 border ${card.border} relative overflow-hidden flex flex-col justify-between shadow-xl`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-md">
              {card.icon}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${card.badge}`}>
              {card.tag}
            </span>
          </div>

          <div>
            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight block ${card.textColor}`}>
              {card.value}
            </span>
            <h3 className="text-sm font-extrabold text-white mt-1">
              {card.title}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
