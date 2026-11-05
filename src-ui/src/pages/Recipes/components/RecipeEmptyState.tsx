import React from 'react';
import styles from '../Recipes.module.css';
import { PackageOpen, Plus } from 'lucide-react';

interface Props {
  onImport: () => void;
}

export const RecipeEmptyState: React.FC<Props> = ({ onImport }) => {
  return (
    <div className={styles.emptyState}>
      <PackageOpen size={64} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
      <h2>No Recipes Found</h2>
      <p>Import a deployable character brain package (.recipe) to get started.</p>
      <button className={styles.importButton} onClick={onImport}>
        <Plus size={18} /> Import Recipe
      </button>
    </div>
  );
};
