"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  User,
  Brain,
  Activity,
  Sliders,
  ActivitySquare,
  FileText,
  Apple,
  Stethoscope,
  Building2,
  Pill,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Network,
} from "lucide-react";
import { PatientSummary } from "../../services/api";
import { AIHelpAssistant } from "../intelligence/AIHelpAssistant";
import { useTheme } from "next-themes";
interface DashboardLayoutProps {
  children: React.ReactNode;
  patients: PatientSummary[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const navItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "labs", label: "Lab Reports", icon: FileText },
  { id: "digital-twin", label: "Digital Twin", icon: User },
  { id: "fusion", label: "Data Fusion Center", icon: Network },
  { id: "xai", label: "Explainable AI", icon: Brain },
  { id: "risk-center", label: "Disease Risk Center", icon: Activity },
  { id: "simulator", label: "What-If Simulator", icon: Sliders },
  { id: "monitoring", label: "Real-Time Monitoring", icon: ActivitySquare },
  { id: "diet", label: "Diet Intelligence", icon: Apple },
  { id: "doctors", label: "Doctor Intelligence", icon: Stethoscope },
  { id: "hospitals", label: "Hospital Intelligence", icon: Building2 },
  { id: "medication", label: "Medication Center", icon: Pill },
  {
    id: "emergency",
    label: "Emergency Center",
    icon: AlertTriangle,
    className: "text-red-500 hover:bg-red-50 hover:text-red-600",
  },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];
export default function DashboardLayout({
  children,
  patients,
  selectedPatientId,
  onSelectPatient,
  activeTab,
  setActiveTab,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  
  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);
  
  React.useEffect(() => {
    if (selectedPatientId) {
      import("../../services/api").then(({ api }) => {
        api.getTimeline(selectedPatientId)
          .then(data => setNotifications(data))
          .catch(err => console.error("Failed to load notifications", err));
      });
    }
  }, [selectedPatientId]);
  return (
    <div className={`flex h-screen overflow-hidden font-sans`}>
      {" "}
      {}{" "}
      <AnimatePresence>
        {" "}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dark md:hidden fixed inset-0 bg-card/50 z-20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}{" "}
      </AnimatePresence>{" "}
      {}{" "}
      {activeTab !== "emergency" && (
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 260 : 80,
          x:
            typeof window !== "undefined" &&
            window.innerWidth < 768 &&
            !sidebarOpen
              ? -260
              : 0,
        }}
        className="bg-card border-r border-slate-200 flex flex-col z-30 shrink-0 shadow-sm fixed md:relative h-full"
      >
        {" "}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {" "}
          <div className="flex items-center space-x-3 overflow-hidden whitespace-nowrap">
            {" "}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-foreground flex items-center justify-center rounded-lg shrink-0 shadow-sm h-10 w-10">
              {" "}
              <span className="font-bold text-2xl leading-none">S</span>{" "}
            </div>{" "}
            <AnimatePresence>
              {" "}
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-lg font-display tracking-tight text-foreground"
                >
                  {" "}
                  System{" "}
                </motion.span>
              )}{" "}
            </AnimatePresence>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-3 top-20 bg-card border border-slate-200 rounded-full p-1 shadow-sm text-muted-foreground hover:text-blue-600 z-40"
        >
          {" "}
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}{" "}
        </button>{" "}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide px-3 space-y-1">
          {" "}
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== "undefined" && window.innerWidth < 768)
                    setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : item.className || "text-foreground hover:bg-slate-50 hover:text-slate-900"}`}
              >
                {" "}
                <div
                  className={`${isActive ? "text-blue-600" : "text-muted-foreground group-hover:text-foreground"} shrink-0`}
                >
                  {" "}
                  <Icon className="h-5 w-5" />{" "}
                </div>{" "}
                <AnimatePresence>
                  {" "}
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {" "}
                      {item.label}{" "}
                    </motion.span>
                  )}{" "}
                </AnimatePresence>{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        <div className="p-4 border-t border-slate-100 dark:border-border space-y-2">
          {" "}
          <button
            onClick={() => setActiveTab("settings")}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-foreground dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-foreground transition-colors"
          >
            {" "}
            <Settings className="h-5 w-5 text-muted-foreground shrink-0" />{" "}
            <AnimatePresence>
              {" "}
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  {" "}
                  Settings{" "}
                </motion.span>
              )}{" "}
            </AnimatePresence>{" "}
          </button>{" "}
        </div>{" "}
      </motion.aside>
      )}
      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeTab === "emergency" ? "bg-background" : "bg-[#f8fafc]"} w-full`}>
        {/* Header */}
        {activeTab !== "emergency" && (
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-slate-200 dark:bg-card/80 dark:border-border px-4 md:px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-2 md:space-x-4 flex-1">
            <button
              className="md:hidden p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight hidden sm:block">
              {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
            </h1>
            <div className="relative max-w-md w-full ml-0 md:ml-4 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients, reports, insights..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-full px-2 py-1 md:px-3 md:py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors max-w-[120px] sm:max-w-xs">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={selectedPatientId}
                onChange={(e) => onSelectPatient(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-foreground focus:outline-none cursor-pointer border-none truncate w-full dark:text-foreground"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setActiveTab("labs")}
              className="hidden sm:flex items-center justify-center space-x-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-full text-sm font-bold transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              <Plus className="h-4 w-4" /> <span>Ingest</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-foreground rounded-full transition-colors hidden sm:block"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-full md:w-80 bg-card dark:bg-card border border-slate-200 dark:border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-border flex justify-between items-center bg-slate-50/50 dark:bg-card/50">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-foreground">Notifications</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">Mark all read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? notifications.slice(0, 5).map((n: any, idx) => (
                        <div key={idx} className="p-4 border-b border-slate-50 dark:border-border hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors cursor-pointer">
                          <p className="text-sm font-medium text-slate-900 dark:text-foreground mb-1">{n.title}</p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-2">{n.description || 'System event recorded.'}</p>
                        </div>
                      )) : (
                        <div className="p-4 md:p-6 text-center text-muted-foreground dark:text-muted-foreground text-sm">
                          No recent alerts found.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-foreground rounded-full transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-foreground font-bold text-xs shadow-md border-2 border-white dark:border-slate-900 shrink-0 hover:scale-105 transition-transform cursor-pointer"
            >
              JD
            </button>
          </div>
        </header>
        )}
        {/* Main Area */}
        <main className={`flex-1 overflow-y-auto ${activeTab === "emergency" ? "p-0" : "p-4 md:p-4 md:p-6 lg:p-4 md:p-8"} relative w-full`}>
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {" "}
              {children}{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
          {}{" "}
          {activeTab !== "emergency" && (
          <button
            onClick={() => setAssistantOpen(true)}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 bg-blue-600 hover:bg-blue-700 text-foreground rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center transition-transform hover:scale-105 z-40"
          >
            {" "}
            <Brain className="h-5 w-5 md:h-6 md:w-6" />{" "}
          </button>
          )}
          <AIHelpAssistant
            isOpen={assistantOpen}
            onClose={() => setAssistantOpen(false)}
            patientId={selectedPatientId}
          />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
