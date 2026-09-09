import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/views/HomeView';
import { DistrictDetailView } from './components/views/DistrictDetailView';
import { LiveRiskMapView } from './components/views/LiveRiskMapView';
import { TelemetryAnalyticsView } from './components/views/TelemetryAnalyticsView';
import { ActiveWarningsView } from './components/views/ActiveWarningsView';
import { GroundReportView } from './components/views/GroundReportView';
import { NdmaProtocolsView } from './components/views/NdmaProtocolsView';
import { GuidelinesView } from './components/views/GuidelinesView';
import { AiGeohazardModal } from './components/modals/AiGeohazardModal';
import { SearchModal } from './components/modals/SearchModal';
import { getRiskMap } from './lib/api';
import { applyLiveRiskPoints } from './lib/liveData';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('east-khasi-hills');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [liveRefreshVersion, setLiveRefreshVersion] = useState(0);

  // Hydrate the live district store from the FastAPI endpoint.
  // The backend is the source of truth for coordinates, environmental values and risk.
  useEffect(() => {
    let alive = true;
    const loadLiveData = async () => {
      try {
        const response = await getRiskMap('all');
        if (!alive) return;
        applyLiveRiskPoints(response.points || []);
        setLiveRefreshVersion(v => v + 1);
      } catch (error) {
        console.error('Live risk hydration failed:', error);
      }
    };
    loadLiveData();
    const timer = window.setInterval(loadLiveData, 5 * 60 * 1000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  // Accessibility & Preferences
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bhoomi_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);

  // Synchronize dark mode class to document.documentElement and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('bhoomi_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('bhoomi_theme', 'light');
    }
  }, [darkMode]);

  const handleNavigate = (view: string, districtId?: string) => {
    if (districtId) {
      setSelectedDistrictId(districtId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeFontSize = (delta: number) => {
    setFontSizeLevel(delta);
  };

  void liveRefreshVersion;

  const isOpsDashboardView = ['map', 'analytics', 'warnings', 'report', 'protocols', 'guidelines'].includes(activeView);

  // Font size class mapping
  const fontSizeClass = fontSizeLevel === 1 ? 'text-[1.08rem]' : fontSizeLevel === -1 ? 'text-[0.92rem]' : 'text-base';

  return (
    <div className={`${darkMode ? 'dark' : ''} ${highContrast ? 'contrast-125 saturate-125' : ''}`}>
      <div className={`min-h-screen flex flex-col font-sans bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 transition-colors duration-150 ${fontSizeClass}`}>
        {/* Global Header with Universal Navigation Bar (Visible on ALL Webpages) */}
        <Header
          onSearchClick={() => setIsSearchModalOpen(true)}
          onAiAssistantClick={() => setIsAiModalOpen(true)}
          onNavigateHome={() => handleNavigate('home')}
          onNavigateMap={() => handleNavigate('map')}
          language={language}
          onToggleLanguage={() => setLanguage(prev => (prev === 'en' ? 'hi' : 'en'))}
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(prev => !prev)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          fontSizeLevel={fontSizeLevel}
          onChangeFontSize={handleChangeFontSize}
          activeView={activeView}
          onNavigate={handleNavigate}
          selectedDistrictId={selectedDistrictId}
          onSelectDistrict={(id) => setSelectedDistrictId(id)}
        />

        {/* View Routing Body */}
        {isOpsDashboardView ? (
          // Operational GIS & Telemetry Layout
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              currentView={activeView}
              onNavigate={(v) => handleNavigate(v)}
            />

            <main className="flex-1 flex flex-col overflow-y-auto">
              {activeView === 'map' && (
                <LiveRiskMapView
                  darkMode={darkMode}
                  selectedDistrictId={selectedDistrictId}
                  onSelectDistrict={(id) => {
                    setSelectedDistrictId(id);
                  }}
                  onNavigateDistrictDetail={(id) => handleNavigate('district', id)}
                  onNavigateReport={() => handleNavigate('report')}
                />
              )}

              {activeView === 'analytics' && (
                <TelemetryAnalyticsView />
              )}

              {activeView === 'warnings' && (
                <ActiveWarningsView
                  onNavigateDistrict={(id) => handleNavigate('district', id)}
                />
              )}

              {activeView === 'report' && (
                <GroundReportView />
              )}

              {activeView === 'protocols' && (
                <NdmaProtocolsView />
              )}

              {activeView === 'guidelines' && (
                <GuidelinesView />
              )}

              <Footer onNavigateView={(v) => handleNavigate(v)} />
            </main>
          </div>
        ) : (
          // Public Portal Layout (HomeView & DistrictDetailView) with Footer
          <main className="flex-1 flex flex-col">
            {activeView === 'home' && (
              <HomeView
                onNavigateView={handleNavigate}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                language={language}
              />
            )}

            {activeView === 'district' && (
              <DistrictDetailView
                districtId={selectedDistrictId}
                onNavigateHome={() => handleNavigate('home')}
                onSelectDistrict={(id) => setSelectedDistrictId(id)}
              />
            )}

            <Footer onNavigateView={(v) => handleNavigate(v)} />
          </main>
        )}

        {/* Modals */}
        <AiGeohazardModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onSelectDistrict={(id) => handleNavigate('district', id)}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectDistrict={(id) => handleNavigate('district', id)}
          onSelectWarning={() => handleNavigate('warnings')}
        />
      </div>
    </div>
  );
}
