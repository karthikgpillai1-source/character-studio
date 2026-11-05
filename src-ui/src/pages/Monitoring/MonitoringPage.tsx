import React from 'react';
import { PageContainer } from '../../components/layout/Layout';
import { useMonitoring } from '../../hooks/useMonitoring';
import { MetricCard } from '../../components/monitoring/MetricCard';
import { DiagnosticsLog } from '../../components/diagnostics/DiagnosticsLog';
import { Cpu, Database, Activity, Zap, HardDrive, ShieldAlert } from 'lucide-react';
import styles from './MonitoringPage.module.css';

export const MonitoringPage: React.FC = () => {
  const { history, health, snapshot, runtime } = useMonitoring();

  const getHealthColor = () => {
    switch(health.status) {
      case 'Healthy': return 'var(--success)';
      case 'Warning': return 'var(--warning)';
      case 'Critical': return 'var(--error)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <PageContainer>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>System Monitoring</h1>
          <p className={styles.subtitle}>Workstation Diagnostics & Performance</p>
        </div>
        <div className={styles.healthBadge} style={{ borderColor: getHealthColor(), color: getHealthColor() }}>
          <ShieldAlert size={18} />
          {health.status}
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* Row 1: Core KPIs */}
        <div className={styles.kpiRow}>
          <MetricCard 
            title="CPU Usage" 
            value={`${history.cpu[history.cpu.length - 1]?.value.toFixed(1) || 0}%`}
            subValue={snapshot?.cpu?.name || 'Loading...'}
            icon={<Cpu size={16} />}
            data={history.cpu}
            color="#60a5fa"
          />
          <MetricCard 
            title="System RAM" 
            value={`${history.ram[history.ram.length - 1]?.value.toFixed(1) || 0}%`}
            subValue={snapshot?.memory ? `${(snapshot.memory.total_kb / 1024 / 1024).toFixed(1)} GB Total` : ''}
            icon={<Database size={16} />}
            data={history.ram}
            color="#a855f7"
          />
          <MetricCard 
            title="GPU VRAM Pressure" 
            value={`${history.vram[history.vram.length - 1]?.value.toFixed(1) || 0}%`}
            subValue={snapshot?.gpu?.name || 'No GPU Detected'}
            icon={<HardDrive size={16} />}
            data={history.vram}
            color="#f43f5e"
          />
          <MetricCard 
            title="Generation Speed" 
            value={`${history.tokensPerSec[history.tokensPerSec.length - 1]?.value.toFixed(1) || 0} t/s`}
            subValue={runtime?.generation_state === 'generating' ? 'Active Generation' : 'Idle'}
            icon={<Zap size={16} />}
            data={history.tokensPerSec}
            color="#22c55e"
            maxVal={50}
          />
        </div>

        {/* Row 2: Logs and Benchmarks */}
        <div className={styles.bottomRow}>
          <div className={styles.logContainer}>
             <DiagnosticsLog />
          </div>
          <div className={styles.benchmarksContainer}>
            <div className={styles.benchmarksHeader}>
              <Activity size={16} /> Recent Benchmarks
            </div>
            <div className={styles.benchmarksGrid}>
              {/* Mocked Benchmark Data */}
              <div className={styles.benchRow}>
                <span>Llama-3-8B-Instruct.gguf</span>
                <span className={styles.benchHighlight}>28.5 t/s</span>
              </div>
              <div className={styles.benchRow}>
                <span>Mistral-7B-v0.2.gguf</span>
                <span className={styles.benchHighlight}>32.1 t/s</span>
              </div>
              <div className={styles.benchRow}>
                <span>Phi-3-Mini-4K.gguf</span>
                <span className={styles.benchHighlight}>55.2 t/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
