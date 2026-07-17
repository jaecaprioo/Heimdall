import React, { useState, useEffect } from 'react';
import { CreatorProfile, SavedBrand, CRMOpportunity, Notification, Brand, CRMStage } from '../types';
import { 
  Sparkles, 
  Bookmark, 
  Send, 
  Calendar, 
  TrendingUp, 
  Compass, 
  ArrowRight, 
  Shield, 
  AlertCircle,
  Activity,
  User,
  ExternalLink,
  Flame,
  Cpu,
  Tv,
  Command,
  Terminal,
  Play,
  FileCode,
  Scale,
  DollarSign,
  Folder,
  Clock,
  Video,
  Users,
  UserPlus,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Copy,
  Check,
  Briefcase,
  Layers,
  Inbox,
  HelpCircle,
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  opportunities: CRMOpportunity[];
  notifications: Notification[];
  recommendations: any[];
  onNavigate: (tab: string) => void;
  onSelectBrandForAction: (brand: any, actionType: 'pitch' | 'campaign' | 'research') => void;
  onSaveBrand?: (brand: Brand) => void;
  onUpdateCrmStage?: (
    brandId: string, 
    brandName: string, 
    website: string, 
    industry: string, 
    stage: CRMStage, 
    dealValue?: number
  ) => void;
}

