interface ButterflyProps {
  delay?: number;
  color?: 'blue' | 'orange' | 'pink' | 'lavender';
}

const colorMap = {
  blue: 'from-sky-300 to-blue-400',
  orange: 'from-orange-300 to-amber-400',
  pink: 'from-pink-300 to-rose-400',
  lavender: 'from-purple-300 to-violet-400',
};

export function Butterfly({ delay = 0, color = 'blue' }: ButterflyProps) {
  const gradientClass = colorMap[color];

  return (
    <div
      className="butterfly absolute opacity-70"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <div className="butterfly-wings flex gap-1">
        <div className={`wing-left w-8 h-12 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}></div>
        <div className={`wing-right w-8 h-12 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}></div>
      </div>
    </div>
  );
}
