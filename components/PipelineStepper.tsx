'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  BrainCircuit, 
  Send, 
  Wrench, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

export const PipelineStepper: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(4); // default on Step 5 (AI Verify)

  const steps = [
    {
      num: 1,
      name: 'Report',
      tag: 'Step 1: Intake',
      icon: <Camera className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/50 from-sky-950/60 to-slate-900',
      activeBorder: 'border-sky-400 shadow-sky-500/20',
      iconBg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
      desc: 'Snap a photo and report a broken item with symptoms.',
      detail: 'Users, students, or field inspectors log an issue with a photographic timestamp of the initial defect.'
    },
    {
      num: 2,
      name: 'AI Sort',
      tag: 'Step 2: Smart Filter',
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/50 from-purple-950/60 to-slate-900',
      activeBorder: 'border-purple-400 shadow-purple-500/20',
      iconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
      desc: 'AI reads text, extracts items, and catches duplicate reports.',
      detail: 'AI automatically extracts the broken asset, room/street location, and links identical complaints together.'
    },
    {
      num: 3,
      name: 'Assign',
      tag: 'Step 3: Dispatch',
      icon: <Send className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/50 from-cyan-950/60 to-slate-900',
      activeBorder: 'border-cyan-400 shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
      desc: 'Auto-sends the job to the correct repair department.',
      detail: 'Routes directly to electricians, plumbers, or IT technicians with clear SLA completion target timers.'
    },
    {
      num: 4,
      name: 'Fix Claim',
      tag: 'Step 4: Work Done',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 from-amber-950/60 to-slate-900',
      activeBorder: 'border-amber-400 shadow-amber-500/20',
      iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      desc: 'Worker claims "Fixed" and uploads an After photo.',
      detail: 'CRITICAL: The issue is NOT closed here. It enters "Needs AI Check" so fake closures or quick tape patches are blocked.'
    },
    {
      num: 5,
      name: 'AI Verify',
      tag: 'The Core Innovation',
      icon: <ShieldCheck className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/70 from-pink-950/70 to-slate-900',
      activeBorder: 'border-pink-400 shadow-pink-500/30',
      iconBg: 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30',
      desc: 'AI Vision compares Before & After photos to prove the fix.',
      detail: 'Computer Vision verifies physical completion. Genuine fixes close the case; substandard patches are automatically rejected & reopened.'
    },
    {
      num: 6,
      name: 'Real Impact',
      tag: 'Step 6: True Score',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 from-emerald-950/60 to-slate-900',
      activeBorder: 'border-emerald-400 shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      desc: 'Scores real results and catches repeating failure clusters.',
      detail: 'Updates the live scoreboard based on verified fixes and groups recurring failures into root-cause work orders.'
    }
  ];

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-6 border border-slate-700/80 relative overflow-hidden shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-36 bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-36 bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              How It Works: <span className="text-gradient-vibrant">The 6-Step Verification Loop</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              Verified Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            A problem is not solved just because someone marked "Resolved" — AI verifies the repair with photo proof before closing.
          </p>
        </div>

        <div className="flex items-center text-xs font-semibold text-cyan-300 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
          <Info className="w-3.5 h-3.5 mr-1.5 text-cyan-400 flex-shrink-0" />
          <span>Click any stage below for details</span>
        </div>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const isSelected = activeStep === idx;
          const isUsp = idx === 4;

          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`relative flex flex-col p-4 rounded-2xl text-left transition-all group ${
                isSelected
                  ? `bg-gradient-to-b ${step.color} border-2 ${step.activeBorder} shadow-xl scale-[1.03]`
                  : 'bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {isUsp && (
                <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md">
                  CORE USP
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${step.iconBg}`}>
                  {step.icon}
                </div>
                <span className="text-xs font-black font-mono text-slate-400 group-hover:text-white transition">
                  0{step.num}
                </span>
              </div>

              <span className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition">
                {step.name}
              </span>
              <span className="text-[11px] font-bold text-slate-400 mb-1.5">
                {step.tag}
              </span>
              <span className="text-xs text-slate-300 leading-snug line-clamp-2 font-medium">
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Selected Step Info Drawer */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 flex items-start space-x-3.5 text-xs sm:text-sm text-slate-200 animate-fade-in shadow-inner">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0 mt-0.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="font-extrabold text-cyan-300 text-sm">
            Step {steps[activeStep].num}: {steps[activeStep].name} — {steps[activeStep].tag}
          </span>
          <p className="text-slate-300 mt-1 leading-relaxed text-xs sm:text-sm font-medium">
            {steps[activeStep].detail}
          </p>
        </div>
      </div>
    </div>
  );
};
