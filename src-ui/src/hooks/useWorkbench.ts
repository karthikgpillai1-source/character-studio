import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

export interface EngineStatus {
  is_running: boolean;
  pid: number | null;
  active_backend: string | null;
  current_model: any | null;
  uptime_seconds: number;
  tokens_per_second: number;
  memory_usage_mb: number;
  exit_code: number | null;
  exit_reason: string | null;
}

export interface TokenEvent {
  token: string;
  is_finished: boolean;
}

export interface DiagnosticLog {
  id: string;
  timestamp: number;
  event_type: string;
  message: string;
}

export interface StartupDiagnostics {
  selected_backend: string;
  resolved_binary: string;
  resolved_model: string;
  context_length: number;
  port: number;
  working_directory: string;
}

export function useWorkbench() {
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [tokenStream, setTokenStream] = useState<TokenEvent[]>([]);
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [startupDiag, setStartupDiag] = useState<StartupDiagnostics | null>(null);
  const [rawRequest, setRawRequest] = useState<string>('');
  const [rawResponses, setRawResponses] = useState<string[]>([]);

  const [foundModels, setFoundModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const addLog = (event_type: string, message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(),
      timestamp: Math.floor(Date.now() / 1000),
      event_type,
      message
    }]);
  };

  const fetchDiagnostics = async () => {
    try {
      const status: EngineStatus = await invoke('get_runtime_status');
      setEngineStatus(status);
    } catch (e) {
      console.error(e);
      setEngineStatus({
        is_running: false,
        pid: null,
        active_backend: null,
        current_model: null,
        uptime_seconds: 0,
        tokens_per_second: 0,
        memory_usage_mb: 0,
        exit_code: null,
        exit_reason: typeof e === 'string' ? e : (e instanceof Error ? e.message : 'Backend Unavailable (Browser Mode?)')
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const unlisteners: (() => void)[] = [];

    const register = async <T>(channel: string, handler: (event: { payload: T }) => void) => {
      console.log(`[LISTENER_REGISTER] ${channel}`);
      const unlistenFn = await listen<T>(channel, handler);
      if (!isMounted) {
        console.log(`[LISTENER_UNREGISTER] ${channel} (late)`);
        unlistenFn();
      } else {
        unlisteners.push(unlistenFn);
      }
    };

    const setupListeners = async () => {
      try {
        await register<any>('model-discovery-result', (event) => {
          const payload = event.payload;
          setFoundModels(payload.found_models || []);
          if (payload.found_models && payload.found_models.length > 0) {
            setSelectedModel(payload.found_models[0]);
          }
        });

        await register<string>('runtime-log', (event) => {
          addLog("RUNTIME", event.payload);
        });

        await register<StartupDiagnostics>('runtime-diagnostic', (event) => {
          setStartupDiag(event.payload);
          addLog("DIAGNOSTIC", `Resolved Binary: ${event.payload.resolved_binary}`);
          addLog("DIAGNOSTIC", `Resolved Model: ${event.payload.resolved_model}`);
        });

        await register<string>('health-check-attempt', (event) => {
          addLog("HEALTH", event.payload);
        });

        await register<TokenEvent>('generation-token', (event) => {
          console.log(`[TOKEN_RECEIVED] workbench stream: ${event.payload.token}`);
          setTokenStream(prev => {
            console.log(`[TOKEN_APPEND] workbench stream: ${event.payload.token}`);
            return [...prev, event.payload];
          });
        });

        await register<string>('raw-request-payload', (event) => {
          setRawRequest(event.payload);
          setRawResponses([]); // clear previous responses
        });

        await register<string>('raw-sse-payload', (event) => {
          setRawResponses(prev => [...prev, event.payload]);
        });
      } catch (e) {
        console.warn("Failed to setup Tauri listeners:", e);
        addLog("DIAGNOSTIC", "Failed to bind Tauri event listeners (Browser Mode?)");
      }
    };

    const initialize = async () => {
      await setupListeners();
      
      // Initial fetch and discovery only AFTER listeners are registered
      fetchDiagnostics();
      invoke('discover_local_models').catch(console.error);
    };

    initialize();

    const interval = setInterval(fetchDiagnostics, 1000);

    return () => {
      isMounted = false;
      console.log('[LISTENER_UNREGISTER] Cleaning up all workbench listeners');
      unlisteners.forEach(fn => fn());
      clearInterval(interval);
    };
  }, []);

  return { engineStatus, tokenStream, logs, startupDiag, fetchDiagnostics, setTokenStream, setLogs, rawRequest, rawResponses, foundModels, selectedModel, setSelectedModel };
}
