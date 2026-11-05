import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Conversation {
  id: number;
  title: string;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      const convos = await invoke<Conversation[]>('get_conversations');
      setConversations(convos);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  const fetchMessages = async (convoId: number) => {
    try {
      const msgs = await invoke<Message[]>('get_messages', { conversationId: convoId });
      setMessages(msgs);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  const createConversation = async (title: string) => {
    try {
      const id = await invoke<number>('create_conversation', { title });
      await fetchConversations();
      setActiveConversationId(id);
      setMessages([]);
      return id;
    } catch (err: any) {
      setError(err.toString());
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Set up Tauri event listener for token streaming
  useEffect(() => {
    let isMounted = true;
    let unlisten: (() => void) | null = null;
    
    const setupListener = async () => {
      console.log('[LISTENER_REGISTER] generation-token (useChat)');
      const unlistenFn = await listen('generation-token', (event: any) => {
        const token = event.payload.token;
        console.log(`[TOKEN_RECEIVED] useChat: ${token}`);
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            console.log(`[TOKEN_APPEND] useChat: ${token}`);
            const updated = [...prev];
            updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + token };
            return updated;
          }
          return prev;
        });
      });
      
      if (!isMounted) {
        console.log('[LISTENER_UNREGISTER] generation-token (useChat - late)');
        unlistenFn();
      } else {
        unlisten = unlistenFn;
      }
    };

    setupListener();
    return () => {
      isMounted = false;
      if (unlisten) {
        console.log('[LISTENER_UNREGISTER] generation-token (useChat)');
        unlisten();
      }
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    let convoId = activeConversationId;
    if (!convoId) {
      convoId = await createConversation('New Conversation');
    }

    // Optimistically add user message
    const userMsg: Message = { id: Date.now(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Save user message to DB
      await invoke('save_message', {
        conversationId: convoId,
        role: 'user',
        content,
        tokenCount: null
      });

      // Add empty assistant message placeholder for streaming
      const assistantMsgId = Date.now() + 1;
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);
      setIsGenerating(true);

      // Call generation backend
      await invoke('generate_text', { 
        request: {
          prompt: content,
          conversation_id: convoId,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop_sequences: ["<|im_end|>"]
        }
      });
      
      setIsGenerating(false);

      // In a full implementation, we'd fetch the final generated string from state and save to DB here.
      // We will reload from DB just in case.
      fetchMessages(convoId!);
      
    } catch (err: any) {
      setError(err.toString());
      setIsGenerating(false);
    }
  };

  const stopGeneration = async () => {
    try {
      await invoke('stop_generation');
      setIsGenerating(false);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    isGenerating,
    stopGeneration,
    error,
    createConversation
  };
}
