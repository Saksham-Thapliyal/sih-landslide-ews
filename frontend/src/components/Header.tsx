import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  User, 
  Contrast, 
  Moon, 
  Sun, 
  ShieldAlert, 
  Satellite, 
  Radio, 
  Globe, 
  Activity,
  Home,
  Map,
  AlertTriangle,
  Send,
  BookOpen,
  Mountain,
  Menu,
  X,
  ChevronDown,
  Check,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { Logo } from './Logo';
import { DISTRICTS_DATA } from '../data/districtStore';

export interface HeaderProps {
  onSearchClick: () => void;
  onAiAssistantClick: () => void;
  onNavigateHome: () => void;
  onNavigateMap: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  fontSizeLevel: number;
  onChangeFontSize: (delta: number) => void;
  activeView: string;
  onNavigate: (view: string, districtId?: string) => void;
  selectedDistrictId?: string;
  onSelectDistrict?: (id: string) => void;
}

export function Header({
  onSearchClick,
  onAiAssistantClick,
  onNavigateHome,
  onNavigateMap,
  language,
  onToggleLanguage,
  highContrast,
  onToggleHighContrast,
  darkMode,
  onToggleDarkMode,
  fontSizeLevel,
  onChangeFontSize,
  activeView,
  onNavigate,
  selectedDistrictId = 'east-khasi-hills',
  onSelectDistrict,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchClick]);

  const navItems = [
    {
      id: 'home',
      label: 'Home Portal',
      labelHi: 'मुख्य पोर्टल',
      icon: Home,
      description: 'National overview and critical risk feeds',
    },
    {
      id: 'map',
      label: 'GIS Risk Map',
      labelHi: 'जीआईएस रिस्क मैप',
      icon: Map,
      description: 'Real-time hazard zones & sensor telemetry',
    },
    {
      id: 'analytics',
      label: 'Telemetry & Trends',
      labelHi: 'टेलीमेट्री और रुझान',
      icon: Activity,
      description: 'Rainfall, soil moisture & risk trends',
    },
    {
      id: 'warnings',
      label: 'Active Warnings',
      labelHi: 'सक्रिय चेतावनियां',
      icon: AlertTriangle,
      badge: '3',
      badgeColor: 'bg-red-600 text-white animate-pulse',
      description: 'CAP 1.2 early warning bulletin alerts',
    },
    {
      id: 'district',
      label: 'District Dossier',
      labelHi: 'जिला विवरण',
      icon: Mountain,
      description: 'Slope stability & geotechnical breakdown',
    },
    {
      id: 'report',
      label: 'Ground Report',
      labelHi: 'ग्राउंड रिपोर्ट',
      icon: Send,
      description: 'Citizen & surveyor field observation',
    },
    {
      id: 'protocols',
      label: 'NDMA Protocols',
      labelHi: 'एनडीएमए प्रोटोकॉल',
      icon: ShieldAlert,
      description: 'Safety protocols and response guidance',
    },
    {
      id: 'guidelines',
      label: 'Safety Guidelines',
      labelHi: 'सुरक्षा दिशानिर्देश',
      icon: BookOpen,
      description: 'Community safety Do’s and Don’ts',
    },
  ];

  const currentDistrict = DISTRICTS_DATA[selectedDistrictId] || DISTRICTS_DATA['east-khasi-hills'];

  const handleNavClick = (viewId: string) => {
    setIsMobileMenuOpen(false);
    if (viewId === 'district') {
      onNavigate('district', selectedDistrictId);
    } else {
      onNavigate(viewId);
    }
  };

  const handleDistrictChange = (distId: string) => {
    setIsDistrictDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectDistrict) {
      onSelectDistrict(distId);
    }
    onNavigate('district', distId);
  };

  return (
    <header className="w-full select-none z-40 shadow-xs">
      {/* 1. Top Civic Utility Bar (#0c231c) */}
      <div className="bg-[#0c231c] text-emerald-100 text-xs py-1.5 px-4 sm:px-6 border-b border-emerald-900/60 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: National portal identifier */}
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold tracking-wider uppercase text-[11px] text-emerald-300">
              {isHindi ? 'भूमिरक्षक जोखिम बुद्धिमत्ता' : 'BHOOMI RAKSHAK RISK INTELLIGENCE'}
            </span>
            <span className="text-emerald-600 hidden sm:inline">|</span>
            <span className="text-emerald-200/90 text-[11px] hidden sm:inline">
              {isHindi ? 'भू-जोखिम पूर्व चेतावनी नेटवर्क' : 'Geohazard Early Warning Network'}
            </span>
          </div>

          {/* Right: Accessibility, Contrast, Dark Mode, Language */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            {/* Font size adjustments */}
            <div className="flex items-center bg-[#071914] rounded px-1.5 py-0.5 border border-emerald-800/60 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeFontSize(-1)}
                title="Decrease font size"
                className={`px-1 py-0.5 hover:text-white transition-colors ${fontSizeLevel === -1 ? 'text-emerald-300 font-bold' : 'text-emerald-400'}`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize(0)}
                title="Standard font size"
                className={`px-1 py-0.5 hover:text-white transition-colors ${fontSizeLevel === 0 ? 'text-emerald-300 font-bold' : 'text-emerald-400'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize(1)}
                title="Increase font size"
                className={`px-1 py-0.5 hover:text-white transition-colors ${fontSizeLevel === 1 ? 'text-emerald-300 font-bold' : 'text-emerald-400'}`}
              >
                A+
              </button>
            </div>

            {/* Contrast toggle */}
            <button
              type="button"
              onClick={onToggleHighContrast}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                highContrast ? 'bg-amber-400 text-black font-bold shadow-sm' : 'text-emerald-300 hover:bg-emerald-900/60'
              }`}
              title="Toggle High Contrast"
            >
              <Contrast className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isHindi ? 'कंट्रास्ट' : 'Contrast'}</span>
            </button>

            {/* Prominent Dark/Light Mode Switcher */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold transition-all border ${
                darkMode
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60 hover:bg-emerald-800'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                  <span>{isHindi ? 'लाइट मोड' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-200" />
                  <span>{isHindi ? 'डार्क मोड' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* Language toggle */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60 font-medium transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Civic Portal Header (Brand & Tools) */}
      <div className="bg-white dark:bg-[#0c161d] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 sm:py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div 
            onClick={onNavigateHome}
            className="cursor-pointer hover:opacity-95 transition-opacity"
            title="Bhoomi Rakshak Home"
          >
            <Logo size="md" variant={darkMode ? 'dark' : 'light'} />
          </div>

          {/* Center/Right Search Bar, AI & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl justify-end">
            {/* Search district or advisory */}
            <div 
              onClick={onSearchClick}
              className="relative w-full max-w-md hidden sm:flex items-center cursor-pointer group"
              title="Search district, hazard zone, advisory (Press ⌘K)"
            >
              <div className="w-full flex items-center gap-2 px-3 py-1.5 sm:py-2 text-xs bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-[#1b4d3e] dark:group-hover:border-emerald-500 transition-all shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-[#1b4d3e] dark:group-hover:text-emerald-400 transition-colors" />
                <span className="truncate">
                  {isHindi ? 'जिला, जोखिम क्षेत्र या चेतावनी खोजें...' : 'Search district, hazard zone, advisory...'}
                </span>
                <span className="ml-auto text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono text-slate-500 dark:text-slate-400">
                  ⌘K
                </span>
              </div>
            </div>

            {/* Risk Intelligence Button */}
            <button
              type="button"
              onClick={onAiAssistantClick}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#1b4d3e] to-[#25634d] text-white text-xs font-semibold hover:from-[#133c30] hover:to-[#1b4d3e] transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="tracking-wide hidden xs:inline">RISK INTELLIGENCE</span>
              <span className="tracking-wide xs:hidden">Risk</span>
              <span className="text-[10px] text-emerald-200 hidden md:inline">✦</span>
            </button>

            {/* Quick Dark Mode Toggle Button (Mobile & Desktop) */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Duty Officer Profile / EOC Console Trigger */}
            <button
              type="button"
              onClick={onNavigateMap}
              title="Duty Officer EOC Console"
              className="w-8 h-8 rounded-full bg-[#1b4d3e] dark:bg-emerald-900 text-white flex items-center justify-center hover:bg-[#133c30] dark:hover:bg-emerald-800 transition-colors border border-emerald-600/40 shadow-xs"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Universal Navigation Bar (Persistent Across ALL Webpages) */}
      <nav className="bg-white dark:bg-[#071118] border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Horizontal Nav Tabs for desktop & tablets */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 no-scrollbar scroll-smooth">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all select-none ${
                      isActive
                        ? 'bg-[#1b4d3e]/10 dark:bg-emerald-950/80 text-[#003629] dark:text-emerald-300 font-bold border-b-2 border-[#1b4d3e] dark:border-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon 
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive 
                          ? 'text-[#1b4d3e] dark:text-emerald-400' 
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`} 
                    />
                    <span>{isHindi ? item.labelHi : item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-red-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side: Quick District Selector Dropdown */}
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 relative" ref={districtDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDistrictDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700"
                title="Select Monitored District"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-[#003629] dark:text-emerald-300 truncate max-w-[130px]">
                  {currentDistrict.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* District Dropdown Popover */}
              {isDistrictDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#0c171e] rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    Monitored High-Risk Districts
                  </div>
                  {Object.values(DISTRICTS_DATA).map((dist) => (
                    <button
                      key={dist.id}
                      type="button"
                      onClick={() => handleDistrictChange(dist.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                        dist.id === selectedDistrictId
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#003629] dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium">{dist.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{dist.state} • Score {dist.riskScore}</div>
                      </div>
                      {dist.id === selectedDistrictId && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer (Expands when Hamburger clicked) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0c171e] border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>{isHindi ? 'सभी पृष्ठ व उपकरण' : 'All Pages & Tools'}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#1b4d3e] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="text-left">
                      <div>{isHindi ? item.labelHi : item.label}</div>
                      <div className={`text-[10px] ${isActive ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Monitored District Selector in Mobile Menu */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {isHindi ? 'जिला चुनें:' : 'Select District Dossier:'}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {Object.values(DISTRICTS_DATA).map((dist) => (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => handleDistrictChange(dist.id)}
                  className={`px-2 py-1.5 rounded text-[11px] text-left truncate transition-colors ${
                    dist.id === selectedDistrictId
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-[#003629] dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {dist.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Operational Status Banner (On Home or High Alert views) */}
      {(activeView === 'home' || activeView === 'warnings') && (
        <div className="bg-[#fefce8] dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 px-4 sm:px-6 py-2 text-xs transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
            {/* Status ticker */}
            <div className="flex items-center gap-2 font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
              <span className="font-bold text-[11px] tracking-wide text-amber-950 dark:text-amber-100 uppercase">
                {isHindi ? 'परिचालन स्थिति: लाइव जोखिम आकलन' : 'OPERATIONAL STATUS: LIVE RISK ASSESSMENT'}
              </span>
              <span className="text-amber-500">|</span>
              <span className="text-amber-800 dark:text-amber-300">
                {isHindi ? '8 उत्तर-पूर्वी राज्यों के जिला जोखिम संकेतक उपलब्ध' : 'District risk indicators configured across the 8 Northeast states'}
              </span>
            </div>

            {/* Satellite & Ground sensor count */}
            <div className="flex items-center gap-4 text-[11px] text-amber-800/90 dark:text-amber-300/80">
              <div className="flex items-center gap-1 font-semibold">
                <Satellite className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Live environmental feed</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Backend risk service</span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 hidden lg:inline">
                Live data refresh: 5 min
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
