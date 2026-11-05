import React from 'react';
import { DownloadCloud, Terminal } from 'lucide-react';
import { useDiagnostics, DiagnosticEvent } from '../../hooks/useDiagnostics';
import styles from './DiagnosticsLog.module.css';

export const DiagnosticsLog: React.FC = () => {
  const { events, exportDiagnostics } = useDiagnostics();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      default: return 'var(--accent)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <Terminal size={16} />
          <span>Runtime Events Log</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.exportBtn} onClick={() => exportDiagnostics('csv')}>
            <DownloadCloud size={14} /> Export CSV
          </button>
          <button className={styles.exportBtn} onClick={() => exportDiagnostics('json')}>
            <DownloadCloud size={14} /> Export JSON
          </button>
        </div>
      </div>
      <div className={styles.logWindow}>
        {events.length === 0 ? (
          <div className={styles.empty}>No runtime events recorded.</div>
        ) : (
          events.map(event => (
            <div key={event.id} className={styles.logEntry}>
              <span className={styles.time}>[{event.time.toLocaleTimeString()}]</span>
              <span 
                className={styles.level} 
                style={{ color: getLevelColor(event.level) }}
              >
                {event.level.toUpperCase()}
              </span>
              <span className={styles.message}>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
