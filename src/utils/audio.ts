// Web Audio API ambient soundscape & timer chime engine
// Synthesizes sound entirely in the client with no external audio file dependencies.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlayingSoundscape = false;
  private currentPreset: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft, beautiful completion chime
  public playCompletionChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Major chord triad (E5, G#5, B5)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.1);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(987.77, now + 0.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc3.start(now + 0.2);

      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
      osc3.stop(now + 2.5);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Play ambient background soundscape
  public startSoundscape(preset: 'binaural_focus' | 'alpha_flow' | 'rain' | 'library_brown' | 'none', volume = 0.4) {
    this.stopSoundscape();
    if (preset === 'none') {
      this.currentPreset = 'none';
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(volume, now);
      this.gainNode.connect(this.ctx.destination);

      if (preset === 'binaural_focus' || preset === 'alpha_flow') {
        // Binaural beats: base freq + offset to entrain brainwaves
        const baseFreq = 200;
        const beatFreq = preset === 'binaural_focus' ? 40 : 10; // 40Hz Gamma or 10Hz Alpha

        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        const merger = this.ctx.createChannelMerger(2);

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(baseFreq, now);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(baseFreq + beatFreq, now);

        oscL.connect(merger, 0, 0); // left channel
        oscR.connect(merger, 0, 1); // right channel

        merger.connect(this.gainNode);
        oscL.start();
        oscR.start();

        this.currentSourceNode = merger;
        this.isPlayingSoundscape = true;
        this.currentPreset = preset;
      } else if (preset === 'rain' || preset === 'library_brown') {
        // Synthesize noise buffer
        const bufferSize = this.ctx.sampleRate * 3; // 3 seconds looping noise
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (preset === 'library_brown') {
            // Brown noise (soothing warm rumble)
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
          } else {
            // Soft rain (pink/bandpass filtered)
            output[i] = (lastOut + (0.08 * white)) / 1.08;
            lastOut = output[i];
            output[i] *= 2.0;
          }
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for organic acoustic texture
        const filter = this.ctx.createBiquadFilter();
        if (preset === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, now);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);
        }

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        whiteNoise.start();

        this.currentSourceNode = whiteNoise;
        this.isPlayingSoundscape = true;
        this.currentPreset = preset;
      }
    } catch (e) {
      console.warn('Soundscape play error:', e);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopSoundscape() {
    try {
      if (this.currentSourceNode) {
        if ('stop' in this.currentSourceNode) {
          (this.currentSourceNode as any).stop();
        }
        this.currentSourceNode.disconnect();
        this.currentSourceNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isPlayingSoundscape = false;
      this.currentPreset = 'none';
    } catch (e) {
      console.warn('Error stopping soundscape:', e);
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlayingSoundscape,
      preset: this.currentPreset
    };
  }
}

export const soundManager = new AudioEngine();
