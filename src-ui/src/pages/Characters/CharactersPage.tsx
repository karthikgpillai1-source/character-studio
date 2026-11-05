import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/Layout';
import { CharacterCard } from '../../components/characters/CharacterCard';
import { CharacterWizard } from '../../components/editor/CharacterWizard';
import { useCharacters } from '../../hooks/useCharacters';
import { Search, Plus } from 'lucide-react';
import styles from './CharactersPage.module.css';

export const CharactersPage: React.FC = () => {
  const { characters, createCharacter } = useCharacters();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Characters</h1>
          <p className={styles.subtitle}>Manage and configure your AI personas</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search characters..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.createBtn} onClick={() => setShowWizard(true)}>
            <Plus size={18} /> Create Character
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredCharacters.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No characters found</h2>
            <p>Create a new character to get started.</p>
          </div>
        ) : (
          filteredCharacters.map(char => (
            <CharacterCard 
              key={char.id} 
              character={char} 
              onClick={() => console.log('Edit', char.id)} 
            />
          ))
        )}
      </div>

      {showWizard && (
        <CharacterWizard 
          onClose={() => setShowWizard(false)} 
          onSave={createCharacter} 
        />
      )}
    </PageContainer>
  );
};
