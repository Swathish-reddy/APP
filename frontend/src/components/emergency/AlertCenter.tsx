import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // alerts for the demo
    const timer = setTimeout(() => {
      setAlerts([
        {
          id: '1',
          title: 'CODE BLUE: Cardiac Arrest',
          patient: 'ICU Bed 4',
          time: 'Just now',
          level: 'critical'
        }
      ]);
    }, 15000); // Trigger after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-4 pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto bg-red-600/90 backdrop-blur-xl border-2 border-red-500 text-foreground p-4 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center min-w-[400px]"
          >
            <div className="bg-card/20 p-3 rounded-full mr-4">
              <AlertTriangle className="w-8 h-8 text-foreground animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xl tracking-wide uppercase">{alert.title}</h3>
              <p className="font-medium text-red-100">{alert.patient} &bull; {alert.time}</p>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="ml-4 p-2 hover:bg-card/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
