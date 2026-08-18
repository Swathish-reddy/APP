import { BASE_URL } from "../../services/api";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Stethoscope, Heart, Droplets, Brain, Search, UserCircle, Target, ActivitySquare, UploadCloud, CalendarPlus } from 'lucide-react';
import EmergencyMap from './EmergencyMap';
import HardwareMonitor from './HardwareMonitor';
import ReportUploaderModal from './ReportUploaderModal';
import AppointmentScheduler from './AppointmentScheduler';

export default function CenterPanelDashboard() {
  const [patientId, setPatientId] = useState("");
  const [triageData, setTriageData] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [showUploader, setShowUploader] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  
  const [liveVitals, setLiveVitals] = useState({
    hr: 72, bp: '120/80', spo2: 98, resp: 16
  });

  useEffect(() => {
    if (!triageData) return;
    const interval = setInterval(() => {
      setLiveVitals(prev => ({
        hr: prev.hr + (Math.random() > 0.5 ? 1 : -1),
        bp: prev.bp, 
        spo2: Math.min(100, prev.spo2 + (Math.random() > 0.8 ? 1 : (Math.random() < 0.2 ? -1 : 0))),
        resp: prev.resp + (Math.random() > 0.7 ? 1 : -1)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [triageData]);

  const handleTriage = async () => {
    if(!patientId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`${BASE_URL}/emergency/${patientId}/triage`, {
        method: `POST", headers, body: JSON.stringify({})
      });
      if(!res.ok) throw new Error("Failed triage");
      const data = await res.json();
      setTriageData(data);
      
      const planRes = await fetch(`${BASE_URL}/emergency/action-plan/${patientId}`, { headers });
      if(planRes.ok) {
        const planData = await planRes.json();
        setActionPlan(planData);
      }
      
      setLiveVitals({ hr: 135, bp: '90/60', spo2: 89, resp: 28 }); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Simulate AI updating the action plan after report upload
    if(actionPlan) {
      setActionPlan({
        ...actionPlan,
        immediate_actions: [`Analyze New MRI Report", ...actionPlan.immediate_actions],
        reasoning: "New imaging data detected. Prioritizing review of cranial structures." + actionPlan.reasoning
      });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden relative">
      
      <div className="bg-card/60 border border-border/80 rounded-2xl backdrop-blur-md p-5 flex flex-wrap lg:flex-nowrap items-center justify-between shadow-lg gap-4">
        <div className="flex-1 w-full flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Enter Patient ID, Scan QR, or Wearable ID..."
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-background/50 border border-border text-foreground rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleTriage()}
            />
          </div>
          <button 
            onClick={handleTriage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-foreground font-bold py-3 px-4 md:px-4 md:px-4 md:px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <Activity className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
            <span className="hidden sm:inline">{loading ? "Analyzing..." : "AI Analyze"}</span>
          </button>
          
          {}
          <button 
            onClick={() => setShowUploader(true)}
            className="bg-muted hover:bg-slate-700 border border-border text-foreground font-bold py-3 px-4 rounded-xl transition-all flex items-center gap-2"
            title="Upload Lab Reports or Imaging"
          >
            <UploadCloud className="w-5 h-5 text-blue-400" />
          </button>
        </div>
        
        {triageData && (
          <div className="flex items-center gap-4 border-l border-border pl-6 shrink-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">AI Severity</p>
              <p className="text-2xl font-black text-red-500 tracking-tight">{triageData["1_triage_priority"]?.split(':')[0] || 'Level 1'}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {triageData ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto scrollbar-hide pb-4">
          
          <div className="space-y-4 flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
              <div className="bg-card/60 border border-border rounded-xl p-4 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl font-black text-foreground tracking-tighter">{liveVitals.hr}</span>
                  <span className="text-sm text-muted-foreground font-medium mb-1">bpm</span>
                </div>
              </div>

              <div className="bg-card/60 border border-border rounded-xl p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">SpO2</span>
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl font-black tracking-tighter ${liveVitals.spo2 < 92 ? 'text-red-400' : 'text-foreground'}`}>{liveVitals.spo2}</span>
                  <span className="text-sm text-muted-foreground font-medium mb-1">%</span>
                </div>
              </div>

              <div className="bg-card/60 border border-border rounded-xl p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Blood Press.</span>
                  <ActivitySquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-2xl md:text-2xl md:text-3xl font-black text-foreground tracking-tighter">{liveVitals.bp}</span>
                  <span className="text-sm text-muted-foreground font-medium mb-1">mmHg</span>
                </div>
              </div>

              <div className="bg-card/60 border border-border rounded-xl p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Resp. Rate</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-2xl md:text-3xl md:text-2xl md:text-3xl md:text-4xl font-black tracking-tighter ${liveVitals.resp > 22 ? 'text-orange-400' : 'text-foreground'}`}>{liveVitals.resp}</span>
                  <span className="text-sm text-muted-foreground font-medium mb-1">/min</span>
                </div>
              </div>
            </div>

            {}
            <div className="flex-1 min-h-[200px]">
              <HardwareMonitor />
            </div>
            
          </div>

          <div className="space-y-4 flex flex-col h-full">
            <div className="bg-card/60 border border-border rounded-xl p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
                <h3 className="text-foreground font-bold flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-400" /> Emergency Action Plan
                </h3>
                <button 
                  onClick={() => setShowScheduler(true)}
                  className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center transition-colors"
                >
                  <CalendarPlus className="w-3 h-3 mr-1" /> Follow-up
                </button>
              </div>
              
              {actionPlan ? (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Immediate Actions</h4>
                    <ul className="space-y-2">
                      {actionPlan.immediate_actions?.map((act: string, i: number) => (
                        <li key={i} className="flex items-start bg-muted/50 p-2 rounded-lg border border-border/50">
                          <div className="min-w-4 mt-0.5"><div className="w-2 h-2 rounded-full bg-red-500"></div></div>
                          <span className="text-sm text-foreground">{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {actionPlan.medications?.map((med: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">AI Reasoning</h4>
                    <p className="text-xs text-muted-foreground italic bg-background/50 p-2 rounded-lg border-l-2 border-slate-600">
                      {actionPlan.reasoning}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-slate-600 animate-spin" />
                </div>
              )}
            </div>

            {}
            <div className="shrink-0 h-[220px]">
              <EmergencyMap />
            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-card/30 border border-border/50 rounded-2xl border-dashed">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <UserCircle className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Awaiting Patient Target</h2>
          <p className="text-muted-foreground max-w-sm text-center mt-2 text-sm">
            Enter a Patient ID, scan a wristband, or connect a wearable stream to initialize the AI Triage Engine and generate an emergency profile.
          </p>
        </div>
      )}

      {}
      <ReportUploaderModal 
        isOpen={showUploader} 
        onClose={() => setShowUploader(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />
      <AppointmentScheduler 
        isOpen={showScheduler} 
        onClose={() => setShowScheduler(false)} 
      />
      
    </div>
  );
}
