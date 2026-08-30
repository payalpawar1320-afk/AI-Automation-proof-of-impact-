'use client';

import React from 'react';
import { DepartmentMetric, DomainType } from '@/lib/types';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ShieldCheck, 
  Clock, 
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';

interface ImpactLeaderboardProps {
  departments: DepartmentMetric[];
  currentDomain: DomainType;
}

export const ImpactLeaderboard: React.FC<ImpactLeaderboardProps> = ({
  departments,
  currentDomain
}) => {
  const domainDepts = departments.filter(d => d.domain === currentDomain);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-black text-white">
              Team Scoreboard: <span className="text-gradient-vibrant">Real Fixes vs Self-Claims</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Zero Fake Closures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Ranks repair teams on verified photo proof. Teams get penalized if they mark tickets resolved with poor or incomplete temporary patches.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm">
          <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Real Score = (Verified Rate × 50%) + (Speed × 30%) + (Good Quality × 20%)</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Rank & Team</th>
                <th className="py-4 px-4 text-center">Total Jobs</th>
                <th className="py-4 px-4 text-center">Claimed vs Verified</th>
                <th className="py-4 px-4 text-center">Average Time</th>
                <th className="py-4 px-4 text-center">Verified Fix Rate</th>
                <th className="py-4 px-5 text-right">Real Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-200">
              {domainDepts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No team scores recorded yet.
                  </td>
                </tr>
              ) : (
                domainDepts.map((dept, index) => {
                  const isTop = index === 0;

                  return (
                    <tr key={dept.department} className="hover:bg-slate-800/40 transition">
                      {/* Team Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            isTop
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            #{index + 1}
                          </span>
                          <div>
                            <span className="text-sm font-extrabold text-white block">
                              {dept.department}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              On-Time SLA: {dept.slaComplianceRate}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Assigned */}
                      <td className="py-4 px-4 text-center font-bold font-mono text-white text-sm">
                        {dept.problemsAssigned}
                      </td>

                      {/* Claimed vs Verified */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2 font-mono">
                          <span className="text-slate-400">{dept.claimedResolutions} claimed</span>
                          <span className="text-slate-600 font-bold">→</span>
                          <span className="text-emerald-400 font-black">{dept.verifiedResolutions} verified</span>
                        </div>
                        {dept.failedVerifications > 0 && (
                          <span className="text-[10px] font-bold text-rose-400 block mt-0.5">
                            ({dept.failedVerifications} claims rejected)
                          </span>
                        )}
                      </td>

                      {/* Average Time */}
                      <td className="py-4 px-4 text-center font-bold text-slate-200">
                        {dept.avgResolutionDays} days
                      </td>

                      {/* Verified Rate Bar */}
                      <td className="py-4 px-4 text-center">
                        <div className="w-32 mx-auto space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">Pass:</span>
                            <span className={dept.verifiedResolutionRate >= 80 ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                              {dept.verifiedResolutionRate}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full ${
                                dept.verifiedResolutionRate >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${dept.verifiedResolutionRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Real Score */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center space-x-1.5 font-mono">
                          <span className={`text-xl font-black ${
                            dept.impactScore >= 85 ? 'text-cyan-400' : dept.impactScore >= 65 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {dept.impactScore}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-2">
          <span className="font-extrabold text-rose-300 flex items-center space-x-2 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Problem with Old Systems:</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            In standard tools (like Jira or standard city portals), workers can just click "Resolved" and walk away. Unfixed potholes or temporary tape fixes show as 100% completed.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
          <span className="font-extrabold text-emerald-300 flex items-center space-x-2 text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Proof of Impact Solution:</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            AI checks the photo proof. A problem is only marked solved when the fix is verified. Poor quality fixes are automatically sent back for rework and dock the team's score.
          </p>
        </div>
      </div>
    </div>
  );
};
