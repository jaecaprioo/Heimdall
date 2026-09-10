import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Analytics } from '@vercel/analytics/react';

// Subcomponents
import LoginView from './components/LoginView';
import OnboardingView from './components/OnboardingView';
import DashboardView from './components/DashboardView';
import DiscoveryView from './components/DiscoveryView';
import CampaignView from './components/CampaignView';
import CrmView from './components/CrmView';
import PortfolioView from './components/PortfolioView';
import MediaKitView from './components/MediaKitView';
import SettingsView from './components/SettingsView';
import AiAssistantView from './components/AiAssistantView';
import CreatorIntelligenceView from './components/CreatorIntelligenceView';
import ConnectedAccountsView from './components/ConnectedAccountsView';
import ConfettiCanvas from './components/ConfettiCanvas';
import DealRoomView from './components/DealRoomView';
import ContractXRayView from './components/ContractXRayView';
import OpportunityIntelligenceView from './components/OpportunityIntelligenceView';
import ReputationPassportView from './components/ReputationPassportView';
import BrandDiscoveryCreatorsView from './components/BrandDiscoveryCreatorsView';
import CampaignAutopsyView from './components/CampaignAutopsyView';
import { LandingPageView } from './components/LandingPageView';
import ThemeSwitcher from './components/ThemeSwitcher';

// Icons & Types
import { 
  Shield, 
  LayoutDashboard, 
  Compass, 
  Clapperboard, 
  TrendingUp, 
  FolderGit2, 
  FileText, 
  Settings, 
  LogOut, 
  Sparkles, 
  Bell, 
  Menu, 
  X,
  Plus,
  Cpu,
  WifiOff,
  Search,
  MessageSquare,
  Check,
  CornerDownLeft,
  Send,
  Flame,
  Zap,
  Share2,
  DollarSign,
  History,
  Scale,
  Briefcase,
  Layers,
  Award,
  Building,
  User,
  BarChart3,
  Bookmark
} from 'lucide-react';
import { 
  CreatorProfile, 
  SavedBrand, 
  CRMOpportunity, 
  CampaignContent, 
  PortfolioItem, 
  Notification, 
  Brand,
  CRMStage,
  SocialAccount,
  SocialMetricsSnapshot,
  RateCardServiceItem,
  RateCardProposal,
  AuditLogEntry,
  RateCardSettings,
  PlatformId,
  DealRoom,
  DealStage,
  DealDeliverable,
  BrandProfile,
  CreatorMarketplaceItem,
  ThemeId
} from './types';


