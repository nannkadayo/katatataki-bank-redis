import React from 'react';
import Create from '../components/Create/page.tsx';
import SerialsPage from '../components/SerialsPage/page.tsx';

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.column}>
        <Create />
      </div>
      <div style={styles.column}>
        <SerialsPage />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  column: {
    flex: 1,
    margin: '10px',
    maxWidth: '600px',
  },
};