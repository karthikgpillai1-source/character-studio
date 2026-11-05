import React, { useState } from 'react';
import { Search } from 'lucide-react';
import styles from './Settings.module.css';

interface SettingsSearchProps {
  onResultSelect: (categoryId: string) => void;
}

export const SettingsSearch: React.FC<SettingsSearchProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');

  // In a full implementation, this would search a defined dictionary of setting names/labels
  // and jump to the specific ID on the page. For Phase 2.3, it acts as a sleek mock UI
  // that can scroll to a category based on keyword matching.
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase();
    if (q.includes('theme') || q.includes('color')) onResultSelect('appearance');
    else if (q.includes('backend') || q.includes('cuda')) onResultSelect('runtime');
    else if (q.includes('token') || q.includes('temp')) onResultSelect('generation');
  };

  return (
    <form className={styles.searchContainer} onSubmit={handleSearch}>
      <Search size={18} className={styles.searchIcon} />
      <input 
        type="text" 
        className={styles.searchInput} 
        placeholder="Search settings..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
};
