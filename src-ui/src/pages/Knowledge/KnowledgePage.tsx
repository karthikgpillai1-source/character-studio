import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '../../components/layout/Layout';
import { DocumentList } from '../../components/knowledge/DocumentList';
import { KnowledgeSearch } from '../../components/retrieval/KnowledgeSearch';
import { KnowledgeAnalytics } from '../../components/knowledge/KnowledgeAnalytics';
import { useKnowledge, KnowledgeDocument } from '../../hooks/useKnowledge';
import { Upload, Database } from 'lucide-react';
import styles from './KnowledgePage.module.css';

const DEMO_CHAR_ID = 'demo-1234';

export const KnowledgePage: React.FC = () => {
  const { getDocuments, importDocument } = useKnowledge();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    const docs = await getDocuments(DEMO_CHAR_ID);
    
    // Mock phase 3.4
    if (docs.length === 0) {
      setDocuments([
        { id: '1', character_id: DEMO_CHAR_ID, name: 'Backstory.md', file_type: 'md', size_bytes: 4096, created_at: Date.now() / 1000 },
        { id: '2', character_id: DEMO_CHAR_ID, name: 'WorldLore.pdf', file_type: 'pdf', size_bytes: 1048576, created_at: Date.now() / 1000 - 86400 }
      ]);
    } else {
      setDocuments(docs);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we would read the path or array buffer
      const mockDoc: KnowledgeDocument = {
        id: Math.random().toString(36).substring(7),
        character_id: DEMO_CHAR_ID,
        name: file.name,
        file_type: file.name.split('.').pop() || 'txt',
        size_bytes: file.size,
        created_at: Date.now() / 1000
      };
      setDocuments([mockDoc, ...documents]);
    }
  };

  return (
    <PageContainer>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Knowledge Base</h1>
          <p className={styles.subtitle}>Inject external documents into your character's brain</p>
        </div>
        <div className={styles.actions}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".pdf,.txt,.md,.json,.docx" 
          />
          <button className={styles.uploadBtn} onClick={handleUploadClick}>
            <Upload size={16} /> Import Document
          </button>
        </div>
      </div>

      <KnowledgeAnalytics />

      <div className={styles.layout}>
        <div className={styles.docsArea}>
          <h3 className={styles.sectionTitle}><Database size={18} /> Ingested Sources</h3>
          <DocumentList documents={documents} />
        </div>
        
        <div className={styles.searchArea}>
          <h3 className={styles.sectionTitle}>RAG Simulator</h3>
          <KnowledgeSearch characterId={DEMO_CHAR_ID} />
        </div>
      </div>
    </PageContainer>
  );
};
