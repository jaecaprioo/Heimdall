import React, { useState } from 'react';
import { ThemeId, ThemeOption } from '../types';
import { Palette, Check, Sparkles, X, Sun, Moon, Flame, Zap, Sliders } from 'lucide-react';

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'pearl-mist',
    name: 'Pearl Mist',
    subtitle: 'Spatial Frosted Glass',
    sourceImageRef: 'IMG_1225',
    mode: 'light',
    previewColors: ['#EEF3F2', '#FFFFFF', '#0D9488'],
    description: 'Minimalist frosted mist, water-droplet serenity & Apple VisionOS glassmorphism.'
  },
  {
    id: 'amber-hearth',
    name: 'Amber Hearth',
    subtitle: 'Warm Sunset Luxe',
    sourceImageRef: 'IMG_1226',
    mode: 'dark',
    previewColors: ['#16110B', '#F59E0B', '#EA580C'],
    description: 'Smoked caramel glass, glowing filament warmth & cozy architectural living.'
  },
  {
    id: 'aurora-sage',
    name: 'Aurora Sage',
    subtitle: 'Bioluminescent Vitality',
    sourceImageRef: 'IMG_1227',
    mode: 'dark',
    previewColors: ['#071715', '#2DD4BF', '#FB7185'],
    description: 'Ethereal spruce & mint mist with luminous coral and neural vital flow.'
  },
  {
    id: 'obsidian-void',
    name: 'Obsidian Void',
    subtitle: 'Quantix Onyx Terminal',
    sourceImageRef: 'IMG_1228',
    mode: 'dark',
    previewColors: ['#07080C', '#1E293B', '#38BDF8'],
    description: 'Deep pitch-black obsidian glass, diamond white clarity & financial precision.'
  },
  {
    id: 'cyber-slate',
    name: 'Cyber Slate',
    subtitle: 'Matte Studio Hardware',
    sourceImageRef: 'IMG_1229',
    mode: 'dark',
    previewColors: ['#12151C', '#22D3EE', '#A855F7'],
    description: 'Velvety matte slate panels, neon soundwaves & tactile synthesizer depth.'
  }
];

interface ThemeSwitcherProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  compact?: boolean;
}

export default function ThemeSwitcher({ currentTheme, onSelectTheme, compact = false }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'pearl-mist':
        return <Sun className="w-3.5 h-3.5 text-teal-600" />;
      case 'amber-hearth':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'aurora-sage':
        return <Sparkles className="w-3.5 h-3.5 text-teal-400" />;
      case 'obsidian-void':
        return <Moon className="w-3.5 h-3.5 text-sky-400" />;
      case 'cyber-slate':
        return <Sliders className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      {compact ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-zinc-200/80 bg-white/80 hover:bg-white text-zinc-800 transition-all text-xs font-bold shadow-xs cursor-pointer"
          title="Switch Visual Atmosphere"
        >
          <div className="flex items-center gap-2">
            {getThemeIcon(currentTheme)}
            <span className="truncate">{activeOption.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {activeOption.previewColors.map((color, idx) => (
              <span 
                key={idx} 
                className="w-2.5 h-2.5 rounded-full border border-black/10" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-300/80 bg-white/90 hover:bg-white text-zinc-800 text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer"
          title="Visual Theme Moodboard"
        >
          <div className="flex items-center gap-1.5">
            {getThemeIcon(currentTheme)}
            <span className="font-extrabold text-zinc-900">{activeOption.name}</span>
          </div>
          <div className="flex items-center -space-x-1 pl-1">
            {activeOption.previewColors.map((color, idx) => (
              <span 
                key={idx} 
                className="w-3 h-3 rounded-full border border-white/80 shadow-xs" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
        </button>
      )}

      {/* Popover / Modal Palette Selector */}
      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />
          <div className="fixed md:absolute top-1/2 md:top-full left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-2 z-50 w-[90vw] md:w-96 rounded-3xl bg-white/95 backdrop-blur-2xl border border-zinc-200/90 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-zinc-900 font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-950 font-display">Atmosphere & Mood</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">5 Visual Themes from Reference Moodboards</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Options Grid */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = theme.id === currentTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-500 shadow-sm'
                        : 'bg-zinc-50/80 hover:bg-zinc-100/90 border-zinc-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Swatch Circle */}
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {theme.previewColors.map((col, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-zinc-950 font-display">{theme.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 font-bold uppercase">
                            {theme.sourceImageRef}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate leading-tight font-medium">
                          {theme.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-zinc-300 bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Information */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Saved locally to your device</span>
              <span className="font-bold text-teal-800">Dynamic Glass OS</span>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
