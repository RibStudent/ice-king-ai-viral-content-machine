import React from 'react';
import { Music2, FileText, Settings, Sparkles } from 'lucide-react';
import MusicPlayer from './MusicPlayer';
import { MusicGenerationResult } from '../services/musicGenerator';

interface MusicResultsViewProps {
  result: MusicGenerationResult;
}

const MusicResultsView: React.FC<MusicResultsViewProps> = ({ result }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music2 className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Your Music is Ready!
            </h1>
          </div>
          <p className="text-blue-200 text-lg">
            Listen, download, and share your AI-generated music
          </p>
        </div>

        {/* Music Player */}
        <div className="mb-8">
          <MusicPlayer
            audioUrl={result.audioUrl}
            audioData={result.audioData}
            title="Generated Music"
            duration={result.duration}
          />
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Music Style Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-lg font-semibold text-white">Music Style</h3>
            </div>
            <p className="text-blue-200 leading-relaxed">{result.prompt}</p>
          </div>

          {/* Lyrics Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Lyrics</h3>
            </div>
            <pre className="text-blue-200 leading-relaxed whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
              {result.lyrics}
            </pre>
          </div>
        </div>

        {/* Audio Settings Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Audio Settings</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Duration</p>
              <p className="text-white font-semibold">
                {result.duration ? `${Math.floor(result.duration)}s` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Format</p>
              <p className="text-white font-semibold uppercase">
                {result.audioSettings.format}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Sample Rate</p>
              <p className="text-white font-semibold">
                {(result.audioSettings.sampleRate / 1000).toFixed(1)} kHz
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Bitrate</p>
              <p className="text-white font-semibold">
                {result.audioSettings.bitrate / 1000} kbps
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Tips for Better Results
          </h3>
          <ul className="text-blue-200 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Be specific about instruments, tempo, and mood in your style prompt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Use structure tags like [Verse], [Chorus], [Bridge] to guide the arrangement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Reference specific artists or songs to help the AI understand your desired style</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">•</span>
              <span>Keep lyrics clear and well-structured for better vocal performance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MusicResultsView;
