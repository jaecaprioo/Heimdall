import React, { useState } from 'react';
import { CreatorProfile } from '../types';
import { 
  Shield, 
  Save, 
  Key, 
  Globe, 
  Plus, 
  Trash, 
  Check, 
  AlertCircle,
  Instagram,
  Settings,
  Activity,
  DollarSign,
  Briefcase,
  Zap,
  Lock,
  Compass
} from 'lucide-react';

interface SettingsViewProps {
  creatorProfile: CreatorProfile;
  onSaveProfile: (profile: CreatorProfile) => void;
  userEmail: string;
}

export default function SettingsView({ creatorProfile, onSaveProfile, userEmail }: SettingsViewProps) {
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
    alert('Creator Profile and partnership rules synchronized successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPwdMessage('Passwords do not match.');
      return;
    }
    setPwdMessage('Password successfully updated via secure credentials tunnel!');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div id="settings-view" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-[#00C8FF]" />
            <span className="text-[10px] font-mono text-[#32E8FF] uppercase tracking-widest font-semibold">Command Matrix Calibration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-sans">
            System & Profile Settings
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl font-light">
            Synchronize your brand representative identity, social media statistical nodes, baseline pricing rules, and security credentials.
          </p>
        </div>
      </div>

      {/* Main Form Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 cols: Main Creator Profile form */}
        <form onSubmit={handleSaveAll} className="lg:col-span-2 space-y-8 glass-card p-8 rounded-[28px]">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono pb-4 border-b border-white/10 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#00C8FF]" />
            <span>Partner Profile Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-light">
            <div className="space-y-1">
              <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Full Name</label>
              <input
                id="settings-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Creator Brand Name</label>
              <input
                id="settings-creatorname"
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Country of Residence</label>
              <input
                id="settings-country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Portfolio Website / Link</label>
              <input
                id="settings-porturl"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Creator Biography (Core AI Context) *</label>
            <textarea
              id="settings-bio"
              required
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brands about your focus, audience demographics, visual aesthetics, and why you bring immense value..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF] resize-none leading-relaxed font-light"
            />
          </div>

          {/* Social connections links */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <span className="text-zinc-400 font-mono text-[9px] uppercase font-bold block tracking-widest">Connected Channels & Media Stats</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <label className="block text-zinc-400 text-[10px] uppercase font-bold font-mono tracking-wider">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 text-[10px] uppercase font-bold font-mono tracking-wider">TikTok URL</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 text-[10px] uppercase font-bold font-mono tracking-wider">YouTube Channel URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 text-[10px] uppercase font-bold font-mono tracking-wider">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>
            </div>

            {/* Platform Metrics Edit Fields */}
            {(instagramUrl || tiktokUrl || youtubeUrl || linkedinUrl) && (
              <div className="p-5 rounded-[20px] bg-black/40 border border-white/10 space-y-4">
                <span className="text-zinc-400 font-mono text-[9px] uppercase font-bold block tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#32E8FF] animate-pulse" />
                  <span>Media Kit Metrics Tuning Node</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {instagramUrl && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <span className="text-[10px] text-pink-500 font-mono font-bold uppercase block">Instagram Stats</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Followers</label>
                          <input
                            type="text"
                            value={instagramFollowers}
                            onChange={(e) => setInstagramFollowers(e.target.value)}
                            placeholder="18k"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">ER %</label>
                          <input
                            type="text"
                            value={instagramEngagement}
                            onChange={(e) => setInstagramEngagement(e.target.value)}
                            placeholder="4.2%"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Avg Views</label>
                          <input
                            type="text"
                            value={instagramViews}
                            onChange={(e) => setInstagramViews(e.target.value)}
                            placeholder="8k"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {tiktokUrl && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <span className="text-[10px] text-[#32E8FF] font-mono font-bold uppercase block">TikTok Stats</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Followers</label>
                          <input
                            type="text"
                            value={tiktokFollowers}
                            onChange={(e) => setTiktokFollowers(e.target.value)}
                            placeholder="85k"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">ER %</label>
                          <input
                            type="text"
                            value={tiktokEngagement}
                            onChange={(e) => setTiktokEngagement(e.target.value)}
                            placeholder="7.2%"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Avg Views</label>
                          <input
                            type="text"
                            value={tiktokViews}
                            onChange={(e) => setTiktokViews(e.target.value)}
                            placeholder="45k"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {youtubeUrl && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <span className="text-[10px] text-red-500 font-mono font-bold uppercase block">YouTube Stats</span>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Subs</label>
                          <input
                            type="text"
                            value={youtubeSubscribers}
                            onChange={(e) => setYoutubeSubscribers(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">ER %</label>
                          <input
                            type="text"
                            value={youtubeEngagement}
                            onChange={(e) => setYoutubeEngagement(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Avg Views</label>
                          <input
                            type="text"
                            value={youtubeViews}
                            onChange={(e) => setYoutubeViews(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {linkedinUrl && (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block">LinkedIn Stats</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">Followers</label>
                          <input
                            type="text"
                            value={linkedinFollowers}
                            onChange={(e) => setLinkedinFollowers(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-mono uppercase">ER %</label>
                          <input
                            type="text"
                            value={linkedinEngagement}
                            onChange={(e) => setLinkedinEngagement(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-2 py-1 text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Niches Builder */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Your Content Niches (Used for AI Matchmaking)</label>
            <div className="flex gap-2">
              <input
                id="settings-niche-input"
                type="text"
                placeholder="e.g. Wellness, Fitness, Tech Setup"
                value={newNicheInput}
                onChange={(e) => setNewNicheInput(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
              <button
                type="button"
                id="add-niche-btn"
                onClick={handleAddNiche}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs text-white font-mono font-bold uppercase cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {niches.map((niche) => (
                <span key={niche} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C8FF]/10 border border-[#00C8FF]/20 text-xs text-[#00C8FF] font-mono uppercase">
                  <span>{niche}</span>
                  <button type="button" onClick={() => handleRemoveNiche(niche)} className="text-[#00C8FF] font-bold ml-1 hover:text-red-400 font-mono text-xs cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="block text-zinc-400 text-[9px] uppercase font-mono tracking-wider font-bold">Sponsorship Deliverables & baseline fees</label>
            
            <div className="flex gap-2">
              <input
                id="settings-service-input"
                type="text"
                placeholder="e.g. Dedicated YouTube Video"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF] font-mono"
              />
              <button
                type="button"
                id="add-service-btn"
                onClick={handleAddService}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs text-white font-mono font-bold uppercase cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-3 mt-3 font-mono text-xs text-zinc-300">
              {services.map((svc) => (
                <div key={svc} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => handleRemoveService(svc)} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">🗑️</button>
                    <span className="text-xs">{svc}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-600">$</span>
                    <input
                      type="number"
                      value={basePricing[svc] || 250}
                      onChange={(e) => handlePricingChange(svc, Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-xs text-right focus:outline-none focus:border-[#00C8FF]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-5 border-t border-white/5">
            <button
              id="save-profile-btn"
              type="submit"
              className="px-6 py-3 btn-emerald text-black shadow-lg shadow-[#00C8FF]/10 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all font-mono cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Calibration Profile</span>
            </button>
          </div>

        </form>

        {/* Right 1 column: Account Management, Password Reset & Preferences */}
        <div className="space-y-6">
          
          {/* Account credentials card */}
          <div className="glass-card p-6 rounded-[28px] space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#32E8FF]" />
              <span>Security Hub</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <span className="text-[9px] text-zinc-500 uppercase font-mono block tracking-widest font-bold">Logged In As:</span>
              <p className="text-white font-mono p-3 bg-black/40 rounded-xl border border-white/10 text-xs truncate">{userEmail}</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
              <span className="text-[9px] text-zinc-500 uppercase font-mono block tracking-widest font-bold">Update security key:</span>
              
              {pwdMessage && (
                <p className="p-3 bg-white/5 text-[#00C8FF] rounded-xl text-[10px] font-mono border border-[#00C8FF]/20 leading-relaxed">{pwdMessage}</p>
              )}

              <div>
                <input
                  type="password"
                  required
                  placeholder="New Secret Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Secret Key"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                />
              </div>

              <button
                id="update-pwd-btn"
                type="submit"
                className="w-full py-2.5 bg-white/5 hover:bg-[#00C8FF]/10 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase font-mono tracking-wider transition-all cursor-pointer"
              >
                Reset Security Key
              </button>
            </form>
          </div>

          {/* Preferences card */}
          <div className="glass-card p-6 rounded-[28px] space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#00C8FF]" />
              <span>Platform Rules</span>
            </h4>
            
            <div className="space-y-4 text-xs text-zinc-400 font-light">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-semibold text-white text-xs">CRM Notifications</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Alert me when followups are due.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.deals}
                  onChange={(e) => setNotifPreferences(prev => ({ ...prev, deals: e.target.checked }))}
                  className="accent-[#00C8FF] cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <div>
                  <h5 className="font-semibold text-white text-xs">Autonomous Discovery</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Let Heimdall match new sponsors daily.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPreferences.recommendations}
                  onChange={(e) => setNotifPreferences(prev => ({ ...prev, recommendations: e.target.checked }))}
                  className="accent-[#00C8FF] cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <div>
                  <h5 className="font-semibold text-white text-xs">Aesthetic Darkmode</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Lock system look to premium monochrome.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#00C8FF] text-[9px] font-mono uppercase font-bold">ACTIVE</span>
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                <h5 className="font-semibold text-white text-xs">Onboarding Wizard</h5>
                <p className="text-[10px] text-zinc-500">Reset and replay the customized Heimdall onboarding experience.</p>
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
                  className="w-full mt-1 py-2 bg-[#00C8FF]/10 hover:bg-[#00C8FF]/20 text-[#00C8FF] border border-[#00C8FF]/25 hover:border-[#00C8FF]/40 rounded-xl text-[10px] font-bold uppercase tracking-wider font-mono transition-all text-center cursor-pointer"
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
