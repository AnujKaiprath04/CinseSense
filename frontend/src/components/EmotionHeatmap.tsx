import React from 'react';
import { Activity, Flame, Zap, Brain, Shield } from 'lucide-react';

interface EmotionSegment {
  timeRange: string;
  emotion: string;
  intensity: number; // 0 - 100
  color: string;
  icon: string;
  description: string;
}

interface EmotionHeatmapProps {
  movieTitle: string;
}

const DEFAULT_SEGMENTS: EmotionSegment[] = [
  {
    timeRange: '0 - 25 min',
    emotion: 'Intrigue & Mystery',
    intensity: 65,
    color: 'from-blue-500 to-indigo-500',
    icon: '🔍',
    description: 'Enigmatic premise introduction & character setup',
  },
  {
    timeRange: '25 - 65 min',
    emotion: 'High Tension & Suspense',
    intensity: 85,
    color: 'from-purple-500 to-pink-500',
    icon: '⚡',
    description: 'Rising conflict, unexpected plot turns & high stakes',
  },
  {
    timeRange: '65 - 110 min',
    emotion: 'Mind-Bending Climax',
    intensity: 98,
    color: 'from-amber-500 to-red-500',
    icon: '🧠',
    description: 'Peak psychological intensity & reality-bending reveal',
  },
  {
    timeRange: '110 - 120 min',
    emotion: 'Emotional Resolution',
    intensity: 75,
    color: 'from-teal-500 to-emerald-500',
    icon: '🌌',
    description: 'Cathartic closure & philosophical aftermath',
  },
];

export const EmotionHeatmap: React.FC<EmotionHeatmapProps> = ({ movieTitle }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-brand-500" /> AI Scene Emotion & Pacing Heatmap
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" /> Real-Time Sentiment
        </span>
      </div>

      <p className="text-xs text-slate-400">
        AI sentiment breakdown of key narrative arcs across runtime for <span className="text-slate-200 font-bold">{movieTitle}</span>:
      </p>

      {/* Visual Timeline Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex h-4 w-full rounded-full overflow-hidden p-0.5 bg-slate-950 border border-slate-800">
          {DEFAULT_SEGMENTS.map((seg, idx) => (
            <div
              key={idx}
              className={`h-full bg-gradient-to-r ${seg.color} transition-all duration-300 relative group cursor-pointer`}
              style={{ width: '25%' }}
              title={`${seg.emotion} (${seg.intensity}% intensity)`}
            />
          ))}
        </div>

        {/* Detailed Segment Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {DEFAULT_SEGMENTS.map((seg, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-1.5 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-200 flex items-center gap-1">
                  <span>{seg.icon}</span> {seg.emotion}
                </span>
                <span className="text-[10px] font-mono text-brand-500 font-bold">
                  {seg.intensity}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block">
                {seg.timeRange}
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                {seg.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
