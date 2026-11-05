import React from 'react';
import { useHardware } from '../../hooks/useHardware';
import styles from './Status.module.css';
import { BaseCard } from '../cards/BaseCard';
import { Activity } from 'lucide-react';

export const LiveResourceMonitor: React.FC = () => {
  const { snapshot } = useHardware();

  if (!snapshot) return null;

  const renderBar = (label: string, percentage: number) => (
    <div className={styles.monitorRow}>
      <div className={styles.monitorHeader}>
        <span className={styles.monitorLabel}>{label}</span>
        <span className={styles.monitorValue}>{percentage.toFixed(1)}%</span>
      </div>
      <div className={styles.progressBarBg}>
        <div 
          className={styles.progressBarFill} 
          style={{ 
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: percentage > 90 ? 'var(--error)' : percentage > 70 ? 'var(--warning)' : 'var(--accent)'
          }}
        />
      </div>
    </div>
  );

  const memUsage = snapshot.memory?.utilization_percent || 0;
  const primaryGpu = snapshot.gpus && snapshot.gpus.length > 0 ? snapshot.gpus[0] : null;

  return (
    <BaseCard title="Live Resources" icon={<Activity />}>
      <div className={styles.monitorContainer}>
        {renderBar('CPU Usage', snapshot.cpu?.usage_percent || 0)}
        {renderBar('System RAM', memUsage)}
        {primaryGpu?.detected && (
           renderBar('GPU Usage', primaryGpu.usage_percent || 0)
        )}
      </div>
    </BaseCard>
  );
};
