import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Check if voice backend is running
    const voiceWorkerUrl = import.meta.env.PUBLIC_VOICE_WORKER_URL || 'https://portfolio-voice-backend.exidiful.workers.dev';
    const voiceWsUrl = import.meta.env.PUBLIC_VOICE_WS_URL || 'wss://portfolio-voice-backend.exidiful.workers.dev';
    
    // Test connection to Cloudflare Worker backend
    let isVoiceBackendRunning = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${voiceWorkerUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      isVoiceBackendRunning = response.ok;
    } catch (error) {
      // Worker is not responding
      isVoiceBackendRunning = false;
    }

    return new Response(
      JSON.stringify({
        voiceEnabled: import.meta.env.PUBLIC_VOICE_ENABLED === 'true',
        voiceWsUrl,
        voiceBackendRunning: isVoiceBackendRunning,
        instructions: isVoiceBackendRunning 
          ? 'Voice backend is ready. Click to start conversation.'
          : 'Voice backend is not running. Start it with: npm run voice:dev'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Voice config error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to get voice configuration',
        voiceEnabled: false,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};