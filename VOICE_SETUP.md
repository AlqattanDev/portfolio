# Voice Mode Setup Guide

This guide explains how to set up and use the voice conversation feature in the portfolio.

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with access to the Realtime API
2. **Node.js**: Version 16 or higher
3. **Modern Browser**: Chrome, Firefox, or Safari with microphone access

## Setup Instructions

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install voice backend dependencies  
npm run voice:install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PUBLIC_VOICE_ENABLED=true
   VOICE_PORT=3001
   PUBLIC_VOICE_WS_URL=ws://localhost:3001
   ```

### 3. Running the Application

You have several options to run the application:

#### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev:full
```
This starts both the Astro dev server and the voice backend simultaneously.

#### Option 2: Run Servers Separately
In two different terminals:

Terminal 1 (Voice Backend):
```bash
npm run voice:dev
```

Terminal 2 (Astro Dev Server):
```bash
npm run dev
```

### 4. Using Voice Mode

1. Open your browser to `http://localhost:4321`
2. Look for the voice interface widget in the bottom-right corner
3. Click "Start Conversation" to begin
4. Allow microphone access when prompted
5. Speak naturally - the AI (Ali) will respond in real-time

## Features

- **Real-time Conversation**: Natural voice conversations with AI Ali
- **Visual Feedback**: Audio visualizer and status indicators
- **Transcription Display**: See both your speech and AI responses
- **Error Handling**: Clear error messages and retry functionality
- **Accessibility**: Screen reader support and keyboard navigation

## Troubleshooting

### Voice Interface Shows "Backend Offline"
- Make sure the voice backend is running: `npm run voice:dev`
- Check if port 3001 is available
- Verify your OpenAI API key is valid

### Microphone Access Denied
- Click the microphone icon in your browser's address bar
- Allow microphone access for localhost
- Refresh the page

### WebSocket Connection Errors
- Ensure both servers are running
- Check browser developer console for specific error messages
- Verify firewall isn't blocking port 3001

### Audio Issues
- Check browser compatibility (Chrome works best)
- Ensure your microphone is working in other applications
- Try refreshing the page

## Browser Compatibility

- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ⚠️ Safari (Limited WebRTC support)
- ❌ Internet Explorer (Not supported)

## Development Notes

The voice system uses:
- OpenAI Realtime API for speech processing
- WebSocket for real-time communication
- Web Audio API for microphone access
- Astro API routes for configuration

## Cost Considerations

The voice feature uses OpenAI's Realtime API, which charges per minute of audio:
- Input audio: ~$0.06 per minute
- Output audio: ~$0.24 per minute

Monitor your usage in the OpenAI dashboard.

## Security Notes

- API keys are only used server-side
- Audio data is processed by OpenAI (see their privacy policy)
- No audio is permanently stored by this application