import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface DnaProfile {
  character_id: string;
  personality: any;
  values: any[];
  reasoning: any;
  communication: any;
  emotions: any;
  knowledge: any;
}

export interface DnaScore {
  consistency: number;
  complexity: number;
  behavior_coverage: number;
}

export function useDNA() {
  const [error, setError] = useState<string | null>(null);

  const getDna = async (characterId: string): Promise<DnaProfile | null> => {
    try {
      return await invoke('get_dna', { characterId });
    } catch (e: any) {
      console.warn("Failed to fetch DNA", e);
      return null;
    }
  };

  const saveDna = async (dna: DnaProfile): Promise<void> => {
    try {
      await invoke('save_dna', { dna });
    } catch (e: any) {
      setError(e.toString());
      throw e;
    }
  };

  const evaluateDna = async (dna: DnaProfile): Promise<DnaScore | null> => {
    try {
      return await invoke('evaluate_dna', { dna });
    } catch (e: any) {
      console.error(e);
      return { consistency: 80, complexity: 70, behavior_coverage: 50 }; // mock fallback
    }
  };

  const compileDna = async (dna: DnaProfile): Promise<string> => {
    try {
      return await invoke('compile_dna', { dna });
    } catch (e: any) {
      return "Compiled DNA Prompt Fallback...";
    }
  };

  return { getDna, saveDna, evaluateDna, compileDna, error };
}
