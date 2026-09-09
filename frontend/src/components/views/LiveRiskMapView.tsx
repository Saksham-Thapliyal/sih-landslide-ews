import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  Minus, 
  Locate, 
  Radio, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Camera, 
  CloudRain, 
  Droplets, 
  Mountain, 
  Gauge, 
  Check, 
  Maximize2,
  Send,
  Eye,
  Crosshair
} from 'lucide-react';
import { DISTRICTS_DATA } from '../../data/districtStore';
import { DistrictTelemetry } from '../../types';
import RealGISMap from "./RealGISMap";
interface LiveRiskMapViewProps {
  selectedDistrictId: string;
  darkMode?: boolean;
  onSelectDistrict: (id: string) => void;
  onNavigateDistrictDetail: (id: string) => void;
  onNavigateReport: () => void;
}

export function LiveRiskMapView({
  selectedDistrictId,
  darkMode = false,
  onSelectDistrict,
  onNavigateDistrictDetail,
  onNavigateReport,
}: LiveRiskMapViewProps) {
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeState, setActiveState] = useState('');

  const [searchDistrict, setSearchDistrict] = useState('');

  // Layer toggles
  const [layers, setLayers] = useState({
    aiRisk: true,
    recentLandslides: true,
    rainfall: true,
    soilMoisture: true,
    terrainSlope: false,
    roads: true,
    boundaries: true,
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const resetLayers = () => {
    setLayers({
      aiRisk: true,
      recentLandslides: true,
      rainfall: true,
      soilMoisture: true,
      terrainSlope: false,
      roads: true,
      boundaries: true,
    });
  };

  const currentDistrict: DistrictTelemetry = DISTRICTS_DATA[selectedDistrictId] || DISTRICTS_DATA['east-khasi-hills'];

  // Map markers for stations



  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* 1. Top GIS Telemetry Header Bar */}
      <div className="bg-white dark:bg-[#0d161d] border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Live Risk Map
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                LIVE WEATHER + RISK INDEX
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live environmental observations and transparent risk scoring for monitored mountain districts
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Backend sync • 5 min refresh</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>{activeRegion === 'northeast' ? 'Northeast India' : 'India • monitored belts'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Three-Pane GIS Interface */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left GIS Layers & Filter Sidebar */}
        <div className="w-full lg:w-72 bg-white dark:bg-[#0c161e] border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto flex-shrink-0 z-10 space-y-5">
          {/* Region Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              MONITORING REGION
            </label>
            <select
              value={activeRegion}
              onChange={(e) => { setActiveRegion(e.target.value); if(e.target.value !== 'northeast') setActiveState(''); }}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
            >
              <option value="all">India • All monitored belts</option>
              <option value="northeast">Northeast India • 8 states</option>
              <option value="Himalayas">Western Himalayas (Zone 4 & 5)</option>
              <option value="WesternGhats">Western Ghats Escarpment</option>
              <option value="EasternGhats">Eastern Ghats Belt</option>
            </select>
            {activeRegion === 'northeast' && (
              <select value={activeState} onChange={e=>setActiveState(e.target.value)} className="w-full mt-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200">
                <option value="">All 8 Northeast states</option>
                <option>Arunachal Pradesh</option><option>Assam</option><option>Manipur</option><option>Meghalaya</option><option>Mizoram</option><option>Nagaland</option><option>Sikkim</option><option>Tripura</option>
              </select>
            )}
          </div>

          {/* District or Geocode Search */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              DISTRICT OR GEOCODE SEARCH
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="East Khasi Hills"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md pl-8 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* GIS Map Layers Checkbox List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                GIS MAP LAYERS
              </span>
              <button
                type="button"
                onClick={resetLayers}
                className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.aiRisk}
                    onChange={() => toggleLayer('aiRisk')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Landslide Risk Index</span>
                </div>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  High Sens
                </span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.recentLandslides}
                    onChange={() => toggleLayer('recentLandslides')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Recent Landslides</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">48h Window</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.rainfall}
                    onChange={() => toggleLayer('rainfall')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Rainfall (24h)</span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Live Open-Meteo • Gov OGD on district detail</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.soilMoisture}
                    onChange={() => toggleLayer('soilMoisture')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Soil Moisture</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Open-Meteo</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.terrainSlope}
                    onChange={() => toggleLayer('terrainSlope')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Terrain (Slope)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">SRTM 30m</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.roads}
                    onChange={() => toggleLayer('roads')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Roads & Infrastructure</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">BRO • NHAI</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layers.boundaries}
                    onChange={() => toggleLayer('boundaries')}
                    className="rounded text-[#1b4d3e] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">District Boundaries</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Survey of India</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>CLOUD INGESTION BAND</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">14:28:10 UTC</span>
          </div>
        </div>

        {/* Center Interactive Map Canvas */}
        <div className="flex-1 relative bg-[#061814] flex flex-col justify-between overflow-hidden">
          {/* Top Corridor HUD Bar */}
          <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="bg-[#0b261f]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-emerald-600/40 text-white text-xs font-mono pointer-events-auto shadow-md">
              <span className="font-bold text-emerald-300">NORTHEAST MONITORING VIEW</span> • <span className="text-amber-400">Risk layer active</span>
            </div>

          </div>

           {/* REAL MAP */}
              <div className="absolute inset-0">
                    <RealGISMap region={activeRegion} state={activeState} darkMode={darkMode} onPointSelect={onSelectDistrict} />
              </div>
          {/* Bottom Region Tabs & HUD Coordinate Bar */}
          <div className="relative z-20 p-3 bg-gradient-to-t from-[#04110e] via-[#04110e]/80 to-transparent flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Region selector buttons matching Image 7 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveRegion('all'); setActiveState(''); }}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${activeRegion === 'all' ? 'bg-[#1b4d3e] text-white border border-emerald-500 shadow-sm' : 'bg-[#09221b] text-emerald-300 hover:bg-[#10362b] border border-emerald-800/40'}`}
              >
                All Monitored Belts
              </button>

              <button
                type="button"
                onClick={() => { setActiveRegion('northeast'); setActiveState('Meghalaya'); onSelectDistrict('east-khasi-hills'); }}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  activeRegion === 'northeast' && activeState === 'Meghalaya'
                    ? 'bg-[#1b4d3e] text-white border border-emerald-500 shadow-sm'
                    : 'bg-[#09221b] text-emerald-300 hover:bg-[#10362b] border border-emerald-800/40'
                }`}
              >
                Meghalaya (12 Zones)
              </button>

              <button
                type="button"
                onClick={() => { setActiveRegion('northeast'); setActiveState('Arunachal Pradesh'); onSelectDistrict('papum-pare'); }}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  activeRegion === 'northeast' && activeState === 'Arunachal Pradesh'
                    ? 'bg-[#1b4d3e] text-white border border-emerald-500 shadow-sm'
                    : 'bg-[#09221b] text-emerald-300 hover:bg-[#10362b] border border-emerald-800/40'
                }`}
              >
                Arunachal Pradesh (28 Districts)
              </button>

              <button
                type="button"
                onClick={() => { setActiveRegion('Himalayas'); setActiveState(''); onSelectDistrict('chamoli'); }}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  activeRegion === 'Himalayas'
                    ? 'bg-[#1b4d3e] text-white border border-emerald-500 shadow-sm'
                    : 'bg-[#09221b] text-emerald-300 hover:bg-[#10362b] border border-emerald-800/40'
                }`}
              >
                Uttarakhand (Chamoli Belt)
              </button>
            </div>

            {/* WGS 84 Coordinates & Scale info */}
            <div className="text-[11px] font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded border border-emerald-700/40 flex items-center gap-3">
              <span>WGS 84 • EPSG:4326</span>
              <span className="text-slate-400">|</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-8 h-1 bg-white"></span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspection & Station Focus Panel (Matching Image 7) */}
        <div className="w-full lg:w-80 bg-white dark:bg-[#0c161e] border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto flex-shrink-0 z-10 space-y-5">
          {/* Risk Classification Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              Risk Classification
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
              Live Risk Index (prototype)
            </p>

            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex items-center justify-between p-1.5 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
                <span className="flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  High
                </span>
                <span className="font-mono text-[11px] font-bold">≥ 67%</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60">
                <span className="flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                  Medium Risk
                </span>
                <span className="font-mono text-[11px] font-bold">40% – 66%</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                <span className="flex items-center gap-2 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Low Risk
                </span>
                <span className="font-mono text-[11px] font-bold">&lt; 40%</span>
              </div>
            </div>
          </div>

          {/* Station Focus Live Card */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/80 bg-red-50/50 dark:bg-[#1a1417] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DISTRICT FOCUS • LIVE
              </span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                {currentDistrict.riskLevel} Risk
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {currentDistrict.name}
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {currentDistrict.state} • District display point
            </div>

            {/* Live environmental indicators */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white dark:bg-[#0c161e] p-2.5 rounded border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-medium">Rainfall (24h)</div>
                <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {currentDistrict.conditions.rainfall24h} <span className="text-[10px] font-normal">mm</span>
                </div>
                <div className="text-[10px] text-red-600 font-bold">{currentDistrict.conditions.rainfall24hStatus}</div>
              </div>

              <div className="bg-white dark:bg-[#0c161e] p-2.5 rounded border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-medium">Soil Moisture</div>
                <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {currentDistrict.conditions.soilMoisture}%
                </div>
                <div className="text-[10px] text-slate-500 font-bold">{currentDistrict.conditions.soilMoistureStatus}</div>
              </div>

              <div className="bg-white dark:bg-[#0c161e] p-2.5 rounded border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-medium">Live Risk Index</div>
                <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {(currentDistrict.riskScore * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 font-bold">Transparent live index</div>
              </div>

              <div className="bg-white dark:bg-[#0c161e] p-2.5 rounded border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 font-medium">Temperature</div>
                <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {currentDistrict.conditions.temperature.toFixed(1)} <span className="text-[10px] font-normal">°C</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Live weather feed</div>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>Telemetry Station:</span>
              <span>Live district risk layer</span>
            </div>

            {/* View Detailed Report Button */}
            <button
              type="button"
              onClick={() => onNavigateDistrictDetail(currentDistrict.id)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span>View Detailed Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spotted Slope Shifts Report Callout (Matching Image 7) */}
          <div className="bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
              Spotted Slope Shifts?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Submit geo-tagged field observations for review.
            </p>
            <button
              type="button"
              onClick={onNavigateReport}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
