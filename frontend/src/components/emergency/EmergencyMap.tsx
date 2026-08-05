import React, { useEffect, useState } from 'react';
import { Map as MapIcon, Crosshair } from 'lucide-react';

export default function EmergencyMap() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate live ambulance movement
    setAmbulances([
      { id: 'AMB-104', x: 20, y: 80, code: 'Stroke Code', eta: '5m', criticality: 'High' },
      { id: 'AMB-211', x: 75, y: 30, code: 'Trauma', eta: '12m', criticality: 'Low' }
    ]);
    
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(amb => ({
        ...amb,
        // Move slightly towards center (50, 50)
        x: amb.x + (50 - amb.x) * 0.05 + (Math.random() * 2 - 1),
        y: amb.y + (50 - amb.y) * 0.05 + (Math.random() * 2 - 1),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card/60 border border-border rounded-xl p-0 relative overflow-hidden h-full min-h-[220px]">
      {/* Radar Background */}
      <div className="absolute inset-0 bg-background">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Radar Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-border opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full border border-border opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-full border border-blue-900/50 opacity-80"></div>
        
        {/* Radar Sweep Animation */}
        <div className="absolute top-1/2 left-1/2 w-[100%] h-[2px] origin-left bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-400/80 animate-[spin_4s_linear_infinite]" style={{ transform: 'translateY(-50%)' }}></div>
      </div>
      
      {/* Central Node (Hospital) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
        <div className="w-4 h-4 bg-blue-500 rounded-sm shadow-[0_0_15px_rgba(59,130,246,1)] flex items-center justify-center">
          <Crosshair className="w-3 h-3 text-foreground" />
        </div>
      </div>

      {/* Ambulances */}
      {ambulances.map((amb, i) => (
        <div 
          key={amb.id}
          className="absolute z-10 flex flex-col items-center transition-all duration-1000 ease-linear"
          style={{ left: `${amb.x}%`, top: `${amb.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${amb.criticality === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-orange-500'}`}></div>
            <div className={`absolute -inset-2 rounded-full border ${amb.criticality === 'High' ? 'border-red-500/50 animate-ping' : 'border-orange-500/30'} opacity-75`}></div>
          </div>
          <div className="mt-1 bg-card/90 border border-border rounded px-1.5 py-0.5 text-[8px] whitespace-nowrap backdrop-blur-sm shadow-xl">
            <span className={amb.criticality === 'High' ? 'text-red-400 font-bold' : 'text-foreground'}>{amb.id}</span>
          </div>
        </div>
      ))}

      {/* Foreground Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-20 flex flex-col justify-between items-start h-full p-4 pointer-events-none">
        <h3 className="text-foreground font-bold text-sm flex items-center bg-card/80 px-2 py-1 rounded backdrop-blur border border-border">
          <MapIcon className="w-4 h-4 mr-2 text-blue-400" /> Interactive Tracker
        </h3>
        
        <div className="mt-auto bg-card/90 backdrop-blur-md border border-border p-3 rounded-lg w-full flex items-center justify-between pointer-events-auto">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">{ambulances[0]?.id}</p>
            <p className="text-sm text-foreground font-bold">{ambulances[0]?.eta} away</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-red-400 font-bold uppercase">{ambulances[0]?.code}</p>
            <p className="text-[10px] text-muted-foreground">ETA Sync Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
