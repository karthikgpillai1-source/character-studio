import React, { useEffect, useState } from 'react';
import { Activity, Database, FileText, HardDrive } from 'lucide-react';
import styles from './KnowledgeAnalytics.module.css';

interface AnalyticsData {
  document_count: number;
  chunk_count: number;
  storage_usage_bytes: number;
  retrieval_frequency: number;
  coverage_percent: number;
}

export const KnowledgeAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // In Phase 3.4B we mock the rust invocation
    setMetrics({
      document_count: 24,
      chunk_count: 3105,
      storage_usage_bytes: 14500000,
      retrieval_frequency: 850,
      coverage_percent: 92.4,
    });
  }, []);

  if (!metrics) return null;

  const formatSize = (bytes: number) => {
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.analyticsPanel}>
      <h3 className={styles.panelTitle}><Activity size={18} /> RAG Index Analytics</h3>
      
      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <FileText size={16} className={styles.metricIcon} /> Documents
          </div>
          <div className={styles.metricValue}>{metrics.document_count}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Database size={16} className={styles.metricIcon} /> Vector Chunks
          </div>
          <div className={styles.metricValue}>{metrics.chunk_count}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <HardDrive size={16} className={styles.metricIcon} /> Storage Usage
          </div>
          <div className={styles.metricValue}>{formatSize(metrics.storage_usage_bytes)}</div>
        </div>
      </div>
    </div>
  );
};
