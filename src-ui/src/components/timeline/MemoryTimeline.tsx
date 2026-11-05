import React from 'react';
import { MemoryRecord } from '../../hooks/useMemory';
import { Pin, Clock, BrainCircuit, Activity } from 'lucide-react';
import styles from './Memory.module.css';

interface MemoryTimelineProps {
  memories: MemoryRecord[];
  onSelect: (m: MemoryRecord) => void;
  selectedId: string | null;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ memories, onSelect, selectedId }) => {
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'pinned': return <Pin size={14} className={styles.iconPinned} />;
      case 'long_term': return <BrainCircuit size={14} className={styles.iconLong} />;
      case 'system': return <Activity size={14} className={styles.iconSystem} />;
      default: return <Clock size={14} className={styles.iconShort} />;
    }
  };

  const getImportanceColor = (val: number) => {
    if (val > 80) return 'var(--error)';
    if (val > 50) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className={styles.timelineContainer}>
      {memories.map(mem => (
        <div 
          key={mem.id} 
          className={`${styles.memoryItem} ${selectedId === mem.id ? styles.selected : ''}`}
          onClick={() => onSelect(mem)}
        >
          <div className={styles.memoryHeader}>
            <div className={styles.typeBadge}>
              {getIcon(mem.memory_type)}
              <span>{mem.memory_type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className={styles.importanceBadge} style={{ color: getImportanceColor(mem.importance), borderColor: getImportanceColor(mem.importance) }}>
              IMP: {mem.importance}
            </div>
          </div>
          <div className={styles.memoryContent}>
            {mem.content}
          </div>
          <div className={styles.memoryFooter}>
            {new Date(mem.created_at * 1000).toLocaleString()} • {mem.source}
          </div>
        </div>
      ))}
    </div>
  );
};
