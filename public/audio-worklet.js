// Audio Worklet for low-latency voice processing with interruption detection
class VoiceProcessorWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.vadThreshold = 0.02;
    this.silenceCount = 0;
    this.speechCount = 0;
    this.isSpeechDetected = false;
    this.minSpeechFrames = 3;
    this.minSilenceFrames = 10;
    
    // Buffer for sending chunks
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, _outputs, _parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputData = input[0];
    
    // Voice Activity Detection
    let rms = 0;
    for (let i = 0; i < inputData.length; i++) {
      rms += inputData[i] * inputData[i];
    }
    rms = Math.sqrt(rms / inputData.length);
    
    const currentlyHasSpeech = rms > this.vadThreshold;
    
    if (currentlyHasSpeech) {
      this.speechCount++;
      this.silenceCount = 0;
      
      if (this.speechCount >= this.minSpeechFrames && !this.isSpeechDetected) {
        this.isSpeechDetected = true;
        this.port.postMessage({
          type: 'speech-start',
          timestamp: currentTime
        });
      }
    } else {
      this.silenceCount++;
      this.speechCount = 0;
      
      if (this.silenceCount >= this.minSilenceFrames && this.isSpeechDetected) {
        this.isSpeechDetected = false;
        this.port.postMessage({
          type: 'speech-end',
          timestamp: currentTime
        });
      }
    }
    
    // Buffer audio data for streaming
    for (let i = 0; i < inputData.length; i++) {
      this.buffer[this.bufferIndex++] = inputData[i];
      
      if (this.bufferIndex >= this.bufferSize) {
        // Convert to PCM16 and send
        const pcm16Array = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          const sample = Math.max(-1, Math.min(1, this.buffer[j]));
          pcm16Array[j] = sample < 0 ? sample * 32768 : sample * 32767;
        }
        
        this.port.postMessage({
          type: 'audio-data',
          data: pcm16Array,
          isSpeechDetected: this.isSpeechDetected
        });
        
        this.bufferIndex = 0;
      }
    }
    
    return true;
  }
}

registerProcessor('voice-processor', VoiceProcessorWorklet);