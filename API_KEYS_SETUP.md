# API Keys Setup Guide

## Required API Keys

This project requires the following API keys to be configured as environment variables in Supabase:

### 1. GROK_API_KEY
- **Purpose**: Used for lyrics generation and prompt enhancement
- **Provider**: xAI (Grok)
- **How to obtain**: Visit [xAI Developer Portal](https://x.ai/api)

### 2. GLM_API_KEY
- **Purpose**: Used for cover art generation
- **Provider**: GLM (Zhipu AI)
- **How to obtain**: Visit [GLM Developer Portal](https://open.bigmodel.cn/)

### 3. MINIMAX_API_KEY (Optional)
- **Purpose**: Alternative API for music generation
- **Provider**: MiniMax
- **How to obtain**: Visit [MiniMax Developer Portal](https://api.minimax.chat/)

## How to Configure in Supabase

### Method 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Add the secrets in the "Secrets" section

### Method 2: Supabase CLI
```bash
supabase secrets set GROK_API_KEY="your_api_key_here"
supabase secrets set GLM_API_KEY="your_api_key_here"
supabase secrets set MINIMAX_API_KEY="your_api_key_here"
```

## Security Notes

- **NEVER** commit API keys to version control
- Store API keys securely in environment variables
- Use `.env` files locally (already in .gitignore)
- Configure secrets in production deployment platforms

## Local Development

For local development, create a `.env` file (already gitignored) with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Edge Functions will use the secrets configured in Supabase.