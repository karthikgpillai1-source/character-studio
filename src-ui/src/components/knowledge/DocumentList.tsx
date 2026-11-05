import React from 'react';
import { KnowledgeDocument } from '../../hooks/useKnowledge';
import { FileText, File, FileCode2, Database } from 'lucide-react';
import styles from './Knowledge.module.css';

interface DocumentListProps {
  documents: KnowledgeDocument[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText size={24} className={styles.docIcon} />;
      case 'json': return <FileCode2 size={24} className={styles.docIcon} />;
      default: return <File size={24} className={styles.docIcon} />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (documents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Database size={32} />
        <p>No knowledge documents imported yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.docGrid}>
      {documents.map(doc => (
        <div key={doc.id} className={styles.docCard}>
          <div className={styles.docHeader}>
            {getIcon(doc.file_type)}
            <span className={styles.docType}>{doc.file_type.toUpperCase()}</span>
          </div>
          <div className={styles.docInfo}>
            <h4 className={styles.docTitle}>{doc.name}</h4>
            <div className={styles.docMeta}>
              <span>{formatSize(doc.size_bytes)}</span> • 
              <span>{new Date(doc.created_at * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
