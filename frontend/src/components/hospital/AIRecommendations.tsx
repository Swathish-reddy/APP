import React from 'react';

export default function AIRecommendations({ data }: { data: any }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl shadow-xl h-full">
      <h2 className="text-xl font-bold text-white mb-4">AI Recommendations</h2>
      <div className="text-slate-400">Loading recommendations...</div>
    </div>
  );
}
