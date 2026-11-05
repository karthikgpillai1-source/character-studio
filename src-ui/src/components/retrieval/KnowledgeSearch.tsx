import React, { useState } from 'react';
import { useKnowledge, RetrievalResult } from '../../hooks/useKnowledge';
import { Search, BrainCircuit } from 'lucide-react';
import styles from '../knowledge/Knowledge.module.css';

interface KnowledgeSearchProps {
  characterId: string;
}

export const KnowledgeSearch: React.FC<KnowledgeSearchProps> = ({ characterId }) => {
  const { searchKnowledge } = useKnowledge();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RetrievalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    const res = await searchKnowledge(query, characterId);
    
    // Mock results if empty
    if (res.length === 0 && query.length > 3) {
      setResults([
        {
          chunk: { document_id: 'doc1', character_id: characterId, chunk_id: 'chk1', content: `Mock retrieved context for query: "${query}". This simulates a RAG hit from a PDF document.`, metadata: '{"page": 4}' },
          confidence_score: 0.89
        }
      ]);
    } else {
      setResults(res);
    }
    
    setIsSearching(false);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputArea}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text"
          placeholder="Test RAG Retrieval... (e.g., 'What is the character's backstory?')"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className={styles.searchInput}
        />
        <button className={styles.searchBtn} onClick={handleSearch} disabled={isSearching}>
          Retrieve
        </button>
      </div>

      <div className={styles.resultsArea}>
        <h4 className={styles.resultsTitle}><BrainCircuit size={16} /> RAG Context Hits</h4>
        {results.length === 0 ? (
          <div className={styles.emptyResults}>No chunks retrieved yet.</div>
        ) : (
          <div className={styles.chunksList}>
            {results.map((res, idx) => (
              <div key={idx} className={styles.chunkCard}>
                <div className={styles.chunkHeader}>
                  <span className={styles.chunkScore}>Conf: {(res.confidence_score * 100).toFixed(1)}%</span>
                  <span className={styles.chunkMeta}>{res.chunk.metadata}</span>
                </div>
                <div className={styles.chunkContent}>{res.chunk.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
