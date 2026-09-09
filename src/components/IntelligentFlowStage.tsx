import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Scale, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  Sliders, 
  ChevronRight, 
  Zap, 
  Layers, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import ParticleFlowCanvas, { ParticleMorphState } from './ParticleFlowCanvas';
import { CreatorProfile, SavedBrand, CRMOpportunity } from '../types';
import biomorphicBg from '../assets/images/intelligent_flow_biomorphic_bg_1787143326465.jpg';

interface IntelligentFlowStageProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  opportunities: CRMOpportunity[];
  pipelineValue: number;
  onNavigate: (tab: string) => void;
  onTriggerMissionControl?: (query: string) => void;
}

export default function IntelligentFlowStage({
  creatorProfile,
  savedBrands,
  opportunities,
  pipelineValue,
  onNavigate,
  onTriggerMissionControl
}: IntelligentFlowStageProps) {
  const [activeTelemetryMode, setActiveTelemetryMode] = useState<'velocity' | 'valuation' | 'pipeline'>('velocity');
  const [particleState, setParticleState] = useState<ParticleMorphState>('flow');
  const [isHoveringCTA, setIsHoveringCTA] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onTriggerMissionControl) {
      onTriggerMissionControl(searchQuery);
    } else {
      onNavigate('Brand Discovery');
    }
  };

  const wonDealsCount = opportunities.filter(o => o.stage === 'Won').length;
  const activeDealsCount = opportunities.filter(o => o.stage !== 'Lost').length;

  return (
    <div 
      id="intelligent-flow-stage" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="intelligent-flow-stage relative w-full p-6 md:p-10 min-h-[640px] flex flex-col justify-between select-none overflow-hidden"
    >
      {/* 1. LUXURY BIOMORPHIC 3D BACKGROUND (IMG_1207.jpeg) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
        style={{ 
          backgroundImage: `url(${biomorphicBg})`,
          transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0) scale(1.04)`
        }}
      />

      {/* 2. SPECULAR SHEEN & AMBIENT FLUID OVERLAY */}
      <div className="specular-sheen-overlay z-1" />
      <div className="biomorphic-surface z-1 pointer-events-none opacity-50" />

      {/* 3. INTERACTIVE 3D PARTICLE FIELD (Video Experience) */}
      <div className="absolute inset-0 z-2 opacity-75 mix-blend-screen pointer-events-auto">
        <ParticleFlowCanvas 
          initialState={particleState} 
          density={1200}
          onStateChange={(state) => setParticleState(state)}
          className="w-full h-full"
        />
      </div>

      {/* 4. TOP FROSTED GLASS NAVIGATION BAR (IMG_1207.jpeg) */}
      <div className="relative z-20 flex items-center justify-between gap-4 frost-nav-bar px-5 py-2.5 max-w-5xl mx-auto w-full">
        {/* Left Logo - Crystal Clear Typography */}
        <div 
          onClick={() => onNavigate('Dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-tight text-zinc-900 font-display">
              Heimdall
            </span>
            <span className="text-[9px] font-medium text-emerald-800 tracking-wider uppercase font-mono">
              Intelligence
            </span>
          </div>
        </div>

        {/* Center Nav Links - Clear & Meaningful Words */}
        <div className="hidden md:flex items-center gap-6 text-[11px] font-semibold text-zinc-800">
          <button 
            onClick={() => onNavigate('Intelligence & Rate Card')}
            className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Rate Valuation</span>
          </button>
          <button 
            onClick={() => onNavigate('Brand Discovery')}
            className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Brand Discovery</span>
          </button>
          <button 
            onClick={() => onNavigate('Deals')}
            className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Deal Escrow</span>
            {activeDealsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-mono font-bold">
                {activeDealsCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onNavigate('Contract X-Ray')}
            className="hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Contract Audit</span>
          </button>
        </div>

        {/* Search & Black Capsule Hero Button */}
        <div className="flex items-center gap-2.5">
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md border border-white/90 rounded-full text-xs text-zinc-700 shadow-inner focus-within:border-emerald-600 focus-within:bg-white transition-all"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified brands & rates..."
              className="bg-transparent border-none text-[11px] text-zinc-900 placeholder-zinc-500 focus:outline-none w-28 lg:w-44 font-medium"
            />
          </form>

          <button
            onClick={() => onNavigate('Deals')}
            className="pill-btn-black-capsule px-4 py-1.5 text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Deal Room</span>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* 5. CENTRAL HERO DISPLAY (Intelligent Flow Typography & Clear Value Prop) */}
      <div 
        className="relative z-10 text-center my-auto py-10 px-4 space-y-4 max-w-2xl mx-auto transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0)` }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[10px] font-bold text-emerald-900 uppercase tracking-widest shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Autonomous Creator Intelligence Matrix</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-none font-display drop-shadow-[0_2px_14px_rgba(255,255,255,0.9)]">
          Intelligent Flow
        </h1>
        
        <p className="text-xs md:text-sm text-zinc-900 font-semibold max-w-lg mx-auto leading-relaxed drop-shadow-[0_1px_6px_rgba(255,255,255,0.95)]">
          Continuous telemetry synchronizes your verified creator audience velocity with calibrated market sponsorship valuations and instant escrow deal protection.
        </p>

        {/* The Signature Glowing Mint Neon Button (IMG_1207.jpeg) with Clear Functional Label */}
        <div className="pt-2 relative inline-block">
          {/* Pulsing Sonar Ring */}
          <div className="catda-pulse-ring" />
          
          <button
            id="intelligent-flow-cta"
            onMouseEnter={() => setIsHoveringCTA(true)}
            onMouseLeave={() => setIsHoveringCTA(false)}
            onClick={() => onNavigate('Intelligence & Rate Card')}
            className="neon-pill-cyan relative z-10 px-9 py-3.5 text-xs font-extrabold tracking-widest inline-flex items-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-700 animate-spin" style={{ animationDuration: '6s' }} />
            <span>LAUNCH INTELLIGENCE</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      </div>

      {/* 6. BOTTOM STAGE INTEGRATED HUD WIDGETS & METALLIC CONDUIT (IMG_1207.jpeg) */}
      <div className="relative z-20 flex flex-col md:flex-row items-end justify-between gap-6 pt-4">
        
        {/* Bottom Left: Telemetry HUD Card (Clear Verified Metrics + Equalizer Bars) */}
        <div 
          className="telemetry-hud-badge p-4 text-white w-full max-w-[260px] space-y-2.5 transition-transform duration-500 ease-out cursor-pointer hover:border-teal-300/60 transition-all"
          style={{ transform: `translate3d(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px, 0)` }}
          onClick={() => onNavigate('Intelligence & Rate Card')}
        >
          <div className="flex items-center justify-between text-[10px] text-teal-300 font-mono">
            <span className="font-bold tracking-wide uppercase">Audience Telemetry</span>
            <span className="flex items-center gap-1 font-semibold text-teal-200">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Live Pulse
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]">
                +106%
              </span>
              <span className="text-[10px] text-teal-200 font-semibold">Growth Target</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/30">
              Tier 1
            </span>
          </div>

          {/* Futuristic Equalizer Frequency Bars */}
          <div className="flex items-end gap-1.5 h-8 pt-1">
            <div className="w-2.5 hud-bar-1 bg-teal-400/80 rounded-t-sm shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            <div className="w-2.5 hud-bar-2 bg-teal-400 rounded-t-sm shadow-[0_0_12px_rgba(45,212,191,0.9)]" />
            <div className="w-2.5 hud-bar-3 bg-teal-300 rounded-t-sm shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            <div className="w-2.5 hud-bar-4 bg-teal-400 rounded-t-sm shadow-[0_0_12px_rgba(45,212,191,0.9)]" />
            <div className="w-2.5 hud-bar-5 bg-teal-300/90 rounded-t-sm shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
          </div>

          <div className="text-[10px] text-teal-200 font-mono pt-0.5 flex justify-between border-t border-teal-500/20">
            <span>Calibrated CPM: $45.00</span>
            <span className="text-teal-300 font-bold">+18.4% WoW</span>
          </div>
        </div>

        {/* Bottom Right: Metallic Conduit Track & Stepper Pill Controls */}
        <div className="flex items-center gap-3">
          
          {/* Chrome Conduit Track with Traveling Laser Bullet */}
          <div className="hidden lg:flex metallic-conduit-track h-3.5 w-48 relative overflow-hidden" title="Verified Telemetry Stream">
            <div className="laser-bullet" />
          </div>

          {/* Stepper Controls Pill (Discovery, Valuation, Campaign) with Clear Tooltips */}
          <div className="flex items-center gap-1.5 p-1.5 bg-black/50 backdrop-blur-xl border border-white/30 rounded-full shadow-xl">
            <button 
              onClick={() => onNavigate('Brand Discovery')}
              className="px-3 py-1 text-zinc-200 hover:text-white hover:bg-white/10 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              title="Brand Discovery Matrix"
            >
              Discovery
            </button>
            <button 
              onClick={() => onNavigate('Intelligence & Rate Card')}
              className="p-1.5 bg-teal-400 text-black rounded-full shadow-md shadow-teal-400/50 hover:scale-110 transition-transform cursor-pointer"
              title="Recalibrate Rate Card"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
            </button>
            <button 
              onClick={() => onNavigate('Campaign Studio')}
              className="px-3 py-1 text-zinc-200 hover:text-white hover:bg-white/10 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              title="Create Campaign Studio Brief"
            >
              + Campaign
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

