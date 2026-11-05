import React from 'react';
import { Character } from '../../hooks/useCharacters';
import { Heart, Bot, Brain } from 'lucide-react';
import styles from './Characters.module.css';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.avatarSection}>
        {character.avatar ? (
          <img src={character.avatar} alt={character.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}><Bot size={32} /></div>
        )}
        {character.is_favorite && (
          <div className={styles.favoriteBadge}><Heart size={14} fill="var(--accent)" color="var(--accent)" /></div>
        )}
      </div>
      
      <div className={styles.infoSection}>
        <div className={styles.nameHeader}>
          <h3 className={styles.name}>{character.name}</h3>
          <span className={styles.category}>{character.category}</span>
        </div>
        
        <p className={styles.description}>{character.description}</p>
        
        <div className={styles.footer}>
          <div className={styles.modelTag}>
            <Brain size={12} />
            {character.assigned_model || 'No Model Assigned'}
          </div>
        </div>
      </div>
    </div>
  );
};
