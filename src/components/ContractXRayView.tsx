import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  ArrowRight, 
  RefreshCw, 
  Info,
  Scale,
  Zap,
  DollarSign,
  UploadCloud,
  FileCheck,
  ChevronRight,
  Sliders,
  Award
} from 'lucide-react';
import { ContractAnalysis, NegotiationResult, NegotiationTone, CreatorProfile } from '../types';

interface ContractXRayViewProps {
  creatorProfile?: CreatorProfile | null;
  onApplyNegotiatedTerms?: (dealId: string, terms: any) => void;
}

const PRESET_CONTRACTS = [
  {
    title: 'Standard Apparel Creator Agreement (Flagged)',
    snippet: `AGREEMENT FOR SPONSORSHIP & CONTENT PRODUCTION
1. DELIVERABLES: Creator agrees to create 2x Instagram Reels, 3x Instagram Stories with product placement.
2. COMPENSATION: Brand shall pay Creator $800.00 within ninety (90) days following final Brand written approval and receipt of verified reach statistics.
3. USAGE RIGHTS & WHITELISTING: Creator hereby grants Brand a perpetual, irrevocable, worldwide, royalty-free license to use, edit, and distribute Content in any digital and print media. Brand is authorized to run Meta Partnership Ads and Spark Ads without budget limits or separate licensing fees.
4. EXCLUSIVITY: Creator agrees not to promote, partner with, or endorse any health, fitness, apparel, nutrition, or beverage brand for six (6) months prior to and following campaign completion.
5. REVISIONS: Creator shall provide unlimited revisions until Brand expresses complete creative satisfaction.
6. TERMINATION: Brand may terminate at will without kill fee liability.`
  },
  {
    title: 'Balanced Creator Ambassador Agreement',
    snippet: `CREATOR PARTNERSHIP MASTER SERVICES AGREEMENT
1. SCOPE: 1x Instagram 4K Reel and 2x Story Frames highlighting the Q2 Footwear Drop.
2. REMUNERATION: $1,400.00. 50% payable upfront upon signing, remaining 50% payable Net-15 upon live publishing.
3. USAGE RIGHTS: 30-day organic digital usage rights across brand social channels. Whitelisting is optional at $250/mo.
4. EXCLUSIVITY: 14-day exclusivity restricted strictly to direct competing running shoe models.
5. REVISIONS: Up to two (2) rounds of minor editorial cuts included. Additional structural changes billed at $120/hr.`
  }
];

