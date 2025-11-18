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
        // Extract parameters from request body
        const requestData = await req.json();
        const { prompt, lyrics, audio_setting } = requestData;

        // Validate inputs
        if (!prompt || prompt.length < 10 || prompt.length > 2000) {
            throw new Error('Music style prompt must be between 10-2000 characters');
        }

        if (!lyrics || lyrics.length < 10 || lyrics.length > 3000) {
            throw new Error('Lyrics must be between 10-3000 characters');
        }

        // Get MiniMax API key from environment
        const minimaxApiKey = Deno.env.get('MINIMAX_API_KEY');
        if (!minimaxApiKey) {
            throw new Error('MiniMax API key not configured');
        }

        // Default audio settings if not provided
        const defaultAudioSettings = {
            sample_rate: 44100,
            bitrate: 256000,
            format: 'mp3'
        };

        const audioSettings = audio_setting || defaultAudioSettings;

        // Call MiniMax Music API
        console.log('Calling MiniMax Music API...');
        const musicResponse = await fetch('https://api.minimax.io/v1/music_generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${minimaxApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'music-2.0',
                prompt: prompt,
                lyrics: lyrics,
                audio_setting: audioSettings
            })
        });

        if (!musicResponse.ok) {
            const errorText = await musicResponse.text();
            let errorMessage = 'Music generation failed';
            
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        const musicData = await musicResponse.json();
        console.log('Music generation successful');

        // Get Supabase configuration
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header (optional)
        const authHeader = req.headers.get('authorization');
        let userId = null;

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (err) {
                console.log('User authentication skipped:', err);
            }
        }

        // Process music data and upload to Supabase Storage
        let finalAudioUrl = null;
        let audioBinary = null;
        let duration = null;

        if (musicData.audio_url) {
            // If API returns URL, download and upload to our storage
            try {
                console.log('Downloading audio from URL...');
                const audioResponse = await fetch(musicData.audio_url);
                if (audioResponse.ok) {
                    const audioBlob = await audioResponse.arrayBuffer();
                    
                    // Upload to Supabase Storage
                    const timestamp = Date.now();
                    const fileName = `music_${timestamp}.${audioSettings.format}`;
                    const storagePath = `generated/${fileName}`;
                    
                    console.log('Uploading to Supabase Storage...');
                    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/music-files/${storagePath}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': `audio/${audioSettings.format}`,
                            'x-upsert': 'true'
                        },
                        body: audioBlob
                    });

                    if (uploadResponse.ok) {
                        finalAudioUrl = `${supabaseUrl}/storage/v1/object/public/music-files/${storagePath}`;
                        console.log('Audio uploaded to storage:', finalAudioUrl);
                    } else {
                        const errorText = await uploadResponse.text();
                        console.error('Storage upload failed:', errorText);
                        // Fallback to original URL if storage fails
                        finalAudioUrl = musicData.audio_url;
                    }
                } else {
                    finalAudioUrl = musicData.audio_url;
                }
            } catch (uploadErr) {
                console.error('Audio upload error:', uploadErr);
                finalAudioUrl = musicData.audio_url;
            }
        } else if (musicData.audio) {
            // Handle hex-encoded audio data
            audioBinary = musicData.audio;
            
            // Try to upload hex-encoded data to storage
            try {
                console.log('Processing hex-encoded audio...');
                const bytes = new Uint8Array(musicData.audio.length / 2);
                for (let i = 0; i < musicData.audio.length; i += 2) {
                    bytes[i / 2] = parseInt(musicData.audio.substr(i, 2), 16);
                }
                
                const timestamp = Date.now();
                const fileName = `music_${timestamp}.${audioSettings.format}`;
                const storagePath = `generated/${fileName}`;
                
                console.log('Uploading hex audio to Supabase Storage...');
                const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/music-files/${storagePath}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': `audio/${audioSettings.format}`,
                        'x-upsert': 'true'
                    },
                    body: bytes
                });

                if (uploadResponse.ok) {
                    finalAudioUrl = `${supabaseUrl}/storage/v1/object/public/music-files/${storagePath}`;
                    console.log('Hex audio uploaded to storage:', finalAudioUrl);
                } else {
                    const errorText = await uploadResponse.text();
                    console.error('Storage upload failed:', errorText);
                }
            } catch (uploadErr) {
                console.error('Hex audio upload error:', uploadErr);
            }
        }

        // Extract metadata
        if (musicData.metadata) {
            duration = musicData.metadata.duration || null;
        }

        // Save music metadata to database
        const musicRecord = {
            prompt: prompt,
            lyrics: lyrics,
            audio_url: finalAudioUrl,
            audio_data: audioBinary ? audioBinary.substring(0, 1000) : null, // Store first 1000 chars as backup
            duration: duration,
            sample_rate: audioSettings.sample_rate,
            bitrate: audioSettings.bitrate,
            format: audioSettings.format,
            user_id: userId,
            created_at: new Date().toISOString()
        };

        console.log('Saving metadata to database...');
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/music_generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(musicRecord)
        });

        let savedData = null;
        if (insertResponse.ok) {
            savedData = await insertResponse.json();
            console.log('Metadata saved successfully');
        } else {
            const errorText = await insertResponse.text();
            console.error('Database insert error:', errorText);
            // Continue even if database insert fails
        }

        return new Response(JSON.stringify({
            data: {
                id: savedData?.[0]?.id || null,
                audioUrl: finalAudioUrl,
                audioData: audioBinary,
                duration: duration,
                prompt: prompt,
                lyrics: lyrics,
                audioSettings: audioSettings,
                metadata: musicData.metadata || {}
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Music generation error:', error);

        const errorResponse = {
            error: {
                code: 'MUSIC_GENERATION_FAILED',
                message: error.message || 'An unexpected error occurred'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
