import { BASE_URL } from "../../services/api";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Building2, Stethoscope, Video, Calendar, Clock, Navigation2, CheckCircle2 } from "lucide-react";
import { AppointmentBooking } from "./AppointmentBooking";

export const DoctorDiscovery = ({ patientId }: { patientId: string }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        const docRes = await fetch(`${BASE_URL}/doctors/nearby`, { headers });
        if (docRes.ok) setDoctors(await docRes.json());

        const hospRes = await fetch(`${BASE_URL}/doctors/hospitals`, { headers });
        if (hospRes.ok) setHospitals(await hospRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className=`p-4 md:p-4 md:p-4 md:p-8 text-center text-muted-foreground animate-pulse">Finding top specialists near you...</div>;

  if (selectedDoctor) {
    return <AppointmentBooking doctor={selectedDoctor} patientId={patientId} onBack={() => setSelectedDoctor(null)} />;
  }

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-500" />
            Specialist Discovery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-matched healthcare providers based on your clinical profile.
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-lg">
          <Button 
            variant={view === "list" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setView("list")}
            className="rounded-md"
          >
            List View
          </Button>
          <Button 
            variant={view === "map" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setView("map")}
            className="rounded-md"
          >
            Map View
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search by specialty, condition, or doctor name..."
          className="w-full pl-9 pr-4 py-3 bg-card dark:bg-card border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map(doc => (
          <Card key={doc.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card/50 dark:bg-card/50 backdrop-blur">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-foreground font-bold text-lg shadow-inner">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-foreground leading-tight">{doc.name}</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-xs font-bold">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {doc.rating}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Building2 className="w-3.5 h-3.5 mr-2" />
                    {doc.hospital}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 mr-2" />
                    {doc.distance_km} km away
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    {doc.experience_years} Years Experience
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {doc.telemedicine_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-semibold">
                      <Video className="w-3 h-3 mr-1" /> Telemedicine
                    </span>
                  )}
                  {doc.available_today && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Available Today
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-muted/50 p-3 flex justify-between items-center border-t border-slate-100 dark:border-border">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ${doc.consultation_fee} <span className="text-[10px] text-muted-foreground font-normal">/ consult</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg px-4" onClick={() => setSelectedDoctor(doc)}>
                  Book Visit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDoctors.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No specialists found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
