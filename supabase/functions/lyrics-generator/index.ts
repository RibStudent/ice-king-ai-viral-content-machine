Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { description, genre, mood, theme } = await req.json();

        if (!description) {
            throw new Error('Song description is required');
        }

        // Get API keys from environment
        const grokApiKey = Deno.env.get('GROK_API_KEY');

        if (!grokApiKey) {
            throw new Error('API key not configured. Please set GROK_API_KEY environment variable.');
        }
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Build enhanced prompt for structured lyrics
        const systemPrompt = `You are ReMi, an expert AI lyrics assistant. Generate professional, emotionally resonant song lyrics with proper musical structure tags.

CRITICAL REQUIREMENTS:
- Use structure tags: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro]
- Each section should be clearly labeled
- Lyrics should flow naturally and tell a cohesive story
- Match the requested genre, mood, and theme
- Keep verses distinct but thematically connected
- Make the chorus memorable and impactful
- Include emotional depth and vivid imagery

Format example:
[Intro]
Opening lines...

[Verse 1]
Verse lyrics...

[Pre-Chorus]
Build-up lines...

[Chorus]
Catchy, memorable chorus...

[Verse 2]
Second verse with new perspective...

[Pre-Chorus]
Build-up lines...

[Chorus]
Repeat chorus...

[Bridge]
Emotional peak or perspective shift...

[Chorus]
Final chorus with variations...

[Outro]
Closing lines...`;

        const userPrompt = `Generate structured lyrics for a song with these details:

Description: ${description}
${genre ? `Genre: ${genre}` : ''}
${mood ? `Mood: ${mood}` : ''}
${theme ? `Theme: ${theme}` : ''}

Create compelling, professional lyrics with proper structure tags that would work perfectly for AI music generation.`;

        // Call Grok API
        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${grokApiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2-latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 1500
            })
        });

        if (!grokResponse.ok) {
            const errorText = await grokResponse.text();
            throw new Error(`Grok API error: ${errorText}`);
        }

        const grokData = await grokResponse.json();
        const generatedLyrics = grokData.choices[0].message.content;

        // Calculate token usage cost
        const tokensUsed = grokData.usage?.total_tokens || 0;
        const estimatedCost = (tokensUsed / 1000) * 0.015; // Approximate cost

        // Save to database if Supabase is configured
        let savedRecord = null;
        if (supabaseUrl && serviceRoleKey) {
            try {
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/lyrics_generations`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        description,
                        genre,
                        mood,
                        theme,
                        generated_lyrics: generatedLyrics,
                        tokens_used: tokensUsed,
                        estimated_cost: estimatedCost,
                        model_used: 'grok-2-latest'
                    })
                });

                if (insertResponse.ok) {
                    const insertData = await insertResponse.json();
                    savedRecord = insertData[0];
                }
            } catch (dbError) {
                console.error('Database save error:', dbError);
                // Continue without database save
            }
        }

        return new Response(JSON.stringify({
            data: {
                lyrics: generatedLyrics,
                tokensUsed,
                estimatedCost,
                savedRecord
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Lyrics generation error:', error);

        const errorResponse = {
            error: {
                code: 'LYRICS_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
