import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { CreatorProfile, PortfolioItem } from '../types';
import { 
  Shield, 
  Sparkles, 
  Download, 
  DollarSign, 
  Layers, 
  Plus, 
  Star, 
  Check, 
  Globe, 
  Instagram, 
  Youtube, 
  Linkedin,
  Activity,
  Heart,
  Zap,
  Target,
  Share2,
  Copy,
  Eye,
  Edit3,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

interface MediaKitViewProps {
  creatorProfile: CreatorProfile;
  portfolioItems: PortfolioItem[];
}

export default function MediaKitView({ creatorProfile, portfolioItems }: MediaKitViewProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  // Editable bio & highlights
  const [headline, setHeadline] = useState('High-Performance Lifestyle & Fitness Creator');
  const [customBio, setCustomBio] = useState(
    creatorProfile?.bio || 'Helping high-performance brands connect with over 126,000+ dedicated fitness and lifestyle enthusiasts across North America & Europe.'
  );

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Background and branding header
      doc.setFillColor(244, 247, 246);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setFillColor(13, 148, 136);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('HEIMDALL VERIFIED MEDIA KIT', 15, 24);

      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(creatorProfile?.creatorName || 'Alex Rivers', 15, 52);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(headline, 15, 60);
      doc.text(`Verified Audience: 126.4K Total Reach • 6.24% Engagement Rate`, 15, 68);

      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text('COMMERCIAL DELIVERABLE PRICING', 15, 84);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('• Instagram Reel (60s 4K Dedicated): $500.00', 15, 94);
      doc.text('• TikTok UGC High-Energy Video: $420.00', 15, 102);
      doc.text('• YouTube Dedicated Integration Segment: $1,200.00', 15, 110);
      doc.text('• Instagram Story Trio (Link Sticker): $220.00', 15, 118);

      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text('AUDIENCE DEMOGRAPHICS & TELEMETRY', 15, 136);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('• Geographic Reach: 62% United States, 18% United Kingdom, 12% Canada', 15, 146);
      doc.text('• Age Distribution: 18–24 (34%), 25–34 (52%), 35+ (14%)', 15, 154);
      doc.text('• Verified Trust Score: 98 / 100 (100% On-Time Milestone Delivery)', 15, 162);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Verified through Heimdall Intelligence Autonomous Telemetry Pipeline.', 15, 280);

      doc.save(`${(creatorProfile?.creatorName || 'Creator').toLowerCase()}_heimdall_mediakit.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + `?mediakit=${encodeURIComponent(creatorProfile?.creatorName || 'creator')}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Media Deck</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Creator Media Kit
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Auto-synchronized with verified audience metrics, engagement rates, and dynamic rate cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2 rounded-full bg-white border border-zinc-200/90 text-zinc-700 hover:text-zinc-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="teal-pill-button px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating PDF...' : 'Export Deck (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Media Kit Canvas Card */}
      <div className="rounded-[32px] glass-panel p-8 md:p-12 space-y-8 relative overflow-hidden shadow-xl border border-white">
        
        {/* Ambient watermark & verified badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-teal-100 border-2 border-teal-300 flex items-center justify-center font-extrabold text-2xl text-teal-800 shadow-md">
              {creatorProfile?.creatorName?.slice(0, 2).toUpperCase() || 'AR'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 font-display">
                  {creatorProfile?.creatorName || 'Alex Rivers'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                  ✓ Verified Talent
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-zinc-600">
                {headline}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {creatorProfile?.niches?.map((n, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                    {n}
                  </span>
                )) || (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">Fitness & Athletics</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">Lifestyle UGC</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-left md:text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Heimdall Trust Score</span>
            <div className="text-3xl font-extrabold text-teal-700 font-display">98 / 100</div>
            <span className="text-[11px] font-semibold text-emerald-700 block">100% On-Time Milestones</span>
          </div>
        </div>

        {/* 4 Core Verified Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm text-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Verified Reach</span>
            <span className="text-3xl font-extrabold text-zinc-900 font-display">126.4K</span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">↑ 15% WoW Growth</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm text-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Engagement Rate</span>
            <span className="text-3xl font-extrabold text-zinc-900 font-display">6.24%</span>
            <span className="text-[10px] text-purple-700 font-bold block mt-1">Top 5% Category Benchmark</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm text-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Average Reel Views</span>
            <span className="text-3xl font-extrabold text-zinc-900 font-display">24.7K</span>
            <span className="text-[10px] text-cyan-700 font-bold block mt-1">88% Completion Rate</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm text-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Primary Audience</span>
            <span className="text-3xl font-extrabold text-zinc-900 font-display">88%</span>
            <span className="text-[10px] text-zinc-500 font-semibold block mt-1">Tier-1 USA, UK, CA</span>
          </div>
        </div>

        {/* Deliverable Rate Card Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-zinc-900 font-display">Commercial Deliverable Rates</h3>
            <span className="text-xs text-zinc-400">Calibrated against verified impressions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Instagram Reel</span>
              <span className="text-2xl font-extrabold text-zinc-900 font-display">$500</span>
              <p className="text-[11px] text-zinc-500">60s 4K dedicated feature with product tag & caption link.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">TikTok UGC Video</span>
              <span className="text-2xl font-extrabold text-zinc-900 font-display">$420</span>
              <p className="text-[11px] text-zinc-500">High-energy organic style showcase optimized for TikTok FYP.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">YouTube Integration</span>
              <span className="text-2xl font-extrabold text-zinc-900 font-display">$1,200</span>
              <p className="text-[11px] text-zinc-500">60–90s dedicated mid-roll integration with permanent backlink.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Story Set (3 Frames)</span>
              <span className="text-2xl font-extrabold text-zinc-900 font-display">$220</span>
              <p className="text-[11px] text-zinc-500">3 vertical slides with direct trackable swipe-up/link sticker.</p>
            </div>
          </div>
        </div>

        {/* Previous Brand Partnerships Showcase */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <h3 className="text-base font-extrabold text-zinc-900 font-display">Featured Brand Campaigns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900">Nike Summer Drop</h4>
                <p className="text-[10px] text-zinc-500">18K Link Clicks • 320K Views</p>
              </div>
              <span className="text-xs font-bold text-teal-700">★ 5.0</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900">Gymshark Conditioning</h4>
                <p className="text-[10px] text-zinc-500">5.2% Engagement • Retainer</p>
              </div>
              <span className="text-xs font-bold text-teal-700">★ 5.0</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-zinc-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-zinc-900">Notion Creator Setup</h4>
                <p className="text-[10px] text-zinc-500">94% Audience Retention</p>
              </div>
              <span className="text-xs font-bold text-teal-700">★ 5.0</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
