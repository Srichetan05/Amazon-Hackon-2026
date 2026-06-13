import { useState, useCallback } from 'react';
import { LOCAL_RESALE_WINDOW_DAYS, resaleInventory } from '../data/mockData';

const STORAGE_KEY = 'smart_routing_inventory';

/**
 * Calculates how many full days a product has been listed,
 * based on its stored ISO timestamp.
 */
export function getDaysListed(listedAtISO) {
  const listedAt = new Date(listedAtISO).getTime();
  const now = Date.now();
  return Math.floor((now - listedAt) / (1000 * 60 * 60 * 24));
}

/**
 * Builds the initial inventory by seeding mock data with
 * synthetic timestamps that match their daysListed values,
 * then merging any real items saved in localStorage.
 */
function buildInitialInventory() {
  // Convert static mock items → timestamped items
  const mockItems = resaleInventory.map(item => {
    const listedAt = new Date(
      Date.now() - item.daysListed * 24 * 60 * 60 * 1000
    ).toISOString();
    return { ...item, listedAt };
  });

  // Load any real items added by the user
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge: user items take precedence; avoid duplicate IDs
      const existingIds = new Set(mockItems.map(i => i.id));
      const userItems = parsed.filter(i => !existingIds.has(i.id));
      return [...mockItems, ...userItems];
    }
  } catch {
    // Ignore corrupt storage
  }
  return mockItems;
}

/**
 * Hook that owns the live resale inventory.
 *
 * - Seeded from mockData with synthetic timestamps
 * - New products added via addToInventory() are stamped with Date.now()
 * - User-added items are persisted in localStorage
 * - getDaysListed() is computed live from the timestamp so it advances
 *   in real time (re-mount or refresh will show the correct elapsed days)
 */
export function useInventory() {
  const [inventory, setInventory] = useState(() => buildInitialInventory());

  const addToInventory = useCallback((newItem) => {
    const entry = {
      ...newItem,
      id: `inv-user-${Date.now()}`,
      listedAt: new Date().toISOString(),   // ← real wall-clock timestamp
      nearbyBuyers: Math.floor(Math.random() * 30) + 5,
      interestedUsers: [],
    };

    setInventory(prev => {
      const updated = [...prev, entry];
      // Persist only user-added items (those with 'inv-user-' prefix)
      const userItems = updated.filter(i => i.id.startsWith('inv-user-'));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userItems));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });

    return entry;
  }, []);

  // Compute live daysListed for every item (only relevant for resale)
  const inventoryWithDays = inventory.map(item => ({
    ...item,
    daysListed: item.listedAt ? getDaysListed(item.listedAt) : 0,
  }));

  const withinWindow = inventoryWithDays.filter(
    i => (!i.type || i.type === 'RESALE') && i.daysListed <= LOCAL_RESALE_WINDOW_DAYS
  );
  
  // Resale items that expired, plus direct recycle items
  const pastWindow = inventoryWithDays.filter(
    i => {
      if (i.type === 'RECYCLE') return true;
      if (!i.type || i.type === 'RESALE') return i.daysListed > LOCAL_RESALE_WINDOW_DAYS;
      return false;
    }
  );

  const warehouseItems = inventoryWithDays.filter(i => i.type === 'WAREHOUSE');

  const addToRecycle = useCallback((newItem) => {
    return addToInventory({ ...newItem, type: 'RECYCLE' });
  }, [addToInventory]);

  const addToWarehouse = useCallback((newItem) => {
    return addToInventory({ ...newItem, type: 'WAREHOUSE' });
  }, [addToInventory]);

  return { 
    inventory: inventoryWithDays, 
    withinWindow, 
    pastWindow, 
    warehouseItems,
    addToInventory, 
    addToRecycle, 
    addToWarehouse 
  };
}
