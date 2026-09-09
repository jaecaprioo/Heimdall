import React, { useState } from 'react';
import { 
  CreatorProfile, 
  RateCardServiceItem, 
  RateCardProposal, 
  AuditLogEntry, 
  RateCardSettings,
  SocialMetricsSnapshot,
  PlatformId
} from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  RotateCcw, 
  Zap, 
  Layers, 
  Clock, 
  DollarSign, 
  Flame, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Check, 
  AlertTriangle, 
  Info,
  Calendar,
  History,
  Tag,
  Share2,
  ExternalLink,
  ChevronRight,
  Plus,
  Award,
  Users,
  Target
} from 'lucide-react';

interface CreatorIntelligenceViewProps {
  creatorProfile: CreatorProfile;
  rateCards: RateCardServiceItem[];
  activeProposal: RateCardProposal | null;
  snapshots: SocialMetricsSnapshot[];
  auditLogs: AuditLogEntry[];
  settings: RateCardSettings;
  onAcceptProposal: (proposalId: string, services?: RateCardServiceItem[]) => void;
  onRejectProposal: (proposalId: string) => void;
  onUpdateServicePrice: (serviceKey: string, customPrice: number) => void;
  onRestorePreviousPrice: (serviceKey: string) => void;
  onToggleAutoUpdate: (enabled: boolean) => void;
  onApproveNicheEvolution?: (suggestedNiches: string[]) => void;
  onRejectNicheEvolution?: () => void;
  onNavigate: (tab: string) => void;
}

