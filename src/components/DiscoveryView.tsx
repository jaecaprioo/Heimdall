import React, { useState, useEffect } from 'react';
import { Brand, SavedBrand, CreatorProfile } from '../types';
import { 
  Search, 
  Compass, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Building, 
  ExternalLink, 
  Globe, 
  Mail, 
  AlertCircle, 
  Plus,
  ArrowRight,
  Flame,
  Activity,
  CheckCircle,
  X
} from 'lucide-react';

interface DiscoveryViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  onSaveBrand: (brand: Brand) => void;
  onUnsaveBrand: (brandId: string) => void;
  onSelectBrandForAction: (brand: Brand, actionType: 'pitch' | 'campaign') => void;
}

export default function DiscoveryView({
  creatorProfile,
  savedBrands,
  onSaveBrand,
  onUnsaveBrand,
  onSelectBrandForAction
}: DiscoveryViewProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Research State
  const [researchBrand, setResearchBrand] = useState<Brand | null>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [researchLoading, setResearchLoading] = useState(false);

  // New Brand Dialog State
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: '', website: '', industry: '', category: 'General', country: 'United States',
    creatorProgramPage: '', partnershipPage: '', publicMarketingContact: '', publicPartnershipContact: '',
    instagram: '', linkedin: '', notes: ''
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('query', search);
      if (industry) params.append('industry', industry);
      if (category) params.append('category', category);

      const res = await fetch(`/api/brands?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'ok') {
        setBrands(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search, industry, category]);

  const handleResearch = async (brand: Brand) => {
    setResearchBrand(brand);
    setResearchLoading(true);
    setResearchData(null);
    try {
      const res = await fetch('/api/research', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           brandName: brand.name,
           website: brand.website,
           industry: brand.industry,
           category: brand.category,
           creatorBio: creatorProfile.bio
         })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        setResearchData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResearchLoading(false);
    }
  };

  const handleAddCustomBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name || !newBrand.website) return;

    const brandItem: Brand = {
      id: 'custom-' + Math.random().toString(),
      name: newBrand.name,
      website: newBrand.website,
      industry: newBrand.industry || 'General',
      category: newBrand.category || 'General',
      country: newBrand.country || 'United States',
      creatorProgramPage: newBrand.creatorProgramPage || '',
      partnershipPage: newBrand.partnershipPage || '',
      publicMarketingContact: newBrand.publicMarketingContact || '',
      publicPartnershipContact: newBrand.publicPartnershipContact || '',
      instagram: newBrand.instagram || '',
      linkedin: newBrand.linkedin || '',
      notes: newBrand.notes || ''
    };

    setBrands(prev => [brandItem, ...prev]);
    onSaveBrand(brandItem);
    setIsAddingBrand(false);
    setNewBrand({
      name: '', website: '', industry: '', category: 'General', country: 'United States',
      creatorProgramPage: '', partnershipPage: '', publicMarketingContact: '', publicPartnershipContact: '',
      instagram: '', linkedin: '', notes: ''
    });
  };

  const isBrandSaved = (brandId: string) => savedBrands.some(sb => sb.brandId === brandId);

  return (
    <div id="discovery-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* 1. Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Autonomous Scanning Grid</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            Brand Discovery Engine
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Search authenticated creator-first companies, verify budget categories, and execute real-time AI brand intelligence research.
          </p>
        </div>

        <button
          id="add-custom-brand-btn"
          onClick={() => setIsAddingBrand(true)}
          className="px-5 py-3 btn-emerald text-black shadow-lg shadow-[#00C8FF]/10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all self-start md:self-auto font-mono cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Index Custom Brand</span>
        </button>
      </div>

      {/* Main Content Area Wrapper */}
      <div className="bg-transparent space-y-10">
        {/* 2. Glass Filter and Search Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 cyber-panel bg-gradient-to-r from-[#00C8FF]/5 to-transparent rounded-2xl p-4 backdrop-blur-md">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#00C8FF]" />
            <input
              id="brand-search"
              type="text"
              placeholder="Filter by brand name, keywords, guidelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00C8FF] transition-colors font-mono placeholder:text-zinc-600"
            />
          </div>

          <div>
            <select
              id="industry-filter"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-zinc-300 text-sm focus:outline-none focus:border-[#00C8FF] transition-colors font-mono"
            >
              <option value="" className="bg-[#101826] text-white">All Industries</option>
              <option value="Fashion & Apparel" className="bg-[#101826] text-white">Fashion & Apparel</option>
              <option value="Fitness & Apparel" className="bg-[#101826] text-white">Fitness & Apparel</option>
              <option value="Athletic Apparel" className="bg-[#101826] text-white">Athletic Apparel</option>
              <option value="Consumer Technology" className="bg-[#101826] text-white">Consumer Tech</option>
              <option value="Software & Productivity" className="bg-[#101826] text-white">Software & Productivity</option>
              <option value="Hospitality & Travel" className="bg-[#101826] text-white">Hospitality & Travel</option>
              <option value="Education & EdTech" className="bg-[#101826] text-white">Education & EdTech</option>
              <option value="Food & Beverage" className="bg-[#101826] text-white">Food & Beverage</option>
            </select>
          </div>

          <div>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-zinc-300 text-sm focus:outline-none focus:border-[#00C8FF] transition-colors font-mono"
            >
              <option value="" className="bg-[#101826] text-white">All Categories</option>
              <option value="Fitness" className="bg-[#101826] text-white">Fitness</option>
              <option value="Tech" className="bg-[#101826] text-white">Tech</option>
              <option value="Travel" className="bg-[#101826] text-white">Travel</option>
              <option value="Lifestyle" className="bg-[#101826] text-white">Lifestyle</option>
              <option value="Fashion" className="bg-[#101826] text-white">Fashion</option>
            </select>
          </div>
        </div>

        {/* 3. Main Split Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Brand discovery grid list (2 columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="p-16 text-center text-zinc-500 animate-pulse font-mono text-xs uppercase tracking-widest glass-panel rounded-3xl">
                Syncing Brand Index arrays...
              </div>
            ) : brands.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {brands.map((brand) => {
                  const isSaved = isBrandSaved(brand.id);
                  return (
                    <div key={brand.id} className="glass-card p-6 rounded-[24px] space-y-5 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8FF]/3 rounded-full filter blur-xl group-hover:bg-[#00C8FF]/8 transition-all duration-300"></div>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-xl text-white tracking-tight">{brand.name}</h3>
                              <a href={brand.website} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#00C8FF] transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <span className="text-xs text-[#32E8FF] font-mono tracking-wider block mt-1 uppercase">
                              {brand.industry} • {brand.country}
                            </span>
                          </div>

                          <button
                            id={`save-brand-${brand.id}`}
                            onClick={() => isSaved ? onUnsaveBrand(brand.id) : onSaveBrand(brand)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00C8FF]/20 text-zinc-400 hover:text-[#00C8FF] transition-colors cursor-pointer"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-5 h-5 text-[#00C8FF] shadow-[0_0_8px_rgba(0,200,255,0.2)]" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <p className="text-zinc-300 text-sm leading-relaxed font-light mt-3">{brand.notes}</p>

                        {/* Creator Channels Link List */}
                        {(brand.creatorProgramPage || brand.partnershipPage || brand.publicPartnershipContact || brand.publicMarketingContact) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 mt-4 border-t border-white/5 text-xs text-zinc-400">
                            {brand.creatorProgramPage && (
                              <a href={brand.creatorProgramPage} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-300 hover:text-[#00C8FF] font-mono text-[10px] tracking-wider uppercase">
                                <Compass className="w-4 h-4 text-[#00C8FF]" />
                                <span>CREATOR PROGRAM PORTAL</span>
                              </a>
                            )}
                            {brand.partnershipPage && (
                              <a href={brand.partnershipPage} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-300 hover:text-[#00C8FF] font-mono text-[10px] tracking-wider uppercase">
                                <Globe className="w-4 h-4 text-[#32E8FF]" />
                                <span>SPONSOR DETAILS</span>
                              </a>
                            )}
                            {brand.publicPartnershipContact && (
                              <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] tracking-wider uppercase">
                                <Mail className="w-4 h-4 text-zinc-500" />
                                <span>PARTNERSHIP: {brand.publicPartnershipContact}</span>
                              </div>
                            )}
                            {brand.publicMarketingContact && (
                              <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] tracking-wider uppercase">
                                <Mail className="w-4 h-4 text-zinc-500" />
                                <span>MARKETING: {brand.publicMarketingContact}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <button
                          id={`intel-btn-${brand.id}`}
                          onClick={() => handleResearch(brand)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-[#00C8FF]/10 text-xs font-semibold text-[#00C8FF] transition-all border border-white/10 hover:border-[#00C8FF]/30 font-mono uppercase tracking-wider cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Deep Intel</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            id={`pitch-btn-${brand.id}`}
                            onClick={() => onSelectBrandForAction(brand, 'pitch')}
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors font-mono uppercase tracking-wider cursor-pointer"
                          >
                            AI Pitch
                          </button>
                          <button
                            id={`campaign-btn-${brand.id}`}
                            onClick={() => onSelectBrandForAction(brand, 'campaign')}
                            className="px-4 py-2.5 btn-emerald text-black text-xs font-bold rounded-xl transition-colors font-mono uppercase tracking-wider cursor-pointer"
                          >
                            Studio
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center text-zinc-500 py-16 space-y-4 glass-card rounded-[28px]">
                <AlertCircle className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-400">Index matches empty</p>
                <p className="text-xs text-zinc-600">Try broad searches like Nike, Airbnb, Gymshark or adjust the category filter.</p>
              </div>
            )}
          </div>

          {/* AI Intel Panel (Right sidebar column) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00C8FF]" />
                <h2 className="text-lg font-bold text-white tracking-tight">AI Intel Terminal</h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Interactive Context</span>
            </div>

            <div className="glass-card p-6 rounded-[24px] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#32E8FF]/5 rounded-full filter blur-xl"></div>
              {!researchBrand ? (
                <div className="py-12 text-center text-zinc-500 space-y-4">
                  <Building className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-mono uppercase tracking-widest">Awaiting Brand Select</p>
                  <p className="text-xs text-zinc-600 leading-relaxed font-light">
                    Select "AI Deep Intel" on any active brand card. Heimdall will perform real-time marketing analysis, positioning recommendations, and pitch angles.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-350">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-bold text-white font-mono text-xs uppercase tracking-wider">Researching: {researchBrand.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{researchBrand.website}</span>
                    </div>
                    <button 
                      onClick={() => { setResearchBrand(null); setResearchData(null); }}
                      className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {researchLoading ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-8 h-8 rounded-full border-2 border-[#00C8FF]/30 border-t-[#00C8FF] animate-spin mx-auto"></div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Running Heimdall Neural Research Scanner...</p>
                    </div>
                  ) : researchData ? (
                    <div className="space-y-5 text-xs font-light leading-relaxed text-[#D4D4D8] overflow-y-auto max-h-[70vh] pr-2.5">
                      {researchData.warning && (
                        <div className="p-3 bg-[#FFC857]/5 border border-[#FFC857]/20 rounded-xl text-[#FFC857] text-[10px] font-mono">
                          {researchData.warning}
                        </div>
                      )}

                      {/* AI Opportunity Score Indicator (Glow Circle HUD) */}
                      {researchData.opportunityScore !== undefined && (
                        <div className="bg-gradient-to-r from-[#00C8FF]/10 to-[#32E8FF]/5 border border-[#00C8FF]/20 rounded-2xl p-4.5 flex items-center justify-between shadow-[0_0_15px_rgba(0,200,255,0.05)]">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-[#00C8FF] uppercase tracking-wider font-bold">AI Opportunity Rating</span>
                            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                              {researchData.opportunityScore >= 85 ? "Excellent fit. High UGC interest & budget available." : "Moderate fit. Requires custom aesthetic pitch angle."}
                            </p>
                          </div>
                          <div className="shrink-0 flex flex-col items-center justify-center bg-black/60 border border-[#00C8FF]/30 w-16 h-16 rounded-full shadow-[0_0_12px_rgba(0,200,255,0.15)] font-mono text-center">
                            <span className="text-white text-lg font-bold block">{researchData.opportunityScore}</span>
                            <span className="text-[8px] text-zinc-500 uppercase font-semibold">/100</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold block">Brand Overview:</span>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{researchData.overview}</p>
                      </div>

                      {/* Brand Contact & Collaboration Details */}
                      <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3 font-mono text-[10px] text-zinc-400">
                        <span className="text-[#32E8FF] font-semibold block uppercase tracking-wider text-[9px]">Strategic Contacts & Programs:</span>
                        <div className="grid grid-cols-1 gap-2 border-b border-white/5 pb-2.5">
                          {researchData.marketingManager && (
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">MARKETING MANAGER:</span>
                              <span className="text-white font-medium">{researchData.marketingManager}</span>
                            </div>
                          )}
                          {researchData.prEmail && (
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">PR EMAIL:</span>
                              <a href={`mailto:${researchData.prEmail}`} className="text-[#00C8FF] hover:underline font-bold truncate max-w-[150px]">{researchData.prEmail}</a>
                            </div>
                          )}
                          {researchData.partnershipsEmail && (
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">PARTNERSHIPS EMAIL:</span>
                              <a href={`mailto:${researchData.partnershipsEmail}`} className="text-[#00C8FF] hover:underline font-bold truncate max-w-[150px]">{researchData.partnershipsEmail}</a>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 pt-0.5">
                          {researchData.affiliateProgram && (
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">AFFILIATE RATE:</span>
                              <span className="text-emerald-400 font-bold">{researchData.affiliateProgram}</span>
                            </div>
                          )}
                          {researchData.creatorAppLinks && (
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500">CREATOR PORTAL:</span>
                              <a href={researchData.creatorAppLinks} target="_blank" rel="noopener noreferrer" className="text-[#32E8FF] hover:underline flex items-center gap-1">
                                <span>Apply</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing, Budget & Pitch Scheduling */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Est. Deal Budget</span>
                          <span className="text-white font-bold text-xs font-mono">{researchData.campaignBudget || "N/A"}</span>
                        </div>
                        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Best month to pitch</span>
                          <span className="text-white font-bold text-xs font-mono">{researchData.bestMonth || "N/A"}</span>
                        </div>
                      </div>

                      {/* Style, Voice & Campaign logs */}
                      <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                        {researchData.preferredStyle && (
                          <div className="space-y-1">
                            <span className="text-zinc-500 block uppercase font-mono text-[8px]">Preferred Content Style</span>
                            <p className="text-zinc-300 italic text-[11px]">"{researchData.preferredStyle}"</p>
                          </div>
                        )}
                        {researchData.brandVoice && (
                          <div className="space-y-1 border-t border-white/5 pt-2 mt-2">
                            <span className="text-zinc-500 block uppercase font-mono text-[8px]">Core Brand Voice tone</span>
                            <p className="text-zinc-300 text-[11px]">{researchData.brandVoice}</p>
                          </div>
                        )}
                        {researchData.lastLaunch && (
                          <div className="space-y-1 border-t border-white/5 pt-2 mt-2">
                            <span className="text-zinc-500 block uppercase font-mono text-[8px]">Last Campaign Launch</span>
                            <p className="text-zinc-400 text-[11px] font-mono">{researchData.lastLaunch}</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Campaigns lists */}
                      {researchData.recentCampaigns && researchData.recentCampaigns.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold block">Recent Active Campaigns:</span>
                          <div className="space-y-1.5">
                            {researchData.recentCampaigns.map((camp: string, cIdx: number) => (
                              <div key={cIdx} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-zinc-300 text-[11px] leading-relaxed">
                                • {camp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#00C8FF] uppercase tracking-widest font-semibold block">Dynamic AI Pitch Angle:</span>
                        <div className="p-3 bg-[#00C8FF]/5 border border-[#00C8FF]/15 rounded-xl font-mono text-zinc-200 text-[10px] leading-relaxed">
                          "{researchData.suggestedAngle}"
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold block">Suggested Positioning Strategy:</span>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{researchData.suggestedPositioning}</p>
                      </div>

                      <button
                        onClick={() => onSelectBrandForAction(researchBrand, 'pitch')}
                        className="w-full py-3 rounded-xl btn-emerald text-black font-bold uppercase tracking-wider text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#00E676]/10"
                      >
                        <span>Send Outreach Pitch Deck</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 text-xs py-6">
                      Failed to compile marketing research vector records.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. Add Custom Brand Modal */}
      {isAddingBrand && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-[28px] overflow-hidden p-8 space-y-6 relative border border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">Index Custom Brand Partner</h2>
              <button 
                onClick={() => setIsAddingBrand(false)}
                className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomBrand} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                    placeholder="e.g. Sony"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={newBrand.website}
                    onChange={(e) => setNewBrand({...newBrand, website: e.target.value})}
                    placeholder="e.g. https://www.sony.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Industry</label>
                  <input
                    type="text"
                    value={newBrand.industry}
                    onChange={(e) => setNewBrand({...newBrand, industry: e.target.value})}
                    placeholder="e.g. Tech & Audio"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Category</label>
                  <input
                    type="text"
                    value={newBrand.category}
                    onChange={(e) => setNewBrand({...newBrand, category: e.target.value})}
                    placeholder="e.g. Tech"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 font-mono uppercase">Notes / Guidelines</label>
                <textarea
                  value={newBrand.notes}
                  onChange={(e) => setNewBrand({...newBrand, notes: e.target.value})}
                  placeholder="Insert any relevant instructions, target pricing, or campaign directives..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-20 resize-none focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 btn-emerald text-black font-bold text-xs uppercase tracking-wider rounded-xl font-mono cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
