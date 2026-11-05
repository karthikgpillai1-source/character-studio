import React from 'react';
import { BaseCard } from './BaseCard';
import { Database } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import styles from './Cards.module.css';

export const ModelStatisticsCard: React.FC = () => {
  const { stats, error } = useDashboardStats();

  if (error) {
    return (
      <BaseCard title="Database Statistics" icon={<Database />}>
        <div className={styles.errorState}>Failed to load statistics: {error}</div>
      </BaseCard>
    );
  }

  if (!stats) {
    return <BaseCard title="Database Statistics" icon={<Database />}>Loading Statistics...</BaseCard>;
  }

  return (
    <BaseCard title="Database Statistics" icon={<Database />}>
      <div className={styles.specGrid}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Models</span>
          <span className={styles.specValue}>{stats.models_count} Models</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Characters</span>
          <span className={styles.specValue}>{stats.characters_count} Characters</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Recipes</span>
          <span className={styles.specValue}>{stats.recipes_count} Recipes</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Memories</span>
          <span className={styles.specValue}>{stats.memories_count} Memories</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Knowledge Documents</span>
          <span className={styles.specValue}>{stats.knowledge_documents_count} Documents</span>
        </div>
      </div>
    </BaseCard>
  );
};
