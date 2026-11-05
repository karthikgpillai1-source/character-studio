import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { RecipeLibrary } from './components/RecipeLibrary';
import { RecipeDetails } from './components/RecipeDetails';
import { RecipeEmptyState } from './components/RecipeEmptyState';
import { RecipeDeployDialog } from './components/RecipeDeployDialog';
import styles from './Recipes.module.css';

export interface Recipe {
  id: number;
  uuid: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  recipe_path: string;
  avatar_path: string | null;
  identity_score: number;
  personality_score: number;
  knowledge_score: number;
  recipe_hash: string;
  recipe_format: string;
  recipe_engine_version: string;
  character_type: string;
  created_at: number;
  updated_at: number;
}

export const RecipesPage: React.FC<{ activePage?: string, onNavigate?: (page: string) => void }> = ({ activePage, onNavigate }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);

  const fetchRecipes = async () => {
    try {
      const res = await invoke<Recipe[]>('get_recipes');
      setRecipes(res);
    } catch (e) {
      console.error('Failed to fetch recipes:', e);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleImport = async () => {
    try {
      const { open } = await import('@tauri-apps/api/dialog');
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Recipe',
          extensions: ['recipe']
        }]
      });
      
      if (typeof selected === 'string') {
        await invoke('import_recipe', { filePath: selected });
        fetchRecipes();
      }
    } catch (e) {
      console.error('Failed to import recipe:', e);
    }
  };

  return (
    <div className={styles.recipesContainer}>
      {recipes.length === 0 ? (
        <RecipeEmptyState onImport={handleImport} />
      ) : (
        <div className={styles.twoPanelLayout}>
          <div className={styles.leftPanel}>
            <RecipeLibrary 
              recipes={recipes} 
              selectedRecipe={selectedRecipe}
              onSelectRecipe={setSelectedRecipe} 
              onImport={handleImport} 
            />
          </div>
          <div className={styles.rightPanel}>
            <RecipeDetails 
              recipe={selectedRecipe} 
              onDeploy={() => setIsDeployDialogOpen(true)}
            />
          </div>
        </div>
      )}
      
      {isDeployDialogOpen && selectedRecipe && (
        <RecipeDeployDialog 
          recipe={selectedRecipe} 
          onClose={() => setIsDeployDialogOpen(false)} 
        />
      )}
    </div>
  );
};
