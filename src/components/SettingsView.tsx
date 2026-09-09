import React, { useState } from 'react';
import { CreatorProfile, ThemeId } from '../types';
import { THEME_OPTIONS } from './ThemeSwitcher';
import { 
  Save, 
  Settings, 
  Briefcase, 
  Lock, 
  Compass, 
  Palette, 
  Check, 
  Sparkles,
  Sun,
  Flame,
  Moon,
  Sliders
} from 'lucide-react';

interface SettingsViewProps {
  creatorProfile: CreatorProfile;
  onSaveProfile: (profile: CreatorProfile) => void;
  userEmail: string;
  currentTheme?: ThemeId;
  onSelectTheme?: (themeId: ThemeId) => void;
}

export default function SettingsView({ 
  creatorProfile, 
  onSaveProfile, 
  userEmail,
  currentTheme = 'pearl-mist',
  onSelectTheme
}: SettingsViewProps) {
  const [fullName, setFullName] = useState(creatorProfile.fullName || '');
  const [creatorName, setCreatorName] = useState(creatorProfile.creatorName || '');
  const [bio, setBio] = useState(creatorProfile.bio || '');
  const [country, setCountry] = useState(creatorProfile.country || 'United States');
  const [portfolioUrl, setPortfolioUrl] = useState(creatorProfile.portfolioUrl || '');
  
  // Social links
  const [instagramUrl, setInstagramUrl] = useState(creatorProfile.instagramUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(creatorProfile.tiktokUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(creatorProfile.youtubeUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(creatorProfile.linkedinUrl || '');

  // Platform-specific metrics in settings
  const [instagramFollowers, setInstagramFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.followers || '');
  const [instagramEngagement, setInstagramEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.engagement || '');
  const [instagramViews, setInstagramViews] = useState(creatorProfile.followersCount?.platform_metrics?.instagram?.avgViews || '');

  const [tiktokFollowers, setTiktokFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.followers || '');
  const [tiktokEngagement, setTiktokEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.engagement || '');
  const [tiktokViews, setTiktokViews] = useState(creatorProfile.followersCount?.platform_metrics?.tiktok?.avgViews || '');

  const [youtubeSubscribers, setYoutubeSubscribers] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.subscribers || '');
  const [youtubeEngagement, setYoutubeEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.engagement || '');
  const [youtubeViews, setYoutubeViews] = useState(creatorProfile.followersCount?.platform_metrics?.youtube?.avgViews || '');

  const [linkedinFollowers, setLinkedinFollowers] = useState(creatorProfile.followersCount?.platform_metrics?.linkedin?.followers || '');
  const [linkedinEngagement, setLinkedinEngagement] = useState(creatorProfile.followersCount?.platform_metrics?.linkedin?.engagement || '');

  // Niches
  const [niches, setNiches] = useState<string[]>(creatorProfile.niches || ['Lifestyle', 'Tech']);
  const [newNicheInput, setNewNicheInput] = useState('');

  // Services & Base Pricing
  const [services, setServices] = useState<string[]>(creatorProfile.services || ['UGC Video', 'Instagram Reel']);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [basePricing, setBasePricing] = useState<{ [key: string]: number }>(
    creatorProfile.basePricing || { 'UGC Video': 350, 'Instagram Reel': 300 }
  );

  // Password / User info state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState({
    deals: true,
    recommendations: true,
    system: false
  });

  const handleAddNiche = () => {
    if (newNicheInput.trim() && !niches.includes(newNicheInput.trim())) {
      setNiches(prev => [...prev, newNicheInput.trim()]);
      setNewNicheInput('');
    }
  };

  const handleRemoveNiche = (nicheToRemove: string) => {
    setNiches(prev => prev.filter(n => n !== nicheToRemove));
  };

  const handleAddService = () => {
    if (newServiceInput.trim() && !services.includes(newServiceInput.trim())) {
      setServices(prev => [...prev, newServiceInput.trim()]);
      setBasePricing(prev => ({ ...prev, [newServiceInput.trim()]: 250 }));
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(prev => prev.filter(s => s !== serviceToRemove));
    setBasePricing(prev => {
      const copy = { ...prev };
      delete copy[serviceToRemove];
      return copy;
    });
  };

  const handlePricingChange = (service: string, value: number) => {
    setBasePricing(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: CreatorProfile = {
      userId: creatorProfile.userId,
      fullName,
      creatorName,
      bio,
      country,
      niches,
      services,
      basePricing,
      portfolioUrl,
      instagramUrl,
      tiktokUrl,
      youtubeUrl,
      linkedinUrl,
      followersCount: {
        ...(creatorProfile.followersCount || {}),
        platform_metrics: {
          instagram: { followers: instagramFollowers, engagement: instagramEngagement, avgViews: instagramViews },
          tiktok: { followers: tiktokFollowers, engagement: tiktokEngagement, avgViews: tiktokViews },
          youtube: { subscribers: youtubeSubscribers, engagement: youtubeEngagement, avgViews: youtubeViews },
          linkedin: { followers: linkedinFollowers, engagement: linkedinEngagement }
        }
      }
    };

    onSaveProfile(updatedProfile);
    alert('Creator Profile and partnership parameters synchronized successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPwdMessage('Passwords do not match.');
      return;
    }
    setPwdMessage('Security key credentials updated successfully.');
    setPassword('');
    setConfirmPassword('');
  };

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'pearl-mist':
        return <Sun className="w-4 h-4 text-teal-600" />;
      case 'amber-hearth':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'aurora-sage':
        return <Sparkles className="w-4 h-4 text-teal-400" />;
      case 'obsidian-void':
        return <Moon className="w-4 h-4 text-sky-400" />;
      case 'cyber-slate':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div id="settings-view" className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-16 font-sans">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4 text-teal-700" />
            <span>Workspace & System Calibration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 font-display">
            Settings & Atmosphere
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 font-medium mt-1">
            Customize visual theme modes, creator profile identity, baseline service pricing, and notification rules.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: VISUAL THEME MODES (FROM 5 REFERENCE MOODBOARDS) */}
      {/* ========================================================= */}
      <div className="rounded-[28px] glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-950 font-display">Atmosphere & Visual Theme</h2>
              <p className="text-xs text-zinc-600 font-medium">5 bespoke visual modes crafted from reference moodboards</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            Active: {THEME_OPTIONS.find(t => t.id === currentTheme)?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme && onSelectTheme(theme.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-600 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white/80 hover:bg-white border-zinc-200/80 hover:border-zinc-300 shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Top: Icon + Ref badge */}
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                    {getThemeIcon(theme.id)}
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-extrabold">
                    {theme.sourceImageRef}
                  </span>
                </div>

                {/* Theme Name & Subtitle */}
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-950 font-display flex items-center gap-1.5">
                    <span>{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-700 stroke-[3]" />}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-semibold line-clamp-1 mt-0.5">
                    {theme.subtitle}
                  </p>
                </div>

                {/* Color swatches preview strip */}
                <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5">
                  {theme.previewColors.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] text-zinc-500 font-bold uppercase ml-auto">
                    {theme.mode}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 cols: Main Creator Profile form */}
        <form onSubmit={handleSaveAll} className="lg:col-span-2 space-y-8 glass-panel p-8 rounded-[28px]">
          <h3 className="font-extrabold text-zinc-950 text-sm uppercase tracking-wider font-display pb-4 border-b border-zinc-200/80 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-700" />
            <span>Talent Profile Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="block text-zinc-700 text-xs font-extrabold">Full Name</label>
              <input
                id="settings-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 text-xs font-extrabold">Creator Display Handle / Name</label>
              <input
                id="settings-creatorname"
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 text-xs font-extrabold">Country of Residence</label>
              <input
                id="settings-country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-700 text-xs font-extrabold">Portfolio Website / Case Studies Link</label>
              <input
                id="settings-porturl"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block text-zinc-700 text-xs font-extrabold">Creator Biography (Core AI Context) *</label>
            <textarea
              id="settings-bio"
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brands about your target audience demographics, visual aesthetics, and commercial specialties..."
              className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white resize-none leading-relaxed"
            />
          </div>

          {/* Niches */}
          <div className="space-y-3 pt-4 border-t border-zinc-200/80">
            <label className="block text-zinc-700 text-xs font-extrabold">Your Content Niches (Used for AI Matchmaking)</label>
            <div className="flex gap-2">
              <input
                id="settings-niche-input"
                type="text"
                placeholder="e.g. Wellness, Fitness, Tech Setup"
                value={newNicheInput}
                onChange={(e) => setNewNicheInput(e.target.value)}
                className="flex-1 bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
              <button
                type="button"
                id="add-niche-btn"
                onClick={handleAddNiche}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-bold uppercase cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {niches.map((niche) => (
                <span key={niche} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs text-teal-800 font-bold">
                  <span>{niche}</span>
                  <button type="button" onClick={() => handleRemoveNiche(niche)} className="text-teal-800 font-extrabold ml-1 hover:text-red-500 cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4 pt-4 border-t border-zinc-200/80">
            <label className="block text-zinc-700 text-xs font-extrabold">Sponsorship Deliverables & Baseline Rates</label>
            
            <div className="flex gap-2">
              <input
                id="settings-service-input"
                type="text"
                placeholder="e.g. Dedicated YouTube Video"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                className="flex-1 bg-zinc-50/80 border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-900 font-medium outline-none focus:border-teal-600 focus:bg-white"
              />
              <button
                type="button"
                id="add-service-btn"
                onClick={handleAddService}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-xs text-zinc-800 font-bold uppercase cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-2.5 mt-3 text-xs text-zinc-700">
              {services.map((svc) => (
                <div key={svc} className="flex items-center justify-between p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => handleRemoveService(svc)} className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">🗑️</button>
                    <span className="font-bold text-zinc-900">{svc}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500 font-bold">$</span>
                    <input
                      type="number"
                      value={basePricing[svc] || 250}
                      onChange={(e) => handlePricingChange(svc, Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-950 font-bold text-xs text-right focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-5 border-t border-zinc-200/80">
            <button
              id="save-profile-btn"
              type="submit"
              className="teal-pill-button px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

        </form>

        {/* Right 1 column: Account Management, Password Reset & Preferences */}
        <div className="space-y-6">
          
          {/* Account credentials card */}
          <div className="glass-panel p-6 rounded-[28px] space-y-4">
            <h4 className="font-extrabold text-zinc-950 text-xs uppercase tracking-wider font-display flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-700" />
              <span>Security Hub</span>
            </h4>
            
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block tracking-wider">Logged In As:</span>
              <p className="text-zinc-900 font-semibold p-2.5 bg-zinc-50/80 rounded-xl border border-zinc-200 text-xs truncate">{userEmail}</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3 pt-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block tracking-wider">Update Secret Key:</span>
              
              {pwdMessage && (
                <p className="p-2.5 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 leading-relaxed">{pwdMessage}</p>
              )}

              <div>
                <input
                  type="password"
                  required
                  placeholder="New Secret Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Secret Key"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <button
                id="update-pwd-btn"
                type="submit"
                className="w-full py-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-800 transition-all cursor-pointer shadow-xs"
              >
                Reset Security Key
              </button>
            </form>
          </div>

          {/* Preferences card */}
          <div className="glass-panel p-6 rounded-[28px] space-y-4">
            <h4 className="font-extrabold text-zinc-950 text-xs uppercase tracking-wider font-display flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Platform Rules</span>
            </h4>
            
            <div className="space-y-4 text-xs text-zinc-600">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-extrabold text-zinc-900 text-xs">CRM Notifications</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Alert me when milestone followups are due.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.deals}
                  onChange={(e) => setNotifPreferences(prev => ({ ...prev, deals: e.target.checked }))}
                  className="accent-teal-700 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center border-t border-zinc-200/80 pt-3">
                <div>
                  <h5 className="font-extrabold text-zinc-900 text-xs">Autonomous Discovery</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Let Heimdall match new sponsors daily.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.recommendations}
                  onChange={(e) => setNotifPreferences(prev => ({ ...prev, recommendations: e.target.checked }))}
                  className="accent-teal-700 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="border-t border-zinc-200/80 pt-4 flex flex-col gap-2">
                <h5 className="font-extrabold text-zinc-900 text-xs">Onboarding Wizard</h5>
                <p className="text-[11px] text-zinc-500">Reset and replay the customized Heimdall onboarding experience.</p>
                <button
                  type="button"
                  id="replay-onboarding-btn"
                  onClick={() => {
                    if (confirm('Replay the onboarding setup? Your profile data will be preserved but you can configure it step-by-step again.')) {
                      onSaveProfile({
                        ...creatorProfile,
                        followersCount: {
                          ...(creatorProfile.followersCount || {}),
                          onboarded: false
                        }
                      });
                    }
                  }}
                  className="w-full mt-1 py-2 bg-white hover:bg-zinc-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer shadow-xs"
                >
                  Replay Onboarding Setup
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
