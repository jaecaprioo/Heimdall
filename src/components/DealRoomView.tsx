import React, { useState } from 'react';
import { DealRoom, DealStage, DealDeliverable, CreatorProfile, BrandProfile } from '../types';
import { 
  ShieldCheck, 
  Check, 
  Send, 
  Upload, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lock
} from 'lucide-react';

interface DealRoomViewProps {
  deals: DealRoom[];
  activeDealId?: string;
  creatorProfile?: CreatorProfile | null;
  brandProfile?: BrandProfile | null;
  isBrandMode: boolean;
  onUpdateDealStage: (dealId: string, stage: DealStage) => void;
  onUpdateDeliverableStatus: (dealId: string, deliverableId: string, status: DealDeliverable['status']) => void;
  onSendDealMessage: (dealId: string, content: string, senderRole: 'creator' | 'brand' | 'system') => void;
  onResolveScopeCreep: (dealId: string, alertId: string, action: 'accept' | 'dismiss') => void;
  onSelectDeal?: (dealId: string) => void;
}

export default function DealRoomView({
  deals,
  activeDealId,
  creatorProfile,
  brandProfile,
  isBrandMode,
  onUpdateDealStage,
  onUpdateDeliverableStatus,
  onSendDealMessage,
  onResolveScopeCreep,
  onSelectDeal
}: DealRoomViewProps) {
  // Default sample deals if empty
  const defaultDeals: DealRoom[] = deals.length > 0 ? deals : [
    {
      id: 'deal-1',
      dealTitle: 'Nike Air Max Campaign',
      brandId: 'b-nike',
      brandName: 'Nike Running',
      brandLogo: '',
      creatorId: 'c-alex',
      creatorName: 'Alex Rivers',
      creatorAvatar: '',
      currentStage: 'Approval',
      totalBudget: 2400,
      paymentStatus: 'in_escrow',
      deliverables: [
        { id: 'del-1', title: '1x Instagram 4K Reel (Dedicated)', platform: 'instagram', type: 'Reel', status: 'submitted_for_review', dueDate: 'May 24', price: 1800 },
        { id: 'del-2', title: '3x Story Slides with Product Sticker', platform: 'instagram', type: 'Story', status: 'approved', dueDate: 'May 26', price: 600 }
      ],
      messages: [
        { id: 'm-1', senderId: 'b-nike', senderName: 'Nike Running', senderRole: 'brand', content: 'Escrow deposit of $2,400.00 confirmed and locked. Excited to review the first cut!', timestamp: 'Yesterday' },
        { id: 'm-2', senderId: 'c-alex', senderName: 'Alex Rivers', senderRole: 'creator', content: 'Uploaded 4K Reel draft preview for review. Color grade and pacing match Q3 spec.', timestamp: '2 hours ago' }
      ],
      campaignMilestones: [
        { title: 'Deposit in Escrow', status: 'completed', date: 'May 15' },
        { title: 'Draft Submitted', status: 'completed', date: 'May 19' },
        { title: 'Review & Feedback', status: 'in_progress', date: 'May 22' }
      ],
      scopeCreepAlerts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'deal-2',
      dealTitle: 'Gymshark Apex Partnership',
      brandId: 'b-gymshark',
      brandName: 'Gymshark',
      brandLogo: '',
      creatorId: 'c-alex',
      creatorName: 'Alex Rivers',
      creatorAvatar: '',
      currentStage: 'Payment',
      totalBudget: 1800,
      paymentStatus: 'in_escrow',
      deliverables: [
        { id: 'del-3', title: '1x TikTok High-Energy UGC Video', platform: 'tiktok', type: 'Video', status: 'pending', dueDate: 'June 02', price: 1800 }
      ],
      messages: [
        { id: 'm-3', senderId: 'sys', senderName: 'Heimdall Sentinel', senderRole: 'system', content: 'Milestone escrow agreement signed by both parties.', timestamp: 'May 18' }
      ],
      campaignMilestones: [
        { title: 'Deposit in Escrow', status: 'completed', date: 'May 18' },
        { title: 'Content Production', status: 'in_progress', date: 'June 02' }
      ],
      scopeCreepAlerts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const [selectedDealId, setSelectedDealId] = useState<string>(activeDealId || defaultDeals[0].id);
  const [chatInput, setChatInput] = useState('');
  const [draftUploadSuccess, setDraftUploadSuccess] = useState(false);
  const [paymentReleased, setPaymentReleased] = useState(false);

  const currentDeal = defaultDeals.find(d => d.id === selectedDealId) || defaultDeals[0];

  const milestones = [
    { step: 1, label: 'Deposit in Escrow', completed: true, active: false },
    { step: 2, label: 'Draft Submitted', completed: true, active: false },
    { step: 3, label: 'Feedback Approved', completed: currentDeal.currentStage === 'Publishing' || currentDeal.currentStage === 'Completion' || paymentReleased, active: currentDeal.currentStage === 'Approval' && !paymentReleased },
    { step: 4, label: 'Content Live', completed: currentDeal.currentStage === 'Completion' || paymentReleased, active: currentDeal.currentStage === 'Publishing' },
    { step: 5, label: 'Payment Released', completed: paymentReleased, active: false }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendDealMessage(currentDeal.id, chatInput, isBrandMode ? 'brand' : 'creator');
    setChatInput('');
  };

  const handleDraftUpload = () => {
    setDraftUploadSuccess(true);
    if (currentDeal.deliverables[0]) {
      onUpdateDeliverableStatus(currentDeal.id, currentDeal.deliverables[0].id, 'submitted_for_review');
    }
    setTimeout(() => setDraftUploadSuccess(false), 3500);
  };

  const handleReleasePayment = () => {
    setPaymentReleased(true);
    onUpdateDealStage(currentDeal.id, 'Completion');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Smart Milestone Escrow Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Autonomous Deal Room
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            5-step milestone tracking, secure deliverables upload, and contract defense.
          </p>
        </div>

        {/* Deal selector buttons */}
        <div className="flex items-center gap-2 p-1 bg-white/80 border border-zinc-200/80 rounded-full shadow-sm text-xs font-semibold">
          {defaultDeals.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDealId(d.id);
                if (onSelectDeal) onSelectDeal(d.id);
              }}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedDealId === d.id
                  ? 'bg-teal-700 text-white font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {d.brandName} (${d.totalBudget})
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5-STEP MILESTONE TIMELINE                                 */}
      {/* ========================================================= */}
      <div className="rounded-[28px] glass-panel p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Deal Reference #{currentDeal.id}</span>
            <h2 className="text-xl font-extrabold text-zinc-900 font-display">
              {currentDeal.brandName} ↔ {currentDeal.creatorName}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Locked in Escrow</span>
            <span className="text-2xl font-extrabold text-teal-700 font-display">${currentDeal.totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* 5-Step Timeline Bar */}
        <div className="grid grid-cols-5 gap-2 relative pt-2">
          {milestones.map((m) => (
            <div key={m.step} className="flex flex-col items-center text-center space-y-2 relative">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                m.completed
                  ? 'bg-teal-700 text-white'
                  : m.active
                  ? 'bg-teal-100 border-2 border-teal-600 text-teal-800 animate-pulse'
                  : 'bg-zinc-100 text-zinc-400'
              }`}>
                {m.completed ? <Check className="w-4 h-4" /> : m.step}
              </div>
              <span className={`text-[11px] font-bold leading-tight ${
                m.completed || m.active ? 'text-zinc-900' : 'text-zinc-400'
              }`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid (Left: Deliverables & Upload, Right: Secure Deal Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Deliverable Status & Draft Upload */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Deliverables List Card */}
          <div className="rounded-[28px] glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 font-display">Required Deliverables</h3>

            <div className="space-y-3">
              {currentDeal.deliverables.map((del) => (
                <div key={del.id} className="p-4 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-zinc-900">{del.title}</h4>
                    <span className="text-[10px] text-zinc-400 font-semibold block">Due: {del.dueDate || 'Upon Schedule'}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    del.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : del.status === 'submitted_for_review'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {del.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Upload & Action Zone */}
          <div className="rounded-[28px] glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 font-display">Submit Video Draft / Review</h3>

            <div 
              onClick={handleDraftUpload}
              className="border-2 border-dashed border-zinc-200 hover:border-teal-400 rounded-2xl p-6 text-center bg-white/60 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-teal-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-900">Click to upload 4K video draft or paste Frame.io link</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Automated timestamped hash will be logged to the audit log.</p>
            </div>

            {draftUploadSuccess && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Draft successfully timestamped and submitted to brand for review.</span>
              </div>
            )}

            {/* Release Payment Button (Available for brand or when approved) */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">Smart Escrow Protection: Active</span>
              <button
                onClick={handleReleasePayment}
                className="teal-pill-button px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <DollarSign className="w-4 h-4" />
                <span>{paymentReleased ? 'Payment Released ✓' : 'Approve & Release Escrow ($2,400)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Deal Room Communication Feed */}
        <div className="lg:col-span-5 rounded-[28px] glass-panel p-6 flex flex-col justify-between h-[540px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-extrabold text-zinc-900 font-display">Contract & Milestone Chat</h3>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Encrypted
              </span>
            </div>

            {/* Chat messages */}
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {currentDeal.messages.map((m) => (
                <div 
                  key={m.id}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    m.senderRole === 'creator'
                      ? 'bg-teal-700 text-white ml-6 rounded-tr-none'
                      : m.senderRole === 'brand'
                      ? 'bg-white text-zinc-900 mr-6 rounded-tl-none border border-zinc-200/80 shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 text-center font-mono text-[10px]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75">
                    <span className="font-bold capitalize">{m.senderRole}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to deal partner..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 outline-none focus:border-teal-500 font-medium"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
