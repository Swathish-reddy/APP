import React, { useState } from 'react';
import { Calendar, UserPlus, CheckCircle2, X, Clock, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppointmentSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentScheduler({ isOpen, onClose }: AppointmentSchedulerProps) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const doctors = [
    { id: 'd1', name: 'Dr. Sarah Jenkins', spec: 'Cardiology', rating: 4.9, available: 'Today' },
    { id: 'd2', name: 'Dr. Marcus Wei', spec: 'Internal Medicine', rating: 4.8, available: 'Tomorrow' },
  ];

  const timeSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const handleBook = () => {
    setStep(3);
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setStep(1);
        setSelectedDoctor(null);
        setSelectedTime(null);
      }, 500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-card border border-border rounded-2xl p-4 md:p-6 w-full max-w-md shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
          
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-indigo-400" />
                Follow-up Appointment
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Select a recommended specialist based on the AI Action Plan.</p>
              
              <div className="space-y-3 mb-6">
                {doctors.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedDoctor === doc.id ? 'bg-indigo-500/20 border-indigo-500' : 'bg-muted/50 border-border hover:bg-muted'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-foreground font-semibold flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2 text-muted-foreground" /> {doc.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{doc.spec} • {doc.rating} ★</p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-medium">{doc.available}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                disabled={!selectedDoctor}
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-foreground font-bold rounded-xl transition-colors"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
                Select Time Slot
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Available slots for {doctors.find(d => d.id === selectedDoctor)?.name}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {timeSlots.map(time => (
                  <div 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${selectedTime === time ? 'bg-indigo-500/20 border-indigo-500 text-foreground font-bold' : 'bg-muted/50 border-border text-foreground hover:bg-muted'}`}
                  >
                    <Clock className="w-4 h-4 inline-block mr-1 opacity-70" /> {time}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-muted hover:bg-slate-700 text-foreground font-bold rounded-xl transition-colors">
                  Back
                </button>
                <button 
                  disabled={!selectedTime}
                  onClick={handleBook}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-foreground font-bold rounded-xl transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-[scale-in_0.3s_ease-out]" />
              <p className="text-foreground font-bold text-lg">Appointment Confirmed</p>
              <p className="text-sm text-muted-foreground mt-2">Notification sent to patient and doctor.</p>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
