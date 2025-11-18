import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Check, AlertCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CoverArtGeneratorProps {
  musicPrompt: string;
  lyrics?: string;
  onCoverArtGenerated?: (imageUrl: string) => void;
  disabled?: boolean;
}

const CoverArtGenerator: React.FC<CoverArtGeneratorProps> = ({
  musicPrompt,
  lyrics,
  onCoverArtGenerated,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [artStyle, setArtStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualConcept, setVisualConcept] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const artStyles = [
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple design' },
    { id: 'modern', name: 'Modern', description: 'Contemporary aesthetics' },
    { id: 'retro', name: 'Retro', description: 'Vintage vibes' },
    { id: 'artistic', name: 'Artistic', description: 'Abstract and expressive' },
    { id: 'photorealistic', name: 'Photorealistic', description: 'Detailed and realistic' }
  ];

  const handleGenerate = async () => {
    if (!musicPrompt.trim()) {
      setError('Please enter a music prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('cover-art-generator', {
        body: {
          musicPrompt: musicPrompt.trim(),
          lyrics: lyrics || undefined,
          style: artStyle
        }
      });

      if (invokeError) throw invokeError;

      const result = data?.data || data;
      
      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setVisualConcept(result.visualConcept);
        setEstimatedCost(result.estimatedCost);
        
        if (onCoverArtGenerated) {
          onCoverArtGenerated(result.imageUrl);
        }
      } else {
        throw new Error('No cover art generated');
      }
    } catch (err: any) {
      console.error('Cover art generation error:', err);
      setError(err.message || 'Failed to generate cover art');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-art-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled || !musicPrompt.trim()}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ImageIcon className="w-4 h-4" />
        Generate Cover Art
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/50 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">AI Cover Art Generator</h3>
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
        {/* Art Style Selection */}
        <div>
          <label className="block text-sm font-medium text-orange-200 mb-3">
            Art Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {artStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setArtStyle(style.id)}
                disabled={isGenerating}
                className={`p-3 rounded-lg border transition-all ${
                  artStyle === style.id
                    ? 'bg-orange-500/30 border-orange-400 text-white'
                    : 'bg-slate-900/50 border-orange-500/30 text-orange-200 hover:border-orange-400'
                } disabled:opacity-50`}
              >
                <div className="text-sm font-medium">{style.name}</div>
                <div className="text-xs opacity-75 mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900/50 border border-orange-500/50">
              <img
                src={generatedImage}
                alt="Generated cover art"
                className="w-full h-full object-cover"
              />
            </div>
            
            {visualConcept && (
              <div className="bg-slate-900/50 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-200 text-sm font-medium mb-1">Visual Concept:</p>
                <p className="text-gray-300 text-xs">{visualConcept}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400 text-orange-200 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              {estimatedCost && (
                <p className="text-orange-300 text-xs">Cost: ${estimatedCost.toFixed(4)}</p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !musicPrompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Cover Art...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              Generate Album Cover
            </>
          )}
        </button>

        <p className="text-orange-300 text-xs text-center">
          Estimated cost: ~$0.002 per generation
        </p>
      </div>
    </div>
  );
};

export default CoverArtGenerator;
