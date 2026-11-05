import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/Layout';
import { SettingsSidebar } from '../../components/settings/SettingsSidebar';
import { SettingsPanel } from '../../components/settings/SettingsPanel';
import { SettingsSearch } from '../../components/settings/SettingsSearch';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  return (
    <PageContainer>
      <div className={styles.settingsLayout}>
        <SettingsSidebar 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
        
        <div className={styles.mainArea}>
          <SettingsSearch onResultSelect={setActiveCategory} />
          <SettingsPanel activeCategory={activeCategory} />
        </div>
      </div>
    </PageContainer>
  );
};
