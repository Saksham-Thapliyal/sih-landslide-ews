import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  Mountain, 
  Activity, 
  CloudRain, 
  ChevronRight 
} from 'lucide-react';
import { DISTRICTS_DATA } from '../../data/districtStore';
import { getDistrictRisk } from '../../lib/api';

interface AiGeohazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistrict: (districtId: string) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export function AiGeohazardModal({ isOpen, onClose, onSelectDistrict }: AiGeohazardModalProps) {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Greetings. I am the Bhoomi Rakshak risk assistant. I summarize live rainfall, soil-moisture and risk-index data from the backend. How can I assist your hazard assessment today?',
      time: '14:30 IST',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Assess current landslide risk for East Khasi Hills',
    'What does high soil moisture mean for slope stability?',
    'What are NDMA Level 3 citizen evacuation protocols?',
    'Which sectors along NH-6 are at high rockfall risk?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const lower = query.toLowerCase();
      const match = Object.values(DISTRICTS_DATA).find(d =>
        lower.includes(d.name.toLowerCase()) || lower.includes(d.id.replaceAll('-', ' '))
      );

      if (match) {
        const live = await getDistrictRisk(match.id);
        const responseText = `Live assessment for ${live.name}, ${live.state}:\n• Live Risk: ${live.risk ?? 'UNAVAILABLE'}\n• Live Risk Score: ${live.risk_score != null ? (live.risk_score * 100).toFixed(1) : 'N/A'}%\n• 24-Hour Rainfall: ${live.rainfall_24h_mm != null ? live.rainfall_24h_mm.toFixed(1) : 'N/A'} mm\n• Soil Moisture: ${live.soil_moisture_vol_frac != null ? live.soil_moisture_vol_frac.toFixed(3) : 'N/A'} m³/m³\n• Rainfall Source: ${live.rainfall_source ?? 'N/A'}\n• Soil-Moisture Source: ${live.soil_moisture_source ?? 'N/A'}\n• Coordinates: ${live.lat.toFixed(4)}, ${live.lng.toFixed(4)}\n• Updated: ${live.updated_at ? new Date(live.updated_at).toLocaleString() : 'N/A'}`;
        setMessages((prev) => [...prev, { sender: 'ai', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else {
        const responseText = `I can provide live district risk when a monitored district is named. The live risk index uses current rainfall, soil moisture and historical exposure context. Open the GIS Risk Map for the latest assessment across monitored districts.`;
        setMessages((prev) => [...prev, { sender: 'ai', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'I could not reach the live Bhoomi Rakshak backend. Check that FastAPI is running on localhost:8000.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0c161d] w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px] animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-[#0b2b22] text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                Bhoomi Rakshak Risk Intelligence
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>
              <div className="text-[11px] text-emerald-300 font-mono">
                Engine: Live Risk Index + Environmental Data
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 font-semibold uppercase text-[10px] pl-1 flex-shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3 rounded-lg leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1b4d3e] text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 font-mono text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#1b4d3e] text-white flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] ml-1">Reading live environmental indicators...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about district risks, rainfall thresholds, soil mechanics..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1b4d3e]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            className="px-4 py-2 bg-[#1b4d3e] hover:bg-[#133c30] text-white rounded-md text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Ask</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
