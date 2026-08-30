'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DomainType, AITriageResponse } from '@/lib/types';
import { 
  X, 
  Sparkles, 
  BrainCircuit, 
  AlertTriangle, 
  Check, 
  Upload,
  Image as ImageIcon,
  MapPin,
  Tag,
  Building,
  CheckCircle2,
  Layers,
  Send,
  Camera,
  Trash2
} from 'lucide-react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDomain: DomainType;
  onCreated: () => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  currentDomain,
  onCreated
}) => {
  const [domain, setDomain] = useState<DomainType>(currentDomain);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [reportedBy, setReportedBy] = useState('Resident / Reporter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live AI Triage State
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<AITriageResponse | null>(null);

  useEffect(() => {
    setDomain(currentDomain);
  }, [currentDomain]);

  // Debounced Live AI Triage
  useEffect(() => {
    if (!title || title.length < 5) {
      setTriageResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setTriageLoading(true);
      try {
        const res = await fetch('/api/ai/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, domain })
        });
        if (res.ok) {
          const data: AITriageResponse = await res.json();
          setTriageResult(data);
          if (!location && data.location) {
            setLocation(data.location);
          }
        }
      } catch (err) {
        console.error('Live triage error:', err);
      } finally {
        setTriageLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, domain]);

  // Handle local image file upload (converts to Base64 data URL)
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setBeforeImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  // Preset quick-test scenarios
  const presets = [
    {
      label: '⚡ Hall 204 Fan Vibration',
      domain: 'campus' as DomainType,
      title: 'Ceiling Fan #4 in Hall 204 making loud grinding noise and wobbling',
      description: 'Loud mechanical bearing rattle whenever fan speed exceeds level 3. Major disturbance during lectures.',
      imageUrl: 'https://images.unsplash.com/photo-1598084999768-4560d2b8a4f6?auto=format&fit=crop&w=800&q=80',
      location: 'Academic Complex, Lecture Hall 204'
    },
    {
      label: '🌐 Lab 3 Wi-Fi Outage (Duplicate Test)',
      domain: 'campus' as DomainType,
      title: 'Wi-Fi connection drops in Computer Lab 3 during morning classes',
      description: 'Students unable to connect to campus network during Monday lab session.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      location: 'Science Block, Lab 3'
    },
    {
      label: '🕳️ 5th Ave Road Crater',
      domain: 'civic' as DomainType,
      title: 'Deep hazardous pothole on 5th Avenue near Elm Street intersection',
      description: 'Asphalt eroded exposing jagged stone sub-base. Causing severe traffic slowdown and hazard for bikers.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      location: '5th Ave & Elm St, Ward 12'
    },
    {
      label: '💧 Server Room HVAC Leak',
      domain: 'enterprise' as DomainType,
      title: 'HVAC chilled water dripping onto Rack 4 in Basement Server Room B',
      description: 'Condensation overflow alarm triggered. Critical threat of server equipment water damage.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      location: 'Building A, Basement Server Room B'
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setDomain(p.domain);
    setTitle(p.title);
    setDescription(p.description);
    setLocation(p.location);
    setBeforeImageUrl(p.imageUrl);
    setImageFileName('sample-photo.jpg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          domain,
          beforeImageUrl: beforeImageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          beforeNotes: description,
          reportedBy
        })
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        alert('Failed to report issue');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl border border-slate-700/80 p-5 sm:p-7 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Report a Problem
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Upload a photo from your device or pick a test example. AI will auto-categorize and check duplicates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Examples */}
        <div className="pt-4 pb-2">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-2">
            ⚡ Quick Test Examples (Click to Auto-Fill):
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-blue-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 transition shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Area / Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Area / Environment
              </label>
              <select
                value={domain}
                onChange={e => setDomain(e.target.value as DomainType)}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="campus">🎓 College Campus</option>
                <option value="civic">🏛️ City & Streets</option>
                <option value="enterprise">🏢 Office & Facilities</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                Your Name / Role
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={e => setReportedBy(e.target.value)}
                placeholder="e.g. Student, Resident, Staff"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              What is broken? (Brief Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Ceiling fan in Room 204 is vibrating violently"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              Description & Details *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the problem, when it happens, safety hazards..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              Location / Room / Street
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Science Block Room 204 / 5th Ave Crossroad"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Photo Upload Section (Device Upload + Drag/Drop + Link) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">
              Photo of the Broken Item (Proof of Issue)
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {/* If photo is selected: Preview Card */}
            {beforeImageUrl ? (
              <div className="relative p-3 rounded-2xl bg-slate-950 border border-cyan-500/50 flex items-center justify-between gap-3 animate-fade-in shadow-md">
                <div className="flex items-center space-x-3">
                  <img
                    src={beforeImageUrl}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-cyan-400"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {imageFileName || 'Photo attached'}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Ready for AI Analysis
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBeforeImageUrl('');
                      setImageFileName('');
                    }}
                    className="p-2 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-700 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop / Click Upload Box */
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : 'border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-900/80'
                }`}
              >
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 shadow-md">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">
                    Click to browse or drag & drop photo here
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
                    Supports JPG, PNG, WEBP from your computer or phone
                  </span>
                </div>
              </div>
            )}

            {/* Optional URL input fallback */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Or paste link:</span>
              <input
                type="text"
                value={beforeImageUrl.startsWith('data:') ? '' : beforeImageUrl}
                onChange={e => {
                  setBeforeImageUrl(e.target.value);
                  setImageFileName('Web image link');
                }}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Live AI Assistant Feedback Card */}
          {(triageLoading || triageResult) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-cyan-500/50 space-y-3 animate-fade-in shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300 text-xs font-extrabold">
                  <BrainCircuit className={`w-4 h-4 text-cyan-400 ${triageLoading ? 'animate-spin' : ''}`} />
                  <span>AI Smart Assistant (Live Analysis)</span>
                </div>
                {triageResult && (
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-700">
                    {triageResult.confidence}% AI Accuracy
                  </span>
                )}
              </div>

              {triageResult && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Category</span>
                      <span className="text-cyan-300 font-bold truncate block">{triageResult.category}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Repair Team</span>
                      <span className="text-white font-bold truncate block">{triageResult.department}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Broken Item</span>
                      <span className="text-white font-bold truncate block">{triageResult.asset}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Urgency</span>
                      <span className={`font-black ${
                        triageResult.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                      }`}>{triageResult.priority === 'CRITICAL' ? 'URGENT' : triageResult.priority}</span>
                    </div>
                  </div>

                  {/* Duplicate Alert */}
                  {triageResult.potentialDuplicates && triageResult.potentialDuplicates.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-start space-x-2.5 text-xs text-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-amber-300 block">
                          Matching Problem Already Reported ({triageResult.potentialDuplicates[0].similarity}% match):
                        </span>
                        <p className="text-slate-200 mt-0.5">
                          "{triageResult.potentialDuplicates[0].title}"
                        </p>
                        <span className="text-[11px] text-amber-300 font-semibold block mt-1">
                          👉 We will link your report to this existing ticket to avoid sending multiple repair crews.
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !description}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/30 transition disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit & Start AI Check</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
