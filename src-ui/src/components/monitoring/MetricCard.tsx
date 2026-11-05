import React, { ReactNode } from 'react';
import { LiveLineChart } from '../charts/LiveLineChart';
import { Point } from '../../hooks/useMonitoring';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: ReactNode;
  data: Point[];
  color: string;
  maxVal?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon, data, color, maxVal }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          {icon && <span className={styles.icon} style={{ color }}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.valueSection}>
          <span className={styles.value}>{value}</span>
          {subValue && <span className={styles.subValue}>{subValue}</span>}
        </div>
      </div>
      <div className={styles.chartArea}>
        <LiveLineChart data={data} color={color} maxVal={maxVal} height={60} />
      </div>
    </div>
  );
};