export default function DashboardView({
  creatorProfile,
  savedBrands,
  opportunities,
  notifications,
  recommendations,
  onNavigate,
  onSelectBrandForAction,
  onSaveBrand,
  onUpdateCrmStage
}: DashboardViewProps) {

  // Dynamic Metrics
  const totalSaved = savedBrands.length;
  const contactedDeals = opportunities.filter(o => o.stage !== 'Saved').length;
  const inProgressDeals = opportunities.filter(o => o.stage !== 'Saved' && o.stage !== 'Won' && o.stage !== 'Lost');
  const pipelineValue = opportunities
    .filter(o => o.stage !== 'Lost')
    .reduce((sum, o) => sum + (o.dealValue || 0), 0);

  const followUpsDue = opportunities.filter(o => {
    if (!o.followUpDate) return false;
    const due = new Date(o.followUpDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    return due <= today && o.stage !== 'Won' && o.stage !== 'Lost';
  }).length;

  const currentHour = new Date().getHours();
  let timeGreeting = "Welcome back";
  if (currentHour >= 5 && currentHour < 12) timeGreeting = "Good morning";
  else if (currentHour >= 12 && currentHour < 18) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  const nameToUse = creatorProfile.creatorName || creatorProfile.fullName || 'Creator';
  const firstName = nameToUse.includes('@') ? nameToUse.split('@')[0] : nameToUse.split(' ')[0];

  // Gamification metrics
  const wonDeals = opportunities.filter(o => o.stage === 'Won');
  const wonRevenue = wonDeals.reduce((sum, o) => sum + (o.dealValue || 0), 0);
  const activeOpportunitiesCount = opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length;
  const creatorScore = Math.min(1000, 350 + (wonDeals.length * 100) + (savedBrands.length * 15) + (activeOpportunitiesCount * 30));
  const creatorRank = creatorScore >= 800 ? "Elite Rank V" : creatorScore >= 600 ? "Diamond Rank III" : "Gold Rank I";

  // =========================================================
  // ADVANCED: MISSION CONTROL INTEGRATION STATES
  // =========================================================
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [mcResult, setMcResult] = useState<any | null>(null);
  const [execSteps, setExecSteps] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionDoneStatus, setActionDoneStatus] = useState<Record<string, string>>({});

  // Trigger quick clipboard copiers
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run the unified agentic AI Operating system workflow
  const handleExecuteCommand = async (customCmd?: string) => {
    const activeCommand = customCmd || commandInput;
    if (!activeCommand.trim()) return;

    setIsExecuting(true);
    setMcResult(null);
    setCommandInput(activeCommand);

    // Initial loading steps simulator (Visual feedback of background orchestration)
    setExecSteps([
      { label: "Ingesting command parameters into Heimdall HUD...", status: "loading" },
      { label: "Connecting semantic indices...", status: "pending" },
      { label: "Authenticating local memory vectors...", status: "pending" }
    ]);

    try {
      const response = await fetch('/api/mission-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: activeCommand,
          creatorProfile
        })
      });
      const data = await response.json();

      if (data && data.heading) {
        const rawSteps = data.executionSteps || [];
        // Prime steps as loading/pending
        const initialSteps = rawSteps.map((step: any, idx: number) => ({
          ...step,
          status: idx === 0 ? "loading" : "pending"
        }));
        setExecSteps(initialSteps);

        // Stagger steps output to show authentic background process
        for (let i = 0; i < initialSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setExecSteps(prev => prev.map((item, idx) => {
            if (idx === i) return { ...item, status: "completed" };
            if (idx === i + 1) return { ...item, status: "loading" };
            return item;
          }));
        }

        await new Promise(resolve => setTimeout(resolve, 350));
        setMcResult(data);
      }
    } catch (err) {
      console.error("Mission Control error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Quick Action: Save Brand to parent state
  const handleSaveBrandMC = (item: any) => {
    if (!onSaveBrand) return;
    const brandToSave: Brand = {
      id: `b_mc_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      website: item.website || 'https://example.com',
      industry: item.industry || 'Lifestyle',
      category: 'Tech',
      country: 'United States',
      creatorProgramPage: '',
      partnershipPage: '',
      publicMarketingContact: item.contact || '',
      publicPartnershipContact: item.contact || '',
      instagram: `@${item.name.toLowerCase().replace(/\s+/g, '')}`,
      linkedin: '',
      notes: item.reason || 'Found via Mission Control'
    };

    onSaveBrand(brandToSave);
    setActionDoneStatus(prev => ({ ...prev, [item.name]: 'saved' }));
  };

  // Quick Action: Push to CRM sequence
  const handlePushToCrmMC = (brandName: string, dealValStr: string) => {
    if (!onUpdateCrmStage) return;
    const numVal = parseInt(dealValStr.replace(/[^0-9]/g, ''), 10) || 1500;
    
    // Auto sync to pipeline
    onUpdateCrmStage(
      `br_${brandName.toLowerCase().replace(/\s+/g, '')}`,
      brandName,
      `https://www.${brandName.toLowerCase().replace(/\s+/g, '')}.com`,
      "UGC Collabs",
      "Contacted",
      numVal
    );

    setActionDoneStatus(prev => ({ ...prev, [brandName]: 'crm' }));
  };

  // Suggest default quick command presets
  const COMMAND_PRESETS = [
    { label: "Find 50 AI startups paying >$5,000", query: "Find 50 AI startups paying over $5,000 for cinematic UGC" },
    { label: "Generate Gymshark Campaign Outline", query: "Generate a Gymshark campaign creative brief and outreach" },
    { label: "Build my digital media kit & rate card", query: "Build my dynamic media kit & rate card portfolio website" },
    { label: "Show CRM deals pending no reply in 7 days", query: "Show CRM brand pipeline deals with no reply in 7 days" },
    { label: "Create contract & invoice files", query: "Create professional UGC agreement contract & invoice" },
    { label: "Audit licensing buyout risks & email counter", query: "Explain Gymshark's license buyout offer & suggested email counter" },
    { label: "Search luxury fitness videos in Vault", query: "Retrieve luxury fitness videos from Content Vault" }
  ];

  return (
    <div id="dashboard-view" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* 1. System Status Greeting & Digital HUD Tracker */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF] animate-ping shadow-[0_0_12px_#00C8FF]"></span>
          <span className="text-xs font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Heimdall OS Mission Control Active</span>
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-none font-sans">
              {timeGreeting}, <span className="text-glow-emerald text-[#00C8FF] font-sans font-bold">{firstName}</span>.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light mt-3 max-w-3xl leading-relaxed">
              Heimdall is your unified <span className="text-white font-medium">AI Operating System</span>. Query files, launch campaigns, track payments, and automate outreach in one command.
            </p>
          </div>
          
          {/* Quick Stats Summary Pill */}
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-md shadow-lg shadow-[#00C8FF]/5">
            <Flame className="w-4.5 h-4.5 text-orange-400 animate-pulse" />
            <div className="text-xs font-mono text-zinc-300">
              <span className="text-white font-bold">9-Day Workspace Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIGNATURE FEATURE: THE UNIFIED COMMAND CENTER (MISSION CONTROL) */}
      {/* ========================================================= */}
      <div className="cyber-panel bg-gradient-to-r from-[#121c2c]/95 to-[#0b1524]/95 border border-[#00C8FF]/25 rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00C8FF]/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#32E8FF]/10 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Top Header Grid decoration */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF]">
              <Command className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg font-sans tracking-tight">System Command Console</h3>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Unified Orchestrator Module</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#32E8FF] bg-[#32E8FF]/10 border border-[#32E8FF]/20 px-3 py-1 rounded-full uppercase font-bold">
            <Terminal className="w-3 h-3" />
            <span>Root Active</span>
          </div>
        </div>

        {/* Console Command Input Box */}
        <div className="space-y-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleExecuteCommand(); }} 
            className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl p-2 focus-within:border-[#00C8FF]/50 focus-within:shadow-[0_0_15px_rgba(0,200,255,0.15)] transition-all"
          >
            <div className="pl-3 text-[#32E8FF] shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="What task should Heimdall execute? (e.g., 'Find 50 AI startups', 'Generate a Gymshark campaign')"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-white text-sm md:text-base focus:outline-none placeholder-zinc-500 font-sans py-2.5"
            />
            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="px-6 py-3 bg-[#00C8FF] text-black font-bold uppercase font-mono tracking-wider text-xs rounded-xl hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00C8FF]/15"
            >
              <span>{isExecuting ? 'Orchestrating' : 'Execute'}</span>
              <Play className="w-3.5 h-3.5 fill-black" />
            </button>
          </form>

          {/* Prompt pills suggestion matrix */}
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Quick Command Hotkeys</div>
            <div className="flex flex-wrap gap-2">
              {COMMAND_PRESETS.map((pill, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleExecuteCommand(pill.query)}
                  disabled={isExecuting}
                  className="px-3.5 py-2 text-[11px] font-mono rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00C8FF]/30 text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all text-left uppercase tracking-wider cursor-pointer"
                >
                  ⚡ {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Loading Steps Terminal */}
        {isExecuting && (
          <div className="p-5 rounded-2xl bg-black/80 border border-white/5 font-mono text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-white/5 text-[10px]">
              <span>HEIMDALL INTERCEPT DEEP-THINK ENGINE</span>
              <span className="animate-pulse text-[#00C8FF]">● RUNNING</span>
            </div>
            <div className="space-y-2.5">
              {execSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {step.status === 'completed' && <CheckCircle2 className="w-4.5 h-4.5 text-[#29F59C] shrink-0" />}
                  {step.status === 'loading' && <div className="w-4 h-4 rounded-full border-2 border-dashed border-[#00C8FF] animate-spin shrink-0"></div>}
                  {step.status === 'pending' && <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 shrink-0"></div>}
                  <span className={`${step.status === 'completed' ? 'text-zinc-400' : step.status === 'loading' ? 'text-[#00C8FF] font-semibold' : 'text-zinc-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unified Dynamic AI Result Section */}
        {mcResult && (
          <div className="p-6 rounded-2xl bg-black/50 border border-[#00C8FF]/30 space-y-6 animate-in slide-in-from-top-6 duration-500 relative">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded">
              Orchestrated
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#00C8FF]">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">{mcResult.heading}</h4>
              </div>
              <p className="text-white text-sm leading-relaxed font-sans">{mcResult.message}</p>
            </div>

            {/* Render Widgets dynamically based on parsed result payload */}

            {/* WIDGET TYPE 1: AI BRAND FINDER LIST */}
            {mcResult.data?.type === "brands_list" && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-wider">Autonomous Scanning Index matches</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcResult.data.items.map((brand: any, idx: number) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-[#00C8FF]/20 transition-all space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-base">{brand.name}</h5>
                            <span className="text-[10px] font-mono text-zinc-500">({brand.industry})</span>
                          </div>
                          <span className="text-xs text-zinc-400 font-mono mt-1 block">{brand.website}</span>
                        </div>
                        {/* Circular custom score */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Fit score</span>
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                            {brand.score}/100
                          </span>
                        </div>
                      </div>

                      <p className="text-zinc-400 text-xs leading-relaxed font-light">{brand.reason}</p>

                      <div className="grid grid-cols-2 gap-3 text-[11px] bg-black/40 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-zinc-500 block font-mono uppercase text-[9px]">Est. Budget Range</span>
                          <span className="text-zinc-300 font-semibold">{brand.budget}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-mono uppercase text-[9px]">PR Outreach Mail</span>
                          <span className="text-zinc-300 font-semibold">{brand.contact}</span>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-zinc-500 block font-mono uppercase text-[9px]">Creative Style Preferred</span>
                          <span className="text-zinc-300 italic">"{brand.style}"</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-2">
                        {actionDoneStatus[brand.name] === 'saved' ? (
                          <span className="flex-1 text-center py-2 text-xs font-bold uppercase font-mono text-emerald-400 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
                            Saved to Index ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSaveBrandMC(brand)}
                            className="flex-1 py-2 bg-white/5 border border-white/10 hover:bg-[#00C8FF]/10 hover:border-[#00C8FF]/30 text-white text-[11px] font-bold font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            Save Brand
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onSelectBrandForAction({ name: brand.name, website: brand.website, industry: brand.industry }, 'pitch');
                            onNavigate('AI Assistant');
                          }}
                          className="flex-1 py-2 bg-[#00C8FF] text-black text-[11px] font-bold font-mono uppercase tracking-wider rounded-lg hover:brightness-110 transition-colors cursor-pointer text-center"
                        >
                          Pitch Brand
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDGET TYPE 2: AI CREATIVE DIRECTOR CAMPAIGN BRIEF */}
            {mcResult.data?.type === "campaign_creator" && (
              <div className="space-y-5 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center bg-[#00C8FF]/5 border border-[#00C8FF]/10 p-4 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">Target brand partner</span>
                    <h5 className="text-white font-bold text-base mt-1">{mcResult.data.brandName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-[#00C8FF] uppercase font-bold">Campaign Launch</span>
                    <h5 className="text-[#00C8FF] font-bold font-mono text-sm mt-1">{mcResult.data.campaignTitle}</h5>
                  </div>
                </div>

                {/* Creative Brief Details */}
                <div className="space-y-3.5">
                  <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider border-b border-white/5 pb-1">1. Creative Director Briefing (20 campaign ideas compiled)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-[#32E8FF] uppercase">Storyboarding Shot List</span>
                      <ul className="text-xs text-zinc-400 space-y-2">
                        {mcResult.data.creativeBrief.shotList.map((shot: string, sIdx: number) => (
                          <li key={sIdx} className="flex gap-2 items-start">
                            <span className="w-1.5 h-1.5 bg-[#32E8FF] rounded-full mt-1.5 shrink-0"></span>
                            <span>{shot}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#32E8FF] uppercase block mb-1">Cinematic Script Snippet</span>
                        <p className="text-xs text-zinc-300 italic leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
                          {mcResult.data.creativeBrief.scriptSnippet}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-mono">
                        <div>
                          <span className="text-zinc-500 block uppercase">B-Roll Assets</span>
                          <span className="text-white font-semibold">{mcResult.data.creativeBrief.bRollList?.join(', ') || 'Gym floor, weights'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block uppercase">Visual Grading</span>
                          <span className="text-white font-semibold">{mcResult.data.creativeBrief.editingNotes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personalized outreach template */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">2. Autogenerated Personalized Pitch Mail</h6>
                    <button
                      onClick={() => handleCopyText(mcResult.data.pitchEmail, 'pitch_email_mc')}
                      className="text-[11px] font-mono text-[#00C8FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'pitch_email_mc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'pitch_email_mc' ? 'Copied' : 'Copy Draft'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/60 rounded-xl border border-white/10 text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono">
                    {mcResult.data.pitchEmail}
                  </pre>
                </div>

                {/* Delivery sequence steps */}
                <div className="space-y-3">
                  <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">3. Spaced Delivery Pipeline (Automated Sequence)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400">
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                      <span className="text-white font-bold block mb-1">SEQUENCE NODE 1</span>
                      <span>{mcResult.data.deliverySequence.step1}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                      <span className="text-white font-bold block mb-1">SEQUENCE NODE 2</span>
                      <span>{mcResult.data.deliverySequence.step2}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                      <span className="text-white font-bold block mb-1">SEQUENCE NODE 3</span>
                      <span>{mcResult.data.deliverySequence.step3}</span>
                    </div>
                    <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                      <span className="text-white font-bold block mb-1">SEQUENCE NODE 4</span>
                      <span>{mcResult.data.deliverySequence.step4}</span>
                    </div>
                  </div>
                </div>

                {/* Sync to pipeline trigger */}
                <div className="pt-2">
                  {actionDoneStatus[mcResult.data.brandName] === 'crm' ? (
                    <div className="w-full text-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs uppercase">
                      Campaign Sequence Online! Pipeline Synced to CRM Hub ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePushToCrmMC(mcResult.data.brandName, mcResult.data.creativeBrief.editingNotes || "1500")}
                      className="w-full py-3 bg-[#00E676] hover:brightness-110 text-black font-bold font-mono uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Launch Campaign & Deploy CRM Outbound Sequence</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* WIDGET TYPE 3: AI PORTFOLIO GENERATOR */}
            {mcResult.data?.type === "portfolio_assets" && (
              <div className="space-y-5 pt-2 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] p-4.5 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Live Creator Portal URL</span>
                    <h5 className="text-[#32E8FF] font-bold text-sm mt-1">{mcResult.data.websiteUrl}</h5>
                  </div>
                  <a
                    href={mcResult.data.websiteUrl}
                    target="_blank"
                    rel="referrer noopener"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>View Live Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Grid list of assets */}
                <div className="space-y-3">
                  <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Dynamic portable asset cards</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mcResult.data.assetsList.map((asset: any, aIdx: number) => (
                      <div key={aIdx} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-white text-xs font-semibold block">{asset.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{asset.format}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] uppercase">
                          {asset.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rate Card pricing tiers */}
                <div className="space-y-3">
                  <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Synchronized Creator Pricing Rate Card</h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs text-center">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-zinc-500 block uppercase text-[8px] mb-1">Instagram Reel</span>
                      <span className="text-white font-bold text-sm">{mcResult.data.rateCard.instagramReel}</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-zinc-500 block uppercase text-[8px] mb-1">TikTok Video</span>
                      <span className="text-white font-bold text-sm">{mcResult.data.rateCard.tiktokVideo}</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-zinc-500 block uppercase text-[8px] mb-1">YouTube Sponsor</span>
                      <span className="text-white font-bold text-sm">{mcResult.data.rateCard.youtubeSponsor}</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-zinc-500 block uppercase text-[8px] mb-1">UGC Video Bundle</span>
                      <span className="text-white font-bold text-sm">{mcResult.data.rateCard.ugcVideoBundle}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('Media Kit')}
                    className="w-full py-2.5 bg-[#00C8FF] text-black font-bold uppercase font-mono text-xs tracking-wider rounded-xl hover:brightness-110 transition-colors cursor-pointer text-center"
                  >
                    Enter Portfolio Website Manager
                  </button>
                </div>
              </div>
            )}

            {/* WIDGET TYPE 4: CRM STALE RELATIONSHIPS */}
            {mcResult.data?.type === "crm_stale_deals" && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="text-[10px] font-mono text-[#FFC857] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>CRITICAL OUTBOX DELAYS // PENDING TOUCHPOINTS EXCEEDED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mcResult.data.staleDeals.map((deal: any, dIdx: number) => (
                    <div key={dIdx} className="bg-amber-500/[0.02] border border-amber-500/20 rounded-xl p-4.5 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-500/20 text-[#FFC857] font-mono text-[9px] font-bold px-2 py-0.5 uppercase">
                        {deal.daysStale} days stale
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] font-mono block uppercase">Brand Account</span>
                        <h5 className="font-bold text-white text-base">{deal.brand}</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-zinc-400">
                        <div>
                          <span className="text-zinc-600 uppercase text-[8px] block">Deal Budget</span>
                          <span className="text-white font-bold">{deal.value}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase text-[8px] block">Last Status</span>
                          <span className="text-[#FFC857]">{deal.lastAction}</span>
                        </div>
                      </div>

                      {actionDoneStatus[deal.brand] === 'revived' ? (
                        <div className="w-full text-center py-2 rounded text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Revived & Bumped ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => setActionDoneStatus(prev => ({ ...prev, [deal.brand]: 'revived' }))}
                          className="w-full py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-[#FFC857] text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Revive Deal
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Revival Template Box */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-300 uppercase">Revival Value-Add Outreach Template</span>
                    <button
                      onClick={() => handleCopyText(mcResult.data.revivalTemplate, 'revival_mc')}
                      className="text-[10px] font-mono text-[#00C8FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'revival_mc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Follow-Up Draft</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/60 rounded-xl border border-white/10 text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap font-mono">
                    {mcResult.data.revivalTemplate}
                  </pre>
                </div>
              </div>
            )}

            {/* WIDGET TYPE 5: LEGAL CONTRACTS & INVOICE MATRICES */}
            {mcResult.data?.type === "legal_documents" && (
              <div className="space-y-5 pt-2 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Side Documents Lists */}
                  <div className="space-y-3.5">
                    <h6 className="text-xs font-mono text-zinc-300 uppercase tracking-wider">Dynamic Legal documents generated</h6>
                    <div className="space-y-2">
                      {mcResult.data.availableDocs.map((doc: any, docIdx: number) => (
                        <div key={docIdx} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <span className="text-white font-bold block">{doc.name}</span>
                            <p className="text-zinc-500 text-[11px] leading-relaxed font-light">{doc.usage}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] uppercase">
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side Compensation Invoice Box */}
                  <div className="bg-zinc-900/60 p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-zinc-500 font-mono text-[8px] uppercase">Registered Invoice No.</span>
                        <h6 className="text-[#32E8FF] font-bold font-mono text-sm">{mcResult.data.draftInvoice.invoiceId}</h6>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[#FFC857] text-[8px] font-mono font-bold uppercase tracking-widest">
                        PENDING SUBMIT
                      </span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed font-light">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Client billing</span>
                          <span className="text-white font-semibold block truncate">{mcResult.data.draftInvoice.billTo}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Billing from</span>
                          <span className="text-white font-semibold block truncate">{mcResult.data.draftInvoice.billFrom}</span>
                        </div>
                      </div>

                      <div className="border-t border-b border-white/5 py-3 my-2 space-y-1">
                        <span className="text-zinc-500 block uppercase font-mono text-[8px]">Item Description</span>
                        <p className="text-zinc-300 font-medium">{mcResult.data.draftInvoice.description}</p>
                      </div>

                      <div className="flex justify-between items-end pt-1">
                        <div>
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Payment terms</span>
                          <span className="text-zinc-300 font-mono font-medium text-[10px]">{mcResult.data.draftInvoice.paymentTerms}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-500 block uppercase font-mono text-[8px]">Total outstanding due</span>
                          <span className="text-glow-emerald text-[#00E676] font-bold font-mono text-xl">{mcResult.data.draftInvoice.amountDue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Contract Clause block */}
                <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Interactive Legal Clause: Secondary Usage Buyout Cap</span>
                    <button
                      onClick={() => handleCopyText(mcResult.data.contractClause, 'clause_mc')}
                      className="text-[9px] font-mono text-[#00C8FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'clause_mc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Clause</span>
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400 font-mono italic">
                    {mcResult.data.contractClause}
                  </p>
                </div>
              </div>
            )}

            {/* WIDGET TYPE 6: AI DEAL NEGOTIATOR */}
            {mcResult.data?.type === "negotiator_brief" && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Valuation rating card */}
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1.5 text-center">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Offer Fairness Valuation</span>
                    <h5 className="text-[#FFC857] font-bold text-lg font-sans">{mcResult.data.fairnessRating}</h5>
                    <p className="text-zinc-400 text-[10px] leading-relaxed font-light mt-2">{mcResult.data.dealValuation}</p>
                  </div>

                  {/* Risks List */}
                  <div className="col-span-2 space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Identified contract risk clauses</span>
                    {mcResult.data.riskClauses.map((clause: any, clIdx: number) => (
                      <div key={clIdx} className="p-3.5 bg-red-500/[0.02] border border-red-500/20 rounded-xl flex items-start gap-3.5">
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-red-500/20 text-red-400 uppercase shrink-0 mt-0.5">
                          {clause.risk}
                        </span>
                        <div className="text-xs">
                          <span className="text-white font-bold block">"{clause.clause}"</span>
                          <p className="text-zinc-400 text-[11px] mt-1 font-light leading-relaxed">{clause.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Counteroffer draft */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-300 uppercase">Suggested counteroffer email draft</span>
                    <button
                      onClick={() => handleCopyText(mcResult.data.suggestedCounter, 'counter_mc')}
                      className="text-[10px] font-mono text-[#00C8FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'counter_mc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Counteroffer Draft</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/60 rounded-xl border border-white/10 text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap font-mono">
                    {mcResult.data.suggestedCounter}
                  </pre>
                </div>
              </div>
            )}

            {/* WIDGET TYPE 7: CONTENT VAULT */}
            {mcResult.data?.type === "content_vault" && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#32E8FF]" />
                  <span>Semantic vault query index matches</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcResult.data.assets.map((asset: any, vIdx: number) => (
                    <div key={vIdx} className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex gap-4 hover:border-[#32E8FF]/20 transition-all">
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-white/5 shrink-0 text-zinc-500">
                        <Video className="w-6 h-6 text-zinc-400" />
                        <span className="text-[8px] font-mono mt-1 font-semibold text-zinc-500">{asset.duration}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <h6 className="text-white font-bold block leading-snug">{asset.title}</h6>
                        </div>
                        <div className="flex gap-1 flex-wrap pt-1">
                          {asset.tags.map((tag: string, tIdx: number) => (
                            <span key={tIdx} className="text-[9px] font-mono bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded uppercase">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-zinc-500">
                          <span>{asset.format}</span>
                          <span>•</span>
                          <span>Uploaded: {asset.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Router redirection link */}
            {mcResult.suggestedTab && mcResult.suggestedTab !== "Dashboard" && (
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 text-xs">
                <span className="text-zinc-400 font-sans font-light">Heimdall suggests opening the **{mcResult.suggestedTab}** to manage this output.</span>
                <button
                  onClick={() => onNavigate(mcResult.suggestedTab)}
                  className="px-3.5 py-1.5 bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg hover:bg-[#00C8FF]/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Go to {mcResult.suggestedTab}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intelligent AI Advisor / Suggestions Panel - JARVIS-themed floating glass block */}
      <div className="cyber-panel bg-gradient-to-r from-[#00C8FF]/5 to-[#32E8FF]/5 border border-[#00C8FF]/15 rounded-[28px] p-6 md:p-8 space-y-6 backdrop-blur-xl relative overflow-hidden">
        {/* Glow corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C8FF]/10 rounded-full filter blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#32E8FF]/10 rounded-full filter blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#00C8FF] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#00C8FF] uppercase tracking-widest">Heimdall Real-Time AI Copilot Advice</span>
            </div>
            <h3 className="text-white font-bold text-lg tracking-tight">Active Intelligence Insights</h3>
          </div>
          <span className="text-[10px] font-mono text-[#32E8FF] bg-[#32E8FF]/10 px-2.5 py-1 rounded-full border border-[#32E8FF]/15 uppercase font-bold">
            4 active threads
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex items-start gap-3 hover:border-[#00C8FF]/20 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mt-1.5 shrink-0 shadow-[0_0_6px_#FFC857]"></span>
            <div>
              <p className="text-xs font-semibold text-white">Follow-up Pending</p>
              <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">You haven't followed up with Gymshark in 9 days. High-retention contract values expire soon.</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex items-start gap-3 hover:border-[#00C8FF]/20 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-[#32E8FF] mt-1.5 shrink-0 shadow-[0_0_6px_#32E8FF]"></span>
            <div>
              <p className="text-xs font-semibold text-white">Campaign Launch</p>
              <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">Apple launched a creator campaign in the consumer tech niche looking for cinematic UGC setups.</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex items-start gap-3 hover:border-[#00C8FF]/20 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C8FF] mt-1.5 shrink-0 shadow-[0_0_6px_#00C8FF]"></span>
            <div>
              <p className="text-xs font-semibold text-white">Talent Acquisition</p>
              <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">Wise is recruiting creators with an audience in the United States and Europe for UGC briefs.</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex items-start gap-3 hover:border-[#00C8FF]/20 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 mt-1.5 shrink-0 shadow-[0_0_6px_#E879F9]"></span>
            <div>
              <p className="text-xs font-semibold text-white">Niche Correlation Match</p>
              <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">Here are 7 skincare and lifestyle brands matching your specific profile metrics and pricing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area Wrapper - Glassmorphic bento setup */}
      <div className="bg-transparent space-y-12">
        {/* 2. Apple Health-inspired Creator DNA / AI Status Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Pipeline Value & Revenue Tracker */}
          <div className="glass-card p-6.5 rounded-[24px] flex flex-col justify-between h-[190px] relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#00C8FF]/5 rounded-full filter blur-xl group-hover:bg-[#00C8FF]/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Pipeline Revenue</span>
              <Shield className="w-5 h-5 text-[#00C8FF] shadow-[0_0_8px_#00C8FF]" />
            </div>
            <div>
              <div className="text-4xl font-bold font-mono tracking-tight text-white">${pipelineValue.toLocaleString()}</div>
              <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shadow-[0_0_4px_#00C8FF]"></span>
                Won: ${wonRevenue.toLocaleString()} this month
              </div>
            </div>
          </div>

          {/* Card 2: Strategic Matches & New Saved Brands */}
          <div className="glass-card p-6.5 rounded-[24px] flex flex-col justify-between h-[190px] relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#32E8FF]/5 rounded-full filter blur-xl group-hover:bg-[#32E8FF]/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Saved Matches</span>
              <Bookmark className="w-5 h-5 text-[#32E8FF]" />
            </div>
            <div>
              <div className="text-4xl font-bold font-mono tracking-tight text-white">{totalSaved}</div>
              <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#32E8FF]"></span>
                Discovered brand fits
              </div>
            </div>
          </div>

          {/* Card 3: Gamified Creator Score */}
          <div className="glass-card p-6.5 rounded-[24px] flex flex-col justify-between h-[190px] relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-fuchsia-500/5 rounded-full filter blur-xl group-hover:bg-fuchsia-500/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Creator Score</span>
              <TrendingUp className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white">{creatorScore} <span className="text-xs text-zinc-500">/ 1000</span></div>
              <div className="text-[10px] text-fuchsia-300 mt-2 flex items-center gap-1.5 font-mono uppercase tracking-widest font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_4px_#FF5D73]"></span>
                {creatorRank}
              </div>
            </div>
          </div>

          {/* Card 4: Action Reminders */}
          <div className="glass-card p-6.5 rounded-[24px] flex flex-col justify-between h-[190px] relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#FFC857]/5 rounded-full filter blur-xl group-hover:bg-[#FFC857]/10 transition-all duration-500"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">Due Follow-Ups</span>
              <Calendar className={`w-5 h-5 ${followUpsDue > 0 ? 'text-[#FFC857] animate-pulse' : 'text-zinc-600'}`} />
            </div>
            <div>
              <div className={`text-4xl font-bold font-mono tracking-tight ${followUpsDue > 0 ? 'text-[#FFC857]' : 'text-white'}`}>
                {followUpsDue}
              </div>
              <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${followUpsDue > 0 ? 'bg-[#FFC857]' : 'bg-zinc-600'}`}></span>
                Pitches needing touchpoints
              </div>
            </div>
          </div>

        </div>

        {/* 2.5 AI Memory Core Index Card (Deep Creator DNA Profile) */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[24px] p-6 md:p-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#32E8FF] animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white">Heimdall Autonomous AI Memory Matrix</h4>
            </div>
            <span className="text-[8px] font-mono text-[#00C8FF] bg-[#00C8FF]/10 px-2.5 py-0.5 rounded border border-[#00C8FF]/20 uppercase font-bold shadow-[0_0_6px_rgba(0,200,255,0.1)]">
              Persistent Memory Active
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs leading-relaxed">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Creator Niche</span>
              <p className="text-zinc-200 font-medium truncate">{creatorProfile.niches?.join(', ') || 'Tech, Lifestyle, UGC'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Pricing Profile</span>
              <p className="text-zinc-200 font-medium truncate">${Object.values(creatorProfile.basePricing || {})[0] || '1,200'} Base Rate</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Aesthetic Tone</span>
              <p className="text-zinc-200 font-medium truncate">Premium, Cinematic</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Audience Location</span>
              <p className="text-zinc-200 font-medium truncate">{creatorProfile.country || 'Global Reach'}</p>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Dream Collabs</span>
              <p className="text-zinc-200 font-medium truncate">Nike, Apple, Gymshark</p>
            </div>
          </div>
        </div>

        {/* 3. Deep Mission Control Section: Brand Fits & Live Telemetry Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side: Neural Brand Matches (Apple styled luxury grid) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#00C8FF]" />
                <h2 className="text-xl font-bold text-white tracking-tight">Curated Neural Brand Matches</h2>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                Niches: {creatorProfile.niches?.join(', ') || 'Global Content'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="glass-card p-6 md:p-8 rounded-[24px] flex flex-col justify-between min-h-[300px] space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8FF]/5 rounded-full filter blur-xl group-hover:bg-[#00C8FF]/10 transition-all duration-300"></div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-lg tracking-tight">{rec.brandName}</h4>
                          <span className="text-xs text-[#32E8FF] font-mono tracking-wider uppercase block mt-1">{rec.industry}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] text-[10px] font-mono font-bold shadow-[0_0_8px_rgba(0,200,255,0.1)]">
                          {rec.matchScore}% FIT
                        </span>
                      </div>

                      <p className="text-zinc-400 text-xs leading-relaxed font-light">
                        {rec.reason}
                      </p>

                      <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[11px] leading-relaxed">
                        <span className="text-[#32E8FF] font-semibold block uppercase tracking-wider text-[9px] mb-1.5 font-mono">Suggested Angle:</span>
                        <span className="text-zinc-300 italic">"{rec.angle}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <button
                        id={`rec-pitch-btn-${rIdx}`}
                        onClick={() => onSelectBrandForAction({ name: rec.brandName, website: rec.website, industry: rec.industry }, 'pitch')}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 hover:border-white/20 transition-all font-mono uppercase tracking-wider cursor-pointer"
                      >
                        AI Pitch
                      </button>
                      <button
                        id={`rec-campaign-btn-${rIdx}`}
                        onClick={() => onSelectBrandForAction({ name: rec.brandName, website: rec.website, industry: rec.industry }, 'campaign')}
                        className="flex-1 py-2.5 rounded-xl bg-[#00C8FF] text-black text-xs font-bold hover:brightness-115 shadow-lg shadow-[#00C8FF]/10 transition-all font-mono uppercase tracking-wider cursor-pointer"
                      >
                        Create Studio
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 rounded-[24px] col-span-2 text-center text-zinc-500 py-16 space-y-4">
                  <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-400">Heimdall Neural Array Scanning...</p>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto font-light leading-relaxed">
                    Please update your creator stats and targets in Settings or run the onboarding assistant to synchronize matches.
                  </p>
                  <button
                    onClick={() => onNavigate('Settings')}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Configure Talents
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Partnership Bulletins & OS Activity Logs */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#32E8FF]" />
                <h2 className="text-xl font-bold text-white tracking-tight">Active Bulletins</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Live telemetry</span>
            </div>

            <div className="glass-card rounded-[24px] overflow-hidden shadow-2xl border border-white/5 divide-y divide-white/5">
              <div className="max-h-[460px] overflow-y-auto divide-y divide-white/5">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-5.5 space-y-2.5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                          notif.type === 'alert' ? 'text-[#FFC857]' :
                          notif.type === 'success' ? 'text-[#29F59C]' : 'text-[#00C8FF]'
                        }`}>{notif.title}</h4>
                        <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed font-light">
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-zinc-500 text-xs space-y-4">
                    <Activity className="w-8 h-8 mx-auto text-zinc-600 animate-pulse" />
                    <p className="font-mono text-zinc-500 uppercase tracking-wider">SYSTEM CHANNELS NOMINAL</p>
                    <p className="text-zinc-600 font-light">Waiting for outreach metrics, brand agreements, or media kit analytics events.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

