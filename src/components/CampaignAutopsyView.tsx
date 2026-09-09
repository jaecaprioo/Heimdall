import React, { useState } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  ArrowRight, 
  RefreshCw, 
  RotateCcw,
  Zap,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import { CampaignAutopsy, BrandProfile } from '../types';

interface CampaignAutopsyViewProps {
  brandProfile?: BrandProfile | null;
  onNavigate?: (tab: string) => void;
  onReactivateCreator?: (creatorName: string, suggestedBudget: number) => void;
}

export default function CampaignAutopsyView({
  brandProfile,
  onNavigate,
  onReactivateCreator
}: CampaignAutopsyViewProps) {
  const [activeView, setActiveView] = useState<'autopsy' | 'builder'>('autopsy');
  const [selectedCampaignId, setSelectedCampaignId] = useState('camp_q1_gymshark');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Campaign Builder States
  const [builderBudget, setBuilderBudget] = useState(15000);
  const [builderGoal, setBuilderGoal] = useState('Conversions & UGC Ad Whitelisting');
  const [builderNiche, setBuilderNiche] = useState('Fitness & Activewear');
  const [isGeneratingMix, setIsGeneratingMix] = useState(false);
  const [aiCreatorMix, setAiCreatorMix] = useState<any | null>(null);

  const autopsyData: CampaignAutopsy = {
    id: 'autopsy_q1_2026',
    campaignId: 'camp_q1_gymshark',
    campaignTitle: 'Spring High-Performance Capsule Launch',
    brandName: brandProfile?.companyName || 'Gymshark',
    totalBudget: 15000,
    actualSpend: 14250,
    creatorsEngaged: 6,
    totalDeliverablesCompleted: 14,
    totalImpressions: 540000,
    totalReach: 430000,
    totalEngagements: 41200,
    averageEngagementRate: 7.6,
    costPerView: 0.026,
    costPerEngagement: 0.34,
    roiScore: 4.4,
    whatWorked: [
      'Short-form vertical video (Reels & TikTok) generated 76% of all product page click-throughs at $0.02 CPV.',
      'Authentic "failure to recovery" routine videos by Alex Rivers drove 3.4x higher watch retention than polished studio b-roll.',
      'Story frames with direct discount code stickers generated $38,500 in tracked affiliate sales within 72 hours.'
    ],
    whatDidnt: [
      'Static Instagram photo carousel posts underperformed, consuming 20% of budget but driving under 7% of total sales.',
      'One creator submitted final cut 4 days late due to lack of a mid-way storyboard checkpoint.'
    ],
    topPerformingCreators: [
      {
        name: 'Alex Rivers',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        platform: 'instagram',
        views: 195000,
        engagementRate: 8.6,
        costEfficiencyScore: 98,
        recommendForFuture: true
      },
      {
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        platform: 'tiktok',
        views: 160000,
        engagementRate: 9.1,
        costEfficiencyScore: 94,
        recommendForFuture: true
      },
      {
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        platform: 'youtube',
        views: 110000,
        engagementRate: 6.4,
        costEfficiencyScore: 89,
        recommendForFuture: true
      }
    ],
    bestPerformingPlatform: 'Instagram Reels (4K) & TikTok Short-Form',
    recommendationsForNextCampaign: [
      'Shift 100% of upcoming campaign budget into vertical short-form video (Reels/TikTok/Shorts).',
      'Contract 90-day paid Meta ad whitelisting upfront with Alex Rivers & Marcus Vance.',
      'Incorporate a 3-day Storyboard approval milestone into the Deal Room contract.'
    ],
    reactivationOpportunities: [
      {
        creatorId: 'cr_alex_rivers',
        creatorName: 'Alex Rivers',
        reason: 'Drove 42% of total campaign conversions at an extraordinary $0.019 Cost Per View. High audience loyalty.',
        proposedAngle: '3-Month Ambassador Retainer for Summer Capsule Drop with dedicated promo code',
        suggestedBudget: 4500,
        priority: 'HIGH'
      },
      {
        creatorId: 'cr_marcus_vance',
        creatorName: 'Marcus Vance',
        reason: 'Viral TikTok surge reached 160K organic views with 9.1% engagement.',
        proposedAngle: 'Spark Ad Whitelisting + 2x Dedicated TikTok Challenge videos',
        suggestedBudget: 2800,
        priority: 'HIGH'
      }
    ]
  };

  const handleGenerateCreatorMix = () => {
    setIsGeneratingMix(true);
    setTimeout(() => {
      setAiCreatorMix({
        recommendedBudgetSplit: [
          { tier: '1x Anchor Authority Creator (Alex Rivers)', allocation: '$4,500 (30%)', deliverables: '2x 4K Reels + 90-day Whitelist' },
          { tier: '3x High-Velocity Mid-Tier Creators', allocation: '$6,000 (40%)', deliverables: '3x TikTok UGC + 6x Story frames' },
          { tier: '5x Authentic Micro-Affiliates', allocation: '$3,000 (20%)', deliverables: '5x Product Unboxings + Affiliate codes' },
          { tier: 'Performance Whitelisting Ad Reserve', allocation: '$1,500 (10%)', deliverables: 'Meta Spark Ad Boosts' }
        ],
        targetKpis: {
          expectedImpressions: '650,000 - 850,000',
          estimatedCpv: '$0.018 - $0.024',
          projectedSalesVolume: '$45,000 - $70,000'
        }
      });
      setIsGeneratingMix(false);
    }, 800);
  };

  return (
    <div id="campaign-autopsy-container" className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#0E131F] border border-[#00C8FF]/20 rounded-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00C8FF]/10 border border-[#00C8FF]/20 rounded-xl text-[#00C8FF]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00C8FF] font-bold">
                  Campaign Intelligence Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">
                  Continuous Learning Loop
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                Campaign Autopsy & Memory Engine
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Deep analytical post-mortem, cost efficiency metrics, and relationship reactivation recommendations.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl">
            <button
              id="tab-autopsy-toggle"
              onClick={() => setActiveView('autopsy')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                activeView === 'autopsy' ? 'bg-[#00C8FF] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Campaign Autopsy
            </button>
            <button
              id="tab-builder-toggle"
              onClick={() => setActiveView('builder')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                activeView === 'builder' ? 'bg-[#00C8FF] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              AI Campaign Builder
            </button>
          </div>
        </div>
      </div>

      {activeView === 'autopsy' ? (
        <div className="space-y-6">
          {/* Executive KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Actual Spend</span>
              <p className="text-xl font-bold font-mono text-white">${autopsyData.actualSpend.toLocaleString()}</p>
              <span className="text-[10px] text-zinc-400 font-mono">Budget: ${autopsyData.totalBudget.toLocaleString()}</span>
            </div>

            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Verified Reach</span>
              <p className="text-xl font-bold font-mono text-white">{autopsyData.totalReach.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-400 font-mono">{autopsyData.totalImpressions.toLocaleString()} Impr</span>
            </div>

            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Engagements</span>
              <p className="text-xl font-bold font-mono text-[#00C8FF]">{autopsyData.totalEngagements.toLocaleString()}</p>
              <span className="text-[10px] text-zinc-400 font-mono">{autopsyData.averageEngagementRate}% Avg Eng</span>
            </div>

            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Cost Per View (CPV)</span>
              <p className="text-xl font-bold font-mono text-[#00E676]">${autopsyData.costPerView.toFixed(3)}</p>
              <span className="text-[10px] text-emerald-400 font-mono">Top 5% Efficiency</span>
            </div>

            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Cost Per Eng (CPE)</span>
              <p className="text-xl font-bold font-mono text-white">${autopsyData.costPerEngagement.toFixed(2)}</p>
              <span className="text-[10px] text-zinc-400 font-mono">Benchmark: $0.65</span>
            </div>

            <div className="p-4 bg-[#0D1117] border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Campaign ROI</span>
              <p className="text-xl font-bold font-mono text-[#00E676]">{autopsyData.roiScore}x</p>
              <span className="text-[10px] text-emerald-400 font-mono">Above Target</span>
            </div>
          </div>

          {/* Autopsy Diagnosis: What Worked vs What Didn't */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#0D1117] border border-emerald-500/20 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>What Worked (High ROI Multipliers)</span>
              </h3>
              <ul className="space-y-3 text-xs text-zinc-300 font-mono">
                {autopsyData.whatWorked.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 bg-black/30 rounded-xl border border-emerald-500/10">
                    <span className="text-emerald-400 font-bold shrink-0">✦</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-[#0D1117] border border-amber-500/20 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>What Didn't (Optimization Learnings)</span>
              </h3>
              <ul className="space-y-3 text-xs text-zinc-300 font-mono">
                {autopsyData.whatDidnt.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 bg-black/30 rounded-xl border border-amber-500/10">
                    <span className="text-amber-400 font-bold shrink-0">⚠</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Performing Creators Table */}
          <div className="p-6 bg-[#0D1117] border border-white/5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00C8FF]" />
              <span>Top-Performing Campaign Creators</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {autopsyData.topPerformingCreators.map((creator, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{creator.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{creator.views.toLocaleString()} views • {creator.engagementRate}% eng</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block">Efficiency</span>
                    <span className="text-xs font-bold font-mono text-[#00E676]">{creator.costEfficiencyScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relationship Reactivation Engine */}
          <div className="p-6 bg-[#0E131F] border border-[#00C8FF]/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#00C8FF]" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Relationship Memory: High-Value Reactivations
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/20 text-[10px] font-mono">
                AI Partnership Retention
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {autopsyData.reactivationOpportunities.map((reac, i) => (
                <div key={i} className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-mono">{reac.creatorName}</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                        {reac.priority} PRIORITY REHIRE
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <strong>Historical Insight:</strong> {reac.reason}
                    </p>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-mono text-[#00C8FF]">
                      <strong>Proposed Next Pitch:</strong> {reac.proposedAngle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">Suggested Budget:</span>
                      <strong className="text-sm font-mono font-bold text-white">${reac.suggestedBudget.toLocaleString()}</strong>
                    </div>

                    <button
                      id={`reactivate-btn-${reac.creatorId}`}
                      onClick={() => {
                        if (onReactivateCreator) onReactivateCreator(reac.creatorName, reac.suggestedBudget);
                        if (onNavigate) onNavigate('Deals');
                      }}
                      className="px-4 py-2 bg-[#00C8FF] hover:bg-[#32E8FF] text-black font-bold font-mono text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>Reactivate in Deal Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AI Campaign Builder View */
        <div className="p-6 bg-[#0D1117] border border-white/5 rounded-2xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white font-mono">
              AI Campaign Architect & Creator Mix Allocator
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Enter target parameters to receive deterministic creator mix recommendations and deliverables breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Total Campaign Budget ($)</label>
              <input
                type="number"
                value={builderBudget}
                onChange={(e) => setBuilderBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-[#00C8FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Primary Campaign Objective</label>
              <input
                type="text"
                value={builderGoal}
                onChange={(e) => setBuilderGoal(e.target.value)}
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-[#00C8FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Category / Niche</label>
              <input
                type="text"
                value={builderNiche}
                onChange={(e) => setBuilderNiche(e.target.value)}
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-[#00C8FF] focus:outline-none"
              />
            </div>
          </div>

          <button
            id="build-creator-mix-btn"
            onClick={handleGenerateCreatorMix}
            disabled={isGeneratingMix}
            className="w-full py-3 bg-[#00C8FF] hover:bg-[#32E8FF] text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
          >
            {isGeneratingMix ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing Creator Mix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Optimized Creator Mix</span>
              </>
            )}
          </button>

          {aiCreatorMix && (
            <div className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Recommended Budget Allocation
              </h4>

              <div className="space-y-3">
                {aiCreatorMix.recommendedBudgetSplit.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-white font-mono">{item.tier}</h5>
                      <p className="text-xs text-zinc-400">{item.deliverables}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-[#00E676]">{item.allocation}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-black/40 border border-white/5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">Projected Total Impressions</span>
                  <span className="text-sm font-bold font-mono text-white">{aiCreatorMix.targetKpis.expectedImpressions}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">Target CPV</span>
                  <span className="text-sm font-bold font-mono text-[#00C8FF]">{aiCreatorMix.targetKpis.estimatedCpv}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">Estimated Sales Lift</span>
                  <span className="text-sm font-bold font-mono text-[#00E676]">{aiCreatorMix.targetKpis.projectedSalesVolume}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
