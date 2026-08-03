import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface Case {
  id: string;
  name?: string;
  type?: string;
  age?: number;
  reason: string;
  triage: string;
  time_in?: string;
  eta?: string;
  critical?: boolean;
}

export default function LeftPanelQueue() {
  const [activeTab, setActiveTab] = useState('critical');
  const [data, setData] = useState<{critical: Case[], waiting: Case[], incoming: Case[]}>({
    critical: [], waiting: [], incoming: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live cases
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/v1/emergency/active-cases", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling for now
    return () => clearInterval(interval);
  }, []);

  const renderCase = (c: Case) => (
    <div key={c.id} className="group relative bg-slate-900/40 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer overflow-hidden">
      {/* Background glow if critical */}
      {c.triage === 'ESI-1' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
      )}
      {c.triage === 'ESI-2' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
      )}
      
      <div className="flex justify-between items-start mb-2 pl-2">
        <div>
          <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
            {c.name || c.id}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">{c.reason}</p>
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${
          c.triage === 'ESI-1' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          c.triage === 'ESI-2' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {c.triage || 'Pending'}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pl-2 text-xs">
        <div className="flex items-center text-slate-500">
          <Clock className="w-3 h-3 mr-1" />
          {c.time_in || c.eta}
        </div>
        <button className="flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
          View Detail <ChevronRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-bold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Live Queue
        </h2>
        
        {/* Search & Filter */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search ID, Name..." 
              className="w-full bg-slate-800/50 border border-slate-700 text-sm text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30">
        <button 
          onClick={() => setActiveTab('critical')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${activeTab === 'critical' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          CRITICAL ({data.critical.length})
        </button>
        <button 
          onClick={() => setActiveTab('waiting')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${activeTab === 'waiting' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          WAITING ({data.waiting.length})
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${activeTab === 'incoming' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          INCOMING ({data.incoming.length})
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'critical' && data.critical.map(renderCase)}
            {activeTab === 'waiting' && data.waiting.map(renderCase)}
            {activeTab === 'incoming' && data.incoming.map(renderCase)}
            
            {data[activeTab as keyof typeof data].length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">No cases in this queue.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
