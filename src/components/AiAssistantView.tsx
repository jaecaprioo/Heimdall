import React, { useState, useRef, useEffect } from 'react';
import { CreatorProfile, SavedBrand, AssistantMessage } from '../types';
import { 
  Sparkles, 
  Send, 
  ArrowUpRight, 
  HelpCircle, 
  User, 
  Bot, 
  Layers, 
  FileText, 
  Activity, 
  Check, 
  Copy, 
  Clock, 
  Cpu, 
  CornerDownLeft,
  ChevronRight,
  Database,
  Volume2
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
      content: "Awaiting instruction. My neural registers have synchronized with your Creator Profile niches, followers demographics, and pricing brackets. I am fully prepared to synthesize custom brand outreach pitches, video content briefs, or contract terms.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🔍 Discover premium tech partners', type: 'discovery', params: { search: 'tech' } },
        { label: '⚡ Draft JARVIS pitch for Nike', type: 'pitch', params: { brandId: 'b1', brandName: 'Nike' } },
        { label: '🎬 Video concept storyboard for Airbnb', type: 'campaign', params: { brandId: 'b5', brandName: 'Airbnb' } }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Real-time active workspace asset state
  const [activeAsset, setActiveAsset] = useState<{
    title: string;
    type: 'pitch' | 'brief' | 'contract' | 'general';
    content: string;
    meta?: any;
  }>({
    title: "Primary Directives Matrix",
    type: "general",
    content: `[HEIMDALL INTEL MATRIX ACTIVE]

Select an action or chat with Heimdall on the left to generate customized pitches, scripts, or UGC campaign briefs.

Sponsor Synchronizations: Active
Niche Alignment: ${creatorProfile?.niches?.join(', ') || 'Global Lifestyle'}
Follower Base: ${creatorProfile?.followersCount?.instagram || '150k+'} total reach
Base Deal Valuation: $${Object.values(creatorProfile?.basePricing || {})[0] || '1,200'} per campaign`,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTriggerAction = (action: any) => {
    if (action.type === 'discovery') {
      onExecuteAction('discovery', action.params?.search || '');
    } else {
      triggerAssetGeneration(action);
    }
  };

  const triggerAssetGeneration = async (action: any) => {
    setLoading(true);
    const userMsg: AssistantMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: `${action.label}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (action.type === 'pitch') {
        const res = await fetch('/api/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: { name: action.params?.brandName || 'Sponsor', website: 'https://www.google.com' },
            creator: creatorProfile
          })
        });
        const data = await res.json();
        if (data.status === 'ok' || data.status === 'mock') {
          setActiveAsset({
            title: `Custom AI Pitch: ${action.params?.brandName}`,
            type: 'pitch',
            content: `SUBJECT: ${data.data.subjectLine}\n\n${data.data.emailBody}\n\n---\nINSTAGRAM DM PITCH:\n"${data.data.instagramDm}"\n\n---\nLINKEDIN MSG:\n"${data.data.linkedinMessage}"`,
            meta: { brandName: action.params?.brandName }
          });
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            role: 'assistant',
            content: `I have compiled an exclusive multi-channel Pitch Deck for **${action.params?.brandName}** on your right-hand Workspace Canvas. You can review, copy, or log it directly to your CRM.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } else if (action.type === 'campaign') {
        const res = await fetch('/api/campaign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: { name: action.params?.brandName || 'Sponsor', website: 'https://www.google.com' },
            creator: creatorProfile
          })
        });
        const data = await res.json();
        if (data.status === 'ok' || data.status === 'mock') {
          const formattedConcepts = data.data.concepts?.map((c: any) => `CONCEPT: ${c.title}\nDescription: ${c.description}\nHook Variants:\n - "${c.hooks?.[0]}"\n - "${c.hooks?.[1]}"\nCTA: ${c.callToAction}`).join('\n\n');
          setActiveAsset({
            title: `UGC Storyboard: ${action.params?.brandName}`,
            type: 'brief',
            content: `TITLE: ${data.data.title}\n\n${formattedConcepts}\n\n---\nPRODUCTION SHOT LISTS:\n${data.data.shotLists?.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}`,
            meta: { brandName: action.params?.brandName }
          });
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            role: 'assistant',
            content: `UGC concepts and camera scene shot lists for **${action.params?.brandName}** are fully generated on the right.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: AssistantMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          creator: creatorProfile,
          savedBrands
        })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        const assistantMsg: AssistantMessage = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.data.suggestedActions || []
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (data.data.content.includes("Subject") || data.data.content.includes("Dear")) {
          setActiveAsset({
            title: "Dynamic AI Output",
            type: 'pitch',
            content: data.data.content
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: "My neural registers experienced a minor connectivity event. Please transmit your directive again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[calc(100vh-10rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* LEFT COLUMN: Conversation Engine (JARVIS Interface) */}
      <div className="lg:col-span-5 flex flex-col justify-between cyber-panel rounded-[28px] overflow-hidden relative h-[680px]">
        {/* Animated background lines specifically for the AI core */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C8FF]/5 rounded-full filter blur-xl pointer-events-none"></div>

        {/* Chat Header */}
        <div className="p-5 bg-white/[0.01] border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/30 flex items-center justify-center text-[#00C8FF] ${loading ? 'animate-spin' : 'animate-pulse'}`}>
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">JARVIS Neural Core</h2>
              <span className="text-[9px] text-[#32E8FF] font-mono tracking-widest block mt-0.5">HELM COMMAND MATRIX</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#00C8FF]/5 px-2.5 py-1 rounded-full border border-[#00C8FF]/20 font-mono text-[9px] text-zinc-300">
            <Database className="w-3 h-3 text-[#32E8FF]" />
            <span>Telemetry Synced</span>
          </div>
        </div>

        {/* Message Feeds */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[85%] space-y-2">
                <div className={`p-4 rounded-[20px] text-xs leading-relaxed font-light ${
                  m.role === 'user' 
                    ? 'bg-white/5 text-white border border-white/10' 
                    : 'bg-[#101826]/40 text-zinc-200 border border-[#00C8FF]/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]'
                }`}>
                  <p className="whitespace-pre-line">
                    {m.content.split('**').map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className="text-[#00C8FF] font-semibold font-sans">{part}</strong> : part
                    )}
                  </p>
                </div>

                {/* Suggestions triggers */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2">
                    {m.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        id={`chat-action-btn-${aIdx}`}
                        onClick={() => handleTriggerAction(action)}
                        className="text-left text-xs bg-white/5 hover:bg-[#00C8FF]/10 hover:text-[#00C8FF] border border-white/10 hover:border-[#00C8FF]/35 rounded-xl py-2.5 px-4 text-zinc-300 flex items-center justify-between transition-all font-mono cursor-pointer"
                      >
                        <span>{action.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#00C8FF] opacity-80" />
                      </button>
                    ))}
                  </div>
                )}

                <span className={`block text-[9px] text-zinc-500 font-mono ${m.role === 'user' ? 'text-right' : ''}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#32E8FF]/10 border border-[#32E8FF]/20 text-[#32E8FF] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3.5 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/30 text-[#00C8FF] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-3 flex-1 max-w-[85%]">
                <div className="p-4 rounded-[20px] bg-[#101826]/60 border border-[#00C8FF]/20 text-zinc-400 text-xs flex flex-col gap-3">
                  {/* Holographic Thinking Wave Animation */}
                  <div className="flex items-center gap-1.5 py-1.5">
                    <Volume2 className="w-4 h-4 text-[#00C8FF] animate-bounce" />
                    <span className="text-[9px] font-mono tracking-widest text-[#00C8FF]/70 uppercase">Synthesizing vocal algorithms...</span>
                  </div>
                  <div className="flex items-end gap-1 px-1 h-5">
                    <span className="w-1 bg-[#00C8FF] h-2 rounded animate-[floatOrb_0.8s_infinite_alternate_ease-in-out]"></span>
                    <span className="w-1 bg-[#32E8FF] h-4 rounded animate-[floatOrb_1.1s_infinite_alternate_ease-in-out_0.2s]"></span>
                    <span className="w-1 bg-[#00C8FF] h-1 rounded animate-[floatOrb_0.6s_infinite_alternate_ease-in-out_0.1s]"></span>
                    <span className="w-1 bg-[#32E8FF] h-5 rounded animate-[floatOrb_1.3s_infinite_alternate_ease-in-out_0.4s]"></span>
                    <span className="w-1 bg-[#00C8FF] h-3 rounded animate-[floatOrb_0.9s_infinite_alternate_ease-in-out_0.3s]"></span>
                    <span className="w-1 bg-[#32E8FF] h-1.5 rounded animate-[floatOrb_0.7s_infinite_alternate_ease-in-out_0.5s]"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/40 relative z-10">
          <div className="relative">
            <input
              id="assistant-main-input"
              type="text"
              required
              placeholder="Command JARVIS AI: 'Draft Gymshark pitch' or 'Generate tech angles'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3.5 glass-input text-xs placeholder:text-zinc-500 font-mono"
            />
            <button
              id="send-main-assistant-btn"
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-[#00C8FF] hover:bg-[#32E8FF] disabled:bg-zinc-800 text-black disabled:text-zinc-600 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-2.5 flex items-center justify-center gap-1 font-mono">
            <HelpCircle className="w-3 h-3 text-zinc-600" />
            <span>Fully integrated with your creator profile variables & targets.</span>
          </p>
        </form>
      </div>

      {/* RIGHT COLUMN: Generated Assets Workspace Canvas (Arc-like workspace) */}
      <div className="lg:col-span-7 flex flex-col justify-between cyber-panel rounded-[28px] overflow-hidden relative h-[680px]">
        
        {/* Workspace Header */}
        <div className="p-5 bg-white/[0.01] border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#32E8FF]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">{activeAsset.title}</h2>
              <span className="text-[9px] text-[#32E8FF] font-mono block mt-0.5 uppercase tracking-wider">WORKSPACE ACTIVE CANVAS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-asset-btn"
              onClick={() => handleCopy(activeAsset.content, 'canvas-copy')}
              className="px-3.5 py-2 bg-white/5 hover:bg-[#00C8FF]/10 border border-white/10 hover:border-[#00C8FF]/30 rounded-xl text-[10px] text-zinc-300 flex items-center gap-1.5 transition-all font-mono cursor-pointer"
            >
              {copiedField === 'canvas-copy' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00C8FF]" />
                  <span className="text-[#00C8FF] font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY ALL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Content Canvas */}
        <div className="flex-1 p-8 overflow-y-auto bg-black/20 text-zinc-300 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all relative z-10">
          {activeAsset.content}
        </div>

        {/* Dynamic Context Footer Panel */}
        <div className="p-5 bg-[#101826]/40 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00C8FF] animate-pulse" />
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Canvas telemetry synced</span>
          </div>

          {activeAsset.type === 'pitch' && activeAsset.meta?.brandName && (
            <button
              onClick={() => {
                onExecuteAction('crm_sync', { brandName: activeAsset.meta.brandName, stage: 'Contacted' });
                alert(`Sync recorded! ${activeAsset.meta.brandName} is now tracked in your pipeline.`);
              }}
              className="px-5 py-2.5 btn-emerald text-black font-bold text-[10px] uppercase tracking-wider rounded-xl font-mono transition-colors cursor-pointer"
            >
              Log Pitch in CRM
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
