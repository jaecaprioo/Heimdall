import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  Share2, 
  Eye, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Layers, 
  Maximize2,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MoreHorizontal
} from 'lucide-react';
import { CreatorProfile, Brand, CRMOpportunity, Notification, RateCardServiceItem, RateCardProposal, SocialAccount } from '../types';

interface DashboardViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: any[];
  opportunities: CRMOpportunity[];
  notifications: Notification[];
  recommendations: Brand[];
  onNavigate: (tabName: string) => void;
  onSelectBrandForAction: (brand: Brand) => void;
  onSaveBrand: (brand: Brand) => void;
  onUpdateCrmStage: (brandId: string, brandName: string, website: string, industry: string, stage: any, dealValue?: number) => void;
  rateCards: RateCardServiceItem[];
  activeProposal: RateCardProposal | null;
  socialAccounts?: SocialAccount[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  creatorProfile,
  savedBrands,
  opportunities,
  notifications,
  recommendations,
  onNavigate,
  onSelectBrandForAction,
  onSaveBrand,
  onUpdateCrmStage,
  rateCards,
  activeProposal,
  socialAccounts = []
}) => {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [platformPeriod, setPlatformPeriod] = useState('This Month');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [opportunityScrollIndex, setOpportunityScrollIndex] = useState(0);

  // Top Opportunities data based on verified references
  const topOpportunities = [
    {
      id: 'opp-nike',
      brand: 'Nike',
      category: 'Athletic Wear',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      matchScore: 93,
      budgetRange: '$5,000 - $12,000',
      platforms: ['instagram', 'tiktok', 'youtube'],
      description: 'Summer High-Performance Footwear & Activewear Global Creator Campaign.'
    },
    {
      id: 'opp-gymshark',
      brand: 'Gymshark',
      category: 'Fitness',
      logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100',
      matchScore: 91,
      budgetRange: '$3,500 - $6,500',
      platforms: ['instagram', 'tiktok', 'youtube'],
      description: 'Gymshark Conditioning Retainer & Conditioning Shorts UGC Campaign.'
    },
    {
      id: 'opp-redbull',
      brand: 'Red Bull',
      category: 'Energy Drink',
      logo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=100',
      matchScore: 89,
      budgetRange: '$4,000 - $8,000',
      platforms: ['instagram', 'tiktok', 'youtube'],
      description: 'Extreme Focus & Lifestyle Creator Story Sponsorship.'
    },
    {
      id: 'opp-zaful',
      brand: 'ZAFUL',
      category: 'Fashion',
      logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100',
      matchScore: 86,
      budgetRange: '$2,000 - $4,000',
      platforms: ['instagram', 'tiktok', 'youtube'],
      description: 'Seasonal Streetwear & Aesthetic Lookbook Reel Campaign.'
    }
  ];

  const handleAiAsk = (prompt?: string) => {
    const query = prompt || aiQuery;
    if (!query.trim()) return;
    setIsAiThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiThinking(false);
      const q = query.toLowerCase();
      if (q.includes('value') || q.includes('score')) {
        setAiResponse(`Your Creator Value Score increased to 92/100 (+18% this month). Key growth drivers: 126.4K Reach velocity across Instagram Reels & 6.24% top-tier engagement.`);
      } else if (q.includes('contract') || q.includes('review') || q.includes('risk')) {
        setAiResponse(`Contract X-Ray Sentinel scanned your latest deal: 1 high-risk clause flagged (90-day unpaid usage). Recommended counter: +$650 usage licensing fee.`);
      } else if (q.includes('opportunit') || q.includes('brand')) {
        setAiResponse(`Found 4 high-match sponsorships looking for creators in your niche: Nike (93% Match), Gymshark (91% Match), and Red Bull (89% Match).`);
      } else {
        setAiResponse(`Heimdall AI Co-Pilot: Analyzed your active profile. Your recommended Instagram Reel rate is calibrated at $500 based on recent 24.7K median video views.`);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION & INTEGRATED HEIMDALL AI CO-PILOT CARD   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hero Card with 3D Fluid Metallic Wave backdrop */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[28px] glass-panel p-8 md:p-10 flex flex-col justify-between min-h-[300px]">
          
          {/* Fluid Metallic Wave Background Canvas */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-90 overflow-hidden">
            <svg className="absolute -top-10 -right-10 w-[460px] h-[340px]" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fluidTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="metallicChrome" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#CCFBF1" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#0F766E" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path d="M120 40 C 220 10, 360 90, 480 30 C 520 80, 490 200, 440 280 C 340 220, 200 320, 100 240 C 40 180, 60 80, 120 40 Z" fill="url(#fluidTealGrad)" />
              <path d="M220 70 C 310 40, 420 120, 490 80 C 510 140, 470 230, 400 290 C 320 250, 220 310, 150 250 C 130 180, 160 110, 220 70 Z" fill="url(#metallicChrome)" />
              <circle cx="390" cy="140" r="48" fill="url(#fluidTealGrad)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
              <span>Good morning, {creatorProfile?.creatorName || 'John'}</span>
              <span>👋</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 font-display leading-[1.12]">
              Know your value.<br />
              Build your <span className="text-teal-600">empire.</span>
            </h1>

            <p className="text-zinc-600 text-sm md:text-base leading-relaxed pt-1">
              Heimdall is your intelligent co-pilot for smarter deals, stronger partnerships, and exponential growth.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <button
              id="hero-explore-opportunities-btn"
              onClick={() => onNavigate('Opportunities')}
              className="teal-pill-button px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2.5 cursor-pointer"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Integrated Heimdall AI Co-Pilot Card */}
        <div className="lg:col-span-4 rounded-[28px] glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-zinc-900 tracking-tight font-display">Heimdall AI</h2>
                <p className="text-[10px] text-zinc-500">Your AI Business Co-Pilot</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('AI Assistant')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Open Full AI Workspace"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Glowing Holographic Sphere with soundwave frequency rings */}
          <div className="my-auto py-4 flex flex-col items-center justify-center relative">
            <div className="soundwave-ring" />
            <div className="soundwave-ring" style={{ animationDelay: '1.2s' }} />
            <div className="holographic-orb flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm shadow-inner" />
            </div>

            {aiResponse && (
              <div className="mt-3 p-2.5 rounded-xl bg-teal-50/90 border border-teal-200/80 text-[11px] text-teal-950 max-w-[280px] text-center leading-snug animate-in fade-in zoom-in-95">
                {aiResponse}
              </div>
            )}
            {isAiThinking && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                <span>Heimdall AI is synthesizing creator telemetry...</span>
              </div>
            )}
          </div>

          {/* Quick Input Bar */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="heimdall-ai-input"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                placeholder="Ask Heimdall anything..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-white/90 border border-zinc-200/80 rounded-full text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-inner"
              />
              <button
                id="heimdall-ai-ask-btn"
                onClick={() => handleAiAsk()}
                className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <button
                onClick={() => handleAiAsk('Analyze My Value')}
                className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-teal-50 border border-zinc-200/80 text-zinc-700 hover:text-teal-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Analyze My Value
              </button>
              <button
                onClick={() => handleAiAsk('Review Contract')}
                className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-teal-50 border border-zinc-200/80 text-zinc-700 hover:text-teal-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Review Contract
              </button>
              <button
                onClick={() => handleAiAsk('Find Opportunities')}
                className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-teal-50 border border-zinc-200/80 text-zinc-700 hover:text-teal-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Find Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FOUR PRIMARY METRIC CARDS WITH INTERACTIVE SPARKLINES  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Creator Value Score */}
        <div 
          onClick={() => onNavigate('My Value')}
          className="rounded-[22px] glass-card p-5 cursor-pointer hover:border-teal-400/50 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Creator Value Score</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-700 p-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 font-display">92</span>
            <span className="text-xs font-bold text-zinc-400">/100</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 18% this month</span>
          </div>

          {/* Green Sparkline Curve */}
          <div className="mt-3 h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
              <path d="M0 24 Q 20 28, 35 18 T 65 14 T 100 4" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Earnings */}
        <div 
          onClick={() => onNavigate('Deals')}
          className="rounded-[22px] glass-card p-5 cursor-pointer hover:border-purple-400/50 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Total Earnings</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-700 p-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 font-display">$24,560</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 24% this month</span>
          </div>

          {/* Purple Sparkline Curve */}
          <div className="mt-3 h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
              <path d="M0 26 Q 25 12, 45 22 T 75 10 T 100 5" stroke="#A855F7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 3: Audience Reach */}
        <div 
          onClick={() => onNavigate('Analytics')}
          className="rounded-[22px] glass-card p-5 cursor-pointer hover:border-cyan-400/50 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-700">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Audience Reach</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-700 p-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 font-display">126.4K</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 15% this month</span>
          </div>

          {/* Cyan Sparkline Curve */}
          <div className="mt-3 h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
              <path d="M0 22 Q 20 26, 40 16 T 70 12 T 100 6" stroke="#06B6D4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 4: Engagement Rate */}
        <div 
          onClick={() => onNavigate('Analytics')}
          className="rounded-[22px] glass-card p-5 cursor-pointer hover:border-pink-400/50 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-200/60 flex items-center justify-center text-pink-700">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Engagement Rate</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-700 p-1">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-zinc-900 font-display">6.24%</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-700 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 8% this month</span>
          </div>

          {/* Pink/Magenta Sparkline Curve */}
          <div className="mt-3 h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
              <path d="M0 25 Q 30 15, 50 24 T 80 8 T 100 12" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MIDDLE SECTION: AUDIENCE GROWTH CHART & PLATFORMS      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Audience Growth Animated Chart */}
        <div className="lg:col-span-8 rounded-[28px] glass-panel p-6 md:p-7 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 font-display">Audience Growth</h2>
              <p className="text-xs text-zinc-500">Total followers across all platforms</p>
            </div>

            {/* Timeframe selector pills */}
            <div className="flex items-center p-1 bg-zinc-100/90 rounded-full border border-zinc-200/60 text-xs font-semibold">
              {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-extrabold text-zinc-900 font-display">126.4K</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ↑ 15%
            </span>
          </div>

          {/* Area Chart Vector Graphic */}
          <div className="mt-6 relative h-48 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartTealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d="M 0 160 L 50 145 L 100 135 L 150 120 L 200 125 L 250 95 L 300 90 L 350 70 L 400 65 L 450 40 L 500 20 L 500 170 L 0 170 Z"
                fill="url(#chartTealGrad)"
              />

              {/* Stroke Line */}
              <path
                d="M 0 160 L 50 145 L 100 135 L 150 120 L 200 125 L 250 95 L 300 90 L 350 70 L 400 65 L 450 40 L 500 20"
                stroke="#0D9488"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              <circle cx="50" cy="145" r="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
              <circle cx="150" cy="120" r="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
              <circle cx="250" cy="95" r="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
              <circle cx="350" cy="70" r="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
              <circle cx="450" cy="40" r="4" fill="#FFFFFF" stroke="#0D9488" strokeWidth="2.5" />
              <circle cx="500" cy="20" r="5" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="3" />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] font-semibold text-zinc-400 pt-2">
              <span>May 1</span>
              <span>May 15</span>
              <span>May 31</span>
              <span>Jun 15</span>
              <span className="text-teal-700 font-bold">Today</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Top Platform Performance */}
        <div className="lg:col-span-4 rounded-[28px] glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-100/80 pb-3">
            <h2 className="text-sm font-extrabold text-zinc-900 font-display">Top Platform Performance</h2>
            <select
              value={platformPeriod}
              onChange={(e) => setPlatformPeriod(e.target.value)}
              className="text-[11px] font-bold text-zinc-600 bg-zinc-100/80 border border-zinc-200/80 rounded-lg px-2 py-1 outline-none"
            >
              <option>This Month</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
          </div>

          <div className="space-y-4 py-2">
            {/* Instagram */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-800">
                  <div className="w-5 h-5 rounded bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <span>Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">89.4K</span>
                  <span className="text-[10px] font-bold text-emerald-700">↑ 18%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            {/* TikTok */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-800">
                  <div className="w-5 h-5 rounded bg-zinc-900 text-white flex items-center justify-center text-[9px] font-bold">
                    TK
                  </div>
                  <span>TikTok</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">24.7K</span>
                  <span className="text-[10px] font-bold text-emerald-700">↑ 21%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>

            {/* YouTube */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-800">
                  <div className="w-5 h-5 rounded bg-red-50 text-red-600 flex items-center justify-center">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                  <span>YouTube</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">8.6K</span>
                  <span className="text-[10px] font-bold text-emerald-700">↑ 12%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-800">
                  <div className="w-5 h-5 rounded bg-zinc-100 text-zinc-800 flex items-center justify-center">
                    <Twitter className="w-3.5 h-3.5" />
                  </div>
                  <span>X (Twitter)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">3.7K</span>
                  <span className="text-[10px] font-bold text-emerald-700">↑ 7%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-800">
                  <div className="w-5 h-5 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Linkedin className="w-3.5 h-3.5" />
                  </div>
                  <span>LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">312</span>
                  <span className="text-[10px] font-bold text-emerald-700">↑ 3%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RECENT ACTIVITY & UPCOMING DEADLINES                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-6 rounded-[28px] glass-panel p-6">
          <div className="flex items-center justify-between border-b border-zinc-100/80 pb-3 mb-4">
            <h2 className="text-sm font-extrabold text-zinc-900 font-display">Recent Activity</h2>
            <button 
              onClick={() => onNavigate('Deals')}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              View all
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900">Rate card updated</p>
                  <span className="text-[10px] text-zinc-400">2m ago</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">Reel rate recommended to $500</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900">New opportunity</p>
                  <span className="text-[10px] text-zinc-400">18m ago</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">Nike invited you to collaborate</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900">Contract analyzed</p>
                  <span className="text-[10px] text-zinc-400">1h ago</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">High-risk clauses detected</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-900">Campaign approved</p>
                  <span className="text-[10px] text-zinc-400">3h ago</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">Summer Drop Campaign</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines & Calls */}
        <div className="lg:col-span-6 rounded-[28px] glass-panel p-6">
          <div className="flex items-center justify-between border-b border-zinc-100/80 pb-3 mb-4">
            <h2 className="text-sm font-extrabold text-zinc-900 font-display">Upcoming</h2>
            <button 
              onClick={() => onNavigate('Campaigns')}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              View all
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/80 border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900">Content Deadline</h3>
                  <p className="text-[11px] text-zinc-500">Nike Summer Campaign • May 24, 2025</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                2 days left
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/80 border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900">Brand Call</h3>
                  <p className="text-[11px] text-zinc-500">Red Bull Collaboration • May 26, 2025</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-bold">
                4 days left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. TOP OPPORTUNITIES FOR YOU (HORIZONTAL GLASS CARDS)    */}
      {/* ========================================================= */}
      <div className="rounded-[28px] glass-panel p-6 md:p-8">
        <div className="flex items-center justify-between pb-5">
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-zinc-900 font-display">Top Opportunities for You</h2>
            <p className="text-xs text-zinc-500">Brands actively looking to collaborate based on your audience telemetry</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('Opportunities')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors mr-2"
            >
              View all
            </button>
            <button 
              onClick={() => setOpportunityScrollIndex(Math.max(0, opportunityScrollIndex - 1))}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setOpportunityScrollIndex(Math.min(topOpportunities.length - 2, opportunityScrollIndex + 1))}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => onNavigate('Opportunities')}
              className="rounded-[22px] glass-card p-4 hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                    {opp.brand.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-zinc-900 group-hover:text-teal-700 transition-colors">{opp.brand}</h3>
                    <p className="text-[10px] text-zinc-500">{opp.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700 block">High Match</span>
                  <span className="text-base font-extrabold text-teal-700 font-display">{opp.matchScore}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Campaign Budget</span>
                  <span className="text-xs font-extrabold text-zinc-900 font-display">{opp.budgetRange}</span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Instagram className="w-3 h-3 text-pink-600" />
                  <span className="text-[9px] font-bold text-zinc-700">TK</span>
                  <Youtube className="w-3 h-3 text-red-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
