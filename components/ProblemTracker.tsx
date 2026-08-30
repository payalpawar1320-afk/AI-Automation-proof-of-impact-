'use client';

import React, { useState } from 'react';
import { Issue, IssueStatus, IssuePriority } from '@/lib/types';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertOctagon, 
  Wrench, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  MapPin, 
  ShieldCheck,
  RotateCcw,
  Tag
} from 'lucide-react';

interface ProblemTrackerProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onClaimResolution: (issue: Issue) => void;
  onVerifyIssue: (issue: Issue) => void;
}

export const ProblemTracker: React.FC<ProblemTrackerProps> = ({
  issues,
  onSelectIssue,
  onClaimResolution,
  onVerifyIssue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || issue.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'VERIFIED_CLOSED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Verified Fixed
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shadow-sm shadow-amber-500/20">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Needs AI Check
          </span>
        );
      case 'VERIFICATION_FAILED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            Rejected - Reopened
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/20">
            <Wrench className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            In Progress
          </span>
        );
      case 'TRIAGED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            Sorted by AI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
            Reported
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-900/90 text-rose-200 border border-rose-600 shadow-sm">Urgent</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-900/90 text-amber-200 border border-amber-600 shadow-sm">High</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-900/90 text-blue-200 border border-blue-600 shadow-sm">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">Low</span>;
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Issues', count: issues.length, activeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' },
    { id: 'PENDING_VERIFICATION', label: 'Needs AI Check', count: issues.filter(i => i.status === 'PENDING_VERIFICATION').length, activeColor: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20' },
    { id: 'VERIFICATION_FAILED', label: 'Rejected / Reopened', count: issues.filter(i => i.status === 'VERIFICATION_FAILED').length, activeColor: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20' },
    { id: 'IN_PROGRESS', label: 'In Progress', count: issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'REPORTED' || i.status === 'TRIAGED').length, activeColor: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20' },
    { id: 'VERIFIED_CLOSED', label: 'Verified Fixed', count: issues.filter(i => i.status === 'VERIFIED_CLOSED').length, activeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' },
  ];

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-slate-700/80 space-y-5 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === tab.id
                  ? `${tab.activeColor}`
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Urgency */}
        <div className="flex items-center space-x-2.5 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, rooms, roads..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            aria-label="Filter by urgency"
            className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="ALL">All Urgency</option>
            <option value="CRITICAL">Urgent Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3.5 pt-1">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
            <Layers className="w-12 h-12 mx-auto text-slate-600 mb-2.5" />
            <h3 className="text-sm font-bold text-slate-300">No issues found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing filters or click "+ Report Issue" above.</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div
              key={issue.id}
              className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-700/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-lg"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-700 shadow-sm">
                    {issue.id}
                  </span>
                  {getStatusBadge(issue.status)}
                  {getPriorityBadge(issue.priority)}

                  {issue.recurringClusterId && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700">
                      <AlertOctagon className="w-3 h-3 mr-1 text-rose-400" />
                      Repeats Often
                    </span>
                  )}

                  {issue.duplicateOfId && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700">
                      Duplicate of {issue.duplicateOfId}
                    </span>
                  )}
                </div>

                <div>
                  <h4 
                    onClick={() => onSelectIssue(issue)}
                    className="text-sm sm:text-base font-extrabold text-white hover:text-cyan-300 cursor-pointer transition leading-tight"
                  >
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-medium">
                    {issue.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                  <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{issue.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal">Item:</span> <span className="text-white font-bold">{issue.asset}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-normal">Team:</span> <span className="text-slate-200 font-bold">{issue.department}</span>
                  </div>
                </div>
              </div>

              {/* Right Action & Evidence Photos */}
              <div className="flex items-center space-x-3.5 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                {/* Photo Previews */}
                <div className="flex items-center space-x-2">
                  {issue.evidence.beforeImageUrl && (
                    <div className="relative group/thumb cursor-pointer" onClick={() => onSelectIssue(issue)}>
                      <img
                        src={issue.evidence.beforeImageUrl}
                        alt="Before"
                        className="w-12 h-12 object-cover rounded-xl border-2 border-slate-700 group-hover/thumb:border-cyan-400 transition shadow-md"
                      />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded text-[8px] font-black uppercase bg-black/90 text-rose-300 border border-rose-500/40">
                        Before
                      </span>
                    </div>
                  )}

                  {issue.evidence.afterImageUrl && (
                    <div className="relative group/thumb cursor-pointer" onClick={() => onSelectIssue(issue)}>
                      <img
                        src={issue.evidence.afterImageUrl}
                        alt="After"
                        className={`w-12 h-12 object-cover rounded-xl border-2 transition shadow-md ${
                          issue.status === 'VERIFIED_CLOSED' ? 'border-emerald-400' : 'border-amber-400'
                        }`}
                      />
                      <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded text-[8px] font-black uppercase ${
                        issue.status === 'VERIFIED_CLOSED' ? 'bg-emerald-400 text-black' : 'bg-amber-400 text-black'
                      }`}>
                        After
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                {issue.status === 'PENDING_VERIFICATION' ? (
                  <button
                    onClick={() => onVerifyIssue(issue)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 hover:from-amber-200 hover:to-yellow-300 shadow-lg shadow-amber-500/30 transition active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Check Fix with AI</span>
                  </button>
                ) : issue.status === 'IN_PROGRESS' || issue.status === 'REPORTED' || issue.status === 'TRIAGED' ? (
                  <button
                    onClick={() => onClaimResolution(issue)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Submit Fix Photo</span>
                  </button>
                ) : issue.status === 'VERIFICATION_FAILED' ? (
                  <button
                    onClick={() => onSelectIssue(issue)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 shadow-md transition active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Rejection</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectIssue(issue)}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
                  >
                    <span>View Proof</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
