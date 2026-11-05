import React, { useEffect, useRef } from 'react';
import styles from './Settings.module.css';
import { ToggleSwitch, DropdownSelect, NumberSlider } from '../controls/Controls';
import { useSettings } from '../../hooks/useSettings';
import { useHardware } from '../../hooks/useHardware';
import { BaseCard } from '../cards/BaseCard';

interface SettingsPanelProps {
  activeCategory: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ activeCategory }) => {
  const { settings, updateSetting } = useSettings();
  const { snapshot } = useHardware();
  const panelRef = useRef<HTMLDivElement>(null);

  // Helper to safely parse string settings to boolean/number
  const getBool = (key: string, def: boolean) => settings[key] === 'true' || (settings[key] === undefined && def);
  const getNum = (key: string, def: number) => settings[key] ? parseFloat(settings[key]) : def;
  const getStr = (key: string, def: string) => settings[key] || def;

  // Auto scroll to category when clicked
  useEffect(() => {
    const el = document.getElementById(`section-${activeCategory}`);
    if (el && panelRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory]);

  return (
    <div className={styles.panelContainer} ref={panelRef}>
      
      <div id="section-general" className={styles.section}>
        <h3 className={styles.sectionTitle}>General</h3>
        <BaseCard className={styles.settingsCard}>
          <ToggleSwitch 
            label="Launch on Startup" 
            checked={getBool('general.launch_startup', false)} 
            onChange={v => updateSetting('general.launch_startup', v.toString())} 
          />
          <ToggleSwitch 
            label="Minimize to Tray" 
            checked={getBool('general.minimize_tray', true)} 
            onChange={v => updateSetting('general.minimize_tray', v.toString())} 
          />
          <ToggleSwitch 
            label="Auto Save Conversations" 
            checked={getBool('general.auto_save', true)} 
            onChange={v => updateSetting('general.auto_save', v.toString())} 
          />
        </BaseCard>
      </div>

      <div id="section-appearance" className={styles.section}>
        <h3 className={styles.sectionTitle}>Appearance</h3>
        <BaseCard className={styles.settingsCard}>
          <DropdownSelect 
            label="Theme" 
            value={getStr('appearance.theme', 'system')} 
            options={[
              { label: 'System Default', value: 'system' },
              { label: 'Dark', value: 'dark' },
              { label: 'Light', value: 'light' }
            ]}
            onChange={v => updateSetting('appearance.theme', v)} 
          />
          <DropdownSelect 
            label="Animation Level" 
            value={getStr('appearance.animations', 'full')} 
            options={[
              { label: 'Full', value: 'full' },
              { label: 'Reduced', value: 'reduced' },
              { label: 'None', value: 'none' }
            ]}
            onChange={v => updateSetting('appearance.animations', v)} 
          />
        </BaseCard>
      </div>

      <div id="section-runtime" className={styles.section}>
        <h3 className={styles.sectionTitle}>Runtime</h3>
        <BaseCard className={styles.settingsCard}>
          <DropdownSelect 
            label="Backend Selection" 
            description="Force a specific hardware backend for generation."
            value={getStr('runtime.backend', 'auto')} 
            options={[
              { label: 'Auto (Recommended)', value: 'auto' },
              { label: 'CUDA (NVIDIA)', value: 'cuda' },
              { label: 'Vulkan (AMD/Intel)', value: 'vulkan' },
              { label: 'CPU (Slow)', value: 'cpu' }
            ]}
            onChange={v => updateSetting('runtime.backend', v)} 
          />
        </BaseCard>
      </div>

      <div id="section-generation" className={styles.section}>
        <h3 className={styles.sectionTitle}>Generation</h3>
        <BaseCard className={styles.settingsCard}>
          <NumberSlider 
            label="Temperature" 
            description="Higher values make output more random."
            value={getNum('gen.temperature', 0.7)} 
            min={0} max={2.0} step={0.1}
            onChange={v => updateSetting('gen.temperature', v.toString())} 
          />
          <NumberSlider 
            label="Top P" 
            value={getNum('gen.top_p', 0.9)} 
            min={0} max={1.0} step={0.05}
            onChange={v => updateSetting('gen.top_p', v.toString())} 
          />
          <NumberSlider 
            label="Max Tokens" 
            description="Maximum length of a single generation."
            value={getNum('gen.max_tokens', 2048)} 
            min={256} max={8192} step={256}
            onChange={v => updateSetting('gen.max_tokens', v.toString())} 
          />
        </BaseCard>
      </div>
      
      <div id="section-hardware" className={styles.section}>
        <h3 className={styles.sectionTitle}>Hardware Diagnostics</h3>
        <BaseCard className={styles.settingsCard}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Current detected hardware. Refresh if recent changes were made.
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div><strong>CPU:</strong> {snapshot?.cpu?.name || 'Unknown'}</div>
            <div><strong>GPU:</strong> {snapshot?.gpu?.name || 'Unknown'}</div>
            <div><strong>RAM:</strong> {snapshot?.memory ? `${(snapshot.memory.total_kb / 1024 / 1024).toFixed(1)} GB` : 'N/A'}</div>
          </div>
        </BaseCard>
      </div>

      <div style={{ height: '200px' }}>{/* Padding for scrolling */}</div>
    </div>
  );
};
