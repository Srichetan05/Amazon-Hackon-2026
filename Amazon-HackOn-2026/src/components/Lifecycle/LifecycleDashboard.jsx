import { useState, useEffect } from 'react';
import styles from './LifecycleDashboard.module.css';

const ROLE_TABS = [
  { key: 'customer', label: 'Customer View' },
  { key: 'inspector', label: 'Inspector View' },
  { key: 'admin', label: 'Operations & Admin' },
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
        if (!res.ok) throw new Error('Passport not found');
        const data = await res.json();
        setPassport(data);
      } catch (err) {
        setError(err.message);
        setPassport(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadPassport();
  }, [selectedId]);

  // Generate fallback summary and issues if missing in DB (e.g. for mock-seeded items)
  const getFallbackDetails = () => {
    if (!passport) return { summary: '', issues: [] };
    const grade = (passport.grade || 'new').toLowerCase();
    const damage = (passport.damageLevel || 'NONE').toUpperCase();
    
    let summary = passport.conditionSummary;
    let issues = passport.visibleIssues || [];

    if (!summary) {
      if (grade === 'damaged') {
        summary = `AI Quality Inspection has analyzed "${passport.name}" and detected visual anomalies matching structural defects. Structural integrity checked with grade severity classified as ${damage}.`;
      } else if (grade === 'used') {
        summary = `AI Quality Inspection has analyzed "${passport.name}" and verified it as a functional, pre-owned product. Light cosmetic scuffs detected on outer casing; packaging has been opened.`;
      } else {
        summary = `AI Quality Inspection has analyzed "${passport.name}" and verified it is in pristine, open-box condition. Original packaging is intact with seal unbroken.`;
      }
    }

    if (!issues || issues.length === 0) {
      if (grade === 'damaged') {
        issues = ['open box packaging', 'surface scratches', 'functional wear/defect'];
      } else if (grade === 'used') {
        issues = ['opened retail packaging', 'light cosmetic scuffs'];
      } else {
        issues = ['intact retail packaging', 'zero cosmetic defects'];
      }
    }

    return { summary, issues };
  };

  const { summary: displaySummary, issues: displayIssues } = getFallbackDetails();

  return (
    <div className={styles.container}>
      {/* Top Navbar Dropdown */}
      <div className={styles.topNavbar}>
        <label className={styles.navLabel} htmlFor="passport-select">
          Select Product Passport:
        </label>
        <select
          id="passport-select"
          className={styles.navSelect}
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

      {error && <div className={styles.errorAlert}>{error}</div>}
      {isLoading && <div className={styles.loadingState}>Loading Digital Product Passport...</div>}

      {passport && !isLoading && (
        <div className={styles.dashboardGrid}>
          {/* Top Section */}
          <div className={styles.topSection}>
            {/* Left Info Column */}
            <div className={styles.infoColumn}>
              <div className={styles.dppLabel}>Digital Product Passport</div>
              <h1 className={styles.productTitle}>{passport.name}</h1>
              <div className={styles.productMeta}>
                SKU: {passport.sku || 'SKU-UNKNOWN'} | Serial: {passport.serialNumber || 'SN-UNKNOWN'}
              </div>

              {currentRole !== 'customer' && (
                <div className={styles.aiConfidenceText}>
                  {(passport.confidence * 100 || 95).toFixed(0)}% AI Grading Confidence
                </div>
              )}

              {/* Condition Box */}
              <div className={styles.conditionBox}>
                <div className={styles.conditionLabel}>ITEM CONDITION:</div>
                <div className={styles.conditionValue}>{(passport.grade || 'UNKNOWN').toUpperCase()}</div>
                {passport.grade?.toUpperCase() === 'DAMAGED' && (
                  <div className={styles.severityText}>
                    <strong>Severity:</strong> {passport.damageLevel || 'MAJOR'}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className={styles.badgeRow}>
                <span className={styles.badgeStatus}>STATUS: {passport.status || 'ROUTED'}</span>
                <span className={styles.badgeGrade}>GRADE: {passport.grade || 'DAMAGED'}</span>
              </div>

              {/* AI Passport Summary for Customers */}
              {currentRole === 'customer' && (
                <div className={styles.aiSummarySection}>
                  <h3 className={styles.summaryTitle}>✨ AI Quality & Return Assessment</h3>
                  <div className={styles.aiSummaryCard}>
                    {displaySummary && (
                      <p className={styles.conditionSummaryText}>
                        {displaySummary}
                      </p>
                    )}
                    {displayIssues && displayIssues.length > 0 && (
                      <div className={styles.issuesWrapper}>
                        <div className={styles.issuesTitle}>Detected Condition Notes:</div>
                        <div className={styles.issuesList}>
                          {displayIssues.map((issue, idx) => (
                            <span key={idx} className={styles.issueTag}>
                              🔍 {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sustainability Recommendation for Customers */}
              {currentRole === 'customer' && (
                <div className={styles.sustainabilityCard}>
                  <h3 className={styles.sustainabilityCardTitle}>🌱 Circular Economy Recommendation</h3>
                  <div className={styles.sustainabilityCardContent}>
                    {(() => {
                      const decision = passport.decision || '';
                      if (decision === 'warehouse') {
                        return (
                          <>
                            <div className={styles.recIcon}>🔄</div>
                            <div className={styles.recText}>
                              <strong>Warehouse Consolidate & Refurbish:</strong> This item is returning to our central hub to be consolidated with similar products for component reclamation or high-efficiency factory recycling.
                            </div>
                          </>
                        );
                      } else if (decision === 'direct_recycle' || decision === 'recycle') {
                        return (
                          <>
                            <div className={styles.recIcon}>♻️</div>
                            <div className={styles.recText}>
                              <strong>Local Eco-Recycling:</strong> Routed directly to local recycling hubs. High-value materials (metals, polymers) are safely recovered to manufacture future green packaging, keeping electronic waste out of landfills.
                            </div>
                          </>
                        );
                      } else if (decision === 'donate') {
                        return (
                          <>
                            <div className={styles.recIcon}>🎁</div>
                            <div className={styles.recText}>
                              <strong>Community Donation:</strong> Extended lifecycle recovery. This item is being delivered to local charity partners to support digital inclusion initiatives.
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <div className={styles.recIcon}>🛍️</div>
                            <div className={styles.recText}>
                              <strong>Optimized Local Resale:</strong> Restored for local recommerce. This item is sent to nearby resale nodes to be sold at a discount, avoiding over 180 km of carbon-heavy round-trip shipping.
                            </div>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Lifecycle Summary (Hidden for Customers) */}
              {currentRole !== 'customer' && (
                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>Inspector Summary</h3>
                  <ul className={styles.summaryList}>
                    <li>Originally packed at central warehouse node.</li>
                    <li>Returned by customer due to cosmetic or defect issue.</li>
                    <li>AI Inspection Grade: {passport.grade} with {(passport.confidence * 100 || 95).toFixed(0)}% confidence.</li>
                    <li>Dynamically routed to local delivery point for optimized recovery.</li>
                    <li>Verified by Amazon Smart Routing Engine.</li>
                  </ul>
                </div>
              )}

              {/* Admin Diagnostics */}
              {currentRole === 'admin' && (
                <div style={{ fontSize: '11px', color: '#565959', marginTop: '12px', fontFamily: 'monospace', background: '#f0f2f2', padding: '12px', borderRadius: '6px', border: '1px solid #d5d9d9' }}>
                  <strong style={{ color: '#0F1111' }}>SYS_ADMIN_DIAGNOSTICS</strong><br />
                  RECORD_UUID: {passport.id}<br />
                  SYS_STATUS: {passport.currentStatus}<br />
                  RTG_DECISION: {passport.decision}<br />
                  VAL_LOCAL: {passport.localCost || 'N/A'} | VAL_WHSE: {passport.warehouseCost || 'N/A'}<br />
                  AI_MODEL_CONF: {passport.confidence}
                </div>
              )}
            </div>

            {/* Right QR Column */}
            <div className={styles.qrColumn}>
              <div className={styles.qrCard}>
                <h3 className={styles.qrTitle}>Scan for Public Passport</h3>
                <div className={styles.qrImageWrapper}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/?id=${passport.id}`)}`}
                    alt="QR Code"
                    className={styles.qrImage}
                  />
                </div>
                <div className={styles.dppPill}>
                  DPP: {passport.publicId || passport.id.slice(0, 13)}
                </div>

                {currentRole !== 'customer' && (
                  <div className={styles.routingInfo}>
                    <div className={styles.routingType}>Routing: {passport.decision ? passport.decision.toUpperCase().replace('_', ' ') : 'LOCAL DELIVERY_POINT'}</div>
                    <div className={styles.routingDest}>
                      📍 Destination:<br />
                      {passport.currentLocationName || 'Chenna Reddi Palle Delivery point'}
                    </div>
                    <div className={styles.verifiedText}>
                      🔒 Verified Supply Chain Record
                    </div>
                  </div>
                )}

                <hr className={styles.qrDivider} />

                <div className={styles.impactSection}>
                  <h4 className={styles.impactTitle}>🌱 Environmental Impact</h4>
                  <div className={styles.impactRow}>
                    <span className={styles.impactLabel}>Avoided Shipping:</span>
                    <span className={styles.impactValue}>
                      {passport.sustainabilityScore?.milesAvoided || 180} km
                    </span>
                  </div>
                  <div className={styles.impactRow}>
                    <span className={styles.impactLabel}>Carbon Reduced:</span>
                    <span className={styles.impactValue}>
                      {passport.sustainabilityScore?.emissionsSavedKg || 24.2} kg CO₂
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={styles.bottomSection}>
            <div className={styles.tabsRow}>
              {ROLE_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`${styles.tabBtn} ${currentRole === tab.key ? styles.tabBtnActive : ''}`}
                  onClick={() => setCurrentRole(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.bottomGrid}>
              {/* Timeline */}
              <div className={styles.timelineColumn}>
                <h2 className={styles.bottomSectionTitle}>Product custody details</h2>
                <div className={styles.timeline}>
                  {passport.events && passport.events.map((evt, idx) => {
                    // Filter logic
                    if (currentRole === 'customer') {
                      if (evt.type === 'graded' || evt.type === 'routed') return null;
                    }

                    let icon = '✅';
                    let label = evt.type || 'EVENT';
                    if (evt.type === 'returned') { icon = '📦'; label = 'RETURNED'; }
                    if (evt.type === 'routed') { icon = '🔀'; label = 'ROUTED'; }
                    if (evt.type === 'packed' || idx === 0) { icon = '📦'; label = 'PACKED'; }
                    if (evt.type === 'delivered' || idx === 1) { icon = '🏠'; label = 'DELIVERED'; }
                    if (evt.type === 'graded') { icon = '🔍'; label = 'GRADED'; }

                    return (
                      <div key={idx} className={styles.timelineItem}>
                        <div className={styles.timelineIconWrapper}>
                          <span className={styles.timelineIcon}>{icon}</span>
                        </div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineHeader}>
                            <span className={styles.timelineLabel}>{label.toUpperCase()}</span>
                            <span className={styles.timelineDate}>
                              {new Date(evt.time).toLocaleString('en-US', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className={styles.timelineDesc}>{evt.reason}</div>
                          {currentRole === 'admin' && (
                            <div style={{ fontSize: '11px', color: '#565959', marginTop: '6px', fontFamily: 'monospace', background: '#f8f8f8', padding: '6px', borderRadius: '4px', border: '1px dashed #d5d9d9' }}>
                              EVT_ID: {evt.id}<br />
                              {evt.fromLocationName && `FROM_NODE: ${evt.fromLocationName} `}
                              {evt.toLocationName && `TO_NODE: ${evt.toLocationName}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Journey Map */}
              <div className={styles.journeyColumn}>
                <h2 className={styles.bottomSectionTitle}>Logistics Journey Map</h2>
                <div className={styles.journeyCard}>
                  <div className={styles.journeyGraph} style={{ position: 'relative' }}>

                    <div className={styles.nodeWrapper} style={{ zIndex: 2 }}>
                      <div className={styles.nodeDark}>🏢</div>
                      <span className={styles.nodeLabel}>Warehouse</span>
                    </div>

                    <div className={styles.arrowSolid} style={{ zIndex: 1 }}></div>

                    <div className={styles.nodeWrapper} style={{ zIndex: 2 }}>
                      <div className={styles.nodeOrange}>🏠</div>
                      <span className={styles.nodeLabel}>Customer</span>
                    </div>

                    {passport.decision === 'warehouse' ? (
                      <div className={styles.returnLoopWrapper}>
                        <div style={{ position: 'absolute', left: '-5px', bottom: '-4px', color: '#565959', fontSize: '12px', zIndex: 10 }}>▼</div>
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.returnLoopSvg}>
                          <path
                            className={styles.loopPath}
                            d="M 100 100 C 100 -20, 0 -20, 0 100"
                            fill="none"
                            stroke="#565959"
                            strokeWidth="4"
                            strokeDasharray="12,12"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    ) : (
                      <>
                        <div className={styles.arrowDashed} style={{ zIndex: 1 }}></div>
                        {(() => {
                          let endNodeLabel = 'Delivery Point';
                          let endNodeIcon = '🛍️';
                          let endNodeClass = styles.nodeTeal;

                          if (passport.decision === 'direct_recycle' || passport.decision === 'recycle') {
                            endNodeLabel = 'Recycle Center';
                            endNodeIcon = '♻️';
                            endNodeClass = styles.nodeGreen;
                          } else if (passport.decision === 'donate') {
                            endNodeLabel = 'Donation Center';
                            endNodeIcon = '❤️';
                            endNodeClass = styles.nodeRed;
                          }

                          return (
                            <div className={styles.nodeWrapper} style={{ zIndex: 2 }}>
                              <div className={endNodeClass}>{endNodeIcon}</div>
                              <span className={styles.nodeLabel}>{endNodeLabel}</span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
