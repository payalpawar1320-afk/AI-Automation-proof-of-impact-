'use client';

import React, { useState, useEffect } from 'react';
import { DomainType, Issue, DepartmentMetric, RecurringPatternCluster } from '@/lib/types';
import { getApiUrl } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { PipelineStepper } from '@/components/PipelineStepper';
import { MetricsOverview } from '@/components/MetricsOverview';
import { ProblemTracker } from '@/components/ProblemTracker';
import { RecurringPatternsView } from '@/components/RecurringPatternsView';
import { ImpactLeaderboard } from '@/components/ImpactLeaderboard';
import { GenerativeQueryView } from '@/components/GenerativeQueryView';
import { NewReportModal } from '@/components/NewReportModal';
import { IssueDetailModal } from '@/components/IssueDetailModal';
import { 
  Layers, 
  Repeat, 
  Award, 
  Bot, 
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const [currentDomain, setCurrentDomain] = useState<DomainType>('campus');
  const [activeTab, setActiveTab] = useState<'tracker' | 'patterns' | 'leaderboard' | 'query'>('tracker');
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPatternCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, deptsRes, patternsRes] = await Promise.all([
        fetch(getApiUrl(`/api/issues?domain=${currentDomain}`)),
        fetch(getApiUrl(`/api/analytics/departments?domain=${currentDomain}`)),
        fetch(getApiUrl(`/api/ai/patterns?domain=${currentDomain}`))
      ]);

      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        setIssues(issuesData.issues || []);
      }
      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData.departments || []);
      }
      if (patternsRes.ok) {
        const patternsData = await patternsRes.json();
        setRecurringPatterns(patternsData.patterns || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDomain]);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await fetch(getApiUrl('/api/seed'), { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenDetail = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  };

  const handleClaimResolution = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  };

  const handleVerifyIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailModalOpen(true);
  };

  const handleOpenIssueById = (issueId: string) => {
    const found = issues.find(i => i.id === issueId);
    if (found) {
      handleOpenDetail(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e1a] text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentDomain={currentDomain}
        onSelectDomain={setCurrentDomain}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* The 6-Step Visual Stepper */}
        <PipelineStepper />

        {/* Overview Stats */}
        <MetricsOverview
          issues={issues}
          departments={departments}
          recurringPatterns={recurringPatterns}
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'tracker'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Problem List & AI Checks</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-black/40 text-cyan-300">
                {issues.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('patterns')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'patterns'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Repeat Problem Finder</span>
              {recurringPatterns.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-black/40 text-rose-300">
                  {recurringPatterns.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Team Scoreboard</span>
            </button>

            <button
              onClick={() => setActiveTab('query')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'query'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span>AI Verification Engine: Online</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'tracker' && (
          <ProblemTracker
            issues={issues}
            onSelectIssue={handleOpenDetail}
            onClaimResolution={handleClaimResolution}
            onVerifyIssue={handleVerifyIssue}
          />
        )}

        {activeTab === 'patterns' && (
          <RecurringPatternsView
            patterns={recurringPatterns}
            currentDomain={currentDomain}
            onOpenIssue={handleOpenIssueById}
          />
        )}

        {activeTab === 'leaderboard' && (
          <ImpactLeaderboard
            departments={departments}
            currentDomain={currentDomain}
          />
        )}

        {activeTab === 'query' && (
          <GenerativeQueryView
            currentDomain={currentDomain}
          />
        )}
      </main>

      {/* Modals */}
      <NewReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentDomain={currentDomain}
        onCreated={() => {
          fetchData();
        }}
      />

      <IssueDetailModal
        isOpen={isDetailModalOpen}
        issue={selectedIssue}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIssue(null);
        }}
        onUpdated={async () => {
          await fetchData();
          if (selectedIssue) {
            const res = await fetch(getApiUrl(`/api/issues/${selectedIssue.id}`));
            if (res.ok) {
              const d = await res.json();
              setSelectedIssue(d.issue);
            }
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Proof of Impact</span>
            <span>— The AI Platform That Verifies Real Physical Fixes</span>
          </div>
          <div className="font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800">
            Frontend connected to: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
          </div>
        </div>
      </footer>
    </div>
  );
}
