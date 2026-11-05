import React, { useState, useEffect } from 'react';
import { useDNA, DnaProfile, DnaScore } from '../../hooks/useDNA';
import { DNAScoreCard } from './DNAScoreCard';
import { Save, Code, SlidersHorizontal, Brain, MessageSquare, Heart, Database } from 'lucide-react';
import styles from './DNAEditor.module.css';

interface DNAEditorProps {
  characterId: string;
}

export const DNAEditor: React.FC<DNAEditorProps> = ({ characterId }) => {
  const { getDna, saveDna, evaluateDna, compileDna } = useDNA();
  
  const [activeTab, setActiveTab] = useState('personality');
  const [dna, setDna] = useState<DnaProfile | null>(null);
  const [score, setScore] = useState<DnaScore | null>(null);
  const [compiledPreview, setCompiledPreview] = useState<string>('');
  
  // Mocking initial load for Phase 3.2 UI demo
  useEffect(() => {
    setDna({
      character_id: characterId,
      personality: { curiosity: 5, confidence: 5, humor: 5, empathy: 5, patience: 5, creativity: 5, formality: 5 },
      values: [],
      reasoning: { analytical: 5, scientific: 5, strategic: 5, creative: 5, pragmatic: 5, emotional: 5, educational: 5 },
      communication: { verbosity: 5, tone: "Neutral", vocabulary_complexity: 5, humor_level: 5, directness: 5 },
      emotions: { optimism: 5, calmness: 5, aggression: 5, sensitivity: 5, resilience: 5 },
      knowledge: { allowed_domains: [], restricted_domains: [], expertise_areas: [] }
    });
  }, [characterId]);

  useEffect(() => {
    if (dna) {
      evaluateDna(dna).then(setScore);
    }
  }, [dna]);

  const handleSliderChange = (layer: keyof DnaProfile, trait: string, val: string) => {
    if (!dna) return;
    setDna({
      ...dna,
      [layer]: {
        ...(dna[layer] as any),
        [trait]: parseInt(val, 10)
      }
    });
  };

  const handlePreview = async () => {
    if (dna) {
      const res = await compileDna(dna);
      setCompiledPreview(res);
      setActiveTab('preview');
    }
  };

  if (!dna) return <div className={styles.loading}>Loading DNA Core...</div>;

  const renderSliders = (layerKey: keyof DnaProfile, obj: any) => {
    return (
      <div className={styles.sliderGrid}>
        {Object.keys(obj).map(key => {
          if (typeof obj[key] !== 'number') return null;
          return (
            <div key={key} className={styles.sliderGroup}>
              <div className={styles.sliderLabels}>
                <span className={styles.traitLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className={styles.traitValue}>{obj[key]}/10</span>
              </div>
              <input 
                type="range" 
                min="0" max="10" 
                value={obj[key]} 
                onChange={(e) => handleSliderChange(layerKey, key, e.target.value)}
                className={styles.rangeInput}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>DNA Layers</h3>
        <nav className={styles.tabs}>
          <button className={`${styles.tabBtn} ${activeTab === 'personality' ? styles.active : ''}`} onClick={() => setActiveTab('personality')}>
            <SlidersHorizontal size={16} /> Personality
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'reasoning' ? styles.active : ''}`} onClick={() => setActiveTab('reasoning')}>
            <Brain size={16} /> Reasoning
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'communication' ? styles.active : ''}`} onClick={() => setActiveTab('communication')}>
            <MessageSquare size={16} /> Communication
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'emotions' ? styles.active : ''}`} onClick={() => setActiveTab('emotions')}>
            <Heart size={16} /> Emotions
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.active : ''}`} onClick={handlePreview}>
            <Code size={16} /> Compiled Preview
          </button>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <DNAScoreCard score={score} />
        </div>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.header}>
          <h2>DNA Engine Configuration</h2>
          <button className={styles.saveBtn} onClick={() => saveDna(dna)}>
            <Save size={16} /> Save DNA
          </button>
        </div>

        <div className={styles.contentArea}>
          {activeTab === 'personality' && renderSliders('personality', dna.personality)}
          {activeTab === 'reasoning' && renderSliders('reasoning', dna.reasoning)}
          {activeTab === 'communication' && renderSliders('communication', dna.communication)}
          {activeTab === 'emotions' && renderSliders('emotions', dna.emotions)}
          
          {activeTab === 'preview' && (
            <div className={styles.previewContainer}>
              <pre className={styles.compiledOutput}>{compiledPreview || 'Click "Compiled Preview" to generate prompt.'}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
