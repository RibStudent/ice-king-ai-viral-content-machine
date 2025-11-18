import React, { useState } from 'react';
import { Music2, Loader2, Sparkles, FileText, Settings } from 'lucide-react';
import { MusicGenerationInputs, STYLE_PRESETS, EXAMPLE_LYRICS } from '../services/musicGenerator';
import LyricsAssistant from './LyricsAssistant';
import PromptEnhancer from './PromptEnhancer';
import CoverArtGenerator from './CoverArtGenerator';

interface MusicInputFormProps {
  onGenerate: (inputs: MusicGenerationInputs) => void;
  isLoading: boolean;
}

const MusicInputForm: React.FC<MusicInputFormProps> = ({ onGenerate, isLoading }) => {
  const [inputs, setInputs] = useState<MusicGenerationInputs>({
    prompt: '',
    lyrics: '',
    audioSettings: {
      sampleRate: 44100,
      bitrate: 256000,
      format: 'mp3'
    }
  });

  const [errors, setErrors] = useState<{
    prompt?: string;
    lyrics?: string;
  }>({});

  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!inputs.prompt.trim()) {
      newErrors.prompt = 'Music style prompt is required';
    } else if (inputs.prompt.length < 10) {
      newErrors.prompt = 'Prompt must be at least 10 characters';
    } else if (inputs.prompt.length > 2000) {
      newErrors.prompt = 'Prompt must not exceed 2000 characters';
    }
    
    if (!inputs.lyrics.trim()) {
      newErrors.lyrics = 'Lyrics are required';
    } else if (inputs.lyrics.length < 10) {
      newErrors.lyrics = 'Lyrics must be at least 10 characters';
    } else if (inputs.lyrics.length > 3000) {
      newErrors.lyrics = 'Lyrics must not exceed 3000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onGenerate(inputs);
    }
  };

  const handlePresetClick = (preset: typeof STYLE_PRESETS[0]) => {
    setInputs(prev => ({ ...prev, prompt: preset.prompt }));
    if (errors.prompt) {
      setErrors(prev => ({ ...prev, prompt: undefined }));
    }
  };

  const handleExampleLyricsClick = () => {
    setInputs(prev => ({ ...prev, lyrics: EXAMPLE_LYRICS.complete }));
    if (errors.lyrics) {
      setErrors(prev => ({ ...prev, lyrics: undefined }));
    }
  };

  const handleLyricsGenerated = (generatedLyrics: string) => {
    setInputs(prev => ({ ...prev, lyrics: generatedLyrics }));
    if (errors.lyrics) {
      setErrors(prev => ({ ...prev, lyrics: undefined }));
    }
  };

  const handlePromptEnhanced = (enhancedPrompt: string) => {
    setInputs(prev => ({ ...prev, prompt: enhancedPrompt }));
    if (errors.prompt) {
      setErrors(prev => ({ ...prev, prompt: undefined }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Music2 className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            AI Music Generator
          </h1>
        </div>
        <p className="text-blue-200 text-lg">
          Describe your music style and add lyrics to create your original song
        </p>
      </div>

        {/* Style Presets */}
        <div className="mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">Quick Start Presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                disabled={isLoading}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-center hover:border-cyan-400 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <div className="text-white text-sm font-medium">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Phase 1 Features Section */}
        <div className="mb-8 space-y-4">
          {/* Lyrics Assistant */}
          <LyricsAssistant 
            onLyricsGenerated={handleLyricsGenerated}
            disabled={isLoading}
          />
          
          {/* Cover Art Generator */}
          <CoverArtGenerator
            musicPrompt={inputs.prompt}
            lyrics={inputs.lyrics}
            disabled={isLoading}
          />
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Music Style Prompt */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Music Style & Mood *
                </span>
              </label>
              <textarea
                value={inputs.prompt}
                onChange={(e) => {
                  setInputs(prev => ({ ...prev, prompt: e.target.value }));
                  if (errors.prompt) setErrors(prev => ({ ...prev, prompt: undefined }));
                }}
                placeholder="Describe the style, mood, genre, and feeling you want... e.g., 'A melancholic indie rock ballad with acoustic guitar, soft drums, and introspective vocals. Think Bon Iver meets The National.'"
                className={`w-full h-48 bg-slate-900/70 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none ${
                  errors.prompt ? 'border-red-500' : 'border-slate-600'
                }`}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                {errors.prompt && <p className="text-red-400 text-sm">{errors.prompt}</p>}
                <p className={`text-sm ml-auto ${
                  inputs.prompt.length > 2000 ? 'text-red-400' : 
                  inputs.prompt.length > 1800 ? 'text-yellow-400' : 'text-slate-400'
                }`}>
                  {inputs.prompt.length}/2000
                </p>
              </div>
              <div className="mt-3">
                <PromptEnhancer
                  currentPrompt={inputs.prompt}
                  lyrics={inputs.lyrics}
                  onPromptEnhanced={handlePromptEnhanced}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Lyrics Input */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-3">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Your Lyrics *
                </span>
              </label>
              <textarea
                value={inputs.lyrics}
                onChange={(e) => {
                  setInputs(prev => ({ ...prev, lyrics: e.target.value }));
                  if (errors.lyrics) setErrors(prev => ({ ...prev, lyrics: undefined }));
                }}
                placeholder="Write your lyrics here. Use structure tags like [Verse], [Chorus], [Bridge], etc.&#10;&#10;[Verse]&#10;Your lyrics here...&#10;&#10;[Chorus]&#10;Your chorus here..."
                className={`w-full h-48 bg-slate-900/70 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none font-mono text-sm ${
                  errors.lyrics ? 'border-red-500' : 'border-slate-600'
                }`}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-2">
                {errors.lyrics && <p className="text-red-400 text-sm">{errors.lyrics}</p>}
                <p className={`text-sm ml-auto ${
                  inputs.lyrics.length > 3000 ? 'text-red-400' : 
                  inputs.lyrics.length > 2700 ? 'text-yellow-400' : 'text-slate-400'
                }`}>
                  {inputs.lyrics.length}/3000
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-blue-300 text-xs">
                  Structure tags: [Intro], [Verse], [Chorus], [Pre-Chorus], [Bridge], [Outro]
                </p>
                <button
                  type="button"
                  onClick={handleExampleLyricsClick}
                  disabled={isLoading}
                  className="text-cyan-400 hover:text-cyan-300 text-xs underline disabled:opacity-50"
                >
                  Use Example
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Audio Settings</span>
              <span className="text-xs text-slate-400">{showAdvanced ? '▲' : '▼'}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Audio Format
                  </label>
                  <select
                    value={inputs.audioSettings.format}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      audioSettings: { ...prev.audioSettings, format: e.target.value as 'mp3' | 'wav' }
                    }))}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={isLoading}
                  >
                    <option value="mp3">MP3 (Recommended)</option>
                    <option value="wav">WAV (Higher Quality)</option>
                  </select>
                </div>

                {/* Sample Rate */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Sample Rate
                  </label>
                  <select
                    value={inputs.audioSettings.sampleRate}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      audioSettings: { ...prev.audioSettings, sampleRate: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={isLoading}
                  >
                    <option value="44100">44.1 kHz (CD Quality)</option>
                    <option value="48000">48 kHz (Professional)</option>
                  </select>
                </div>

                {/* Bitrate */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Bitrate (MP3)
                  </label>
                  <select
                    value={inputs.audioSettings.bitrate}
                    onChange={(e) => setInputs(prev => ({
                      ...prev,
                      audioSettings: { ...prev.audioSettings, bitrate: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={isLoading || inputs.audioSettings.format === 'wav'}
                  >
                    <option value="128000">128 kbps (Good)</option>
                    <option value="192000">192 kbps (Better)</option>
                    <option value="256000">256 kbps (Excellent)</option>
                    <option value="320000">320 kbps (Best)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-8 py-4 rounded-lg hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Music (30-60s)...
                </>
              ) : (
                <>
                  <Music2 className="w-5 h-5" />
                  Generate Music
                </>
              )}
            </button>
            <p className="text-blue-300 text-sm mt-4">
              Generation typically takes 30-60 seconds. Please be patient while your music is being created.
            </p>
          </div>
        </form>
    </div>
  );
};

export default MusicInputForm;
