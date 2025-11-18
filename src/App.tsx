import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import MusicInputForm from './components/MusicInputForm';
import MusicResultsView from './components/MusicResultsView';
import MusicHistoryPanel from './components/MusicHistoryPanel';
import { MusicGenerationInputs, MusicGenerationResult, MusicGenerationHistory, generateMusic } from './services/musicGenerator';
import './App.css';

type AppState = 'landing' | 'form' | 'results' | 'loading';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [result, setResult] = useState<MusicGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const handleStartCreating = () => {
    setAppState('form');
    setError(null);
  };

  const handleGenerate = async (inputs: MusicGenerationInputs) => {
    setIsLoading(true);
    setAppState('loading');
    setError(null);
    
    try {
      const generatedResult = await generateMusic(inputs);
      setResult(generatedResult);
      setAppState('results');
      // Trigger history refresh
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Music generation error:', error);
      setError(error.message || 'Music generation failed. Please try again.');
      setAppState('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (history: MusicGenerationHistory) => {
    // Convert history to result format for display
    const historyResult: MusicGenerationResult = {
      id: history.id,
      audioUrl: history.audio_url,
      audioData: null,
      duration: history.duration,
      prompt: history.prompt,
      lyrics: history.lyrics,
      audioSettings: {
        sampleRate: 44100,
        bitrate: 256000,
        format: history.format || 'mp3'
      },
      metadata: {}
    };
    setResult(historyResult);
    setAppState('results');
  };

  const handleBackToForm = () => {
    setAppState('form');
    setError(null);
  };

  const handleBackToLanding = () => {
    setAppState('landing');
    setResult(null);
    setError(null);
  };

  // Render based on current app state
  switch (appState) {
    case 'landing':
      return <LandingPage onStartCreating={handleStartCreating} />;
    
    case 'form':
      return (
        <div>
          {/* Back to Landing Navigation */}
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={handleBackToLanding}
              className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-blue-200 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-all"
            >
              ← Back to Home
            </button>
          </div>
          {error && (
            <div className="fixed top-4 right-4 left-4 md:left-auto z-50 md:w-96">
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 pt-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form - 2 columns */}
                <div className="lg:col-span-2">
                  <MusicInputForm onGenerate={handleGenerate} isLoading={isLoading} />
                </div>
                
                {/* History Panel - 1 column */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <MusicHistoryPanel 
                      onSelectHistory={handleSelectHistory}
                      refreshTrigger={historyRefreshTrigger}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'loading':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-8 py-6 mb-6">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-white text-lg font-semibold">Generating Your Music...</p>
                <p className="text-blue-200 text-sm">This may take 30-60 seconds</p>
              </div>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <p className="text-blue-200 text-sm leading-relaxed">
                Our AI is composing your song with vocals and instrumentals. 
                Please be patient while we create your unique music experience.
              </p>
            </div>
          </div>
        </div>
      );
    
    case 'results':
      return (
        <div>
          {/* Navigation Header */}
          <div className="fixed top-4 left-4 right-4 z-50">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToForm}
                className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-blue-200 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-all"
              >
                ← Generate New Music
              </button>
              <button
                onClick={handleBackToLanding}
                className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-blue-200 px-4 py-2 rounded-lg hover:text-white hover:border-slate-600 transition-all"
              >
                Home
              </button>
            </div>
          </div>
          {result && (
            <div className="pt-20">
              <MusicResultsView result={result} />
            </div>
          )}
        </div>
      );
    
    default:
      return <LandingPage onStartCreating={handleStartCreating} />;
  }
}

export default App;
