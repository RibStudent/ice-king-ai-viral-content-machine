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
        const { simplePrompt, lyrics } = await req.json();

        if (!simplePrompt) {
            throw new Error('Simple prompt is required');
        }

        // Get API keys from environment
        const grokApiKey = Deno.env.get('GROK_API_KEY');

        if (!grokApiKey) {
            throw new Error('API key not configured. Please set GROK_API_KEY environment variable.');
        }
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Build enhanced prompt for music generation
        const systemPrompt = `You are an expert music production assistant. Transform simple song ideas into detailed, technical music prompts optimized for AI music generation.

CRITICAL REQUIREMENTS:
- Extract and expand genre, style, and mood
- Specify instruments in detail (e.g., "acoustic guitar with fingerpicking", "punchy 808 bass")
- Include tempo/BPM ranges when appropriate
- Add production style (e.g., "lo-fi bedroom pop", "crisp modern production")
- Mention vocal style if relevant (e.g., "smooth R&B vocals", "energetic punk shouting")
- Reference specific artists or eras for style guidance
- Include energy level and dynamics
- Add atmosphere and sonic textures

OUTPUT FORMAT:
Return ONLY the enhanced prompt as plain text - no JSON, no explanations, no metadata. Just the detailed prompt ready to use.

EXAMPLES:
Simple: "happy summer song"
Enhanced: "Upbeat indie pop with bright acoustic guitar strumming, cheerful ukulele accents, and tropical percussion. 120 BPM sunshine vibes with warm, inviting vocals. Think Jack Johnson meets Colbie Caillat - breezy beach party energy with crisp modern production."

Simple: "sad piano ballad"
Enhanced: "Melancholic piano ballad with minimalist arrangement, featuring expressive solo piano with sustain pedal, subtle string swells, and intimate, vulnerable vocals. 65 BPM emotional depth with dynamic range from whisper-soft verses to soaring chorus. Think Adele meets Ludovico Einaudi - cinematic emotional journey with pristine studio clarity."

Simple: "rock song"
Enhanced: "High-energy alternative rock with crunchy distorted guitars, driving bass lines, and powerful drum fills. 140 BPM anthemic energy with raw, passionate vocals. Double-tracked rhythm guitars, soaring lead guitar solos, and arena-ready production. Think Foo Fighters meets Queens of the Stone Age - modern rock intensity with polished edge."`;

        const lyricsContext = lyrics ? `\n\nLYRICS CONTEXT (use to inform mood and style):\n${lyrics.substring(0, 500)}` : '';

        const userPrompt = `Transform this simple prompt into a detailed music generation prompt:

"${simplePrompt}"${lyricsContext}

Generate a detailed, technical prompt that will produce the best possible music from an AI music generator.`;

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
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!grokResponse.ok) {
            const errorText = await grokResponse.text();
            throw new Error(`Grok API error: ${errorText}`);
        }

        const grokData = await grokResponse.json();
        const enhancedPrompt = grokData.choices[0].message.content.trim();

        // Calculate token usage cost
        const tokensUsed = grokData.usage?.total_tokens || 0;
        const estimatedCost = (tokensUsed / 1000) * 0.015; // Approximate cost

        // Save to database if Supabase is configured
        let savedRecord = null;
        if (supabaseUrl && serviceRoleKey) {
            try {
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/prompt_enhancements`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        original_prompt: simplePrompt,
                        enhanced_prompt: enhancedPrompt,
                        had_lyrics_context: !!lyrics,
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
                originalPrompt: simplePrompt,
                enhancedPrompt,
                tokensUsed,
                estimatedCost,
                savedRecord
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Prompt enhancement error:', error);

        const errorResponse = {
            error: {
                code: 'PROMPT_ENHANCEMENT_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
