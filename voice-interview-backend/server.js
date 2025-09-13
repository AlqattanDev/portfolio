import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables using dotenv
// First try to load from parent directory, then from current directory
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.VOICE_PORT || 3001;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required');
  process.exit(1);
}

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

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Voice backend is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Voice WebSocket Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, _request) => {
  console.log('Client connected to voice WebSocket');
  
  // Connect to OpenAI Realtime API
  const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });

  openaiWs.on('open', () => {
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

  // Forward messages from client to OpenAI
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });

  // Forward messages from OpenAI to client
  openaiWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error parsing OpenAI message:', error);
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client WebSocket closed');
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });

  openaiWs.on('close', () => {
    console.log('OpenAI WebSocket closed');
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  openaiWs.on('error', (error) => {
    console.error('OpenAI WebSocket error:', error);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'OpenAI connection failed'
      }));
    }
  });

  ws.on('error', (error) => {
    console.error('Client WebSocket error:', error);
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Voice WebSocket server running on port ${PORT}`);
});