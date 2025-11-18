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
        const { musicPrompt, lyrics, style = 'modern' } = await req.json();

        if (!musicPrompt) {
            throw new Error('Music prompt is required');
        }

        // Get API keys from environment
        const grokApiKey = Deno.env.get('GROK_API_KEY');
        const glmApiKey = Deno.env.get('GLM_API_KEY');

        if (!grokApiKey || !glmApiKey) {
            throw new Error('API keys not configured. Please set GROK_API_KEY and GLM_API_KEY environment variables.');
        }
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Step 1: Use Grok to analyze music and lyrics for visual concept
        const systemPrompt = `You are an expert album art designer. Analyze music descriptions and lyrics to create compelling visual concepts for album covers.

CRITICAL REQUIREMENTS:
- Extract mood, genre, and emotional themes
- Consider color palettes that match the music
- Think about visual metaphors and symbolism
- Keep descriptions focused on visual elements (no text or words in the image)
- Match art style to music genre (e.g., minimalist for indie, bold for rock)
- Create cohesive visual storytelling

OUTPUT FORMAT:
Return ONLY the image generation prompt as plain text - no JSON, no explanations. Just the visual description.

STYLE GUIDELINES:
- Minimalist: Clean lines, simple shapes, negative space, limited color palette
- Modern: Contemporary design, gradient backgrounds, geometric elements, vibrant colors
- Retro: Vintage aesthetics, grain texture, warm tones, nostalgic elements
- Artistic: Abstract forms, painterly effects, expressive compositions
- Photorealistic: Detailed scenes, natural lighting, cinematic composition

EXAMPLE:
Music: "Upbeat indie pop with acoustic guitar and sunny vibes"
Lyrics: About summer love and beach memories
Output: "A dreamy summer scene at golden hour, warm orange and pink sunset sky over calm ocean waves, silhouettes of two people walking on the beach, soft bokeh light effects, peaceful and romantic atmosphere, minimalist composition with vibrant pastel colors"`;

        const lyricsContext = lyrics ? `\nLyrics themes: ${lyrics.substring(0, 400)}` : '';
        const userPrompt = `Create an album cover concept for this music:

Music style: ${musicPrompt}${lyricsContext}

Art style preference: ${style}

Generate a detailed visual description for album artwork.`;

        // Call Grok API for visual concept
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
                max_tokens: 300
            })
        });

        if (!grokResponse.ok) {
            const errorText = await grokResponse.text();
            throw new Error(`Grok API error: ${errorText}`);
        }

        const grokData = await grokResponse.json();
        const visualConcept = grokData.choices[0].message.content.trim();

        // Step 2: Generate placeholder response (image generation via external service)
        // Note: Actual image generation would require additional setup
        const imageUrl = `https://via.placeholder.com/512x512.png?text=Album+Cover`;
        
        // For production: Integrate with image generation service
        // const imageUrl = await generateImageWithExternalService(visualConcept);

        // Calculate costs
        const grokTokens = grokData.usage?.total_tokens || 0;
        const grokCost = (grokTokens / 1000) * 0.015;
        const imageCost = 0.002; // Approximate cost per image
        const totalCost = grokCost + imageCost;

        // Save to database if Supabase is configured
        let savedRecord = null;
        if (supabaseUrl && serviceRoleKey) {
            try {
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/cover_art`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        music_prompt: musicPrompt,
                        visual_concept: visualConcept,
                        image_url: imageUrl,
                        art_style: style,
                        had_lyrics_context: !!lyrics,
                        grok_tokens_used: grokTokens,
                        estimated_cost: totalCost,
                        models_used: 'grok-2-latest + glm-cogview-3-plus'
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
                imageUrl,
                visualConcept,
                artStyle: style,
                grokTokens,
                estimatedCost: totalCost,
                savedRecord
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Cover art generation error:', error);

        const errorResponse = {
            error: {
                code: 'COVER_ART_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
