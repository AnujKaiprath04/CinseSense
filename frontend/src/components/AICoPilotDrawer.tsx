import React, { useState } from 'react';
import { X, Send, Sparkles, Bot, User, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, Recommendation } from '../types';
import { MovieCard } from './MovieCard';
import { VoiceInputButton } from './VoiceInputButton';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendations?: Recommendation[];
}

interface AICoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistMovieIds: Set<number>;
}

const QUICK_PROMPTS = [
  'Mind-bending Sci-Fi under 2 hours 🧠',
  'Cozy Friday movie night ☕',
  'Dark Thriller with high ratings 🦇',
  'Lighthearted comedy 🍿',
];

export const AICoPilotDrawer: React.FC<AICoPilotDrawerProps> = ({
  isOpen,
  onClose,
  onToggleWatchlist,
  watchlistMovieIds,
}) => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your CineSense AI Co-Pilot. Tell me what vibe or movie you're in the mood for, or use the microphone to speak your prompt!",
    },
  ]);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || !currentUser) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/recommendations/vibe-search', {
        user_id: currentUser.id,
        prompt: textToSend,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.ai_reply,
        recommendations: res.data.recommendations,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Vibe search error', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error searching for that vibe. Please try another query!',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] glass-modal border-l border-slate-700/80 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-300 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              CineSense AI Co-Pilot <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </h2>
            <p className="text-[11px] text-slate-400">Natural Language & Voice Vibe Search</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-2 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span> <User className="w-3 h-3 text-brand-500" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-brand-500" /> <span>CineSense Co-Pilot</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              {msg.text}
            </div>

            {/* Embedded Cards */}
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="grid grid-cols-1 gap-3 w-full pt-2">
                {msg.recommendations.map((rec) => (
                  <MovieCard
                    key={rec.movie.id}
                    movie={rec.movie}
                    recommendation={rec}
                    isInWatchlist={watchlistMovieIds.has(rec.movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-brand-500 font-semibold italic p-2 animate-pulse">
            <Sparkles className="w-4 h-4" /> CineSense AI Co-Pilot is reasoning over your vibe prompt...
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick Vibe Prompts:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(qp)}
              className="text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box with Voice Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(prompt);
        }}
        className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <VoiceInputButton onTranscript={(txt) => setPrompt(txt)} />

        <input
          type="text"
          placeholder="Describe your movie vibe or speak..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="p-2.5 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-md transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
