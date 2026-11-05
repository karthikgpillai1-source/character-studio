import React from 'react';
import { DnaScore } from '../../hooks/useDNA';
import { ShieldCheck, BrainCircuit, Target } from 'lucide-react';
import styles from './DNAEditor.module.css';

interface ScoreCardProps {
  score: DnaScore | null;
}

export const DNAScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  if (!score) return <div className={styles.scorePlaceholder}>Evaluating DNA...</div>;

  const getColor = (val: number) => {
    if (val > 80) return 'var(--success)';
    if (val > 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className={styles.scoreCard}>
      <h3 className={styles.scoreTitle}>DNA Heuristic Evaluation</h3>
      <div className={styles.scoreGrid}>
        <div className={styles.scoreMetric}>
          <div className={styles.metricHeader}>
            <ShieldCheck size={16} /> Consistency
          </div>
          <div className={styles.metricBar}>
            <div className={styles.metricFill} style={{ width: `${score.consistency}%`, backgroundColor: getColor(score.consistency) }} />
          </div>
          <span className={styles.metricVal}>{score.consistency}/100</span>
        </div>

        <div className={styles.scoreMetric}>
          <div className={styles.metricHeader}>
            <BrainCircuit size={16} /> Complexity
          </div>
          <div className={styles.metricBar}>
            <div className={styles.metricFill} style={{ width: `${score.complexity}%`, backgroundColor: getColor(score.complexity) }} />
          </div>
          <span className={styles.metricVal}>{score.complexity}/100</span>
        </div>

        <div className={styles.scoreMetric}>
          <div className={styles.metricHeader}>
            <Target size={16} /> Behavior Coverage
          </div>
          <div className={styles.metricBar}>
            <div className={styles.metricFill} style={{ width: `${score.behavior_coverage}%`, backgroundColor: getColor(score.behavior_coverage) }} />
          </div>
          <span className={styles.metricVal}>{score.behavior_coverage}/100</span>
        </div>
      </div>
    </div>
  );
};
