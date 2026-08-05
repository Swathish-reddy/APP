import React, { useState, useEffect } from 'react';
import { Building2, Bed, Stethoscope, Droplets, Wind, Activity, Users } from 'lucide-react';

export default function RightPanelCapacity() {
  const [capacity, setCapacity] = useState<any>(null);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/emergency/capacity");
        const data = await res.json();
        setCapacity(data);
      } catch (err) {
        console.error("Failed to fetch capacity:", err);
      }
    };
    fetchCapacity();
    const interval = setInterval(fetchCapacity, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderProgress = (occupied: number, total: number) => {
    const percent = Math.round((occupied / total) * 100);
    const color = percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-orange-500' : 'bg-emerald-500';
    return (
      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    );
  };

  if (!capacity) {
    return (
      <div className="h-full flex flex-col bg-card/60 border border-border/80 rounded-2xl backdrop-blur-md overflow-hidden p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted/50 rounded w-full md:w-1/2"></div>
          <div className="h-20 bg-muted/50 rounded"></div>
          <div className="h-20 bg-muted/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card/60 border border-border/80 rounded-2xl backdrop-blur-md overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <h2 className="text-lg font-bold text-foreground flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-indigo-400" />
          Facility Status
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        
        {/* Beds */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Critical Beds</h3>
          
          <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm font-medium text-foreground">
                <Bed className="w-4 h-4 mr-2 text-red-400" /> ICU
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">{capacity.icu_beds.occupied}</span>
                <span className="text-muted-foreground"> / {capacity.icu_beds.total}</span>
              </div>
            </div>
            {renderProgress(capacity.icu_beds.occupied, capacity.icu_beds.total)}
          </div>

          <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm font-medium text-foreground">
                <Activity className="w-4 h-4 mr-2 text-orange-400" /> ER Bays
              </div>
              <div className="text-sm">
                <span className="font-bold text-foreground">{capacity.er_beds.occupied}</span>
                <span className="text-muted-foreground"> / {capacity.er_beds.total}</span>
              </div>
            </div>
            {renderProgress(capacity.er_beds.occupied, capacity.er_beds.total)}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipment & Resources</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
              <Wind className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-xs text-muted-foreground">Ventilators</span>
              <span className="text-lg font-bold text-foreground">{capacity.ventilators.total - capacity.ventilators.occupied} <span className="text-xs font-normal text-muted-foreground">Avail</span></span>
            </div>
            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
              <Droplets className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-xs text-muted-foreground">O- Blood</span>
              <span className="text-lg font-bold text-foreground">{capacity.blood_units.o_neg} <span className="text-xs font-normal text-muted-foreground">Units</span></span>
            </div>
          </div>
        </div>

        {/* Specialists */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
            <span>On-Call Specialists</span>
            <span className="text-blue-400 cursor-pointer hover:underline">View All</span>
          </h3>
          
          <div className="space-y-2">
            {capacity.on_call_specialists.map((doc: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{doc.specialty}</p>
                  </div>
                </div>
                <div className={`text-[10px] px-2 py-1 rounded font-bold ${doc.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {doc.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
