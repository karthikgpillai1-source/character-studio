import React from 'react';
import styles from './Settings.module.css';
import { Sliders, Paintbrush, Zap, Bot, Database, Cpu, Wrench } from 'lucide-react';

export const CATEGORIES = [
  { id: 'general', label: 'General', icon: <Sliders size={16} /> },
  { id: 'appearance', label: 'Appearance', icon: <Paintbrush size={16} /> },
  { id: 'runtime', label: 'Runtime', icon: <Zap size={16} /> },
  { id: 'generation', label: 'Generation', icon: <Bot size={16} /> },
  { id: 'models', label: 'Models', icon: <Database size={16} /> },
  { id: 'hardware', label: 'Hardware', icon: <Cpu size={16} /> },
  { id: 'advanced', label: 'Advanced', icon: <Wrench size={16} /> },
];

interface SidebarProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

export const SettingsSidebar: React.FC<SidebarProps> = ({ activeCategory, onSelect }) => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Settings</h2>
      <div className={styles.navList}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`${styles.navItem} ${activeCategory === cat.id ? styles.active : ''}`}
            onClick={() => onSelect(cat.id)}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
