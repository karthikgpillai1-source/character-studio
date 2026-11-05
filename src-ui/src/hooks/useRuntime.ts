import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface ModelMetadata {
  file_path: string;
  name: string;
  size_bytes: number;
  quantization: string;
  context_length: number;
}

export interface RuntimeStatus {
  is_running: boolean;
  pid: number | null;
  active_backend: string | null;
  current_model: ModelMetadata | null;
  uptime_seconds: number;
  tokens_per_second: number;
  memory_usage_mb: number;
  exit_code: number | null;
  exit_reason: string | null;
}

export function useRuntime() {
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      invoke<RuntimeStatus>('get_runtime_status')
        .then(setStatus)
        .catch(setError);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return { status, error };
}
