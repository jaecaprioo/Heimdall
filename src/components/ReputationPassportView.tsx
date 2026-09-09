import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  Star, 
  AlertCircle, 
  Award, 
  DollarSign, 
  TrendingUp, 
  FileCheck,
  Building,
  User,
  Sparkles,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { CreatorProfile, BrandProfile } from '../types';

interface ReputationPassportViewProps {
  creatorProfile?: CreatorProfile | null;
  brandProfile?: BrandProfile | null;
  isBrandMode: boolean;
}

export default function ReputationPassportView({
  creatorProfile,
  brandProfile,
  isBrandMode
}: ReputationPassportViewProps) {
  const [activeTab, setActiveTab] = useState<'creator' | 'brand'>(isBrandMode ? 'brand' : 'creator');

  const trustMetrics = [
    { name: 'Delivery Reliability', score: 98, desc: '28 of 28 milestones delivered ahead of campaign deadline' },
    { name: 'Payment & Escrow Compliance', score: 100, desc: 'Zero escrow disputes, chargebacks, or breach claims' },
    { name: 'Contract Fulfillment', score: 100, desc: 'Full compliance with exclusivity and usage right guidelines' },
    { name: 'Historical Dispute Rate', score: 0, desc: '0.0% dispute rate across 28 multi-stage sponsorships', isZeroGood: true },
  ];

  const verifiedBadges = [
    { title: 'Official Meta Graph API Verified', desc: 'Direct live synchronization with Instagram & Facebook APIs' },
    { title: 'Milestone Escrow Champion', desc: 'Over $48,000+ securely cleared through smart milestone escrow' },
    { title: 'Tier-1 Demographics Verified', desc: 'Audience verified 88.2% authentic US, UK & Canadian concentration' },
    { title: '100% On-Time Turnaround', desc: 'Average draft review delivery within 36 hours of contract lock' },
  ];

  const recentReviews = [
    {
      author: 'Marcus Vance',
      role: 'Senior Growth Director, Nike',
      company: 'Nike Running',
      rating: 5,
      date: 'May 2026',
      content: 'Alex delivered incredible engagement on our product drop, driving over 320K organic impressions and 18K link clicks. Absolute professional.'
    },
    {
      author: 'Elena Rostova',
      role: 'Head of Influencer Marketing',
      company: 'Gymshark',
      rating: 5,
      date: 'April 2026',
      content: 'Working with Alex is seamless. Clear communication, on-time milestone delivery, and top-tier production quality every time.'
    },
    {
      author: 'David K.',
      role: 'Product Marketing Lead',
      company: 'Notion',
      rating: 5,
      date: 'March 2026',
      content: 'Exceeded all viewer retention metrics. The contract was executed flawlessly with zero revision friction.'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verifiable Partnership Credit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 font-display">
            Heimdall Trust Passport
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Tamper-evident reputation telemetry based on verified milestones, contract compliance, and brand reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Tier-1 Elite Status (Top 1% Network)</span>
        </div>
      </div>

      {/* Signature Passport ID Card */}
      <div className="rounded-[32px] glass-panel p-8 md:p-10 space-y-8 relative overflow-hidden shadow-xl border border-white">
        
        {/* Top Profile Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-teal-900/20">
              {creatorProfile?.creatorName?.slice(0, 2).toUpperCase() || 'AR'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-zinc-900 font-display">
                  {creatorProfile?.creatorName || 'Alex Rivers'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                  ✓ Passport #HM-9821
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Verified Creator & Brand Partner • Active since 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Overall Trust Score</span>
              <div className="text-4xl font-extrabold text-teal-700 font-display">98<span className="text-xl text-zinc-400">/100</span></div>
            </div>
          </div>
        </div>

        {/* 4 Pillar Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustMetrics.map((tm, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-900">{tm.name}</span>
                <span className="text-lg font-extrabold text-teal-700 font-display">
                  {tm.isZeroGood ? '0.0%' : `${tm.score}%`}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">{tm.desc}</p>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full" 
                  style={{ width: `${tm.isZeroGood ? 100 : tm.score}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verified Security Badges */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-extrabold text-zinc-900 font-display">Cryptographically Verified Signals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {verifiedBadges.map((badge, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900">{badge.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Verified Brand Reviews */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <h3 className="text-sm font-extrabold text-zinc-900 font-display">Verified Brand Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReviews.map((rev, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/90 border border-zinc-200/70 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-zinc-900">{rev.company}</span>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 italic leading-relaxed">
                    "{rev.content}"
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span className="font-bold text-zinc-700">{rev.author}, {rev.role}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
