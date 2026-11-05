import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface MemoryRecord {
  id: string;
  character_id: string;
  content: string;
  importance: number;
  source: string;
  created_at: number;
  last_accessed: number;
  memory_type: 'short_term' | 'long_term' | 'pinned' | 'system';
}

export function useMemory() {
  const [error, setError] = useState<string | null>(null);

  const getMemories = async (characterId: string): Promise<MemoryRecord[]> => {
    try {
      return await invoke('get_memories', { characterId });
    } catch (e: any) {
      console.warn("Failed to fetch memories", e);
      return [];
    }
  };

  const createMemory = async (req: any): Promise<MemoryRecord | null> => {
    try {
      return await invoke('create_memory', { req });
    } catch (e: any) {
      setError(e.toString());
      return null;
    }
  };

  const pinMemory = async (id: string): Promise<void> => {
    try {
      await invoke('pin_memory', { id });
    } catch (e: any) {
      setError(e.toString());
    }
  };

  const deleteMemory = async (id: string): Promise<void> => {
    try {
      await invoke('delete_memory', { id });
    } catch (e: any) {
      setError(e.toString());
    }
  };

  return { getMemories, createMemory, pinMemory, deleteMemory, error };
}
