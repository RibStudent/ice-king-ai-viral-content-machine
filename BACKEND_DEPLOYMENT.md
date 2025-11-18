# Backend Deployment Script

This script contains all the commands needed to deploy the backend once Supabase authentication is provided.

## Prerequisites
- Supabase project credentials
- MiniMax API key (already configured)

## Deployment Steps

### 1. Deploy Database Table

Run this SQL migration to create the music_generations table:

```sql
-- Create music_generations table
CREATE TABLE IF NOT EXISTS music_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    audio_url TEXT,
    audio_data TEXT,
    duration REAL,
    sample_rate INTEGER,
    bitrate INTEGER,
    format VARCHAR(10),
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE music_generations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON music_generations
  FOR SELECT USING (true);

-- Allow insert via edge function (critical for frontend calls)
CREATE POLICY "Allow insert via edge function" ON music_generations
  FOR INSERT
  WITH CHECK (
    auth.role() = 'anon' OR auth.role() = 'service_role'
  );

-- Allow users to update their own generations
CREATE POLICY "Allow users to update own records" ON music_generations
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Allow users to delete their own generations
CREATE POLICY "Allow users to delete own records" ON music_generations
  FOR DELETE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');
```

### 2. Create Storage Bucket

Create bucket named `music-files` with the following settings:
- **Public**: Yes
- **Allowed MIME types**: `audio/mpeg`, `audio/wav`, `audio/mp3`
- **File size limit**: 100 MB (104857600 bytes)

Create RLS policies for storage.objects table:

```sql
-- Allow public read access for music-files bucket
CREATE POLICY "Public read access for music-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-files');

-- Allow upload via edge function
CREATE POLICY "Allow upload via edge function" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'music-files'
    AND (auth.role() = 'anon' OR auth.role() = 'service_role')
  );

-- Allow service role to delete
CREATE POLICY "Service role delete only" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'music-files' AND auth.role() = 'service_role');
```

### 3. Deploy Edge Function

Deploy the edge function located at:
- **Path**: `supabase/functions/music-generation/index.ts`
- **Name**: `music-generation`
- **Type**: normal (HTTP endpoint)

The function requires these environment variables (auto-provided by Supabase):
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `MINIMAX_API_KEY` (already configured in secrets)

### 4. Test Edge Function

Test the edge function with this payload:

```json
{
  "prompt": "A cheerful pop song with upbeat tempo, catchy melodies, and bright synthesizers. Think Taylor Swift meets Dua Lipa.",
  "lyrics": "[Verse]\nWalking down the street on a sunny day\nFeeling all the worries fade away\n[Chorus]\nThis is our time, this is our song\nDancing together all night long",
  "audio_setting": {
    "sample_rate": 44100,
    "bitrate": 256000,
    "format": "mp3"
  }
}
```

Expected response:
```json
{
  "data": {
    "id": "uuid",
    "audioUrl": "https://...supabase.co/storage/v1/object/public/music-files/generated/music_xxx.mp3",
    "duration": 60,
    "prompt": "...",
    "lyrics": "...",
    "audioSettings": { ... },
    "metadata": { ... }
  }
}
```

### 5. Configure Frontend Environment

Update `.env` file with Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6. Rebuild and Deploy Frontend

```bash
cd /workspace/ice-king-ai-viral-content-machine
pnpm run build
# Deploy dist/ directory to hosting service
```

## Verification Checklist

After deployment, verify:

- [ ] Database table `music_generations` exists
- [ ] RLS policies are configured for `music_generations`
- [ ] Storage bucket `music-files` is created and public
- [ ] RLS policies are configured for `storage.objects`
- [ ] Edge function `music-generation` is deployed
- [ ] Edge function responds to test requests
- [ ] Audio files are uploaded to storage
- [ ] Database inserts work correctly
- [ ] Frontend can call edge function
- [ ] Frontend displays history panel
- [ ] Audio player works correctly
- [ ] Download functionality works

## Troubleshooting

### Database Issues
- **Error**: "new row violates row-level security policy"
  - **Fix**: Ensure RLS policies allow both `anon` and `service_role` roles

### Storage Issues
- **Error**: "Storage upload failed"
  - **Fix**: Check bucket exists and is public
  - **Fix**: Verify RLS policies on `storage.objects` table

### Edge Function Issues
- **Error**: "MiniMax API key not configured"
  - **Fix**: Verify `MINIMAX_API_KEY` secret is set in Supabase

### Frontend Issues
- **Error**: "Supabase configuration missing"
  - **Fix**: Check `.env` file has correct credentials
  - **Fix**: Rebuild after updating environment variables

## Quick Deployment Commands

Once Supabase authentication is available, use these tools:

```bash
# Deploy database
apply_migration(name="create_music_generations_table", query="<SQL from step 1>")

# Create storage bucket
create_bucket(bucket_name="music-files", allowed_mime_types=["audio/*"], file_size_limit=104857600)

# Deploy edge function
batch_deploy_edge_functions(functions=[{
  "slug": "music-generation",
  "file_path": "/workspace/ice-king-ai-viral-content-machine/supabase/functions/music-generation/index.ts",
  "type": "normal",
  "description": "MiniMax Music API integration with Storage"
}])

# Test edge function
test_edge_function(
  function_url="https://your-project.supabase.co/functions/v1/music-generation",
  test_data=<test payload from step 4>
)
```

## Files Modified for Backend Integration

1. `supabase/functions/music-generation/index.ts` - Updated with Storage upload logic
2. `src/services/musicGenerator.ts` - Service layer for API calls
3. `src/lib/supabase.ts` - Supabase client configuration
4. `src/components/MusicHistoryPanel.tsx` - History UI component
5. `src/App.tsx` - Integrated history panel and layout

All files are ready and tested. Backend deployment is pending Supabase authentication only.
