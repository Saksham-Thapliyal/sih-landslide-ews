import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Download, 
  Send, 
  ChevronRight, 
  MapPin, 
  Activity, 
  CloudRain, 
  Droplets, 
  Mountain, 
  Thermometer, 
  Trees, 
  Bot, 
  ShieldCheck, 
  FileText,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { DISTRICTS_DATA } from '../../data/districtStore';
import { DistrictTelemetry } from '../../types';
import { getDistrictRisk, RiskPoint } from '../../lib/api';

interface DistrictDetailViewProps {
  districtId: string;
  onNavigateHome: () => void;
  onSelectDistrict: (id: string) => void;
}

export function DistrictDetailView({ districtId, onNavigateHome, onSelectDistrict }: DistrictDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'environmental' | 'historical' | 'recommendations'>('overview');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const baseDistrict: DistrictTelemetry = DISTRICTS_DATA[districtId] || DISTRICTS_DATA['east-khasi-hills'];
  const [live, setLive] = useState<RiskPoint | null>(null);
  useEffect(() => { let alive=true; getDistrictRisk(districtId).then(x=>alive&&setLive(x)).catch(()=>{}); return()=>{alive=false}; }, [districtId]);
  const district: DistrictTelemetry = live ? { ...baseDistrict, riskScore: live.risk_score ?? baseDistrict.riskScore, riskLevel: live.risk==='HIGH'?'critical':live.risk==='MEDIUM'?'moderate':'low', lastUpdated: live.updated_at ? new Date(live.updated_at).toLocaleString() : baseDistrict.lastUpdated, coordinates:{lat:live.lat,lng:live.lng}, conditions:{...baseDistrict.conditions, rainfall24h:live.rainfall_24h_mm ?? baseDistrict.conditions.rainfall24h, soilMoisture:(live.soil_moisture_vol_frac ?? baseDistrict.conditions.soilMoisture/100)*100, temperature:live.temperature_c ?? baseDistrict.conditions.temperature, dewPoint:live.dew_point_c ?? baseDistrict.conditions.dewPoint} } : baseDistrict;

  const handleExportBulletin = () => {
    alert(`Generating Bhoomi Rakshak prototype risk bulletin for ${district.name}, ${district.state} (PDF format). Telemetry snapshot saved.`);
  };

  const handleDispatchAlert = () => {
    setDispatchStatus('Prototype alert prepared for review; no government dispatch is performed');
    setTimeout(() => {
      setDispatchStatus(null);
    }, 6000);
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#081219] text-slate-900 dark:text-slate-100 min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 select-none">
        <button type="button" onClick={onNavigateHome} className="hover:text-emerald-700 dark:hover:text-emerald-400">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-700">Risk Information</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {district.name}
        </span>
      </nav>

      {/* 2. District Header with Risk Score Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003629] dark:text-white tracking-tight">
              {district.name}, {district.state}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              {district.zone}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detailed risk assessment, live environmental inputs, and current live risk assessment from the Bhoomi Rakshak API.
          </p>
          {live && (
            <div className="mt-2 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
              LIVE • {live.rainfall_source || 'weather feed'} • updated {live.updated_at ? new Date(live.updated_at).toLocaleTimeString() : '—'}
            </div>
          )}
        </div>

        {/* Right Risk Score Badge */}
        <div className="flex items-center gap-4 bg-white dark:bg-[#0e1922] p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase ${
              district.riskLevel === 'critical' || district.riskLevel === 'high'
                ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300'
                : district.riskLevel === 'moderate'
                  ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {district.riskLevel} Risk
            </span>
            <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                RISK SCORE
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {district.riskScore.toFixed(2)}
                <span className="text-xs text-slate-400 font-normal"> / 1.00</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Last Updated:</span>
            </div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              {district.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Subtabs Bar */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold mt-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'overview'
              ? 'text-[#1b4d3e] dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4d3e] dark:bg-emerald-400"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('environmental')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'environmental'
              ? 'text-[#1b4d3e] dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Environmental Data
          {activeTab === 'environmental' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4d3e] dark:bg-emerald-400"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historical')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'historical'
              ? 'text-[#1b4d3e] dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Historical Events
          {activeTab === 'historical' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4d3e] dark:bg-emerald-400"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'recommendations'
              ? 'text-[#1b4d3e] dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Recommendations
          {activeTab === 'recommendations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4d3e] dark:bg-emerald-400"></span>
          )}
        </button>
      </div>

      {/* Dispatch Banner Feedback */}
      {dispatchStatus && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* 4. Two-Column Layout (Matching Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Topography & District Profile) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Regional Topography Card */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                <Mountain className="w-4 h-4 text-emerald-600" />
                Regional Topography
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                GIS RISK LAYER
              </span>
            </div>

            {/* Visual Topography Satellite Graphic */}
            <div className="relative h-44 rounded-lg bg-[#071d17] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col justify-end p-3">
              {/* Topographic Lines Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 300 180">
                <path d="M0,140 C80,90 120,160 300,70" fill="none" stroke="#10b981" strokeWidth="1.5" />
                <path d="M0,100 C70,50 140,120 300,40" fill="none" stroke="#34d399" strokeWidth="1" />
                <path d="M0,60 C90,20 160,90 300,20" fill="none" stroke="#6ee7b7" strokeWidth="0.8" />
                <circle cx="160" cy="85" r="14" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1.5" />
                <circle cx="160" cy="85" r="3" fill="#ffffff" />
              </svg>

              <div className="relative z-10 bg-black/60 backdrop-blur-sm p-2 rounded text-white text-[11px]">
                <div className="font-bold text-amber-300">{district.topographyNotes}</div>
                <div className="text-[10px] text-slate-200 mt-0.5 leading-snug">
                  {district.activeScarpObserved}
                </div>
              </div>
            </div>
          </div>

          {/* District Profile Card */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                District Profile
              </h3>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">District</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{district.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">State</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{district.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Population (est.)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{district.population}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Key Infrastructure</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{district.keyInfrastructure}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Headquarters</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{district.headquarters}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Monitored Slopes</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">
                  {district.monitoredSlopes.high} High / {district.monitoredSlopes.med} Med
                </span>
              </div>
            </div>

            {/* Local EOC Hotline Box */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  LOCAL EOC HOTLINE
                </div>
                <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                  {district.hotline}
                </div>
              </div>
              <a
                href={`tel:${district.hotline}`}
                className="w-8 h-8 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white flex items-center justify-center transition-colors shadow-sm"
                title="Dial Local EOC"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column (AI Predictive Alert & Environmental Conditions) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Terraguard AI Predictive Alert (Matching Image 3) */}
          <div className="bg-[#e9f5f0] dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 p-4.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#1b4d3e] text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#003629] dark:text-emerald-300 uppercase tracking-wide">
                  BHOOMI RAKSHAK LIVE RISK ASSESSMENT
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                Risk index: {district.aiAlert.confidence.toFixed(1)}%
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed pl-8">
              {district.aiAlert.message}
            </p>
          </div>

          {/* Current Environmental Conditions Grid */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Current Environmental Conditions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live weather observations + live risk assessment from the Bhoomi Rakshak backend.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE BACKEND FEED
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {/* 1. Rainfall 24h */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    Rainfall (24h)
                  </span>
                  <span className="text-red-600 font-bold font-mono">{district.conditions.rainfall24hTrend}</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {district.conditions.rainfall24h} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="text-[11px] font-bold text-red-600 dark:text-red-400 mt-0.5">
                  {district.conditions.rainfall24hStatus}
                </div>
              </div>

              {/* 2. Rainfall 7 days */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    Rainfall (7 days)
                  </span>
                  <span className="text-red-600 font-bold font-mono">{district.conditions.rainfall7dTrend}</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {district.conditions.rainfall7d} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  {district.conditions.rainfall7dStatus}
                </div>
              </div>

              {/* 3. Soil Moisture */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    Soil Moisture
                  </span>
                  <span className="text-red-600 font-bold font-mono">{district.conditions.soilMoistureTrend}</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {district.conditions.soilMoisture}%
                </div>
                <div className="text-[11px] font-bold text-red-600 dark:text-red-400 mt-0.5">
                  {district.conditions.soilMoistureStatus}
                </div>
              </div>

              {/* 4. Average Slope */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Mountain className="w-3.5 h-3.5 text-slate-500" />
                    Average Slope
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">Static</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {district.conditions.avgSlope}°
                </div>
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  {district.conditions.avgSlopeStatus}
                </div>
              </div>

              {/* 5. Temperature */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                    Temperature
                  </span>
                  <span className="text-emerald-600 text-[10px] font-mono">Stable</span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {district.conditions.temperature}°C
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Dew point {district.conditions.dewPoint}°C
                </div>
              </div>

              {/* 6. Land Cover */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Trees className="w-3.5 h-3.5 text-green-600" />
                    Land Cover
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">LULC Class</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {district.conditions.landCover}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {district.conditions.landCoverCohesion}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors Contribution (Matching Image 3) */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Risk Factors Contribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Multi-variate algorithmic weightage applied to hazard score.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                WEIGHTED ENSEMBLE
              </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-2">
              {/* Rainfall 24h (38%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    Rainfall (24h)
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{district.factors.rainfall24h}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${district.factors.rainfall24h}%` }}></div>
                </div>
              </div>

              {/* Soil Moisture (27%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#1b4d3e]"></span>
                    Soil Moisture
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{district.factors.soilMoisture}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-[#1b4d3e] rounded-full" style={{ width: `${district.factors.soilMoisture}%` }}></div>
                </div>
              </div>

              {/* Slope (18%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Slope
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{district.factors.slope}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${district.factors.slope}%` }}></div>
                </div>
              </div>

              {/* Historical Events (10%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Historical Events
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{district.factors.historicalEvents}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: `${district.factors.historicalEvents}%` }}></div>
                </div>
              </div>

              {/* Land Cover (7%) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    Land Cover
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">{district.factors.landCover}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: `${district.factors.landCover}%` }}></div>
                </div>
              </div>
            </div>

            {/* Calibration note & Dispatch / Export Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparent live risk index • not a calibrated probability</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportBulletin}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Bulletin (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDispatchAlert}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white font-bold text-xs transition-colors shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch EOC Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
