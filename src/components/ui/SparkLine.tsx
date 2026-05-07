import React from 'react';

interface SparkLineProps {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
  animated?: boolean;
  className?: string;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  points,
  color = '#F36C00',
  width = 120,
  height = 40,
  showDot = false,
  animated = true,
  className
}) => {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const stepX = width / (points.length - 1);
  const getX = (i: number) => i * stepX;
  const getY = (val: number) => height - ((val - min) / range) * height;

  const d = points.reduce((acc, val, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`;
  }, '');

  return (
    <div className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animated ? "200" : "none"}
          strokeDashoffset={animated ? "200" : "none"}
          className={animated ? "animate-[draw-spark_1.5s_ease-out_forwards]" : ""}
        />
        {showDot && (
          <circle
            cx={getX(points.length - 1)}
            cy={getY(points[points.length - 1])}
            r="3"
            fill={color}
            className={animated ? "opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]" : ""}
          />
        )}
      </svg>
    </div>
  );
};
