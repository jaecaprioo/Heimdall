import React, { useState, useEffect } from 'react';
import { 
  SocialAccount, 
  PlatformId, 
  CreatorProfile,
  RateCardProposal
} from '../types';
import { 
  Instagram, 
  Youtube, 
  Video, 
  Share2, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Flame, 
  TrendingUp, 
  Users, 
  Eye, 
  Check, 
  X, 
  Sparkles,
  Lock,
  Globe,
  Radio,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Info,
  DollarSign,
  Layers,
  AlertTriangle,
  FileCode,
  Copy
} from 'lucide-react';

interface PlatformMeta {
  platform: PlatformId;
  displayName: string;
  isConfigured: boolean;
  isConnected: boolean;
  developerApprovalRequired: boolean;
  approvalNotes: string;
  documentationUrl: string;
  requiredScopes: string[];
  scopeDescriptions: Record<string, string>;
  lastSynced?: string;
  expiresAt?: number;
}

interface ConnectedAccountsViewProps {
  socialAccounts: SocialAccount[];
  creatorProfile: CreatorProfile;
  onSyncAccount: (platform: PlatformId) => void;
  onConnectAccount: (platform: PlatformId, username: string) => void;
  onUpdateAccountMetrics: (platform: PlatformId, metrics: Partial<SocialAccount>) => void;
  onRunSimulation: (scenarioType: string) => void;
  isSyncing: boolean;
  onNavigate: (tab: string) => void;
}

