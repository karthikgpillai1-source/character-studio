import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { HardwareSnapshot } from './useHardware';
import { RuntimeStatus } from './useRuntime';

export interface Point {
  time: number; // Unix timestamp
  value: number;
}

export interface MetricHistory {
  cpu: Point[];
  ram: Point[];
  gpu: Point[];
  vram: Point[];
  tokensPerSec: Point[];
}

export interface HealthStatus {
  status: 'Healthy' | 'Warning' | 'Critical';
  reasons: string[];
}

const MAX_HISTORY = 60; // 60 seconds of history at 1 tick/sec

export function useMonitoring() {
  const [snapshot, setSnapshot] = useState<HardwareSnapshot | null>(null);
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [history, setHistory] = useState<MetricHistory>({
    cpu: [], ram: [], gpu: [], vram: [], tokensPerSec: []
  });
  const [health, setHealth] = useState<HealthStatus>({ status: 'Healthy', reasons: [] });

  useEffect(() => {
    const tick = async () => {
      try {
        const hw = await invoke<HardwareSnapshot>('get_hardware_snapshot');
        const rt = await invoke<RuntimeStatus>('get_runtime_status');
        
        const now = Date.now();
        setSnapshot(hw);
        setRuntime(rt);

        // Calculate values
        const cpuVal = hw.cpu?.usage_percent || 0;
        const ramVal = hw.memory ? (hw.memory.used_kb / hw.memory.total_kb) * 100 : 0;
        const gpuVal = hw.gpu?.usage_percent || 0;
        // Mock VRAM usage if not in snapshot
        const vramVal = hw.gpu?.detected ? Math.min(100, gpuVal + Math.random() * 10) : 0; 
        
        // In a real app we'd get this from runtime stats. Mocking based on generation state.
        const tpsVal = rt.generation_state === 'generating' ? 20 + Math.random() * 10 : 0;

        setHistory(prev => {
          const push = (arr: Point[], val: number) => {
            const next = [...arr, { time: now, value: val }];
            if (next.length > MAX_HISTORY) next.shift();
            return next;
          };
          return {
            cpu: push(prev.cpu, cpuVal),
            ram: push(prev.ram, ramVal),
            gpu: push(prev.gpu, gpuVal),
            vram: push(prev.vram, vramVal),
            tokensPerSec: push(prev.tokensPerSec, tpsVal)
          };
        });

        // Compute Health
        const reasons: string[] = [];
        let st: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
        
        if (ramVal > 90) { st = 'Critical'; reasons.push('Critical RAM Pressure'); }
        else if (ramVal > 75) { st = st !== 'Critical' ? 'Warning' : 'Critical'; reasons.push('High RAM Pressure'); }

        if (vramVal > 95) { st = 'Critical'; reasons.push('Critical VRAM Pressure'); }
        else if (vramVal > 85) { st = st !== 'Critical' ? 'Warning' : 'Critical'; reasons.push('High VRAM Pressure'); }

        if (cpuVal > 95) { st = st !== 'Critical' ? 'Warning' : 'Critical'; reasons.push('CPU Throttling Risk'); }

        setHealth({ status: st, reasons });

      } catch (err) {
        console.error("Monitoring fetch failed", err);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return { snapshot, runtime, history, health };
}
