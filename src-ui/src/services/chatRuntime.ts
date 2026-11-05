import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface TokenEvent {
  token: string;
  is_finished: boolean;
}

export interface RuntimeStatus {
  is_running: boolean;
  current_model: any | null;
}

export const chatRuntime = {
  checkStatus: async (): Promise<{ isAvailable: boolean; reason?: string }> => {
    try {
      const status: RuntimeStatus = await invoke('get_runtime_status');
      if (!status.is_running) {
        return { isAvailable: false, reason: "Runtime unavailable" };
      }
      if (!status.current_model) {
        return { isAvailable: false, reason: "No model currently loaded" };
      }
      return { isAvailable: true };
    } catch (e) {
      return { isAvailable: false, reason: "Runtime unavailable" };
    }
  },

  generate: async (
    prompt: string,
    onToken: (token: string) => void,
    onFinished: () => void,
    onError: (error: string) => void
  ): Promise<UnlistenFn | undefined> => {
    try {
      const { isAvailable, reason } = await chatRuntime.checkStatus();
      if (!isAvailable) {
        onError(reason || "Generation failed");
        return undefined;
      }

      const unlisten = await listen<TokenEvent>('generation-token', (event) => {
        if (event.payload.is_finished) {
          unlisten();
          onFinished();
        } else {
          onToken(event.payload.token);
        }
      });

      invoke('generate_text', {
        request: {
          prompt,
          conversation_id: null,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop_sequences: ["<|im_end|>", "\nUser:"]
        }
      }).catch((e) => {
        unlisten();
        onError(typeof e === 'string' ? e : "Generation failed");
      });

      return unlisten;
    } catch (e) {
      onError(typeof e === 'string' ? e : "Generation failed");
      return undefined;
    }
  }
};
