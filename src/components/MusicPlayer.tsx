import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  audioUrl: string | null;
  audioData: string | null;
  title: string;
  duration: number | null;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioUrl, audioData, title, duration }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    try {
      // Initialize WaveSurfer
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#60a5fa',
        progressColor: '#fbbf24',
        cursorColor: '#f59e0b',
        barWidth: 3,
        barRadius: 3,
        cursorWidth: 1,
        height: 100,
        barGap: 2,
      });

      wavesurferRef.current = wavesurfer;

      // Load audio
      if (audioUrl) {
        wavesurfer.load(audioUrl);
      } else if (audioData) {
        // Handle hex-encoded audio data
        try {
          const binary = hexToArrayBuffer(audioData);
          const blob = new Blob([binary], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          wavesurfer.load(url);
        } catch (err) {
          console.error('Error processing audio data:', err);
          setError('Failed to load audio data');
          setIsLoading(false);
        }
      }

      // Event listeners
      wavesurfer.on('ready', () => {
        setIsLoading(false);
        setTotalDuration(wavesurfer.getDuration());
      });

      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));
      wavesurfer.on('finish', () => setIsPlaying(false));

      wavesurfer.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        setError('Failed to load audio');
        setIsLoading(false);
      });

      return () => {
        wavesurfer.destroy();
      };
    } catch (err) {
      console.error('Failed to initialize player:', err);
      setError('Failed to initialize audio player');
      setIsLoading(false);
    }
  }, [audioUrl, audioData]);

  const hexToArrayBuffer = (hexString: string): ArrayBuffer => {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes.buffer;
  };

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      link.click();
    } else if (audioData) {
      try {
        const binary = hexToArrayBuffer(audioData);
        const blob = new Blob([binary], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500 rounded-2xl p-8 text-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
      {/* Waveform */}
      <div className="mb-6">
        <div 
          ref={waveformRef} 
          className={`rounded-lg overflow-hidden bg-slate-900/50 ${isLoading ? 'animate-pulse' : ''}`}
          style={{ minHeight: '100px' }}
        />
        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-blue-200 text-sm">Loading audio...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Time Display */}
        <div className="flex-1">
          <div className="text-sm text-blue-200 font-mono">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>

        {/* Volume Toggle */}
        <button
          onClick={toggleMute}
          disabled={isLoading}
          className="flex items-center justify-center w-10 h-10 bg-slate-700 text-blue-200 rounded-full hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isLoading || (!audioUrl && !audioData)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
