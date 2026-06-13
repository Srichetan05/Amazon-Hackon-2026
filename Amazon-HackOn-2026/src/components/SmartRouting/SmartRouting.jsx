import { useState } from 'react';
import styles from './SmartRouting.module.css';
import { useInventory } from './hooks/useInventory';

import NavBar from './components/NavBar';
import RoutePage from './pages/RoutePage';
import ResalePage from './pages/ResalePage';
import RecyclePage from './pages/RecyclePage';

export default function SmartRouting() {
  const [currentPage, setCurrentPage] = useState('route');
  const { withinWindow, pastWindow, addToInventory, addToRecycle, addToWarehouse } = useInventory();

  function handleAddToResale(newItem) {
    addToInventory(newItem);
  }

  return (
    <div className={styles.container}>
      <NavBar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeCount={withinWindow.length}
        expiredCount={pastWindow.length}
      />

      <div className={styles.pageContent}>
        {currentPage === 'route' && (
          <RoutePage
            onAddToResale={handleAddToResale}
            onAddToRecycle={addToRecycle}
            onAddToWarehouse={addToWarehouse}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'resale' && (
          <ResalePage
            withinWindow={withinWindow}
            pastWindow={pastWindow}
          />
        )}
        {currentPage === 'recycle' && (
          <RecyclePage
            pastWindow={pastWindow}
          />
        )}
      </div>
    </div>
  );
}
