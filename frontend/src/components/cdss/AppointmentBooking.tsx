import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Home, Navigation2, CheckCircle2, ChevronLeft, Building2 } from "lucide-react";

interface AppointmentBookingProps {
  doctor: any;
  patientId: string;
  onBack: () => void;
};
export const AppointmentBooking = ({ doctor, patientId, onBack }: AppointmentBookingProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultType, setConsultType] = useState<string>("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  // Generate some mock upcoming dates
  const dates = Array.from({length: 5}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  const times = doctor.available_slots || ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

  const handleBook = async () => {
    setBooking(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      const payload = {
        doctor_id: doctor.id,
        hospital_id: doctor.hospital?.id || "N/A",
        date: selectedDate,
        time: selectedTime,
        consultation_type: consultType
      };

      const res = await fetch(`http://localhost:8000/api/v1/appointments/book/${patientId.replace("P", "")}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBooked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Confirmed!</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your {consultType.toLowerCase()} consultation with {doctor.name} is scheduled for {selectedDate} at {selectedTime}.
          </p>
        </div>
        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={onBack}>Back to Discovery</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-foreground">Add to Calendar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <Button variant="ghost" className="text-muted-foreground hover:text-foreground pl-0" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="border-none shadow-md overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur">
        <CardContent className="p-0 flex flex-col md:flex-row">
          {}
          <div className="bg-slate-50 dark:bg-muted p-4 md:p-4 md:p-4 md:p-8 md:w-full md:w-full lg:w-full md:w-full lg:w-full md:w-full lg:w-1/3 border-r border-slate-200 dark:border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-foreground font-bold text-2xl md:text-2xl md:text-2xl md:text-3xl shadow-inner mb-4">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-foreground">{doctor.name}</h2>
            <p className="text-blue-600 dark:text-blue-400 font-medium">{doctor.specialization}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="w-4 h-4 mr-3 text-muted-foreground" />
                {doctor.hospital || "Independent Practice"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                {doctor.experience_years} Years Experience
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-border">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-bold text-foreground">${doctor.consultation_fee}</span>
              </div>
            </div>
          </div>

          {}
          <div className="p-4 md:p-4 md:p-4 md:p-8 md:w-2/3">
            <h3 className="text-lg font-bold mb-6">Book Appointment</h3>
            
            <div className="space-y-8">
              {}
              <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${selectedDate === d.date ? 'bg-blue-600 border-blue-600 text-foreground shadow-md' : 'bg-card text-foreground hover:border-blue-300'}`}
                    >
                      <span className="text-xs font-medium opacity-80">{d.month}</span>
                      <span className="text-xl font-bold my-0.5">{d.dateNum}</span>
                      <span className="text-[10px] uppercase">{d.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {}
              {selectedDate && (
                <div className="animate-in fade-in duration-300">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Available Slots</label>
                  <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {times.map((t: string, i: number) => (
                      <button 
                        key={i}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${selectedTime === t ? 'bg-indigo-600 border-indigo-600 text-foreground shadow-md' : 'bg-card text-foreground hover:border-indigo-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {}
              {selectedTime && (
                <div className="animate-in fade-in duration-300">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Consultation Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setConsultType("Video")}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${consultType === "Video" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-card text-muted-foreground hover:border-emerald-300'}`}
                    >
                      <Video className="w-6 h-6" />
                      <span className="text-sm font-semibold">Video Call</span>
                    </button>
                    <button 
                      onClick={() => setConsultType("In-person")}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${consultType === "In-person" ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-card text-muted-foreground hover:border-blue-300'}`}
                    >
                      <Navigation2 className="w-6 h-6" />
                      <span className="text-sm font-semibold">Clinic Visit</span>
                    </button>
                    <button 
                      onClick={() => setConsultType("Home Visit")}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${consultType === "Home Visit" ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' : 'bg-card text-muted-foreground hover:border-purple-300'}`}
                    >
                      <Home className="w-6 h-6" />
                      <span className="text-sm font-semibold">Home Visit</span>
                    </button>
                  </div>
                </div>
              )}

              {}
              {consultType && (
                <div className="pt-4 border-t border-slate-200 dark:border-border flex justify-end animate-in fade-in duration-300">
                  <Button 
                    size="lg" 
                    className="bg-card dark:bg-card text-foreground dark:text-slate-900 hover:bg-muted dark:hover:bg-slate-100 shadow-xl px-4 md:px-4 md:px-4 md:px-8"
                    onClick={handleBook}
                    disabled={booking}
                  >
                    {booking ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
