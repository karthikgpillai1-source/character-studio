import React from 'react';
import { BaseCard } from './BaseCard';
import { Sparkles } from 'lucide-react';
import { useHardware } from '../../hooks/useHardware';
import styles from './Cards.module.css';

export const RecommendationCard: React.FC = () => {
  const { recommendation } = useHardware();

  return (
    <BaseCard title="System Recommendations" icon={<Sparkles />}>
      {recommendation ? (
        <div className={styles.recommendationGrid}>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Optimal Backend</span>
            <span className={styles.recValueHighlight}>{recommendation.recommended_backend}</span>
          </div>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Target Model Size</span>
            <span className={styles.recValueHighlight}>{recommendation.recommended_model_size}</span>
          </div>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Performance Tier</span>
            <span className={styles.recValueHighlight}>{recommendation.performance_estimate}</span>
          </div>
        </div>
      ) : (
        <div>Analyzing optimal configurations...</div>
      )}
    </BaseCard>
  );
};
