import React, { useState } from 'react';
import { Recipe } from '../RecipesPage';
import styles from '../Recipes.module.css';

interface Props {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeDeployDialog: React.FC<Props> = ({ recipe, onClose }) => {
  const [characterName, setCharacterName] = useState(recipe.name);
  const [avatar, setAvatar] = useState(recipe.name + '.png');
  const [description, setDescription] = useState(recipe.description);

  const handleDeploy = () => {
    // Scaffold for future character creation
    console.log('Deploying Recipe:', recipe.uuid);
    console.log('As Character:', characterName);
    alert(`Deploying recipe to create character: ${characterName}`);
    onClose();
  };

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2 style={{marginTop: 0, marginBottom: '24px'}}>Deploy Recipe</h2>
        
        <div className={styles.formGroup}>
          <label>Character Name</label>
          <input 
            type="text" 
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Avatar</label>
          <input 
            type="text" 
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.dialogActions}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.deployButton} onClick={handleDeploy}>Create Character</button>
        </div>
      </div>
    </div>
  );
};
