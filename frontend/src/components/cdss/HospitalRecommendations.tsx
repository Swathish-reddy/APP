import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Navigation2, Activity, ShieldAlert, Phone } from "lucide-react";

export const HospitalRecommendations = ({ patientId }: { patientId: string }) => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`http://localhost:8000/api/v1/doctors/hospitals`, { headers });
        if (res.ok) setHospitals(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  if (loading) return <div className="p-4 md:p-4 md:p-4 md:p-8 text-center text-muted-foreground animate-pulse">Scanning nearby healthcare facilities...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          Recommended Facilities
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map(hosp => (
          <Card key={hosp.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-card/50 dark:bg-card/50 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-foreground leading-tight max-w-[75%]">{hosp.name}</h4>
                <div className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                  {hosp.distance_km} km
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {hosp.emergency_available && (
                  <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-50 text-red-600 dark:bg-red-950/30 rounded">
                    <ShieldAlert className="w-3 h-3 mr-1" /> ER
                  </span>
                )}
                {hosp.icu_available && (
                  <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-amber-50 text-amber-600 dark:bg-amber-950/30 rounded">
                    <Activity className="w-3 h-3 mr-1" /> ICU
                  </span>
                )}
                <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-600 dark:bg-muted rounded">
                  {hosp.rating} Stars
                </span>
              </div>
              
              {hosp.departments && hosp.departments.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Departments</p>
                  <p className="text-xs text-foreground font-medium truncate">
                    {hosp.departments.slice(0,3).join(", ")}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-border">
                <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                  <Phone className="w-3 h-3 mr-1" /> Call
                </Button>
                <Button size="sm" className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-foreground">
                  <Navigation2 className="w-3 h-3 mr-1" /> Navigate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
