import React, { useState } from 'react';
import { PortfolioItem } from '../types';
import { 
  Plus, 
  Link as LinkIcon, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  Building, 
  Quote, 
  Trash, 
  AlertCircle,
  X,
  Check,
  FolderGit2
} from 'lucide-react';

interface PortfolioViewProps {
  portfolioItems: PortfolioItem[];
  onAddPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (itemId: string) => void;
}

export default function PortfolioView({
  portfolioItems,
  onAddPortfolioItem,
  onDeletePortfolioItem
}: PortfolioViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: '', description: '', mediaType: 'link', mediaUrl: '', tags: [], brandPartner: '',
    testimonial: { author: '', role: '', text: '' }
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.mediaUrl) return;

    const portfolioObj: PortfolioItem = {
      id: 'port-' + Math.random().toString(),
      userId: 'current-user',
      title: newItem.title,
      description: newItem.description || '',
      mediaType: newItem.mediaType || 'link',
      mediaUrl: newItem.mediaUrl,
      tags: newItem.tags || [],
      brandPartner: newItem.brandPartner || '',
      testimonial: newItem.testimonial?.text ? {
        author: newItem.testimonial.author || 'Anonymous Client',
        role: newItem.testimonial.role || 'Brand Manager',
        text: newItem.testimonial.text
      } : undefined
    };

    onAddPortfolioItem(portfolioObj);
    setIsAdding(false);
    setNewItem({
      title: '', description: '', mediaType: 'link', mediaUrl: '', tags: [], brandPartner: '',
      testimonial: { author: '', role: '', text: '' }
    });
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newItem.tags?.includes(tagInput.trim())) {
      setNewItem(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  return (
    <div id="portfolio-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FolderGit2 className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Aesthetic Asset Vault</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            Portfolio & Case Studies
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Upload and showcase your previous high-retention sponsorships, UGC campaigns, client reviews, and testimonials to secure premium brand contracts.
          </p>
        </div>

        <button
          id="add-portfolio-item-btn"
          onClick={() => setIsAdding(true)}
          className="px-5 py-3 btn-emerald text-black shadow-lg shadow-[#00C8FF]/10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all font-mono self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Project</span>
        </button>
      </div>

      {/* Grid of Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioItems.map((item) => (
          <div 
            key={item.id} 
            className="glass-card hover:border-[#00C8FF]/30 rounded-[24px] overflow-hidden flex flex-col justify-between transition-all duration-300 relative group"
          >
            {/* Content Body */}
            <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Media type banner */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-[#32E8FF] uppercase tracking-wider">
                    {item.mediaType === 'video' ? <Video className="w-3.5 h-3.5" /> : item.mediaType === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>{item.mediaType}</span>
                  </span>

                  <button
                    id={`delete-port-${item.id}`}
                    onClick={() => onDeletePortfolioItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-red-400 transition-all shrink-0 cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                {/* Title and details */}
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight leading-snug">{item.title}</h3>
                  {item.brandPartner && (
                    <div className="flex items-center gap-1.5 mt-1 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5 text-zinc-600" />
                      <span>SPONSOR: {item.brandPartner}</span>
                    </div>
                  )}
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed font-light">{item.description}</p>
              </div>

              {/* Tags & Actions */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[9px] uppercase tracking-wider font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Testimonial Block */}
                {item.testimonial && (
                  <div className="p-4 bg-[#00C8FF]/5 rounded-2xl border border-[#00C8FF]/15 space-y-2 relative border-l-[#00C8FF] border-l-2">
                    <Quote className="w-6 h-6 text-[#00C8FF]/5 absolute right-3 top-2 rotate-180" />
                    <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                      "{item.testimonial.text}"
                    </p>
                    <div className="text-[9px] font-mono text-[#00C8FF] uppercase tracking-wider font-semibold">
                      — {item.testimonial.author}, {item.testimonial.role}
                    </div>
                  </div>
                )}

                <a
                  href={item.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#32E8FF] hover:underline cursor-pointer"
                >
                  <span>Launch Asset</span>
                  <LinkIcon className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Upload Project Overlay Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-[28px] p-8 space-y-6 relative border border-white/10">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">Index Project / Case Study</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="e.g. Athleisure TikTok Campaign"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Brand Partner Name</label>
                  <input
                    type="text"
                    value={newItem.brandPartner || ''}
                    onChange={(e) => setNewItem({...newItem, brandPartner: e.target.value})}
                    placeholder="e.g. Gymshark"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Asset Media Type</label>
                  <select
                    value={newItem.mediaType}
                    onChange={(e) => setNewItem({...newItem, mediaType: e.target.value as 'video' | 'image' | 'link'})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00C8FF]"
                  >
                    <option value="link" className="bg-[#101826] text-white">Web Link</option>
                    <option value="video" className="bg-[#101826] text-white">Video File / Stream</option>
                    <option value="image" className="bg-[#101826] text-white">Image File</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-mono uppercase">Asset URL *</label>
                  <input
                    type="url"
                    required
                    value={newItem.mediaUrl}
                    onChange={(e) => setNewItem({...newItem, mediaUrl: e.target.value})}
                    placeholder="https://vimeo.com/..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-zinc-500 font-mono uppercase">Project Summary Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Summarize the core creative scope, visual concepts, video retention, and deliverables..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-20 resize-none focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-zinc-500 font-mono uppercase">Aesthetic Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. Fitness"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
                {newItem.tags && newItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newItem.tags.map(t => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] text-[9px] font-mono flex items-center gap-1">
                        <span>#{t}</span>
                        <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleRemoveTag(t)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                <span className="block text-[10px] text-zinc-500 font-mono uppercase">Optional Brand Testimonial</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Reviewer Name"
                    value={newItem.testimonial?.author || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      testimonial: { ...(newItem.testimonial || { role: '', text: '' }), author: e.target.value }
                    })}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                  <input
                    type="text"
                    placeholder="Reviewer Role (e.g. Brand Director)"
                    value={newItem.testimonial?.role || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      testimonial: { ...(newItem.testimonial || { author: '', text: '' }), role: e.target.value }
                    })}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>
                <textarea
                  placeholder="Paste direct endorsement or review text..."
                  value={newItem.testimonial?.text || ''}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    testimonial: { ...(newItem.testimonial || { author: '', role: '' }), text: e.target.value }
                  })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white h-16 resize-none focus:outline-none focus:border-[#00C8FF]"
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
                  Publish Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
