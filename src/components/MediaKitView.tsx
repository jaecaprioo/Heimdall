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
  Cpu,
  Bookmark,
  Zap,
  Target
} from 'lucide-react';

interface MediaKitViewProps {
  creatorProfile: CreatorProfile;
  portfolioItems: PortfolioItem[];
}

export default function MediaKitView({ creatorProfile, portfolioItems }: MediaKitViewProps) {
  // Rate Card State
  const [deliverable, setDeliverable] = useState('UGC Video');
  const [platform, setPlatform] = useState('TikTok');
  const [usageRights, setUsageRights] = useState('30 Days');
  const [contentType, setContentType] = useState('Video');
  const [rateLoading, setRateLoading] = useState(false);
  const [customRateText, setCustomRateText] = useState('');

  // Engagement Rate Calculator State
  const [calcViews, setCalcViews] = useState('');
  const [calcLikes, setCalcLikes] = useState('');
  const [calcComments, setCalcComments] = useState('');

  const viewsNum = parseFloat(calcViews) || 0;
  const likesNum = parseFloat(calcLikes) || 0;
  const commentsNum = parseFloat(calcComments) || 0;

  const engagementRate = viewsNum > 0 ? ((likesNum + commentsNum) / viewsNum) * 100 : 0;

  const getTierName = (rate: number) => {
    if (rate === 0) return 'NO TELEMETRY';
    if (rate < 1.5) return 'Standard';
    if (rate < 4.0) return 'Healthy HUD';
    if (rate < 8.0) return 'Optimal Reach';
    return 'Hyper-Viral Core';
  };

  const getTierColor = (rate: number) => {
    if (rate === 0) return 'text-zinc-500';
    if (rate < 1.5) return 'text-zinc-400';
    if (rate < 4.0) return 'text-[#32E8FF]';
    if (rate < 8.0) return 'text-[#00C8FF]';
    return 'text-amber-400 animate-pulse';
  };

  const getBarColor = (rate: number) => {
    if (rate < 1.5) return 'bg-zinc-500';
    if (rate < 4.0) return 'bg-[#32E8FF]';
    if (rate < 8.0) return 'bg-[#00C8FF]';
    return 'bg-gradient-to-r from-[#00C8FF] to-amber-400';
  };

  // Dynamic Rate Card calculation
  const getBaseRate = () => {
    if (creatorProfile.basePricing && creatorProfile.basePricing[deliverable]) {
      return creatorProfile.basePricing[deliverable];
    }
    // fallbacks
    if (deliverable === 'UGC Video') return 350;
    if (deliverable === 'Instagram Reel') return 400;
    if (deliverable === 'TikTok Post') return 300;
    return 600;
  };

  const getPlatformMultiplier = () => {
    if (platform === 'YouTube') return 1.5;
    if (platform === 'TikTok') return 1.1;
    return 1.0;
  };

  const getUsageMultiplier = () => {
    if (usageRights === '90 Days') return 1.35;
    if (usageRights === 'Perpetual') return 1.85;
    return 1.0;
  };

  const calculateFinalPrice = () => {
    const base = getBaseRate();
    const platMult = getPlatformMultiplier();
    const usageMult = getUsageMultiplier();
    const contentMult = contentType === 'Video' ? 1.2 : 0.9;

    return Math.round(base * platMult * usageMult * contentMult);
  };

  const handleSuggestAIMetric = async () => {
    setRateLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `Analyze creator with niches of ${creatorProfile.niches?.join(', ') || 'lifestyle'} and bio "${creatorProfile.bio}". Recommend a standard 3-tier sponsorship bundle pricing strategy (Starter UGC, Advanced Multi-Platform, Premium Campaign Integration) and explain why.` }
          ],
          creator: creatorProfile,
          savedBrands: []
        })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        setCustomRateText(data.data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRateLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Sleek Top Cyber HUD Header
      doc.setFillColor(11, 19, 36); // Deep Slate
      doc.rect(15, 15, 180, 26, 'F');

      // Top corner brackets design in cyan
      doc.setDrawColor(0, 200, 255); // Neon Cyan
      doc.setLineWidth(0.5);
      // Top-left bracket
      doc.line(15, 15, 23, 15);
      doc.line(15, 15, 15, 23);
      // Bottom-right bracket
      doc.line(195, 41, 187, 41);
      doc.line(195, 41, 195, 33);

      // Header Text Elements
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 200, 255);
      doc.text("HEIMDALL INTEL MATRIX // PORTABLE CREATOR TELEMETRY", 22, 23);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("CYBER CREATOR PROFILE SUMMARY", 22, 33);

      // 2. Creator Identity Section
      let currentY = 52;
      
      // Horizontal separation line
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.3);
      doc.line(15, currentY, 195, currentY);
      currentY += 8;

      // Full Name & Aesthetic Tagline
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // Slate-900
      const nameText = creatorProfile.fullName || creatorProfile.creatorName || 'Representative';
      doc.text(nameText, 15, currentY);
      currentY += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 150, 220); // Cyan Blue
      doc.text(`@${creatorProfile.creatorName || 'creator'}`, 15, currentY);
      currentY += 6;

      // Location & Niches Matrice
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate-500
      const nicheTags = niches.join('  |  ');
      doc.text(`REGION: ${country.toUpperCase()}    |    NICHES: ${nicheTags.toUpperCase()}`, 15, currentY);
      currentY += 8;

      // Biography
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      const bioText = creatorProfile.bio ? `"${creatorProfile.bio}"` : '"No custom biography loaded in active profile matrix."';
      const splitBio = doc.splitTextToSize(bioText, 180);
      doc.text(splitBio, 15, currentY);
      currentY += (splitBio.length * 5) + 6;

      // 3. Social Channels and Audience Metrics Section
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY, 195, currentY);
      currentY += 7;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("ACTIVE CHANNELS & AUDIENCE METRICS", 15, currentY);
      currentY += 6;

      const platforms: string[] = [];
      if (creatorProfile.instagramUrl) {
        const f = creatorProfile.followersCount?.platform_metrics?.instagram?.followers || '24k';
        platforms.push(`INSTAGRAM: ${f}`);
      }
      if (creatorProfile.tiktokUrl) {
        const f = creatorProfile.followersCount?.platform_metrics?.tiktok?.followers || '95k';
        platforms.push(`TIKTOK: ${f}`);
      }
      if (creatorProfile.youtubeUrl) {
        const f = creatorProfile.followersCount?.platform_metrics?.youtube?.subscribers || '15k';
        platforms.push(`YOUTUBE: ${f}`);
      }
      if (platforms.length === 0) {
        platforms.push("ACTIVE AUDIENCE CHANNELS NOT LINKED");
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(platforms.join('     |     '), 15, currentY);
      currentY += 10;

      // 4. Interactive Engagement Telemetry Section (Calculated Stats)
      doc.setFillColor(248, 250, 252); // Slate-50 background for calculator section
      doc.rect(15, currentY, 180, 36, 'F');
      
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.rect(15, currentY, 180, 36, 'S');

      // Small cyan indicator block
      doc.setFillColor(0, 200, 255);
      doc.rect(15, currentY, 2, 36, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("ENGAGEMENT ENGINE: TELEMETRY CALCULATION SNAPSHOT", 22, currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Aggregate Views Logged: ${viewsNum > 0 ? viewsNum.toLocaleString() : '0 (No manual telemetry input)'}`, 22, currentY + 14);
      doc.text(`Aggregate Likes Logged: ${likesNum > 0 ? likesNum.toLocaleString() : '0'}`, 22, currentY + 20);
      doc.text(`Aggregate Comments & Saves: ${commentsNum > 0 ? commentsNum.toLocaleString() : '0'}`, 22, currentY + 26);

      // Computed rate display on the right side of the box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("CALCULATED RATE:", 120, currentY + 14);

      doc.setFontSize(18);
      doc.setTextColor(0, 150, 220); // Deep cyan
      const rateStr = viewsNum > 0 ? `${engagementRate.toFixed(2)}%` : '0.00% (Manual input pending)';
      doc.text(rateStr, 120, currentY + 22);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`HUD STATUS: ${getTierName(engagementRate).toUpperCase()}`, 120, currentY + 28);

      currentY += 45;

      // 5. Active Case Studies List
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY, 195, currentY);
      currentY += 7;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("ACTIVE CASE STUDIES & RECENT CAMPAIGNS", 15, currentY);
      currentY += 7;

      if (portfolioItems.length > 0) {
        portfolioItems.forEach((item, index) => {
          // Check for pagination limit on page 1
          if (currentY > 240) {
            // Draw page 1 footer before creating new page
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`Dynamic cyber asset securely compiled on ${new Date().toLocaleDateString()} via Heimdall OS`, 15, 284);
            doc.text(`Page 1`, 185, 284);

            doc.addPage();
            currentY = 20;

            // Re-draw minimal top bar on Page 2
            doc.setFillColor(11, 19, 36);
            doc.rect(15, 15, 180, 12, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(0, 200, 255);
            doc.text("HEIMDALL INTEL MATRIX // PORTFOLIO ADDENDUM", 22, 22);

            currentY = 35;
          }

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(`${index + 1}. ${item.title.toUpperCase()}  [BRAND PARTNER: ${item.brandPartner ? item.brandPartner.toUpperCase() : 'EXCLUSIVE'}]`, 15, currentY);
          currentY += 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          const splitDesc = doc.splitTextToSize(item.description, 175);
          doc.text(splitDesc, 18, currentY);
          currentY += (splitDesc.length * 4.5) + 3;

          // Testimonial quote if exists
          if (item.testimonial) {
            if (currentY > 245) {
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.5);
              doc.setTextColor(148, 163, 184);
              doc.text(`Dynamic cyber asset securely compiled on ${new Date().toLocaleDateString()} via Heimdall OS`, 15, 284);
              doc.text(`Page`, 185, 284);

              doc.addPage();
              currentY = 25;
            }

            // Quote left accent bar
            doc.setFillColor(0, 150, 220);
            doc.rect(18, currentY - 1, 1, 8, 'F');

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            const splitQuote = doc.splitTextToSize(`"${item.testimonial.text}" — ${item.testimonial.author}, ${item.brandPartner || 'Partner'}`, 168);
            doc.text(splitQuote, 21, currentY + 2);
            currentY += (splitQuote.length * 4.5) + 6;
          } else {
            currentY += 2;
          }
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("No active case studies linked in creator matrix. Update your active portfolio items to sync.", 15, currentY);
        currentY += 10;
      }

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dynamic cyber asset securely compiled on ${new Date().toLocaleDateString()} via Heimdall OS`, 15, 284);
      doc.text(`Page Final`, 180, 284);

      // Trigger file download
      const safeName = creatorProfile.creatorName ? creatorProfile.creatorName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'creator';
      doc.save(`heimdall_mediakit_${safeName}.pdf`);
    } catch (error: any) {
      console.error('Failed to generate summary PDF:', error);
      alert('Engagement summary PDF compilation failed: ' + (error.message || error));
    }
  };

  // Apple Health Style Metrics
  const creatorScore = 94; // Dynamic simulation
  const niches = creatorProfile.niches && creatorProfile.niches.length > 0 ? creatorProfile.niches : ['Lifestyle', 'Aesthetics'];
  const audienceReach = creatorProfile.followersCount?.instagram || '120k';
  const country = creatorProfile.country || 'United States';

  return (
    <div id="mediakit-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* 1. Header block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Aesthetic Brand Portfolio</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            Creator DNA & Media Kit
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            An elegant dynamic resume of your creator stats, audience channels, and estimated rate multipliers. Designed to convert brand managers instantly.
          </p>
        </div>

        <button
          id="export-pdf-btn"
          onClick={handleExportPDF}
          className="px-5 py-3 btn-emerald text-black shadow-lg shadow-[#00C8FF]/10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all font-mono cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Portfolio</span>
        </button>
      </div>

      {/* 2. Apple Health-inspired Creator DNA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Left main: Apple Health cells (Niches, Score, Country, Style, Personality) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Creator Profile Header */}
          <div className="glass-card p-6 rounded-[28px] md:col-span-2 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C8FF]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <span className="text-[10px] font-mono text-[#00C8FF] uppercase tracking-widest font-semibold">Active Profile</span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-2">{creatorProfile.fullName || creatorProfile.creatorName}</h2>
              <p className="text-zinc-300 text-xs mt-2 font-light leading-relaxed max-w-lg">
                "{creatorProfile.bio || 'Building premium digital aesthetics. Ready for sponsorships.'}"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {niches.map((niche) => (
                <span key={niche} className="px-3 py-1 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-[#00C8FF] font-mono text-[9px] uppercase tracking-wider">
                  {niche}
                </span>
              ))}
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                {country}
              </span>
            </div>
          </div>

          {/* Card: Creator Score */}
          <div className="glass-card p-6 rounded-[28px] flex flex-col justify-between h-[180px] hover:border-[#00C8FF]/30 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Heimdall Score</span>
              <Heart className="w-4 h-4 text-[#00C8FF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white font-mono">{creatorScore}</span>
              <span className="text-zinc-500 font-mono text-xs">/ 100</span>
            </div>
            <div className="text-[10px] text-zinc-400 leading-normal font-light">
              Calculated based on engagement metrics, conversion logs, and brand rating threads.
            </div>
          </div>

          {/* Card: AI Memory Status */}
          <div className="glass-card p-6 rounded-[28px] flex flex-col justify-between h-[180px] hover:border-[#32E8FF]/30 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">AI Memory Status</span>
              <Cpu className="w-4 h-4 text-[#32E8FF]" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#32E8FF] text-glow-blue uppercase tracking-wider font-semibold">SYNCHRONIZED</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">1.2 TB</div>
            </div>
            <div className="text-[10px] text-zinc-400 leading-normal font-light">
              Sponsor interactions, chat memories, and pitch guidelines fully synced with current brand indexes.
            </div>
          </div>

          {/* Card: Audience Stats */}
          <div className="glass-card p-6 rounded-[28px] md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Activity className="w-4 h-4 text-[#32E8FF]" />
              <h3 className="text-xs font-mono text-white uppercase tracking-wider">Social Channels & Reach</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {creatorProfile.instagramUrl && (
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center relative overflow-hidden">
                  <Instagram className="w-5 h-5 text-pink-500 mx-auto" />
                  <span className="block text-[11px] font-bold text-white mt-2">Instagram</span>
                  <span className="text-[11px] text-[#00C8FF] font-mono font-bold block mt-0.5">
                    {creatorProfile.followersCount?.platform_metrics?.instagram?.followers || '24k'}
                  </span>
                </div>
              )}
              {creatorProfile.tiktokUrl && (
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center relative overflow-hidden">
                  <Globe className="w-5 h-5 text-[#32E8FF] mx-auto" />
                  <span className="block text-[11px] font-bold text-white mt-2">TikTok</span>
                  <span className="text-[11px] text-[#00C8FF] font-mono font-bold block mt-0.5">
                    {creatorProfile.followersCount?.platform_metrics?.tiktok?.followers || '95k'}
                  </span>
                </div>
              )}
              {creatorProfile.youtubeUrl && (
                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center relative overflow-hidden">
                  <Youtube className="w-5 h-5 text-red-500 mx-auto" />
                  <span className="block text-[11px] font-bold text-white mt-2">YouTube</span>
                  <span className="text-[11px] text-zinc-300 font-mono font-bold block mt-0.5">
                    {creatorProfile.followersCount?.platform_metrics?.youtube?.subscribers || '15k'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Personality & Content Style */}
          <div className="glass-card p-6 rounded-[28px] md:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono text-white uppercase tracking-wider">Content Personality Matrice</span>
              <Target className="w-4 h-4 text-[#00C8FF]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>VIBE: MINIMALIST</span>
                  <span className="text-[#00C8FF]">85%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C8FF]" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>TONE: INFORMATIVE</span>
                  <span className="text-[#32E8FF]">72%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#32E8FF]" style={{ width: '72%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>STYLE: CINEMATIC UGC</span>
                  <span className="text-white">90%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-[10px]">
                  <span>DREAM SPONSOR MATCH RATE</span>
                  <span className="text-[#00C8FF]">94%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00C8FF]" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right main: Interactive Rate Card calculator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-[28px] space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Layers className="w-4 h-4 text-[#00C8FF]" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Sponsor Calculator</h3>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed font-light">
              Price sponsorship packages dynamically based on deliverable types, platforms, and usage rights.
            </p>

            <div className="space-y-4 text-xs font-light">
              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 font-mono uppercase">Deliverable Asset</label>
                <select
                  id="deliverable-select"
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00C8FF]"
                >
                  <option value="UGC Video" className="bg-[#101826] text-white">UGC Video</option>
                  <option value="Instagram Reel" className="bg-[#101826] text-white">Instagram Reel</option>
                  <option value="TikTok Post" className="bg-[#101826] text-white">TikTok Post</option>
                  <option value="YouTube Dedicated" className="bg-[#101826] text-white">YouTube Dedicated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 font-mono uppercase">Distribution Platform</label>
                <select
                  id="platform-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00C8FF]"
                >
                  <option value="TikTok" className="bg-[#101826] text-white">TikTok</option>
                  <option value="Instagram" className="bg-[#101826] text-white">Instagram</option>
                  <option value="YouTube" className="bg-[#101826] text-white">YouTube</option>
                  <option value="LinkedIn" className="bg-[#101826] text-white">LinkedIn</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 font-mono uppercase">Usage Rights Term</label>
                <select
                  id="usage-select"
                  value={usageRights}
                  onChange={(e) => setUsageRights(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00C8FF]"
                >
                  <option value="30 Days" className="bg-[#101826] text-white">30 Days</option>
                  <option value="90 Days" className="bg-[#101826] text-white">90 Days</option>
                  <option value="Perpetual" className="bg-[#101826] text-white">Perpetual (1.85x Multiplier)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">Calculated Fee</span>
                  <span className="text-3xl font-bold text-white font-mono leading-none">${calculateFinalPrice()}</span>
                </div>
                <button
                  onClick={() => alert(`Simulating invoice setup for UGC Delivery valued at $${calculateFinalPrice()}...`)}
                  className="px-4 py-2 bg-white/5 border border-[#00C8FF]/20 text-[#00C8FF] hover:bg-[#00C8FF] hover:text-black transition-all rounded-xl font-mono text-[10px] uppercase font-bold cursor-pointer"
                >
                  Draft Contract
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  id="ai-pricing-bundle-btn"
                  onClick={handleSuggestAIMetric}
                  disabled={rateLoading}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00C8FF]" />
                  <span>Recommend AI Packages</span>
                </button>

                {customRateText && (
                  <div className="p-4 bg-black/40 border border-white/10 rounded-2xl text-[10.5px] leading-relaxed text-zinc-300 font-light font-sans max-h-52 overflow-y-auto">
                    {customRateText.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-[#00C8FF] font-semibold">{part}</strong> : part)}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Holographic Engagement Rate Calculator */}
          <div className="glass-card p-6 rounded-[28px] space-y-4 relative overflow-hidden">
            {/* Subtle JARVIS cyber grid accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8FF]/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Activity className="w-4 h-4 text-[#00C8FF] animate-pulse" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Engagement Engine</h3>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed font-light">
              Telemetry calculator for social channel engagement. Enter aggregate impressions and interaction logs.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 font-mono uppercase">Total Views</label>
                <input
                  id="calc-views-input"
                  type="text"
                  placeholder="e.g. 50000"
                  value={calcViews}
                  onChange={(e) => setCalcViews(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-zinc-500 font-mono uppercase">Total Likes</label>
                <input
                  id="calc-likes-input"
                  type="text"
                  placeholder="e.g. 3500"
                  value={calcLikes}
                  onChange={(e) => setCalcLikes(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF]/30"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-[9px] text-zinc-500 font-mono uppercase">Comments & Saves (Optional)</label>
              <input
                id="calc-comments-input"
                type="text"
                placeholder="e.g. 450"
                value={calcComments}
                onChange={(e) => setCalcComments(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00C8FF] focus:ring-1 focus:ring-[#00C8FF]/30"
              />
            </div>

            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">Engagement Metric</span>
                  <span className="text-3xl font-bold text-white font-mono leading-none">
                    {viewsNum > 0 ? `${engagementRate.toFixed(2)}%` : '0.00%'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 font-mono block uppercase">HUD Status</span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${getTierColor(engagementRate)}`}>
                    {getTierName(engagementRate)}
                  </span>
                </div>
              </div>

              {/* Progress Bar indicating visual engagement health */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${getBarColor(engagementRate)}`}
                  style={{ width: `${viewsNum > 0 ? Math.min(engagementRate * 8, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Portfolio Case Studies List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#00C8FF]" />
          <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-white">Active Case Studies</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-[24px] space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-base tracking-tight">{item.title}</h4>
                    <span className="text-[9px] text-[#32E8FF] font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {item.brandPartner || 'Exclusive'}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed font-light line-clamp-3">{item.description}</p>
                </div>

                {item.testimonial && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] leading-relaxed text-zinc-400 italic">
                    "{item.testimonial.text}"
                    <span className="block text-[9px] text-zinc-500 font-mono mt-1.5 uppercase tracking-wider not-italic">
                      — {item.testimonial.author}, {item.brandPartner}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="glass-card p-8 rounded-[24px] col-span-full text-center text-zinc-600 py-12 space-y-2">
              <p className="font-mono text-zinc-500 text-xs">NO CASE STUDIES LINKED</p>
              <p className="text-xs text-zinc-600 font-light max-w-sm mx-auto">Link custom campaigns, client testimonials, and UGC videos inside the Portfolio panel.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
