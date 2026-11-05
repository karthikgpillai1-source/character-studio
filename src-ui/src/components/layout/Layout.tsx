import React, { ReactNode } from 'react';
import styles from './Layout.module.css';

export const PageContainer: React.FC<{ children: ReactNode, activePage?: string, onNavigate?: (page: string) => void }> = ({ children, activePage, onNavigate }) => {
  return (
    <div className={styles.appContainer}>
      <Sidebar activePage={activePage || 'Dashboard'} onNavigate={onNavigate || (() => {})} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export const Sidebar: React.FC<{ activePage: string, onNavigate: (page: string) => void }> = ({ activePage, onNavigate }) => {
  const navItems = [
    'Dashboard',
    'Characters',
    'Recipes',
    'Knowledge',
    'Memory',
    'Runtime',
    'Workbench',
    'Settings'
  ];

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>CS</div>
      <ul className={styles.navLinks}>
        {navItems.map(item => (
          <li 
            key={item} 
            className={activePage === item ? styles.active : ''}
            onClick={() => onNavigate(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
};
