import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  TrendingUp, 
  ShieldCheck, 
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { CreatorMarketplaceItem, BrandProfile } from '../types';

interface BrandDiscoveryCreatorsViewProps {
  brandProfile?: BrandProfile | null;
  onSelectCreatorForDeal?: (creator: CreatorMarketplaceItem) => void;
  onShortlistCreator?: (creatorId: string) => void;
  onEvaluateCreator?: (creatorName: string) => void;
  onNavigate?: (tab: string) => void;
}

const SAMPLE_CREATORS: CreatorMarketplaceItem[] = [
  {
    id: 'cr_alex_rivers',
    creatorName: 'Alex Rivers',
    fullName: 'Alex Rivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'High-performance fitness & aesthetic lifestyle creator. High watch-retention 4K vertical Reels & cinematic routine breakdowns.',
    country: 'United States',
    niches: ['Fitness', 'Lifestyle & Wellness', 'Athletics'],
    primaryPlatform: 'instagram',
    totalFollowers: 10000,
    engagementRate: 6.1,
    averageViews: 35000,
    startingPrice: 500,
    matchScore: 96,
    matchReasons: [
      'Viral breakout with 35K average Reel views across recent campaign deliverables',
      '89% audience demographic alignment with fitness and activewear buyers',
      'Verified 100% on-time delivery track record across 18 brand partnerships'
    ],
    trustScore: 97,
    hasVerifiedTelemetry: true,
    services: [
      { name: 'Instagram Reel (4K)', price: 500, type: 'Reel' },
      { name: 'Story Package (3x Frames)', price: 225, type: 'Story' },
      { name: 'UGC Raw + Edited Bundle', price: 650, type: 'UGC' }
    ],
    audienceTopCountries: ['US (64%)', 'UK (18%)', 'CA (10%)']
  },
  {
    id: 'cr_marcus_vance',
    creatorName: 'Marcus Vance',
    fullName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Tech, productivity, and ergonomic workstation setups. Crisp macro b-roll and hardware teardowns.',
    country: 'United Kingdom',
    niches: ['Tech & Hardware', 'Productivity', 'Design'],
    primaryPlatform: 'tiktok',
    totalFollowers: 85000,
    engagementRate: 9.2,
    averageViews: 240000,
    startingPrice: 850,
    matchScore: 91,
    matchReasons: [
      'High conversion velocity for software tools & desk accessories',
      'Strong search indexing on TikTok & YouTube Shorts',
      'Clean professional contracts with standard 30-day usage rights'
    ],
    trustScore: 94,
    hasVerifiedTelemetry: true,
    services: [
      { name: 'Dedicated TikTok Video', price: 850, type: 'Video' },
      { name: 'YouTube Short Integration', price: 950, type: 'Short' },
      { name: 'Full Desk Setup Feature', price: 1500, type: 'Integration' }
    ],
    audienceTopCountries: ['US (48%)', 'UK (32%)', 'DE (8%)']
  },
  {
    id: 'cr_elena_rostova',
    creatorName: 'Elena Rostova',
    fullName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    bio: 'Clean beauty, cruelty-free skincare routines, and organic vlog storytelling. Authentic skin texture tutorials.',
    country: 'Canada',
    niches: ['Beauty & Skincare', 'Wellness', 'Eco Living'],
    primaryPlatform: 'youtube',
    totalFollowers: 45000,
    engagementRate: 8.4,
    averageViews: 180000,
    startingPrice: 1200,
    matchScore: 88,
    matchReasons: [
      'Dedicated subscriber base with 12-minute average YouTube watch time',
      'Verified skincare ingredient analysis expertise',
      'No conflicting multi-sponsor clutter in past 90 days'
    ],
    trustScore: 96,
    hasVerifiedTelemetry: true,
    services: [
      { name: 'Dedicated YouTube Video', price: 1200, type: 'Video' },
      { name: '60-Sec Midroll Sponsor', price: 650, type: 'Integration' },
      { name: 'YouTube Shorts + Community Post', price: 450, type: 'Short' }
    ],
    audienceTopCountries: ['CA (42%)', 'US (38%)', 'UK (12%)']
  },
  {
    id: 'cr_kai_tanaka',
    creatorName: 'Kai Tanaka',
    fullName: 'Kai Tanaka',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Outdoor cinematography, mountain trekking gear reviews, and Sony FX3 color grading breakdowns.',
    country: 'United States',
    niches: ['Travel & Adventure', 'Outdoor Gear', 'Cinematography'],
    primaryPlatform: 'instagram',
    totalFollowers: 125000,
    engagementRate: 5.4,
    averageViews: 110000,
    startingPrice: 1600,
    matchScore: 85,
    matchReasons: [
      'High-contrast visual storytelling that amplifies outdoor gear durability',
      'Strong repeat brand partner rating (4.9/5.0)',
      'Offers RAW 4K 10-bit footage licensing'
    ],
    trustScore: 92,
    hasVerifiedTelemetry: true,
    services: [
      { name: 'Cinematic Reel (4K 60fps)', price: 1600, type: 'Reel' },
      { name: '3-Part Adventure Story Series', price: 800, type: 'Story' },
      { name: 'Complete 30-Day Paid Whitelist', price: 2200, type: 'Bundle' }
    ],
    audienceTopCountries: ['US (70%)', 'AU (12%)', 'CA (10%)']
  }
];

