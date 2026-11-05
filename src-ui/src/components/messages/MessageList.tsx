import React, { useEffect, useRef } from 'react';
import { Message } from '../../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import styles from './Messages.module.css';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>How can I help you today?</h2>
        <p>Send a message to start the conversation.</p>
      </div>
    );
  }

  return (
    <div className={styles.messageList}>
      <div className={styles.scrollContainer}>
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onRetry={idx === messages.length - 1 && msg.role === 'assistant' ? () => {} : undefined} 
          />
        ))}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  );
};
