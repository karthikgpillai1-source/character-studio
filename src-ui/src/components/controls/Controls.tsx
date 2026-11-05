import React from 'react';
import styles from './Controls.module.css';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className={styles.controlRow}>
      <div className={styles.labelSection}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <label className={styles.switch}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
};

interface DropdownProps {
  label: string;
  description?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export const DropdownSelect: React.FC<DropdownProps> = ({ label, description, value, options, onChange }) => {
  return (
    <div className={styles.controlRow}>
      <div className={styles.labelSection}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <select 
        className={styles.select}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

interface SliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

export const NumberSlider: React.FC<SliderProps> = ({ label, description, value, min, max, step = 1, onChange }) => {
  return (
    <div className={styles.controlRow}>
      <div className={styles.labelSection}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <div className={styles.sliderContainer}>
        <input 
          type="range" 
          className={styles.range}
          min={min} 
          max={max} 
          step={step}
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))} 
        />
        <span className={styles.valueDisplay}>{value}</span>
      </div>
    </div>
  );
};
