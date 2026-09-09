import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  ArrowRight, 
  Search, 
  RefreshCw,
  Scale,
  Zap,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Target
} from 'lucide-react';
import { CreatorProfile, BrandProfile } from '../types';

interface OpportunityIntelligenceViewProps {
  creatorProfile?: CreatorProfile | null;
  brandProfile?: BrandProfile | null;
  isBrandMode: boolean;
  onNavigate: (tab: string) => void;
}

export default function OpportunityIntelligenceView({
  creatorProfile,
  brandProfile,
  isBrandMode,
  onNavigate
}: OpportunityIntelligenceViewProps) {
  const [savedIds, setSavedIds] = useState<string[]>(['opp-1']);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'high_match' | 'high_budget'>('all');

  const opportunities = [
    {
      id: 'opp-1',
      brand: 'Nike Running',
      brandLogo: 'NIKE',
      campaignTitle: 'Nike Air Max Pulse Summer Launch Campaign',
      budget: '$5,000 – $12,000',
      matchScore: 94,
      deliverables: '2x Instagram 4K Reels + 3x Story Frames with sticker',
      requirements: 'Fitness/Running creator, >50K reach, >4% engagement, >60% US/EU audience',
      deadline: 'Net 7 Days',
      status: 'Accepting Proposals',
      aiFitReason: 'Your audience is 62% US fitness enthusiasts with an engagement rate of 6.24%, perfectly matching Nike’s Tier-1 Q3 campaign target.'
    },
    {
      id: 'opp-2',
      brand: 'Gymshark',
      brandLogo: 'GYM',
      campaignTitle: 'Q3 Apex Conditioning Ambassador Retainer',
      budget: '$3,500 – $6,500 / mo',
      matchScore: 91,
      deliverables: '1x Dedicated TikTok UGC + 1x IG Reel per month',
      requirements: 'Dedicated gym athlete, high production value, aesthetic storytelling',
      deadline: 'Rolling 30-Day',
      status: 'Open Applications',
      aiFitReason: 'High visual fidelity and your historical Gymshark case study has an undeniable 98% trust score.'
    },
    {
      id: 'opp-3',
      brand: 'Whoop',
      brandLogo: 'WHOOP',
      campaignTitle: 'Whoop 4.0 Recovery & Strain Deep Dive',
      budget: '$4,000 – $7,500',
      matchScore: 88,
      deliverables: '1x Long-form YouTube mid-roll integration + 2x IG Stories',
      requirements: 'Track recovery data in content, tech-savvy bio-hacking or training audience',
      deadline: 'Net 14 Days',
      status: 'Accepting Proposals',
      aiFitReason: 'Strong overlap between high-performance athletic lifestyle and biometric tech interest.'
    }
  ];

  const toggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(i => i !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const handleApply = (id: string) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds([...appliedIds, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Intelligent Sponsorship Marketplace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Active Campaign Opportunities
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            AI-matched brand briefs scored against your verified demographic telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/80 border border-zinc-200/80 rounded-full shadow-sm text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-teal-700 text-white font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Briefs
          </button>
          <button
            onClick={() => setFilterType('high_match')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              filterType === 'high_match' ? 'bg-teal-700 text-white font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            &gt;90% Match Only
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-6">
        {opportunities
          .filter(o => filterType === 'all' || (filterType === 'high_match' && o.matchScore >= 90))
          .map((opp) => (
            <div 
              key={opp.id} 
              className="rounded-[28px] glass-card p-6 md:p-8 space-y-6 border border-white hover:border-teal-400 transition-all shadow-sm"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    {opp.brandLogo}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{opp.brand}</span>
                    <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 font-display">{opp.campaignTitle}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>{opp.matchScore}% Match Score</span>
                  </div>
                  <button
                    onClick={() => toggleSave(opp.id)}
                    className="p-2 rounded-full bg-zinc-100 hover:bg-teal-50 text-zinc-600 hover:text-teal-700 transition-colors"
                  >
                    {savedIds.includes(opp.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-teal-700" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Campaign Budget</span>
                  <span className="text-lg font-extrabold text-zinc-900 font-display">{opp.budget}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Verified Escrow Ready</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Deliverables Scope</span>
                  <p className="text-xs font-bold text-zinc-800 mt-1">{opp.deliverables}</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Creator Requirements</span>
                  <p className="text-xs text-zinc-600 mt-1">{opp.requirements}</p>
                </div>
              </div>

              {/* AI Fit Explainer Banner */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-teal-950 block">Why you match this deal:</span>
                  <p className="text-xs text-teal-900/90 leading-relaxed mt-0.5">{opp.aiFitReason}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-zinc-400">Response timeframe: {opp.deadline}</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('Deals')}
                    className="px-5 py-2 rounded-full bg-white border border-zinc-200/90 hover:border-zinc-300 text-zinc-800 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Propose Custom Counter
                  </button>

                  <button
                    onClick={() => handleApply(opp.id)}
                    disabled={appliedIds.includes(opp.id)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                      appliedIds.includes(opp.id)
                        ? 'bg-emerald-700 text-white'
                        : 'teal-pill-button'
                    }`}
                  >
                    {appliedIds.includes(opp.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Proposal Submitted</span>
                      </>
                    ) : (
                      <>
                        <span>Apply with Rate Card</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
      </div>

    </div>
  );
}
