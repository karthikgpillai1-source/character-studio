import React from 'react';
import { PlusCircle, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { Conversation } from '../../hooks/useChat';
import styles from './ChatSidebar.module.css';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, activeId, onSelect, onNew }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button className={styles.newBtn} onClick={onNew}>
          <PlusCircle size={16} /> New Chat
        </button>
      </div>
      <div className={styles.list}>
        {conversations.map(c => (
          <div 
            key={c.id} 
            className={`${styles.item} ${c.id === activeId ? styles.active : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <MessageSquare size={16} className={styles.icon} />
            <span className={styles.title}>{c.title}</span>
            {c.id === activeId && (
              <div className={styles.actions}>
                <button className={styles.iconBtn}><Edit2 size={14} /></button>
                <button className={styles.iconBtn}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
