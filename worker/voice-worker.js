/**
 * Cloudflare Worker for Voice Backend
 * Handles WebSocket connections to OpenAI Realtime API
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'Voice backend is running on Cloudflare Workers',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // WebSocket upgrade for voice connections
    if (request.headers.get('Upgrade') === 'websocket') {
      return handleWebSocket(request, env);
    }
    
    return new Response('Voice WebSocket Server on Cloudflare Workers', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

async function handleWebSocket(request, env) {
  // Create WebSocket pair
  const webSocketPair = new WebSocketPair();
  const client = webSocketPair[0];
  const server = webSocketPair[1];
  
  // Accept the WebSocket connection
  server.accept();
  
  // Connect to OpenAI Realtime API
  let openaiWs = null;
  
  try {
    const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
    openaiWs = new WebSocket(openaiUrl, {
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });
    
    // Ali's persona for the conversation
    const ALI_PERSONA = `You are Ali El-Kattan speaking in a job interview or portfolio conversation. Keep responses natural and conversational, as if speaking directly to someone interested in your work.

ABOUT ALI:
- System Architect & Mobile Developer
- Expert in Flutter/Dart, Rust, C/C++
- Built apps serving 10K+ users with 99.9% uptime
- Processed $2M+ in transactions with zero security breaches
- Remote work specialist with strong technical and business impact

KEY ACHIEVEMENTS:
- University Events Platform: 10K+ users, 99.9% uptime
- NFT Album Social Platform: $2M+ transactions processed
- Anonymous Chat with military-grade encryption
- CloudWatch TUI in Rust: 10x performance improvement

SPEAKING STYLE:
- Be confident but approachable
- Give specific examples from real projects
- Keep responses under 60 seconds when spoken
- Show enthusiasm for technology
- Ask follow-up questions when appropriate

Respond as Ali would in a friendly, professional conversation about his portfolio and experience.`;
    
    // Handle OpenAI WebSocket connection
    openaiWs.addEventListener('open', () => {
      console.log('Connected to OpenAI Realtime API');
      
      // Initialize session with Ali's persona
      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: ALI_PERSONA,
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.3,
            prefix_padding_ms: 100,
            silence_duration_ms: 500
          },
          tools: [],
          tool_choice: 'none',
          temperature: 0.7,
          max_response_output_tokens: 4096
        }
      }));
    });
    
    // Forward messages from OpenAI to client
    openaiWs.addEventListener('message', (event) => {
      try {
        if (server.readyState === WebSocket.READY_STATE_OPEN) {
          server.send(event.data);
        }
      } catch (error) {
        console.error('Error forwarding message from OpenAI:', error);
      }
    });
    
    // Handle OpenAI WebSocket errors
    openaiWs.addEventListener('error', (error) => {
      console.error('OpenAI WebSocket error:', error);
      if (server.readyState === WebSocket.READY_STATE_OPEN) {
        server.send(JSON.stringify({
          type: 'error',
          error: { message: 'OpenAI connection error' }
        }));
      }
    });
    
    // Handle OpenAI WebSocket close
    openaiWs.addEventListener('close', () => {
      console.log('OpenAI WebSocket closed');
      if (server.readyState === WebSocket.READY_STATE_OPEN) {
        server.close();
      }
    });
    
    // Handle client messages
    server.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (openaiWs && openaiWs.readyState === WebSocket.READY_STATE_OPEN) {
          openaiWs.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error('Error parsing client message:', error);
      }
    });
    
    // Handle client disconnect
    server.addEventListener('close', () => {
      console.log('Client WebSocket closed');
      if (openaiWs && openaiWs.readyState === WebSocket.READY_STATE_OPEN) {
        openaiWs.close();
      }
    });
    
    // Handle client errors
    server.addEventListener('error', (error) => {
      console.error('Client WebSocket error:', error);
      if (openaiWs && openaiWs.readyState === WebSocket.READY_STATE_OPEN) {
        openaiWs.close();
      }
    });
    
  } catch (error) {
    console.error('Error setting up WebSocket connection:', error);
    if (server.readyState === WebSocket.READY_STATE_OPEN) {
      server.send(JSON.stringify({
        type: 'error',
        error: { message: 'Failed to connect to voice service' }
      }));
      server.close();
    }
  }
  
  // Return the WebSocket response
  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}