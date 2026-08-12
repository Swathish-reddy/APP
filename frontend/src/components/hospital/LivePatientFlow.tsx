import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowRightLeft } from "lucide-react";

export default function LivePatientFlow({ data, history }: { data: any, history: any[] }) {
  if (!data) return null;
  return (
    <div className="bg-card/60 border border-border/50 p-4 md:p-4 md:p-4 md:p-6 rounded-3xl backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-indigo-400" /> Live Patient Flow
        </h2>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="admissions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAdmissions)" />
            <Area type="monotone" dataKey="transfers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} />
            <Area type="monotone" dataKey="discharges" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
