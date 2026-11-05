import React from 'react';
import { BaseCard } from './BaseCard';
import { Activity, Server } from 'lucide-react';
import { useRuntime } from '../../hooks/useRuntime';
import styles from './Cards.module.css';

export const RuntimeStatusCard: React.FC = () => {
  const { status } = useRuntime();

  return (
    <BaseCard title="Runtime Status" icon={<Activity />}>
      {status ? (
        <div className={styles.specGrid}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}><Server size={14}/> Active Backend</span>
            <span className={styles.specValue}>{status.active_backend || 'None'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Loaded Model</span>
            <span className={styles.specValue}>{status.current_model?.name || 'No Model Loaded'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Runtime State</span>
            <span className={styles.specValue}>{status.is_running ? 'Running' : 'Stopped'}</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Generation</span>
            <span className={styles.specValue}>{status.is_running ? 'Idle' : 'Stopped'}</span>
          </div>
        </div>
      ) : (
        <div className={styles.specValue}>Initializing Runtime...</div>
      )}
    </BaseCard>
  );
};
