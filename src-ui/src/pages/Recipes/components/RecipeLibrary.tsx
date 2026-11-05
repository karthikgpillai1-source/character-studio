import React from 'react';
import { Recipe } from '../RecipesPage';
import styles from '../Recipes.module.css';
import { Plus } from 'lucide-react';

interface Props {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
  onImport: () => void;
}

export const RecipeLibrary: React.FC<Props> = ({ recipes, selectedRecipe, onSelectRecipe, onImport }) => {
  return (
    <>
      <div className={styles.libraryHeader}>
        <h3>Recipe Library</h3>
        <button className={styles.importButton} onClick={onImport}>
          <Plus size={16} /> Import
        </button>
      </div>
      <div className={styles.libraryList}>
        {recipes.map(recipe => (
          <div 
            key={recipe.id}
            className={`${styles.recipeCard} ${selectedRecipe?.id === recipe.id ? styles.selected : ''}`}
            onClick={() => onSelectRecipe(recipe)}
          >
            <div className={styles.recipeName}>{recipe.name} v{recipe.version}</div>
            <div className={styles.recipeAuthor}>by {recipe.author}</div>
          </div>
        ))}
      </div>
    </>
  );
};
