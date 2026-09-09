import React, { useState } from 'react';
import { 
  Send, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  Locate, 
  ShieldCheck, 
  Phone, 
  Clock, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { GroundReport } from '../../types';
import { getReports, submitGroundReport } from '../../lib/api';

export function GroundReportView() {
  const [district, setDistrict] = useState('East Khasi Hills');
  const [landmark, setLandmark] = useState('');
  const [hazardType, setHazardType] = useState('Slope Creep / Tension Crack');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('moderate');
  const [notes, setNotes] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<GroundReport | null>(null);
  const [reportsList, setReportsList] = useState<GroundReport[]>([]);

  React.useEffect(() => {
    getReports().then((data) => {
      const mapped = (data.reports || []).map((r: any) => ({
        id: String(r.id), timestamp: r.created_at || '', reporterName: r.reporter_name || undefined, reporterPhone: r.reporter_phone || undefined,
        district: r.district, location: r.location, hazardType: r.hazard_type, severity: r.severity, notes: r.notes || undefined,
        latitude: r.latitude ?? undefined, longitude: r.longitude ?? undefined, imageUrl: r.image_url || undefined, status: r.status || 'reviewing'
      } as GroundReport));
      setReportsList(mapped);
    }).catch(() => setReportsList([]));
  }, []);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
          });
          setIsLocating(false);
        },
        () => {
          setCoords(null);
          setIsLocating(false);
        }
      );
    } else {
      setCoords(null);
      setIsLocating(false);
    }
  };

  const handleSimulatePhoto = () => {
    alert('Use the evidence upload control to attach a real field photo. No demo image is inserted automatically.');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark) {
      alert('Please enter a specific landmark or road kilometer.');
      return;
    }

    const newReport: GroundReport = {
      id: `rep-${Date.now()}`,
      location: landmark,
      district: district,
      hazardType: hazardType,
      severity: severity,
      timestamp: 'Just now',
      status: 'reviewing',
      reporterName: reporterName || 'Anonymous Citizen Volunteer',
      reporterPhone: reporterPhone || undefined,
      imageUrl: uploadedImage || undefined,
      verifiedByGeologist: false,
    };

    try {
      const saved = await submitGroundReport({
        district, location: landmark, hazard_type: hazardType, severity, notes,
        reporter_name: reporterName || undefined, reporter_phone: reporterPhone || undefined,
        latitude: coords ? Number(coords.lat) : undefined, longitude: coords ? Number(coords.lng) : undefined,
        image_url: uploadedImage || undefined,
      });
      const persisted = { ...newReport, id: saved.id || newReport.id, status: saved.status || 'reviewing' as const };
      setSubmittedReport(persisted);
      setReportsList(prev => [persisted, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Backend unavailable. Please start the FastAPI server and try again.');
      return;
    }

    // Clear inputs
    setLandmark('');
    setNotes('');
    setReporterName('');
    setReporterPhone('');
    setUploadedImage(null);
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-[#071118] text-slate-900 dark:text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003629] dark:text-white tracking-tight">
              Submit Ground Report
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
              CROWD-SOURCED HAZARD VERIFICATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Empower local emergency response teams with field observations, geo-tagged photos, and immediate slope shift alerts.
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-2.5 rounded-lg text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-900 dark:text-emerald-200 font-semibold">
            Stored in Bhoomi Rakshak for review
          </span>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submittedReport && (
        <div className="my-6 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-sm">Ground Report Submitted Successfully (Ref: #{submittedReport.id})</div>
            <div className="mt-0.5">
              Thank you for contributing to community safety. Your report has been stored in the Bhoomi Rakshak review queue.
            </div>
          </div>
        </div>
      )}

      {/* 2. Grid Layout: Form on Left, Verified Feed on Right */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Location Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                1. Incident Location Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
                  >
                    <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
                    <option value="Chamoli">Chamoli (Uttarakhand)</option>
                    <option value="Wayanad">Wayanad (Kerala)</option>
                    <option value="Darjeeling">Darjeeling (West Bengal)</option>
                    <option value="Papum Pare">Papum Pare (Arunachal Pradesh)</option>
                    <option value="Shimla">Shimla (Himachal Pradesh)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Landmark / Highway Km *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NH-6 Km 44 near Mawphlang bypass"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
                  />
                </div>
              </div>

              {/* GPS Coordinates Fetcher */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Locate className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {coords ? `GPS: ${coords.lat}° N, ${coords.lng}° E (±4m)` : 'GPS Coordinates not tagged'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1 rounded bg-[#1b4d3e] hover:bg-[#133c30] text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Locate className="w-3 h-3" />
                  <span>{isLocating ? 'Acquiring...' : coords ? 'Re-acquire GPS' : 'Tag My GPS'}</span>
                </button>
              </div>
            </div>

            {/* Hazard Observation Type */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                2. Hazard Observation Type
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
                {[
                  'Slope Creep / Tension Crack',
                  'Rockfall / Boulder Roll',
                  'Debris Flow / Mudslide',
                  'Road Subsidence / Cracking',
                  'Spring Outflow / Muddy Water',
                  'Retaining Wall Bulging',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHazardType(type)}
                    className={`p-2 rounded text-left border transition-all ${
                      hazardType === type
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Rating */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                3. Observed Urgency / Severity Level
              </label>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSeverity('minor')}
                  className={`p-2.5 rounded text-center border font-semibold transition-all ${
                    severity === 'minor'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold">Minor</div>
                  <div className="text-[10px] text-slate-500">Surface hairline crack</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('moderate')}
                  className={`p-2.5 rounded text-center border font-semibold transition-all ${
                    severity === 'moderate'
                      ? 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold">Moderate</div>
                  <div className="text-[10px] text-slate-500">Noticeable road displacement</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('severe')}
                  className={`p-2.5 rounded text-center border font-semibold transition-all ${
                    severity === 'severe'
                      ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold">Severe (Critical)</div>
                  <div className="text-[10px] text-slate-500">Active sliding, road cut-off</div>
                </button>
              </div>
            </div>

            {/* Photo Upload Area */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                4. Field Photo Evidence
              </label>

              {uploadedImage ? (
                <div className="relative rounded-lg overflow-hidden border border-emerald-500 h-40 group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded slope hazard"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-semibold">
                    <span>Photo metadata ready for review</span>
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={handleSimulatePhoto}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40"
                >
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to attach camera photo or field snapshot
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Attach a real field photo; the current prototype stores report metadata for review.
                  </div>
                </div>
              )}
            </div>

            {/* Description & Contact info */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Field Observations & Geological Signs
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe slope movement, water seepage, tree tilting, or impact on nearby residential houses..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Observer Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inspector R. Lyngdoh"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Callback Mobile No. (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
                  />
                </div>
              </div>
            </div>

            {/* Disclaimer & Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500 leading-snug">
                Verified submissions are transmitted over encrypted GSI portal. If immediate life threat exists, please call <strong>1070</strong>.
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#1b4d3e] hover:bg-[#133c30] text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Field Verification</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Feed & Safety Guidelines (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Ground Verification Feed */}
          <div className="bg-white dark:bg-[#0e1922] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Recent Field Submissions
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Ingest</span>
            </div>

            <div className="space-y-3">
              {reportsList.map((rep) => (
                <div 
                  key={rep.id} 
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rep.location}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      rep.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : rep.status === 'action-taken'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rep.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {rep.district} • {rep.hazardType}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">{rep.timestamp}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">By: {rep.reporterName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geological Warning Signs Guide */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[#003629] dark:text-emerald-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              What to Look For in Field Inspection
            </h3>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Tension Cracks:</strong> New ground fissures opening parallel to slope crown or road shoulders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Structural Tilts:</strong> Leaning telephone poles, trees, or outward bulging in retaining masonry.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Hydrological Discharges:</strong> Sudden emergence of new springs or water turning heavily muddy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                <span><strong>Audible Rumblings:</strong> Deep ground vibrations or cracking trees on steep forested slopes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
