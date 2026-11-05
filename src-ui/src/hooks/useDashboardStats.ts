import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface DashboardStats {
  models_count: number;
  characters_count: number;
  recipes_count: number;
  memories_count: number;
  knowledge_documents_count: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      invoke<DashboardStats>('get_dashboard_stats')
        .then(setStats)
        .catch(setError);
    };

    fetchStats();
    // Refresh interval 5s
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return { stats, error };
}