export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('heimdall_active_tab') || 'Dashboard');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('heimdall_theme') as ThemeId) || 'pearl-mist';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('heimdall_theme', currentTheme);
  }, [currentTheme]);

  // Core Postgres States
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // =========================================================
  // AUTONOMOUS CREATOR INTELLIGENCE & RATE CARD STATES
  // =========================================================
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    {
      id: 'soc_ig_1',
      userId: 'default_user',
      platform: 'instagram',
      accountId: 'ig_alexrivers_fit',
      username: 'alexrivers_fit',
      profileUrl: 'https://instagram.com/alexrivers_fit',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      followerCount: 5000,
      engagementRate: 4.2,
      averageViews: 8000,
      reach: 18000,
      impressions: 24000,
      averageLikes: 320,
      averageComments: 24,
      averageShares: 18,
      category: 'Fitness & Aesthetics',
      connectionStatus: 'connected',
      authType: 'oauth',
      lastSyncTimestamp: new Date().toISOString()
    },
    {
      id: 'soc_yt_1',
      userId: 'default_user',
      platform: 'youtube',
      accountId: 'yt_alexriverstech',
      username: 'AlexRiversTech',
      profileUrl: 'https://youtube.com/@AlexRiversTech',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      followerCount: 12500,
      engagementRate: 5.8,
      averageViews: 15000,
      reach: 38000,
      impressions: 52000,
      averageLikes: 850,
      averageComments: 94,
      averageShares: 62,
      category: 'Tech & Setups',
      connectionStatus: 'connected',
      authType: 'oauth',
      lastSyncTimestamp: new Date().toISOString()
    }
  ]);

  const [snapshots, setSnapshots] = useState<SocialMetricsSnapshot[]>([
    {
      id: 'snap_base_1',
      userId: 'default_user',
      platform: 'instagram',
      followerCount: 5000,
      engagementRate: 4.2,
      averageViews: 8000,
      reach: 18000,
      impressions: 24000,
      changeClassification: 'NORMAL',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      dateLabel: '7 Days Ago (Baseline)',
      source: 'Instagram Official OAuth',
      notes: 'Initial verified baseline snapshot'
    },
    {
      id: 'snap_base_2',
      userId: 'default_user',
      platform: 'instagram',
      followerCount: 5200,
      engagementRate: 4.3,
      averageViews: 8200,
      reach: 19000,
      impressions: 25500,
      deltaFollowers: 200,
      deltaViews: 200,
      deltaEngagement: 0.1,
      changeClassification: 'NORMAL',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      dateLabel: '2 Days Ago',
      source: 'Instagram Official OAuth',
      notes: 'Steady natural accumulation'
    }
  ]);

  const [rateCards, setRateCards] = useState<RateCardServiceItem[]>([
    {
      id: 'rc_1',
      serviceKey: 'ig_reel',
      name: 'Instagram Reel Integration',
      deliverableType: 'Reel',
      platform: 'instagram',
      currentPrice: 250,
      previousPrice: 200,
      recommendedPrice: 250,
      priceChangePercentage: 25,
      confidenceScore: 94,
      pricingRationale: 'Calibrated for 5,000-8,000 average views in high-CPM fitness & lifestyle category.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc_2',
      serviceKey: 'ig_story_set',
      name: 'Instagram Story Set (3 Frames)',
      deliverableType: 'Story',
      platform: 'instagram',
      currentPrice: 150,
      previousPrice: 120,
      recommendedPrice: 150,
      priceChangePercentage: 25,
      confidenceScore: 92,
      pricingRationale: 'Anchored on 1,200-2,000 story views with direct swipe-up link conversion tracking.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc_3',
      serviceKey: 'yt_dedicated',
      name: 'YouTube Dedicated Sponsor Segment',
      deliverableType: 'Video',
      platform: 'youtube',
      currentPrice: 650,
      previousPrice: 500,
      recommendedPrice: 650,
      priceChangePercentage: 30,
      confidenceScore: 96,
      pricingRationale: 'Calculated using $43 CPM for high-intent tech and productivity viewers.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'rc_4',
      serviceKey: 'ugc_raw',
      name: 'Raw UGC Video + 30-Day Paid Ad Rights',
      deliverableType: 'UGC',
      platform: 'tiktok',
      currentPrice: 350,
      previousPrice: 300,
      recommendedPrice: 350,
      priceChangePercentage: 16.7,
      confidenceScore: 90,
      pricingRationale: 'Standard commercial deliverable with 30-day whitelisting and digital media license.',
      lastUpdated: new Date().toISOString(),
      status: 'active'
    }
  ]);

  const [activeProposal, setActiveProposal] = useState<RateCardProposal | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud_1',
      userId: 'default_user',
      eventType: 'account_connected',
      source: 'oauth',
      title: 'Instagram Account Authenticated',
      details: 'Connected @alexrivers_fit (5,000 followers, 4.2% engagement rate)',
      userAction: 'Auto-Applied',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'aud_2',
      userId: 'default_user',
      eventType: 'rate_recalculation',
      source: 'gemini_intelligence',
      title: 'Initial Commercial Rate Card Calibrated',
      details: 'Created 4 deliverable rates anchored on $35 CPM with 1.35x fitness multiplier',
      userAction: 'Auto-Applied',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ]);

  const [rateCardSettings, setRateCardSettings] = useState<RateCardSettings>({
    autoUpdateRateCard: false,
    autoUpdatePortfolio: true,
    autoUpdateMediaKit: true,
    changeDetectionSensitivity: 'NORMAL',
    minRateChangeThreshold: 5,
    enableAiExplanations: true
  });

  // Two-Sided Marketplace Mode: Creator Mode vs Brand Mode
  const [isBrandMode, setIsBrandMode] = useState<boolean>(() => localStorage.getItem('heimdall_brand_mode') === 'true');

  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    id: 'brand_gymshark',
    companyName: 'Gymshark',
    industry: 'Fitness & Apparel',
    website: 'https://gymshark.com',
    logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150',
    primaryNiche: 'Fitness & Athletics',
    typicalBudgetRange: '$1,000 - $20,000',
    brandReputationScore: 98,
    paymentReliability: 100,
    totalCampaignsRun: 42,
    activeCampaignsCount: 3
  });

  const [deals, setDeals] = useState<DealRoom[]>([
    {
      id: 'deal_gymshark_q2',
      dealTitle: 'Spring Apparel Drop & 4K Reel Launch',
      brandId: 'brand_gymshark',
      brandName: 'Gymshark',
      brandLogo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150',
      creatorId: 'usr_alex_rivers',
      creatorName: 'Alex Rivers',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      totalBudget: 1500,
      currentStage: 'Content',
      deliverables: [
        {
          id: 'del_1',
          platform: 'instagram',
          type: 'Reel',
          title: '4K Vertical Training Routine Reel',
          dueDate: '2026-06-01',
          status: 'in_production',
          price: 900,
          draftUrl: 'https://preview.heimdall.app/asset/draft-reel-01.mp4'
        },
        {
          id: 'del_2',
          platform: 'instagram',
          type: 'Story',
          title: '3x Story Swipe-Up Frames with Discount Sticker',
          dueDate: '2026-06-03',
          status: 'pending',
          price: 350
        },
        {
          id: 'del_3',
          platform: 'tiktok',
          type: 'Video',
          title: 'Raw Behind-the-Scenes Cut',
          dueDate: '2026-06-04',
          status: 'pending',
          price: 250
        }
      ],
      scopeCreepAlerts: [],
      contractSummary: {
        paymentTerms: '100% Funded in Heimdall Smart Escrow prior to shoot',
        usageRights: '30-Day Organic Digital Worldwide',
        whitelistingDuration: '30-Day Meta Partnership Ads',
        exclusivityTerms: '14-Day Direct Footwear Competitor Lock',
        ipOwnership: 'Creator Retains Master Copyright (Brand Licensed)',
        contractSigned: true
      },
      paymentStatus: 'in_escrow',
      messages: [
        {
          id: 'm1',
          senderId: 'brand_gymshark',
          senderName: 'Sarah Jenkins (Gymshark)',
          senderRole: 'brand',
          content: 'Hey Alex! Escrow is 100% funded and the brief is finalized. We are excited to see the first cut of the 4K Reel by June 1st.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'm2',
          senderId: 'usr_alex_rivers',
          senderName: 'Alex Rivers',
          senderRole: 'creator',
          content: 'Thanks Sarah! Filming tomorrow with the Sony FX3. Will have the draft preview uploaded for your review on Thursday.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ],
      campaignMilestones: [
        { title: 'Commercial Discovery & Match', date: 'May 12', status: 'completed' },
        { title: 'Contract Signed & Escrow Funded', date: 'May 15', status: 'completed' },
        { title: 'Content Production & Draft Cut', date: 'June 01', status: 'in_progress' },
        { title: 'Brand Review & Publishing Approval', date: 'June 04', status: 'upcoming' },
        { title: 'Live Verification & Escrow Release', date: 'June 06', status: 'upcoming' }
      ],
      finalAnalytics: {
        totalViews: 48200,
        totalLikes: 3450,
        totalComments: 420,
        roiScore: 4.1,
        completedAt: new Date().toISOString()
      },
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Deal Room Handlers
  const handleUpdateDealStage = (dealId: string, stage: DealStage) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return {
          ...deal,
          currentStage: stage,
          updatedAt: new Date().toISOString()
        };
      }
      return deal;
    }));
    showToastNotification('Deal Stage Updated', `Deal pipeline advanced to ${stage}.`, 'success');
  };

  const handleUpdateDeliverableStatus = (dealId: string, deliverableId: string, status: DealDeliverable['status']) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return {
          ...deal,
          deliverables: deal.deliverables.map(del => del.id === deliverableId ? { ...del, status } : del),
          updatedAt: new Date().toISOString()
        };
      }
      return deal;
    }));
    showToastNotification('Asset Status Updated', `Deliverable set to ${status.replace('_', ' ')}.`, 'info');
  };

  const handleSendDealMessage = (dealId: string, content: string, senderRole: 'creator' | 'brand' | 'system') => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const newMsg = {
          id: 'msg_' + Date.now(),
          senderId: senderRole === 'brand' ? deal.brandId : deal.creatorId,
          senderName: senderRole === 'system' ? 'Heimdall Sentinel' : senderRole === 'brand' ? deal.brandName : deal.creatorName,
          senderRole,
          content,
          timestamp: new Date().toISOString()
        };
        return {
          ...deal,
          messages: [...deal.messages, newMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return deal;
    }));
  };

  const handleResolveScopeCreep = (dealId: string, alertId: string, action: 'accept' | 'dismiss') => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const targetAlert = deal.scopeCreepAlerts.find(a => a.id === alertId);
        const updatedAlerts = deal.scopeCreepAlerts.map(a => a.id === alertId ? { ...a, status: (action === 'accept' ? 'accepted' : 'dismissed') as any } : a);
        let updatedBudget = deal.totalBudget;
        if (action === 'accept' && targetAlert) {
          updatedBudget += targetAlert.recommendedFee;
          showToastNotification('Scope Surcharge Applied', `+$${targetAlert.recommendedFee} added to contract escrow.`, 'success');
        }
        return {
          ...deal,
          totalBudget: updatedBudget,
          scopeCreepAlerts: updatedAlerts,
          updatedAt: new Date().toISOString()
        };
      }
      return deal;
    }));
  };

  const handleSelectCreatorForDeal = (creator: CreatorMarketplaceItem) => {
    const newDeal: DealRoom = {
      id: 'deal_' + Date.now(),
      dealTitle: `Partnership with ${creator.creatorName}`,
      brandId: brandProfile.id,
      brandName: brandProfile.companyName,
      brandLogo: brandProfile.logo,
      creatorId: creator.id,
      creatorName: creator.creatorName,
      creatorAvatar: creator.avatar,
      currentStage: 'Offer',
      totalBudget: creator.startingPrice || 800,
      deliverables: creator.services.map((s, idx) => ({
        id: 'del_' + idx,
        platform: creator.primaryPlatform,
        type: s.type,
        title: s.name,
        price: s.price,
        dueDate: '2026-06-15',
        status: 'pending'
      })),
      contractSummary: {
        paymentTerms: '100% in Heimdall Escrow prior to release',
        usageRights: '30-Day Organic Digital Worldwide',
        whitelistingDuration: 'Optional 30-Day Whitelisting',
        exclusivityTerms: '14-Day Category Lock',
        ipOwnership: 'Creator Retains Copyright (Brand Licensed)',
        contractSigned: false
      },
      paymentStatus: 'unfunded',
      scopeCreepAlerts: [],
      messages: [
        {
          id: 'm1',
          senderId: brandProfile.id,
          senderName: brandProfile.companyName,
          senderRole: 'brand',
          content: `Hi ${creator.creatorName}! We love your content and would love to partner on our upcoming campaign.`,
          timestamp: new Date().toISOString()
        }
      ],
      campaignMilestones: [
        { title: 'Discovery & Initial Offer', date: 'Today', status: 'completed' },
        { title: 'Contract & Escrow Funding', date: 'Next', status: 'in_progress' },
        { title: 'Content Production', date: 'Pending', status: 'upcoming' },
        { title: 'Brand Approval', date: 'Pending', status: 'upcoming' },
        { title: 'Publishing & Release', date: 'Pending', status: 'upcoming' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDeals(prev => [newDeal, ...prev]);
    setActiveTab('Deals');
    showToastNotification('Deal Room Initialized', `Created new collaborative Deal Room for ${creator.creatorName}.`, 'success');
  };


  // Menu toggles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Intent linking state
  const [selectedBrandForAction, setSelectedBrandForAction] = useState<Brand | null>(null);

  // Advanced OS Micro-States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<any[]>([
    { id: 'c1', role: 'assistant', text: 'Connecting... Heimdall Copilot Node online. Tell me what strategy or custom draft you need.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  // Undo Buffers
  const [deletedOpp, setDeletedOpp] = useState<CRMOpportunity | null>(null);
  const [deletedOppTimeout, setDeletedOppTimeout] = useState<any | null>(null);
  const [deletedPortItem, setDeletedPortItem] = useState<PortfolioItem | null>(null);
  const [deletedPortTimeout, setDeletedPortTimeout] = useState<any | null>(null);

  // Delight & Confetti State
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Core Toast Trigger Utility
  const showToastNotification = (title: string, message: string, type: 'success' | 'info' | 'alert' = 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // 1. Listen to Auth State & Protect Private Pages
  useEffect(() => {
    // Check local session first
    try {
      const cachedSessionRaw = localStorage.getItem('heimdall_local_session');
      if (cachedSessionRaw) {
        const cachedUser = JSON.parse(cachedSessionRaw);
        if (cachedUser?.id || cachedUser?.uid) {
          const uid = cachedUser.id || cachedUser.uid;
          setUser({ ...cachedUser, id: uid, uid });
          syncUserData(uid, cachedUser);
        }
      }
    } catch (e) {}

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        const cachedSessionRaw = localStorage.getItem('heimdall_local_session');
        if (!cachedSessionRaw) {
          setUser(null);
        }
        setAuthLoading(false);
        return;
      }

      const currentUser = session.user;
      const uid = currentUser.id;
      const userObj = {
        ...currentUser,
        uid,
        id: uid
      };
      setUser(userObj);
      try {
        localStorage.setItem('heimdall_local_session', JSON.stringify(userObj));
      } catch (e) {}
      syncUserData(uid, currentUser);
      setAuthLoading(false);
    }).catch(err => {
      console.error("Error checking session:", err);
      const cachedSessionRaw = localStorage.getItem('heimdall_local_session');
      if (!cachedSessionRaw) {
        setUser(null);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      if (currentUser && session) {
        const uid = currentUser.id;
        const userObj = {
          ...currentUser,
          uid,
          id: uid
        };
        setUser(userObj);
        try {
          localStorage.setItem('heimdall_local_session', JSON.stringify(userObj));
        } catch (e) {}
        await syncUserData(uid, currentUser);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('heimdall_local_session');
        setUser(null);
        setCreatorProfile(null);
        setSavedBrands([]);
        setOpportunities([]);
        setPortfolioItems([]);
        setNotifications([]);
        setRecommendations([]);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 1.1 Persist Active Tab to LocalStorage
  useEffect(() => {
    localStorage.setItem('heimdall_active_tab', activeTab);
  }, [activeTab]);

  // 1.2 Manage Offline State and Listeners
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(true);
      showToastNotification('Cloud Restored', 'Synchronized local cached entries with Heimdall cloud server.', 'success');
    };
    const handleOfflineStatus = () => {
      setIsOnline(false);
      showToastNotification('Offline Mode', 'Heimdall is saving everything locally. Seamless offline flow active.', 'alert');
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  // 1.3 Keybind Handlers (⌘K, Page switches, Open AI, Upload files, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K: Universal Search & Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      // Alt+C / Ctrl+Alt+C: New campaign (Campaign Studio)
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setActiveTab('Campaign Studio');
        showToastNotification('Shortcut Triggered', 'Navigated to Campaign Studio.', 'info');
        return;
      }

      // Alt+E / Ctrl+Alt+E: Generate email (AI Assistant / Outreach)
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setActiveTab('AI Assistant');
        showToastNotification('Shortcut Triggered', 'Navigated to AI Assistant to compose outreach.', 'info');
        return;
      }

      // Alt+A / Ctrl+Alt+A: Toggle AI Copilot ("Open AI")
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
        showToastNotification('Shortcut Triggered', 'Toggled AI Copilot Assistant.', 'info');
        return;
      }

      // Alt+U / Ctrl+Alt+U: Upload files / Portfolio
      if (e.altKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setActiveTab('Portfolio');
        showToastNotification('Shortcut Triggered', 'Navigated to Portfolio Workspace.', 'info');
        return;
      }

      // Alt+1 to Alt+8: Page Switches
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        const num = parseInt(e.key, 10);
        const targetTabs = [
          'Dashboard',
          'Brand Discovery',
          'Campaign Studio',
          'CRM',
          'AI Assistant',
          'Portfolio',
          'Media Kit',
          'Settings'
        ];
        if (num >= 1 && num <= targetTabs.length) {
          e.preventDefault();
          const targetTabName = targetTabs[num - 1];
          setActiveTab(targetTabName);
          showToastNotification('Tab Switched', `Navigated to ${targetTabName}.`, 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 1.4 Background Synchronizer Pulsing
  useEffect(() => {
    if (!user) return;
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      // Soft background saving simulation
      setTimeout(() => setIsSyncing(false), 1500);
    }, 12000);

    return () => clearInterval(syncInterval);
  }, [user]);

  // 1.5 Draft & Session Restoration Toast Notification
  useEffect(() => {
    if (!user) return;
    const hasNotified = sessionStorage.getItem('heimdall_restored_welcome');
    if (!hasNotified) {
      setTimeout(() => {
        showToastNotification('Session Restored', 'We restored your previous workspace, draft emails, and AI conversations.', 'success');
        sessionStorage.setItem('heimdall_restored_welcome', 'true');
      }, 1800);
    }
  }, [user]);

  // 2. Synchronize database user data
  const syncUserData = async (uid: string, currentUser: any) => {
    try {
      // Check local cache first for instant load
      let cachedProfile: CreatorProfile | null = null;
      try {
        const raw = localStorage.getItem(`heimdall_profile_${uid}`);
        if (raw) {
          cachedProfile = JSON.parse(raw);
          if (cachedProfile) {
            setCreatorProfile(cachedProfile);
          }
        }
      } catch (e) {}

      // Profile Sync
      const { data: profileSnap } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('userId', uid)
        .maybeSingle();

      let profileData: CreatorProfile;

      if (profileSnap) {
        profileData = profileSnap as CreatorProfile;
        let hasChanges = false;
        
        // Auto-upgrade / overwrite username to jaecaprio for this specific user
        if (currentUser.email === 'jaesileo@gmail.com') {
          if (profileData.creatorName === 'jaesileo' || !profileData.creatorName || profileData.creatorName === 'jaesileo@gmail.com') {
            profileData.creatorName = 'jaecaprio';
            hasChanges = true;
          }
          if (profileData.fullName === 'jaesileo' || !profileData.fullName || profileData.fullName === 'jaesileo@gmail.com') {
            profileData.fullName = 'jaecaprio';
            hasChanges = true;
          }
        }

        if (profileData.creatorName && profileData.creatorName.includes('@')) {
          profileData.creatorName = profileData.creatorName.split('@')[0];
          hasChanges = true;
        }
        if (profileData.fullName && profileData.fullName.includes('@')) {
          profileData.fullName = profileData.fullName.split('@')[0];
          hasChanges = true;
        }

        if (hasChanges) {
          try {
            await supabase.from('creator_profiles').update({
              creatorName: profileData.creatorName,
              fullName: profileData.fullName
            }).eq('userId', uid);
          } catch (e) {}
        }

        setCreatorProfile(profileData);
        try {
          localStorage.setItem(`heimdall_profile_${uid}`, JSON.stringify(profileData));
        } catch (e) {}
      } else if (cachedProfile) {
        profileData = cachedProfile;
        setCreatorProfile(profileData);
      } else {
        const isTargetUser = currentUser.email === 'jaesileo@gmail.com';
        const rawDisplayName = isTargetUser ? 'jaecaprio' : (currentUser.displayName || currentUser.user_metadata?.full_name || currentUser.email || 'Sponsorship Partner');
        const displayName = rawDisplayName.includes('@') ? rawDisplayName.split('@')[0] : rawDisplayName;
        profileData = {
          userId: uid,
          fullName: displayName,
          creatorName: displayName.split(' ')[0] || 'Vibe Creator',
          bio: 'Premium content creator building aesthetic stories.',
          country: 'United States',
          niches: ['Technology', 'Fitness', 'Lifestyle'],
          services: ['UGC Video', 'Photo', 'Monthly Retainer'],
          basePricing: { 'UGC Video': 350, 'Photo': 150, 'Monthly Retainer': 1200 },
          followersCount: {
            onboarded: true,
            username: (displayName.split(' ')[0] || 'creator').toLowerCase(),
            audience: {
              followers: '10,000',
              engagementRate: '3.8%',
              avgViews: '15,000'
            }
          }
        };
        try {
          await supabase.from('creator_profiles').insert(profileData);
        } catch (e) {}
        setCreatorProfile(profileData);
        try {
          localStorage.setItem(`heimdall_profile_${uid}`, JSON.stringify(profileData));
        } catch (e) {}
      }

      await fetchRecommendations(profileData);

      // Saved Brands Sync
      const { data: savedSnap } = await supabase
        .from('saved_brands')
        .select('*')
        .eq('userId', uid);

      let localSaved: SavedBrand[] = [];

      if (savedSnap && savedSnap.length > 0) {
        localSaved = savedSnap as SavedBrand[];
        setSavedBrands(localSaved);
      } else {
        const defaultSaved: Omit<SavedBrand, 'id'> = {
          userId: uid,
          brandId: 'b4',
          brandName: 'Notion',
          savedAt: new Date().toISOString(),
          brandDetail: {
            id: 'b4',
            name: 'Notion',
            website: 'https://www.notion.so',
            industry: 'Software & Productivity',
            category: 'Tech',
            country: 'United States',
            creatorProgramPage: 'https://www.notion.so/creators',
            notes: 'Very community-driven. Loves aesthetic workspace setups, productivity workflows, and template builders.'
          }
        };
        const { data: insertedData } = await supabase
          .from('saved_brands')
          .insert(defaultSaved)
          .select();
        const newId = insertedData?.[0]?.id || 'sb-default';
        localSaved = [{ id: newId, ...defaultSaved } as SavedBrand];
        setSavedBrands(localSaved);
      }

      // CRM Sync
      const { data: crmSnap } = await supabase
        .from('crm_pipeline')
        .select('*')
        .eq('userId', uid);

      if (crmSnap && crmSnap.length > 0) {
        setOpportunities(crmSnap as CRMOpportunity[]);
      } else {
        const defaultDeals: Omit<CRMOpportunity, 'id'>[] = [
          {
            userId: uid,
            brandId: 'b4',
            brandName: 'Notion',
            website: 'https://www.notion.so',
            industry: 'Software & Productivity',
            stage: 'Negotiation',
            dealValue: 600,
            notes: 'Discussing usage rights duration for template unboxing video storyboard.',
            followUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          },
          {
            userId: uid,
            brandId: 'b2',
            brandName: 'Gymshark',
            website: 'https://www.gymshark.com',
            industry: 'Fitness & Apparel',
            stage: 'Contacted',
            dealValue: 300,
            notes: 'Emailed custom partnerships email pitching visual daily routine integration.',
            followUpDate: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          }
        ];

        const localDeals: CRMOpportunity[] = [];
        for (const deal of defaultDeals) {
          const { data: insertedDeal } = await supabase
            .from('crm_pipeline')
            .insert(deal)
            .select();
          const newId = insertedDeal?.[0]?.id || 'crm-' + Math.random().toString();
          localDeals.push({ id: newId, ...deal } as CRMOpportunity);
        }
        setOpportunities(localDeals);
      }

      // Portfolio Case Studies Sync
      const { data: portSnap } = await supabase
        .from('portfolio')
        .select('*')
        .eq('userId', uid);

      if (portSnap && portSnap.length > 0) {
        setPortfolioItems(portSnap as PortfolioItem[]);
      } else {
        const defaultPort: Omit<PortfolioItem, 'id'>[] = [
          {
            userId: uid,
            title: 'Cinematic Work desk setup unboxing',
            description: 'Created a highly aesthetic 45s desk transformation video demonstrating custom productivity dashboards inside Notion. Shared across Instagram and TikTok.',
            mediaType: 'video',
            mediaUrl: 'https://youtube.com/watch?v=setup-case',
            tags: ['Tech', 'Productivity', 'UGC'],
            brandPartner: 'Notion',
            testimonial: {
              author: 'Sarah Jenkins',
              role: 'Influencer Marketing Lead',
              text: 'Incredible visual consistency. The video generated a 14% higher click-through-rate than our baseline marketing campaign.'
            }
          },
          {
            userId: uid,
            title: 'Dynamic morning recovery workouts vlog',
            description: 'Integrated compression apparel and high-intensity workout routines naturally in a cinematic lifestyle vlog.',
            mediaType: 'video',
            mediaUrl: 'https://instagram.com/reel/vlog-gym',
            tags: ['Fitness', 'Lifestyle'],
            brandPartner: 'Gymshark',
            testimonial: {
              author: 'Marcus Davies',
              role: 'Athlete relations lead',
              text: 'High-energy pacing and beautiful lay-flat packaging shots. Loved the conversion volume!'
            }
          }
        ];

        const localPort: PortfolioItem[] = [];
        for (const item of defaultPort) {
          const { data: insertedPort } = await supabase
            .from('portfolio')
            .insert(item)
            .select();
          const newId = insertedPort?.[0]?.id || 'port-' + Math.random().toString();
          localPort.push({ id: newId, ...item } as PortfolioItem);
        }
        setPortfolioItems(localPort);
      }

      // Bulletins / Notifications Sync
      const { data: notifSnap } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', uid);

      if (notifSnap && notifSnap.length > 0) {
        setNotifications(notifSnap as Notification[]);
      } else {
        const defaultNotifs: Omit<Notification, 'id'>[] = [
          {
            userId: uid,
            title: 'Client Follow-up Alert',
            message: 'Your outreach follow-up for Gymshark is due today. Pitch them with a storyboard update.',
            type: 'alert',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            userId: uid,
            title: 'Platform Neural Scan Complete',
            message: 'Heimdall AI generated 3 custom brand collaboration matches matching your Tech & Lifestyle niches.',
            type: 'success',
            read: false,
            createdAt: new Date().toISOString()
          }
        ];

        const localNotifs: Notification[] = [];
        for (const n of defaultNotifs) {
          const { data: insertedNotif } = await supabase
            .from('notifications')
            .insert(n)
            .select();
          const newId = insertedNotif?.[0]?.id || 'notif-' + Math.random().toString();
          localNotifs.push({ id: newId, ...n } as Notification);
        }
        setNotifications(localNotifs);
      }

    } catch (err) {
      console.error('Error synchronizing database:', err);
    }
  };

  const fetchRecommendations = async (profile: CreatorProfile) => {
    try {
      const cacheKey = `heimdall_rec_${profile.userId || profile.creatorName || 'default'}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecommendations(parsed);
            return;
          }
        } catch (e) {}
      }

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator: profile })
      });
      const data = await res.json();
      if ((data.status === 'ok' || data.status === 'mock') && Array.isArray(data.data)) {
        setRecommendations(data.data);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Recommendations fetch error:', err);
    }
  };

  const handleSaveBrand = async (brand: Brand) => {
    const uid = user?.uid || user?.id;
    if (!uid) return;
    try {
      const payload: Omit<SavedBrand, 'id'> = {
        userId: uid,
        brandId: brand.id,
        brandName: brand.name,
        savedAt: new Date().toISOString(),
        brandDetail: brand
      };

      const { data: insertedSaved, error: saveErr } = await supabase
        .from('saved_brands')
        .insert(payload)
        .select();

      if (saveErr) throw saveErr;

      const newId = insertedSaved?.[0]?.id || 'sb-' + Math.random().toString();
      const newSaved = { id: newId, ...payload } as SavedBrand;
      setSavedBrands(prev => [newSaved, ...prev]);

      await handleUpdateCrmStage(brand.id, brand.name, brand.website, brand.industry, 'Saved', 500);

      const notifPayload: Omit<Notification, 'id'> = {
        userId: uid,
        title: 'Brand Target Saved',
        message: `${brand.name} has been added to your discovery list and saved inside the pipeline.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      };
      const { data: insertedNotif } = await supabase
        .from('notifications')
        .insert(notifPayload)
        .select();

      const notifId = insertedNotif?.[0]?.id || 'notif-' + Math.random().toString();
      setNotifications(prev => [{ id: notifId, ...notifPayload } as Notification, ...prev]);

    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsaveBrand = async (brandId: string) => {
    if (!user) return;
    try {
      const target = savedBrands.find(sb => sb.brandId === brandId);
      if (target) {
        await supabase.from('saved_brands').delete().eq('id', target.id);
        setSavedBrands(prev => prev.filter(sb => sb.brandId !== brandId));

        const oppTarget = opportunities.find(o => o.brandId === brandId);
        if (oppTarget) {
          await handleDeleteOpp(oppTarget.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStageOnly = async (oppId: string, stage: CRMStage) => {
    try {
      await supabase
        .from('crm_pipeline')
        .update({ stage, updatedAt: new Date().toISOString() })
        .eq('id', oppId);
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage } : o));

      if (stage === 'Won') {
        const target = opportunities.find(o => o.id === oppId);
        setShowConfetti(true);
        showToastNotification(
          'Deal Secured! 🎉',
          `Congratulations! You officially closed the sponsorship contract with ${target?.brandName || 'Brand Partner'} for $${(target?.dealValue || 500).toLocaleString()}!`,
          'success'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCrmStage = async (
    brandId: string, 
    brandName: string, 
    website: string, 
    industry: string, 
    stage: CRMStage, 
    dealValue?: number
  ) => {
    const uid = user?.uid || user?.id;
    if (!uid) return;
    try {
      const existing = opportunities.find(o => o.brandId === brandId);

      if (existing) {
        const updates: Partial<CRMOpportunity> = { 
          stage, 
          updatedAt: new Date().toISOString() 
        };
        if (dealValue !== undefined) updates.dealValue = dealValue;

        await supabase
          .from('crm_pipeline')
          .update(updates)
          .eq('id', existing.id);
        setOpportunities(prev => prev.map(o => o.id === existing.id ? { ...o, ...updates } : o));

        if (stage === 'Won') {
          setShowConfetti(true);
          showToastNotification(
            'Deal Secured! 🎉',
            `Congratulations! You officially closed the sponsorship contract with ${brandName} for $${(dealValue || existing.dealValue || 500).toLocaleString()}!`,
            'success'
          );
        }
      } else {
        const payload: Omit<CRMOpportunity, 'id'> = {
          userId: uid,
          brandId,
          brandName,
          website,
          industry,
          stage,
          dealValue: dealValue || 500,
          notes: '',
          updatedAt: new Date().toISOString()
        };

        const { data: insertedCrm } = await supabase
          .from('crm_pipeline')
          .insert(payload)
          .select();
        const newId = insertedCrm?.[0]?.id || 'crm-' + Math.random().toString();
        setOpportunities(prev => [{ id: newId, ...payload } as CRMOpportunity, ...prev]);

        if (stage === 'Won') {
          setShowConfetti(true);
          showToastNotification(
            'Deal Secured! 🎉',
            `Congratulations! You officially closed the sponsorship contract with ${brandName} for $${(dealValue || 500).toLocaleString()}!`,
            'success'
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOppValue = async (oppId: string, value: number) => {
    try {
      await supabase
        .from('crm_pipeline')
        .update({ dealValue: value, updatedAt: new Date().toISOString() })
        .eq('id', oppId);
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, dealValue: value } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (oppId: string, note: string) => {
    try {
      const existing = opportunities.find(o => o.id === oppId);
      const combinedNote = existing?.notes ? `${existing.notes} | ${note}` : note;
      await supabase
        .from('crm_pipeline')
        .update({ notes: combinedNote, updatedAt: new Date().toISOString() })
        .eq('id', oppId);
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, notes: combinedNote } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetFollowUp = async (oppId: string, date: string) => {
    const uid = user?.uid || user?.id;
    try {
      await supabase
        .from('crm_pipeline')
        .update({ followUpDate: date, updatedAt: new Date().toISOString() })
        .eq('id', oppId);
      setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, followUpDate: date } : o));

      if (uid) {
        const notifPayload: Omit<Notification, 'id'> = {
          userId: uid,
          title: 'CRM Reminder Configured',
          message: `Follow-up date scheduled for ${opportunities.find(o => o.id === oppId)?.brandName} on ${date}.`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        };
        const { data: insertedNotif } = await supabase
          .from('notifications')
          .insert(notifPayload)
          .select();
        const notifId = insertedNotif?.[0]?.id || 'notif-' + Math.random().toString();
        setNotifications(prev => [{ id: notifId, ...notifPayload } as Notification, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOpp = async (oppId: string) => {
    try {
      const target = opportunities.find(o => o.id === oppId);
      if (!target) return;

      // Set undo buffer and optimistic state
      setDeletedOpp(target);
      setOpportunities(prev => prev.filter(o => o.id !== oppId));

      showToastNotification(
        'Opportunity Archived',
        `Archived partnership thread with ${target.brandName}.`,
        'alert'
      );

      if (deletedOppTimeout) clearTimeout(deletedOppTimeout);

      const timeoutId = setTimeout(async () => {
        await supabase.from('crm_pipeline').delete().eq('id', oppId);
        setDeletedOpp(null);
      }, 10000);

      setDeletedOppTimeout(timeoutId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndoOppDelete = () => {
    if (deletedOpp) {
      if (deletedOppTimeout) clearTimeout(deletedOppTimeout);
      setOpportunities(prev => [deletedOpp, ...prev]);
      setDeletedOpp(null);
      showToastNotification('Action Undone', 'Sponsor thread restored successfully.', 'success');
    }
  };

  const handleAddCustomOpp = async (opp: Partial<CRMOpportunity>) => {
    const uid = user?.uid || user?.id;
    if (!uid) return;
    try {
      const payload: Omit<CRMOpportunity, 'id'> = {
        userId: uid,
        brandId: opp.brandId || 'man-' + Math.random().toString(),
        brandName: opp.brandName || 'Sponsor',
        website: opp.website || '',
        industry: opp.industry || 'General',
        stage: opp.stage || 'Saved',
        dealValue: opp.dealValue || 500,
        notes: opp.notes || '',
        contactPerson: opp.contactPerson || '',
        contactEmail: opp.contactEmail || '',
        followUpDate: opp.followUpDate || '',
        updatedAt: new Date().toISOString()
      };

      const { data: insertedCrm } = await supabase
        .from('crm_pipeline')
        .insert(payload)
        .select();
      const newId = insertedCrm?.[0]?.id || 'crm-' + Math.random().toString();
      setOpportunities(prev => [{ id: newId, ...payload } as CRMOpportunity, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPortfolioItem = async (item: PortfolioItem) => {
    const uid = user?.uid || user?.id;
    if (!uid) return;
    try {
      const payload: Omit<PortfolioItem, 'id'> = {
        userId: uid,
        title: item.title,
        description: item.description,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        tags: item.tags,
        brandPartner: item.brandPartner,
        testimonial: item.testimonial
      };

      const { data: insertedPort } = await supabase
        .from('portfolio')
        .insert(payload)
        .select();
      const newId = insertedPort?.[0]?.id || 'port-' + Math.random().toString();
      setPortfolioItems(prev => [{ id: newId, ...payload } as PortfolioItem, ...prev]);

      const notifPayload: Omit<Notification, 'id'> = {
        userId: uid,
        title: 'Case Study Published',
        message: `Your campaign "${item.title}" with ${item.brandPartner || 'partner'} is live in your media kit.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      };
      const { data: insertedNotif } = await supabase
        .from('notifications')
        .insert(notifPayload)
        .select();
      const notifId = insertedNotif?.[0]?.id || 'notif-' + Math.random().toString();
      setNotifications(prev => [{ id: notifId, ...notifPayload } as Notification, ...prev]);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    try {
      const target = portfolioItems.find(p => p.id === itemId);
      if (!target) return;

      // Set undo buffer and optimistic state
      setDeletedPortItem(target);
      setPortfolioItems(prev => prev.filter(p => p.id !== itemId));

      showToastNotification(
        'Case Study Archived',
        `Archived portfolio entry "${target.title}".`,
        'alert'
      );

      if (deletedPortTimeout) clearTimeout(deletedPortTimeout);

      const timeoutId = setTimeout(async () => {
        await supabase.from('portfolio').delete().eq('id', itemId);
        setDeletedPortItem(null);
      }, 10000);

      setDeletedPortTimeout(timeoutId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndoPortfolioDelete = () => {
    if (deletedPortItem) {
      if (deletedPortTimeout) clearTimeout(deletedPortTimeout);
      setPortfolioItems(prev => [deletedPortItem, ...prev]);
      setDeletedPortItem(null);
      showToastNotification('Action Undone', 'Case study restored successfully.', 'success');
    }
  };

  const handleSaveProfile = async (updatedProfile: CreatorProfile) => {
    const uid = user?.uid || user?.id;
    if (!uid) return;
    try {
      setCreatorProfile(updatedProfile);
      try {
        localStorage.setItem(`heimdall_profile_${uid}`, JSON.stringify(updatedProfile));
      } catch (e) {}
      await supabase
        .from('creator_profiles')
        .upsert({ ...updatedProfile, userId: uid });
      await fetchRecommendations(updatedProfile);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // CREATOR INTELLIGENCE & DYNAMIC RATE CARD ENGINE HANDLERS
  // =========================================================

  const handleAcceptProposal = (proposalId: string, customServices?: RateCardServiceItem[]) => {
    if (!activeProposal && !customServices) return;
    const servicesToApply = customServices || activeProposal?.services || [];

    setRateCards(prev => prev.map(existing => {
      const match = servicesToApply.find(s => s.serviceKey === existing.serviceKey);
      if (match) {
        return {
          ...existing,
          previousPrice: existing.currentPrice,
          currentPrice: match.newRecommendedPrice || match.currentPrice,
          recommendedPrice: match.newRecommendedPrice || match.currentPrice,
          confidenceScore: match.confidenceScore || existing.confidenceScore,
          pricingRationale: match.pricingRationale || existing.pricingRationale,
          lastUpdated: new Date().toISOString()
        };
      }
      return existing;
    }));

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'rate_accepted',
      source: 'creator_consent',
      title: 'Commercial Rate Card Proposal Accepted',
      details: `Applied recommended rate calibration based on ${activeProposal?.triggerEvent || 'verified telemetry breakout'}.`,
      userAction: 'Accepted',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Also update notification
    const notif: Notification = {
      id: 'notif_rate_' + Math.random().toString(),
      userId: user?.id || 'default_user',
      title: 'Commercial Rate Card Updated 🚀',
      message: `Your dynamic commercial rates have been adjusted to reflect your current verified audience metrics.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    setActiveProposal(null);
    setShowConfetti(true);
    showToastNotification(
      'Rate Card Calibrated! 🚀',
      'Your commercial rate card has been updated across your portfolio, media kit, and CRM pitch generators.',
      'success'
    );
  };

  const handleRejectProposal = (proposalId: string) => {
    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'rate_rejected',
      source: 'creator_consent',
      title: 'Rate Card Proposal Dismissed',
      details: 'Creator retained existing commercial rate matrix without applying AI recommendations.',
      userAction: 'Rejected',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setActiveProposal(null);
    showToastNotification('Proposal Dismissed', 'Your current commercial rates remain unchanged.', 'info');
  };

  const handleUpdateServicePrice = (serviceKey: string, customPrice: number) => {
    setRateCards(prev => prev.map(s => {
      if (s.serviceKey === serviceKey) {
        return {
          ...s,
          previousPrice: s.currentPrice,
          currentPrice: customPrice,
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    }));

    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'rate_edited',
      source: 'manual_override',
      title: `Custom Rate Set: ${serviceKey}`,
      details: `Manually set price to $${customPrice}`,
      userAction: 'Manual Override',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToastNotification('Rate Updated', `Updated deliverable pricing to $${customPrice}.`, 'success');
  };

  const handleRestorePreviousPrice = (serviceKey: string) => {
    setRateCards(prev => prev.map(s => {
      if (s.serviceKey === serviceKey && s.previousPrice > 0) {
        return {
          ...s,
          currentPrice: s.previousPrice,
          previousPrice: s.currentPrice,
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    }));

    showToastNotification('Rate Restored', `Restored previous deliverable pricing.`, 'info');
  };

  const handleToggleAutoUpdate = (enabled: boolean) => {
    setRateCardSettings(prev => ({ ...prev, autoUpdateRateCard: enabled }));
    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'sync',
      source: 'creator_consent',
      title: enabled ? 'Auto-Update Rate Card Enabled' : 'Manual Approval Required',
      details: enabled 
        ? 'Heimdall will automatically apply verified telemetry rate updates without asking.' 
        : 'Heimdall will generate pending proposals for creator approval.',
      userAction: 'Manual Override',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToastNotification(
      'Rate Card Setting Changed',
      enabled ? 'Auto-apply enabled for future growth detections.' : 'Manual approval required for rate changes.',
      'info'
    );
  };

  const handleApproveNicheEvolution = (suggestedNiches: string[]) => {
    if (!creatorProfile) return;
    const mergedNiches = Array.from(new Set([...creatorProfile.niches, ...suggestedNiches]));
    handleSaveProfile({
      ...creatorProfile,
      niches: mergedNiches
    });

    if (activeProposal) {
      setActiveProposal({
        ...activeProposal,
        nicheEvolutionRecommendation: undefined
      });
    }

    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'niche_updated',
      source: 'creator_consent',
      title: 'Positioning & Niche Expansion Approved',
      details: `Added new commercial categories: ${suggestedNiches.join(', ')}`,
      userAction: 'Accepted',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToastNotification('Positioning Expanded! ✨', `Added ${suggestedNiches.join(', ')} to your creator positioning.`, 'success');
  };

  const handleRejectNicheEvolution = () => {
    if (activeProposal) {
      setActiveProposal({
        ...activeProposal,
        nicheEvolutionRecommendation: undefined
      });
    }
    showToastNotification('Niche Suggestion Dismissed', 'Current positioning maintained.', 'info');
  };

  const handleSyncAccount = async (platform: PlatformId) => {
    setIsSyncing(true);
    try {
      const account = socialAccounts.find(a => a.platform === platform) || socialAccounts[0];
      const res = await fetch('/api/intelligence/analyze-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: account.platform,
          previousMetrics: {
            followers: account.followerCount,
            views: account.averageViews,
            engagement: account.engagementRate,
            reach: account.reach
          },
          currentMetrics: {
            followers: account.followerCount,
            views: account.averageViews,
            engagement: account.engagementRate,
            reach: account.reach
          },
          category: account.category,
          currentRateCard: rateCards,
          nicheMultiplier: 1.35
        })
      });
      const data = await res.json();
      showToastNotification('Telemetry Synchronized', `Verified latest telemetry for ${account.platform}.`, 'success');
    } catch (err) {
      console.error(err);
      showToastNotification('Telemetry Refreshed', 'Telemetry snapshot synced.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectAccount = (platform: PlatformId, username: string) => {
    const newAccount: SocialAccount = {
      id: 'soc_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      platform,
      accountId: `${platform}_${username}`,
      username,
      profileUrl: `https://${platform}.com/${username}`,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      followerCount: platform === 'tiktok' ? 18000 : 8500,
      engagementRate: 5.2,
      averageViews: 12000,
      reach: 28000,
      impressions: 38000,
      averageLikes: 640,
      averageComments: 45,
      averageShares: 30,
      category: creatorProfile?.niches?.[0] || 'Lifestyle',
      connectionStatus: 'connected',
      authType: 'oauth',
      lastSyncTimestamp: new Date().toISOString()
    };

    setSocialAccounts(prev => [newAccount, ...prev]);

    const newSnapshot: SocialMetricsSnapshot = {
      id: 'snap_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      platform,
      followerCount: newAccount.followerCount,
      engagementRate: newAccount.engagementRate,
      averageViews: newAccount.averageViews,
      reach: newAccount.reach,
      impressions: newAccount.impressions,
      changeClassification: 'NORMAL',
      timestamp: new Date().toISOString(),
      dateLabel: 'Initial Ingestion',
      source: 'oauth',
      notes: `Ingested verified account @${username}`
    };
    setSnapshots(prev => [newSnapshot, ...prev]);

    const newLog: AuditLogEntry = {
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      eventType: 'account_connected',
      source: 'oauth',
      title: `Connected ${platform.toUpperCase()} Account`,
      details: `@${username} verified and synchronized with Heimdall Intelligence Engine.`,
      userAction: 'Auto-Applied',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showToastNotification('Account Connected! 🔗', `Successfully linked @${username} on ${platform}.`, 'success');
  };

  const handleUpdateAccountMetrics = async (platform: PlatformId, newMetrics: Partial<SocialAccount>) => {
    const targetAccount = socialAccounts.find(a => a.platform === platform);
    if (!targetAccount) return;

    const oldFollowers = targetAccount.followerCount;
    const oldViews = targetAccount.averageViews;
    const oldEng = targetAccount.engagementRate;

    const updatedAccount = { ...targetAccount, ...newMetrics };
    setSocialAccounts(prev => prev.map(a => a.platform === platform ? updatedAccount : a));

    // Create timestamped historical snapshot
    const newSnapshot: SocialMetricsSnapshot = {
      id: 'snap_' + Math.random().toString(36).substr(2, 9),
      userId: user?.id || 'default_user',
      platform,
      followerCount: updatedAccount.followerCount,
      engagementRate: updatedAccount.engagementRate,
      averageViews: updatedAccount.averageViews,
      reach: updatedAccount.reach,
      impressions: updatedAccount.impressions || updatedAccount.reach * 1.3,
      deltaFollowers: updatedAccount.followerCount - oldFollowers,
      deltaViews: updatedAccount.averageViews - oldViews,
      deltaEngagement: updatedAccount.engagementRate - oldEng,
      changeClassification: (updatedAccount.followerCount >= oldFollowers * 1.5 || updatedAccount.averageViews >= oldViews * 2) ? 'MAJOR' : 'NORMAL',
      timestamp: new Date().toISOString(),
      dateLabel: 'Manual Telemetry Update',
      source: 'manual_verification',
      notes: 'Telemetry manually verified via creator dashboard'
    };
    setSnapshots(prev => [newSnapshot, ...prev]);

    // Trigger Intelligence Recalculation
    try {
      const res = await fetch('/api/intelligence/analyze-growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          previousMetrics: {
            followers: oldFollowers,
            views: oldViews,
            engagement: oldEng,
            reach: targetAccount.reach
          },
          currentMetrics: {
            followers: updatedAccount.followerCount,
            views: updatedAccount.averageViews,
            engagement: updatedAccount.engagementRate,
            reach: updatedAccount.reach
          },
          category: updatedAccount.category,
          currentRateCard: rateCards,
          nicheMultiplier: 1.35
        })
      });
      const data = await res.json();
      if (data.status === 'ok' && data.proposal) {
        if (rateCardSettings.autoUpdateRateCard) {
          handleAcceptProposal(data.proposal.id, data.proposal.services);
        } else {
          setActiveProposal(data.proposal);
          showToastNotification('Growth Detected! ⚡', 'Heimdall generated a new commercial rate recommendation for you.', 'success');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSimulation = async (scenarioType: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/social/simulate-growth-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioType })
      });
      const data = await res.json();

      if (data.status === 'ok') {
        const { snapshot, proposal, newMetrics } = data;

        // Update target social account
        setSocialAccounts(prev => prev.map(a => {
          if (a.platform === proposal.platform) {
            return {
              ...a,
              followerCount: newMetrics.followers,
              averageViews: newMetrics.views,
              engagementRate: newMetrics.engagement,
              reach: newMetrics.reach,
              impressions: newMetrics.impressions || newMetrics.reach * 1.3,
              lastSyncTimestamp: new Date().toISOString()
            };
          }
          return a;
        }));

        // Add Snapshot to Timeline
        setSnapshots(prev => [snapshot, ...prev]);

        // Add Audit Log
        const newLog: AuditLogEntry = {
          id: 'aud_' + Math.random().toString(36).substr(2, 9),
          userId: user?.id || 'default_user',
          eventType: 'sync',
          source: 'simulation_engine',
          title: `Simulated: ${proposal.triggerEvent}`,
          details: `${proposal.platform.toUpperCase()} reach expanded to ${newMetrics.followers.toLocaleString()} followers with ${newMetrics.views.toLocaleString()} avg views.`,
          userAction: 'Manual Override',
          timestamp: new Date().toISOString()
        };
        setAuditLogs(prev => [newLog, ...prev]);

        if (rateCardSettings.autoUpdateRateCard) {
          handleAcceptProposal(proposal.id, proposal.services);
        } else {
          setActiveProposal(proposal);
          setShowConfetti(true);
          showToastNotification(
            'Viral Breakout Detected! 🚀',
            `Instagram followers surged 5K → 10K, Reel views 8K → 35K! Dynamic rate recommendation generated.`,
            'success'
          );
        }
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectBrandForAction = (brand: any, actionType: 'pitch' | 'campaign') => {
    setSelectedBrandForAction(brand);
    if (actionType === 'pitch') {
      setActiveTab('AI Assistant');
    } else {
      setActiveTab('Campaign Studio');
    }
  };

  const handleExecuteAction = (type: string, params: any) => {
    if (type === 'discovery') {
      setActiveTab('Brand Discovery');
    } else if (type === 'crm_sync') {
      handleUpdateCrmStage(
        params.brandId || 'man-ai',
        params.brandName,
        'https://www.google.com',
        'General',
        params.stage || 'Contacted',
        500
      );
    }
  };

  const handleLogOut = async () => {
    if (confirm('Sign out from Heimdall Security Tunnel?')) {
      try {
        localStorage.removeItem('heimdall_local_session');
      } catch (e) {}
      setUser(null);
      setCreatorProfile(null);
      await supabase.auth.signOut();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center gap-3">
        <Shield className="w-8 h-8 text-[#00E676] animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Initiating Heimdall Brand Security...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        onLoginSuccess={(loggedInUser) => {
          const uid = loggedInUser.id || loggedInUser.uid || 'default_user';
          const userObj = {
            ...loggedInUser,
            id: uid,
            uid
          };
          setUser(userObj);
          try {
            localStorage.setItem('heimdall_local_session', JSON.stringify(userObj));
          } catch (e) {}
          syncUserData(uid, userObj);
        }}
      />
    );
  }

  if (creatorProfile && creatorProfile.followersCount?.onboarded !== true) {
    return (
      <OnboardingView
        user={user}
        creatorProfile={creatorProfile}
        onComplete={(updatedProfile) => {
          setCreatorProfile(updatedProfile);
        }}
        onSaveProfile={handleSaveProfile}
      />
    );
  }

  // Dynamic Navigation Tabs for Creator Mode vs Brand Mode
  const tabs = isBrandMode
    ? [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Discover Creators', icon: Search },
        { name: 'Campaigns & Autopsy', icon: BarChart3 },
        { name: 'Deals', icon: Layers },
        { name: 'Opportunities', icon: Briefcase },
        { name: 'Creator CRM', icon: TrendingUp },
        { name: 'Brand Reputation', icon: Award },
        { name: 'Settings', icon: Settings }
      ]
    : [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Intelligence & Rate Card', icon: Sparkles },
        { name: 'Connected Accounts', icon: Share2 },
        { name: 'Brand Discovery', icon: Compass },
        { name: 'Opportunities', icon: Briefcase },
        { name: 'Deals', icon: Layers },
        { name: 'Contract X-Ray', icon: Scale },
        { name: 'Campaign Studio', icon: Clapperboard },
        { name: 'Reputation', icon: Award },
        { name: 'CRM', icon: TrendingUp },
        { name: 'AI Assistant', icon: Sparkles },
        { name: 'Portfolio', icon: FolderGit2 },
        { name: 'Media Kit', icon: FileText },
        { name: 'Settings', icon: Settings }
      ];


  // Copilot Message Submittor
  const handleSendCopilotMessage = () => {
    if (!copilotInput.trim()) return;
    
    const userMsg = {
      id: Math.random().toString(),
      role: 'user',
      text: copilotInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');

    // Simulate AI Core response mapped to creator profile context
    setTimeout(() => {
      let responseText = "Understood. Synchronizing request with your active target brands index. Let me know if you would like me to compile a draft email pitch or script storyboard.";
      const query = copilotInput.toLowerCase();

      if (query.includes('pitch') || query.includes('email') || query.includes('outreach') || query.includes('contact')) {
        responseText = `Generating outreach template. Since your core niche is ${creatorProfile?.niches?.join(', ') || 'Lifestyle UGC'}, we will pitch your ${creatorProfile?.followersCount?.instagram || '150k+'} Instagram followers reach at an optimized pricing rate of $${Object.values(creatorProfile?.basePricing || {})[0] || '1,200'} per contract. Let's send a premium link to your published case studies.`;
      } else if (query.includes('brand') || query.includes('sponsor') || query.includes('skincare') || query.includes('fitness')) {
        responseText = "Scanning active Heimdall Brand Discovery databases... Nike, Gymshark, Wise, Notion, and Apple show over 92% match correlation with your creator score.";
      } else if (query.includes('deal') || query.includes('rate') || query.includes('price') || query.includes('negotiat')) {
        responseText = `Based on your specific reach, your calculated base deal valuation is $${Object.values(creatorProfile?.basePricing || {})[0] || '1,200'}. I suggest proposing a 20% retainer bonus on secondary usage licensing rights.`;
      } else if (query.includes('help') || query.includes('command') || query.includes('palette')) {
        responseText = "You can search and execute commands instantly anywhere by pressing ⌘K (Ctrl+K). Try typing 'Open CRM' or 'Notion' in the command bar.";
      }

      setCopilotMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1100);
  };

  // Command palette filter options
  const filteredPaletteItems = (() => {
    if (!paletteSearch) return [];
    const query = paletteSearch.toLowerCase();
    const matches: any[] = [];

    // Match pages
    tabs.forEach(t => {
      if (t.name.toLowerCase().includes(query)) {
        matches.push({ type: 'navigation', label: `Navigate to ${t.name}`, value: t.name });
      }
    });

    // Match saved sponsors
    savedBrands.forEach(sb => {
      if (sb.brandName.toLowerCase().includes(query) || (sb.brandDetail.industry && sb.brandDetail.industry.toLowerCase().includes(query))) {
        matches.push({ type: 'brand', label: `Target Sponsor: ${sb.brandName}`, value: sb });
      }
    });

    // Match CRM Opportunities
    opportunities.forEach(opp => {
      if (opp.brandName.toLowerCase().includes(query) || opp.stage.toLowerCase().includes(query)) {
        matches.push({ type: 'crm', label: `CRM Deal: ${opp.brandName} (${opp.stage})`, value: opp });
      }
    });

    return matches.slice(0, 8); // limit to top 8
  })();

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] font-sans flex flex-col md:flex-row relative overflow-x-hidden transition-colors duration-300">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--theme-accent-glow)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--theme-accent-glow)] rounded-full blur-3xl pointer-events-none" />

      {/* 1. Offline Mode Sticky Notification Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-semibold">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>YOU ARE WORKING OFFLINE. HEIMDALL IS SAFELY SAVING INTEGRATIONS TO SECURE LOCAL STORAGE.</span>
          </div>
          <span className="text-[9px] font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 text-amber-900 uppercase font-bold">Offline Node</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className={`md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-zinc-200 text-zinc-900 z-40 ${!isOnline ? 'mt-11' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            H
          </div>
          <span className="font-extrabold tracking-tight text-base font-display text-zinc-900">Heimdall</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Navigation - Pearl-Mist Translucent Glass Card */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`fixed md:sticky top-0 left-0 z-50 md:z-40 h-screen transition-all duration-300 ease-out flex flex-col justify-between ${
          isSidebarExpanded ? 'md:w-66' : 'md:w-22'
        } ${
          isMobileMenuOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full md:translate-x-0'
        } ${!isOnline ? 'pt-11' : ''}`}
      >
        {/* Floating Spatial Card for Sidebar */}
        <div className="h-full md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:mr-2 rounded-none md:rounded-[28px] bg-white/95 md:bg-white/80 backdrop-blur-xl border border-zinc-200/80 md:border-white shadow-2xl md:shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300">
          <div className="p-4 md:p-5 space-y-6">
            {/* Brand Logo Header */}
            <div className={`flex items-center justify-between pb-4 border-b border-zinc-200/80 transition-all duration-300 ${isSidebarExpanded ? 'px-2' : 'md:justify-center md:px-0'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-700 text-white rounded-2xl flex items-center justify-center font-extrabold text-base shadow-md shadow-teal-900/20 shrink-0">
                  H
                </div>
                <div className={`transition-all duration-300 ${isSidebarExpanded ? 'md:opacity-100 md:max-w-[200px]' : 'md:opacity-0 md:max-w-0 md:overflow-hidden md:hidden'} opacity-100 max-w-[200px]`}>
                  <span className="text-zinc-950 font-extrabold tracking-tight text-base block leading-none font-display">Heimdall</span>
                  <span className="text-[10px] text-teal-800 font-bold block tracking-wider uppercase leading-none mt-1">Operating System</span>
                </div>
              </div>

              {/* Mobile drawer close button */}
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    id={`nav-tab-${tab.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => {
                      setActiveTab(tab.name);
                      setIsMobileMenuOpen(false);
                    }}
                    title={tab.name}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20' 
                        : 'text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100/90'
                    } ${isSidebarExpanded ? '' : 'md:justify-center'}`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-teal-700 hover:scale-105'}`} />
                    <span className={`transition-all duration-300 origin-left font-bold ${isSidebarExpanded ? 'md:opacity-100 md:translate-x-0 md:w-auto' : 'md:opacity-0 md:translate-x-4 md:w-0 md:overflow-hidden md:hidden'} opacity-100 translate-x-0 w-auto`}>
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile footer connection */}
          <div className="p-4 md:p-5 border-t border-zinc-200/80 space-y-3 bg-zinc-50/80">
            <div className={`flex items-center gap-3 ${isSidebarExpanded ? '' : 'md:justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center font-extrabold text-xs uppercase text-teal-900 shrink-0">
                {(() => {
                  const name = creatorProfile?.creatorName || user.email || 'AM';
                  return name.includes('@') ? name.split('@')[0].slice(0, 2) : name.slice(0, 2);
                })()}
              </div>
              <div className={`min-w-0 transition-all duration-300 ${isSidebarExpanded ? 'md:opacity-100 md:max-w-[200px]' : 'md:opacity-0 md:max-w-0 md:overflow-hidden md:hidden'} opacity-100 max-w-[200px]`}>
                <p className="text-xs font-extrabold text-zinc-950 truncate leading-none mb-1">
                  {(() => {
                    const name = creatorProfile?.creatorName || user.email || 'Creator';
                    return name.includes('@') ? name.split('@')[0] : name;
                  })()}
                </p>
                <p className="text-[10px] text-teal-800 font-bold truncate leading-none">Verified Talent</p>
              </div>
            </div>

            <button
              id="sidebar-onboarding-reset"
              onClick={async () => {
                if (confirm('Replay the onboarding setup flow? Your profile data will be preserved.')) {
                  const updatedProfile = {
                    ...creatorProfile!,
                    followersCount: {
                      ...(creatorProfile?.followersCount || {}),
                      onboarded: false
                    }
                  };
                  await handleSaveProfile(updatedProfile);
                }
              }}
              className={`w-full py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200/80 text-zinc-800 transition-all rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs ${isSidebarExpanded ? 'px-3' : 'md:px-0'}`}
              title="Replay Onboarding"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className={`transition-all duration-300 ${isSidebarExpanded ? 'md:opacity-100 md:w-auto' : 'md:opacity-0 md:w-0 md:overflow-hidden md:hidden'} opacity-100 w-auto`}>
                Setup Wizard
              </span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogOut}
              className={`w-full py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200/80 text-zinc-800 hover:text-zinc-950 transition-colors rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs ${isSidebarExpanded ? 'px-3' : 'md:px-0'}`}
              title="Close Session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
              <span className={`transition-all duration-300 ${isSidebarExpanded ? 'md:opacity-100 md:w-auto' : 'md:opacity-0 md:w-0 md:overflow-hidden md:hidden'} opacity-100 w-auto`}>
                Log Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-transparent relative z-10">
        
        {/* Top Floating Champagne Pill Navigation Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 h-20 relative">
          
          {/* Left: Search Trigger (⌘K) */}
          <button 
            id="global-search-trigger"
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-3 px-4 py-2 bg-white border border-zinc-200/90 hover:border-emerald-600 transition-all text-zinc-500 text-xs rounded-full shadow-sm cursor-pointer font-medium"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search workspace or execute command...</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-bold text-zinc-600 font-mono">⌘K</span>
          </button>

          {/* Center: Two-Sided Mode Switcher Pill */}
          <div className="flex items-center p-1 bg-zinc-200/70 rounded-full">
            <button
              id="switch-to-creator-mode"
              onClick={() => {
                setIsBrandMode(false);
                localStorage.setItem('heimdall_brand_mode', 'false');
                setActiveTab('Dashboard');
                showToastNotification('Switched to Creator Suite', 'Creator operating system, rate card, and deal room active.', 'info');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !isBrandMode
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Creator Mode</span>
            </button>
            <button
              id="switch-to-brand-mode"
              onClick={() => {
                setIsBrandMode(true);
                localStorage.setItem('heimdall_brand_mode', 'true');
                setActiveTab('Dashboard');
                showToastNotification('Switched to Brand Suite', 'Brand creator discovery, campaign builder, and escrow deals active.', 'info');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isBrandMode
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Brand Mode</span>
            </button>
          </div>

          {/* Right: Theme Switcher, Cloud Sync Pill, Landing Page Preview, & User */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher currentTheme={currentTheme} onSelectTheme={setCurrentTheme} />

            <button
              onClick={() => setActiveTab(activeTab === 'Landing Page' ? 'Dashboard' : 'Landing Page')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'Landing Page'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-white text-zinc-700 hover:text-zinc-950 border-zinc-200 hover:border-teal-400'
              }`}
            >
              {activeTab === 'Landing Page' ? 'Exit Landing Page' : 'Landing Page'}
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[11px] font-semibold text-teal-800">
              <span className={`w-1.5 h-1.5 rounded-full bg-teal-600 ${isSyncing ? 'animate-ping' : ''}`} />
              <span>{isSyncing ? 'Cloud Syncing...' : 'Live Connected'}</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 shadow-sm">
              {user.email}
            </div>
          </div>
        </header>

        {/* Dynamic Content Panel View */}
        <div className="p-6 md:px-10 md:pb-12 flex-1 overflow-y-auto">
          {activeTab === 'Dashboard' && (
            <DashboardView
              creatorProfile={creatorProfile || {
                userId: user?.id || 'default_user',
                fullName: 'Alex Rivers',
                creatorName: 'Alex Rivers',
                bio: 'High-performance fitness & aesthetic lifestyle creator.',
                country: 'United States',
                niches: ['Fitness & Athletics', 'Lifestyle UGC'],
                services: [],
                basePricing: { instagram_reel: 500 },
                followersCount: { instagram: '10,000', youtube: '12,500', onboarded: true }
              }}
              savedBrands={savedBrands}
              opportunities={opportunities}
              notifications={notifications}
              recommendations={recommendations}
              onNavigate={setActiveTab}
              onSelectBrandForAction={handleSelectBrandForAction}
              onSaveBrand={handleSaveBrand}
              onUpdateCrmStage={handleUpdateCrmStage}
              rateCards={rateCards}
              activeProposal={activeProposal}
              socialAccounts={socialAccounts}
            />
          )}

          {activeTab === 'Intelligence & Rate Card' && creatorProfile && (
            <CreatorIntelligenceView
              creatorProfile={creatorProfile}
              snapshots={snapshots}
              rateCards={rateCards}
              activeProposal={activeProposal}
              auditLogs={auditLogs}
              settings={rateCardSettings}
              onAcceptProposal={handleAcceptProposal}
              onRejectProposal={handleRejectProposal}
              onUpdateServicePrice={handleUpdateServicePrice}
              onRestorePreviousPrice={handleRestorePreviousPrice}
              onToggleAutoUpdate={handleToggleAutoUpdate}
              onApproveNicheEvolution={handleApproveNicheEvolution}
              onRejectNicheEvolution={handleRejectNicheEvolution}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Connected Accounts' && creatorProfile && (
            <ConnectedAccountsView
              socialAccounts={socialAccounts}
              creatorProfile={creatorProfile}
              onConnectAccount={handleConnectAccount}
              onSyncAccount={handleSyncAccount}
              onUpdateAccountMetrics={handleUpdateAccountMetrics}
              onRunSimulation={handleRunSimulation}
              isSyncing={isSyncing}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Brand Discovery' && (
            <DiscoveryView
              creatorProfile={creatorProfile || {
                userId: user?.id || 'default_user',
                fullName: 'Alex Rivers',
                creatorName: 'Alex Rivers',
                bio: 'High-performance fitness creator.',
                country: 'United States',
                niches: ['Fitness'],
                services: [],
                basePricing: {},
                followersCount: { onboarded: true }
              }}
              savedBrands={savedBrands}
              onSaveBrand={handleSaveBrand}
              onUnsaveBrand={handleUnsaveBrand}
              onSelectBrandForAction={handleSelectBrandForAction}
            />
          )}

          {activeTab === 'Discover Creators' && (
            <BrandDiscoveryCreatorsView
              brandProfile={brandProfile}
              onSelectCreatorForDeal={handleSelectCreatorForDeal}
              onEvaluateCreator={(creatorName) => {
                setActiveTab('Opportunities');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Deals' && (
            <DealRoomView
              deals={deals}
              activeDealId={deals[0]?.id}
              creatorProfile={creatorProfile}
              brandProfile={brandProfile}
              isBrandMode={isBrandMode}
              onUpdateDealStage={handleUpdateDealStage}
              onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
              onSendDealMessage={handleSendDealMessage}
              onResolveScopeCreep={handleResolveScopeCreep}
              onSelectDeal={(dealId) => {}}
            />
          )}

          {activeTab === 'Contract X-Ray' && (
            <ContractXRayView
              creatorProfile={creatorProfile}
              onApplyNegotiatedTerms={(dealId, terms) => {
                showToastNotification('Terms Applied', 'Counteroffer terms attached to deal room.', 'success');
              }}
            />
          )}

          {activeTab === 'Opportunities' && (
            <OpportunityIntelligenceView
              creatorProfile={creatorProfile}
              brandProfile={brandProfile}
              isBrandMode={isBrandMode}
              onNavigate={setActiveTab}
            />
          )}

          {(activeTab === 'Reputation' || activeTab === 'Brand Reputation') && (
            <ReputationPassportView
              creatorProfile={creatorProfile}
              brandProfile={brandProfile}
              isBrandMode={isBrandMode}
            />
          )}

          {activeTab === 'Campaigns & Autopsy' && (
            <CampaignAutopsyView
              brandProfile={brandProfile}
              onNavigate={setActiveTab}
              onReactivateCreator={(creatorName, budget) => {
                setActiveTab('Deals');
                showToastNotification('Reactivation Initialized', `Drafting new deal room with ${creatorName} for $${budget.toLocaleString()}.`, 'success');
              }}
            />
          )}

          {activeTab === 'Campaign Studio' && creatorProfile && (
            <CampaignView
              creatorProfile={creatorProfile}
              savedBrands={savedBrands}
              selectedBrandFromAction={selectedBrandForAction}
              onSaveCampaign={() => {}}
            />
          )}

          {(activeTab === 'CRM' || activeTab === 'Creator CRM') && (
            <CrmView
              opportunities={opportunities}
              onUpdateStage={handleUpdateStageOnly}
              onUpdateOppValue={handleUpdateOppValue}
              onAddNote={handleAddNote}
              onSetFollowUp={handleSetFollowUp}
              onDeleteOpp={handleDeleteOpp}
              onAddCustomOpp={handleAddCustomOpp}
            />
          )}

          {activeTab === 'AI Assistant' && creatorProfile && (
            <AiAssistantView
              creatorProfile={creatorProfile}
              savedBrands={savedBrands}
              onExecuteAction={handleExecuteAction}
            />
          )}

          {activeTab === 'Portfolio' && (
            <PortfolioView
              portfolioItems={portfolioItems}
              onAddPortfolioItem={handleAddPortfolioItem}
              onDeletePortfolioItem={handleDeletePortfolioItem}
            />
          )}

          {activeTab === 'Media Kit' && creatorProfile && (
            <MediaKitView
              creatorProfile={creatorProfile}
              portfolioItems={portfolioItems}
            />
          )}

          {activeTab === 'Settings' && creatorProfile && (
            <SettingsView
              creatorProfile={creatorProfile}
              onSaveProfile={handleSaveProfile}
              userEmail={user.email || ''}
              currentTheme={currentTheme}
              onSelectTheme={setCurrentTheme}
            />
          )}

          {activeTab === 'Landing Page' && (
            <LandingPageView
              onEnterAsCreator={() => setActiveTab('Dashboard')}
              onEnterAsBrand={() => {
                setIsBrandMode(true);
                setActiveTab('Dashboard');
              }}
            />
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 2. UNIVERSAL SEARCH & COMMAND PALETTE OVERLAY (⌘K) */}
      {/* ========================================================= */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <Search className="w-5 h-5 text-emerald-700 shrink-0" />
              <input
                id="palette-search-input"
                type="text"
                placeholder="Search brands, campaign briefs, crm pipeline, pages..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-zinc-900 text-sm focus:outline-none placeholder-zinc-400 font-medium"
              />
              <button 
                onClick={() => setIsPaletteOpen(false)}
                className="text-[10px] font-mono text-zinc-500 bg-zinc-200/80 px-2 py-0.5 rounded uppercase font-bold"
              >
                Esc
              </button>
            </div>

            {/* Results listing */}
            <div className="p-4 max-h-[340px] overflow-y-auto divide-y divide-zinc-100">
              {paletteSearch ? (
                filteredPaletteItems.length > 0 ? (
                  filteredPaletteItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.type === 'navigation') {
                          setActiveTab(item.value);
                        } else if (item.type === 'brand') {
                          handleSelectBrandForAction(item.value.brandDetail, 'pitch');
                        } else if (item.type === 'crm') {
                          setActiveTab('CRM');
                        }
                        setIsPaletteOpen(false);
                        setPaletteSearch('');
                      }}
                      className="w-full text-left py-3 px-4 rounded-2xl hover:bg-zinc-100 flex items-center justify-between text-xs transition-colors font-semibold cursor-pointer"
                    >
                      <span className="text-zinc-800">{item.label}</span>
                      <span className="text-emerald-800 font-bold text-[10px] bg-emerald-100 px-2.5 py-0.5 rounded-full">Navigate</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    No matching workspace elements found.
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Quick Navigation Matrix</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.name}
                          onClick={() => {
                            setActiveTab(tab.name);
                            setIsPaletteOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 transition-all text-left font-semibold text-xs cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-emerald-700" />
                          <span>{tab.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom guide footer */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-[10px] font-medium text-zinc-500 text-center">
              Use <span className="text-emerald-800 font-bold">↑↓</span> to navigate • <span className="text-zinc-900 font-bold">Enter</span> to execute command
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. FLOATING TOAST NOTIFICATIONS (WITH 10s UNDO SUPPORT) */}
      {/* ========================================================= */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const isArchival = toast.title.includes('Archived') || toast.title.includes('Removed');
          return (
            <div 
              key={toast.id}
              className="pointer-events-auto w-full bg-white/95 border border-zinc-200 rounded-2xl shadow-xl p-4 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-right-4 duration-300"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    toast.type === 'success' ? 'bg-emerald-500' :
                    toast.type === 'alert' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <h4 className="text-xs font-bold text-zinc-900">{toast.title}</h4>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed">{toast.message}</p>
                
                {isArchival && (
                  <button
                    onClick={() => {
                      if (toast.title.includes('Opportunity')) {
                        handleUndoOppDelete();
                      } else {
                        handleUndoPortfolioDelete();
                      }
                      setToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="mt-2 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg text-zinc-800 text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Undo Archival (10s)
                  </button>
                )}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. ALWAYS AVAILABLE AI COPILOT FLOATING ORB & PANEL */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
        {isCopilotOpen && (
          <div className="w-80 sm:w-[380px] h-[480px] bg-white border border-zinc-200 rounded-[28px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
            {/* Copilot Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 font-display">Spatial Copilot Node</h4>
                  <p className="text-[10px] text-emerald-700 font-semibold">Gemini Intelligence Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCopilotOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {copilotMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                  <span className="text-[9px] font-medium text-zinc-400">
                    {msg.role === 'user' ? 'YOU' : 'HEIMDALL COPILOT'}
                  </span>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-emerald-800 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer Controls */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2">
              <input
                id="copilot-text-input"
                type="text"
                placeholder="Ask for custom pitch, deal advice..."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotMessage()}
                className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 transition-all font-medium"
              />
              <button 
                id="copilot-send-btn"
                onClick={handleSendCopilotMessage}
                className="pill-btn-emerald p-2.5 text-white rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* The Spatial Pill Orb Trigger */}
        <button
          id="copilot-floating-orb"
          onClick={() => {
            setIsCopilotOpen(!isCopilotOpen);
            if (!isCopilotOpen) {
              showToastNotification('Copilot Initialized', 'Spatial continuous guidance node is online.', 'success');
            }
          }}
          className="w-14 h-14 bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
          </span>
        </button>
      </div>

      {/* Confetti Celebration Element */}
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Analytics />

    </div>
  );
}
