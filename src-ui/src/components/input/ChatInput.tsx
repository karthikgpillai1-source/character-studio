import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (msg: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isGenerating, placeholder = 'Type a message...' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSend(input);
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          rows={1}
        />
        <div className={styles.actions}>
          {isGenerating ? (
            <button className={`${styles.sendBtn} ${styles.stopBtn}`} onClick={onStop} title="Stop Generating">
              <Square size={18} fill="currentColor" />
            </button>
          ) : (
            <button 
              className={`${styles.sendBtn} ${input.trim() ? styles.active : ''}`} 
              onClick={handleSend}
              disabled={!input.trim()}
              title="Send Message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
