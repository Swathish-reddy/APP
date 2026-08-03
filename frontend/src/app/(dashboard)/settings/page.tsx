"use client";
import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  User,
  Bell,
  Smartphone,
  Monitor,
  Globe,
  Accessibility,
  Network,
  Zap,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
export default function SettingsDashboard() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [settings, setSettingsState] = useState({
    notificationsEnabled: true,
    emailAlerts: true,
    language: "en",
    privacyMode: "strict",
    aiPersonalization: true,
    highContrast: false,
    fontSize: "medium",
  });
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };
  const handleReset = () => {
    setSettingsState({
      notificationsEnabled: true,
      emailAlerts: true,
      language: "en",
      privacyMode: "strict",
      aiPersonalization: true,
      highContrast: false,
      fontSize: "medium",
    });
    setTheme("system");
  };
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      {" "}
      {showToast && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          {" "}
          <Check className="w-4 h-4" /> Settings Saved Successfully{" "}
        </div>
      )}{" "}
      <div className="flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            {" "}
            <Settings className="w-8 h-8 text-blue-500" /> Platform
            Settings{" "}
          </h1>{" "}
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">
            Manage your account, preferences, and security.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {" "}
        {}{" "}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {" "}
          {[
            { id: "profile", icon: User, label: "Profile" },
            { id: "appearance", icon: Monitor, label: "Appearance" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "security", icon: ShieldCheck, label: "Security & Privacy" },
            { id: "ai", icon: Zap, label: "AI Personalization" },
            {
              id: "accessibility",
              icon: Accessibility,
              label: "Accessibility",
            },
            { id: "devices", icon: Smartphone, label: "Connected Devices" },
            { id: "integrations", icon: Network, label: "Integrations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-foreground dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {" "}
              <tab.icon className="w-5 h-5" /> {tab.label}{" "}
            </button>
          ))}{" "}
        </div>{" "}
        {}{" "}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          {" "}
          {}{" "}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {" "}
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 dark:border-slate-800 pb-4">
                Theme & Appearance
              </h2>{" "}
              <div className="space-y-4">
                {" "}
                <label className="block text-sm font-semibold text-foreground dark:text-muted-foreground">
                  Theme Preference
                </label>{" "}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {" "}
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === "light" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  >
                    {" "}
                    <div className="w-full h-24 bg-slate-100 rounded-md border border-slate-200 shadow-inner flex items-center justify-center">
                      {" "}
                      <div className="w-12 h-4 bg-white rounded shadow-sm" />{" "}
                    </div>{" "}
                    <span className="font-semibold text-foreground">
                      Light Theme
                    </span>{" "}
                  </button>{" "}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === "dark" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  >
                    {" "}
                    <div className="dark w-full h-24 bg-slate-800 rounded-md border border-slate-700 shadow-inner flex items-center justify-center">
                      {" "}
                      <div className="dark w-12 h-4 bg-slate-900 rounded shadow-sm" />{" "}
                    </div>{" "}
                    <span className="font-semibold text-foreground">
                      Dark Theme
                    </span>{" "}
                  </button>{" "}
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === "system" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  >
                    {" "}
                    <div className="w-full h-24 bg-gradient-to-r from-slate-100 to-slate-800 rounded-md border border-slate-300 dark:border-slate-600 shadow-inner" />{" "}
                    <span className="font-semibold text-foreground">
                      System Auto
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div className="pt-6">
                {" "}
                <label className="block text-sm font-semibold text-foreground dark:text-muted-foreground mb-2">
                  Display Language
                </label>{" "}
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettingsState({ ...settings, language: e.target.value })
                  }
                  className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900"
                >
                  {" "}
                  <option value="en">English (US)</option>{" "}
                  <option value="es">Español</option>{" "}
                  <option value="fr">Français</option>{" "}
                  <option value="de">Deutsch</option>{" "}
                </select>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {}{" "}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {" "}
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 dark:border-slate-800 pb-4">
                Security & Privacy
              </h2>{" "}
              <div className="space-y-4">
                {" "}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {" "}
                  <div>
                    {" "}
                    <h4 className="font-bold text-slate-900">
                      Two-Factor Authentication
                    </h4>{" "}
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>{" "}
                  </div>{" "}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Enable 2FA
                  </button>{" "}
                </div>{" "}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {" "}
                  <div>
                    {" "}
                    <h4 className="font-bold text-slate-900">
                      Data Privacy Mode
                    </h4>{" "}
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Controls how much anonymized data is shared with the
                      global AI engine.
                    </p>{" "}
                  </div>{" "}
                  <select
                    value={settings.privacyMode}
                    onChange={(e) =>
                      setSettingsState({
                        ...settings,
                        privacyMode: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-slate-900"
                  >
                    {" "}
                    <option value="strict">Strict (Local Only)</option>{" "}
                    <option value="balanced">Balanced</option>{" "}
                    <option value="open">Open (Research)</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {}{" "}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
                Profile Information
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-white dark:border-slate-800">
                    JD
                  </div>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                    Change Avatar
                  </button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                      <input type="text" defaultValue="John" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                      <input type="text" defaultValue="Doe" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" defaultValue="john.doe@cognivuex.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role / Designation</label>
                    <input type="text" defaultValue="Chief Medical Officer" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" disabled />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Push Notifications</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive instant alerts in your browser for critical anomalies.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.notificationsEnabled} onChange={(e) => setSettingsState({...settings, notificationsEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Email Digests</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive a daily summary of patient metrics and AI insights.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.emailAlerts} onChange={(e) => setSettingsState({...settings, emailAlerts: e.target.checked})} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {[
            "ai",
            "accessibility",
            "devices",
            "integrations",
          ].includes(activeTab) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize border-b border-slate-200 dark:border-slate-800 pb-4">
                {activeTab.replace("-", "")} Settings
              </h2>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Enable {activeTab} features
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Toggle this to enable or disable core features.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="py-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">
                  Configuration Option
                </label>
                <input
                  type="text"
                  placeholder="Enter value..."
                  className="w-full max-w-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
          {}{" "}
          <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            {" "}
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl font-semibold text-foreground dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {" "}
              Reset to Defaults{" "}
            </button>{" "}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {" "}
              {isSaving ? (
                <>
                  {" "}
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Saving...{" "}
                </>
              ) : (
                "Save Changes"
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
