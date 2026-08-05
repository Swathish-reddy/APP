import React, { useState, useEffect } from 'react';
import { Clock, Wifi, Activity, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function TopNavigation() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 md:px-6 z-20 shadow-lg">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="text-red-500 h-6 w-6 animate-pulse" />
          <h1 className="text-xl font-bold text-foreground tracking-widest uppercase">EOC Command</h1>
        </div>
        <div className="h-6 w-px bg-slate-700"></div>
        <div className="flex items-center space-x-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider">Level 1 Emergency</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 text-foreground bg-muted/50 px-4 py-1.5 rounded-lg border border-border/50">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-lg font-medium">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {time.getMilliseconds().toString().padStart(3, '0')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Wifi className="w-4 h-4 text-emerald-500" />
          <span>Live Link Active</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>AI Systems Nominal</span>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-muted border border-slate-600 flex items-center justify-center text-xs font-bold text-foreground">
          CMD
        </div>
      </div>
    </div>
  );
}