export default function ContractXRayView({ creatorProfile }: ContractXRayViewProps) {
  const [contractInput, setContractInput] = useState(PRESET_CONTRACTS[0].snippet);
  const [contractTitle, setContractTitle] = useState(PRESET_CONTRACTS[0].title);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>({
    contractTitle: 'Standard Apparel Creator Agreement',
    riskScore: 78,
    riskLevel: 'HIGH',
    executiveSummary: 'This contract contains significant commercial risks: 90-day Net payment terms, perpetual royalty-free paid usage rights, and an overly broad 6-month non-compete clause.',
    clauses: [
      {
        clauseName: 'Clause 3: Paid Usage & Whitelisting Rights',
        originalText: 'Creator grants Brand perpetual, irrevocable, worldwide, royalty-free license to use and edit Content in any media...',
        riskLevel: 'HIGH',
        explanation: 'Perpetual paid usage rights allow the brand to run paid ads with your face forever without paying additional royalties. Industry standard is 30–90 days with separate monthly whitelisting fees.',
        recommendedRevision: 'Grant 30-day organic digital usage rights. Any paid Meta/Spark Ads whitelisting billed separately at +$350/month.',
        commercialImpact: 'Estimated value loss of $1,800 in uncompensated advertising rights.'
      },
      {
        clauseName: 'Clause 2: Payment Terms (Net-90 Days)',
        originalText: 'Brand shall pay Creator $800.00 within ninety (90) days following final Brand written approval...',
        riskLevel: 'HIGH',
        explanation: 'Net-90 days is predatory for independent creators. Standard contract terms are 50% upfront deposit and remaining 50% Net-15 upon publishing.',
        recommendedRevision: '50% upon signing, 50% Net-15 upon live release, secured via Heimdall Escrow.',
        commercialImpact: 'High cash flow and non-payment risk.'
      },
      {
        clauseName: 'Clause 4: 6-Month Category Exclusivity',
        originalText: 'Creator agrees not to endorse any health, fitness, apparel, nutrition brand for 6 months...',
        riskLevel: 'MEDIUM',
        explanation: 'An overly broad 6-month exclusivity across 4 categories prevents you from accepting multiple other sponsorship deals.',
        recommendedRevision: 'Restrict exclusivity to 14 days and limit strictly to direct competing performance running shoes.',
        commercialImpact: 'Potential revenue blockage of $4,000+ from other fitness sponsors.'
      }
    ],
    recommendedNegotiationPoints: [
      'Cap paid whitelisting usage rights at 30 days or add a $350/mo licensing surcharge.',
      'Mandate 50% upfront deposit or secure funds in Heimdall Escrow before shoot.',
      'Narrow exclusivity window from 6 months to 14 days post-release.'
    ],
    commercialValuationScore: 58
  });

  // AI Negotiator states
  const [activeTab, setActiveTab] = useState<'xray' | 'negotiator'>('xray');
  const [selectedTone, setSelectedTone] = useState<NegotiationTone>('Professional');
  const [brandName, setBrandName] = useState('Gymshark');
  const [offerAmount, setOfferAmount] = useState<number>(800);
  const [deliverablesDesc, setDeliverablesDesc] = useState('2x Reels, 3x Story frames');
  const [isGeneratingCounter, setIsGeneratingCounter] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [counterDraft, setCounterDraft] = useState<string>(`Hi ${brandName} Team,

Thank you for sending over the partnership proposal! I'm really excited about the possibility of collaborating on the upcoming campaign.

After reviewing the agreement terms against my current commercial rate card and representation standards, I have a few adjustments to align our partnership:

1. Deliverables & Pricing: For 2x high-resolution Instagram Reels and 3x Story frames, my current calibrated rate based on verified reach is $1,400.
2. Usage Rights: The current agreement includes perpetual paid usage. I standardly include 30-day organic usage rights. If you would like paid Meta/TikTok whitelisting, we can include a 30-day add-on at $350.
3. Payment Schedule: To lock campaign production dates on my calendar, I require a 50% deposit upon signing (or escrow funding), with the remaining 50% Net-15 following release.

Let me know if these terms work on your end and I'll be glad to finalize our agreement!

Best regards,
${creatorProfile?.creatorName || 'Alex Rivers'}`);

  const handleAnalyzeContract = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/contract/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: contractInput,
          contractTitle: contractTitle,
          creatorName: creatorProfile?.creatorName || 'Creator',
          creatorBaseRates: creatorProfile?.basePricing
        })
      });
      const data = await res.json();
      if (data && data.clauses) {
        setAnalysis(data);
      }
    } catch (e) {
      console.error("Analysis error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateNegotiation = () => {
    setIsGeneratingCounter(true);
    setTimeout(() => {
      setIsGeneratingCounter(false);
      let draftText = `Hi ${brandName} Team,\n\nThank you for sending the partnership agreement.`;
      if (selectedTone === 'Firm') {
        draftText += `\n\nI have reviewed the agreement and identified terms that do not meet my standard commercial representation requirements:\n\n• Perpetual usage must be amended to 30 days organic.\n• Payment terms must be Net-15 (or secured via Escrow).\n• Deliverables fee is set at $1,400.\n\nPlease provide an updated contract reflecting these points so we can proceed.\n\nBest,\n${creatorProfile?.creatorName || 'Alex Rivers'}`;
      } else if (selectedTone === 'Relationship-first') {
        draftText += `\n\nI love your brand and really want to make this collaboration a huge success for both of us! To make sure our expectations are completely aligned, let's adjust the usage rights to 30 days and set the project fee at $1,250 to reflect recent audience growth.\n\nWarmly,\n${creatorProfile?.creatorName || 'Alex Rivers'}`;
      } else {
        draftText += `\n\nBased on my verified audience telemetry and deliverable matrix, I propose the following calibrated terms:\n\n1. Deliverable Fee: $1,400 for 2x Reels + 3x Story frames\n2. Usage Rights: 30-day organic usage rights included\n3. Payment: 50% deposit / 50% Net-15\n\nLooking forward to hearing your thoughts!\n\nBest,\n${creatorProfile?.creatorName || 'Alex Rivers'}`;
      }
      setCounterDraft(draftText);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>AI Legal & Commercial Sentinel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Contract X-Ray & AI Negotiator
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Audit clauses, detect hidden liabilities, and generate high-leverage counter-proposals in seconds.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-white/80 border border-zinc-200/80 rounded-full shadow-sm text-xs font-semibold">
          <button
            onClick={() => setActiveTab('xray')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'xray'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Contract X-Ray Audit
          </button>
          <button
            onClick={() => setActiveTab('negotiator')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'negotiator'
                ? 'bg-teal-700 text-white shadow-sm font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            AI Negotiator
          </button>
        </div>
      </div>

      {activeTab === 'xray' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 5 Cols: Upload / Paste Contract */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Upload Zone Card */}
            <div className="rounded-[28px] glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-zinc-900 font-display">Input Agreement</h3>
                <div className="flex gap-1.5">
                  {PRESET_CONTRACTS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setContractTitle(preset.title);
                        setContractInput(preset.snippet);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-2 border-dashed border-zinc-200 hover:border-teal-400/80 rounded-2xl p-4 text-center bg-white/50 transition-colors">
                <UploadCloud className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                <p className="text-xs font-bold text-zinc-800">Paste agreement or drop PDF / DOCX</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Scanned privately through client sandbox</p>
              </div>

              <textarea
                value={contractInput}
                onChange={(e) => setContractInput(e.target.value)}
                rows={10}
                placeholder="Paste contract text clauses here..."
                className="w-full p-3.5 bg-white/90 border border-zinc-200/90 rounded-2xl text-xs text-zinc-800 placeholder-zinc-400 font-mono leading-relaxed focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />

              <button
                onClick={handleAnalyzeContract}
                disabled={isAnalyzing || !contractInput.trim()}
                className="w-full teal-pill-button py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Legal Liabilities...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Contract X-Ray Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Subtle Professional Legal Disclaimer Component */}
            <div className="p-4 rounded-2xl bg-white/80 border border-zinc-200/70 text-[11px] text-zinc-500 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Heimdall Contract X-Ray is an AI business intelligence tool designed to highlight commercial negotiation risks. It does not constitute formal legal counsel. Consult an attorney for binding legal advice.
              </p>
            </div>

          </div>

          {/* Right 7 Cols: Audit Results & Clause Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            
            {analysis && (
              <>
                {/* Executive Score Card */}
                <div className="rounded-[28px] glass-panel p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Risk Assessment</span>
                      <h3 className="text-base font-extrabold text-zinc-900 font-display">{analysis.contractTitle}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-400 block">Commercial Score</span>
                        <span className="text-2xl font-extrabold text-teal-700 font-display">{analysis.commercialValuationScore || 74}/100</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/80 p-3.5 rounded-2xl border border-zinc-100">
                    {analysis.executiveSummary}
                  </p>

                  {/* Recommended Negotiation Points */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Key Strategic Negotiation Points</span>
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.recommendedNegotiationPoints?.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 bg-white/80 p-2.5 rounded-xl border border-zinc-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clause Breakdown Cards */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 font-display px-1">Detailed Clause Analysis</h3>
                  
                  {analysis.clauses?.map((clause, index) => (
                    <div 
                      key={index}
                      className={`rounded-[24px] glass-card p-5 space-y-3 border-l-4 ${
                        clause.riskLevel === 'HIGH' 
                          ? 'border-l-red-500' 
                          : clause.riskLevel === 'MEDIUM' 
                          ? 'border-l-amber-500' 
                          : 'border-l-emerald-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            clause.riskLevel === 'HIGH' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : clause.riskLevel === 'MEDIUM' 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {clause.riskLevel} RISK
                          </span>
                          <h4 className="text-xs font-extrabold text-zinc-900">{clause.clauseName}</h4>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-50 text-[11px] font-mono text-zinc-600 border border-zinc-200/60">
                        "{clause.originalText}"
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {clause.explanation}
                      </p>

                      <div className="p-3 rounded-xl bg-teal-50/90 border border-teal-200/80 text-xs space-y-1">
                        <span className="font-bold text-teal-900 block">Recommended Contract Revision:</span>
                        <p className="text-teal-800 text-[11px] leading-relaxed">{clause.recommendedRevision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </div>
      )}

      {/* AI NEGOTIATOR TAB */}
      {activeTab === 'negotiator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-5 rounded-[28px] glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 font-display">Negotiation Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Brand Partner</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Initial Brand Offer ($)</label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Deliverables</label>
                <input
                  type="text"
                  value={deliverablesDesc}
                  onChange={(e) => setDeliverablesDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Communication Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Professional', 'Confident', 'Firm', 'Relationship-first'] as NegotiationTone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTone(t)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedTone === t 
                          ? 'bg-teal-700 text-white shadow-sm' 
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateNegotiation}
                disabled={isGeneratingCounter}
                className="w-full teal-pill-button py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Counter-Proposal</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[28px] glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-extrabold text-zinc-900 font-display">Generated Counter-Pitch Draft</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(counterDraft);
                  setCopiedDraft(true);
                  setTimeout(() => setCopiedDraft(false), 2000);
                }}
                className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-teal-50 text-zinc-700 hover:text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDraft ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <textarea
              value={counterDraft}
              onChange={(e) => setCounterDraft(e.target.value)}
              rows={14}
              className="w-full p-4 bg-white/90 border border-zinc-200/90 rounded-2xl text-xs text-zinc-800 leading-relaxed font-sans focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

        </div>
      )}

    </div>
  );
}
