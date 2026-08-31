'use client';

import React, { useState, useEffect } from 'react';
import { DomainType } from '@/lib/types';
import { getApiUrl } from '@/lib/api';
import { 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Landmark, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  currentDomain: DomainType;
  onSelectDomain: (domain: DomainType) => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

interface DbHealth {
  status: 'connected' | 'fallback_local' | 'error';
  provider: string;
  database?: string;
  host?: string;
  counts?: {
    issues: number;
    recurringPatterns: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDomain,
  onSelectDomain,
  onOpenReportModal,
  onResetData,
  isResetting
}) => {
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);

  useEffect(() => {
    fetch(getApiUrl('/api/health'))
      .then(res => res.json())
      .then(data => setDbHealth(data))
      .catch(() => setDbHealth({ status: 'error', provider: 'Offline' }));
  }, [isResetting]);

  const domains: { id: DomainType; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
    { 
      id: 'campus', 
      label: 'College Campus', 
      icon: <GraduationCap className="w-4 h-4" />, 
      color: 'text-blue-400',
      activeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border-blue-400/40' 
    },
    { 
      id: 'civic', 
      label: 'City & Public', 
      icon: <Landmark className="w-4 h-4" />, 
      color: 'text-emerald-400',
      activeColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 border-emerald-400/40' 
    },
    { 
      id: 'enterprise', 
      label: 'Office & Facilities', 
      icon: <Building2 className="w-4 h-4" />, 
      color: 'text-purple-400',
      activeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 border-purple-400/40' 
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a13]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/30 border border-cyan-300/30">
              <ShieldCheck className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#070a13]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
                  Proof of <span className="text-gradient-vibrant">Impact</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400" />
                  AI Verified
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 font-medium">
                Closed-loop problem solving with photographic proof
              </p>
            </div>
          </div>

          {/* Domain Selector */}
          <div className="hidden md:flex items-center p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
            {domains.map(d => {
              const active = currentDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDomain(d.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? `${d.activeColor}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-transparent'
                  }`}
                >
                  <span className={active ? 'text-white' : d.color}>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Database Live Status & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Database Indicator */}
            <div 
              title={dbHealth?.status === 'connected' ? `Connected to ${dbHealth.database} on ${dbHealth.host}` : 'Using local store'}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                dbHealth?.status === 'connected'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${dbHealth?.status === 'connected' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{dbHealth?.status === 'connected' ? 'MongoDB Atlas' : 'Local DB'}</span>
              <span className={`w-2 h-2 rounded-full ${dbHealth?.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </div>

            <button
              onClick={onResetData}
              disabled={isResetting}
              title="Reset test data"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 border border-cyan-300/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Mobile Domain Selector */}
        <div className="flex md:hidden items-center justify-between pb-3 pt-1 border-t border-slate-800/60">
          <span className="text-xs font-bold text-slate-400">Environment:</span>
          <div className="flex items-center space-x-1.5">
            {domains.map(d => (
              <button
                key={d.id}
                onClick={() => onSelectDomain(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  currentDomain === d.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                {d.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
