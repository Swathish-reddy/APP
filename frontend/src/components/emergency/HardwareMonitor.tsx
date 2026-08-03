import React, { useState, useEffect } from 'react';
import { Wifi, Bluetooth, Battery, Activity } from 'lucide-react';

export default function HardwareMonitor() {
  const [devices, setDevices] = useState([
    { id: 'dev-1', name: 'ICU Ventilator 04', type: 'wifi', battery: 100, signal: 95, status: 'Active' },
    { id: 'dev-2', name: 'Apple Watch - Patient', type: 'ble', battery: 42, signal: 68, status: 'Active' },
    { id: 'dev-3', name: 'Portable ECG', type: 'wifi', battery: 85, signal: 92, status: 'Active' },
  ]);

  useEffect(() => {
    // Simulate slight fluctuations in signal and battery
    const interval = setInterval(() => {
      setDevices(prev => prev.map(dev => ({
        ...dev,
        signal: Math.max(0, Math.min(100, dev.signal + (Math.random() > 0.5 ? 2 : -2))),
        battery: Math.max(0, dev.battery - (Math.random() > 0.9 ? 1 : 0))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col h-full relative overflow-hidden">
      <h3 className="text-white font-bold mb-3 flex items-center text-sm">
        <Activity className="w-4 h-4 mr-2 text-blue-400" /> Connected Devices
      </h3>
      
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide pr-1">
        {devices.map(dev => (
          <div key={dev.id} className="bg-slate-950/50 border border-slate-700/50 p-2.5 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-md ${dev.type === 'wifi' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {dev.type === 'wifi' ? <Wifi className="w-4 h-4" /> : <Bluetooth className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">{dev.name}</p>
                <p className="text-[10px] text-emerald-400">Streaming Data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center text-[10px] text-slate-400">
                  <Battery className={`w-3 h-3 mr-1 ${dev.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
                  {dev.battery}%
                </div>
                <div className="flex items-center text-[10px] text-slate-400 mt-0.5">
                  <Wifi className="w-3 h-3 mr-1 text-slate-500" />
                  {dev.signal}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white rounded-lg transition-colors border-dashed">
        + Pair New Device
      </button>
    </div>
  );
}