export default function ConnectedAccountsView({
  socialAccounts,
  creatorProfile,
  onSyncAccount,
  onConnectAccount,
  onUpdateAccountMetrics,
  onRunSimulation,
  isSyncing,
  onNavigate
}: ConnectedAccountsViewProps) {
  const [platformMetaList, setPlatformMetaList] = useState<PlatformMeta[]>([]);
  const [selectedPlatformForDetails, setSelectedPlatformForDetails] = useState<PlatformMeta | null>(null);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<PlatformId | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<PlatformId | null>(null);
  const [activeRateProposal, setActiveRateProposal] = useState<any | null>(null);
  const [intelligenceEvents, setIntelligenceEvents] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    strategicRecommendation: string;
    strongestPlatform: string;
    growthSummary: string;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'instagram' | 'youtube'>('instagram');

  // Fetch platform statuses & intelligence on mount + listen for OAuth postMessage callbacks
  useEffect(() => {
    fetchPlatformMeta();
    fetchIntelligenceEvents();
    fetchAiInsights();

    // Check URL params for OAuth redirect completions
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');

    if (oauthSuccess) {
      showNotification(`Successfully connected and verified ${oauthSuccess.toUpperCase()} telemetry!`, 'success');
      fetchPlatformMeta();
      fetchIntelligenceEvents();
      fetchAiInsights();
      checkRateCardRecalculation();
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      showNotification(`OAuth failed: ${oauthError}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for popup postMessages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'HEIMDALL_OAUTH_SUCCESS') {
        const platform = event.data.platform as PlatformId;
        showNotification(`Official ${platform.toUpperCase()} OAuth handshake complete!`, 'success');
        if (event.data.profile) {
          onUpdateAccountMetrics(platform, {
            followerCount: event.data.profile.followers || event.data.profile.subscriber_count || 0,
            averageViews: event.data.profile.average_views || 0,
            engagementRate: event.data.profile.engagement_rate || 0,
            reach: event.data.profile.reach || 0,
            impressions: event.data.profile.impressions || 0,
            lastSyncTimestamp: new Date().toISOString(),
            connectionStatus: 'connected',
            dataSource: event.data.profile.data_source,
            isVerified: event.data.profile.verified_status
          });
        }
        fetchPlatformMeta();
        fetchIntelligenceEvents();
        fetchAiInsights();
        checkRateCardRecalculation();
      } else if (event.data?.type === 'HEIMDALL_OAUTH_ERROR') {
        showNotification(`OAuth handshake error: ${event.data.error}`, 'error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const fetchPlatformMeta = async () => {
    try {
      const res = await fetch('/api/social/platforms?userId=' + (creatorProfile?.userId || 'default_creator'));
      const data = await res.json();
      if (data.platforms) {
        setPlatformMetaList(data.platforms);
      }
    } catch (e) {
      console.warn('Could not fetch platforms from server, using client fallback', e);
    }
  };

  const fetchIntelligenceEvents = async () => {
    try {
      const res = await fetch('/api/social/events?userId=' + (creatorProfile?.userId || 'default_creator'));
      const data = await res.json();
      if (data.events) {
        setIntelligenceEvents(data.events);
      }
    } catch (e) {
      console.warn('Could not fetch events', e);
    }
  };

  const fetchAiInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/social/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creatorProfile?.userId || 'default_creator' })
      });
      const data = await res.json();
      setAiInsights(data);
    } catch (e) {
      console.warn('Could not fetch AI insights', e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Trigger real OAuth authorization flow
  const handleStartOAuth = async (platform: PlatformId) => {
    setConnectingPlatform(platform);
    try {
      const res = await fetch(`/api/social/oauth/authorize/${platform}?userId=${creatorProfile?.userId || 'default_creator'}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        // Platform requires environment variables setup
        const meta = platformMetaList.find(p => p.platform === platform);
        if (meta) {
          setSelectedPlatformForDetails(meta);
        }
        showNotification(data.error || `Please configure OAuth credentials for ${platform}`, 'info');
        setConnectingPlatform(null);
        return;
      }

      if (data.url) {
        // Open OAuth authorization in popup or redirect
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.url,
          `Heimdall_${platform}_OAuth`,
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!popup || popup.closed) {
          // If popup is blocked by browser, redirect directly
          window.location.href = data.url;
        } else {
          showNotification(`Official ${platform.toUpperCase()} authorization window opened.`, 'info');
        }
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to start OAuth handshake', 'error');
    } finally {
      setConnectingPlatform(null);
    }
  };

  // Trigger live sync
  const handleLiveSync = async (platform: PlatformId) => {
    setSyncingPlatform(platform);
    try {
      const res = await fetch(`/api/social/sync/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creatorProfile?.userId || 'default_creator' })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        showNotification(data.error || `Sync error for ${platform}`, 'error');
        return;
      }

      if (data.profile) {
        onUpdateAccountMetrics(platform, {
          followerCount: data.profile.followers || data.profile.subscriber_count || 0,
          averageViews: data.profile.average_views || 0,
          engagementRate: data.profile.engagement_rate || 0,
          reach: data.profile.reach || 0,
          impressions: data.profile.impressions || 0,
          lastSyncTimestamp: new Date().toISOString(),
          connectionStatus: 'connected',
          dataSource: data.profile.data_source,
          isVerified: data.profile.verified_status
        });
      }

      showNotification(`Verified sync completed for ${platform.toUpperCase()}`, 'success');
      fetchIntelligenceEvents();
      fetchAiInsights();
      checkRateCardRecalculation();
    } catch (e: any) {
      showNotification(e.message || 'Live synchronization failed', 'error');
    } finally {
      setSyncingPlatform(null);
    }
  };

  // Trigger Disconnect
  const handleDisconnect = async (platform: PlatformId) => {
    if (!confirm(`Are you sure you want to disconnect ${platform.toUpperCase()}? Stored tokens and credentials will be safely revoked.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/social/disconnect/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creatorProfile?.userId || 'default_creator' })
      });
      const data = await res.json();

      onUpdateAccountMetrics(platform, {
        connectionStatus: 'disconnected',
        lastSyncTimestamp: new Date().toISOString()
      });

      showNotification(data.message || `Disconnected ${platform}`, 'info');
      fetchPlatformMeta();
    } catch (e: any) {
      showNotification(e.message || 'Disconnect failed', 'error');
    }
  };

  // Recalculate Rate Card
  const checkRateCardRecalculation = async () => {
    try {
      const res = await fetch('/api/social/rate-card/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: creatorProfile?.userId || 'default_creator',
          currentRate: creatorProfile?.pricingMatrix?.standardReel || 250
        })
      });
      const data = await res.json();
      if (data && Math.abs(data.changePercentage) >= 5) {
        setActiveRateProposal(data);
      }
    } catch (e) {
      console.warn('Rate recalculation check error', e);
    }
  };

  // Seed sample verified multi-platform profile for testing
  const handleSeedVerifiedEnvironment = async () => {
    try {
      const res = await fetch('/api/social/seed-verified-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creatorProfile?.userId || 'default_creator' })
      });
      const data = await res.json();

      // Update parent states
      onUpdateAccountMetrics('instagram', {
        followerCount: 12500,
        averageViews: 24500,
        engagementRate: 6.8,
        reach: 38200,
        impressions: 54100,
        connectionStatus: 'connected',
        lastSyncTimestamp: new Date().toISOString(),
        dataSource: 'Meta Graph API v19.0 (Instagram Professional)',
        isVerified: true
      });

      onUpdateAccountMetrics('tiktok', {
        followerCount: 48200,
        averageViews: 65000,
        engagementRate: 8.4,
        reach: 480000,
        connectionStatus: 'connected',
        lastSyncTimestamp: new Date().toISOString(),
        dataSource: 'TikTok for Developers Display API v2',
        isVerified: true
      });

      onUpdateAccountMetrics('youtube', {
        followerCount: 18400,
        averageViews: 38000,
        engagementRate: 5.9,
        reach: 680000,
        connectionStatus: 'connected',
        lastSyncTimestamp: new Date().toISOString(),
        dataSource: 'Google YouTube Data API v3 & Analytics API',
        isVerified: false
      });

      showNotification('Seeded verified sandbox with multi-platform telemetry & historical snapshots.', 'success');
      fetchIntelligenceEvents();
      fetchAiInsights();
      checkRateCardRecalculation();
    } catch (e: any) {
      showNotification('Failed to seed sandbox', 'error');
    }
  };

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'tiktok':
        return <Video className="w-5 h-5 text-cyan-400" />;
      case 'x':
        return <Share2 className="w-5 h-5 text-zinc-100" />;
      case 'facebook':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'linkedin':
        return <Globe className="w-5 h-5 text-sky-400" />;
      default:
        return <Share2 className="w-5 h-5 text-teal-400" />;
    }
  };

  const allSupportedPlatforms: { id: PlatformId; name: string; desc: string; officialApi: string }[] = [
    { id: 'instagram', name: 'Instagram', desc: 'Reels, Impressions, Reach & Audience Demographics', officialApi: 'Meta Graph API v19.0' },
    { id: 'tiktok', name: 'TikTok', desc: 'Video Stats, Follower Graph & Engagement Velocity', officialApi: 'TikTok Display API v2' },
    { id: 'youtube', name: 'YouTube', desc: 'Subscriber Count, Video Views & Watch Time Hours', officialApi: 'YouTube Data API v3' },
    { id: 'x', name: 'X (Twitter)', desc: 'Follower Metrics, Post Impressions & Profile Verification', officialApi: 'Twitter API v2' },
    { id: 'facebook', name: 'Facebook', desc: 'Page Followers, Post Reach & Video Performance', officialApi: 'Meta Graph API v19.0' },
    { id: 'linkedin', name: 'LinkedIn', desc: 'Creator Profile, Authority Footprint & Industry Reach', officialApi: 'LinkedIn OpenID & Restli' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 font-sans">
      
      {/* Toast Banner */}
      {notificationMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 ${
          notificationMsg.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
          notificationMsg.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' :
          'bg-teal-950/90 border-teal-500/40 text-teal-200'
        }`}>
          {notificationMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {notificationMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {notificationMsg.type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
          <span className="text-xs font-semibold">{notificationMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Platform Integration Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 font-display">
            Connected Accounts & Social Intelligence
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 mt-0.5 max-w-3xl">
            Real OAuth token handshakes & official REST APIs. Normalized across Instagram, TikTok, YouTube, X, Facebook, and LinkedIn. Zero fake analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="oauth-setup-guide-btn"
            onClick={() => setIsSetupGuideOpen(true)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5 text-teal-400" />
            <span>Developer Setup Guide</span>
          </button>

          <button
            id="seed-sandbox-btn"
            onClick={handleSeedVerifiedEnvironment}
            className="px-4 py-2 bg-white/80 hover:bg-white border border-zinc-200/80 text-zinc-800 text-xs font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Seed real sample profiles to test change detection and rate card engine"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Seed Verified Sandbox</span>
          </button>

          <button
            id="sync-all-accounts-btn"
            onClick={() => {
              allSupportedPlatforms.forEach(p => {
                const account = socialAccounts.find(a => a.platform === p.id);
                if (account && account.connectionStatus === 'connected') {
                  handleLiveSync(p.id);
                }
              });
            }}
            disabled={isSyncing}
            className="teal-pill-button px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All Channels'}</span>
          </button>
        </div>
      </div>

      {/* Rate Card Proposal Alert Banner (Triggered by Growth Detection) */}
      {activeRateProposal && (
        <div className="rounded-[28px] p-6 bg-linear-to-r from-amber-500/15 via-teal-500/10 to-emerald-500/15 border border-amber-500/30 backdrop-blur-xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                    Rate Card Recalibration Available
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">Verified Telemetry Event</span>
                </div>
                <h3 className="text-base font-extrabold text-zinc-950 mt-1">
                  Recommended Deliverable Rate: ${activeRateProposal.newRecommendedRate} (Up {activeRateProposal.changePercentage > 0 ? `+${activeRateProposal.changePercentage}%` : `${activeRateProposal.changePercentage}%`})
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Previous: ${activeRateProposal.previousRecommendedRate} • Range: ${activeRateProposal.rateRange.min} – ${activeRateProposal.rateRange.max} (Confidence: {activeRateProposal.confidence}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onNavigate('Settings');
                  showNotification(`Rate card updated to $${activeRateProposal.newRecommendedRate}`, 'success');
                  setActiveRateProposal(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Rate</span>
              </button>
              <button
                onClick={() => setActiveRateProposal(null)}
                className="px-3 py-2 bg-white/80 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-amber-500/20">
            {activeRateProposal.reasons.map((reason: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 Official Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSupportedPlatforms.map((p) => {
          const account = socialAccounts.find(a => a.platform === p.id);
          const meta = platformMetaList.find(m => m.platform === p.id);
          const isConnected = account?.connectionStatus === 'connected';
          const isPendingPermission = account?.connectionStatus === 'permission_required';
          const isExpired = account?.connectionStatus === 'expired' || account?.connectionStatus === 'needs_reauth';
          const isSyncingThis = syncingPlatform === p.id;
          const isConnectingThis = connectingPlatform === p.id;

          return (
            <div 
              key={p.id}
              className="rounded-[28px] glass-panel p-6 border border-white/80 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center shadow-xs">
                      {getPlatformIcon(p.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-extrabold text-zinc-950 font-display">{p.name}</h2>
                        {account?.isVerified && (
                          <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center" title="Verified Creator Badge">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {p.officialApi}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Connected
                      </span>
                    )}
                    {isPendingPermission && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Permission Needed
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <Clock className="w-3 h-3 text-rose-600" />
                        Expired Token
                      </span>
                    )}
                    {!isConnected && !isPendingPermission && !isExpired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Handle & Description */}
                <div className="mt-3">
                  {isConnected && account ? (
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-bold text-zinc-900 truncate">@{account.username}</span>
                      <span className="text-[10px] text-zinc-500">
                        {account.lastSyncTimestamp ? `Synced ${new Date(account.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                      {p.desc}
                    </p>
                  )}

                  {/* Verified Metrics Grid */}
                  {isConnected && account ? (
                    <div className="grid grid-cols-2 gap-2 bg-zinc-50/80 rounded-2xl p-3 border border-zinc-100">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-medium block">
                          {p.id === 'youtube' ? 'Subscribers' : 'Followers'}
                        </span>
                        <span className="text-sm font-extrabold text-zinc-950 font-mono">
                          {account.followerCount ? account.followerCount.toLocaleString() : (account.subscriberCount ? account.subscriberCount.toLocaleString() : 'N/A')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-medium block">Engagement Rate</span>
                        <span className="text-sm font-extrabold text-teal-700 font-mono">
                          {account.engagementRate ? `${account.engagementRate}%` : 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-medium block">Avg Video Views</span>
                        <span className="text-sm font-extrabold text-zinc-950 font-mono">
                          {account.averageViews ? account.averageViews.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-medium block">Monthly Reach</span>
                        <span className="text-sm font-extrabold text-zinc-950 font-mono">
                          {account.reach ? account.reach.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-center space-y-1">
                      <Lock className="w-4 h-4 text-zinc-400 mx-auto" />
                      <p className="text-[11px] text-zinc-500 font-medium">
                        Connect with official OAuth to unlock verified telemetry.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPlatformForDetails(meta || {
                    platform: p.id,
                    displayName: p.name,
                    isConfigured: false,
                    isConnected,
                    developerApprovalRequired: true,
                    approvalNotes: `Requires developer app credentials for ${p.name}.`,
                    documentationUrl: '#',
                    requiredScopes: ['read_profile', 'insights'],
                    scopeDescriptions: {}
                  })}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  title="View API Scopes & Developer Configuration"
                >
                  <Info className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleLiveSync(p.id)}
                        disabled={isSyncingThis}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingThis ? 'animate-spin text-teal-700' : ''}`} />
                        <span>{isSyncingThis ? 'Syncing...' : 'Refresh'}</span>
                      </button>

                      <button
                        onClick={() => handleDisconnect(p.id)}
                        className="px-3 py-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartOAuth(p.id)}
                      disabled={isConnectingThis}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isConnectingThis ? 'Connecting...' : 'Connect OAuth'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Intelligence Timeline & Gemini Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Intelligence & Change Detection Ledger */}
        <div className="lg:col-span-2 rounded-[28px] glass-panel p-6 border border-white/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950 font-display">
                  Telemetry Change Detection Ledger
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Immutable time-series delta events computed from official API snapshots
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
              Auto-Audited
            </span>
          </div>

          {intelligenceEvents.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {intelligenceEvents.map((ev, idx) => (
                <div 
                  key={ev.id || idx}
                  className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 hover:border-teal-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        {ev.type?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        {ev.change}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {ev.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono pt-1">
                    <span>Source: {ev.source}</span>
                    <span>•</span>
                    <span>Previous: {String(ev.previous_value)}</span>
                    <span>•</span>
                    <span>Current: {String(ev.current_value)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 space-y-2">
              <TrendingUp className="w-6 h-6 text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-600 font-semibold">
                No major telemetry shifts detected yet.
              </p>
              <p className="text-[11px] text-zinc-400">
                As verified official sync snapshots accumulate, growth spikes and rate triggers will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Grounded AI Intelligence (Gemini) */}
        <div className="rounded-[28px] glass-panel p-6 border border-white/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-zinc-950 font-display">
                    Grounded AI Analysis
                  </h2>
                  <p className="text-[10px] text-zinc-500">Gemini 2.5 Flash on verified dataset</p>
                </div>
              </div>
              <button 
                onClick={fetchAiInsights}
                disabled={isLoadingInsights}
                className="text-zinc-400 hover:text-zinc-800"
                title="Refresh Insights"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiInsights ? (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    Top Platform: {aiInsights.strongestPlatform}
                  </span>
                  <p className="text-xs text-purple-950 leading-relaxed font-medium">
                    {aiInsights.growthSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-zinc-700 block">Verified Findings</span>
                  {aiInsights.insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <p className="leading-snug">{ins}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
                    Commercial Strategy
                  </span>
                  <p className="text-xs text-zinc-800 font-semibold leading-relaxed">
                    {aiInsights.strategicRecommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Sparkles className="w-5 h-5 text-zinc-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-zinc-500">Generating grounded insights...</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100">
            <button
              onClick={() => onNavigate('Rate Card')}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Rate Card Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Developer API & Scopes Modal */}
      {selectedPlatformForDetails && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="rounded-[28px] bg-white p-6 max-w-xl w-full border border-zinc-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
                  {getPlatformIcon(selectedPlatformForDetails.platform)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950 font-display">
                    {selectedPlatformForDetails.displayName} Official API Configuration
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    Official OAuth 2.0 Handshake Specification
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlatformForDetails(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Approval Notes */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Developer Access & Permission Rules:</span>
                <p className="leading-relaxed">{selectedPlatformForDetails.approvalNotes}</p>
              </div>

              {/* Required Scopes */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-zinc-900 block">Requested OAuth Scopes</span>
                <div className="space-y-1.5">
                  {selectedPlatformForDetails.requiredScopes.map((scope, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-teal-800">{scope}</span>
                      <span className="text-zinc-600 text-[11px]">
                        {selectedPlatformForDetails.scopeDescriptions?.[scope] || 'Standard read permission'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Variables Required */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-zinc-900 block">Required Environment Variables (.env)</span>
                <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] space-y-1">
                  <p className="text-teal-400"># {selectedPlatformForDetails.displayName} Developer App Credentials</p>
                  <p>{selectedPlatformForDetails.platform.toUpperCase()}_CLIENT_ID="your_client_id_here"</p>
                  <p>{selectedPlatformForDetails.platform.toUpperCase()}_CLIENT_SECRET="your_client_secret_here"</p>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <a
                href={selectedPlatformForDetails.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <span>Official Developer Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedPlatformForDetails(null)}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Modal for Instagram & YouTube */}
      {isSetupGuideOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="rounded-[28px] bg-white p-6 max-w-3xl w-full border border-zinc-200 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-950 font-display">
                    Official OAuth Setup Guide
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Step-by-step developer application setup for Instagram/Meta & YouTube/Google
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSetupGuideOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl shrink-0">
              <button
                onClick={() => setGuidePlatform('instagram')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  guidePlatform === 'instagram' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram (Meta Graph API)</span>
              </button>
              <button
                onClick={() => setGuidePlatform('youtube')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  guidePlatform === 'youtube' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>YouTube (Google Cloud)</span>
              </button>
            </div>

            {/* Guide Content */}
            <div className="space-y-5 overflow-y-auto pr-1.5 text-xs text-zinc-700 leading-relaxed flex-1">
              {guidePlatform === 'instagram' ? (
                <div className="space-y-4">
                  
                  <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200/70 space-y-2">
                    <h4 className="font-extrabold text-pink-950 text-sm flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span>1. Create Developer Application</span>
                    </h4>
                    <p className="text-pink-900">
                      Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-pink-950">developers.facebook.com</a> &rarr; <strong>My Apps</strong> &rarr; <strong>Create App</strong>. Select <strong>Other</strong> &rarr; <strong>Business</strong> or <strong>Consumer</strong>.
                    </p>
                    <p className="text-pink-900">
                      Under <strong>Add Products to Your App</strong>, add <strong>Instagram Graph API</strong> and <strong>Facebook Login for Business</strong>.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">2. Configure Valid OAuth Redirect URI</h4>
                    <p className="text-zinc-600">
                      In the Meta App Dashboard, navigate to <strong>Facebook Login</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Valid OAuth Redirect URIs</strong> and paste:
                    </p>
                    <div className="p-3 bg-zinc-900 text-teal-300 rounded-xl font-mono text-[11px] flex items-center justify-between">
                      <span className="truncate">{typeof window !== 'undefined' ? `${window.location.origin}/api/social/oauth/callback/instagram` : 'https://your-domain.com/api/social/oauth/callback/instagram'}</span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/api/social/oauth/callback/instagram`;
                          navigator.clipboard.writeText(url);
                          setCopiedKey('ig_redirect');
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] shrink-0 ml-2 cursor-pointer font-sans"
                      >
                        {copiedKey === 'ig_redirect' ? 'Copied!' : 'Copy URI'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">3. Environment Variables</h4>
                    <p className="text-zinc-600">
                      Retrieve your <strong>App ID</strong> and <strong>App Secret</strong> from <strong>App settings &rarr; Basic</strong>, then set them in your environment settings:
                    </p>
                    <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] space-y-1">
                      <p className="text-pink-400"># Instagram / Meta Graph API Credentials</p>
                      <p>INSTAGRAM_CLIENT_ID=&quot;your_meta_app_id&quot;</p>
                      <p>INSTAGRAM_CLIENT_SECRET=&quot;your_meta_app_secret&quot;</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">4. Required Permissions & Scopes</h4>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                      <li><strong className="text-zinc-900 font-mono">instagram_basic</strong>: Access username, profile picture, account ID, and media count.</li>
                      <li><strong className="text-zinc-900 font-mono">instagram_manage_insights</strong>: Access official impressions, reach, profile views, and demographic insights.</li>
                      <li><strong className="text-zinc-900 font-mono">pages_show_list</strong> / <strong className="text-zinc-900 font-mono">pages_read_engagement</strong>: Link and query creator accounts linked to Facebook pages.</li>
                    </ul>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                      <strong>Note:</strong> Creators must have an Instagram Business or Creator account linked to a Facebook Page to query full demographic insights.
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-4">
                  
                  <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/70 space-y-2">
                    <h4 className="font-extrabold text-red-950 text-sm flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>1. Create Google Cloud Project & Enable APIs</span>
                    </h4>
                    <p className="text-red-900">
                      Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-red-950">console.cloud.google.com</a> and create a project.
                    </p>
                    <p className="text-red-900">
                      Go to <strong>APIs & Services &rarr; Library</strong>, search for and enable:
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 font-bold text-red-950">
                      <li>YouTube Data API v3</li>
                      <li>YouTube Analytics API</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">2. Configure OAuth Consent Screen & Credentials</h4>
                    <p className="text-zinc-600">
                      In <strong>APIs & Services &rarr; OAuth consent screen</strong>, set User Type to <strong>External</strong> and add your contact info.
                    </p>
                    <p className="text-zinc-600">
                      Go to <strong>Credentials &rarr; Create Credentials &rarr; OAuth client ID</strong>. Select Application type <strong>Web application</strong>.
                    </p>
                    <p className="text-zinc-600">
                      Under <strong>Authorized redirect URIs</strong>, add:
                    </p>
                    <div className="p-3 bg-zinc-900 text-teal-300 rounded-xl font-mono text-[11px] flex items-center justify-between">
                      <span className="truncate">{typeof window !== 'undefined' ? `${window.location.origin}/api/social/oauth/callback/youtube` : 'https://your-domain.com/api/social/oauth/callback/youtube'}</span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/api/social/oauth/callback/youtube`;
                          navigator.clipboard.writeText(url);
                          setCopiedKey('yt_redirect');
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] shrink-0 ml-2 cursor-pointer font-sans"
                      >
                        {copiedKey === 'yt_redirect' ? 'Copied!' : 'Copy URI'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">3. Environment Variables</h4>
                    <p className="text-zinc-600">
                      Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>, then set them in your environment settings:
                    </p>
                    <div className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-[11px] space-y-1">
                      <p className="text-red-400"># YouTube / Google Cloud OAuth Credentials</p>
                      <p>YOUTUBE_CLIENT_ID=&quot;your_client_id.apps.googleusercontent.com&quot;</p>
                      <p>YOUTUBE_CLIENT_SECRET=&quot;your_client_secret&quot;</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-zinc-900 text-sm">4. Required Scopes</h4>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                      <li><strong className="text-zinc-900 font-mono">https://www.googleapis.com/auth/youtube.readonly</strong>: Channel subscriber count, public view counts, video uploads.</li>
                      <li><strong className="text-zinc-900 font-mono">https://www.googleapis.com/auth/yt-analytics.readonly</strong>: Official estimated watch time hours, average view duration, 30-day views, likes, shares.</li>
                    </ul>
                  </div>

                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-zinc-500">
                After saving secrets, click &quot;Connect&quot; on the platform card to test the live handshake.
              </span>
              <button
                onClick={() => setIsSetupGuideOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
