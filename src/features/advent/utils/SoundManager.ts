import { gsap } from 'gsap';

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicPlayer: HTMLAudioElement;
  private currentMusic: string = '';
  private isInitialized = false;

  private constructor() {
    this.musicPlayer = new Audio();
    this.musicPlayer.loop = true;
    this.musicPlayer.volume = 0.3;
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
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

    source.start();
  }

  playMusic(url: string, startTime?: number) {
    if (this.currentMusic === url) return;
    this.currentMusic = url;
    this.musicPlayer.src = url;
    if (startTime !== undefined) {
      this.musicPlayer.currentTime = startTime;
    }
    this.musicPlayer.play().catch(err => console.log('Autoplay prevented:', err));
  }

  duckMusic(duration = 1000) {
    gsap.to(this.musicPlayer, { volume: 0.1, duration: duration / 1000 });
    setTimeout(() => gsap.to(this.musicPlayer, { volume: 0.3, duration: 0.5 }), duration);
  }

  stopMusic() {
    this.musicPlayer.pause();
    this.musicPlayer.currentTime = 0;
  }

  getCurrentMusic() {
    return this.currentMusic;
  }
}