import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { RuntimeStatus } from '../hooks/useRuntime';

export interface RuntimeContextState {
  engineStatus: RuntimeStatus | null;
  foundModels: string[];
  activeModel: string | null;
  setActiveModel: (model: string | null) => void;
  runtimeModel: string | null;
  runtimeStatus: string;
  backendState: string;
}

const RuntimeContext = createContext<RuntimeContextState | undefined>(undefined);

export const RuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engineStatus, setEngineStatus] = useState<RuntimeStatus | null>(null);
  const [foundModels, setFoundModels] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unlistenModelDiscovery: (() => void) | undefined;

    const fetchStatus = () => {
      invoke<RuntimeStatus>('get_runtime_status')
        .then(status => {
          if (isMounted) setEngineStatus(status);
        })
        .catch(() => {
          if (isMounted) {
            setEngineStatus({
              is_running: false,
              pid: null,
              active_backend: null,
              current_model: null,
              uptime_seconds: 0,
              tokens_per_second: 0,
              memory_usage_mb: 0,
              exit_code: null,
              exit_reason: 'Unavailable'
            });
          }
        });
    };

    const setupListeners = async () => {
      try {
        unlistenModelDiscovery = await listen<any>('model-discovery-result', (event) => {
          if (!isMounted) return;
          const payload = event.payload;
          const models = payload.found_models || [];
          setFoundModels(models);
          
          // Auto-select first model for UI purposes if none is selected
          setActiveModel(prev => {
            if (!prev && models.length > 0) return models[0];
            return prev;
          });
        });
      } catch (e) {
        console.warn('Failed to bind model-discovery-result listener in RuntimeContext', e);
      }
    };

    fetchStatus();
    setupListeners();
    const interval = setInterval(fetchStatus, 3000);
    invoke('discover_local_models').catch(console.error);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (unlistenModelDiscovery) unlistenModelDiscovery();
    };
  }, []);

  const runtimeModel = engineStatus?.current_model ? (engineStatus.current_model.name || engineStatus.current_model.file_path) : null;
  const runtimeStatus = engineStatus?.is_running ? 'Running' : 'Stopped';
  const backendState = engineStatus?.active_backend || 'Stopped';

  return (
    <RuntimeContext.Provider value={{ engineStatus, foundModels, activeModel, setActiveModel, runtimeModel, runtimeStatus, backendState }}>
      {children}
    </RuntimeContext.Provider>
  );
};

export const useSharedRuntime = () => {
  const context = useContext(RuntimeContext);
  if (context === undefined) {
    throw new Error('useSharedRuntime must be used within a RuntimeProvider');
  }
  return context;
};
