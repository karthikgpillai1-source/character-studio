import React from 'react';
import { Point } from '../../hooks/useMonitoring';
import styles from './Charts.module.css';

interface LiveLineChartProps {
  data: Point[];
  color: string;
  maxVal?: number; // Y-axis max
  height?: number;
}

export const LiveLineChart: React.FC<LiveLineChartProps> = ({ data, color, maxVal = 100, height = 80 }) => {
  if (data.length === 0) {
    return <div className={styles.emptyChart} style={{ height }}>Waiting for data...</div>;
  }

  // Ensure we render nicely even if less than 60 points
  const minPoints = 60; 
  const effectiveData = data.length < minPoints 
    ? [...Array(minPoints - data.length).fill({ value: 0 }), ...data]
    : data;

  const width = 100; // viewBox width percentages
  
  // Create path string
  const pathData = effectiveData.map((pt, i) => {
    const x = (i / (effectiveData.length - 1)) * width;
    const y = height - (Math.max(0, Math.min(maxVal, pt.value)) / maxVal) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create area fill string
  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className={styles.chartWrapper} style={{ height }}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="none" 
        className={styles.svg}
      >
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color})`} className={styles.area} />
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" className={styles.line} />
      </svg>
    </div>
  );
};
