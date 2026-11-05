import React, { useState } from 'react';
import { CreateCharacterRequest } from '../../hooks/useCharacters';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import styles from './Wizard.module.css';

interface WizardProps {
  onClose: () => void;
  onSave: (req: CreateCharacterRequest) => Promise<void>;
}

const CATEGORIES = [
  'Assistant', 'Mentor', 'Teacher', 'Coach', 
  'Fictional Character', 'Historical Figure', 
  'Custom Character', 'Business Character', 'Research Character'
];

export const CharacterWizard: React.FC<WizardProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<CreateCharacterRequest>({
    name: '',
    description: '',
    avatar: '',
    assigned_model: null,
    category: 'Assistant',
    creator: 'User',
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);
  
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Basic Identity</h2>
            <div className={styles.inputGroup}>
              <label>Character Name</label>
              <input 
                autoFocus
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Alan Turing"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className={styles.select}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Personality & Description</h2>
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe who this character is..."
                className={styles.textarea}
                rows={5}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Avatar & Model</h2>
            <div className={styles.inputGroup}>
              <label>Avatar URL (or Path)</label>
              <input 
                type="text" 
                value={formData.avatar} 
                onChange={e => setFormData({...formData, avatar: e.target.value})} 
                placeholder="https://... or C:/avatars/..."
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Default Model (Optional)</label>
              <select 
                value={formData.assigned_model || ''} 
                onChange={e => setFormData({...formData, assigned_model: e.target.value || null})}
                className={styles.select}
              >
                <option value="">None (Use System Default)</option>
                <option value="Llama-3-8B.gguf">Llama-3-8B.gguf</option>
                <option value="Mistral-7B.gguf">Mistral-7B.gguf</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Review Character</h2>
            <div className={styles.reviewBox}>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Category:</strong> {formData.category}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <p><strong>Model:</strong> {formData.assigned_model || 'System Default'}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.progressIndicators}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`${styles.dot} ${s <= step ? styles.dotActive : ''}`} />
            ))}
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={styles.body}>
          {renderStep()}
        </div>

        <div className={styles.footer}>
          {step > 1 ? (
            <button className={styles.btnSecondary} onClick={handlePrev}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button 
              className={styles.btnPrimary} 
              onClick={handleNext}
              disabled={step === 1 && !formData.name.trim()}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              className={styles.btnPrimary} 
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Character'} <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
