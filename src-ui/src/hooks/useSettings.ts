import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface SettingItem {
  id: number;
  key: string;
  value: string;
  updated_at: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // In a real app we'd fetch all settings at once with get_settings, 
  // but for the provided phase 1.4 API we have get_setting(key) and save_setting(key, value)
  // Let's assume we can fetch them individually or we add a get_all_settings command.
  // Given phase 1.4 only had `get_setting`, we'll simulate a local cache wrapper.

  const getSetting = async (key: string, defaultValue: string) => {
    try {
      const result = await invoke<SettingItem | null>('get_setting', { key });
      const value = result ? result.value : defaultValue;
      setSettings(prev => ({ ...prev, [key]: value }));
      return value;
    } catch (err: any) {
      setError(err.toString());
      return defaultValue;
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: value }));
      await invoke('save_setting', { key, value });
    } catch (err: any) {
      setError(err.toString());
    }
  };

  return {
    settings,
    getSetting,
    updateSetting,
    error
  };
}
