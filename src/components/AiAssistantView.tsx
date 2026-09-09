import React, { useState } from 'react';
import { CreatorProfile, SavedBrand, AssistantMessage } from '../types';
import { 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  User, 
  Bot, 
  Layers, 
  FileText, 
  Activity, 
  Check, 
  Copy, 
  Clock, 
  ChevronRight, 
  Scale,
  DollarSign,
  Compass,
  Zap,
  Target
} from 'lucide-react';

interface AiAssistantViewProps {
  creatorProfile: CreatorProfile;
  savedBrands: SavedBrand[];
  onExecuteAction: (type: string, params: any) => void;
}

export default function AiAssistantView({ creatorProfile, savedBrands, onExecuteAction }: AiAssistantViewProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: "Hello Alex. I am your Heimdall Executive Co-Pilot. I've calibrated your verified audience telemetry (126.4K reach, 6.24% engagement) and live rate card. How can I assist your business today?",
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Audit contract for hidden risks', type: 'contract', params: {} },
        { label: 'Calculate rate for a 3-video deal', type: 'rate', params: {} },
        { label: 'Find 5 fitness brands sponsoring right now', type: 'discovery', params: { niche: 'fitness' } },
        { label: 'Draft counter-proposal for Nike', type: 'pitch', params: { brandName: 'Nike' } }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active workspace memo preview
  const [activeMemo, setActiveMemo] = useState({
    title: 'Commercial Executive Briefing',
    content: `[HEIMDALL AUTONOMOUS BRIEFING]

Creator: ${creatorProfile?.creatorName || 'Alex Rivers'}
Current Valuation Score: 92 / 100
Optimal Reel Deliverable Rate: $500.00
Active Escrow Locked: $2,400.00 (Nike Running)

Recommended Action: You have 3 incoming inquiries with above-average budget capacity. Review your Contract X-Ray before countersigning.`
  });

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: AssistantMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let replyContent = "I've analyzed your telemetry and market benchmark databases.";
      let newMemo = activeMemo;

      if (query.toLowerCase().includes('rate') || query.toLowerCase().includes('3-video') || query.toLowerCase().includes('calculate')) {
        replyContent = `Based on your calibrated single-deliverable rate of $500/Reel, a multi-asset package of 3x 4K Reels should be priced at **$1,350** (a 10% multi-deliverable bundle incentive from $1,500) plus standard 30-day organic usage rights. If the brand requests paid Meta ad whitelisting, add +$350/mo.`;
        newMemo = {
          title: 'Custom 3-Video Deal Calibration',
          content: `Deliverables: 3x Instagram 4K Reels (60s dedicated)
Base Individual Total: $1,500 ($500 x 3)
Package Rate (10% bundle discount): $1,350
Optional 30-Day Paid Whitelisting: +$350
Total Proposed Scope: $1,700
Escrow Deposit Requirement: 50% ($850) upon signing.`
        };
      } else if (query.toLowerCase().includes('contract') || query.toLowerCase().includes('audit')) {
        replyContent = `Running Contract X-Ray: I've scanned standard sponsorship contracts. The top 3 risks to guard against are perpetual paid usage rights, Net-90 day payment delays, and broad 6-month non-compete clauses. Always require milestone escrow or 50% upfront.`;
        newMemo = {
          title: 'Contract X-Ray Sentinel Report',
          content: `Key Clause Flags Detected:
1. Clause 3 (Perpetual Usage): Recommended counter -> 30-day organic rights.
2. Clause 2 (Net-90 Payment): Recommended counter -> Heimdall Smart Escrow.
3. Clause 4 (Exclusivity): Recommended counter -> 14-day direct category only.`
        };
      } else if (query.toLowerCase().includes('fitness') || query.toLowerCase().includes('brands') || query.toLowerCase().includes('find')) {
        replyContent = `I have identified 3 Tier-1 fitness brands actively contracting creators in your bracket: Nike Running (Budget: $5K-$12K), Gymshark (Budget: $3.5K-$6.5K/mo retainer), and Whoop ($4K-$7.5K). All 3 match your demographic profile above 90%.`;
        newMemo = {
          title: 'Active Brand Sponsor Pipeline',
          content: `Top Matched Brands (Tier-1 US/UK Focus):
• Nike Running — 94% Match | Air Max Pulse Campaign
• Gymshark — 91% Match | Apex Conditioning Retainer
• Whoop — 88% Match | 4.0 Recovery Integration`
        };
      } else {
        replyContent = `Understood. I have updated your strategic workspace with customized recommendations based on your verified audience metrics and deal room milestones.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setActiveMemo(newMemo);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Executive</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Heimdall Co-Pilot
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Your contextual AI strategist for rate negotiation, contract defense, and sponsor pipeline matching.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
          <span>Real-Time Telemetry Connected</span>
        </div>
      </div>

      {/* Main Grid: Left Chat Stream, Right Live Strategic Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Chat Interface */}
        <div className="lg:col-span-7 rounded-[28px] glass-panel p-6 flex flex-col justify-between h-[600px]">
          
          {/* Messages list */}
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[460px]">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                <div className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                      H
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-teal-700 text-white font-medium rounded-tr-none shadow-md'
                      : 'bg-white/90 text-zinc-800 border border-zinc-200/80 shadow-sm rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>

                {/* Suggested prompts on initial greeting */}
                {m.suggestedActions && (
                  <div className="flex flex-wrap gap-2 pl-11 pt-1">
                    {m.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action.label)}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 text-zinc-700 hover:text-teal-900 border border-zinc-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        {action.label} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 pl-11">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Heimdall Co-Pilot is reasoning...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything: contract audits, pricing equations, brand matching..."
              className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 outline-none focus:border-teal-500 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer shadow-md disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right 5 Cols: Strategic Output Memo */}
        <div className="lg:col-span-5 rounded-[28px] glass-panel p-6 space-y-4 h-[600px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Strategic Asset</span>
                <h3 className="text-sm font-extrabold text-zinc-900 font-display">{activeMemo.title}</h3>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeMemo.content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-teal-50 text-zinc-600 hover:text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 font-mono text-[11px] text-zinc-700 leading-relaxed whitespace-pre-wrap shadow-inner overflow-y-auto max-h-[440px]">
              {activeMemo.content}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 text-center font-medium">
            Generated with Heimdall Autonomous Reasoning Pipeline
          </div>
        </div>

      </div>

    </div>
  );
}
