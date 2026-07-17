import React, { useState, useEffect } from 'react';
import { Brand, SavedBrand, CreatorProfile, OutreachContent } from '../types';
import { Sparkles, Mail, Send, MessageSquare, Linkedin, Calendar, Check, Copy, AlertCircle } from 'lucide-react';

interface OutreachViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  selectedBrandFromAction: Brand | null;
  onSaveOutreach: (outreach: OutreachContent) => void;
  onUpdateCrmStage: (brandId: string, brandName: string, website: string, industry: string, stage: any, dealValue?: number) => void;
}

export default function OutreachView({
  creatorProfile,
  savedBrands,
  selectedBrandFromAction,
  onSaveOutreach,
  onUpdateCrmStage
}: OutreachViewProps) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [outreachData, setOutreachData] = useState<OutreachContent | null>(null);
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
    setOutreachData(null);
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandToGenerateFor,
          creator: creatorProfile
        })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        const payload: OutreachContent = {
          id: 'outreach-' + Math.random().toString(),
          userId: creatorProfile.userId,
          brandId: brandToGenerateFor.id,
          brandName: brandToGenerateFor.name,
          subjectLine: data.data.subjectLine,
          emailBody: data.data.emailBody,
          instagramDm: data.data.instagramDm,
          linkedinMessage: data.data.linkedinMessage,
          followUpEmail: data.data.followUpEmail,
          createdAt: new Date().toISOString()
        };
        setOutreachData(payload);
        onSaveOutreach(payload);
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

  const handleLogContacted = () => {
    if (!selectedBrand) return;
    onUpdateCrmStage(
      selectedBrand.id,
      selectedBrand.name,
      selectedBrand.website,
      selectedBrand.industry,
      'Contacted',
      creatorProfile.basePricing ? Object.values(creatorProfile.basePricing)[0] || 500 : 500
    );
    alert(`Outreach recorded. CRM opportunity for ${selectedBrand.name} updated to "Contacted" stage!`);
  };

  return (
    <div id="outreach-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold font-semibold">Autonomous Pitch Architect</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            AI Outreach Suite
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Generate highly customized, value-driven pitching content across multi-channel platforms tailored directly to your creator bio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left selector panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[24px] space-y-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Select Target Sponsor</h3>
            
            <div className="space-y-3">
              <label className="block text-[9px] text-zinc-500 uppercase font-bold tracking-widest font-mono">Choose from saved brands</label>
              <select
                id="brand-outreach-select"
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
                <option value="" disabled className="bg-[#101826] text-white">-- Select saved brand --</option>
                {savedBrands.map((sb) => (
                  <option key={sb.id} value={sb.brandDetail.id} className="bg-[#101826] text-white">{sb.brandDetail.name}</option>
                ))}
              </select>
            </div>

            {selectedBrand ? (
              <div className="p-5 bg-black/40 rounded-2xl border border-white/10 space-y-4 text-xs font-light relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C8FF]/5 rounded-full filter blur-md"></div>
                <div>
                  <h4 className="font-bold text-white text-base tracking-tight">{selectedBrand.name}</h4>
                  <p className="text-[10px] text-[#32E8FF] font-mono mt-0.5 uppercase tracking-wider">{selectedBrand.industry}</p>
                </div>
                <p className="leading-relaxed text-zinc-300 font-light text-xs">{selectedBrand.notes}</p>
                <div className="pt-3.5 border-t border-white/5 space-y-2 font-mono text-[10px] text-zinc-400">
                  <div>WEBSITE: <a href={selectedBrand.website} target="_blank" rel="noreferrer" className="text-[#32E8FF] hover:underline">{selectedBrand.website}</a></div>
                  {selectedBrand.publicPartnershipContact && <div>CONTACT: {selectedBrand.publicPartnershipContact}</div>}
                  {selectedBrand.instagram && <div>INSTAGRAM: {selectedBrand.instagram}</div>}
                </div>

                <button
                  id="regenerate-outreach-btn"
                  onClick={() => handleGenerate(selectedBrand)}
                  className="w-full py-2.5 bg-white/5 hover:bg-[#00C8FF]/10 border border-white/10 text-white font-mono uppercase tracking-wider font-semibold rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00C8FF] animate-pulse" />
                  <span>Regenerate Pitch</span>
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-600 text-xs border border-white/10 border-dashed rounded-xl space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-zinc-700" />
                <p className="font-semibold text-zinc-500 font-mono text-[10px] uppercase">No Target Selected</p>
                <p className="text-[11px] text-zinc-500 leading-normal font-light">Save brands from Discovery first, then select them here to compile custom pitches.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Panels */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="p-20 glass-card rounded-[24px] text-center space-y-4 shadow-xl">
              <div className="w-8 h-8 border-2 border-[#00C8FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono animate-pulse">Compiling sponsorship strategies...</p>
            </div>
          ) : outreachData ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Email Outreaches */}
              <div className="glass-card rounded-[24px] overflow-hidden border border-white/10">
                <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#00C8FF]" />
                    <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-200">Strategic Email Outreach</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="copy-subject-btn"
                      onClick={() => copyToClipboard(outreachData.subjectLine, 'subject')}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-mono uppercase tracking-widest text-[9px] px-2.5 py-1.5 bg-white/5 border border-white/10 cursor-pointer"
                    >
                      {copiedField === 'subject' ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Subject</span>
                    </button>
                    <button
                      id="copy-body-btn"
                      onClick={() => copyToClipboard(outreachData.emailBody, 'email')}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-mono uppercase tracking-widest text-[9px] px-2.5 py-1.5 bg-white/5 border border-white/10 cursor-pointer"
                    >
                      {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Body</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-light">
                    <span className="text-zinc-500 font-semibold font-mono block tracking-widest text-[9px] mb-1">SUBJECT:</span>
                    <span className="text-white font-medium font-mono">{outreachData.subjectLine}</span>
                  </div>
                  <pre className="text-xs text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed bg-[#101826]/30 p-5 border border-white/10 rounded-xl font-light">
                    {outreachData.emailBody}
                  </pre>
                </div>
              </div>

              {/* Instant Social Outreaches DMs & LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Instagram DM */}
                <div className="glass-card rounded-[24px] overflow-hidden border border-white/10">
                  <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs">
                      <MessageSquare className="w-4 h-4 text-[#32E8FF]" />
                      <span className="font-mono font-bold uppercase tracking-widest text-zinc-200">Instagram DM</span>
                    </div>
                    <button
                      id="copy-dm-btn"
                      onClick={() => copyToClipboard(outreachData.instagramDm, 'dm')}
                      className="p-1.5 rounded bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      {copiedField === 'dm' ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-zinc-300 bg-[#101826]/30 border border-white/15 p-4 rounded-xl italic leading-relaxed font-light">
                      "{outreachData.instagramDm}"
                    </p>
                  </div>
                </div>

                {/* LinkedIn Connection */}
                <div className="glass-card rounded-[24px] overflow-hidden border border-white/10">
                  <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs">
                      <Linkedin className="w-4 h-4 text-[#00C8FF]" />
                      <span className="font-mono font-bold uppercase tracking-widest text-zinc-200">LinkedIn Pitch Note</span>
                    </div>
                    <button
                      id="copy-linkedin-btn"
                      onClick={() => copyToClipboard(outreachData.linkedinMessage, 'linkedin')}
                      className="p-1.5 rounded bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      {copiedField === 'linkedin' ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-zinc-300 bg-[#101826]/30 border border-white/15 p-4 rounded-xl leading-relaxed font-light">
                      {outreachData.linkedinMessage}
                    </p>
                  </div>
                </div>

              </div>

              {/* Value-Driven Follow up Email */}
              <div className="glass-card rounded-[24px] overflow-hidden border border-white/10">
                <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#32E8FF]" />
                    <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-200">Value-Driven Follow-Up</span>
                  </div>
                  <button
                    id="copy-followup-btn"
                    onClick={() => copyToClipboard(outreachData.followUpEmail, 'followup')}
                    className="p-1.5 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-mono uppercase tracking-widest text-[9px] px-2.5 py-1.5 bg-white/5 border border-white/10 cursor-pointer"
                  >
                    {copiedField === 'followup' ? <Check className="w-3.5 h-3.5 text-[#00C8FF]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Followup</span>
                  </button>
                </div>
                <div className="p-5">
                  <pre className="text-xs text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed bg-[#101826]/30 p-5 border border-white/10 rounded-xl font-light">
                    {outreachData.followUpEmail}
                  </pre>
                </div>
              </div>

              {/* Action Board */}
              <div className="p-6 bg-[#101826]/40 border border-white/10 rounded-[24px] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg backdrop-blur-md">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-widest">Record Pitch Event</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 font-light">Log this contact action immediately to start tracking negotiations inside CRM.</p>
                </div>
                <button
                  id="log-contacted-btn"
                  onClick={handleLogContacted}
                  className="px-5 py-3 btn-emerald text-black text-xs font-bold uppercase tracking-wider rounded-xl font-mono flex items-center gap-2 shrink-0 transition-all shadow-md shadow-[#00C8FF]/10 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Contacted Status</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-16 text-center text-zinc-600 text-xs shadow-lg glass-card rounded-[28px] border border-white/10">
              <Sparkles className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
              <p className="font-semibold text-zinc-400 text-sm">AI Proposal Composer Empty</p>
              <p className="text-zinc-500 mt-1 max-w-sm mx-auto font-light">Select any brand from the left column to compile fully customized, multi-channel sponsorship proposals.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
