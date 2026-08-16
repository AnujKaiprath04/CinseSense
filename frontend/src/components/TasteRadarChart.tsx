import React from 'react';
import { Sparkles, PieChart } from 'lucide-react';

interface TasteRadarChartProps {
  genreScores?: { [key: string]: number };
}

const DEFAULT_SCORES = {
  'Sci-Fi': 95,
  Action: 82,
  Thriller: 88,
  Drama: 65,
  Comedy: 75,
};

export const TasteRadarChart: React.FC<TasteRadarChartProps> = ({ genreScores = DEFAULT_SCORES }) => {
  const genres = Object.keys(genreScores);
  const maxScore = 100;
  const numPoints = genres.length;
  const center = 80;
  const radius = 60;

  // Calculate polygon points
  const points = genres.map((g, idx) => {
    const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
    const score = genreScores[g] || 50;
    const r = (score / maxScore) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.33, 0.66, 1.0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-brand-500" /> Taste Profile Radar
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-black/50 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-500" /> AI Vector
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* SVG Spider/Radar Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Grid circles */}
            {gridLevels.map((lvl, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius * lvl}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray={lvl === 1 ? 'none' : '2,2'}
              />
            ))}

            {/* Radar Polygon */}
            <polygon
              points={points}
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />

            {/* Vertices */}
            {genres.map((g, idx) => {
              const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
              const score = genreScores[g] || 50;
              const r = (score / maxScore) * radius;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return <circle key={idx} cx={x} cy={y} r="3.5" fill="#f59e0b" />;
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 w-full">
          {genres.map((g) => {
            const score = genreScores[g] || 50;
            return (
              <div key={g} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>{g}</span>
                  <span className="text-brand-500 font-mono">{score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
