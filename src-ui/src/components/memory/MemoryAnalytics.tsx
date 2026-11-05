import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Activity, Database, Network, TrendingUp } from 'lucide-react';
import styles from './MemoryAnalytics.module.css';

interface MemoryMetrics {
  total_memories: number;
  cluster_count: number;
  summary_count: number;
  avg_importance: number;
  retention_rate: number;
}

export const MemoryAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null);

  useEffect(() => {
    // In Phase 3.3B we mock the rust invocation
    setMetrics({
      total_memories: 142,
      cluster_count: 5,
      summary_count: 12,
      avg_importance: 68.4,
      retention_rate: 85.5,
    });
  }, []);

  if (!metrics) return null;

  return (
    <div className={styles.analyticsPanel}>
      <h3 className={styles.panelTitle}><Activity size={18} /> Cognitive Analytics</h3>
      
      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Database size={16} className={styles.metricIcon} /> Total Engrams
          </div>
          <div className={styles.metricValue}>{metrics.total_memories}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Network size={16} className={styles.metricIcon} /> Clusters
          </div>
          <div className={styles.metricValue}>{metrics.cluster_count}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <TrendingUp size={16} className={styles.metricIcon} /> Avg Importance
          </div>
          <div className={styles.metricValue}>{metrics.avg_importance.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};
