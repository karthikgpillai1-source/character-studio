import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  assigned_model: string | null;
  category: string;
  creator: string;
  is_favorite: boolean;
  created_at: number;
  updated_at: number;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  avatar: string;
  assigned_model: string | null;
  category: string;
  creator: string;
}

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async () => {
    try {
      // Mocked invoke or real invoke
      const data = await invoke<Character[]>('get_characters').catch(() => {
        // Fallback for Phase 3.1 UI testing if rust command isn't registered
        return [];
      });
      setCharacters(data);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const createCharacter = async (req: CreateCharacterRequest) => {
    try {
      const newChar = await invoke<Character>('create_character', { req });
      setCharacters(prev => [newChar, ...prev]);
      return newChar;
    } catch (err: any) {
      setError(err.toString());
      throw err;
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      await invoke('delete_character', { id });
      setCharacters(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.toString());
    }
  };

  return { characters, createCharacter, deleteCharacter, error, refetch: fetchCharacters };
}
