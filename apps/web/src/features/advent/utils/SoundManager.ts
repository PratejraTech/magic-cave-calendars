import { gsap } from 'gsap';

type ExtendedWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const getAudioContextConstructor = (): typeof AudioContext | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const extendedWindow = window as ExtendedWindow;
  return window.AudioContext || extendedWindow.webkitAudioContext;
};

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicPlayer: HTMLAudioElement;
  private currentMusic = '';
  private isInitialized = false;

  private constructor() {
    this.musicPlayer = new Audio();
    this.musicPlayer.loop = true;
    this.musicPlayer.volume = 0.3;
    this.musicPlayer.preload = 'auto';
    this.musicPlayer.playsInline = true;
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async init() {
    if (this.isInitialized) return;
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) {
      // TODO: Implement proper logging service
      return;
    }

    try {
      this.audioContext = new AudioContextConstructor();
      this.isInitialized = true;
    } catch {
      // TODO: Implement proper logging service
    }
  }

  private async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch {
      // TODO: Implement proper logging service
    }
  }

  play(name: string, volume = 1) {
    if (!this.audioContext) return;

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    this.resumeContext()
      .then(() => source.start())
      .catch(() => source.start());
  }

  async playMusic(url: string, startTime?: number) {
    const hasSameSource = this.musicPlayer.src.endsWith(url);
    if (!hasSameSource) {
      this.musicPlayer.src = url;
    }
    this.currentMusic = url;
    if (startTime !== undefined) {
      this.musicPlayer.currentTime = startTime;
    }
    await this.resumeContext();
    await this.musicPlayer.play();
  }

  duckMusic(duration = 1000) {
    gsap.to(this.musicPlayer, { volume: 0.1, duration: duration / 1000 });
    setTimeout(() => gsap.to(this.musicPlayer, { volume: 0.3, duration: 0.5 }), duration);
  }

  stopMusic() {
    this.musicPlayer.pause();
    this.musicPlayer.currentTime = 0;
    this.currentMusic = '';
  }

  getCurrentMusic() {
    return this.currentMusic;
  }

  isMusicPlaying() {
    return !this.musicPlayer.paused;
  }
}
