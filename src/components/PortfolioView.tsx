import React, { useState } from 'react';
import { PortfolioItem, CreatorProfile } from '../types';
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
  FolderGit2,
  Share2,
  ExternalLink,
  Eye,
  TrendingUp,
  Award,
  Users,
  Instagram,
  Youtube
} from 'lucide-react';

interface PortfolioViewProps {
  portfolioItems: PortfolioItem[];
  creatorProfile?: CreatorProfile | null;
  onAddPortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (itemId: string) => void;
}

export default function PortfolioView({
  portfolioItems,
  creatorProfile,
  onAddPortfolioItem,
  onDeletePortfolioItem
}: PortfolioViewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'ugc' | 'campaign'>('all');
  
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: '', 
    description: '', 
    mediaType: 'video', 
    mediaUrl: '', 
    tags: ['Fitness', 'UGC'], 
    brandPartner: 'Nike',
    testimonial: { author: 'Sarah Jenkins', role: 'Global Brand Director, Nike', text: 'Alex delivered incredible engagement on our product drop, driving over 320K organic impressions.' }
  });
  const [tagInput, setTagInput] = useState('');

  // Sample default case studies if empty
  const defaultItems: PortfolioItem[] = portfolioItems.length > 0 ? portfolioItems : [
    {
      id: 'port-1',
      userId: 'current-user',
      title: 'Nike Air Max Pulse Summer Launch Campaign',
      description: 'High-energy 4K vertical Reel showcasing footwear durability during high-intensity street training.',
      mediaType: 'video',
      mediaUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      brandPartner: 'Nike',
      tags: ['Athletic Wear', 'Footwear', 'Reels'],
      testimonial: {
        author: 'Marcus Vance',
        role: 'Senior Growth Director, Nike',
        text: 'The content outperformed our organic benchmark by 3.2x and brought in 18,000+ link clicks.'
      }
    },
    {
      id: 'port-2',
      userId: 'current-user',
      title: 'Gymshark Conditioning Retainer Integration',
      description: 'Monthly dedicated conditioning storytelling highlighting training apparel flexibility and recovery routines.',
      mediaType: 'video',
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
      brandPartner: 'Gymshark',
      tags: ['Fitness', 'Sponsorship', 'UGC'],
      testimonial: {
        author: 'Elena Rostova',
        role: 'Head of Influencer Marketing, Gymshark',
        text: 'Working with Alex is seamless. Clear communication, on-time delivery, and unmatched production fidelity.'
      }
    },
    {
      id: 'port-3',
      userId: 'current-user',
      title: 'Notion Creator Workflow Architecture',
      description: 'In-depth tutorial and custom template walkthrough for creator business management.',
      mediaType: 'link',
      mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
      brandPartner: 'Notion',
      tags: ['Productivity', 'Tech', 'Integration']
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const portfolioObj: PortfolioItem = {
      id: 'port-' + Math.random().toString(),
      userId: 'current-user',
      title: newItem.title,
      description: newItem.description || '',
      mediaType: newItem.mediaType || 'video',
      mediaUrl: newItem.mediaUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
      tags: newItem.tags || ['Creator UGC'],
      brandPartner: newItem.brandPartner || 'Partner Brand',
      testimonial: newItem.testimonial?.text ? {
        author: newItem.testimonial.author || 'Brand Partner',
        role: newItem.testimonial.role || 'Marketing Director',
        text: newItem.testimonial.text
      } : undefined
    };

    onAddPortfolioItem(portfolioObj);
    setIsAdding(false);
    setNewItem({
      title: '', description: '', mediaType: 'video', mediaUrl: '', tags: [], brandPartner: '',
      testimonial: { author: '', role: '', text: '' }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header & Verified Telemetry Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Verified Portfolio & Showcase</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            {creatorProfile?.creatorName || 'Alex Rivers'} • Case Studies
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Published campaigns automatically synchronized with verified audience delivery statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isPreviewMode 
                ? 'bg-teal-700 text-white shadow-md' 
                : 'bg-white border border-zinc-200/90 text-zinc-700 hover:text-zinc-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? 'Exit Live Preview' : 'Brand Preview Mode'}</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="teal-pill-button px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Case Study</span>
          </button>
        </div>
      </div>

      {/* Verified Telemetry Strip */}
      <div className="rounded-[24px] glass-panel p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Verified Reach</span>
            <span className="text-xl font-extrabold text-zinc-900 font-display">126.4K</span>
            <span className="text-[10px] text-emerald-700 font-bold block">↑ 15% WoW</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Avg Video Views</span>
            <span className="text-xl font-extrabold text-zinc-900 font-display">24.7K</span>
            <span className="text-[10px] text-teal-700 font-bold block">94% Retention</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Engagement Rate</span>
            <span className="text-xl font-extrabold text-zinc-900 font-display">6.24%</span>
            <span className="text-[10px] text-purple-700 font-bold block">Top 5% Benchmark</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Tier-1 Audience</span>
            <span className="text-xl font-extrabold text-zinc-900 font-display">88.2%</span>
            <span className="text-[10px] text-zinc-500 font-medium block">US, UK, CA, EU</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Trust Score</span>
            <span className="text-xl font-extrabold text-teal-700 font-display">98 / 100</span>
            <span className="text-[10px] text-emerald-700 font-bold block">100% On-Time</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Campaigns Closed</span>
            <span className="text-xl font-extrabold text-zinc-900 font-display">28</span>
            <span className="text-[10px] text-zinc-500 font-medium block">0 Disputes</span>
          </div>
        </div>
      </div>

      {/* Case Studies Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {defaultItems.map((item) => (
          <div 
            key={item.id}
            className="rounded-[26px] glass-card overflow-hidden flex flex-col justify-between group hover:border-teal-400/80 transition-all"
          >
            <div>
              {/* Media Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                <img 
                  src={item.mediaUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {item.brandPartner}
                </div>
                {!isPreviewMode && (
                  <button
                    onClick={() => onDeletePortfolioItem(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-red-50 text-zinc-600 hover:text-red-600 backdrop-blur-md transition-colors"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <h3 className="text-base font-extrabold text-zinc-900 font-display leading-snug group-hover:text-teal-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags?.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Testimonial Quote if available */}
                {item.testimonial && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60 text-xs space-y-1.5">
                    <Quote className="w-3.5 h-3.5 text-teal-600" />
                    <p className="text-teal-950 text-[11px] italic leading-relaxed">
                      "{item.testimonial.text}"
                    </p>
                    <span className="text-[10px] font-bold text-teal-800 block">
                      — {item.testimonial.author}, {item.testimonial.role}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Verified Campaign Asset</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Add Case Study Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[28px] glass-panel p-8 bg-white space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 font-display">Add Portfolio Case Study</h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Nike Air Max Summer Drop"
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl font-medium outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Brand Partner</label>
                <input
                  type="text"
                  required
                  value={newItem.brandPartner}
                  onChange={(e) => setNewItem({ ...newItem, brandPartner: e.target.value })}
                  placeholder="e.g. Nike, Gymshark, Notion"
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl font-medium outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Campaign Overview</label>
                <textarea
                  rows={3}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Highlight deliverables, reach metrics, and creative execution..."
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl font-medium outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={newItem.mediaUrl}
                  onChange={(e) => setNewItem({ ...newItem, mediaUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl font-medium outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="teal-pill-button px-6 py-2 text-xs font-bold"
                >
                  Publish to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
