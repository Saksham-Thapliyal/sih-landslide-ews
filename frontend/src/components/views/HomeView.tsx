import React from 'react';
import { 
  ArrowRight, 
  Info, 
  Satellite, 
  Activity, 
  Bell, 
  ShieldCheck, 
  ExternalLink, 
  Share2, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  CloudRain,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { DISTRICTS_DATA } from '../../data/districtStore';

interface HomeViewProps {
  onNavigateView: (view: string, districtId?: string) => void;
  onOpenAiModal: () => void;
  language: 'en' | 'hi';
}

export function HomeView({ onNavigateView, onOpenAiModal, language }: HomeViewProps) {
  const isHi = language === 'hi';
  const focusDistrict = DISTRICTS_DATA['east-khasi-hills'];
  const focusRiskIndex = focusDistrict.riskScore * 100;
  const focusRainfall = focusDistrict.conditions.rainfall24h;
  const focusSoil = focusDistrict.conditions.soilMoisture;
  const focusRisk = focusDistrict.riskLevel.toUpperCase();
  const focusUpdated = focusDistrict.lastUpdated;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Bhoomi Rakshak Risk Assessment',
        text: `Current live risk assessment for ${focusDistrict.name}: ${focusRisk}. Review local official advisories for emergency decisions.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Bhoomi Rakshak Risk Assessment: ${focusDistrict.name} — ${focusRisk}. Review local official advisories for emergency decisions.`);
      alert('Risk assessment copied to clipboard.');
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Mission */}
          <div className="lg:col-span-7 space-y-6">
            {/* Platform Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
              {isHi ? 'एआई भू-जोखिम इंटेलिजेंस प्लेटफॉर्म' : 'GEOHAZARD RISK INTELLIGENCE PLATFORM'}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#003629] dark:text-white leading-[1.15]">
              {isHi ? (
                <>
                  पूर्व चेतावनियाँ। <br />
                  सुरक्षित समुदाय। <br />
                  <span className="text-emerald-700 dark:text-emerald-400">एक अधिक सक्षम भारत।</span>
                </>
              ) : (
                <>
                  Early Warnings. <br />
                  Safer Communities. <br />
                  <span className="text-[#1b4d3e] dark:text-emerald-400">A More Resilient India.</span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              {isHi
                ? 'भूमिरक्षक भारत के संवेदनशील पर्वतीय इलाकों में भूस्खलन खतरों की निगरानी और न्यूनीकरण के लिए वास्तविक समय के उपग्रह डेटा, भू-स्थानिक बुद्धिमत्ता और एआई-आधारित पूर्वानुमान मॉडल को एकीकृत करता है।'
                : 'Bhoomi Rakshak integrates live environmental data, geospatial intelligence, and explainable live risk assessment to monitor and mitigate landslide hazards across vulnerable terrain in India. Risk intelligence for a safer tomorrow | Monitor • Assess • Protect.'
              }
            </p>

            {/* Quote Block */}
            <div className="pl-4 border-l-3 border-[#1b4d3e] dark:border-emerald-400 py-1">
              <p className="text-sm italic font-semibold text-slate-800 dark:text-slate-200">
                {isHi ? '“सचेत और तैयार समुदाय ही सुरक्षित भविष्य का निर्माण करते हैं।”' : '“Prepared Communities Build a Safer Tomorrow.”'}
              </p>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mt-1">
                — BHOOMI RAKSHAK INITIATIVE
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigateView('map', 'east-khasi-hills')}
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95"
              >
                <span>{isHi ? 'लाइव मैप देखें' : 'View Live Map'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenAiModal}
                className="flex items-center gap-2 px-5 py-3 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-600 transition-all shadow-sm"
              >
                <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{isHi ? 'अधिक जानें' : 'Learn More'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Risk Telemetry Preview Card (Matching Screen 1) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1921] p-4 shadow-lg overflow-hidden">
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Live Risk Synchronization
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>LIVE WEATHER + RISK INDEX</span>
                </div>
              </div>

              {/* Graphical Collage / Map Preview Area */}
              <div 
                onClick={() => onNavigateView('district', 'east-khasi-hills')}
                className="my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 cursor-pointer group relative"
              >
                {/* SVG Visual Representing Geospatial Hazard Map & Topography */}
                <div className="relative h-56 w-full bg-gradient-to-b from-[#08221c] to-[#04110e] flex items-center justify-center overflow-hidden">
                  {/* Topographic Contour Lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 240">
                    <path d="M0,180 Q100,120 200,150 T400,100" fill="none" stroke="#34d399" strokeWidth="1.5" />
                    <path d="M0,140 Q120,70 240,110 T400,60" fill="none" stroke="#10b981" strokeWidth="1.2" />
                    <path d="M0,100 Q140,40 280,80 T400,30" fill="none" stroke="#059669" strokeWidth="1" />
                    <circle cx="230" cy="115" r="45" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                    <circle cx="230" cy="115" r="24" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="230" cy="115" r="6" fill="#ffffff" />
                  </svg>

                  {/* Satellite Radar Heatmap Overlay */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white border border-white/20 font-mono">
                    LIVE ENVIRONMENTAL DATA • RISK INDEX
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-[#0c231c]/90 backdrop-blur-md p-2.5 rounded-md border border-emerald-600/40 text-white flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-300">
                        Station Focus • {focusRisk} RISK
                      </div>
                      <div className="text-xs font-bold text-white">
                        {focusDistrict.name}, {focusDistrict.state}
                      </div>
                    </div>
                    <span className="text-[11px] bg-red-600 px-2 py-0.5 rounded font-bold font-mono">
                      {focusRiskIndex.toFixed(1)}% Risk Score
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[#1b4d3e] text-white text-xs font-bold px-3 py-1.5 rounded shadow-md flex items-center gap-1">
                      Open Station Telemetry <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Domain & Risk Score Matrix */}
              <div className="grid grid-cols-2 gap-3 pt-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-md border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    TARGET DOMAIN
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    Himalayan & Eastern Ghats Belts
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    RISK SCORE MATRIX
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                    {focusRiskIndex.toFixed(1)}% LIVE
                  </div>
                </div>
              </div>

              {/* Sub-Metrics Footer */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Basins</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">24 Districts</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">24h Rainfall</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">{focusRainfall.toFixed(1)} mm</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Evac Status</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">{focusRisk}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Operational Capabilities Section (Image 1) */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Core Operational Capabilities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unified multi-source geospatial sensing and citizen risk defense infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Real-Time Monitoring */}
          <div 
            onClick={() => onNavigateView('analytics')}
            className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d171e] hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#1b4d3e] dark:text-emerald-300 flex items-center justify-center mb-4">
                <Satellite className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Real-Time Monitoring
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Government rainfall and live environmental data refreshed by the Bhoomi Rakshak backend.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Live weather + risk index</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Live Risk Assessment */}
          <div 
            onClick={() => onNavigateView('district', 'east-khasi-hills')}
            className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d171e] hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#1b4d3e] dark:text-emerald-300 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Live Risk Assessment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transparent risk scoring from current rainfall, soil saturation and historical landslide exposure context.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Live Risk Score</span>
              <span className="text-[10px] font-mono">{focusRiskIndex.toFixed(1)}%</span>
            </div>
          </div>

          {/* Card 3: Early Alerts */}
          <div 
            onClick={() => onNavigateView('warnings')}
            className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d171e] hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#1b4d3e] dark:text-emerald-300 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Early Alerts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Surfaces current risk assessments and field reports; official emergency warnings remain the responsibility of authorized agencies.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Disaster Response Cell</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
          </div>

          {/* Card 4: Community Safety */}
          <div 
            onClick={() => onNavigateView('report')}
            className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d171e] hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#1b4d3e] dark:text-emerald-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Community Safety
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Empowering people with actionable information, evacuation routes, and crowd hazard reporting.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Citizen Incident Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Focus Region & Latest Advisory Split Section (Image 1) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Focus Region Northeast India */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0d171e] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  LIVE RISK FOCUS
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  8 Northeastern States
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#003629] dark:text-white">
                Focus Region: Northeast India
              </h3>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Unique terrain. Greater risk. Stronger together.
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Characterized by high precipitation levels, steep topographical slopes, and active seismic dynamics, the Northeast requires hyper-localized geological telemetry, rapid civil alerts, and community-led response frameworks.
              </p>

              {/* Monitored stats mini box */}
              <div className="mt-5 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                {/* Visual radar point illustration */}
                <div className="w-20 h-16 rounded border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden flex-shrink-0">
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40"></div>
                  <div className="absolute w-8 h-8 rounded-full border border-emerald-500/60"></div>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <div className="absolute bottom-1 text-[8px] font-mono text-slate-500">
                    NEZONEGRID
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Northeast coverage:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">133 district points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Live inputs:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">OGD rainfall + soil moisture</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Official warnings:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">Not connected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateView('district', 'east-khasi-hills')}
                className="text-xs font-bold text-[#1b4d3e] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Explore Region</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Card: Live Risk Watch / Latest Assessment */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0d171e] rounded-xl border border-red-200 dark:border-red-900/60 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  LIVE RISK WATCH
                </span>
                <span className="text-xs font-mono text-slate-500">{focusUpdated}</span>
              </div>

              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                Latest Advisory
              </h3>

              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                No official warning feed is asserted here. This panel summarizes the current Bhoomi Rakshak risk assessment; use authorized government advisories for emergency decisions.
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Current live model inputs for {focusDistrict.name}: {focusRainfall.toFixed(1)} mm rainfall in the last 24 hours and {focusSoil.toFixed(1)}% volumetric soil moisture. Risk assessment is refreshed from the FastAPI backend.
              </p>

              {/* Action items row */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded p-2.5">
                  <div className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase">
                    Recommended Action
                  </div>
                  <div className="text-xs font-bold text-red-900 dark:text-red-200 mt-0.5">
                    Avoid Hill Cuts & Slopes
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2.5">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    National Emergency Call
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                    Dial 1070 / 112
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => onNavigateView('warnings')}
                className="font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Dispatch</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Alert</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Stat Numbers Banner (Image 1) */}
      <section className="bg-[#0b2b22] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/60 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              14,240+
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 mt-1">
              SQ. KM MONITORED
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              &lt; 15 mins
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 mt-1">
              TELEMETRY LATENCY
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              8 States
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 mt-1">
              OPERATIONAL DATA FEEDS
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
              2.4M+
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 mt-1">
              CITIZENS COVERED
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
