import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { WorkbenchPage } from './pages/Workbench/WorkbenchPage';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { RecipesPage } from './pages/Recipes/RecipesPage';
import { ChatPage } from './pages/chat/ChatPage';
import { RuntimeProvider } from './contexts/RuntimeContext';
import './styles/globals.css';

export default function App() {
  const startupScreen = import.meta.env.VITE_APP_STARTUP_SCREEN || 'Dashboard';
  const [activePage, setActivePage] = useState<string>(startupScreen);

  return (
    <RuntimeProvider>
      <AppShell activePage={activePage} onNavigate={setActivePage}>
        <div style={{ display: activePage === 'Dashboard' ? 'block' : 'none', height: '100%' }}>
          <Dashboard activePage={activePage} onNavigate={setActivePage} />
        </div>
        <div style={{ display: activePage === 'Recipes' ? 'block' : 'none', height: '100%' }}>
          <RecipesPage activePage={activePage} onNavigate={setActivePage} />
        </div>
        <div style={{ display: activePage === 'Workbench' ? 'block' : 'none', height: '100%' }}>
          <WorkbenchPage activePage={activePage} onNavigate={setActivePage} />
        </div>
        <div style={{ display: activePage === 'Chat' ? 'block' : 'none', height: '100%' }}>
          <ChatPage activePage={activePage} onNavigate={setActivePage} />
        </div>
      </AppShell>
    </RuntimeProvider>
  );
}
