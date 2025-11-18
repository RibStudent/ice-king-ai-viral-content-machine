import React, { useEffect, useState } from 'react';
import { Music2, Clock, Play, Trash2, RefreshCw } from 'lucide-react';
import { getMusicHistory, MusicGenerationHistory } from '../services/musicGenerator';

interface MusicHistoryPanelProps {
  onSelectHistory?: (history: MusicGenerationHistory) => void;
  refreshTrigger?: number;
}

const MusicHistoryPanel: React.FC<MusicHistoryPanelProps> = ({ onSelectHistory, refreshTrigger = 0 }) => {
  const [history, setHistory] = useState<MusicGenerationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMusicHistory(10);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadHistory}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <div className="text-center py-8">
          <Music2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No music generated yet</p>
          <p className="text-slate-500 text-sm mt-1">Your generation history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Recent Generations
        </h3>
        <button
          onClick={loadHistory}
          className="text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-all group cursor-pointer"
            onClick={() => onSelectHistory?.(item)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Prompt Preview */}
                <p className="text-white text-sm font-medium mb-1 truncate">
                  {truncateText(item.prompt, 60)}
                </p>

                {/* Lyrics Preview */}
                <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                  {truncateText(item.lyrics.replace(/\[.*?\]/g, '').trim(), 80)}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </span>
                  {item.duration && (
                    <span className="flex items-center gap-1">
                      <Music2 className="w-3 h-3" />
                      {Math.floor(item.duration)}s
                    </span>
                  )}
                  {item.format && (
                    <span className="uppercase">
                      {item.format}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {item.audio_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.audio_url!, '_blank');
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Play"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {history.length >= 10 && (
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-xs">
            Showing last 10 generations
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicHistoryPanel;
