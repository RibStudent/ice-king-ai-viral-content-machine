import { supabase } from '../lib/supabase';

export interface MusicGenerationInputs {
  prompt: string;
  lyrics: string;
  audioSettings: {
    sampleRate: number;
    bitrate: number;
    format: 'mp3' | 'wav';
  };
}

export interface MusicGenerationResult {
  id: string | null;
  audioUrl: string | null;
  audioData: string | null;
  duration: number | null;
  prompt: string;
  lyrics: string;
  audioSettings: {
    sampleRate: number;
    bitrate: number;
    format: string;
  };
  metadata: Record<string, any>;
}

export interface MusicGenerationHistory {
  id: string;
  prompt: string;
  lyrics: string;
  audio_url: string | null;
  duration: number | null;
  created_at: string;
  format: string;
}

export async function generateMusic(
  inputs: MusicGenerationInputs
): Promise<MusicGenerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('music-generation', {
      body: {
        prompt: inputs.prompt,
        lyrics: inputs.lyrics,
        audio_setting: {
          sample_rate: inputs.audioSettings.sampleRate,
          bitrate: inputs.audioSettings.bitrate,
          format: inputs.audioSettings.format
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Music generation failed');
    }

    // Handle nested response structure
    const result = data?.data || data;

    if (!result) {
      throw new Error('No data returned from music generation');
    }

    return result;
  } catch (error: any) {
    console.error('Music generation error:', error);
    throw error;
  }
}

export async function getMusicHistory(limit: number = 10): Promise<MusicGenerationHistory[]> {
  try {
    const { data, error } = await supabase
      .from('music_generations')
      .select('id, prompt, lyrics, audio_url, duration, created_at, format')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch music history:', error);
    return [];
  }
}

export const STYLE_PRESETS = [
  {
    id: 'pop-ballad',
    name: 'Pop Ballad',
    prompt: 'A heartfelt pop ballad with emotional piano, gentle strings, and soulful vocals. Slow tempo, intimate atmosphere, perfect for expressing deep emotions.',
    icon: '🎹'
  },
  {
    id: 'rock-anthem',
    name: 'Rock Anthem',
    prompt: 'A powerful rock anthem with electric guitars, driving drums, and energetic vocals. High energy, anthemic chorus, stadium-ready sound.',
    icon: '🎸'
  },
  {
    id: 'chill-lofi',
    name: 'Chill Lo-Fi',
    prompt: 'Relaxing lo-fi hip-hop beats with jazz influences, vinyl crackle, and mellow vibes. Perfect for studying or relaxing, with smooth jazzy chords.',
    icon: '🎧'
  },
  {
    id: 'country-song',
    name: 'Country Song',
    prompt: 'Classic country music with acoustic guitar, fiddle, and heartfelt storytelling vocals. Warm and authentic, with that Nashville sound.',
    icon: '🤠'
  },
  {
    id: 'electronic-dance',
    name: 'Electronic Dance',
    prompt: 'Upbeat electronic dance music with synthesizers, pulsing bass, and catchy drops. High energy, club-ready, with infectious rhythms.',
    icon: '🎵'
  },
  {
    id: 'acoustic-folk',
    name: 'Acoustic Folk',
    prompt: 'Intimate acoustic folk music with fingerstyle guitar and warm vocals. Natural, organic sound with storytelling lyrics.',
    icon: '🎻'
  }
];

export const EXAMPLE_LYRICS = {
  verse: `[Verse]
Walking down the street on a sunny day
Feeling all the worries fade away
Got my friends beside me, music playing loud
Living in the moment, lost in the crowd`,
  
  chorus: `[Chorus]
This is our time, this is our song
Dancing together all night long
Hearts beating faster, spirits running free
This is who we're meant to be`,

  complete: `[Intro]
Ooh, ooh, yeah

[Verse]
Walking down the street on a sunny day
Feeling all the worries fade away
Got my friends beside me, music playing loud
Living in the moment, lost in the crowd

[Pre-Chorus]
Can you feel it in the air tonight?
Everything's gonna be alright

[Chorus]
This is our time, this is our song
Dancing together all night long
Hearts beating faster, spirits running free
This is who we're meant to be

[Verse]
Every step we take is a brand new start
Every beat we make comes straight from the heart
No looking back, we're moving ahead
Living for today, no words left unsaid

[Chorus]
This is our time, this is our song
Dancing together all night long
Hearts beating faster, spirits running free
This is who we're meant to be

[Bridge]
When the world gets heavy
We'll keep it steady
Together we're strong
This is where we belong

[Chorus]
This is our time, this is our song
Dancing together all night long
Hearts beating faster, spirits running free
This is who we're meant to be

[Outro]
This is our time, ooh yeah
This is our song`
};
