import React, { useState } from 'react';
import { Wand2, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PromptEnhancerProps {
  currentPrompt: string;
  lyrics?: string;
  onPromptEnhanced: (enhancedPrompt: string) => void;
  disabled?: boolean;
}

const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  currentPrompt,
  lyrics,
  onPromptEnhanced,
  disabled
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const handleEnhance = async () => {
    if (!currentPrompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('prompt-enhancer', {
        body: {
          simplePrompt: currentPrompt.trim(),
          lyrics: lyrics || undefined
        }
      });

      if (invokeError) throw invokeError;

      const result = data?.data || data;
      
      if (result.enhancedPrompt) {
        onPromptEnhanced(result.enhancedPrompt);
        setSuccess(true);
        setEstimatedCost(result.estimatedCost);
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error('No enhanced prompt generated');
      }
    } catch (err: any) {
      console.error('Prompt enhancement error:', err);
      setError(err.message || 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnhance}
        disabled={disabled || isEnhancing || !currentPrompt.trim()}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnhancing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Enhance Prompt
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500 rounded-lg p-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500 rounded-lg p-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-xs font-medium">Prompt enhanced!</p>
            {estimatedCost && (
              <p className="text-green-300 text-xs">Cost: ${estimatedCost.toFixed(4)}</p>
            )}
          </div>
        </div>
      )}

      {!error && !success && (
        <p className="text-cyan-300 text-xs">
          Transform simple prompts into detailed music descriptions (Cost: ~$0.005)
        </p>
      )}
    </div>
  );
};

export default PromptEnhancer;
