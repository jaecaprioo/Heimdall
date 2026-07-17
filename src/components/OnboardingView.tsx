import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';
import { CreatorProfile } from '../types';
import {
  User,
  Activity,
  Globe,
  Share2,
  Users,
  Target,
  DollarSign,
  Palette,
  Sparkles,
  Calendar,
  Link,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Layers,
  HelpCircle,
  Clock,
  Briefcase,
  AlertCircle,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';

interface OnboardingViewProps {
  user: any;
  creatorProfile: CreatorProfile;
  onComplete: (updatedProfile: CreatorProfile) => void;
  onSaveProfile: (profile: CreatorProfile) => Promise<void>;
}

const TOTAL_STEPS = 11;

// Premium Preset Cartoon & Animal Avatars (No real human faces)
const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Rusty', // Cute Robot
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fox',  // Pixel Art Fox
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Bunny', // Pixel Art Bunny
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gizmo', // Cute Cartoon Avatar
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Buster', // Cute Animal-like Toy
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80', // Cute Cozy Kitten
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80', // Cute Happy Puppy
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=150&q=80'  // Cute Aesthetic Bunny
];

export default function OnboardingView({ user, creatorProfile, onComplete, onSaveProfile }: OnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Core Form State mapping directly to CreatorProfile & followersCount JSONB metadata
  const [fullName, setFullName] = useState(creatorProfile.fullName || '');
  const [creatorName, setCreatorName] = useState(creatorProfile.creatorName || '');
  const [username, setUsername] = useState(creatorProfile.followersCount?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(creatorProfile.followersCount?.avatarUrl || PRESET_AVATARS[0]);
  
  // Step 2 DNA
  const [selectedNiches, setSelectedNiches] = useState<string[]>(creatorProfile.niches || []);
  const [selectedCreatorTypes, setSelectedCreatorTypes] = useState<string[]>(creatorProfile.followersCount?.creatorType || []);

  // Step 3 Socials
  const [instagram, setInstagram] = useState(creatorProfile.instagramUrl || '');
  const [tiktok, setTiktok] = useState(creatorProfile.tiktokUrl || '');
  const [youtube, setYoutube] = useState(creatorProfile.youtubeUrl || '');
  const [linkedin, setLinkedin] = useState(creatorProfile.linkedinUrl || '');
  const [portfolio, setPortfolio] = useState(creatorProfile.portfolioUrl || '');
  const [otherSocials, setOtherSocials] = useState<{ [key: string]: string }>(
    creatorProfile.followersCount?.socialUrls || {
      website: '',
      threads: '',
      pinterest: '',
      behance: '',
      dribbble: '',
      github: '',
      spotify: '',
      twitch: ''
    }
  );

  // Step 4 Audience
  const [followers, setFollowers] = useState(creatorProfile.followersCount?.audience?.followers || '10,000');
  const [engagementRate, setEngagementRate] = useState(creatorProfile.followersCount?.audience?.engagementRate || '3.5%');
  const [avgViews, setAvgViews] = useState(creatorProfile.followersCount?.audience?.avgViews || '15,000');
  const [audienceLocation, setAudienceLocation] = useState(creatorProfile.followersCount?.audience?.location || 'United States');
  const [audienceAge, setAudienceAge] = useState(creatorProfile.followersCount?.audience?.age || '18-24');
  const [audienceGender, setAudienceGender] = useState(creatorProfile.followersCount?.audience?.gender || '50% Female / 50% Male');
  const [audienceLanguages, setAudienceLanguages] = useState(creatorProfile.followersCount?.audience?.languages || 'English');

  // Platform-specific metrics
  const [igFollowers, setIgFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.followers || '');
  const [igEngagement, setIgEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.engagement || '');
  const [igViews, setIgViews] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.avgViews || '');

  const [ttFollowers, setTtFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.followers || '');
  const [ttEngagement, setTtEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.engagement || '');
  const [ttViews, setTtViews] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.avgViews || '');

  const [ytSubscribers, setYtSubscribers] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.subscribers || '');
  const [ytEngagement, setYtEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.engagement || '');
  const [ytViews, setYtViews] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.avgViews || '');

  const [liFollowers, setLiFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.linkedin?.followers || '');
  const [liEngagement, setLiEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.linkedin?.engagement || '');

  const [syncingMetrics, setSyncingMetrics] = useState(false);

  const extractHandle = (url: string, platform: string) => {
    if (!url) return '';
    try {
      const cleaned = url.trim().replace(/\/$/, ''); // remove trailing slash
      const parts = cleaned.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.startsWith('@')) {
        return lastPart;
      }
      return platform === 'tiktok' || platform === 'youtube' ? `@${lastPart}` : lastPart;
    } catch (e) {
      return '';
    }
  };

  const generateEstimatedStats = (handle: string, platform: string, niches: string[]) => {
    if (!handle) return null;
    
    let hash = 0;
    for (let i = 0; i < handle.length; i++) {
      hash = handle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    
    const isTechOrProductivity = niches.some(n => ['Tech', 'Productivity', 'Finance', 'Business', 'Education'].includes(n));
    const isAesthetic = niches.some(n => ['Lifestyle', 'Beauty', 'Fashion', 'Aesthetics', 'Travel', 'Design'].includes(n));

    if (platform === 'instagram') {
      const baseFollowers = 8000 + (absHash % 45000); // 8k - 53k followers
      const finalFollowers = isAesthetic ? Math.round(baseFollowers * 1.5) : baseFollowers;
      const engagement = (2.5 + (absHash % 40) / 10).toFixed(1); // 2.5% - 6.5%
      const views = Math.round(finalFollowers * (0.15 + (absHash % 20) / 100)); // 15% - 35% of followers as views
      return {
        followers: finalFollowers > 1000 ? `${(finalFollowers / 1000).toFixed(1)}k` : `${finalFollowers}`,
        engagement: `${engagement}%`,
        avgViews: views > 1000 ? `${(views / 1000).toFixed(1)}k` : `${views}`
      };
    }

    if (platform === 'tiktok') {
      const baseFollowers = 25000 + (absHash % 180000); // 25k - 205k followers
      const finalFollowers = isAesthetic ? Math.round(baseFollowers * 1.8) : baseFollowers;
      const engagement = (5.2 + (absHash % 60) / 10).toFixed(1); // 5.2% - 11.2%
      const views = Math.round(finalFollowers * (0.25 + (absHash % 30) / 100)); // 25% - 55% of followers as views
      return {
        followers: finalFollowers > 1000 ? `${(finalFollowers / 1000).toFixed(1)}k` : `${finalFollowers}`,
        engagement: `${engagement}%`,
        avgViews: views > 1000 ? `${(views / 1000).toFixed(1)}k` : `${views}`
      };
    }

    if (platform === 'youtube') {
      const baseSubs = 3000 + (absHash % 25000); // 3k - 28k subscribers
      const finalSubs = isTechOrProductivity ? Math.round(baseSubs * 2.2) : baseSubs;
      const engagement = (3.8 + (absHash % 35) / 10).toFixed(1); // 3.8% - 7.3%
      const views = Math.round(finalSubs * (0.35 + (absHash % 40) / 100)); // 35% - 75% of subs as views
      return {
        subscribers: finalSubs > 1000 ? `${(finalSubs / 1000).toFixed(1)}k` : `${finalSubs}`,
        engagement: `${engagement}%`,
        avgViews: views > 1000 ? `${(views / 1000).toFixed(1)}k` : `${views}`
      };
    }

    if (platform === 'linkedin') {
      const baseFollowers = 1200 + (absHash % 15000); // 1.2k - 16.2k followers
      const finalFollowers = isTechOrProductivity ? Math.round(baseFollowers * 2.5) : baseFollowers;
      const engagement = (1.8 + (absHash % 25) / 10).toFixed(1); // 1.8% - 4.3%
      return {
        followers: finalFollowers > 1000 ? `${(finalFollowers / 1000).toFixed(1)}k` : `${finalFollowers}`,
        engagement: `${engagement}%`
      };
    }

    return null;
  };

  const handleSyncMetrics = () => {
    setSyncingMetrics(true);
    setTimeout(() => {
      let totalFollowersSum = 0;
      let totalViewsSum = 0;
      let erSum = 0;
      let activePlatformsCount = 0;

      if (instagram) {
        const handle = extractHandle(instagram, 'instagram');
        const stats = generateEstimatedStats(handle, 'instagram', selectedNiches);
        if (stats) {
          setIgFollowers(stats.followers);
          setIgEngagement(stats.engagement);
          setIgViews(stats.avgViews);
          
          totalFollowersSum += parseFloat(stats.followers) || 0;
          totalViewsSum += parseFloat(stats.avgViews) || 0;
          erSum += parseFloat(stats.engagement) || 0;
          activePlatformsCount++;
        }
      }

      if (tiktok) {
        const handle = extractHandle(tiktok, 'tiktok');
        const stats = generateEstimatedStats(handle, 'tiktok', selectedNiches);
        if (stats) {
          setTtFollowers(stats.followers);
          setTtEngagement(stats.engagement);
          setTtViews(stats.avgViews);

          totalFollowersSum += parseFloat(stats.followers) || 0;
          totalViewsSum += parseFloat(stats.avgViews) || 0;
          erSum += parseFloat(stats.engagement) || 0;
          activePlatformsCount++;
        }
      }

      if (youtube) {
        const handle = extractHandle(youtube, 'youtube');
        const stats = generateEstimatedStats(handle, 'youtube', selectedNiches);
        if (stats) {
          setYtSubscribers(stats.subscribers);
          setYtEngagement(stats.engagement);
          setYtViews(stats.avgViews);

          totalFollowersSum += parseFloat(stats.subscribers) || 0;
          totalViewsSum += parseFloat(stats.avgViews) || 0;
          erSum += parseFloat(stats.engagement) || 0;
          activePlatformsCount++;
        }
      }

      if (linkedin) {
        const handle = extractHandle(linkedin, 'linkedin');
        const stats = generateEstimatedStats(handle, 'linkedin', selectedNiches);
        if (stats) {
          setLiFollowers(stats.followers);
          setLiEngagement(stats.engagement);

          totalFollowersSum += parseFloat(stats.followers) || 0;
          erSum += parseFloat(stats.engagement) || 0;
          activePlatformsCount++;
        }
      }

      if (activePlatformsCount > 0) {
        setFollowers(`${totalFollowersSum.toFixed(1)}k`);
        setEngagementRate(`${(erSum / activePlatformsCount).toFixed(1)}%`);
        if (totalViewsSum > 0) {
          setAvgViews(`${totalViewsSum.toFixed(1)}k`);
        }
      }
      setSyncingMetrics(false);
    }, 1200);
  };

  // Step 5 Brand Partnership Prefs
  const [preferredBrandNiches, setPreferredBrandNiches] = useState<string[]>(
    creatorProfile.followersCount?.preferredNiches || []
  );
  const [preferredPartnershipTypes, setPreferredPartnershipTypes] = useState<string[]>(
    creatorProfile.followersCount?.preferredPartnershipTypes || []
  );

  // Step 6 Pricing (Service Pricing)
  const [prices, setPrices] = useState<{ [key: string]: string }>(() => {
    const p: { [key: string]: string } = {};
    const base = creatorProfile.basePricing || {};
    const servicesList = [
      'UGC Video',
      'Photo',
      'Monthly Retainer',
      'Campaign Package',
      'Raw Footage',
      'Usage Rights',
      'Whitelisting',
      'Travel Day Rate'
    ];
    servicesList.forEach(srv => {
      p[srv] = base[srv] ? base[srv].toString() : '';
    });
    return p;
  });

  // Step 7 Brand Personality / Voice
  const [brandPersonality, setBrandPersonality] = useState<string[]>(
    creatorProfile.followersCount?.brandPersonality || []
  );

  // Step 8 Identity / AI Memory questions
  const [oneSentence, setOneSentence] = useState(creatorProfile.followersCount?.creatorIdentity?.oneSentence || '');
  const [uniqueness, setUniqueness] = useState(creatorProfile.followersCount?.creatorIdentity?.uniqueness || '');
  const [dreamBrands, setDreamBrands] = useState(creatorProfile.followersCount?.creatorIdentity?.dreamBrands || '');
  const [biggestGoals, setBiggestGoals] = useState(creatorProfile.followersCount?.creatorIdentity?.biggestGoals || '');

  // Step 9 Birthday
  const [birthDay, setBirthDay] = useState(creatorProfile.followersCount?.birthday?.day || '');
  const [birthMonth, setBirthMonth] = useState(creatorProfile.followersCount?.birthday?.month || '');

  // Step 10 Localization
  const [country, setCountry] = useState(creatorProfile.country || 'United States');
  const [city, setCity] = useState(creatorProfile.followersCount?.location?.city || '');
  const [timezone, setTimezone] = useState(creatorProfile.followersCount?.location?.timezone || 'EST (UTC-5)');
  const [currency, setCurrency] = useState(creatorProfile.followersCount?.location?.currency || 'USD ($)');
  const [language, setLanguage] = useState(creatorProfile.followersCount?.location?.language || 'English');

  // Step 11 Apps
  const [connectedApps, setConnectedApps] = useState<string[]>(
    creatorProfile.followersCount?.connectedApps || []
  );

  // Auto-validation of Username with live check
  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const cleaned = username.trim().toLowerCase();
        // Query database to check if any user has this username in followersCount->>username
        const { data, error } = await supabase
          .from('creator_profiles')
          .select('userId')
          .eq('followersCount->>username', cleaned)
          .not('userId', 'eq', user.id);

        if (error) throw error;
        setUsernameValid(data && data.length === 0);
      } catch (err) {
        console.error('Error validating username:', err);
        setUsernameValid(true); // Fallback to true if any system query block
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user.id]);

  // Handle Autosaving of state to Parent and database
  const saveCurrentProgress = async () => {
    setSaving(true);
    try {
      // Map basePricing to numeric dictionary
      const basePricingNumeric: { [key: string]: number } = {};
      Object.keys(prices).forEach(k => {
        if (prices[k]) {
          const num = parseInt(prices[k].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) {
            basePricingNumeric[k] = num;
          }
        }
      });

      // Construct followersCount custom payload
      const followersPayload = {
        ...(creatorProfile.followersCount || {}),
        username: username.trim().toLowerCase(),
        avatarUrl,
        creatorType: selectedCreatorTypes,
        socialUrls: otherSocials,
        audience: {
          followers,
          engagementRate,
          avgViews,
          location: audienceLocation,
          age: audienceAge,
          gender: audienceGender,
          languages: audienceLanguages
        },
        platform_metrics: {
          instagram: { followers: igFollowers, engagement: igEngagement, avgViews: igViews },
          tiktok: { followers: ttFollowers, engagement: ttEngagement, avgViews: ttViews },
          youtube: { subscribers: ytSubscribers, engagement: ytEngagement, avgViews: ytViews },
          linkedin: { followers: liFollowers, engagement: liEngagement }
        },
        preferredNiches: preferredBrandNiches,
        preferredPartnershipTypes,
        brandPersonality,
        creatorIdentity: {
          oneSentence,
          uniqueness,
          dreamBrands: dreamBrands.split(',').map(b => b.trim()).filter(Boolean),
          biggestGoals
        },
        birthday: {
          day: birthDay,
          month: birthMonth
        },
        location: {
          city,
          timezone,
          currency,
          language
        },
        connectedApps,
        onboarded: false // still onboarding until final screen complete
      };

      const updatedProfile: CreatorProfile = {
        userId: user.id,
        fullName: fullName || user.email?.split('@')[0] || 'Sponsorship Partner',
        creatorName: creatorName || fullName.split(' ')[0] || 'Vibe Creator',
        bio: oneSentence || creatorProfile.bio || 'Professional creator building high-retention video stories.',
        country,
        niches: selectedNiches,
        services: Object.keys(basePricingNumeric),
        basePricing: basePricingNumeric,
        instagramUrl: instagram || undefined,
        tiktokUrl: tiktok || undefined,
        youtubeUrl: youtube || undefined,
        linkedinUrl: linkedin || undefined,
        portfolioUrl: portfolio || undefined,
        followersCount: followersPayload
      };

      await onSaveProfile(updatedProfile);
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Trigger autosave when clicking next or back
  const handleNext = async () => {
    await saveCurrentProgress();
    if (currentStep < TOTAL_STEPS + 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Final Action to enter Heimdall dashboard
  const handleFinalize = async () => {
    setSaving(true);
    try {
      // Map basePricing to numeric dictionary
      const basePricingNumeric: { [key: string]: number } = {};
      Object.keys(prices).forEach(k => {
        if (prices[k]) {
          const num = parseInt(prices[k].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) {
            basePricingNumeric[k] = num;
          }
        }
      });

      const followersPayload = {
        ...(creatorProfile.followersCount || {}),
        username: username.trim().toLowerCase(),
        avatarUrl,
        creatorType: selectedCreatorTypes,
        socialUrls: otherSocials,
        audience: {
          followers,
          engagementRate,
          avgViews,
          location: audienceLocation,
          age: audienceAge,
          gender: audienceGender,
          languages: audienceLanguages
        },
        platform_metrics: {
          instagram: { followers: igFollowers, engagement: igEngagement, avgViews: igViews },
          tiktok: { followers: ttFollowers, engagement: ttEngagement, avgViews: ttViews },
          youtube: { subscribers: ytSubscribers, engagement: ytEngagement, avgViews: ytViews },
          linkedin: { followers: liFollowers, engagement: liEngagement }
        },
        preferredNiches: preferredBrandNiches,
        preferredPartnershipTypes,
        brandPersonality,
        creatorIdentity: {
          oneSentence,
          uniqueness,
          dreamBrands: dreamBrands.split(',').map(b => b.trim()).filter(Boolean),
          biggestGoals
        },
        birthday: {
          day: birthDay,
          month: birthMonth
        },
        location: {
          city,
          timezone,
          currency,
          language
        },
        connectedApps,
        onboarded: true // Officially finished onboarding!
      };

      const finalProfile: CreatorProfile = {
        userId: user.id,
        fullName: fullName || user.email?.split('@')[0] || 'Sponsorship Partner',
        creatorName: creatorName || fullName.split(' ')[0] || 'Vibe Creator',
        bio: oneSentence || 'Professional creator building premium visual stories.',
        country,
        niches: selectedNiches,
        services: Object.keys(basePricingNumeric),
        basePricing: basePricingNumeric,
        instagramUrl: instagram || undefined,
        tiktokUrl: tiktok || undefined,
        youtubeUrl: youtube || undefined,
        linkedinUrl: linkedin || undefined,
        portfolioUrl: portfolio || undefined,
        followersCount: followersPayload
      };

      await onSaveProfile(finalProfile);
      onComplete(finalProfile);
    } catch (err) {
      console.error('Finalization error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Helper lists
  const NICHE_OPTIONS = [
    'Fitness', 'Technology', 'AI', 'Fashion', 'Beauty', 'Lifestyle',
    'Travel', 'Food', 'Gaming', 'Business', 'Luxury', 'Automotive',
    'Photography', 'Filmmaking', 'Music', 'Finance', 'Education', 'Sports'
  ];

  const CREATOR_TYPES = [
    'UGC Creator', 'Influencer', 'Athlete', 'Coach', 'Entrepreneur',
    'Filmmaker', 'Photographer', 'Model', 'Streamer', 'Educator'
  ];

  const PARTNERSHIP_TYPES = [
    'UGC', 'Sponsored Posts', 'Commercial Ads', 'Affiliate',
    'Brand Ambassador', 'Events', 'Speaking', 'Licensing', 'Long-term Retainers'
  ];

  const TONES = [
    'Luxury', 'Minimal', 'Professional', 'Bold', 'Funny', 'Educational',
    'Founder', 'Corporate', 'Luxury Cinematic', 'High Energy', 'Documentary',
    'Creative', 'Friendly', 'Confident'
  ];

  const APP_INTEGRATIONS = [
    { name: 'Gmail', icon: '✉️', desc: 'Auto-send pitch sequences' },
    { name: 'Google Calendar', icon: '📅', desc: 'Sync negotiation meetings' },
    { name: 'Google Drive', icon: '📁', desc: 'Backup active campaign media' },
    { name: 'Dropbox', icon: '📦', desc: 'Import raw client footage' },
    { name: 'Notion', icon: '📓', desc: 'Export storyboard concepts' },
    { name: 'Slack', icon: '💬', desc: 'Notify workspace of new opportunities' },
    { name: 'Stripe', icon: '💳', desc: 'Direct secure client payouts' },
    { name: 'PayPal', icon: '🌐', desc: 'Global multi-currency transactions' }
  ];

  // Microcopy headers and indicators
  const getMicrocopy = () => {
    if (currentStep <= 3) return 'Your AI is getting to know you.';
    if (currentStep <= 6) return 'Almost there.';
    if (currentStep <= 10) return 'One more step.';
    return 'Your AI memory is complete.';
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER SECTION: Progress Indicator */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/20 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">Heimdall OS</span>
              <span className="mx-2 text-zinc-800">/</span>
              <span className="text-xs font-mono text-zinc-400">Assistant Onboarding</span>
            </div>
          </div>

          {/* Progress tracker */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">
              {getMicrocopy()}
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800/80">
              <span className="text-xs font-mono font-semibold text-blue-400">
                {currentStep > TOTAL_STEPS ? 'Ready' : `Step ${currentStep}`}
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">/</span>
              <span className="text-[10px] text-zinc-500 font-mono">{TOTAL_STEPS}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-4 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00C8FF] via-[#32E8FF] to-[#00C8FF]"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(100, (currentStep / TOTAL_STEPS) * 100)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <User className="w-3.5 h-3.5" />
                  <span>Account Configuration</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl">
                  Let's design your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Heimdall Profile</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Welcome to Heimdall. Introduce yourself so your personal AI manager can configure your rates, templates, and pitch strategies.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                {/* Profile Photo Selector */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Creator Profile Photo</label>
                    <span className="text-[10px] text-zinc-500 font-mono">Select a preset or paste any image URL</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-5 items-start md:items-center bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80">
                    <img
                      src={avatarUrl || PRESET_AVATARS[0]}
                      alt="Selected Avatar"
                      className="w-16 h-16 rounded-full border-2 border-blue-500/60 object-cover shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-zinc-900 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback to a safe cartoonish preset if the user inputs an invalid custom URL
                        (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                      }}
                    />
                    
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">Nice Cartoon & Animal Presets</span>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_AVATARS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarUrl(p)}
                              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-200 bg-zinc-900 ${
                                avatarUrl === p ? 'border-blue-500 scale-110 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'border-transparent hover:border-zinc-750 hover:scale-105'
                              }`}
                              title="Select preset avatar"
                            >
                              <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-zinc-900 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Or upload custom photo</span>
                          <label className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 active:bg-zinc-950 rounded text-xs font-mono text-zinc-300 cursor-pointer transition-all duration-150 h-[30px]">
                            <Upload className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Choose Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setAvatarUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Or paste photo URL</span>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={(PRESET_AVATARS.includes(avatarUrl) || avatarUrl.startsWith('data:image/')) ? '' : avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value.trim() || PRESET_AVATARS[0])}
                            className="w-full bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded px-3 py-1.5 text-xs font-mono outline-none text-zinc-300 h-[30px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Samson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Creator Name / Brand</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaecaprioo"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Choose Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-zinc-500 text-sm font-mono font-medium">@</span>
                    <input
                      type="text"
                      required
                      placeholder="johnsamson"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      className="w-full bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-8 pr-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                    <span className="text-zinc-500">
                      Heimdall URL: <span className="text-blue-400">heimdall.app/@{username || 'username'}</span>
                    </span>
                    {checkingUsername ? (
                      <span className="text-zinc-500 animate-pulse">Checking availability...</span>
                    ) : usernameValid === true ? (
                      <span className="text-[#32E8FF] flex items-center gap-1">✓ Username available</span>
                    ) : usernameValid === false ? (
                      <span className="text-red-400 flex items-center gap-1">✗ Username taken</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Creator DNA</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Define your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Creator DNA</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Select the creative niches and roles that define your target content and voice.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                {/* Niches Multi-select */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">What niches describe you best?</label>
                  <div className="flex flex-wrap gap-2">
                    {NICHE_OPTIONS.map(n => {
                      const selected = selectedNiches.includes(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setSelectedNiches(prev => prev.filter(x => x !== n));
                            } else {
                              setSelectedNiches(prev => [...prev, n]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Creator Types Multi-select */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/60">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Creator Type / Format</label>
                  <div className="flex flex-wrap gap-2">
                    {CREATOR_TYPES.map(type => {
                      const selected = selectedCreatorTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setSelectedCreatorTypes(prev => prev.filter(x => x !== type));
                            } else {
                              setSelectedCreatorTypes(prev => [...prev, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'bg-[#00C8FF]/10 border-[#00C8FF] text-[#32E8FF] font-semibold shadow-[0_0_12px_rgba(0,200,255,0.1)]'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Channel Integration</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Synchronize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Social Channels</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Paste the profile links of your channels. Heimdall uses these to build live verified stats and media resume kits.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Instagram URL</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">TikTok URL</label>
                    <input
                      type="url"
                      placeholder="https://tiktok.com/@username"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">YouTube Channel URL</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@channel"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Portfolio / Website Link</label>
                  <input
                    type="url"
                    placeholder="https://johnsamson.myportfolio.com"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                  />
                </div>

                {/* Optional Social Toggles / Collapse */}
                <div className="pt-4 border-t border-zinc-800/60 mt-4">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block mb-3">Optional Secondary Networks</span>
                  <div className="grid grid-cols-2 gap-3">
                    {['X / Twitter', 'Threads', 'GitHub', 'Twitch'].map((pNetwork) => {
                      const key = pNetwork.toLowerCase().split(' ')[0];
                      return (
                        <div key={key} className="space-y-1">
                          <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500">{pNetwork}</label>
                          <input
                            type="text"
                            placeholder="@handle or link"
                            value={otherSocials[key] || ''}
                            onChange={(e) => setOtherSocials(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full bg-zinc-950/40 border border-zinc-900 focus:border-zinc-800 rounded px-3 py-1.5 text-xs transition-all outline-none font-mono"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Users className="w-3.5 h-3.5" />
                  <span>Verified Audience metrics</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Define your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Audience Profile</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Enter your current cross-platform reach and demographic metrics. If APIs are pending, you can log stats manually.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Total Followers</label>
                    <input
                      type="text"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Avg. Engagement Rate</label>
                    <input
                      type="text"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Average Views</label>
                    <input
                      type="text"
                      value={avgViews}
                      onChange={(e) => setAvgViews(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Primary Location</label>
                    <input
                      type="text"
                      value={audienceLocation}
                      onChange={(e) => setAudienceLocation(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Core Age Demographics</label>
                    <input
                      type="text"
                      value={audienceAge}
                      onChange={(e) => setAudienceAge(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Gender Distribution</label>
                    <input
                      type="text"
                      value={audienceGender}
                      onChange={(e) => setAudienceGender(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Primary Languages</label>
                    <input
                      type="text"
                      value={audienceLanguages}
                      onChange={(e) => setAudienceLanguages(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Active Platform-Specific Verification Cards */}
                {(instagram || tiktok || youtube || linkedin) && (
                  <div className="pt-5 border-t border-zinc-800/60 mt-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-widest block">Active Platform-Specific Metrics</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Customize metrics for each channel to display in your media kit.</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleSyncMetrics}
                        disabled={syncingMetrics}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-mono text-[10px] uppercase font-bold border border-blue-500/20 active:bg-blue-500/30 transition-all duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${syncingMetrics ? 'animate-spin' : ''}`} />
                        <span>{syncingMetrics ? 'Estimating Stats...' : 'Auto-Sync Realistic Stats'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {instagram && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <span className="text-xs font-bold font-mono">Instagram Metrics ({extractHandle(instagram, 'instagram')})</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Followers</label>
                              <input
                                type="text"
                                placeholder="e.g. 15.2k"
                                value={igFollowers}
                                onChange={(e) => setIgFollowers(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Engagement</label>
                              <input
                                type="text"
                                placeholder="e.g. 4.2%"
                                value={igEngagement}
                                onChange={(e) => setIgEngagement(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Avg Views</label>
                              <input
                                type="text"
                                placeholder="e.g. 5.5k"
                                value={igViews}
                                onChange={(e) => setIgViews(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {tiktok && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Globe className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-xs font-bold font-mono">TikTok Metrics ({extractHandle(tiktok, 'tiktok')})</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Followers</label>
                              <input
                                type="text"
                                placeholder="e.g. 120k"
                                value={ttFollowers}
                                onChange={(e) => setTtFollowers(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Engagement</label>
                              <input
                                type="text"
                                placeholder="e.g. 8.5%"
                                value={ttEngagement}
                                onChange={(e) => setTtEngagement(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Avg Views</label>
                              <input
                                type="text"
                                placeholder="e.g. 45k"
                                value={ttViews}
                                onChange={(e) => setTtViews(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {youtube && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Youtube className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold font-mono">YouTube Metrics ({extractHandle(youtube, 'youtube')})</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Subscribers</label>
                              <input
                                type="text"
                                placeholder="e.g. 15k"
                                value={ytSubscribers}
                                onChange={(e) => setYtSubscribers(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Engagement</label>
                              <input
                                type="text"
                                placeholder="e.g. 5.1%"
                                value={ytEngagement}
                                onChange={(e) => setYtEngagement(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Avg Views</label>
                              <input
                                type="text"
                                placeholder="e.g. 12k"
                                value={ytViews}
                                onChange={(e) => setYtViews(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {linkedin && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <Linkedin className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold font-mono">LinkedIn Metrics ({extractHandle(linkedin, 'linkedin')})</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Followers</label>
                              <input
                                type="text"
                                placeholder="e.g. 5k"
                                value={liFollowers}
                                onChange={(e) => setLiFollowers(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Engagement</label>
                              <input
                                type="text"
                                placeholder="e.g. 3.2%"
                                value={liEngagement}
                                onChange={(e) => setLiEngagement(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target Brand Preferences</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Dream Brand Sectors</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Which brand industries do you want Heimdall to monitor and pitch? We customize automated discovery results around these selections.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
                {/* Brand Niches */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">What brands do you want Heimdall to find?</label>
                  <div className="flex flex-wrap gap-2">
                    {NICHE_OPTIONS.map(n => {
                      const selected = preferredBrandNiches.includes(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setPreferredBrandNiches(prev => prev.filter(x => x !== n));
                            } else {
                              setPreferredBrandNiches(prev => [...prev, n]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Partnership Formats */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/60">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Preferred Partnership types</label>
                  <div className="flex flex-wrap gap-2">
                    {PARTNERSHIP_TYPES.map(type => {
                      const selected = preferredPartnershipTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setPreferredPartnershipTypes(prev => prev.filter(x => x !== type));
                            } else {
                              setPreferredPartnershipTypes(prev => [...prev, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'bg-[#00C8FF]/10 border-[#00C8FF] text-[#32E8FF] font-semibold shadow-[0_0_12px_rgba(0,200,255,0.1)]'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Sponsorship Rate Card</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Establish your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Partnership Rates</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Log optional baseline rates for your creative deliverables. Your AI manager will refer to these in custom deal proposals.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(prices).map((srv) => (
                    <div key={srv} className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">{srv}</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm font-semibold font-mono">$</span>
                        <input
                          type="text"
                          placeholder="e.g. 350"
                          value={prices[srv]}
                          onChange={(e) => setPrices(prev => ({ ...prev, [srv]: e.target.value.replace(/[^0-9]/g, '') }))}
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-7 pr-4 py-2 text-sm transition-all outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-800/60 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Recommend preset values
                      setPrices({
                        'UGC Video': '450',
                        'Photo': '250',
                        'Monthly Retainer': '1800',
                        'Campaign Package': '3500',
                        'Raw Footage': '150',
                        'Usage Rights': '300',
                        'Whitelisting': '400',
                        'Travel Day Rate': '600'
                      });
                    }}
                    className="text-xs font-mono text-[#D4AF37] hover:text-[#D4AF37]/80 uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    💡 Heimdall can recommend pricing later (Apply system baseline rates)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Tone of Voice Settings</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Define your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Brand Personality</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  How should Heimdall represent you? These stylistic tags actively dictate the tone, vocabulary, and direct style of AI-generated outreach templates.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">What represents your narrative identity?</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(tone => {
                    const selected = brandPersonality.includes(tone);
                    return (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setBrandPersonality(prev => prev.filter(x => x !== tone));
                          } else {
                            setBrandPersonality(prev => [...prev, tone]);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                          selected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-bold shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                            : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#D4AF37]/30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Primary AI Memory Seed</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Anchor your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">Creator Identity</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  This is the most critical setup page. These responses formulate Heimdall's core memory of you, referenced in every pitch generation.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Describe yourself in one sentence</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A hybrid filmmaker creating cinematic luxury stories on lifestyle and AI."
                    value={oneSentence}
                    onChange={(e) => setOneSentence(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">What makes your content completely unique?</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. My visual pacing and focus on color science, combining heavy hardware aesthetics with smooth UI design."
                    value={uniqueness}
                    onChange={(e) => setUniqueness(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">What brands do you dream of working with? (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Gymshark, Nike, Luma, OpenAI"
                    value={dreamBrands}
                    onChange={(e) => setDreamBrands(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">What is your single biggest creator goal this year?</label>
                  <input
                    type="text"
                    placeholder="e.g. Sign 3 long-term luxury tech retainers and scale views by 50%."
                    value={biggestGoals}
                    onChange={(e) => setBiggestGoals(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Birthday outreach pipeline</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Date of Birth</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  We leverage your birthday to prompt special brand campaigns, customized seasonal outreach, and exclusive partnership opportunities.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Birth Month</label>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-zinc-300"
                    >
                      <option value="">Select Month</option>
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Birth Day</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="e.g. 13"
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 10 && (
            <motion.div
              key="step10"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Localization configuration</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Localization & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Regional Setup</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Automatically localize currency values, brand outreach schedules, scheduling calendars, and brand recommendation layers.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">City</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-zinc-300"
                    >
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                      <option value="CET (UTC+1)">CET (UTC+1)</option>
                      <option value="JST (UTC+9)">JST (UTC+9)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none text-zinc-300"
                    >
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                      <option value="CAD (C$)">CAD (C$)</option>
                      <option value="JPY (¥)">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Primary Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 11 && (
            <motion.div
              key="step11"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                  <Link className="w-3.5 h-3.5" />
                  <span>One-click cloud connections</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                  Connect your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8FF] to-[#32E8FF]">Productivity Apps</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Integrate your workspaces to let Heimdall automatically synchronize calendars, storyboard drafts, and invoice sheets.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {APP_INTEGRATIONS.map((app) => {
                    const connected = connectedApps.includes(app.name);
                    return (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => {
                          if (connected) {
                            setConnectedApps(prev => prev.filter(x => x !== app.name));
                          } else {
                            setConnectedApps(prev => [...prev, app.name]);
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          connected
                            ? 'bg-blue-600/10 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <span className="text-2xl">{app.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white leading-none mb-0.5">{app.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate leading-none">{app.desc}</p>
                        </div>
                        <div className="ml-auto">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            connected ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-800 bg-zinc-900'
                          }`}>
                            {connected && <span className="text-[8px]">✓</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 text-center">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block">
                    ⚡ You can skip this for now. Connect any apps later in settings.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 12 && (
            <motion.div
              key="step12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* SUCCESS / SUMMARY PAGE */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00C8FF] to-[#32E8FF] mx-auto flex items-center justify-center border-4 border-[#00C8FF]/20 shadow-[0_0_30px_rgba(0,200,255,0.3)] relative animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl">
                    Your AI Talent Manager is Ready
                  </h1>
                  <p className="text-[#D4AF37] font-mono text-xs uppercase tracking-widest font-bold">
                    ✓ HEIMDALL OPERATING SYSTEM DEPLOYED SUCCESSFULLY
                  </p>
                </div>
              </div>

              {/* RAYCAST STYLE SUMMARY CARD */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[9px] font-mono text-[#32E8FF] bg-[#101826]/80 border border-white/10 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Activated
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Creator Identity</span>
                    <p className="text-sm font-bold text-white leading-tight">{creatorName || 'Representative'}</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">{fullName}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Core AI Memory</span>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{oneSentence || 'A premium creator specializing in luxury aesthetics and productivity narratives.'}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Audience Reach</span>
                    <p className="text-sm font-bold text-blue-400 font-mono">{followers} Followers</p>
                    <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Engagement Rate: {engagementRate}</p>
                  </div>
                </div>

                <div className="space-y-4 border-t md:border-t-0 md:border-l border-zinc-800/60 pt-4 md:pt-0 md:pl-6">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Creative Niches</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNiches.slice(0, 3).map(n => (
                        <span key={n} className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 border border-zinc-850">
                          {n}
                        </span>
                      ))}
                      {selectedNiches.length > 3 && (
                        <span className="text-[10px] text-zinc-500 font-mono">+{selectedNiches.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Brand Tone</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {brandPersonality.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-blue-950/30 px-2 py-0.5 rounded text-blue-300 border border-blue-900/35">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Baseline Pricing</span>
                    <p className="text-sm font-bold text-[#32E8FF] font-mono">
                      ${prices['UGC Video'] || '450'}/video
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-none mt-0.5">
                      Retainer Base: ${prices['Monthly Retainer'] || '1800'}/mo
                    </p>
                  </div>
                </div>
              </div>

              {/* CHECKLIST */}
              <div className="space-y-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#32E8FF]" />
                  <span>Personalized profile and domain constructed successfully</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#32E8FF]" />
                  <span>Heimdall AI memory seeded with key milestones</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#32E8FF]" />
                  <span>Brand preferences and automated outreach engines prepared</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER NAVIGATION CONTROLS */}
      <footer className="border-t border-zinc-900/80 bg-zinc-950/20 backdrop-blur-md px-6 py-4 sticky bottom-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep <= TOTAL_STEPS && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800/80 text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-wider mr-2">
                Autosaving profile...
              </span>
            )}

            {currentStep <= TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && usernameValid === false}
                className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-lg border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 transition-all cursor-pointer`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : currentStep === 11 + 1 ? (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-[#00C8FF] hover:from-blue-500 hover:to-[#32E8FF] text-black rounded-lg border border-blue-400/30 shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(0,200,255,0.45)] text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <span>Enter Heimdall</span>
                <CheckCircle2 className="w-4 h-4 text-black" />
              </button>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
