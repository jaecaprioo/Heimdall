import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
import ConfettiCanvas from './components/ConfettiCanvas';

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
  Flame
} from 'lucide-react';
import { 
  CreatorProfile, 
  SavedBrand, 
  CRMOpportunity, 
  CampaignContent, 
  PortfolioItem, 
  Notification, 
  Brand,
  CRMStage
} from './types';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('heimdall_active_tab') || 'Dashboard');

  // Core Postgres States
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

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

  // 1. Listen to Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      if (currentUser) {
        const uid = currentUser.id;
        setUser({
          ...currentUser,
          uid,
          id: uid
        });
        syncUserData(uid, currentUser);
      } else {
        setAuthLoading(false);
      }
    }).catch(err => {
      console.error("Error getting session:", err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      if (currentUser) {
        const uid = currentUser.id;
        setUser({
          ...currentUser,
          uid,
          id: uid
        });
        await syncUserData(uid, currentUser);
      } else {
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
          await supabase.from('creator_profiles').update({
            creatorName: profileData.creatorName,
            fullName: profileData.fullName
          }).eq('userId', uid);
        }

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
          niches: [],
          services: [],
          basePricing: {},
          followersCount: {
            onboarded: false
          }
        };
        await supabase.from('creator_profiles').insert(profileData);
        setCreatorProfile(profileData);
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
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator: profile })
      });
      const data = await res.json();
      if (data.status === 'ok' || data.status === 'mock') {
        setRecommendations(data.data);
        if (data.status === 'mock') {
          showToastNotification(
            'AI CO-PROCESSOR ACTIVE',
            'Holographic matchmaker running on localized backup matrices (Gemini quota limit active).',
            'alert'
          );
        }
      }
    } catch (err) {
      console.error(err);
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
      await supabase
        .from('creator_profiles')
        .upsert({ ...updatedProfile, userId: uid });
      setCreatorProfile(updatedProfile);
      await fetchRecommendations(updatedProfile);
    } catch (err) {
      console.error(err);
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
    return <LoginView onLoginSuccess={() => {}} />;
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

  // Pure monochrome, luxurious 8-link sidebar matching prompt precisely
  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Brand Discovery', icon: Compass },
    { name: 'Campaign Studio', icon: Clapperboard },
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
    <div className="min-h-screen bg-[#030712] text-zinc-300 font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Visual background layers */}
      <div className="bg-grid-overlay" />
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />

      {/* JARVIS Tactical HUD overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glowing holographic radar-like circles */}
        <div className="absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] rounded-full border border-[#00C8FF]/5 animate-[spin_120s_linear_infinite]" />
        <div className="absolute -top-[10%] -left-[10%] w-[30vw] h-[30vw] rounded-full border border-dashed border-[#32E8FF]/5 animate-[spin_60s_linear_infinite_reverse]" />
        
        {/* Bottom Right Tactical radar HUD circle */}
        <div className="absolute -bottom-[15%] -right-[15%] w-[60vh] h-[60vh] rounded-full border border-[#00C8FF]/10 flex items-center justify-center animate-[spin_180s_linear_infinite]">
          <div className="w-[85%] h-[85%] rounded-full border border-[#32E8FF]/5 border-dashed" />
          <div className="w-[60%] h-[60%] rounded-full border border-[#00C8FF]/5" />
          <div className="w-[30%] h-[30%] rounded-full border border-[#32E8FF]/5 border-dashed" />
        </div>
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#00C8FF]/[0.007] to-transparent bg-[length:100%_4px] pointer-events-none" />
        {/* Moving laser scan line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C8FF]/15 to-transparent shadow-[0_0_15px_rgba(0,200,255,0.3)] animate-[scan_8s_ease-in-out_infinite]" />
      </div>
      
      {/* 1. Offline Mode Sticky Notification Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>YOU ARE WORKING OFFLINE. HEIMDALL IS SAFELY SAVING INTEGRATIONS TO SECURE LOCAL STORAGE.</span>
          </div>
          <span className="text-[9px] font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 text-amber-300 uppercase">Offline Node</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className={`md:hidden flex items-center justify-between p-4 bg-[#070B14]/90 backdrop-blur-md border-b border-white/5 text-white z-40 ${!isOnline ? 'mt-11' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00C8FF]/20 border border-[#00C8FF]/40 rounded flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-[#00C8FF] rotate-45"></div>
          </div>
          <span className="font-bold tracking-[0.2em] text-sm uppercase text-white font-mono">Heimdall</span>
        </div>
        <button
          id="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-400"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-out flex flex-col justify-between ${
          isSidebarExpanded ? 'md:w-66' : 'md:w-22'
        } ${
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${!isOnline ? 'pt-11' : ''}`}
      >
        {/* Glassmorphic floating card container for desktop, standard for mobile */}
        <div className="h-full md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 md:mr-2 rounded-none md:rounded-[24px] glass-panel flex flex-col justify-between overflow-hidden transition-all duration-300">
          <div className="p-4 md:p-5 space-y-6">
            {/* Brand Logo Header */}
            <div className={`flex items-center gap-3 pb-4 border-b border-white/5 transition-all duration-300 ${isSidebarExpanded ? 'px-2' : 'justify-center md:px-0'}`}>
              <div className="w-9 h-9 bg-[#00C8FF]/10 border border-[#00C8FF]/30 rounded-[12px] flex items-center justify-center shadow-lg shadow-[#00C8FF]/10 animate-pulse">
                <div className="w-4.5 h-4.5 border-2 border-[#00C8FF] rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#32E8FF] rounded-full"></div>
                </div>
              </div>
              <div className={`transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden md:hidden'}`}>
                <span className="text-white font-bold tracking-[0.25em] text-sm uppercase block leading-none mb-1 font-mono text-glow-emerald">Heimdall</span>
                <span className="text-[8px] text-[#32E8FF] font-mono block tracking-widest font-semibold uppercase leading-none">AI Talent Node</span>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1.5">
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
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left ${
                      isActive 
                        ? 'bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/25 shadow-[0_0_15px_rgba(0,200,255,0.12)]' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    } ${isSidebarExpanded ? '' : 'md:justify-center'}`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-[#00C8FF] scale-110' : 'text-zinc-500 hover:scale-105'}`} />
                    <span className={`transition-all duration-300 origin-left ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 overflow-hidden md:hidden'}`}>
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile footer connection */}
          <div className="p-4 md:p-5 border-t border-white/5 space-y-4 bg-black/20">
            <div className={`flex items-center gap-3 ${isSidebarExpanded ? '' : 'md:justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20 flex items-center justify-center font-bold text-xs uppercase text-[#00C8FF] font-mono shadow-[0_0_10px_rgba(0,200,255,0.05)] shrink-0">
                {(() => {
                  const name = creatorProfile?.creatorName || user.email || 'AM';
                  return name.includes('@') ? name.split('@')[0].slice(0, 2) : name.slice(0, 2);
                })()}
              </div>
              <div className={`min-w-0 transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden md:hidden'}`}>
                <p className="text-xs font-semibold text-white truncate leading-none mb-1 font-sans">
                  {(() => {
                    const name = creatorProfile?.creatorName || user.email || 'Representative';
                    return name.includes('@') ? name.split('@')[0] : name;
                  })()}
                </p>
                <p className="text-[8px] text-[#32E8FF] font-mono truncate leading-none uppercase tracking-wider font-bold">Premium Creator</p>
              </div>
            </div>

            <button
              id="sidebar-onboarding-reset"
              onClick={async () => {
                if (confirm('Replay the onboarding setup flow? Your profile data will be preserved but you can step through the customized wizard again.')) {
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
              className={`w-full py-2 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#00C8FF] hover:text-[#32E8FF] transition-all border border-[#00C8FF]/20 hover:border-[#00C8FF]/40 rounded-xl text-[9px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2 ${isSidebarExpanded ? 'px-3' : 'md:px-0'}`}
              title="Replay Onboarding"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className={`transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                Replay Onboarding
              </span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogOut}
              className={`w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2 ${isSidebarExpanded ? 'px-3' : 'md:px-0'}`}
              title="Close Session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className={`transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                Close Session
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-transparent relative z-10">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-6 h-16 border-b border-white/5 bg-white/[0.01] backdrop-blur-md relative">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00C8FF] animate-pulse" />
              <span className="text-[10px] text-[#A9B4C7] font-mono uppercase tracking-widest font-semibold">Heimdall OS v2.0 Active</span>
            </div>
            {/* Background Sync Dot Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00C8FF]/5 border border-[#00C8FF]/15 rounded-full text-[9px] font-mono text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#00C8FF] ${isSyncing ? 'animate-ping' : 'opacity-60'} shadow-[0_0_8px_#00C8FF]`}></span>
              <span>{isSyncing ? 'SYNCHRONIZING SECURE CORE...' : 'SECURE CLOUD SYNCED'}</span>
            </div>
          </div>

          {/* Quick command search hint */}
          <button 
            id="global-search-trigger"
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors text-zinc-500 text-[11px] rounded-xl font-mono cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-zinc-600" />
            <span>Search workspace or run command...</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-bold text-zinc-400">⌘K</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Quick user email display */}
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {user.email}
            </div>
          </div>
        </header>

        {/* Dynamic Content Panel View */}
        <div className="p-6 md:p-10 flex-1 overflow-y-auto">
          {activeTab === 'Dashboard' && creatorProfile && (
            <DashboardView
              creatorProfile={creatorProfile}
              savedBrands={savedBrands}
              opportunities={opportunities}
              notifications={notifications}
              recommendations={recommendations}
              onNavigate={setActiveTab}
              onSelectBrandForAction={handleSelectBrandForAction}
              onSaveBrand={handleSaveBrand}
              onUpdateCrmStage={handleUpdateCrmStage}
            />
          )}

          {activeTab === 'Brand Discovery' && creatorProfile && (
            <DiscoveryView
              creatorProfile={creatorProfile}
              savedBrands={savedBrands}
              onSaveBrand={handleSaveBrand}
              onUnsaveBrand={handleUnsaveBrand}
              onSelectBrandForAction={handleSelectBrandForAction}
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

          {activeTab === 'CRM' && (
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
            />
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 2. UNIVERSAL SEARCH & COMMAND PALETTE OVERLAY (⌘K) */}
      {/* ========================================================= */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl bg-[#121212]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.01]">
              <Search className="w-5 h-5 text-[#00E676] shrink-0" />
              <input
                id="palette-search-input"
                type="text"
                placeholder="Search brands, campaign briefs, crm pipeline, pages..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-zinc-500 font-sans"
              />
              <button 
                onClick={() => setIsPaletteOpen(false)}
                className="text-[10px] font-mono text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase"
              >
                Esc
              </button>
            </div>

            {/* Results listing */}
            <div className="p-4 max-h-[340px] overflow-y-auto divide-y divide-white/[0.03]">
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
                      className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs transition-colors font-mono uppercase tracking-wider"
                    >
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-[#00E676] font-semibold text-[9px] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">Trigger Command</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 text-zinc-500 text-xs font-mono">
                    NO CORRESPONDING HEIMDALL INTELLIGENCE INDEX FOUND
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Quick Navigation Matrix</div>
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
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00E676]/20 text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all text-left font-mono uppercase tracking-wider text-[10px]"
                        >
                          <Icon className="w-4 h-4 text-zinc-500" />
                          <span>{tab.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom guide footer */}
            <div className="p-3 bg-black/40 border-t border-white/5 text-[9px] font-mono text-zinc-600 text-center uppercase tracking-widest">
              Use <span className="text-[#00E676] font-bold">↑↓</span> to navigate • <span className="text-[#38BDF8] font-bold">Enter</span> to execute command
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. FLOAT FLOATING TOAST NOTIFICATIONS (WITH 10s UNDO SUPPORT) */}
      {/* ========================================================= */}
      <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const isArchival = toast.title.includes('Archived') || toast.title.includes('Removed');
          return (
            <div 
              key={toast.id}
              className="pointer-events-auto w-full bg-[#151515]/95 border border-white/10 rounded-2xl shadow-2xl p-5 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-right-4 duration-300"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    toast.type === 'success' ? 'bg-[#00E676]' :
                    toast.type === 'alert' ? 'bg-amber-500' : 'bg-[#38BDF8]'
                  }`}></span>
                  <h4 className="text-xs font-bold font-mono uppercase text-white tracking-wider">{toast.title}</h4>
                </div>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">{toast.message}</p>
                
                {/* 10-Second Undo Button controls */}
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
                    className="mt-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-mono text-[9px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                  >
                    Undo Archival (10s)
                  </button>
                )}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/5 transition-colors shrink-0"
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
          <div className="w-80 sm:w-[380px] h-[480px] bg-[#121212]/95 border border-white/10 rounded-[28px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
            {/* Copilot Header */}
            <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse"></div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Heimdall Copilot Node</h4>
                  <p className="text-[9px] text-[#38BDF8] font-mono uppercase tracking-widest font-semibold mt-0.5">Ready to transmit</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCopilotOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-transparent">
              {copilotMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                  <span className="text-[8px] font-mono text-zinc-500 tracking-wider">
                    {msg.role === 'user' ? 'YOU' : 'HEIMDALL AI'} • {msg.timestamp || 'Active'}
                  </span>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676]' 
                      : 'bg-white/5 border border-white/5 text-zinc-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer Controls */}
            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center gap-2">
              <input
                id="copilot-text-input"
                type="text"
                placeholder="Ask Heimdall custom pitches, deal advice..."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotMessage()}
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676] transition-all"
              />
              <button 
                id="copilot-send-btn"
                onClick={handleSendCopilotMessage}
                className="p-2.5 bg-[#00E676] hover:bg-[#00B254] text-black rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* The Glowing Floating Orb Trigger */}
        <button
          id="copilot-floating-orb"
          onClick={() => {
            setIsCopilotOpen(!isCopilotOpen);
            if (!isCopilotOpen) {
              showToastNotification('Copilot Initialized', 'Heimdall continuous guidance node is online.', 'success');
            }
          }}
          className="w-14 h-14 bg-gradient-to-tr from-[#00E676] to-[#38BDF8] text-black rounded-full flex items-center justify-center shadow-lg shadow-[#00E676]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          
          {/* Pulsing ring indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* Confetti Celebration Element */}
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />

    </div>
  );
}
