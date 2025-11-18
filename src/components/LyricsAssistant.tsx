import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LyricsAssistantProps {
  onLyricsGenerated: (lyrics: string) => void;
  disabled?: boolean;
}

const LyricsAssistant: React.FC<LyricsAssistantProps> = ({ onLyricsGenerated, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [theme, setTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe your song');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('lyrics-generator', {
        body: {
          description: description.trim(),
          genre: genre.trim() || undefined,
          mood: mood.trim() || undefined,
          theme: theme.trim() || undefined
        }
      });

      if (invokeError) throw invokeError;

      const result = data?.data || data;
      
      if (result.lyrics) {
        onLyricsGenerated(result.lyrics);
        setSuccess(true);
        setEstimatedCost(result.estimatedCost);
        
        // Auto close after success
        setTimeout(() => {
          setIsOpen(false);
          setDescription('');
          setGenre('');
          setMood('');
          setTheme('');
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error('No lyrics generated');
      }
    } catch (err: any) {
      console.error('Lyrics generation error:', err);
      setError(err.message || 'Failed to generate lyrics');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" />
        ReMi Generate Lyrics
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ReMi AI Lyrics Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          disabled={isGenerating}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Close
        </button>
      </div>

      <div className="space-y-4">
        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Song Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your song... e.g., 'A love song about summer romance with upbeat energy'"
            className="w-full bg-slate-900/70 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Genre (optional)
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Pop, Rock"
              className="w-full bg-slate-900/70 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Mood (optional)
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., Happy, Sad"
              className="w-full bg-slate-900/70 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Theme (optional)
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Love, Life"
              className="w-full bg-slate-900/70 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500 rounded-lg p-3">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-green-400 text-sm font-medium">Lyrics generated successfully!</p>
              {estimatedCost && (
                <p className="text-green-300 text-xs">Cost: ${estimatedCost.toFixed(4)}</p>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Lyrics...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Lyrics with ReMi
            </>
          )}
        </button>

        <p className="text-purple-300 text-xs text-center">
          Estimated cost: ~$0.015 per generation
        </p>
      </div>
    </div>
  );
};

export default LyricsAssistant;
