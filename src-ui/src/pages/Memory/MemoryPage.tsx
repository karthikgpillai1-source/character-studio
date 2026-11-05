import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/Layout';
import { MemoryTimeline } from '../../components/timeline/MemoryTimeline';
import { MemoryInspector } from '../../components/inspector/MemoryInspector';
import { MemoryAnalytics } from '../../components/memory/MemoryAnalytics';
import { useMemory, MemoryRecord } from '../../hooks/useMemory';
import { BrainCircuit, Database } from 'lucide-react';
import styles from './MemoryPage.module.css';

// Using a mock character ID for phase 3.3 demo
const DEMO_CHAR_ID = 'demo-1234';

export const MemoryPage: React.FC = () => {
  const { getMemories, createMemory } = useMemory();
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [selectedMem, setSelectedMem] = useState<MemoryRecord | null>(null);
  const [newMemContent, setNewMemContent] = useState('');

  const fetch = async () => {
    const data = await getMemories(DEMO_CHAR_ID);
    
    // Mock data for Phase 3.3 if empty
    if (data.length === 0) {
      setMemories([
        { id: '1', character_id: DEMO_CHAR_ID, content: 'User prefers dark mode and concise answers.', importance: 85, source: 'Chat', created_at: Date.now() / 1000 - 86400, last_accessed: Date.now() / 1000, memory_type: 'pinned' },
        { id: '2', character_id: DEMO_CHAR_ID, content: 'Discussed the rust memory engine implementation.', importance: 40, source: 'Chat', created_at: Date.now() / 1000 - 3600, last_accessed: Date.now() / 1000, memory_type: 'short_term' },
        { id: '3', character_id: DEMO_CHAR_ID, content: 'User mentioned they live in Seattle.', importance: 70, source: 'Chat', created_at: Date.now() / 1000 - 604800, last_accessed: Date.now() / 1000, memory_type: 'long_term' },
      ]);
    } else {
      setMemories(data);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleCreate = async () => {
    if (!newMemContent.trim()) return;
    const req = {
      character_id: DEMO_CHAR_ID,
      content: newMemContent,
      importance: 50,
      source: 'Manual Entry',
      memory_type: 'short_term',
    };
    const res = await createMemory(req);
    if (res) {
      setMemories([res, ...memories]);
      setNewMemContent('');
    }
  };

  return (
    <PageContainer>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Memory Workstation</h1>
          <p className={styles.subtitle}>Inspect, consolidate, and prune character memories</p>
        </div>
        <button className={styles.consolidateBtn}>
          <Database size={16} /> Force Consolidation
        </button>
      </div>

      <MemoryAnalytics />

      <div className={styles.workspace}>
        <div className={styles.timelineArea}>
          <div className={styles.inputArea}>
            <BrainCircuit size={20} className={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Inject new manual memory..."
              value={newMemContent}
              onChange={e => setNewMemContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className={styles.injectInput}
            />
          </div>
          <MemoryTimeline 
            memories={memories} 
            onSelect={setSelectedMem} 
            selectedId={selectedMem?.id || null} 
          />
        </div>
        
        <div className={styles.inspectorArea}>
          <MemoryInspector memory={selectedMem} onRefresh={fetch} />
        </div>
      </div>
    </PageContainer>
  );
};
