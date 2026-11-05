import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, RotateCcw } from 'lucide-react';
import { Message } from '../../hooks/useChat';
import styles from './Messages.module.css';

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`${styles.bubbleWrapper} ${isUser ? styles.userWrapper : styles.assistantWrapper}`}>
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
        {isUser ? (
          <div className={styles.textContent}>{message.content}</div>
        ) : (
          <div className={styles.markdownContent}>
            {message.content === '' ? (
              <span className={styles.typingIndicator}>...</span>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        )}
      </div>
      
      {!isUser && message.content !== '' && (
        <div className={styles.messageActions}>
          <button className={styles.actionBtn} onClick={handleCopy} title="Copy">
            <Copy size={14} />
          </button>
          {onRetry && (
            <button className={styles.actionBtn} onClick={onRetry} title="Regenerate">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
