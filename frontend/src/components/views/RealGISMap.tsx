import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ScaleControl, useMap, useMapEvents } from 'react-leaflet';
import { LocateFixed, Layers2, Maximize2, Minimize2, Search, RotateCcw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getRiskMap, RiskPoint } from '../../lib/api';
import { DISTRICT_REGISTRY } from '../../data/districtRegistry';

type Props = { region?: string; state?: string; darkMode?: boolean; onPointSelect?: (id: string) => void };
const RISK = { HIGH:'#dc2626', MEDIUM:'#f59e0b', LOW:'#16a34a', NONE:'#64748b' } as const;
const STREET = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const DARK = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABELS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

function color(r:string|null|undefined){ return r==='HIGH'?RISK.HIGH:r==='MEDIUM'?RISK.MEDIUM:r==='LOW'?RISK.LOW:RISK.NONE; }
function MapAutoFit({ points }: { points: RiskPoint[] }) {
  const map=useMap();
  useEffect(()=>{ if(!points.length) return; map.fitBounds(points.map(p=>[p.lat,p.lng] as [number,number]),{padding:[48,48],maxZoom:7}); },[points,map]);
  return null;
}
function MapInteraction({ onZoom }: { onZoom:(z:number)=>void }) { useMapEvents({ zoomend:e=>onZoom(e.target.getZoom()) }); return null; }
function LocateControl(){ const map=useMap(); return <button type="button" onClick={()=>map.locate({setView:true,maxZoom:11})} title="Locate me" className="absolute top-3 right-3 z-[900] h-10 w-10 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"><LocateFixed className="w-4 h-4"/></button>; }