export default function CreatorIntelligenceView({
  creatorProfile,
  rateCards,
  activeProposal,
  snapshots,
  auditLogs,
  settings,
  onAcceptProposal,
  onRejectProposal,
  onUpdateServicePrice,
  onRestorePreviousPrice,
  onToggleAutoUpdate,
  onApproveNicheEvolution,
  onRejectNicheEvolution,
  onNavigate
}: CreatorIntelligenceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my_value' | 'rate_card' | 'timeline' | 'audit_log'>('my_value');
  const [editingServiceKey, setEditingServiceKey] = useState<string | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState<number>(0);

  const valueFactors = [
    { name: 'Audience Quality', score: 94, delta: '+4%', desc: 'Verified 88% tier-1 geographic concentration' },
    { name: 'Engagement Rate', score: 96, delta: '+6%', desc: '6.24% top-quartile benchmark performance' },
    { name: 'Content Performance', score: 91, delta: '+8%', desc: '24.7K median video views per published Reel' },
    { name: 'Growth Velocity', score: 95, delta: '+15%', desc: '+18.4% follower breakout across Q2' },
    { name: 'Brand Demand Index', score: 89, delta: '+12%', desc: '4 active Tier-1 sponsor inquiries pending' },
    { name: 'Contract Reliability', score: 98, delta: '+2%', desc: '100% on-time milestone delivery score' },
  ];

  // Default sample service items if empty
  const displayRates: RateCardServiceItem[] = rateCards.length > 0 ? rateCards : [
    {
      id: 'rc-1',
      serviceKey: 'instagram_reel',
      name: 'Instagram Reel (60s Dedicated)',
      platform: 'instagram',
      deliverableType: 'Reel',
      currentPrice: 250,
      previousPrice: 150,
      recommendedPrice: 500,
      priceChangePercentage: 100,
      confidenceScore: 94,
      pricingRationale: 'Your audience doubled and recent content performance increased significantly (+100% calibration).',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc-2',
      serviceKey: 'tiktok_video',
      name: 'TikTok High-Energy UGC Video',
      platform: 'tiktok',
      deliverableType: 'Video',
      currentPrice: 200,
      previousPrice: 120,
      recommendedPrice: 420,
      priceChangePercentage: 110,
      confidenceScore: 91,
      pricingRationale: 'Strong viral coefficient and 5.2% engagement rate across short-form videos.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc-3',
      serviceKey: 'youtube_integration',
      name: 'YouTube 60-90s Dedicated Sponsor Segment',
      platform: 'youtube',
      deliverableType: 'Integration',
      currentPrice: 600,
      previousPrice: 450,
      recommendedPrice: 1200,
      priceChangePercentage: 100,
      confidenceScore: 96,
      pricingRationale: 'High retention long-form tech & lifestyle audience with 8.6K average views.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc-4',
      serviceKey: 'story_set',
      name: 'Instagram Story Frame Trio (with Link Sticker)',
      platform: 'instagram',
      deliverableType: 'Story',
      currentPrice: 100,
      previousPrice: 75,
      recommendedPrice: 220,
      priceChangePercentage: 120,
      confidenceScore: 89,
      pricingRationale: 'Direct click-through rate averages 3.8% across active broadcast channels.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    }
  ];

  const handleStartEdit = (service: RateCardServiceItem) => {
    setEditingServiceKey(service.serviceKey);
    setCustomPriceInput(service.currentPrice);
  };

  const handleSaveCustomPrice = (serviceKey: string) => {
    if (customPriceInput > 0) {
      onUpdateServicePrice(serviceKey, customPriceInput);
    }
    setEditingServiceKey(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Valuation & Rate Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Creator Value & Automatic Rate Card
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Real-time telemetry translates your audience momentum into verifiable commercial pricing.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center p-1 bg-white/80 border border-zinc-200/80 rounded-full shadow-sm text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('my_value')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'my_value'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            My Value Score
          </button>
          <button
            onClick={() => setActiveSubTab('rate_card')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'rate_card'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Dynamic Rate Card
          </button>
          <button
            onClick={() => setActiveSubTab('audit_log')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeSubTab === 'audit_log'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MY VALUE SCORE SIGNATURE VIEW                      */}
      {/* ========================================================= */}
      {activeSubTab === 'my_value' && (
        <div className="space-y-6">
          
          {/* Signature Value Hero Card */}
          <div className="rounded-[28px] glass-panel p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Score Radar / Circular Graphic */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      stroke="#0D9488" 
                      strokeWidth="8" 
                      strokeDasharray="264" 
                      strokeDashoffset="21" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold text-zinc-900 font-display">92</span>
                    <span className="text-xs font-bold text-zinc-400">/ 100</span>
                    <span className="mt-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Tier 1 Elite
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Your value increased 18% this month</span>
                </div>
              </div>

              {/* Right Why Your Value Increased Factors */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 font-display">Why Your Commercial Valuation Surged</h3>
                  <p className="text-xs text-zinc-500">Heimdall's autonomous intelligence engine analyzed 12,000+ brand sponsorships</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {valueFactors.map((f, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-zinc-900">{f.name}</span>
                        <div className="flex items-center gap-1 font-bold">
                          <span className="text-zinc-900">{f.score}%</span>
                          <span className="text-[10px] text-emerald-700">{f.delta}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500">{f.desc}</p>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden mt-2">
                        <div className="h-full bg-teal-600 rounded-full" style={{ width: `${f.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions / Integration link */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveSubTab('rate_card')}
              className="rounded-2xl glass-card p-5 cursor-pointer hover:border-teal-400 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900">Dynamic Rate Card</h4>
                  <p className="text-[11px] text-zinc-500">Recalibrate deliverable pricing</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            <div 
              onClick={() => onNavigate('Media Kit')}
              className="rounded-2xl glass-card p-5 cursor-pointer hover:border-cyan-400 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900">Publish Media Kit</h4>
                  <p className="text-[11px] text-zinc-500">Export verified partner deck</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            <div 
              onClick={() => onNavigate('Opportunities')}
              className="rounded-2xl glass-card p-5 cursor-pointer hover:border-purple-400 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900">Matched Sponsors</h4>
                  <p className="text-[11px] text-zinc-500">4 brand inquiries available</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AUTOMATIC DYNAMIC RATE CARD MATRIX                 */}
      {/* ========================================================= */}
      {activeSubTab === 'rate_card' && (
        <div className="space-y-6">
          
          {/* Active Proposal Notification Banner if available */}
          <div className="rounded-[24px] bg-gradient-to-r from-teal-800 to-teal-950 text-white p-6 md:p-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Autonomous Calibration Proposal Ready</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold font-display">
                Instagram Reel Rate Recommendation: $250 → $500 (+100%)
              </h2>
              <p className="text-xs md:text-sm text-teal-100/90 leading-relaxed">
                "Your verified audience doubled and recent content performance increased significantly (+24.7K median Reel views)."
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onAcceptProposal('proposal_auto_1', displayRates)}
                  className="px-6 py-2.5 rounded-full bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Accept Recommendation ($500)
                </button>
                <button
                  onClick={() => handleStartEdit(displayRates[0])}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  Custom Edit
                </button>
                <button
                  onClick={() => onRejectProposal('proposal_auto_1')}
                  className="px-4 py-2.5 text-xs text-teal-200/80 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {/* Rate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayRates.map((service) => (
              <div key={service.serviceKey} className="rounded-[24px] glass-card p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 font-display">{service.name}</h3>
                      <span className="text-[10px] text-zinc-400">Confidence Score: {service.confidenceScore || 94}%</span>
                    </div>

                    <button
                      onClick={() => handleStartEdit(service)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title="Edit Custom Price"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {editingServiceKey === service.serviceKey ? (
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 block">Set Custom Rate ($)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={customPriceInput}
                          onChange={(e) => setCustomPriceInput(Number(e.target.value))}
                          className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold outline-none focus:border-teal-500"
                        />
                        <button
                          onClick={() => handleSaveCustomPrice(service.serviceKey)}
                          className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingServiceKey(null)}
                          className="px-2 py-1.5 text-xs text-zinc-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between pt-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">Current Rate</span>
                        <span className="text-2xl font-extrabold text-zinc-900 font-display">
                          ${service.currentPrice}
                        </span>
                      </div>

                      {service.recommendedPrice && service.recommendedPrice > service.currentPrice && (
                        <div className="text-right">
                          <span className="text-[10px] text-teal-700 font-bold uppercase block">AI Calibration</span>
                          <span className="text-xl font-extrabold text-teal-700 font-display">
                            ${service.recommendedPrice}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                    {service.pricingRationale || 'Calibrated against 126K verified audience reach and 6.24% top-tier engagement.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Market Range: ${Math.round(service.currentPrice * 0.85)} - ${Math.round(service.currentPrice * 1.35)}</span>
                  <button
                    onClick={() => onUpdateServicePrice(service.serviceKey, service.recommendedPrice || service.currentPrice + 100)}
                    className="text-teal-700 font-bold hover:underline"
                  >
                    Apply New Rate →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUDIT LOG                                          */}
      {/* ========================================================= */}
      {activeSubTab === 'audit_log' && (
        <div className="rounded-[28px] glass-panel p-6 md:p-8 space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Rate Card Audit & Telemetry Log</h3>
            <p className="text-xs text-zinc-500">Verifiable tamper-evident log of all rate updates, calibrations, and creator overrides.</p>
          </div>

          <div className="space-y-3 pt-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{log.title}</span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {log.userAction}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap ml-4">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/70 text-xs text-zinc-600">
                Rate card calibrated: Reel rate set to $500 based on verified audience growth.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
