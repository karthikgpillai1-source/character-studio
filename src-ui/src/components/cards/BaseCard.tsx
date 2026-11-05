import React, { ReactNode } from 'react';
import styles from './BaseCard.module.css';

interface BaseCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const BaseCard: React.FC<BaseCardProps> = ({ children, className = '', title, icon, action }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {(title || icon || action) && (
        <div className={styles.header}>
          <div className={styles.titleSection}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title && <h3 className={styles.title}>{title}</h3>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
