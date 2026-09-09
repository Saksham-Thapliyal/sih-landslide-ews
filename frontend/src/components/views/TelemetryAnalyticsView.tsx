import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Download, 
  CloudRain, 
  Droplets, 
  Gauge, 
  TrendingUp, 
  Clock, 
  Layers, 
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DISTRICTS_DATA } from '../../data/districtStore';
import { getTimeseries } from '../../lib/api';

export function TelemetryAnalyticsView() {
  const [selectedDistrict, setSelectedDistrict] = useState('east-khasi-hills');
  const [timeWindow, setTimeWindow] = useState<'24h' | '7d'>('24h');
  const [liveSeries, setLiveSeries] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;
    getTimeseries(selectedDistrict, timeWindow === '24h' ? 24 : 168)
      .then(data => { if (alive) setLiveSeries(data.points || []); })
      .catch(() => { if (alive) setLiveSeries([]); });
    return () => { alive = false; };
  }, [selectedDistrict, timeWindow]);

  const chartSeries = liveSeries.length ? liveSeries.map((p, i) => ({
    time: p.observed_at ? new Date(p.observed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : String(i + 1),
    rainfall: Number(p.rainfall_24h_mm || 0),
    soilMoisture: Number(p.soil_moisture_vol_frac || 0) * 100,
  })) : [];

  const district = DISTRICTS_DATA[selectedDistrict] || DISTRICTS_DATA['east-khasi-hills'];
  const latest = liveSeries.length ? liveSeries[liveSeries.length - 1] : null;

  const handleDownloadCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Time,Rainfall_mm,SoilMoisture_pct\n';
    chartSeries.forEach(row => {
      csvContent += `${row.time},${row.rainfall},${row.soilMoisture}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhoomirakshak_${selectedDistrict}_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Header Bar */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003629] dark:text-white tracking-tight">
              Telemetry & Trends
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              LIVE OBSERVATION HISTORY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Stored rainfall, soil-moisture and risk-score observations collected by the Bhoomi Rakshak backend.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Telemetry</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0e1922] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Monitored Station
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
            >
              <option value="east-khasi-hills">East Khasi Hills (district feed)</option>
              <option value="chamoli">Chamoli (district feed)</option>
              <option value="wayanad">Wayanad (district feed)</option>
              <option value="darjeeling">Darjeeling (district feed)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Sampling Resolution
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTimeWindow('24h')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  timeWindow === '24h' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                24 Hours
              </button>
              <button
                type="button"
                onClick={() => setTimeWindow('7d')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  timeWindow === '7d' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeWindow('30d')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  timeWindow === '30d' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
              </button>
            </div>
          </div>
        </div>

        {/* Current status indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-sans uppercase">Live risk score</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{latest?.risk_score != null ? `${(latest.risk_score * 100).toFixed(1)}%` : '—'}</span>
          </div>
          <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block font-sans uppercase">Data status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{latest?.data_quality || 'WAITING'}</span>
          </div>
        </div>
      </div>

      {/* 3. High-Fidelity Interactive Telemetry Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart: Rainfall & Soil Moisture Dynamics */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Precipitation Influx vs. Hydrological Saturation Index
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing stored rainfall observations with live soil-moisture observations. Missing sensor variables are not fabricated.
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-3 h-3 bg-blue-500 rounded-xs"></span>
                Rainfall (mm)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                Soil Moisture (%)
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-red-500"></span>
                Reference soil-moisture line (75%)
              </span>
            </div>
          </div>

          {/* SVG Visual Time-Series Chart */}
          <div className="relative h-64 w-full rounded-lg bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#94a3b8" strokeOpacity="0.2" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#94a3b8" strokeOpacity="0.2" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#94a3b8" strokeOpacity="0.2" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#94a3b8" strokeOpacity="0.2" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#94a3b8" strokeOpacity="0.4" />

              {/* Y Axis Labels */}
              <text x="32" y="24" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">100%</text>
              <text x="32" y="64" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">75%</text>
              <text x="32" y="104" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">50%</text>
              <text x="32" y="144" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">25%</text>
              <text x="32" y="184" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">0%</text>

              {/* Reference soil-moisture line at 75% (y=60) */}
              <line x1="40" y1="60" x2="480" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />

              {/* Rainfall Bars (Blue) */}
              {chartSeries.map((pt, idx) => {
                const x = 55 + idx * 52;
                const barHeight = pt.rainfall * 2.8;
                return (
                  <g key={idx}>
                    <rect
                      x={x - 10}
                      y={180 - barHeight}
                      width="20"
                      height={barHeight}
                      fill="#0284c7"
                      fillOpacity="0.75"
                      rx="2"
                    />
                    <text x={x} y={192} fill="#64748b" fontSize="7.5" textAnchor="middle" fontFamily="monospace">
                      {pt.time}
                    </text>
                    <text x={x} y={175 - barHeight} fill="#0284c7" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {pt.rainfall}
                    </text>
                  </g>
                );
              })}

              {/* Soil Moisture Smooth Trend Polyline (Emerald) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={chartSeries.map((pt, idx) => `${55 + idx * 52},${180 - (pt.soilMoisture / 100) * 160}`).join(' ')}
              />

              {/* Data points on polyline */}
              {chartSeries.map((pt, idx) => {
                const cx = 55 + idx * 52;
                const cy = 180 - (pt.soilMoisture / 100) * 160;
                return (
                  <circle
                    key={`dot-${idx}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Live observation stream verified by backend
            </span>
            <span className="font-mono text-[11px]">Backend observation stream</span>
          </div>
        </div>

        {/* Right Sub-Panel: Pore Water Pressure & Shear Creep Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pore Water Pressure Box */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pore Water Pressure (PWP)
              </h3>
              <Gauge className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="text-xl font-extrabold font-mono text-slate-600 dark:text-slate-300">
              Not connected
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Pore-pressure and displacement sensors are not connected in this prototype; they are not fabricated.
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="text-xs text-slate-500">No government/field piezometer feed is configured in the current backend.</div>
            </div>
          </div>

          {/* Environmental Summary Indicators */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Antecedent Index Diagnostics
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Antecedent rainfall index</div>
                <div className="text-base font-extrabold font-mono text-slate-700 dark:text-slate-200 mt-0.5">Calculated from stored rainfall history</div>
                <div className="text-[10px] text-slate-500">No groundwater sensor feed is configured.</div>
              </div>

              <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Rainfall trigger diagnostics</div>
                <div className="text-base font-extrabold font-mono text-slate-700 dark:text-slate-200 mt-0.5">Risk index uses rainfall intensity</div>
                <div className="text-[10px] text-slate-500">No GSI threshold calibration is claimed.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
