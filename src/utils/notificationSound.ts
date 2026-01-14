// WhatsApp-like notification sound as base64 encoded audio
// This is a simple "pop" notification sound

const NOTIFICATION_SOUND_BASE64 = `data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNdU0SAAAAAAD/+1DEAAAGAAGf9AAAIwAANIAAAAS7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/7UMQAAAjAAZv4AAAjAAA0gAAABLu7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7`;

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;

const initAudio = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  if (!audioBuffer) {
    try {
      // Create a simple "pop" sound programmatically
      const sampleRate = audioContext.sampleRate;
      const duration = 0.15; // 150ms
      const numSamples = sampleRate * duration;
      
      audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      // Generate a pleasant notification "pop" sound
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Frequency sweep from 800Hz to 400Hz
        const freq = 800 - (t / duration) * 400;
        // Amplitude envelope (quick attack, smooth decay)
        const envelope = Math.exp(-t * 25) * Math.sin(t * 50);
        // Generate the sound
        channelData[i] = envelope * Math.sin(2 * Math.PI * freq * t) * 0.5;
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }
};

export const playNotificationSound = async () => {
  try {
    await initAudio();
    
    if (!audioContext || !audioBuffer) {
      console.warn('Audio not initialized');
      return;
    }
    
    // Resume audio context if suspended (needed for mobile)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Add a bit of gain for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3; // 30% volume
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start(0);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Pre-initialize audio on user interaction to avoid autoplay restrictions
export const preloadNotificationSound = () => {
  initAudio();
};
