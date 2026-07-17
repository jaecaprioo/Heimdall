import React, { useState, useEffect } from 'react';
import { Brand, SavedBrand, CreatorProfile, CampaignContent } from '../types';
import { 
  Sparkles, 
  Clapperboard, 
  Layers, 
  Play, 
  Check, 
  Copy, 
  AlertCircle,
  Video,
  Download,
  Share2,
  Tv
} from 'lucide-react';

interface CampaignViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  selectedBrandFromAction: Brand | null;
  onSaveCampaign: (campaign: CampaignContent) => void;
}

export default function CampaignView({
  creatorProfile,
  savedBrands,
  selectedBrandFromAction,
  onSaveCampaign
}: CampaignViewProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignContent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBrandFromAction) {
      setSelectedBrand(selectedBrandFromAction);
      handleGenerate(selectedBrandFromAction);
    } else if (savedBrands.length > 0 && !selectedBrand) {
      setSelectedBrand(savedBrands[0].brandDetail);
    }
  }, [selectedBrandFromAction, savedBrands]);

  const handleGenerate = async (brandToGenerateFor: Brand) => {
    setLoading(true);
    setCampaignData(null);
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandToGenerateFor,
          creator: creatorProfile
        })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        const payload: CampaignContent = {
          id: 'camp-' + Math.random().toString(),
          userId: creatorProfile.userId,
          brandId: brandToGenerateFor.id,
          brandName: brandToGenerateFor.name,
          title: data.data.title,
          concepts: data.data.concepts,
          storyboards: data.data.storyboards,
          shotLists: data.data.shotLists,
          createdAt: new Date().toISOString()
        };
        setCampaignData(payload);
        onSaveCampaign(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div id="campaign-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* 1. Header block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clapperboard className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Heimdall UGC Script Generator</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            Campaign Studio
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Develop viral UGC storyboards, hook variations, full video scripts, and custom high-retention shot lists tailored to your brand partners.
          </p>
        </div>
      </div>

      {/* 2. Main Studio Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left selector column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[24px] space-y-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Index Target Sponsor</h3>
            
            <div className="space-y-3">
              <label className="block text-[9px] text-zinc-500 uppercase font-bold tracking-widest font-mono">Sync with saved sponsors</label>
              <select
                id="brand-campaign-select"
                value={selectedBrand ? selectedBrand.id : ''}
                onChange={(e) => {
                  const saved = savedBrands.find(sb => sb.brandDetail.id === e.target.value);
                  if (saved) {
                    setSelectedBrand(saved.brandDetail);
                    handleGenerate(saved.brandDetail);
                  }
                }}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 text-white text-xs rounded-xl focus:outline-none focus:border-[#00C8FF] transition-all font-mono"
              >
                <option value="" disabled className="bg-[#101826] text-white">-- Target Brand --</option>
                {savedBrands.map((sb) => (
                  <option key={sb.id} value={sb.brandDetail.id} className="bg-[#101826] text-white">{sb.brandDetail.name}</option>
                ))}
              </select>
            </div>

            {selectedBrand ? (
              <div className="p-5 bg-black/40 rounded-2xl border border-white/10 space-y-4 text-xs font-light relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C8FF]/5 rounded-full filter blur-md"></div>
                <div>
                  <h4 className="font-bold text-white text-lg tracking-tight">{selectedBrand.name}</h4>
                  <p className="text-[10px] text-[#32E8FF] font-mono mt-0.5 uppercase tracking-wider">{selectedBrand.industry}</p>
                </div>
                <p className="leading-relaxed text-zinc-300 font-light text-xs">{selectedBrand.notes}</p>
                
                <button
                  id="regenerate-campaign-btn"
                  onClick={() => handleGenerate(selectedBrand)}
                  className="w-full py-2.5 bg-white/5 hover:bg-[#00C8FF]/10 border border-white/10 text-white font-mono uppercase tracking-wider font-semibold rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00C8FF] animate-pulse" />
                  <span>Generate UGC Brief</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-600 text-xs border border-white/10 border-dashed rounded-[20px] space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto text-zinc-700" />
                <p className="font-semibold text-zinc-500 font-mono text-[10px] uppercase">Awaiting Sponsor</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-light">Please discover and bookmark brand targets in discovery to compile script storyboards.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Output panels (2 columns wide) */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="p-20 glass-card rounded-[24px] text-center space-y-4 shadow-xl">
              <div className="w-8 h-8 border-2 border-[#00C8FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono animate-pulse">Designing storyboard structures, camera directions & hooks...</p>
            </div>
          ) : campaignData ? (
            <div className="space-y-8 animate-in fade-in duration-350">
              
              {/* Campaign Title Banner */}
              <div className="p-6 bg-[#101826]/40 border border-[#00C8FF]/20 rounded-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
                <div>
                  <span className="text-[9px] text-[#00C8FF] font-mono font-bold uppercase tracking-widest">Autonomous Concept Generation</span>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1 font-sans">{campaignData.title}</h2>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/35 text-[10px] font-bold text-[#00C8FF] font-mono tracking-wider">
                  {campaignData.brandName} EXCLUSIVE
                </span>
              </div>

              {/* Concepts Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00C8FF]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-white">Target Video Concepts</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaignData.concepts?.map((c, idx) => (
                    <div key={c.id} className="glass-card p-6 rounded-[24px] flex flex-col justify-between space-y-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8FF]/3 rounded-full filter blur-xl"></div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">CONCEPT 0{idx + 1}</span>
                        <h4 className="font-bold text-white text-lg tracking-tight">{c.title}</h4>
                        <p className="text-zinc-300 text-xs leading-relaxed font-light">{c.description}</p>
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-white/5">
                        <span className="text-[9px] font-mono font-bold text-[#32E8FF] uppercase tracking-widest block">Tested Hooks:</span>
                        {c.hooks?.map((hook, hIdx) => (
                          <div key={hIdx} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] text-zinc-300 italic">
                            <span>"{hook}"</span>
                            <button
                              id={`copy-hook-${idx}-${hIdx}`}
                              onClick={() => copyToClipboard(hook, `hook-${idx}-${hIdx}`)}
                              className="text-zinc-500 hover:text-white ml-2 shrink-0 transition-colors cursor-pointer"
                            >
                              {copiedField === `hook-${idx}-${hIdx}` ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 bg-[#00C8FF]/5 border border-[#00C8FF]/15 rounded-xl text-[11px] text-zinc-300">
                        <span className="font-semibold text-[#00C8FF] font-mono uppercase tracking-wider text-[9px] block mb-1">Call to Action: </span>
                        <span>{c.callToAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storyboard Block */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#32E8FF]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-white">Chronological UGC Storyboard</h3>
                </div>

                <div className="glass-card rounded-[24px] overflow-hidden border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/10 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                          <th className="p-4 font-semibold">Scene</th>
                          <th className="p-4 font-semibold">Shot / Vis Directions</th>
                          <th className="p-4 font-semibold">Voiceover script</th>
                          <th className="p-4 font-semibold">Camera Framing</th>
                          <th className="p-4 font-semibold text-right">Dur</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300 font-light">
                        {campaignData.storyboards?.map((scene) => (
                          <tr key={scene.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-bold text-[#00C8FF] font-mono">#0{scene.sceneNumber}</td>
                            <td className="p-4 leading-relaxed max-w-[200px] text-zinc-300">{scene.visualDescription}</td>
                            <td className="p-4 leading-relaxed italic max-w-[250px] text-zinc-400">"{scene.audioVoiceover}"</td>
                            <td className="p-4 font-mono text-[10px] text-zinc-500">{scene.shotType}</td>
                            <td className="p-4 text-right font-mono text-zinc-500">{scene.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Shot List */}
              <div className="glass-card p-6 rounded-[24px] space-y-4">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#00C8FF]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-white">Production B-Roll Lists</h3>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400 font-light">
                  {campaignData.shotLists?.map((shot, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl">
                      <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[#00C8FF] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {sIdx + 1}
                      </span>
                      <span className="mt-0.5 leading-relaxed text-zinc-300">{shot}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="p-16 text-center text-zinc-500 py-20 space-y-4 glass-card rounded-[28px] border border-white/10">
              <Video className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-500 font-mono uppercase">Campaign Output Idle</p>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed font-light">
                Choose a targeted sponsor from the selector panel. Heimdall's generator script engines will immediately prepare complete video scripts, storyboard frames, and shot lists.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
