import React, { useState } from 'react';
import { CRMOpportunity, CRMStage } from '../types';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Trash, 
  Edit, 
  Check, 
  MessageSquare, 
  DollarSign, 
  X,
  Target,
  Clock,
  Sparkles,
  Link2
} from 'lucide-react';

interface CrmViewProps {
  opportunities: CRMOpportunity[];
  onUpdateStage: (oppId: string, stage: CRMStage) => void;
  onUpdateOppValue: (oppId: string, value: number) => void;
  onAddNote: (oppId: string, note: string) => void;
  onSetFollowUp: (oppId: string, date: string) => void;
  onDeleteOpp: (oppId: string) => void;
  onAddCustomOpp: (opp: Partial<CRMOpportunity>) => void;
}

const STAGES: CRMStage[] = [
  'Saved',
  'Contacted',
  'Waiting',
  'Replied',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

export default function CrmView({
  opportunities,
  onUpdateStage,
  onUpdateOppValue,
  onAddNote,
  onSetFollowUp,
  onDeleteOpp,
  onAddCustomOpp
}: CrmViewProps) {
  // New Opportunity State
  const [isAdding, setIsAdding] = useState(false);
  const [newOpp, setNewOpp] = useState<Partial<CRMOpportunity>>({
    brandName: '', website: '', industry: 'General', stage: 'Saved', dealValue: 500, notes: '', contactPerson: '', contactEmail: ''
  });

  // Inline Editing States
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);
  const [newNoteText, setNewNoteText] = useState<{ [key: string]: string }>({});
  const [followUpDateText, setFollowUpDateText] = useState<{ [key: string]: string }>({});

  const handleCreateOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpp.brandName) return;

    onAddCustomOpp({
      ...newOpp,
      id: 'opp-' + Math.random().toString(),
      updatedAt: new Date().toISOString()
    });
    setIsAdding(false);
    setNewOpp({
      brandName: '', website: '', industry: 'General', stage: 'Saved', dealValue: 500, notes: '', contactPerson: '', contactEmail: ''
    });
  };

  const calculateStageTotal = (stage: CRMStage) => {
    return opportunities
      .filter(o => o.stage === stage)
      .reduce((sum, o) => sum + (o.dealValue || 0), 0);
  };

  // Get stage-specific aesthetic accent class
  const getStageStyle = (stage: CRMStage) => {
    switch (stage) {
      case 'Won': return { dot: 'bg-[#00C8FF]', border: 'border-[#00C8FF]/30', bg: 'bg-[#00C8FF]/10' };
      case 'Lost': return { dot: 'bg-[#EF4444]', border: 'border-[#EF4444]/20', bg: 'bg-[#EF4444]/5' };
      case 'Negotiation': 
      case 'Proposal Sent': return { dot: 'bg-[#32E8FF]', border: 'border-[#32E8FF]/30', bg: 'bg-[#32E8FF]/10' };
      default: return { dot: 'bg-zinc-500', border: 'border-white/10', bg: 'bg-[#101826]/30' };
    }
  };

  return (
    <div id="crm-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Heimdall Sponsorship CRM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            Outreach CRM Pipeline
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Nurture, track, and close your brand sponsorship contracts. Manage stages, log notes, and keep schedules updated.
          </p>
        </div>

        <button
          id="add-opportunity-btn"
          onClick={() => setIsAdding(true)}
          className="px-5 py-3 btn-emerald text-black shadow-lg shadow-[#00C8FF]/10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all self-start md:self-auto font-mono cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Main Content Area Wrapper */}
      <div className="bg-transparent space-y-10">
        {/* 2. Glass OS Pipeline Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-xs font-mono text-zinc-500 backdrop-blur-md">
          <div className="space-y-1">
            <span className="tracking-wider uppercase text-[9px] text-zinc-400">TOTAL PIPELINE SLOTS:</span>
            <span className="block text-white font-bold text-2xl font-mono">{opportunities.length}</span>
          </div>
          <div className="space-y-1">
            <span className="tracking-wider uppercase text-[9px] text-[#32E8FF]">ESTIMATED TOTAL VAL:</span>
            <span className="block text-[#32E8FF] font-bold text-2xl font-mono">
              ${opportunities.reduce((sum, o) => sum + (o.dealValue || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            <span className="tracking-wider uppercase text-[9px] text-[#00C8FF]">REVENUE GENERATED:</span>
            <span className="block text-[#00C8FF] font-bold text-2xl font-mono">
              ${opportunities.filter(o => o.stage === 'Won').reduce((sum, o) => sum + (o.dealValue || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            <span className="tracking-wider uppercase text-[9px] text-zinc-400">ACTIVE DISCUSSIONS:</span>
            <span className="block text-white font-bold text-2xl font-mono">
              {opportunities.filter(o => o.stage !== 'Won' && o.stage !== 'Lost').length}
            </span>
          </div>
        </div>

        {/* 3. Kanban Lanes Frame */}
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-6 min-w-[1200px]">
            {STAGES.map((stage) => {
              const list = opportunities.filter(o => o.stage === stage);
              const stageTotal = calculateStageTotal(stage);
              const stageAesthetics = getStageStyle(stage);

              return (
                <div 
                  key={stage} 
                  className="flex-1 min-w-[280px] max-w-[320px] bg-white/[0.01] border border-white/10 rounded-[24px] p-5 flex flex-col min-h-[580px] backdrop-blur-md relative"
                >
                  {/* Lane Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-white/10 text-xs font-mono mb-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stageAesthetics.dot}`}></span>
                      <span className="text-zinc-200 font-bold uppercase tracking-wider">{stage}</span>
                      <span className="text-zinc-500">({list.length})</span>
                    </div>
                    <span className="text-zinc-300 font-bold font-mono">${stageTotal.toLocaleString()}</span>
                  </div>

                  {/* Deal Cards list */}
                  <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                    {list.length > 0 ? (
                      list.map((opp) => (
                        <div 
                          key={opp.id} 
                          className={`p-5 glass-card rounded-[20px] space-y-4 border relative group ${stageAesthetics.border} ${stageAesthetics.bg}`}
                        >
                          {/* Title block */}
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-white text-sm tracking-tight">{opp.brandName}</h4>
                              <button
                                id={`delete-opp-${opp.id}`}
                                onClick={() => onDeleteOpp(opp.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-all shrink-0 cursor-pointer"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-[#32E8FF] font-mono mt-0.5 block uppercase tracking-wider">{opp.industry}</span>
                          </div>

                          {/* Opportunity stats / fields */}
                          <div className="space-y-3 text-[11px] text-zinc-400 font-light">
                            
                            {/* Stage selector */}
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-mono">Stage:</span>
                              <select
                                value={opp.stage}
                                onChange={(e) => onUpdateStage(opp.id, e.target.value as CRMStage)}
                                className="bg-black/60 border border-white/10 text-zinc-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-[#00C8FF] font-mono"
                              >
                                {STAGES.map(s => <option key={s} value={s} className="bg-[#101826] text-white">{s}</option>)}
                              </select>
                            </div>

                            {/* Deal Value Editor */}
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-mono">Valuation:</span>
                              {editingOppId === opp.id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-zinc-500">$</span>
                                  <input
                                    type="number"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(Number(e.target.value))}
                                    className="w-16 bg-black/60 border border-white/10 text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-[#00C8FF] font-mono"
                                  />
                                  <button
                                    id={`save-val-${opp.id}`}
                                    onClick={() => {
                                      onUpdateOppValue(opp.id, editingValue);
                                      setEditingOppId(null);
                                    }}
                                    className="text-[#00C8FF] hover:text-[#32E8FF] p-0.5 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                                  <span>${(opp.dealValue || 0).toLocaleString()}</span>
                                  <button
                                    id={`edit-val-btn-${opp.id}`}
                                    onClick={() => {
                                      setEditingOppId(opp.id);
                                      setEditingValue(opp.dealValue || 0);
                                    }}
                                    className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Contact */}
                            {(opp.contactPerson || opp.contactEmail) && (
                              <div className="pt-2 border-t border-white/5 text-[10px]">
                                <p className="text-zinc-300 truncate font-mono">{opp.contactPerson || 'Point of Contact'}</p>
                                <p className="text-[#32E8FF] truncate mt-0.5 font-mono">{opp.contactEmail}</p>
                              </div>
                            )}

                            {/* Follow up Schedule */}
                            <div className="pt-2 border-t border-white/5 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-zinc-500 uppercase tracking-wider text-[9px] font-mono">Follow-Up:</span>
                                <span className="text-zinc-300 font-mono truncate max-w-[120px]">{opp.followUpDate || 'None Set'}</span>
                              </div>

                              <div className="flex gap-1">
                                <input
                                  type="date"
                                  value={followUpDateText[opp.id] || ''}
                                  onChange={(e) => setFollowUpDateText({ ...followUpDateText, [opp.id]: e.target.value })}
                                  className="flex-1 bg-black/60 border border-white/10 text-[9px] text-zinc-400 rounded-lg p-1 focus:outline-none focus:border-[#00C8FF] font-mono"
                                />
                                <button
                                  id={`set-follow-${opp.id}`}
                                  onClick={() => {
                                    const d = followUpDateText[opp.id];
                                    if (d) {
                                      onSetFollowUp(opp.id, d);
                                      setFollowUpDateText({ ...followUpDateText, [opp.id]: '' });
                                    }
                                  }}
                                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 transition-colors cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Notes timeline */}
                            <div className="pt-2 border-t border-white/5 space-y-1.5">
                              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">
                                <span>Action Log:</span>
                                <MessageSquare className="w-3 h-3 text-[#32E8FF]" />
                              </div>

                              {opp.notes && (
                                <p className="p-2 rounded-lg bg-black/60 text-[10px] leading-relaxed text-zinc-300 italic border border-white/5">
                                  "{opp.notes}"
                                </p>
                              )}

                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  placeholder="Log terms, chat log..."
                                  value={newNoteText[opp.id] || ''}
                                  onChange={(e) => setNewNoteText({ ...newNoteText, [opp.id]: e.target.value })}
                                  className="flex-1 bg-black/60 border border-white/10 text-[9px] text-zinc-300 placeholder:text-zinc-600 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00C8FF] font-mono"
                                />
                                <button
                                  id={`add-note-btn-${opp.id}`}
                                  onClick={() => {
                                    const val = newNoteText[opp.id];
                                    if (val?.trim()) {
                                      onAddNote(opp.id, val.trim());
                                      setNewNoteText({ ...newNoteText, [opp.id]: '' });
                                    }
                                  }}
                                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 transition-colors cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-600 space-y-2">
                        <Clock className="w-5 h-5 opacity-40" />
                        <p className="text-[10px] font-mono uppercase tracking-wider">LANE EMPTY</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Add Opportunity Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-[28px] p-8 space-y-6 relative border border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">Create Sponsorship Opportunity</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Brand Partner Name *</label>
                  <input
                    type="text"
                    required
                    value={newOpp.brandName}
                    onChange={(e) => setNewOpp({...newOpp, brandName: e.target.value})}
                    placeholder="e.g. Red Bull"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Valuation ($USD) *</label>
                  <input
                    type="number"
                    required
                    value={newOpp.dealValue}
                    onChange={(e) => setNewOpp({...newOpp, dealValue: Number(e.target.value)})}
                    placeholder="1500"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Contact Person</label>
                  <input
                    type="text"
                    value={newOpp.contactPerson || ''}
                    onChange={(e) => setNewOpp({...newOpp, contactPerson: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Contact Email</label>
                  <input
                    type="email"
                    value={newOpp.contactEmail || ''}
                    onChange={(e) => setNewOpp({...newOpp, contactEmail: e.target.value})}
                    placeholder="e.g. partnerships@redbull.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Industry</label>
                  <input
                    type="text"
                    value={newOpp.industry}
                    onChange={(e) => setNewOpp({...newOpp, industry: e.target.value})}
                    placeholder="e.g. Food & Beverage"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Initial CRM Stage</label>
                  <select
                    value={newOpp.stage}
                    onChange={(e) => setNewOpp({...newOpp, stage: e.target.value as CRMStage})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00C8FF]"
                  >
                    {STAGES.map(s => <option key={s} value={s} className="bg-[#101826] text-white">{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 font-mono uppercase">Primary Opportunity Directives</label>
                <textarea
                  value={newOpp.notes}
                  onChange={(e) => setNewOpp({...newOpp, notes: e.target.value})}
                  placeholder="Record primary sponsorship terms, campaign scope of work, and negotiations..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-20 resize-none focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 btn-emerald text-black font-bold text-xs uppercase tracking-wider rounded-xl font-mono cursor-pointer"
                >
                  Index Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
