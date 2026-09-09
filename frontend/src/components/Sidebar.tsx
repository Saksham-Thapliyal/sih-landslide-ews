import React from 'react';
import { 
  Map, 
  Activity, 
  AlertTriangle, 
  Send, 
  BookOpen, 
  ShieldAlert, 
  Phone, 
  Home, 
  ChevronRight,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'map', label: 'GIS Risk Map', icon: Map },
    { id: 'analytics', label: 'Telemetry & Trends', icon: Activity },
    { id: 'warnings', label: 'Active Early Warnings', icon: AlertTriangle, badge: undefined },
    { id: 'report', label: 'Submit Ground Report', icon: Send },
    { id: 'guidelines', label: 'Risk Guidelines', icon: BookOpen },
    { id: 'protocols', label: 'NDMA Protocols', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0c171e] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col justify-between select-none z-30 shadow-sm">
      <div>
        {/* Brand & Telemetry Ops Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-[#1b4d3e] text-white flex items-center justify-center font-bold text-xs">
              BR
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#003629] dark:text-emerald-300 leading-tight">
                Bhoomi Rakshak
              </div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                GIS Telemetry Ops
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] px-2.5 py-1 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              SYSTEM STATUS
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE FEED
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1b4d3e] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#1b4d3e] dark:hover:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Back to Public Portal</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Emergency Banner & Copyright */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-1">
          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Helpline: 1070 (Toll-Free)</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          © 2026 Bhoomi Rakshak • Prototype
        </div>
      </div>
    </aside>
  );
}
