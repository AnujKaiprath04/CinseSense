import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, Sparkles, BarChart2, RefreshCw, Cpu, CheckCircle } from 'lucide-react';
import { InteractionLog, AnalyticsData } from '../types';
import { fetchAuditLogs, fetchAnalytics } from '../api/client';
import { AnalyticsView } from '../components/AnalyticsView';
import axios from 'axios';

export const AdminAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'analytics' | 'model'>('audit');
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccessMsg, setRetrainSuccessMsg] = useState('');

  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 'audit') {
      fetchAuditLogs(confidenceFilter, actionFilter)
        .then((data) => setLogs(data.logs))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
        .then(setAnalytics)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'model') {
      axios.get('/api/admin/model-metrics')
        .then((res) => setModelMetrics(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [activeTab, confidenceFilter, actionFilter]);

  const handleRetrainModel = async () => {
    setIsRetraining(true);
    setRetrainSuccessMsg('');
    try {
      const res = await axios.post('/api/admin/retrain');
      setModelMetrics(res.data.metrics);
      setRetrainSuccessMsg(res.data.message);
      setTimeout(() => setRetrainSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Retrain model failed', err);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            Responsible AI Audit Trail & ML Metrics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency into agent decisions, LLM rationales, custom SVD matrix factorization precision, and audit logs.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Decision Logs
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'model'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-brand-500" /> SVD Model Health
          </button>
        </div>
      </div>

      {/* Decision Logs View */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-3 bg-darkCard border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Filter className="w-4 h-4 text-brand-500" /> Filters:
            </div>

            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">All Confidence Levels</option>
              <option value="HIGH">HIGH Confidence</option>
              <option value="MEDIUM">MEDIUM Confidence</option>
              <option value="LOW">LOW Confidence (Exploratory)</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">All Action Types</option>
              <option value="recommendation_shown">Recommendation Shown</option>
              <option value="click">Card Clicked</option>
              <option value="watchlist_add">Watchlist Added</option>
              <option value="dismiss">Dismissed</option>
              <option value="rate">Movie Rated</option>
            </select>
          </div>

          {/* Audit Log Table */}
          {isLoading ? (
            <div className="bg-darkCard border border-slate-800 rounded-2xl p-8 text-center text-slate-400 animate-pulse">
              Loading audit decision logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-darkCard border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No audit logs found matching selected filters.
            </div>
          ) : (
            <div className="bg-darkCard border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Movie</th>
                      <th className="py-3.5 px-4">Retriever Score</th>
                      <th className="py-3.5 px-4">Confidence</th>
                      <th className="py-3.5 px-4">Explainer Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">
                          User #{log.user_id}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.action_type === 'recommendation_shown'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : log.action_type === 'watchlist_add'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : log.action_type === 'click'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">
                          {log.movie ? log.movie.title : `Movie #${log.movie_id || '-'}`}
                        </td>
                        <td className="py-3 px-4 font-mono text-brand-500">
                          {log.retrieval_score ? `${(log.retrieval_score * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.confidence_level ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              log.confidence_level === 'HIGH'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : log.confidence_level === 'MEDIUM'
                                ? 'bg-teal-500/20 text-teal-300'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {log.confidence_level}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 italic max-w-xs truncate">
                          {log.explanation_text ? `"${log.explanation_text}"` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {activeTab === 'analytics' && (
        isLoading ? (
          <div className="bg-darkCard border border-slate-800 rounded-2xl p-8 text-center text-slate-400 animate-pulse">
            Calculating analytics metrics...
          </div>
        ) : analytics ? (
          <AnalyticsView data={analytics} />
        ) : null
      )}

      {/* Live SVD ML Model Health View */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          {retrainSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {retrainSuccessMsg}
            </div>
          )}

          {modelMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* RMSE Gauge */}
              <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  Root Mean Squared Error (RMSE)
                </span>
                <span className="text-4xl font-black text-brand-500">
                  {modelMetrics.rmse}
                </span>
                <p className="text-[11px] text-slate-400">
                  Stochastic Gradient Descent SVD loss rating error margin.
                </p>
              </div>

              {/* MAE Gauge */}
              <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  Mean Absolute Error (MAE)
                </span>
                <span className="text-4xl font-black text-emerald-400">
                  {modelMetrics.mae}
                </span>
                <p className="text-[11px] text-slate-400">
                  Average absolute rating error distance across latent dimensions.
                </p>
              </div>

              {/* Precision@K */}
              <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 space-y-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                  Model Precision @ K=5
                </span>
                <span className="text-4xl font-black text-cyan-400">
                  {(modelMetrics.precision_at_k * 100).toFixed(1)}%
                </span>
                <p className="text-[11px] text-slate-400">
                  Accuracy of candidate retrieval engine on warm user profiles.
                </p>
              </div>
            </div>
          )}

          {/* Model Controls */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-brand-500" /> SVD Matrix Factorization Training Control
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trigger an online Stochastic Gradient Descent (SGD) learning epoch across all database ratings.
                </p>
              </div>

              <button
                onClick={handleRetrainModel}
                disabled={isRetraining}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
                {isRetraining ? 'Training SGD Epochs...' : 'Retrain Custom SVD Model'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
