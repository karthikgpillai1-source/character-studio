import React, { ReactNode } from 'react';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const PAGE_META: Record<string, { title: string, subtitle: string }> = {
  Dashboard: { title: "Dashboard", subtitle: "System Overview & Runtime Status" },
  Recipes: { title: "Recipes", subtitle: "Deployable Character Brain Packages" },
  Characters: { title: "Characters", subtitle: "Manage Character Instances" },
  Chat: { title: "Character Chat", subtitle: "Interact with characters and conversations" },
  Knowledge: { title: "Knowledge", subtitle: "Knowledge Base Management" },
  Memory: { title: "Memory", subtitle: "Character Memory Banks" },
  Runtime: { title: "Runtime", subtitle: "Runtime Engine Status" },
  Workbench: { title: "Workbench", subtitle: "Runtime Validation & Debug Environment" },
  Settings: { title: "Settings", subtitle: "Application Preferences" }
};

export const AppShell: React.FC<AppShellProps> = ({ children, activePage, onNavigate }) => {
  const meta = PAGE_META[activePage] || { title: activePage, subtitle: "" };

  return (
    <div className={styles.appContainer}>
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      
      <div className={styles.mainWrapper}>
        <header className={styles.pageHeader}>
          <div className={styles.breadcrumb}>
            Home / <span>{activePage}</span>
          </div>
          <h1 className={styles.title}>{meta.title}</h1>
          <p className={styles.subtitle}>{meta.subtitle}</p>
        </header>
        
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{ activePage: string, onNavigate: (page: string) => void }> = ({ activePage, onNavigate }) => {
  const navItems = [
    'Dashboard',
    'Characters',
    'Chat',
    'Workbench',
    'Recipes',
    'Knowledge',
    'Memory',
    'Runtime',
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
