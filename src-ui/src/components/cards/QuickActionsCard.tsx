import React from 'react';
import { BaseCard } from './BaseCard';
import { Zap, DownloadCloud, FolderOpen, MessageSquare, RefreshCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api';
import styles from './Cards.module.css';

export const QuickActionsCard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <BaseCard title="Quick Actions" icon={<Zap />}>
      <div className={styles.specGrid}>
        <button className={styles.actionBtn} onClick={() => onNavigate?.('Recipes')}>
          <DownloadCloud size={16} /> Import Model
        </button>
        <button className={styles.actionBtn} onClick={() => onNavigate?.('Recipes')}>
          <FolderOpen size={16} /> Open Library
        </button>
        <button className={styles.actionBtn} onClick={() => onNavigate?.('Workbench')}>
          <MessageSquare size={16} /> Open Chat
        </button>
        <button className={styles.actionBtn} onClick={() => invoke('refresh_hardware_snapshot')}>
          <RefreshCw size={16} /> Refresh Hardware
        </button>
      </div>
    </BaseCard>
  );
};
