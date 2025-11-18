# AI Music Generation Platform - Deployment Guide

## Overview
This is a complete AI Music Generation Platform built with React, TypeScript, Supabase, and MiniMax Music API. Users can generate original songs with vocals and instrumentals by describing music style and providing lyrics.

## Architecture

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **WaveSurfer.js** for audio waveform visualization
- **Supabase Client** for backend communication
- **Vite** for build tooling

### Backend (Supabase)
- **Edge Function**: `music-generation` - Handles MiniMax Music API integration
- **Database Table**: `music_generations` - Stores music generation history
- **Row Level Security (RLS)**: Configured for secure data access

## Prerequisites

1. **Supabase Project**: Required for backend services
2. **MiniMax API Key**: Available in environment secrets
3. **Node.js 18+** and **pnpm** package manager

## Backend Deployment (REQUIRED FIRST)

### 1. Deploy Database Migration

The database migration creates the `music_generations` table with proper RLS policies:

```sql
-- This migration is ready in the codebase at:
-- File: create_music_generations_table migration
-- Apply using: apply_migration tool
```

### 2. Deploy Edge Function

The edge function is ready for deployment:
- **Location**: `supabase/functions/music-generation/index.ts`
- **Type**: normal (HTTP endpoint)
- **Required Secrets**: 
  - `MINIMAX_API_KEY` (already available)
  - `SUPABASE_SERVICE_ROLE_KEY` (auto-provided by Supabase)
  - `SUPABASE_URL` (auto-provided by Supabase)

Deploy using:
```bash
batch_deploy_edge_functions tool with:
- slug: "music-generation"
- file_path: "supabase/functions/music-generation/index.ts"
- type: "normal"
```

### 3. Test Edge Function

After deployment, test the edge function:
```bash
test_edge_function tool with test data:
{
  "prompt": "A cheerful pop song with upbeat tempo and catchy melodies",
  "lyrics": "[Verse]\\nTest lyrics here\\n[Chorus]\\nTest chorus here",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  }
}
```

## Frontend Deployment

### 1. Configure Environment Variables

Create `.env` file with Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies
```bash
cd /workspace/ice-king-ai-viral-content-machine
pnpm install
```

### 3. Build for Production
```bash
pnpm run build
```

### 4. Deploy
The built files will be in the `dist/` directory and can be deployed to any static hosting service.

## Features

### Core Functionality
- **Dual Input System**: Music style prompt + lyrics with structure tags
- **Audio Settings**: Configurable format (MP3/WAV), sample rate, bitrate
- **Style Presets**: Quick-start presets for common music genres
- **Audio Player**: Professional player with waveform visualization
- **Download**: Direct download of generated music files

### Music Style Presets
1. Pop Ballad
2. Rock Anthem
3. Chill Lo-Fi
4. Country Song
5. Electronic Dance
6. Acoustic Folk

### Supported Structure Tags
- [Intro]
- [Verse]
- [Chorus]
- [Pre-Chorus]
- [Bridge]
- [Outro]

## API Integration

### MiniMax Music API
- **Endpoint**: https://api.minimax.io/v1/music_generation
- **Model**: music-2.0
- **Generation Time**: 30-60 seconds
- **Output**: Complete songs with vocals and instrumentals

### Request Format
```json
{
  "model": "music-2.0",
  "prompt": "Music style description",
  "lyrics": "Song lyrics with structure tags",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  }
}
```

## Error Handling

The platform includes comprehensive error handling for:
- Invalid input lengths (prompt: 10-2000 chars, lyrics: 10-3000 chars)
- API rate limits
- Content moderation failures
- Generation timeouts
- Audio loading errors

## User Experience

### Loading States
- Clear progress indicators during 30-60 second generation
- Informative messages about expected wait times
- Graceful error recovery

### Visual Design
- Music-themed color palette (blues, cyans, golden accents)
- Preserved Ice King branding and footer
- Audio-reactive animations
- Professional, polished UI

## Testing Checklist

- [ ] Backend edge function deployed and tested
- [ ] Database table created with RLS policies
- [ ] Frontend environment variables configured
- [ ] Music generation flow (form → loading → results)
- [ ] Audio player functionality (play, pause, volume, download)
- [ ] All style presets working
- [ ] Example lyrics insertion
- [ ] Error handling for invalid inputs
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Download functionality
- [ ] Navigation between pages

## Troubleshooting

### Backend Issues
- **"new row violates row-level security policy"**: Check RLS policies allow both `anon` and `service_role` roles
- **Edge function 500 error**: Verify `MINIMAX_API_KEY` is correctly configured in Supabase secrets
- **Audio not loading**: Check that storage bucket policies allow public read access

### Frontend Issues
- **"Supabase configuration missing"**: Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Audio player not working**: Ensure audio URL or data is properly returned from edge function
- **Waveform not rendering**: Check WaveSurfer.js initialization and audio format compatibility

## Deployment Status

### Completed
- [x] Frontend transformation (Landing, Input Form, Results View)
- [x] Audio player with waveform visualization
- [x] Music generation service integration
- [x] Style presets and example lyrics
- [x] Error handling and loading states
- [x] Backend edge function created
- [x] Database migration prepared

### Pending (Requires Supabase Auth)
- [ ] Deploy database migration
- [ ] Deploy edge function
- [ ] Test edge function
- [ ] Configure frontend environment variables with Supabase credentials
- [ ] Build and deploy frontend
- [ ] End-to-end testing

## Next Steps

1. Obtain Supabase authentication credentials
2. Deploy backend services (database + edge function)
3. Test backend functionality
4. Configure frontend with Supabase credentials
5. Build and deploy frontend
6. Comprehensive testing
7. Production deployment

## Support

For issues or questions about the platform, refer to:
- MiniMax Music API documentation
- Supabase documentation
- WaveSurfer.js documentation
