import { useState, useEffect } from 'react';
import styles from './LifecycleDashboard.module.css';

const ROLE_TABS = [
  { key: 'customer', label: '👤 Customer View', icon: '👤' },
  { key: 'inspector', label: '🔍 Inspector View', icon: '🔍' },
  { key: 'admin', label: '⚙️ Operations & Admin', icon: '⚙%' },
];

export default function LifecycleDashboard() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [passport, setPassport] = useState(null);
  const [currentRole, setCurrentRole] = useState('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch list of product instances on mount
  useEffect(() => {
    async function loadList() {
      try {
        const res = await fetch('http://localhost:5000/api/lifecycle');
        if (!res.ok) throw new Error('Failed to fetch lifecycle list');
        const data = await res.json();
        setItems(data);
        
        // Check if there is an item ID in the URL parameters to auto-select
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        if (urlId && data.some(item => item.id === urlId)) {
          setSelectedId(urlId);
        } else if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        setError('API server not reachable. Please start the backend.');
      }
    }
    loadList();
  }, []);

  // Fetch detailed passport when selectedId changes
  useEffect(() => {
    if (!selectedId) return;

    async function loadPassport() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/lifecycle/${selectedId}`);
        if (!res.ok) throw new Error('Failed to fetch passport details');
        const data = await res.json();
        setPassport(data);
        
        // Update URL to match current scanned item for easy sharing / reload
        const url = new URL(window.location);
        url.searchParams.set('id', selectedId);
        window.history.pushState({}, '', url);
      } catch (err) {
        setError('Failed to load passport details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPassport();
  }, [selectedId]);

  // Helper: Get event emoji
  function getEventIcon(type) {
    switch (type.toLowerCase()) {
      case 'packed': return '📦';
      case 'delivered': return '🏠';
      case 'returned': return '🔄';
      case 'graded': return '🔍';
      case 'routed': return '🚚';
      case 'moved': return '🚛';
      case 'resold': return '🛍️';
      default: return '📍';
    }
  }

  // Helper: Format date string
  function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  // Helper: Auto-generate AI Summary
  function generateAISummary(data) {
    const pkgDate = data.packagingDate ? new Date(data.packagingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'recently';
    const retReason = data.events.find(e => e.type === 'returned')?.reason || 'return window trigger';
    const cond = data.grade === 'damaged' ? `damaged (${data.damageLevel})` : 'like-new';
    
    let destination = 'nearest warehouse';
    if (data.decision === 'local_delivery_point') {
      destination = data.currentLocationName || 'local hub';
    } else if (data.decision === 'direct_recycle') {
      destination = 'recycling node';
    }

    return `This product was packed on ${pkgDate}. Following customer delivery, it was returned due to "${retReason}". The AI inspector graded its condition as ${cond} with ${(data.confidence * 100).toFixed(0)}% confidence. It has been dynamically routed to "${destination}" for optimized recovery.`;
  }

  return (
    <div className={styles.container}>
      {/* Simulator / Selector Panel */}
      <div className={styles.simulatorPanel}>
        <div className={styles.selectGroup}>
          <label htmlFor="passport-select" className={styles.selectLabel}>
            🔍 Digital Passport Simulator (Select an Item to Scan QR):
          </label>
          <select
            id="passport-select"
            className={styles.selectInput}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} [{item.grade?.toUpperCase() || 'NEW'}]
              </option>
            ))}
          </select>
        </div>

        {passport && (
          <div className={styles.qrBadgeWrapper}>
            <span className={styles.qrIcon}>📱 Scan to View Passport</span>
            <div className={styles.qrCodeBox}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/?id=${passport.id}`)}`} 
                alt="Product Passport QR Code" 
                className={styles.qrImage}
              />
            </div>
            <span className={styles.passportIdText}>ID: {passport.publicId || passport.id.slice(0, 13)}</span>
          </div>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {isLoading && <div className={styles.loadingSpinner}>Loading Digital Product Passport...</div>}

      {passport && !isLoading && (
        <div className={styles.dashboardGrid}>
          {/* Main Card Header */}
          <div className={`${styles.card} ${styles.headerCard}`}>
            <div className={styles.headerFlex}>
              <div>
                <span className={styles.passportTag}>🛡️ Digital Product Passport</span>
                <h1 className={styles.productName}>{passport.name}</h1>
                <p className={styles.productSku}>SKU: {passport.sku} | Serial: {passport.serialNumber || 'SN-UNKNOWN'}</p>
              </div>
              <div className={styles.statusBadgeRow}>
                <span className={`${styles.statusBadge} ${styles['status_' + passport.currentStatus]}`}>
                  Status: {passport.currentStatus.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`${styles.statusBadge} ${styles['grade_' + passport.grade]}`}>
                  Condition: {passport.grade.toUpperCase()}
                </span>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className={styles.aiSummarySection}>
              <div className={styles.aiSummaryTitle}>
                <span className={styles.aiSparkle}>⚡</span> **AI-Generated Lifecycle Summary**
              </div>
              <p className={styles.aiSummaryText}>{generateAISummary(passport)}</p>
              <div className={styles.trustBadges}>
                <span className={styles.trustBadge}>✅ Fully Traceable</span>
                <span className={styles.trustBadge}>🔍 AI Inspected</span>
                {passport.decision === 'local_delivery_point' && (
                  <span className={`${styles.trustBadge} ${styles.trustHighlight}`}>🌱 Low Carbon Resale</span>
                )}
              </div>
            </div>

            {/* Role Switcher */}
            <div className={styles.roleTabs}>
              {ROLE_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.roleTab} ${currentRole === tab.key ? styles.roleTabActive : ''}`}
                  onClick={() => setCurrentRole(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Left Column: Timeline */}
          <div className={`${styles.card} ${styles.timelineCard}`}>
            <h2 className={styles.cardTitle}>📜 Custody & Event Log</h2>
            <p className={styles.cardSubtitle}>
              {currentRole === 'customer' ? 'Simple lifecycle history of your item.' : 
               currentRole === 'inspector' ? 'Timestamps of AI grading inspections.' : 
               'Operations details and custody tracking trail.'}
            </p>

            <div className={styles.timeline}>
              {passport.events.map((ev, index) => {
                // Filter events based on role
                if (currentRole === 'customer' && (ev.type === 'graded' || ev.type === 'moved')) {
                  // Hide internal grading details or intermediate moves for customers
                  return null;
                }
                
                return (
                  <div key={ev.id || index} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>{getEventIcon(ev.type)}</div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <h3 className={styles.eventTitle}>{ev.type.toUpperCase()}</h3>
                        <span className={styles.eventTime}>{formatDate(ev.time)}</span>
                      </div>
                      <p className={styles.eventReason}>{ev.reason}</p>
                      
                      {/* Detailed inspection views for Inspector role */}
                      {currentRole === 'inspector' && ev.type === 'graded' && (
                        <div className={styles.inspectorDetailBox}>
                          <p><strong>AI Verdict:</strong> {passport.grade.toUpperCase()}</p>
                          <p><strong>Confidence Score:</strong> {(passport.confidence * 100).toFixed(1)}%</p>
                          <p><strong>Detected Defect:</strong> {passport.damageLevel}</p>
                        </div>
                      )}

                      {/* Operations data for Admin view */}
                      {currentRole === 'admin' && (
                        <div className={styles.adminDetailBox}>
                          {ev.fromLocationName && <p><strong>From:</strong> {ev.fromLocationName}</p>}
                          {ev.toLocationName && <p><strong>To:</strong> {ev.toLocationName}</p>}
                          <p><strong>Custody ID:</strong> {(index * 8931 + 4522).toString(16).toUpperCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Routing & Sustainability */}
          <div className={styles.rightColumn}>
            {/* Sustainability Scorecard */}
            <div className={`${styles.card} ${styles.sustainabilityCard}`}>
              <h2 className={styles.cardTitle}>🌱 Carbon Avoided scorecard</h2>
              <div className={styles.sustainabilityGrid}>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabel}>Avoided Shipping</span>
                  <span className={styles.metricValue}>
                    {passport.decision === 'local_delivery_point' ? '180 km' : '0 km'}
                  </span>
                  <span className={styles.metricSub}>Local recovery vs central return</span>
                </div>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabel}>Carbon Reduced</span>
                  <span className={styles.metricValue}>
                    {passport.decision === 'local_delivery_point' ? '24.2 kg CO₂' : '0 kg'}
                  </span>
                  <span className={styles.metricSub}>Avoided logistical footprint</span>
                </div>
                <div className={styles.metricBlock}>
                  <span className={styles.metricLabel}>Savings Score</span>
                  <span className={styles.metricValue}>
                    {passport.decision === 'local_delivery_point' ? 'A+' : 'C'}
                  </span>
                  <span className={styles.metricSub}>Logistics waste rating</span>
                </div>
              </div>
            </div>

            {/* Routing Recovery Info */}
            <div className={`${styles.card} ${styles.routingCard}`}>
              <h2 className={styles.cardTitle}>🚚 Routing & Recovery Recommendation</h2>
              <div className={styles.routingRow}>
                <span className={styles.routingLabel}>Decision Decision:</span>
                <span className={styles.routingValue}>{passport.decision?.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className={styles.routingRow}>
                <span className={styles.routingLabel}>Target Destination:</span>
                <span className={styles.routingValue}>{passport.currentLocationName || 'Amazon Warehouse'}</span>
              </div>
              <div className={styles.routingRow}>
                <span className={styles.routingLabel}>Estimated Resale Price:</span>
                <span className={styles.routingPrice}>₹{parseFloat(passport.discountedPrice).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.routingRow}>
                <span className={styles.routingLabel}>avoided return costs:</span>
                <span className={styles.routingValue}>₹{(parseFloat(passport.savings) || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Interactive Map Visual */}
              <div className={styles.mapVisualBox}>
                <span className={styles.mapVisualTitle}>🗺️ Logistics Journey Route:</span>
                <svg viewBox="0 0 300 120" className={styles.mapSvg}>
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
                    </marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                  </defs>
                  
                  {/* Warehouse Node */}
                  <circle cx="50" cy="60" r="15" fill="#3b82f6" />
                  <text x="50" y="64" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">🏭</text>
                  <text x="50" y="85" fontSize="8" textAnchor="middle" fill="#888">Warehouse</text>

                  {/* Customer Node */}
                  <circle cx="150" cy="60" r="15" fill="#f59e0b" />
                  <text x="150" y="64" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">🏠</text>
                  <text x="150" y="85" fontSize="8" textAnchor="middle" fill="#888">Customer</text>

                  {/* Resale Point / Hub Node */}
                  <circle cx="250" cy="60" r="15" fill={passport.decision === 'local_delivery_point' ? '#10b981' : '#4b5563'} />
                  <text x="250" y="64" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">🛍️</text>
                  <text x="250" y="85" fontSize="8" textAnchor="middle" fill="#888">Resale Hub</text>

                  {/* Flow Lines */}
                  <path d="M 68 60 L 132 60" stroke="#888" strokeWidth="2" markerEnd="url(#arrow)" />
                  
                  {/* Return Flow */}
                  {passport.decision === 'local_delivery_point' ? (
                    <path d="M 168 60 L 232 60" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-active)" strokeDasharray="4" className={styles.dashLine} />
                  ) : (
                    <path d="M 135 48 Q 100 20 65 48" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="4" />
                  )}
                </svg>
              </div>
            </div>

            {/* Stage Photos Gallery */}
            <div className={`${styles.card} ${styles.galleryCard}`}>
              <h2 className={styles.cardTitle}>📸 Inspection & Custody Gallery</h2>
              <div className={styles.galleryGrid}>
                <div className={styles.galleryItem}>
                  <div className={styles.galleryPhotoBox}>📦</div>
                  <span className={styles.galleryLabel}>1. Packaging stage</span>
                </div>
                <div className={styles.galleryItem}>
                  <div className={styles.galleryPhotoBox}>🚚</div>
                  <span className={styles.galleryLabel}>2. Handover transport</span>
                </div>
                <div className={styles.galleryItem}>
                  <div className={styles.galleryPhotoBox}>🔄</div>
                  <span className={styles.galleryLabel}>3. Return desk scan</span>
                </div>
                <div className={styles.galleryItem}>
                  <div className={styles.galleryPhotoBox}>🔍</div>
                  <span className={styles.galleryLabel}>4. AI Inspection verdict</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