export default function BrandDiscoveryCreatorsView({
  brandProfile,
  onSelectCreatorForDeal,
  onShortlistCreator,
  onEvaluateCreator,
  onNavigate
}: BrandDiscoveryCreatorsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['cr_alex_rivers']);

  const handleToggleShortlist = (id: string) => {
    if (shortlistedIds.includes(id)) {
      setShortlistedIds(shortlistedIds.filter(i => i !== id));
    } else {
      setShortlistedIds([...shortlistedIds, id]);
      if (onShortlistCreator) onShortlistCreator(id);
    }
  };

  const filteredCreators = SAMPLE_CREATORS.filter(c => {
    const matchesSearch = c.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.niches.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesNiche = selectedNiche === 'All' || c.niches.some(n => n.toLowerCase().includes(selectedNiche.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'All' || c.primaryPlatform === selectedPlatform.toLowerCase();
    const matchesEngagement = c.engagementRate >= minEngagement;
    return matchesSearch && matchesNiche && matchesPlatform && matchesEngagement;
  });

  return (
    <div id="brand-discovery-creators-container" className="space-y-8">
      {/* Header Banner - Spatial Studio Pure Card */}
      <div className="spatial-card-white p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-900/20">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                  Discover Verified Creators
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  Verified Telemetry
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Filter by verified reach, engagement velocity, category fit, and audited trust scores.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="spatial-card-white p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="creator-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators by handle, niche, bio keyword, or country..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-600 focus:outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Fitness">Fitness & Athletics</option>
              <option value="Tech">Tech & Hardware</option>
              <option value="Beauty">Beauty & Skincare</option>
              <option value="Travel">Travel & Adventure</option>
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 font-medium focus:outline-none"
            >
              <option value="All">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Min. Eng: {minEngagement}%</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={minEngagement}
                onChange={(e) => setMinEngagement(Number(e.target.value))}
                className="w-16 accent-emerald-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Creator Grid - High Contrast Spatial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map((creator) => {
          const isShortlisted = shortlistedIds.includes(creator.id);
          return (
            <div
              key={creator.id}
              className="spatial-card-white p-7 flex flex-col justify-between space-y-6 hover:shadow-xl transition-all"
            >
              {/* Creator Top Profile Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={creator.avatar}
                      alt={creator.creatorName}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-zinc-900 tracking-tight font-display">
                          {creator.creatorName}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">
                        {creator.country} • {creator.primaryPlatform.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 font-mono">
                      {creator.matchScore}% Match
                    </div>
                    <button
                      onClick={() => handleToggleShortlist(creator.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isShortlisted
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                  {creator.bio}
                </p>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 text-center">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Reach</div>
                    <div className="text-sm font-bold text-zinc-900 font-mono">
                      {creator.totalFollowers.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Eng. Rate</div>
                    <div className="text-sm font-bold text-emerald-800 font-mono">
                      {creator.engagementRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-medium">Base Deliverable</div>
                    <div className="text-sm font-bold text-zinc-900 font-mono">
                      ${creator.startingPrice}
                    </div>
                  </div>
                </div>

                {/* Match Highlights */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Audited Signals
                  </div>
                  {creator.matchReasons.map((reason, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-xs text-zinc-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <button
                  onClick={() => onEvaluateCreator && onEvaluateCreator(creator.creatorName)}
                  className="pill-btn-cream flex-1 py-3 text-xs font-bold text-center cursor-pointer"
                >
                  View Passport
                </button>
                <button
                  onClick={() => onSelectCreatorForDeal && onSelectCreatorForDeal(creator)}
                  className="pill-btn-emerald flex-1 py-3 text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Open Deal Room</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
