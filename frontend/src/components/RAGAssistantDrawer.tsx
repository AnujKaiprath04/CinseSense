import React, { useState } from 'react';
import { X, Send, Brain, Sparkles, FileText, ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, Recommendation } from '../types';
import { MovieCard } from './MovieCard';
import { VoiceInputButton } from './VoiceInputButton';
import axios from 'axios';

interface RAGMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  retrieved_documents?: Array<{
    doc_id: number;
    movie_title: string;
    similarity_score: number;
    similarity_pct: string;
    genres: string;
    overview_snippet: string;
  }>;
  recommendations?: Recommendation[];
}

interface RAGAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistMovieIds: Set<number>;
}

export const RAGAssistantDrawer: React.FC<RAGAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onToggleWatchlist,
  watchlistMovieIds,
}) => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDocMsgId, setExpandedDocMsgId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RAGMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Welcome to CineSense Grounded RAG Assistant! Ask me any movie question, and I'll retrieve vector database documents to synthesize grounded answers with citations.",
    },
  ]);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || !currentUser) return;

    const userMsg: RAGMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/recommendations/rag-assistant', {
        user_id: currentUser.id,
        prompt: textToSend,
      });

      const aiMsg: RAGMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.ai_answer,
        retrieved_documents: res.data.retrieved_documents,
        recommendations: res.data.recommendations,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('RAG assistant error', err);
      const errorMsg: RAGMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error running the RAG vector retrieval pipeline.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] glass-modal border-l border-slate-700/80 shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-300 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Brain className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              Grounded RAG AI Assistant <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </h2>
            <p className="text-[11px] text-slate-400">Vector Search + Groq LLaMA-3.3-70B</p>
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
                  <Brain className="w-3 h-3 text-brand-500" /> <span>RAG Assistant</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              {msg.text}
            </div>

            {/* RAG Retrieved Documents Inspector Dropdown */}
            {msg.retrieved_documents && msg.retrieved_documents.length > 0 && (
              <div className="w-full max-w-[92%] space-y-1.5 pt-1">
                <button
                  onClick={() => setExpandedDocMsgId(expandedDocMsgId === msg.id ? null : msg.id)}
                  className="flex items-center justify-between w-full text-[10px] font-extrabold bg-slate-950/80 hover:bg-slate-900 border border-brand-500/30 text-brand-500 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Inspected {msg.retrieved_documents.length} RAG Source Documents
                  </span>
                  {expandedDocMsgId === msg.id ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {expandedDocMsgId === msg.id && (
                  <div className="space-y-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] animate-fadeIn">
                    {msg.retrieved_documents.map((doc, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{doc.movie_title}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Vector Score: {doc.similarity_pct}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                          "{doc.overview_snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Embedded Recommendation Cards */}
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
            <Brain className="w-4 h-4" /> Retrieving vector database documents & generating grounded response...
          </div>
        )}
      </div>

      {/* Input Box */}
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
          placeholder="Ask RAG Assistant about movies, themes, directors..."
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
