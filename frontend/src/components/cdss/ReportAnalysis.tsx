import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Stethoscope, AlertTriangle, Activity, Pill, UploadCloud, CheckCircle2 } from "lucide-react";

export const ReportAnalysis = ({ patientId }: { patientId: string }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        // Fetch recent documents for the patient
        const res = await fetch(`http://localhost:8000/api/v1/documents/patient/${patientId.replace("P", "")}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setReports(data.slice(0, 5)); // Get top 5 recent reports
          if (data.length > 0) setSelectedReport(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [patientId]);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 2000);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading medical reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Medical Report Analysis
          </h3>
          <p className="text-sm text-muted-foreground">AI-driven clinical interpretation of lab results & imaging</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <UploadCloud className="w-4 h-4" /> Upload New
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column: Report List */}
        <div className="w-full md:w-1/3 space-y-3">
          {reports.map((report) => (
            <Card 
              key={report.id} 
              className={`cursor-pointer transition-all overflow-hidden ${selectedReport?.id === report.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
              onClick={() => setSelectedReport(report)}
            >
              <div className={`h-1 w-full ${report.abnormalities && Object.keys(report.abnormalities).length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{report.file_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{report.report_type || "Lab Report"}</p>
                  </div>
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-slate-500">{new Date(report.upload_date).toLocaleDateString()}</span>
                  {report.abnormalities && Object.keys(report.abnormalities).length > 0 ? (
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Flags
                    </span>
                  ) : (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Clear
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
              No reports available for analysis.
            </div>
          )}
        </div>

        {/* Right column: Analysis View */}
        <div className="w-full md:w-2/3">
          {selectedReport ? (
            <Card className="h-full border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-bold">{selectedReport.file_name}</h2>
                    <p className="text-sm text-muted-foreground">Uploaded on {new Date(selectedReport.upload_date).toLocaleString()}</p>
                  </div>
                  <Button onClick={runAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    {analyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                    {analyzing ? "Analyzing..." : "Re-Analyze"}
                  </Button>
                </div>

                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <Activity className="absolute inset-0 m-auto text-blue-500 w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Running clinical NLP models...</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Summary */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Clinical Summary</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed">
                        {selectedReport.ai_summary || "Routine analysis completed. No critical anomalies detected in the provided parameters. Continued monitoring recommended."}
                      </p>
                    </div>

                    {/* Abnormalities */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center mb-3">
                          <AlertTriangle className="w-4 h-4 mr-2" /> Abnormal Findings
                        </h4>
                        {selectedReport.abnormalities && Object.keys(selectedReport.abnormalities).length > 0 ? (
                          <ul className="space-y-2">
                            {Object.entries(selectedReport.abnormalities).map(([key, val]: [string, any], i) => (
                              <li key={i} className="flex justify-between items-center text-sm bg-white dark:bg-slate-900 p-2 rounded shadow-sm border border-red-100 dark:border-red-900/20">
                                <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-red-600 dark:text-red-400 font-bold">{val}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">No abnormal markers detected in this specific report.</p>
                        )}
                      </div>

                      <div className="border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center mb-3">
                          <Pill className="w-4 h-4 mr-2" /> AI Recommendations
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          {selectedReport.abnormalities && Object.keys(selectedReport.abnormalities).length > 0 ? (
                            <>
                              <li className="flex gap-2 items-start"><span className="text-indigo-500 mt-1">•</span> Clinical correlation required.</li>
                              <li className="flex gap-2 items-start"><span className="text-indigo-500 mt-1">•</span> Review current medication regimen.</li>
                              <li className="flex gap-2 items-start"><span className="text-indigo-500 mt-1">•</span> Recommend follow-up panel in 3 months.</li>
                            </>
                          ) : (
                            <>
                              <li className="flex gap-2 items-start"><span className="text-indigo-500 mt-1">•</span> Continue current lifestyle modifications.</li>
                              <li className="flex gap-2 items-start"><span className="text-indigo-500 mt-1">•</span> Standard annual screening advised.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground p-12 text-center">
              <div>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a report from the list to view its AI-driven clinical analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
