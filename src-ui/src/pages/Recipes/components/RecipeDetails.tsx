import React from 'react';
import { Recipe } from '../RecipesPage';
import styles from '../Recipes.module.css';
import { CheckCircle2, Rocket } from 'lucide-react';

interface Props {
  recipe: Recipe | null;
  onDeploy: () => void;
}

export const RecipeDetails: React.FC<Props> = ({ recipe, onDeploy }) => {
  if (!recipe) {
    return (
      <div className={styles.emptyState}>
        <p>Select a recipe to view details</p>
      </div>
    );
  }

  const layers = [
    'Identity Layer',
    'Backstory Layer',
    'Personality Layer',
    'Speech Layer',
    'Behavior Layer',
    'Knowledge Layer',
    'Memory Rules',
    'System Instructions'
  ];

  return (
    <>
      <div className={styles.detailsHeader}>
        <div className={styles.detailsAvatar}>
          {recipe.name.substring(0, 2).toUpperCase()}
        </div>
        <div className={styles.detailsTitle}>
          <h2>{recipe.name}</h2>
          <p>Version {recipe.version} • By {recipe.author} • {recipe.category}</p>
          <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{recipe.description}</p>
        </div>
        <button className={styles.deployButton} onClick={onDeploy}>
          <Rocket size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} /> 
          Deploy Recipe
        </button>
      </div>
      <div className={styles.detailsContent}>
        <h3>Recipe Composition</h3>
        <div className={styles.layerList}>
          {layers.map(layer => (
            <div key={layer} className={styles.layerItem}>
              <span className={styles.layerName}>{layer}</span>
              <span className={styles.layerStatus}>
                <CheckCircle2 size={16} /> Loaded
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
