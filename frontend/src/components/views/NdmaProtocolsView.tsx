import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  PhoneCall,
  Users,
  Compass
} from 'lucide-react';
import { NDMA_PROTOCOLS } from '../../data/protocols';

export function NdmaProtocolsView() {
  const handleOpenGuidance = () => { window.open("https://sachet.ndma.gov.in/DosDont", "_blank", "noopener,noreferrer"); };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003629] dark:text-white tracking-tight">
              NDMA Geohazard Protocols & Guidelines
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              NATIONAL DISASTER MANAGEMENT AUTHORITY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Standard Operating Procedures (SOPs), emergency evacuation frameworks, and institutional responsibilities for slope hazards in India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenGuidance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Official Safety Guidance</span>
          </button>
        </div>
      </div>

      {/* 2. Four Sequential Phases Grid */}
      <div className="my-8 space-y-6">
        {NDMA_PROTOCOLS.map((phase) => (
          <div
            key={phase.id}
            className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded bg-[#1b4d3e] text-white text-xs font-extrabold font-mono">
                  PHASE {phase.phase}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {phase.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleOpenGuidance}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Official Guidance</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {phase.description}
            </p>

            {/* Checklist of operational steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {phase.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Agency Command Chain Matrix */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Institutional Inter-Agency Matrix
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Direct institutional responsibilities governing landslide surveillance, alert broadcast, and rapid engineering response.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white dark:bg-[#0c161e] p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Geological Survey of India (GSI)</div>
            <div className="text-slate-600 dark:text-slate-400">
              Nodal agency for landslide inventorying, susceptibility mapping, and threshold calibration for rainfall triggers.
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c161e] p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">State & District Disaster Cells (SDMA/DDMA)</div>
            <div className="text-slate-600 dark:text-slate-400">
              Enforces Level 2 and Level 3 evacuation orders, coordinates civil shelters, and activates local emergency radio nets.
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c161e] p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Border Roads Organisation (BRO)</div>
            <div className="text-slate-600 dark:text-slate-400">
              Primary rapid engineering response for road clearance, slope toe stabilization, and emergency Bailey bridge deployment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
