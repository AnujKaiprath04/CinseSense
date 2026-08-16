import React from 'react';
import { Sparkles, Brain, Zap, Coffee, Skull, Compass } from 'lucide-react';

export interface MoodOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'all', label: 'All Moods', icon: Compass, color: 'from-slate-700 to-slate-800' },
  { id: 'mind_bending', label: 'Mind-Bending 🧠', icon: Brain, color: 'from-purple-600 to-indigo-600' },
  { id: 'adrenaline', label: 'Adrenaline-Pumped ⚡', icon: Zap, color: 'from-amber-500 to-rose-600' },
  { id: 'cozy', label: 'Cozy & Relaxing ☕', icon: Coffee, color: 'from-emerald-500 to-teal-600' },
  { id: 'dark_gritty', label: 'Dark & Gritty 🦇', icon: Skull, color: 'from-slate-900 to-zinc-800' },
  { id: 'thought_provoking', label: 'Thought-Provoking 🌌', icon: Sparkles, color: 'from-cyan-500 to-blue-600' },
];

interface MoodSelectorProps {
  selectedMood: string;
  onSelectMood: (moodId: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Filter Recommendations by Emotional Mood
        </h3>
        {selectedMood !== 'all' && (
          <button
            onClick={() => onSelectMood('all')}
            className="text-[11px] font-bold text-slate-400 hover:text-white underline"
          >
            Reset Mood
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MOOD_OPTIONS.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg scale-105 border border-white/20`
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
