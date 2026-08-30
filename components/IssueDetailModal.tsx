'use client';

import React, { useState, useRef } from 'react';
import { Issue } from '@/lib/types';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Wrench, 
  Clock, 
  Sparkles, 
  SlidersHorizontal, 
  Activity, 
  ArrowRight,
  Camera,
  AlertOctagon,
  Upload,
  Trash2
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Claim resolution form
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimImageUrl, setClaimImageUrl] = useState('');
  const [claimFileName, setClaimFileName] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimedBy, setClaimedBy] = useState('Repair Team Lead');

  const afterFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !issue) return null;

  const handleAfterFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    setClaimFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setClaimImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAdjudication = async () => {
    setIsAdjudicating(true);
    try {
      const res = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: issue.id,
          beforeNotes: issue.evidence.beforeNotes,
          afterNotes: issue.evidence.afterNotes,
          beforeImageUrl: issue.evidence.beforeImageUrl,
          afterImageUrl: issue.evidence.afterImageUrl
        })
      });

      if (res.ok) {
        onUpdated();
      } else {
        alert('AI check call failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error running AI check');
    } finally {
      setIsAdjudicating(false);
    }
  };

  const handleClaimResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClaiming(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLAIM_RESOLUTION',
          afterImageUrl: claimImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          afterNotes: claimNotes || 'Repair technician completed work.',
          claimedBy
        })
      });

      if (res.ok) {
        setShowClaimForm(false);
        onUpdated();
      } else {
        alert('Failed to submit repair proof');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting repair proof');
    } finally {
      setIsClaiming(false);
    }
  };

  const beforeImg = issue.evidence.beforeImageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';
  const afterImg = issue.evidence.afterImageUrl || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl border border-slate-700 p-5 sm:p-7 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-700 shadow-sm">
                {issue.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                {issue.domain.toUpperCase()}
              </span>
              <span className={`text-xs font-black px-3 py-0.5 rounded-full border shadow-sm ${
                issue.status === 'VERIFIED_CLOSED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : issue.status === 'PENDING_VERIFICATION'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : issue.status === 'VERIFICATION_FAILED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                {issue.status === 'VERIFIED_CLOSED'
                  ? '✅ Verified Fixed'
                  : issue.status === 'PENDING_VERIFICATION'
                  ? '⏳ Needs AI Check'
                  : issue.status === 'VERIFICATION_FAILED'
                  ? '❌ Rejected - Reopened'
                  : '🛠️ In Progress'}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white">
              {issue.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Reported by <span className="text-white font-bold">{issue.reportedBy}</span> • Location: <span className="text-cyan-300 font-bold">{issue.location}</span> • Item: <span className="text-white font-bold">{issue.asset}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1 flex-1">
          {/* Visual Photo Comparison Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Photo Evidence: Compare Before vs After</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'slider' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Slider View
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'side-by-side' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Visual Slider */}
            {viewMode === 'slider' ? (
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden select-none border-2 border-slate-700 shadow-xl">
                {/* After Image */}
                <img
                  src={afterImg}
                  alt="After Fix"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-black/90 text-emerald-400 border border-emerald-500/50 z-10 shadow-md">
                  AFTER: Repair Photo
                </span>

                {/* Before Image (Clipped) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforeImg}
                    alt="Before State"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-black/90 text-rose-400 border border-rose-500/50 shadow-md">
                    BEFORE: Broken State
                  </span>
                </div>

                {/* Slider Handle */}
                <div
                  className="absolute inset-y-0 w-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg text-xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </div>

                {/* Range Drag */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPosition}
                  onChange={e => setSliderPosition(Number(e.target.value))}
                  aria-label="Drag to compare Before and After photos"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-slate-700">
                    <img src={beforeImg} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-black/90 text-rose-400 border border-rose-500/40">
                      BEFORE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{issue.evidence.beforeNotes || issue.description}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-slate-700">
                    <img src={afterImg} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-black bg-black/90 text-emerald-400 border border-emerald-500/40">
                      AFTER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{issue.evidence.afterNotes || 'No notes submitted yet.'}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Verification Result Card */}
          {issue.adjudication && (
            <div className={`p-5 rounded-2xl border space-y-3 shadow-lg ${
              issue.adjudication.status === 'VERIFIED_SUCCESSFUL'
                ? 'bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border-emerald-500/60'
                : issue.adjudication.status === 'VERIFICATION_FAILED_REOPENED'
                ? 'bg-gradient-to-br from-rose-950/40 to-pink-950/40 border-rose-500/60'
                : 'bg-amber-950/40 border-amber-500/60'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl ${
                    issue.adjudication.status === 'VERIFIED_SUCCESSFUL'
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-500/20 text-rose-400 shadow-md shadow-rose-500/20'
                  }`}>
                    {issue.adjudication.status === 'VERIFIED_SUCCESSFUL' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertOctagon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-black ${
                      issue.adjudication.status === 'VERIFIED_SUCCESSFUL' ? 'text-emerald-300' : 'text-rose-300'
                    }`}>
                      {issue.adjudication.status === 'VERIFIED_SUCCESSFUL'
                        ? '✅ AI Fix Verification: APPROVED & VERIFIED'
                        : '❌ AI Fix Verification: REJECTED & REOPENED'}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Verified at {new Date(issue.adjudication.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Fix Quality</span>
                    <span className="text-sm font-black text-cyan-300">
                      {issue.adjudication.visualComparisonScore}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">AI Confidence</span>
                    <span className="text-sm font-black text-white">
                      {issue.adjudication.confidence}%
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-xs font-black ${
                    issue.adjudication.impactScoreDelta > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {issue.adjudication.impactScoreDelta > 0 ? `+${issue.adjudication.impactScoreDelta}` : issue.adjudication.impactScoreDelta} pts
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-black/50 p-3.5 rounded-xl border border-slate-800">
                {issue.adjudication.summary}
              </p>

              {/* Inspection points */}
              {issue.adjudication.keyFindings && issue.adjudication.keyFindings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    AI Visual Check Details:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {issue.adjudication.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                          issue.adjudication?.status === 'VERIFIED_SUCCESSFUL' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`} />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80">
            {/* Run AI Verification */}
            <button
              onClick={handleRunAdjudication}
              disabled={isAdjudicating}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 hover:from-amber-200 hover:to-yellow-300 shadow-lg shadow-amber-500/30 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAdjudicating ? 'animate-spin' : ''}`} />
              <span>{isAdjudicating ? 'AI Checking Photos...' : 'Check Fix with AI'}</span>
            </button>

            {/* Upload New Fix Proof */}
            {!showClaimForm && (
              <button
                onClick={() => setShowClaimForm(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload "After" Repair Photo</span>
              </button>
            )}
          </div>

          {/* Upload Proof Drawer */}
          {showClaimForm && (
            <form onSubmit={handleClaimResolution} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/50 space-y-4 animate-slide-up shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Submit "After" Repair Photo Evidence</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowClaimForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Repair Person / Technician Name
                </label>
                <input
                  type="text"
                  value={claimedBy}
                  onChange={e => setClaimedBy(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Photo Upload for After state */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  "After" Photo (Proof the problem was fixed)
                </label>

                <input
                  type="file"
                  ref={afterFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleAfterFileChange(e.target.files[0]);
                    }
                  }}
                />

                {claimImageUrl ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/60 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={claimImageUrl} alt="After Preview" className="w-12 h-12 object-cover rounded-lg border border-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">{claimFileName || 'After photo attached'}</span>
                        <span className="text-[11px] text-emerald-400 font-semibold">Ready to verify</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => afterFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => afterFileInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950/70 hover:bg-slate-900 cursor-pointer text-center space-y-1"
                  >
                    <Upload className="w-5 h-5 mx-auto text-cyan-400" />
                    <span className="text-xs font-bold text-white block">Click to upload photo from your device</span>
                    <span className="text-[10px] text-slate-400 block">Supports JPG, PNG, WEBP</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Or paste link:</span>
                  <input
                    type="text"
                    value={claimImageUrl.startsWith('data:') ? '' : claimImageUrl}
                    onChange={e => {
                      setClaimImageUrl(e.target.value);
                      setClaimFileName('Web image');
                    }}
                    placeholder="https://example.com/after-photo.jpg"
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  What did you fix? (Repair notes)
                </label>
                <textarea
                  rows={2}
                  value={claimNotes}
                  onChange={e => setClaimNotes(e.target.value)}
                  placeholder="Describe the repair work done, new parts installed..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isClaiming}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-md transition"
                >
                  {isClaiming ? 'Saving...' : 'Send to AI Verification Queue'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step History Log</span>
            </h4>

            <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-4">
              {issue.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative group">
                  <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    event.stage === 'AI_VERIFICATION'
                      ? 'bg-emerald-400'
                      : event.stage === 'REOPENED'
                      ? 'bg-rose-400'
                      : event.stage === 'ACTION_CLAIM'
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`} />
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{event.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">{event.description}</p>
                    <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">
                      Actor: {event.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
