
// Synthesized Audio Service using Web Audio API
// No external files required

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Engine
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  // Warp
  private warpOsc: OscillatorNode | null = null;
  private warpGain: GainNode | null = null;

  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Master volume
    this.masterGain.connect(this.ctx.destination);
    this.isInitialized = true;
    this.startAmbientDrone();
  }

  // Force resume audio context (Browser requirement)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 50; // Deep drone
    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
  }

  setEngineThrust(active: boolean) {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    if (active) {
      if (!this.noiseNode) {
        // Create brown noise for rumble
        const buffer = this.createNoiseBuffer();
        if (buffer) {
          this.noiseNode = this.ctx.createBufferSource();
          this.noiseNode.buffer = buffer;
          this.noiseNode.loop = true;
          
          // Lowpass filter to make it rumbly
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;

          this.noiseGain = this.ctx.createGain();
          this.noiseGain.gain.value = 0.0;
          
          this.noiseNode.connect(filter);
          filter.connect(this.noiseGain);
          this.noiseGain.connect(this.masterGain);
          this.noiseNode.start();
          
          // Fade in
          this.noiseGain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.1);
        }
      }
    } else {
      if (this.noiseNode && this.noiseGain) {
        // Fade out
        this.noiseGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        setTimeout(() => {
            this.noiseNode?.stop();
            this.noiseNode = null;
        }, 250);
      }
    }
  }

  playClickSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    // Short, high-tech blip
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playPlayerDialogueBlip() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playTypingSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    // Quick tick sound
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.03);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playScanSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playLaserSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playDamageSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    const buffer = this.createNoiseBuffer();
    if (buffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start();
      src.stop(this.ctx.currentTime + 0.5);
    }
  }

  // New louder explosion sound for Alien Death
  playExplosionSound() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const buffer = this.createNoiseBuffer();
    if (buffer) {
        // Source 1: Deep rumble
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, this.ctx.currentTime); // Louder start
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5); // Longer decay
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.0);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start();
        src.stop(this.ctx.currentTime + 1.5);

        // Source 2: Initial impact (Sine wave sweep)
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);
        
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
  }

  playAlienSpeak(text: string = "") {
    // Disabled
    return;
  }

  setWarpSound(active: boolean) {
      if (!this.ctx || !this.masterGain) return;
      this.resume();

      if (active) {
          if (!this.warpOsc) {
              this.warpOsc = this.ctx.createOscillator();
              this.warpOsc.type = 'sawtooth';
              this.warpOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
              this.warpOsc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 2); // Rising pitch

              this.warpGain = this.ctx.createGain();
              this.warpGain.gain.value = 0;
              this.warpGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 1);

              const filter = this.ctx.createBiquadFilter();
              filter.type = 'lowpass';
              filter.frequency.value = 500;

              this.warpOsc.connect(filter);
              filter.connect(this.warpGain);
              this.warpGain.connect(this.masterGain);
              this.warpOsc.start();
          }
      } else {
          if (this.warpOsc && this.warpGain) {
              this.warpGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
              setTimeout(() => {
                  this.warpOsc?.stop();
                  this.warpOsc = null;
              }, 500);
          }
      }
  }
}

export const audioService = new AudioService();
