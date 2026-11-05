import React from 'react';
import { HardwareOverviewCard } from '../../components/cards/HardwareOverviewCard';
import { RecommendationCard } from '../../components/cards/RecommendationCard';
import { RuntimeStatusCard } from '../../components/cards/RuntimeStatusCard';
import { ActiveModelCard } from '../../components/cards/ActiveModelCard';
import { ModelStatisticsCard } from '../../components/cards/ModelStatisticsCard';
import { QuickActionsCard } from '../../components/cards/QuickActionsCard';
import { LiveResourceMonitor } from '../../components/status/LiveResourceMonitor';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC<{ activePage?: string, onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.column}>
        <HardwareOverviewCard />
        <LiveResourceMonitor />
        <RecommendationCard />
      </div>
      
      <div className={styles.column}>
        <ActiveModelCard />
        <RuntimeStatusCard />
        <QuickActionsCard onNavigate={onNavigate} />
      </div>
      
      <div className={styles.column}>
        <ModelStatisticsCard />
      </div>
    </div>
  );
};
