import { useState, useCallback, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

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
 * Builds the initial inventory by loading any real items saved in localStorage.
 */
function buildInitialInventory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore corrupt storage
  }
  return [];
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useInventory() {
  const { LOCAL_RESALE_WINDOW_DAYS } = useConfig();
  const [inventory, setInventory] = useState(() => buildInitialInventory());

  // Fetch inventory from backend on mount
  useEffect(() => {
    let active = true;
    async function fetchInventory() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/inventory`);
        if (!res.ok) throw new Error('API server error');
        const data = await res.json();
        if (active) {
          setInventory(data);
        }
      } catch (err) {
        console.warn('Backend server not reachable. Using offline localStorage fallback.', err);
      }
    }
    fetchInventory();
    return () => { active = false; };
  }, []);

  const addToInventory = useCallback((newItem) => {
    const entry = {
      ...newItem,
      id: `inv-user-${Date.now()}`,
      listedAt: new Date().toISOString(),   // ← real wall-clock timestamp
      nearbyBuyers: Math.floor(Math.random() * 30) + 5,
      interestedUsers: [],
    };

    // Optimistic state update
    setInventory(prev => [...prev, entry]);

    // Send post request to backend, falling back to localStorage if offline
    fetch(`${API_BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
      .then(res => res.json())
      .then(savedItem => {
        // Update the optimistic ID with the real ID from the backend
        if (savedItem && savedItem.id) {
          setInventory(prev => prev.map(i => i.id === entry.id ? { ...i, id: savedItem.id } : i));
        }
      })
      .catch(err => {
      console.warn('Backend save failed. Persisting to localStorage.', err);
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        parsed.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        // Ignore localStorage blockages
      }
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

  const updateDecision = useCallback(async (id, decision) => {
    // Optimistic update
    setInventory(prev => prev.filter(i => i.id !== id));
    
    // Call backend
    try {
      await fetch(`${API_BASE_URL}/api/inventory/${id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
    } catch (err) {
      console.warn('Backend decision update failed', err);
    }
  }, []);

  return {
    inventory: inventoryWithDays,
    withinWindow,
    pastWindow,
    warehouseItems,
    addToInventory,
    addToRecycle,
    addToWarehouse,
    updateDecision
  };
}
