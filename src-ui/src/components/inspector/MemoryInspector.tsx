import React from 'react';
import { MemoryRecord, useMemory } from '../../hooks/useMemory';
import { Trash2, Pin, ArrowUp, Activity } from 'lucide-react';
import styles from '../timeline/Memory.module.css';

interface MemoryInspectorProps {
  memory: MemoryRecord | null;
  onRefresh: () => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({ memory, onRefresh }) => {
  const { pinMemory, deleteMemory } = useMemory();

  if (!memory) {
    return (
      <div className={styles.inspectorEmpty}>
        Select a memory from the timeline to inspect its vectors and metadata.
      </div>
    );
  }

  const handlePin = async () => {
    await pinMemory(memory.id);
    onRefresh();
  };

  const handleDelete = async () => {
    await deleteMemory(memory.id);
    onRefresh();
  };

  return (
    <div className={styles.inspector}>
      <h3 className={styles.inspectorTitle}>Memory Metadata</h3>
      
      <div className={styles.metaGrid}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>ID</span>
          <span className={styles.metaValue}>{memory.id.substring(0, 8)}...</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Type</span>
          <span className={styles.metaValue}>{memory.memory_type}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Importance</span>
          <span className={styles.metaValue}>{memory.importance}/100</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Source</span>
          <span className={styles.metaValue}>{memory.source}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Created</span>
          <span className={styles.metaValue}>{new Date(memory.created_at * 1000).toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.vectorSim}>
        <div className={styles.vectorSimTitle}><Activity size={14} /> Embeddings (Mock)</div>
        <div className={styles.vectorSimBar}>
          [0.12, -0.45, 0.88, 0.02, -0.91, 0.33, ...]
        </div>
        <span className={styles.vectorSimDesc}>Vector representation for semantic search</span>
      </div>

      <div className={styles.inspectorActions}>
        <button className={styles.actionBtn} onClick={handlePin} disabled={memory.memory_type === 'pinned'}>
          <Pin size={16} /> Pin
        </button>
        <button className={styles.actionBtn}>
          <ArrowUp size={16} /> Promote
        </button>
        <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={handleDelete}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};