export default function RealGISMap({ region='all', state='', darkMode=false, onPointSelect }: Props){
 const [points,setPoints]=useState<RiskPoint[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [updated,setUpdated]=useState('');
 const [basemap,setBasemap]=useState<'street'|'satellite'>('street'); const [showLabels,setShowLabels]=useState(true); const [fullscreen,setFullscreen]=useState(false); const [zoom,setZoom]=useState(5); const [query,setQuery]=useState('');
 async function load(){ try{setError(''); const d=await getRiskMap(region,state); const livePoints=d.points||[]; setPoints(livePoints); setUpdated(d.updated_at||''); if(!livePoints.length) setError('Live risk feed returned no points. Check the backend data sources.'); } catch(e){ console.error(e); setError('Live risk feed unavailable. District locations are shown in grey until environmental data reconnects.'); const fallback=DISTRICT_REGISTRY.filter(d=>!state || d.state.toLowerCase()===state.toLowerCase()).filter(d=>{const r=(region||'all').toLowerCase(); return r==='all' || r==='india' || (r==='northeast' && d.region==='Northeast India') || (r==='himalayas' && ['Western Himalayas','Eastern Himalayas'].includes(d.region)) || (r==='westernghats' && d.region==='Western Ghats') || (r==='easternghats' && d.region==='Eastern Ghats');}).map(d=>({...d,risk:null,risk_score:null,status:'UNAVAILABLE',data_quality:'UNAVAILABLE'} as RiskPoint)); setPoints(fallback); setUpdated(''); } finally{setLoading(false);} }
 useEffect(()=>{load(); const t=window.setInterval(load,5*60*1000); return()=>clearInterval(t)},[region,state]);
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase(); return q?points.filter(p=>`${p.name} ${p.state}`.toLowerCase().includes(q)):points;},[points,query]);
 const activeTile=basemap==='satellite'?SATELLITE:(darkMode?DARK:STREET);
 return <div className={`${fullscreen?'fixed inset-0 z-[2000] rounded-none':'relative rounded-xl'} w-full h-full min-h-[600px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner`}>
   {loading&&<div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-lg shadow-md border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200">Loading live risk layer…</div>}
   {error&&<div className="absolute top-4 left-4 z-[1000] max-w-sm bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur rounded-lg shadow-md border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-200">{error}</div>}
   <MapContainer center={[24.5,90.5]} zoom={zoom} minZoom={4} maxZoom={17} scrollWheelZoom zoomControl className="w-full h-full min-h-[600px]">
     <TileLayer attribution="Tiles © Esri" url={activeTile} maxZoom={19}/>
     {basemap==='satellite'&&showLabels&&<TileLayer attribution="Labels © Esri" url={LABELS} maxZoom={19} opacity={.95}/>}
     <MapAutoFit points={points}/><MapInteraction onZoom={setZoom}/><ScaleControl position="bottomleft"/><LocateControl/>
     {filtered.map(p=>{const c=color(p.risk); const radius=zoom>=10?9:zoom>=8?7:zoom>=6?6:5; return <CircleMarker key={p.id} center={[p.lat,p.lng]} radius={radius} pathOptions={{color:'#fff',fillColor:c,fillOpacity:.92,weight:2}} eventHandlers={{click:()=>onPointSelect?.(p.id)}}>
       <Popup maxWidth={320}>
         <div className="min-w-[220px] font-sans">
           <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-base">{p.name}</h3><p className="text-slate-500 dark:text-slate-400 text-xs">{p.state}</p></div><span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{background:`${c}18`,color:c}}>{p.risk||'N/A'}</span></div>
           <div className="grid grid-cols-2 gap-2 mt-3 text-xs"><div className="rounded bg-slate-50 dark:bg-slate-800 p-2"><div className="text-slate-400">Live risk index</div><b>{p.risk_score!=null?`${(p.risk_score*100).toFixed(1)}%`:'N/A'}</b></div><div className="rounded bg-slate-50 dark:bg-slate-800 p-2"><div className="text-slate-400">24h rainfall</div><b>{p.rainfall_24h_mm!=null?`${p.rainfall_24h_mm.toFixed(1)} mm`:'N/A'}</b></div></div>
           <p className="text-xs mt-2"><b>Soil moisture:</b> {p.soil_moisture_vol_frac!=null?p.soil_moisture_vol_frac.toFixed(3):'N/A'} m³/m³</p>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2"><b>Data:</b> {p.rainfall_source||'Unavailable'} · {p.status}</p>
           {p.risk_components&&<div className="mt-2 rounded bg-slate-50 dark:bg-slate-800 p-2 text-[10px]"><b>Risk drivers</b><div className="mt-1 grid grid-cols-3 gap-1"><span>Rain {p.risk_components.rainfall_trigger!=null?Math.round(p.risk_components.rainfall_trigger*100):'—'}%</span><span>Soil {p.risk_components.soil_saturation!=null?Math.round(p.risk_components.soil_saturation*100):'—'}%</span><span>History {p.risk_components.historical_exposure_prior!=null?Math.round(p.risk_components.historical_exposure_prior*100):'—'}%</span></div></div>}
           <p className="text-[10px] text-slate-400 mt-1">District display point · {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
         </div>
       </Popup>
     </CircleMarker>})}
   </MapContainer>
   <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 max-w-[calc(100%-7rem)]">
     <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center px-2 h-10 w-56 max-w-[52vw]"><Search className="w-4 h-4 text-slate-400 mr-2 shrink-0"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search district or state" className="w-full outline-none text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400"/></div>
     <button type="button" onClick={()=>setBasemap(v=>v==='street'?'satellite':'street')} title="Switch basemap" className="h-10 px-3 bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"><Layers2 className="w-4 h-4"/>{basemap==='street'?'Satellite':'Street'}</button>
     {basemap==='satellite'&&<button type="button" onClick={()=>setShowLabels(v=>!v)} className="hidden sm:block h-10 px-3 bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">Labels {showLabels?'On':'Off'}</button>}
   </div>
   <div className="absolute top-3 right-16 z-[1000] flex gap-2"><button type="button" onClick={()=>setQuery('')} title="Clear search" className="hidden sm:flex h-10 w-10 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-700 dark:text-slate-200"><RotateCcw className="w-4 h-4"/></button><button type="button" onClick={()=>setFullscreen(v=>!v)} title="Fullscreen" className="h-10 w-10 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">{fullscreen?<Minimize2 className="w-4 h-4"/>:<Maximize2 className="w-4 h-4"/>}</button></div>
   <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3 min-w-[180px] text-slate-800 dark:text-slate-100">
     <div className="flex items-center justify-between mb-2"><p className="font-semibold text-xs">Live landslide risk</p><span className="text-[9px] text-slate-400">Z{zoom}</span></div>
     <div className="space-y-1.5 text-[11px]"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow"/>Low</div><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow"/>Medium</div><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow"/>High</div></div>
     <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400">{filtered.length} monitoring points · {updated?new Date(updated).toLocaleTimeString():'—'}</div>
   </div>
 </div>;
}
