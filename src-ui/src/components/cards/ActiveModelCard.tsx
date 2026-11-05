import React from 'react';
import { BaseCard } from './BaseCard';
import { Cpu, Server } from 'lucide-react';
import { useSharedRuntime } from '../../contexts/RuntimeContext';
import styles from './Cards.module.css';

export const ActiveModelCard: React.FC = () => {
  const { activeModel, runtimeModel, runtimeStatus, backendState } = useSharedRuntime();

  const formattedActiveModel = activeModel ? activeModel.split('/').pop()?.split('\\').pop() : 'None';
  const formattedRuntimeModel = runtimeModel ? runtimeModel.split('/').pop()?.split('\\').pop() : 'No Model Loaded';

  return (
    <BaseCard title="Active Model" icon={<Cpu />}>
      <div className={styles.specGrid}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Selected Model</span>
          <span className={styles.specValue}>{formattedActiveModel}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}><Server size={14}/> Runtime Model</span>
          <span className={styles.specValue}>{formattedRuntimeModel}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Backend</span>
          <span className={styles.specValue}>{backendState} ({runtimeStatus})</span>
        </div>
      </div>
    </BaseCard>
  );
};
