import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, AlertTriangle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { getHotspots } from '../../lib/api';
import { DISTRICTS_DATA } from '../../data/districtStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistrict: (districtId: string) => void;
  onSelectWarning: () => void;
}

export function SearchModal({ isOpen, onClose, onSelectDistrict, onSelectWarning }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => { if (isOpen) getHotspots(10).then(r => setHotspots(r.hotspots || [])).catch(() => setHotspots([])); }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const districtsList = Object.values(DISTRICTS_DATA);
  const filteredDistricts = query.trim()
    ? districtsList.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase()) || 
        d.state.toLowerCase().includes(query.toLowerCase())
      )
    : districtsList.slice(0, 4);

  const filteredAlerts = query.trim()
    ? hotspots.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.state.toLowerCase().includes(query.toLowerCase()))
    : hotspots.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0c161d] w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search districts, hazard zones, or advisories (e.g. East Khasi Hills, Chamoli)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Districts Group */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Monitored Districts & Mountain Basins
            </div>
            <div className="space-y-1">
              {filteredDistricts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDistrict(d.id);
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      d.riskLevel === 'critical' ? 'bg-red-600' : d.riskLevel === 'high' ? 'bg-orange-500' : 'bg-amber-400'
                    }`}></span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {d.name}, {d.state}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Rainfall: {d.conditions.rainfall24h}mm • Soil Moisture: {d.conditions.soilMoisture}%
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {d.riskLevel} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Advisories Group */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              Live Risk Watchlist
            </div>
            <div className="space-y-1">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectWarning();
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-600 text-white">
                      {alert.risk}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                        {alert.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {alert.state} • {alert.updated_at ? new Date(alert.updated_at).toLocaleTimeString() : "live"}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span>Navigate using search suggestions</span>
          <span className="font-mono text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
}
