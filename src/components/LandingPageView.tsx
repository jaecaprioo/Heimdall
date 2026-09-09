import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  CheckCircle2, 
  Scale, 
  Zap, 
  Layers, 
  FileText, 
  Briefcase,
  Play,
  Award,
  ChevronRight
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterAsCreator: () => void;
  onEnterAsBrand: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterAsCreator,
  onEnterAsBrand
}) => {
  const [activeTab, setActiveTab] = useState<'creator' | 'brand'>('creator');
  const [demoMetricScore, setDemoMetricScore] = useState(92);

  return (
    <div className="min-h-screen bg-[#EEF3F2] text-zinc-900 font-sans selection:bg-teal-500/20 selection:text-teal-900 overflow-x-hidden relative">
      
      {/* Top Ambient Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-cyan-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Nav Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/80 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-teal-900/20">
            H
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight font-display text-zinc-900">HEIMDALL</span>
            <span className="text-[10px] text-teal-700 font-semibold block tracking-wider uppercase leading-none">Partnership OS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
          <a href="#valuation" className="hover:text-teal-700 transition-colors">Valuation Matrix</a>
          <a href="#contract-xray" className="hover:text-teal-700 transition-colors">Contract X-Ray</a>
          <a href="#deal-escrow" className="hover:text-teal-700 transition-colors">Deal Escrow</a>
          <a href="#reputation" className="hover:text-teal-700 transition-colors">Trust Network</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onEnterAsBrand}
            className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-white/80 transition-all border border-zinc-200/80 cursor-pointer"
          >
            For Brands
          </button>
          <button
            onClick={onEnterAsCreator}
            className="teal-pill-button px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                 */}
      {/* ========================================================= */}
      <section className="pt-16 md:pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-sm animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>The Autonomous Creator Intelligence Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 font-display leading-[1.08]">
            Know your value.<br />
            Build your <span className="text-teal-600">empire.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Heimdall is the intelligent operating system for creator–brand partnerships. Calibrate market valuations, audit contracts, and close secured escrow deals.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterAsCreator}
              className="w-full sm:w-auto teal-pill-button px-8 py-4 text-sm font-bold flex items-center justify-center gap-3 cursor-pointer shadow-lg"
            >
              <span>Get Started as Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterAsBrand}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/90 hover:bg-white text-zinc-800 hover:text-zinc-950 font-bold text-sm border border-zinc-200/90 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter as Brand Partner</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. INTERACTIVE PRODUCT PREVIEW MOCKUP                    */}
        {/* ========================================================= */}
        <div className="mt-16 relative rounded-[32px] glass-panel p-4 md:p-8 shadow-2xl border border-white overflow-hidden max-w-6xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-bold text-zinc-400 font-mono">heimdall.network // live preview</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                ● Live Telemetry Node
              </span>
            </div>
          </div>

          {/* Embedded Interactive Mock Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Hero inside Preview */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl bg-white/90 border border-zinc-200/70 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-bold text-teal-800 text-sm">
                      AM
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-900">Alex Rivers</h4>
                      <p className="text-[11px] text-zinc-500">Fitness & Aesthetic Lifestyle • 126.4K Reach</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                    Score: 92/100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Instagram Reel</span>
                    <span className="text-base font-extrabold text-zinc-900 font-display">$500</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">+$250 (+100%)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">TikTok Video</span>
                    <span className="text-base font-extrabold text-zinc-900 font-display">$420</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">+$170 (+68%)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">YouTube Sponsor</span>
                    <span className="text-base font-extrabold text-zinc-900 font-display">$1,200</span>
                    <span className="text-[10px] text-emerald-700 font-bold block">+$400 (+50%)</span>
                  </div>
                </div>
              </div>

              {/* Verified Brand Match Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900">Nike Partner Match</span>
                    <p className="text-[11px] text-zinc-500">Budget: $5K - $12K</p>
                  </div>
                  <span className="text-sm font-extrabold text-teal-700 font-display">93%</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-zinc-900">Gymshark Campaign</span>
                    <p className="text-[11px] text-zinc-500">Budget: $3.5K - $6.5K</p>
                  </div>
                  <span className="text-sm font-extrabold text-teal-700 font-display">91%</span>
                </div>
              </div>
            </div>

            {/* Right Sentinel Card inside Preview */}
            <div className="lg:col-span-4 rounded-2xl bg-white/90 border border-zinc-200/70 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-900">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Contract X-Ray Audit</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>⚠️ High Risk Detected: Clause 4.2</span>
                </p>
                <p className="text-amber-800 text-[10px] leading-relaxed">
                  "Brand retains 90-day unpaid secondary ad rights." Recommended counter: +$650 usage fee or cap at 30 days.
                </p>
              </div>
              <button
                onClick={onEnterAsCreator}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Launch Live Studio →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FOUR CORE CAPABILITIES GRID                            */}
      {/* ========================================================= */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 font-display">
            Built for the modern creator economy.
          </h2>
          <p className="text-sm text-zinc-600">
            Four interconnected engines designed to safeguard your creative leverage and maximize revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Valuation Matrix */}
          <div id="valuation" className="rounded-3xl glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Dynamic Rate Card</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Autonomous calibration updates your deliverable pricing when audience velocity surges.
            </p>
          </div>

          {/* Card 2: Contract X-Ray */}
          <div id="contract-xray" className="rounded-3xl glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Contract X-Ray</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Instant AI legal analysis detects risky exclusivity, perpetual IP assignment, and uncompensated paid usage.
            </p>
          </div>

          {/* Card 3: Deal Escrow */}
          <div id="deal-escrow" className="rounded-3xl glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Milestone Escrow</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Lock sponsor funds in smart escrow before shooting a single frame. Guaranteed prompt payouts upon delivery.
            </p>
          </div>

          {/* Card 4: Trust Network */}
          <div id="reputation" className="rounded-3xl glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Reputation Passport</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Verifiable completion scores and brand reviews build your undeniable partnership credit rating.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <footer className="border-t border-zinc-200/80 py-12 px-6 md:px-12 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">H</div>
            <span className="font-bold text-zinc-800">HEIMDALL INC.</span>
            <span>• The Partnership Operating System</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <button onClick={onEnterAsCreator} className="text-teal-700 hover:underline">Creator Mode</button>
            <button onClick={onEnterAsBrand} className="text-zinc-600 hover:text-zinc-900">Brand Mode</button>
            <span>Privacy & Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
