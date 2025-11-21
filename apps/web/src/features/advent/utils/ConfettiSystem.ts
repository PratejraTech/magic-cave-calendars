import confetti from 'canvas-confetti';

export class ConfettiSystem {
  static burst({
    type,
    count = 50,
    origin = { x: 0.5, y: 0.6 }
  }: {
    type: 'snow' | 'stars' | 'candy' | 'reindeer' | 'hearts' | 'leaves';
    count?: number;
    origin?: { x: number; y: number };
  }) {
    const colors = {
      snow: ['#FFFFFF', '#E0F6FF', '#B8D4E3'],
      stars: ['#FFD700', '#FFA500', '#FFFF00', '#FFF8DC'],
      candy: ['#FF69B4', '#00FF7F', '#87CEEB', '#FF1493'],
      reindeer: ['#8B4513', '#FFD700', '#FF0000', '#DC143C'],
      hearts: ['#FF69B4', '#FF1493', '#DC143C', '#FF6B9D'],
      leaves: ['#059669', '#10B981', '#34D399', '#6EE7B7']
    };

    const shapes = {
      snow: ['circle'],
      stars: ['star'],
      candy: ['circle', 'square'],
      reindeer: ['circle', 'square'],
      hearts: ['circle'], // Using circle as base, will be styled as hearts
      leaves: ['circle']  // Using circle as base, will be styled as leaves
    };

    const config = {
      particleCount: count,
      spread: 70,
      origin,
      colors: colors[type] || colors.snow,
      gravity: 0.8,
      drift: 0.1,
      ticks: 200,
      shapes: shapes[type] || ['circle'],
      scalar: type === 'snow' ? 0.8 : 1
    };

    // Special configurations for new particle types
    if (type === 'hearts') {
      config.gravity = 0.6;
      config.drift = 0.2;
      config.scalar = 1.2;
    } else if (type === 'leaves') {
      config.gravity = 0.4;
      config.drift = 0.3;
      config.scalar = 0.9;
    }

    confetti(config);
  }

  static snowstorm() {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFFFFF', '#E0F6FF']
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFFFFF', '#E0F6FF']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * Create a heart-shaped burst effect
   */
  static heartBurst(origin = { x: 0.5, y: 0.6 }, intensity = 1) {
    const count = Math.floor(30 * intensity);

    // Create heart pattern by firing from multiple angles
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) + 22.5; // Offset to create heart shape
      confetti({
        particleCount: Math.floor(count / 8),
        angle,
        spread: 30,
        origin,
        colors: ['#FF69B4', '#FF1493', '#DC143C', '#FF6B9D'],
        gravity: 0.6,
        drift: 0.2,
        ticks: 150,
        scalar: 1.2
      });
    }
  }

  /**
   * Create a magical sparkle effect
   */
  static sparkle(origin = { x: 0.5, y: 0.5 }, duration = 2000) {
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: Math.random() * 360,
        spread: 360,
        origin,
        colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFF8DC', '#FFE4B5'],
        gravity: 0.3,
        drift: Math.random() * 0.4 - 0.2,
        ticks: 100,
        shapes: ['star'],
        scalar: 0.8
      });

      if (Date.now() < end) {
        setTimeout(frame, 200);
      }
    };

    frame();
  }

  /**
   * Create a gentle leaf fall effect
   */
  static leafFall(duration = 4000) {
    const end = Date.now() + duration;

    const frame = () => {
      // Left side falling
      confetti({
        particleCount: 1,
        angle: 70 + Math.random() * 20,
        spread: 20,
        origin: { x: Math.random() * 0.3 },
        colors: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
        gravity: 0.4,
        drift: 0.3,
        ticks: 300,
        scalar: 0.9
      });

      // Right side falling
      confetti({
        particleCount: 1,
        angle: 110 + Math.random() * 20,
        spread: 20,
        origin: { x: 0.7 + Math.random() * 0.3 },
        colors: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
        gravity: 0.4,
        drift: -0.3,
        ticks: 300,
        scalar: 0.9
      });

      if (Date.now() < end) {
        setTimeout(frame, 800);
      }
    };

    frame();
  }

  /**
   * Create a celebratory multi-effect burst
   */
  static celebration(origin = { x: 0.5, y: 0.6 }) {
    // Main burst
    this.burst({ type: 'stars', count: 50, origin });

    // Follow-up effects with delays
    setTimeout(() => this.heartBurst(origin, 0.5), 300);
    setTimeout(() => this.sparkle(origin), 600);
  }
}