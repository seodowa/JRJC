import React from 'react';
import styles from './Spinner.module.css'; // We'll create this CSS file next

export function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
    </div>
  );
}