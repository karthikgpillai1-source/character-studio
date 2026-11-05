import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface Model {
  id: number;
  name: string;
  path: string;
  size_bytes: number;
  quantization: string;
  context_length: number;
  backend: string | null;
  last_used: number | null;
  created_at: number;
  is_favorite: boolean;
}

export interface LibrarySummary {
  total_models: number;
  total_storage_bytes: number;
  favorite_count: number;
  recently_used: Model[];
}

export function useLibrary() {
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await invoke<LibrarySummary>('get_library_summary');
      setSummary(data);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, error, refetch: fetchSummary };
}
