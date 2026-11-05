import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatPage.module.css';
import { chatRuntime } from '../../services/chatRuntime';
import { useSharedRuntime } from '../../contexts/RuntimeContext';

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export const ChatPage: React.FC<{ activePage?: string, onNavigate?: (page: string) => void }> = ({ activePage, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'Context' | 'Memory' | 'Knowledge'>('Context');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { foundModels, activeModel, setActiveModel, runtimeModel, runtimeStatus } = useSharedRuntime();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeUnlistenRef = useRef<Promise<import('@tauri-apps/api/event').UnlistenFn | undefined> | null>(null);

  useEffect(() => {
    return () => {
      // Component cleanup
      if (activeUnlistenRef.current) {
        activeUnlistenRef.current.then(unlisten => {
          if (unlisten) unlisten();
        });
      }
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput('');

    // Check runtime status
    const { isAvailable, reason } = await chatRuntime.checkStatus();
    if (!isAvailable) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'system',
        content: `System Error: ${reason || "Runtime unavailable"}`,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    setIsGenerating(true);

    const assistantId = Math.random().toString(36).substring(7);
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }]);

    // Build prompt context using the newMessages array, NOT the stale messages state
    const promptContext = newMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + `\nAssistant:`;

    activeUnlistenRef.current = chatRuntime.generate(
      promptContext,
      (token) => {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + token } : m));
      },
      () => {
        setIsGenerating(false);
        activeUnlistenRef.current = null;
      },
      (error) => {
        setIsGenerating(false);
        activeUnlistenRef.current = null;
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== assistantId || m.content !== '');
          return [...filtered, {
            id: Math.random().toString(36).substring(7),
            role: 'system',
            content: `Generation failed: ${error}`,
            timestamp: new Date().toISOString()
          }];
        });
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Left Panel: Character Selector */}
      <div className={styles.leftPanel}>
        <div className={styles.panelHeader}>Characters</div>
        <div className={styles.panelContent}>
          <div className={styles.emptyCharacters}>
            <div className={styles.emptyStateBody}>No characters available</div>
            <div className={styles.emptyStateSub}>Create a character from the Characters page to begin chatting.</div>
            <button 
              className={styles.newCharacterBtn}
              onClick={() => onNavigate && onNavigate('Characters')}
            >
              Open Characters
            </button>
          </div>
        </div>
      </div>

      {/* Center Panel: Conversation Area */}
      <div className={styles.centerPanel}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Conversation</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>Model:</span>
            <select 
              value={activeModel || ''} 
              onChange={e => setActiveModel(e.target.value)}
              style={{ background: '#1a1b26', color: '#fff', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}
            >
              {foundModels.length === 0 && <option value="">No models discovered</option>}
              {foundModels.map(m => (
                <option key={m} value={m}>{m.split('/').pop()?.split('\\').pop()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#888' }}>Runtime Loaded:</span>
            <span style={{ color: runtimeModel ? '#4ade80' : '#f87171' }}>{runtimeModel ? runtimeModel.split('/').pop()?.split('\\').pop() : 'No Model Loaded'}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#888' }}>Backend:</span>
            <span style={{ color: runtimeStatus === 'Running' ? '#4ade80' : '#888' }}>{runtimeStatus}</span>
          </div>
        </div>
        
        <div className={styles.messageList}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>No messages yet. Send a message to start the conversation.</div>
          ) : (
            messages.map((msg) => {
              let roleClass = '';
              if (msg.role === 'user') roleClass = styles.messageUser;
              else if (msg.role === 'assistant') roleClass = styles.messageAssistant;
              else if (msg.role === 'system') roleClass = styles.messageSystem;
              
              return (
                <div 
                  key={msg.id} 
                  className={`${styles.message} ${roleClass}`}
                >
                  {msg.content}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputContainer}>
          <textarea 
            className={styles.inputField} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerating ? "Generating..." : "Type a message..."}
            rows={1}
            disabled={isGenerating}
          />
          <button 
            className={styles.sendBtn} 
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
          >
            {isGenerating ? "Generating..." : "Send"}
          </button>
        </div>
      </div>

      {/* Right Panel: Character Context */}
      <div className={styles.rightPanel}>
        <div className={styles.tabList}>
          <button 
            className={`${styles.tab} ${activeRightTab === 'Context' ? styles.active : ''}`}
            onClick={() => setActiveRightTab('Context')}
          >
            Context
          </button>
          <button 
            className={`${styles.tab} ${activeRightTab === 'Memory' ? styles.active : ''}`}
            onClick={() => setActiveRightTab('Memory')}
          >
            Memory
          </button>
          <button 
            className={`${styles.tab} ${activeRightTab === 'Knowledge' ? styles.active : ''}`}
            onClick={() => setActiveRightTab('Knowledge')}
          >
            Knowledge
          </button>
        </div>
        <div className={styles.tabContent}>
          {activeRightTab === 'Context' && <div>Current conversation context and active character persona details will appear here.</div>}
          {activeRightTab === 'Memory' && <div>Character memory banks and episodic retrieval results will appear here.</div>}
          {activeRightTab === 'Knowledge' && <div>Semantic search results from the character's knowledge base will appear here.</div>}
        </div>
      </div>
    </div>
  );
};
