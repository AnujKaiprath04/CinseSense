import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, MousePointer, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsViewProps {
  data: AnalyticsData;
}

const COLORS = ['#10b981', '#14b8a6', '#f59e0b'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  const confidenceData = [
    { name: 'HIGH (5+ Ratings)', value: data.confidence_breakdown.HIGH || 0, color: '#10b981' },
    { name: 'MEDIUM (1-4 Ratings)', value: data.confidence_breakdown.MEDIUM || 0, color: '#14b8a6' },
    { name: 'LOW (Exploratory)', value: data.confidence_breakdown.LOW || 0, color: '#f59e0b' },
  ];

  const genreData = Object.entries(data.top_recommended_genres || {}).map(([genre, count]) => ({
    genre,
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-darkCard border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Recs Served</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {data.total_recommendations_served}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-darkCard border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Click-Through Rate</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              {data.click_through_rate}%
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <MousePointer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-darkCard border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Watchlist Save Rate</p>
            <h3 className="text-2xl font-extrabold text-teal-300 mt-1">
              {data.watchlist_add_rate}%
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center border border-teal-500/20">
            <BookmarkCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-darkCard border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Agent Logs</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">
              {data.total_user_interactions}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Breakdown Chart */}
        <div className="bg-darkCard border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            Agent Confidence Level Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1c2842', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {confidenceData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommended Genres Chart */}
        <div className="bg-darkCard border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4">Top Recommended Genres</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreData}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1c2842', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
