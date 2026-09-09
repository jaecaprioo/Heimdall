import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreatorProfile } from '../types';
import {
  User,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Youtube,
  Globe,
  Building,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface OnboardingViewProps {
  user: any;
  creatorProfile: CreatorProfile;
  onComplete: (updatedProfile: CreatorProfile) => void;
  onSaveProfile: (profile: CreatorProfile) => Promise<void>;
}

export default function OnboardingView({ user, creatorProfile, onComplete, onSaveProfile }: OnboardingViewProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [creatorName, setCreatorName] = useState(creatorProfile?.creatorName || 'Alex Rivers');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Fitness & Athletics', 'Lifestyle UGC']);
  
  // Connected platforms
  const [connectedPlatforms, setConnectedPlatforms] = useState<{ [key: string]: boolean }>({
    instagram: true,
    tiktok: true,
    youtube: false
  });

  // Calibration progress state
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationText, setCalibrationText] = useState('Initializing telemetry handshake...');

  const togglePlatform = (platform: string) => {
    setConnectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const startCalibration = () => {
    setStep(3);
    setCalibrationProgress(0);

    const steps = [
      { p: 25, t: 'Scanning recent video views & completion rates...' },
      { p: 55, t: 'Analyzing audience tier concentration (88% US/UK)...' },
      { p: 80, t: 'Calibrating deliverable rate card against 12K sponsorships...' },
      { p: 100, t: 'Calibration complete! Calculating Heimdall Value Score...' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setCalibrationProgress(steps[i].p);
        setCalibrationText(steps[i].t);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStep(4);
        }, 800);
      }
    }, 900);
  };

  const handleFinish = async () => {
    const updated: CreatorProfile = {
      ...creatorProfile,
      creatorName,
      niches: selectedNiches,
      basePricing: {
        instagram_reel: 500,
        tiktok_video: 420,
        youtube_dedicated: 1200,
        story_set: 220
      }
    };
    await onSaveProfile(updated);
    onComplete(updated);
  };

  return (
    <div className="min-h-screen bg-[#EEF3F2] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl rounded-[32px] glass-panel p-8 md:p-12 relative z-10 shadow-2xl border border-white space-y-8">
        
        {/* Top Progress indicator */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
              H
            </div>
            <span className="font-extrabold text-xs font-display text-zinc-900 tracking-wider uppercase">
              Heimdall Setup
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step ? 'w-8 bg-teal-600' : s < step ? 'w-4 bg-teal-300' : 'w-4 bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: CHOOSE ROLE                                       */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 font-display">
                How do you plan to use Heimdall?
              </h2>
              <p className="text-xs md:text-sm text-zinc-500">
                Choose your primary operating mode. You can switch or invite collaborators anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setRole('creator')}
                className={`p-6 rounded-3xl cursor-pointer transition-all border-2 text-left space-y-3 ${
                  role === 'creator'
                    ? 'border-teal-600 bg-teal-50/60 shadow-md'
                    : 'border-zinc-200/80 bg-white/80 hover:border-zinc-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 font-display">Creator / Talent</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Calibrate rates, audit contracts, protect milestones with escrow, and publish media kits.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setRole('brand')}
                className={`p-6 rounded-3xl cursor-pointer transition-all border-2 text-left space-y-3 ${
                  role === 'brand'
                    ? 'border-teal-600 bg-teal-50/60 shadow-md'
                    : 'border-zinc-200/80 bg-white/80 hover:border-zinc-300'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 font-display">Brand / Agency</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Discover verified creators, launch escrow campaigns, and track authentic ROI telemetry.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="teal-pill-button px-8 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue to Connections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: CONNECT PLATFORMS                                 */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 font-display">
                Connect your social channels
              </h2>
              <p className="text-xs md:text-sm text-zinc-500">
                Heimdall securely syncs official Graph APIs to calculate your live commercial rate card.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Instagram */}
              <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-900">Instagram Graph API</h4>
                    <span className="text-[10px] text-zinc-400">Syncs Reels, views & Tier-1 country reach</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePlatform('instagram')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    connectedPlatforms.instagram
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {connectedPlatforms.instagram ? '✓ Connected' : 'Connect'}
                </button>
              </div>

              {/* TikTok */}
              <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-900">TikTok Creator Marketplace API</h4>
                    <span className="text-[10px] text-zinc-400">Syncs video engagement & watch time</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePlatform('tiktok')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    connectedPlatforms.tiktok
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {connectedPlatforms.tiktok ? '✓ Connected' : 'Connect'}
                </button>
              </div>

              {/* YouTube */}
              <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-900">YouTube Data API v3</h4>
                    <span className="text-[10px] text-zinc-400">Syncs subscriber retention & CTR</span>
                  </div>
                </div>
                <button
                  onClick={() => togglePlatform('youtube')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    connectedPlatforms.youtube
                      ? 'bg-teal-50 text-teal-800 border border-teal-300'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {connectedPlatforms.youtube ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900"
              >
                Back
              </button>
              <button
                onClick={startCalibration}
                className="teal-pill-button px-8 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Begin Autonomous Calibration</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: AI INTELLIGENCE CALIBRATION                       */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-8 py-8 text-center animate-in fade-in">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
              <Sparkles className="w-10 h-10 text-teal-600 absolute" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-zinc-900 font-display">
                Calibrating Commercial Intelligence...
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {calibrationText}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto h-2 rounded-full bg-zinc-200 overflow-hidden mt-4">
                <div
                  className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-teal-700 block">{calibrationProgress}% Complete</span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: REVEAL SCORE & COMPLETION                         */}
        {/* ========================================================= */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                ✓ Valuation Complete
              </span>
              <h2 className="text-3xl font-extrabold text-zinc-900 font-display">
                Your Initial Heimdall Value Score is Ready
              </h2>
            </div>

            {/* Score Showcase Card */}
            <div className="p-8 rounded-[28px] bg-gradient-to-b from-teal-50/80 to-white border border-teal-200/80 space-y-4 shadow-lg">
              <div className="text-6xl font-extrabold text-teal-700 font-display">
                92<span className="text-2xl text-zinc-400 font-bold">/100</span>
              </div>
              <div className="text-xs font-bold text-zinc-600">
                Tier-1 Elite Creator • Calibrated Reel Baseline: <span className="text-teal-700 font-extrabold">$500.00</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-zinc-100">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Audience Quality</span>
                  <span className="text-xs font-extrabold text-zinc-900 font-display">94%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-zinc-100">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Engagement</span>
                  <span className="text-xs font-extrabold text-teal-700 font-display">96%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-zinc-100">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Trust Rating</span>
                  <span className="text-xs font-extrabold text-emerald-700 font-display">98%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full teal-pill-button py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Enter Heimdall Operating System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
