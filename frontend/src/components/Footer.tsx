import React from 'react';
import { PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigateView: (view: string) => void;
}

export function Footer({ onNavigateView }: FooterProps) {
  return (
    <footer className="bg-[#0b1c16] text-slate-300 border-t border-emerald-950/80 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Hotline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Bhoomi <span className="text-emerald-400">Rakshak</span>
              </span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded font-mono">
                LIVE RISK INDEX
              </span>
            </div>
            
            <p className="text-slate-400 leading-relaxed text-[12px]">
              Data for a Safer Tomorrow | Monitor • Assess • Protect. An independent live environmental risk-assessment framework for mountainous terrain.
            </p>

            {/* Helpline Callout Button */}
            <div className="bg-[#12362a] border border-emerald-700/50 rounded-lg p-3 text-white flex items-center justify-between gap-3 shadow-md">
              <div>
                <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  GEOHAZARD RESPONSE HELPLINE
                </div>
                <div className="text-lg font-extrabold font-mono tracking-wide text-white flex items-center gap-1.5 mt-0.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                  1070 / 112
                </div>
              </div>
              <a
                href="tel:1070"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shadow"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Col 2: Reference Agencies */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Reference Agencies
            </h4>
            <ul className="space-y-2 text-slate-400 text-[12px]">
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                National Disaster Management Authority (NDMA)
              </li>
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                Geological Survey of India (GSI)
              </li>
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                India Meteorological Department (IMD)
              </li>
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                Border Roads Organisation (BRO)
              </li>
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                National Remote Sensing Centre (NRSC)
              </li>
              <li className="hover:text-emerald-300 transition-colors cursor-pointer">
                Central Water Commission (CWC)
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400 text-[12px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('analytics')}
                  className="hover:text-emerald-300 transition-colors text-left"
                >
                  Live rainfall & risk trends
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('protocols')}
                  className="hover:text-emerald-300 transition-colors text-left"
                >
                  Disaster risk response guidance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('report')}
                  className="hover:text-emerald-300 transition-colors text-left"
                >
                  Citizen Field Reporting Toolkit
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('map')}
                  className="hover:text-emerald-300 transition-colors text-left"
                >
                  Live geospatial risk data feeds
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateView('warnings')}
                  className="hover:text-emerald-300 transition-colors text-left"
                >
                  Local emergency-management channels
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Support */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-3">
              Compliance & Support
            </h4>
            <div className="space-y-2.5 text-slate-400 text-[12px] leading-relaxed">
              <p>
                Independent prototype; not a government command centre.
              </p>
              <p className="text-emerald-400 font-mono text-[11px]">
                Technical query: Bhoomi Rakshak project team
              </p>
              <div className="pt-2 border-t border-emerald-900/60">
                <span className="text-[11px] text-slate-500 block">
                  Live weather + risk index
                </span>
                <span className="text-slate-300 font-medium">
                  Live data refresh: 5 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 Bhoomi Rakshak — Independent geohazard risk-assessment prototype.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Accessibility Statement</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
