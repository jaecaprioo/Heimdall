import React, { useState } from 'react';
import { Brand, SavedBrand, CreatorProfile } from '../types';
import { 
  Search, 
  Compass, 
  Send, 
  ArrowRight
} from 'lucide-react';

interface DiscoveryViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  onSaveBrand: (brand: Brand) => void;
  onUnsaveBrand: (brandId: string) => void;
  onSelectBrandForAction: (brand: Brand, actionType: 'pitch' | 'campaign') => void;
}

export default function DiscoveryView({
  onSelectBrandForAction
}: DiscoveryViewProps) {
  const [viewMode, setViewMode] = useState<'creators' | 'brands'>('creators');
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('All');
  const [minTrustScore] = useState(80);

  // Sample Creators for Brands to discover
  const sampleCreators = [
    {
      id: 'cr-1',
      name: 'Alex Rivers',
      handle: '@alexrivers.fit',
      niche: 'Fitness & Athletics',
      followers: '126.4K',
      engagement: '6.24%',
      country: 'United States',
      trustScore: 98,
      valuationScore: 92,
      baseRate: '$500',
      avatar: 'AR',
      bio: 'High-intensity conditioning, apparel performance reviews & daily athletic motivation.'
    },
    {
      id: 'cr-2',
      name: 'Sophia Vance',
      handle: '@sophia.tech',
      niche: 'Tech & Productivity',
      followers: '88.2K',
      engagement: '5.8%',
      country: 'Canada',
      trustScore: 96,
      valuationScore: 89,
      baseRate: '$650',
      avatar: 'SV',
      bio: 'Minimalist workspace architectures, software integrations & engineering setups.'
    },
    {
      id: 'cr-3',
      name: 'Liam Chen',
      handle: '@liamvisuals',
      niche: 'Photography & UGC',
      followers: '210.5K',
      engagement: '7.1%',
      country: 'United Kingdom',
      trustScore: 99,
      valuationScore: 95,
      baseRate: '$850',
      avatar: 'LC',
      bio: 'Cinematic 4K color grading, camera equipment testing & commercial visual storytelling.'
    }
  ];

  // Sample Brands for Creators to discover
  const sampleBrands = [
    {
      id: 'br-1',
      name: 'Nike Running',
      industry: 'Athletic Footwear & Apparel',
      activeBudget: '$5,000 - $15,000',
      openOpportunities: 3,
      trustScore: 99,
      matchScore: 94,
      targetCountries: 'US, UK, CA',
      notes: 'Seeking marathon trainers & urban runners for Q3 Air Max campaign.'
    },
    {
      id: 'br-2',
      name: 'Gymshark',
      industry: 'Fitness Apparel & Conditioning',
      activeBudget: '$3,500 - $8,000',
      openOpportunities: 2,
      trustScore: 97,
      matchScore: 92,
      targetCountries: 'Global',
      notes: 'Ongoing monthly ambassador retainers for dedicated gym creators.'
    },
    {
      id: 'br-3',
      name: 'Notion',
      industry: 'Productivity Software',
      activeBudget: '$2,000 - $6,000',
      openOpportunities: 4,
      trustScore: 98,
      matchScore: 88,
      targetCountries: 'US, EU',
      notes: 'Sponsoring creators sharing workflow systems and template architectures.'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-teal-700" />
            <span>Intelligent Partnership Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 font-display">
            Discover Verified Talent & Brands
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 font-medium mt-1">
            Explore autonomous talent ratings, open campaign budgets, and verified trust passports.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center p-1 bg-white border border-zinc-200/90 rounded-full shadow-sm text-xs font-bold">
          <button
            onClick={() => setViewMode('creators')}
            className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
              viewMode === 'creators'
                ? 'bg-teal-700 text-white shadow-sm font-extrabold'
                : 'text-zinc-700 hover:text-zinc-950'
            }`}
          >
            Find Creators
          </button>
          <button
            onClick={() => setViewMode('brands')}
            className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
              viewMode === 'brands'
                ? 'bg-teal-700 text-white shadow-sm font-extrabold'
                : 'text-zinc-700 hover:text-zinc-950'
            }`}
          >
            Find Brand Sponsors
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-[24px] bg-white/90 border border-zinc-200/90 shadow-sm p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={viewMode === 'creators' ? "Search creators by niche, name, or keywords..." : "Search brands, industries, or campaigns..."}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-teal-600 focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={nicheFilter} 
            onChange={(e) => setNicheFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-bold outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Fitness">Fitness & Wellness</option>
            <option value="Tech">Tech & Productivity</option>
            <option value="Fashion">Fashion & Lifestyle</option>
          </select>

          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-50/70 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800">
            <span className="text-zinc-600 font-semibold">Min Trust:</span>
            <span className="font-extrabold text-teal-800">{minTrustScore}+</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: DISCOVER CREATORS                                 */}
      {/* ========================================================= */}
      {viewMode === 'creators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCreators.map((creator) => (
            <div key={creator.id} className="rounded-[28px] bg-white/95 border border-zinc-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4 group hover:border-teal-600 hover:shadow-md transition-all">
              <div className="space-y-4">
                
                {/* Creator Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-300 flex items-center justify-center font-extrabold text-teal-900 text-sm shadow-sm">
                      {creator.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-zinc-950 font-display">{creator.name}</h3>
                        <span className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                      </div>
                      <span className="text-[11px] text-zinc-600 font-semibold">{creator.handle}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-teal-900 bg-teal-50 border border-teal-300 px-3 py-1 rounded-full">
                    Score: {creator.valuationScore}/100
                  </span>
                </div>

                <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                  {creator.bio}
                </p>

                {/* Telemetry Stats Strip */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <span className="text-[9px] text-zinc-600 uppercase font-extrabold block">Followers</span>
                    <span className="text-xs font-extrabold text-zinc-950 font-display">{creator.followers}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <span className="text-[9px] text-zinc-600 uppercase font-extrabold block">Engagement</span>
                    <span className="text-xs font-extrabold text-teal-800 font-display">{creator.engagement}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <span className="text-[9px] text-zinc-600 uppercase font-extrabold block">Trust Rating</span>
                    <span className="text-xs font-extrabold text-emerald-800 font-display">{creator.trustScore}%</span>
                  </div>
                </div>

              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block">Starting Rate</span>
                  <span className="text-sm font-extrabold text-zinc-950 font-display">{creator.baseRate}</span>
                </div>

                <button
                  onClick={() => onSelectBrandForAction({ id: creator.id, name: creator.name } as any, 'pitch')}
                  className="teal-pill-button px-4 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Fast Pitch</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: DISCOVER BRANDS                                   */}
      {/* ========================================================= */}
      {viewMode === 'brands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBrands.map((brand) => (
            <div key={brand.id} className="rounded-[28px] bg-white/95 border border-zinc-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4 group hover:border-teal-600 hover:shadow-md transition-all">
              <div className="space-y-4">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-950 font-display">{brand.name}</h3>
                      <span className="text-[11px] text-zinc-600 font-semibold">{brand.industry}</span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-teal-900 bg-teal-50 border border-teal-300 px-3 py-1 rounded-full">
                    {brand.matchScore}% Match
                  </span>
                </div>

                <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                  {brand.notes}
                </p>

                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-left">
                    <span className="text-[9px] text-zinc-600 uppercase font-extrabold block">Campaign Budget</span>
                    <span className="text-xs font-extrabold text-zinc-950 font-display">{brand.activeBudget}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-left">
                    <span className="text-[9px] text-zinc-600 uppercase font-extrabold block">Brand Trust Score</span>
                    <span className="text-xs font-extrabold text-emerald-800 font-display">{brand.trustScore} / 100</span>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-800">{brand.openOpportunities} Open Briefs</span>

                <button
                  onClick={() => onSelectBrandForAction(brand as any, 'campaign')}
                  className="teal-pill-button px-4 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
