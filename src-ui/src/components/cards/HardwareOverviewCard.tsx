import React from 'react';
import { BaseCard } from './BaseCard';
import { Cpu, HardDrive, Monitor, Zap } from 'lucide-react';
import { useHardware } from '../../hooks/useHardware';
import styles from './Cards.module.css';

export const HardwareOverviewCard: React.FC = () => {
  const { snapshot, error } = useHardware();

  if (error) {
    return (
      <BaseCard title="Hardware Overview" icon={<Cpu />}>
        <div className={styles.errorState}>Failed to load hardware data: {error}</div>
      </BaseCard>
    );
  }

  if (!snapshot) {
    return <BaseCard title="Hardware Overview" icon={<Cpu />}>Loading Hardware...</BaseCard>;
  }

  const primaryGpu = snapshot.gpus && snapshot.gpus.length > 0 ? snapshot.gpus[0] : null;

  return (
    <BaseCard title="Hardware Overview" icon={<Cpu />}>
      <div className={styles.specGrid}>
        <div className={styles.specItem}>
          <div className={styles.specLabel}><Monitor size={14} /> CPU</div>
          <div className={styles.specValue}>
            {snapshot.cpu?.name ? (
              <>
                <div>{snapshot.cpu.name}</div>
                <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                  {snapshot.cpu.cores} Cores / {snapshot.cpu.threads} Threads
                </div>
              </>
            ) : 'Unknown CPU'}
          </div>
        </div>
        <div className={styles.specItem}>
          <div className={styles.specLabel}><Monitor size={14} /> GPU</div>
          <div className={styles.specValue}>
            {primaryGpu?.detected ? primaryGpu.name : primaryGpu?.reason || 'GPU Detection Failed'}
          </div>
        </div>
        <div className={styles.specItem}>
          <div className={styles.specLabel}><HardDrive size={14} /> System RAM</div>
          <div className={styles.specValue}>
            {snapshot.memory ? (
              <>
                <div>{snapshot.memory.total_ram_gb.toFixed(1)} GB Installed</div>
                <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                  {snapshot.memory.available_ram_gb.toFixed(1)} GB Available
                </div>
              </>
            ) : 'Unknown'}
          </div>
        </div>
        <div className={styles.specItem}>
          <div className={styles.specLabel}><Zap size={14} /> Acceleration</div>
          <div className={styles.tags}>
            {snapshot.capabilities?.cuda && <span className={styles.tag}>CUDA</span>}
            {snapshot.capabilities?.vulkan && <span className={styles.tag}>Vulkan</span>}
            {snapshot.capabilities?.avx2 && <span className={styles.tag}>AVX2</span>}
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
