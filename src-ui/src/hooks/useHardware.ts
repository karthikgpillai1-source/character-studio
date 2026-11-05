import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface CpuInfo {
  name: string;
  vendor: string;
  cores: number;
  threads: number;
  frequency_mhz: number;
  max_frequency_mhz: number;
  architecture: string;
  avx: boolean;
  avx2: boolean;
  avx512: boolean;
  fma: boolean;
  sse4_1: boolean;
  sse4_2: boolean;
  usage_percent: number;
}

export interface MemoryInfo {
  total_ram_gb: number;
  available_ram_gb: number;
  used_ram_gb: number;
  utilization_percent: number;
}

export interface StorageInfo {
  drive_name: string;
  total_capacity_gb: number;
  free_capacity_gb: number;
  used_capacity_gb: number;
  low_space_warning: boolean;
}

export interface GpuInfo {
  detected: boolean;
  reason: string | null;
  name: string;
  driver_version: string;
  vram_total_gb: number;
  vram_used_gb: number;
  vram_free_gb: number;
  cuda_support: boolean;
  usage_percent: number;
}

export interface CapabilitiesInfo {
  cuda: boolean;
  vulkan: boolean;
  directml: boolean;
  avx: boolean;
  avx2: boolean;
  avx512: boolean;
  fma: boolean;
}

export interface RecommendationInfo {
  recommended_backend: string;
  recommended_model_size: string;
  recommended_context_length: string;
  performance_estimate: string;
}

export interface HardwareSnapshot {
  cpu: CpuInfo;
  memory: MemoryInfo;
  storage: StorageInfo;
  gpus: GpuInfo[];
  capabilities: CapabilitiesInfo;
  recommendations: RecommendationInfo;
  timestamp: number;
}

export function useHardware() {
  const [snapshot, setSnapshot] = useState<HardwareSnapshot | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch for recommendations
    invoke<RecommendationInfo>('get_hardware_recommendations')
      .then(setRecommendation)
      .catch(setError);

    // Polling loop for live snapshot
    const fetchSnapshot = () => {
      invoke<HardwareSnapshot>('get_hardware_snapshot')
        .then(setSnapshot)
        .catch(setError);
    };
    
    fetchSnapshot();
    const interval = setInterval(() => {
      invoke('refresh_hardware_snapshot').then(fetchSnapshot).catch(setError);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { snapshot, recommendation, error };
}
