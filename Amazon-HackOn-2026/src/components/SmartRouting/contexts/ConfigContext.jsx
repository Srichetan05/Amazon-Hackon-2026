import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchConfig() {
      try {
        const res = await fetch('http://localhost:5000/api/config');
        if (!res.ok) throw new Error('Failed to fetch config from backend');
        const data = await res.json();
        if (active) {
          setConfig(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError(err.message);
          setLoading(false);
        }
      }
    }
    fetchConfig();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p>Loading application configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
