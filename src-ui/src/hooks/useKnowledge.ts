import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface KnowledgeDocument {
  id: string;
  character_id: string;
  name: string;
  file_type: string;
  size_bytes: number;
  created_at: number;
}

export interface RetrievalResult {
  chunk: {
    document_id: string;
    character_id: string;
    chunk_id: string;
    content: string;
    metadata: string;
  };
  confidence_score: number;
}

export function useKnowledge() {
  const [error, setError] = useState<string | null>(null);

  const getDocuments = async (characterId: string): Promise<KnowledgeDocument[]> => {
    try {
      return await invoke('get_documents', { characterId });
    } catch (e: any) {
      console.warn("Failed to fetch documents", e);
      return [];
    }
  };

  const importDocument = async (path: string, characterId: string): Promise<KnowledgeDocument | null> => {
    try {
      return await invoke('import_document', { path, characterId });
    } catch (e: any) {
      setError(e.toString());
      return null;
    }
  };

  const searchKnowledge = async (query: string, characterId: string, topK: number = 3): Promise<RetrievalResult[]> => {
    try {
      return await invoke('search_knowledge', { query: { query, character_id: characterId, top_k: topK } });
    } catch (e: any) {
      setError(e.toString());
      return [];
    }
  };

  return { getDocuments, importDocument, searchKnowledge, error };
}
