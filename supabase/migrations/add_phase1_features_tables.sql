-- Create lyrics_generations table for ReMi AI Lyrics Assistant
CREATE TABLE IF NOT EXISTS public.lyrics_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    genre TEXT,
    mood TEXT,
    theme TEXT,
    generated_lyrics TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 6) DEFAULT 0,
    model_used TEXT DEFAULT 'grok-2-latest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_lyrics_generations_created_at ON public.lyrics_generations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.lyrics_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.lyrics_generations
    FOR SELECT
    USING (true);

-- RLS Policy: Allow insert via edge function (anon and service_role)
CREATE POLICY "Allow insert via edge function" ON public.lyrics_generations
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Create prompt_enhancements table for Smart Prompting System
CREATE TABLE IF NOT EXISTS public.prompt_enhancements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_prompt TEXT NOT NULL,
    enhanced_prompt TEXT NOT NULL,
    had_lyrics_context BOOLEAN DEFAULT false,
    tokens_used INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 6) DEFAULT 0,
    model_used TEXT DEFAULT 'grok-2-latest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_created_at ON public.prompt_enhancements(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.prompt_enhancements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.prompt_enhancements
    FOR SELECT
    USING (true);

-- RLS Policy: Allow insert via edge function (anon and service_role)
CREATE POLICY "Allow insert via edge function" ON public.prompt_enhancements
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Create cover_art table for Cover Art Generation
CREATE TABLE IF NOT EXISTS public.cover_art (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    music_prompt TEXT NOT NULL,
    visual_concept TEXT NOT NULL,
    image_url TEXT NOT NULL,
    art_style TEXT DEFAULT 'modern',
    had_lyrics_context BOOLEAN DEFAULT false,
    grok_tokens_used INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 6) DEFAULT 0,
    models_used TEXT DEFAULT 'grok-2-latest + minimax-t2i',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_cover_art_created_at ON public.cover_art(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cover_art ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.cover_art
    FOR SELECT
    USING (true);

-- RLS Policy: Allow insert via edge function (anon and service_role)
CREATE POLICY "Allow insert via edge function" ON public.cover_art
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Add cover_art_id column to music_generations table for linking
ALTER TABLE public.music_generations 
ADD COLUMN IF NOT EXISTS cover_art_id UUID REFERENCES public.cover_art(id) ON DELETE SET NULL;

-- Add enhanced_prompt_id column to music_generations table for tracking
ALTER TABLE public.music_generations 
ADD COLUMN IF NOT EXISTS enhanced_prompt_id UUID REFERENCES public.prompt_enhancements(id) ON DELETE SET NULL;

-- Add lyrics_generation_id column to music_generations table for tracking
ALTER TABLE public.music_generations 
ADD COLUMN IF NOT EXISTS lyrics_generation_id UUID REFERENCES public.lyrics_generations(id) ON DELETE SET NULL;
