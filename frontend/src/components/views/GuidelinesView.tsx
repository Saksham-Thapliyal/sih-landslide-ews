import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle, AlertTriangle, PhoneCall, Compass, Home } from 'lucide-react';

export function GuidelinesView() {
  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003629] dark:text-white tracking-tight">
              Community Landslide Risk Guidelines
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              NDMA SAFETY DO'S & DON'TS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Essential citizen safety measures for communities residing along vulnerable mountain hill slopes.
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2.5 rounded-lg text-xs flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-600" />
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            Emergency Helpline: 1070 / 112
          </span>
        </div>
      </div>

      {/* Grid of Guidelines */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DO'S */}
        <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-emerald-300 dark:border-emerald-900 p-6 shadow-sm">
          <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            DO'S — Critical Actions During High Rainfall
          </h3>
          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>Monitor Weather & Soil Saturation:</strong> Track Bhoomi Rakshak CAP alerts and IMD heavy rainfall warnings.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>Watch for Drainage Changes:</strong> Keep stormwater drains clear of debris, leaves, and construction soil.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>Prepare an Emergency Evacuation Kit:</strong> Keep medicines, water, battery radio, identification documents, and torch ready.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>Evacuate Immediately When Ordered:</strong> Move uphill or away from the path of mudflows; do not delay to save possessions.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>Report Slope Fissures:</strong> Submit ground observations through the Bhoomi Rakshak field verification portal.</span>
            </li>
          </ul>
        </div>

        {/* DON'TS */}
        <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-red-300 dark:border-red-900 p-6 shadow-sm">
          <h3 className="text-base font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            DON'TS — High-Risk Behaviors to Avoid
          </h3>
          <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>DO NOT Build Near Hill Edges:</strong> Avoid constructing or staying directly at the toe or crown of steep unreinforced slopes.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>DO NOT Drive Through Mudflows:</strong> Mudslides carry boulders capable of washing heavy vehicles away in seconds.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>DO NOT Cut the Toe of Slopes:</strong> Unauthorized excavation destabilizes the natural shear strength of the hillside.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>DO NOT Ignore Warning Signs:</strong> Cracking sounds, leaning trees, or muddy spring water are immediate precursors to failure.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></span>
              <span><strong>DO NOT Re-enter Impact Zones:</strong> Secondary landslides frequently follow initial slips during sustained rainfall.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
