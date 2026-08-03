"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircle, Shield, Key, LogOut } from "lucide-react";
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setProfile({
      user: {
        username: "Guest User",
        email: "guest@example.com",
        role: "ADMIN",
        mfa_enabled: false,
      },
      profile: {
        first_name: "Guest",
        last_name: "User",
        phone: "123-456-7890",
        address: "123 Health Ave, Clinic City",
      },
    });
    setIsLoading(false);
  }, [router]);
  const handleLogout = () => {};
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {" "}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full"
        />{" "}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {" "}
      <div className="max-w-4xl mx-auto space-y-6">
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          <h1 className="text-3xl font-bold text-foreground font-display">
            Account Profile
          </h1>{" "}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
          >
            {" "}
            <LogOut className="w-4 h-4" /> <span>Logout</span>{" "}
          </button>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {" "}
          <div className="col-span-1 space-y-6">
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-xl p-6 flex flex-col items-center"
            >
              {" "}
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-4 text-sky-600">
                {" "}
                <UserCircle className="w-16 h-16" />{" "}
              </div>{" "}
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.user.username}
              </h2>{" "}
              <p className="text-sm text-muted-foreground">
                {profile?.user.email}
              </p>{" "}
              <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full tracking-wider uppercase">
                {" "}
                {profile?.user.role}{" "}
              </div>{" "}
            </motion.div>{" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6"
            >
              {" "}
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                {" "}
                <Shield className="w-5 h-5 text-sky-600" /> Security Status{" "}
              </h3>{" "}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                {" "}
                <span className="text-sm text-foreground">
                  Two-Factor Auth
                </span>{" "}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${profile?.user.mfa_enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                >
                  {" "}
                  {profile?.user.mfa_enabled ? "Enabled" : "Disabled"}{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center justify-between py-2">
                {" "}
                <span className="text-sm text-foreground">Password</span>{" "}
                <button className="text-xs text-sky-600 hover:underline">
                  Change
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
          <div className="col-span-2 space-y-6">
            {" "}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6"
            >
              {" "}
              <h3 className="text-lg font-medium text-foreground mb-6">
                Personal Information
              </h3>{" "}
              <div className="grid grid-cols-2 gap-6">
                {" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    First Name
                  </label>{" "}
                  <p className="text-foreground font-medium">
                    {profile?.profile.first_name || "Not set"}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Name
                  </label>{" "}
                  <p className="text-foreground font-medium">
                    {profile?.profile.last_name || "Not set"}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </label>{" "}
                  <p className="text-foreground font-medium">
                    {profile?.profile.phone || "Not set"}
                  </p>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </label>{" "}
                  <p className="text-foreground font-medium">
                    {profile?.profile.address || "Not set"}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-8">
                {" "}
                <button className="dark px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                  {" "}
                  Edit Profile{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
