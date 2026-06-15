import { useState, useEffect, useRef } from 'react';
import styles from './GradingDashboard.module.css';

// SVG Mock Images as Data URLs to prevent missing resource assets
const MOCK_IMAGES = {
  sealed_box: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250" viewBox="0 0 300 250"><rect width="100%" height="100%" fill="%23EBF4FA"/><rect x="70" y="50" width="160" height="150" rx="10" fill="%233A506B" stroke="%231C2541" stroke-width="4"/><rect x="110" y="70" width="80" height="110" rx="6" fill="%235BC0BE"/><path d="M70 120 h160" stroke="%2334D399" stroke-width="8" stroke-dasharray="10 5"/><text x="150" y="40" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231C2541" text-anchor="middle">FACTORY SEALED BOX</text><circle cx="150" cy="120" r="15" fill="%23067D62" opacity="0.8"/><text x="150" y="124" font-family="sans-serif" font-size="10" fill="white" font-weight="bold" text-anchor="middle">SEAL</text></svg>`,
  scratched_cups: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250" viewBox="0 0 300 250"><rect width="100%" height="100%" fill="%23FFF5EC"/><path d="M80 150 Q150 50 220 150" fill="none" stroke="%23232F3E" stroke-width="12" stroke-linecap="round"/><circle cx="70" cy="160" r="30" fill="%23D8A47F" stroke="%23232F3E" stroke-width="4"/><circle cx="230" cy="160" r="30" fill="%23D8A47F" stroke="%23232F3E" stroke-width="4"/><path d="M60 150 l20 20 M65 170 l10 -25" stroke="%23B12704" stroke-width="2"/><path d="M220 150 l20 20" stroke="%23B12704" stroke-width="2"/><text x="150" y="40" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23232F3E" text-anchor="middle">OPEN BOX HEADPHONES</text><text x="150" y="225" font-family="sans-serif" font-size="11" fill="%23B12704" font-weight="bold" text-anchor="middle">Defects: Micro-scratches on cups</text></svg>`,
  torn_sole: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250" viewBox="0 0 300 250"><rect width="100%" height="100%" fill="%23FDF0F0"/><path d="M50 150 Q100 80 250 150 L250 180 Q150 170 50 180 Z" fill="%23E0E0E0" stroke="%23767676" stroke-width="3"/><path d="M50 180 Q150 170 250 180" stroke="%23B12704" stroke-width="6" fill="none"/><path d="M110 175 l10 -15 l10 15 l10 -15" stroke="%23111" stroke-width="2" fill="none"/><text x="150" y="40" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23B12704" text-anchor="middle">DAMAGED SOLE ATHLETICS</text><text x="150" y="220" font-family="sans-serif" font-size="11" fill="%23B12704" font-weight="bold" text-anchor="middle">Defects: Rubber sole separation</text></svg>`
};

const MOCK_PRESETS = [
  {
    id: 'preset-1',
    name: 'Samsung Galaxy S22',
    category: '📱 Smartphones',
    image: MOCK_IMAGES.sealed_box,
    grade: 'new',
    confidence: 0.98,
    condition_summary: 'Product packaging is fully factory-sealed with original security tapes intact. Zero signs of transit wear or tampering.',
    visible_issues: ['original box sealed', 'no exterior damage'],
    recommended_action: 'resell_local',
    risk_level: 'low',
    detailed_grade: 'new_sealed',
    repairability_score: 100,
    value_recovery_score: 98,
    estimated_resale_value: 58000 * 0.9,
    boxes: [
      { x: 70, y: 50, w: 160, h: 150, color: '#067D62', text: 'Sealed Box' },
      { cx: 150, cy: 120, r: 25, color: '#007185', text: 'Valid Seal' }
    ]
  },
  {
    id: 'preset-2',
    name: 'boAt Rockerz 450',
    category: '🎧 Audio',
    image: MOCK_IMAGES.scratched_cups,
    grade: 'used',
    confidence: 0.89,
    condition_summary: 'Product appears fully functional but shows signs of open-box handling. Micro-scratches detected on the side of the ear cup casings.',
    visible_issues: ['opened box packaging', 'hairline scratches on ear cups'],
    recommended_action: 'resell_local',
    risk_level: 'low',
    detailed_grade: 'lightly_used',
    repairability_score: 90,
    value_recovery_score: 75,
    estimated_resale_value: 1499 * 0.75,
    boxes: [
      { x: 40, y: 130, w: 60, h: 60, color: '#C45500', text: 'Cup Scratches' },
      { x: 200, y: 130, w: 60, h: 60, color: '#C45500', text: 'Wear Marks' }
    ]
  },
  {
    id: 'preset-3',
    name: 'Nike Revolution 6 Shoes',
    category: '👟 Footwear',
    image: MOCK_IMAGES.torn_sole,
    grade: 'damaged',
    confidence: 0.94,
    condition_summary: 'Product has a severe structural defect. The glue bonding the rubber outsole to the foam midsole has torn/separated.',
    visible_issues: ['separated sole', 'scuffed fabric'],
    recommended_action: 'repair',
    risk_level: 'medium',
    detailed_grade: 'damaged_repairable',
    repairability_score: 45,
    value_recovery_score: 40,
    estimated_resale_value: 3695 * 0.4,
    boxes: [
      { x: 50, y: 165, w: 200, h: 20, color: '#B12704', text: 'Sole Tear' },
      { x: 105, y: 155, w: 35, h: 22, color: '#B12704', text: 'Separation' }
    ]
  }
];

const DEFAULT_CATALOG_PRODUCTS = [
  { id: 'prod-001', name: 'Samsung Galaxy S22', category: '📱 Smartphones' },
  { id: 'prod-002', name: 'Apple 20W USB-C Adapter', category: '🔌 Accessories' },
  { id: 'prod-003', name: 'Nike Revolution 6 Shoes', category: '👟 Footwear' },
  { id: 'prod-004', name: 'Amazon Basics HDMI Cable', category: '🔌 Accessories' },
  { id: 'prod-005', name: 'boAt Rockerz 450', category: '🎧 Audio' },
  { id: 'prod-006', name: 'OnePlus Nord CE 3', category: '📱 Smartphones' },
  { id: 'prod-007', name: 'Realme Smart TV 43"', category: '📺 TVs' },
  { id: 'prod-008', name: 'Puma Core Backpack', category: '🎒 Bags' },
  { id: 'prod-009', name: 'Dyson V12 Vacuum', category: '🏠 Appliances' },
  { id: 'prod-010', name: 'JBL Flip 6 Speaker', category: '🔊 Speakers' }
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function GradingDashboard() {
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRESETS[0].name);
  const [selectedCategory, setSelectedCategory] = useState(MOCK_PRESETS[0].category);
  const [presetId, setPresetId] = useState('preset-1');
  const [customImage, setCustomImage] = useState(null);
  const [viewMode, setViewMode] = useState('front'); // front, back, package, close_up
  const [catalogProducts, setCatalogProducts] = useState(DEFAULT_CATALOG_PRODUCTS);
  
  // Inspection report states
  const [isInspecting, setIsInspecting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  
  // Persistence state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);

  // Fetch live products from backend on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/config`);
        if (res.ok) {
          const data = await res.json();
          if (data.sampleProducts && data.sampleProducts.length > 0) {
            setCatalogProducts(data.sampleProducts);
          }
        }
      } catch (err) {
        console.error('Failed to load catalog products:', err);
      }
    }
    loadConfig();
  }, []);

  // Auto-fill category when product changes
  function handleProductSelect(name) {
    setSelectedProduct(name);
    const item = catalogProducts.find(p => p.name === name);
    if (item) {
      setSelectedCategory(item.category);
    }
  }

  // Handle Preset card clicks
  function handlePresetSelect(preset) {
    setPresetId(preset.id);
    setCustomImage(null);
    setSelectedProduct(preset.name);
    setSelectedCategory(preset.category);
    setReport(null);
    setSaveResult(null);
    setError('');
  }

  // Handle local file uploads
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller image.');
      setCustomImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result);
      setPresetId('custom');
      setReport(null);
      setSaveResult(null);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  // Run AI grading inspection
  async function handleInspect() {
    setIsInspecting(true);
    setError('');
    setSaveResult(null);

    const activeImage = presetId === 'custom' ? customImage : MOCK_PRESETS.find(p => p.id === presetId)?.image;

    if (!activeImage) {
      setError('Please upload a product photo or select an inspection preset.');
      setIsInspecting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/grade-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: activeImage,
          name: selectedProduct,
          category: selectedCategory
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Backend failed to process image');
      }

      const aiResult = await response.json();
      
      // Calculate dynamic resale values based on result
      let resaleVal = 500;
      const originalPreset = MOCK_PRESETS.find(p => p.name === selectedProduct);
      if (originalPreset) {
        const pct = aiResult.value_recovery_score / 100;
        resaleVal = Math.round(originalPreset.estimated_resale_value * pct);
      }

      // Generate dynamic bounding boxes for defects randomly mapped to coordinates
      const mockBoxes = aiResult.visible_issues.map((issue, idx) => {
        const x = 50 + Math.random() * 100;
        const y = 80 + Math.random() * 80;
        const w = 40 + Math.random() * 80;
        const h = 30 + Math.random() * 50;
        const color = aiResult.grade === 'damaged' ? '#B12704' : '#C45500';
        return { x, y, w, h, color, text: issue };
      });

      const fullReport = {
        ...aiResult,
        estimated_resale_value: resaleVal,
        boxes: mockBoxes
      };

      setReport(fullReport);
      setHistory(prev => [fullReport, ...prev]);
    } catch (err) {
      setError(err.message || 'Inspection failed.');
    } finally {
      setIsInspecting(false);
    }
  }



  // Save report to database & generate passport link
  async function handleConfirmAndRoute() {
    if (!report) return;
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/grading-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProduct,
          category: selectedCategory,
          grade: report.grade,
          confidence: report.confidence,
          detailed_grade: report.detailed_grade,
          condition_summary: report.condition_summary,
          visible_issues: report.visible_issues,
          recommended_action: report.recommended_action,
          risk_level: report.risk_level,
          repairability_score: report.repairability_score,
          value_recovery_score: report.value_recovery_score,
          estimated_resale_value: report.estimated_resale_value
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save inspection to database.');
      }

      const data = await response.json();
      setSaveResult(data);
    } catch (err) {
      setError(err.message || 'Failed to save results.');
    } finally {
      setIsSaving(false);
    }
  }


  const activeImage = presetId === 'custom' ? customImage : MOCK_PRESETS.find(p => p.id === presetId)?.image;

  // Determine manual review / auto tag
  let escalationLabel = '✅ Auto Approved';
  let escalationClass = styles.escalationAuto;
  if (report) {
    if (report.confidence < 0.6) {
      escalationLabel = '🚨 Manual Inspection Req.';
      escalationClass = '';
    } else if (report.confidence <= 0.85) {
      escalationLabel = '⚠️ Operator Review Suggested';
      escalationClass = '';
    }
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>🔍 AI Visual Product Grading</h2>
        <p className={styles.pageSubtitle}>
          Amazon AI inspection engine. Scan customer returns using computer vision to diagnose structural defects, generate recovery recommendations, and create digital passports.
        </p>
      </div>

      {error && <div className={styles.highlightAlert}>{error}</div>}

      <div className={styles.gridTwoColumns}>
        {/* Left Card: Upload & Preset */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📸 Upload Returned Product</h3>
          <p className={styles.cardSubtitle}>Upload custom return photos or select from preset grading runs.</p>

          <div className={styles.selectWrapper}>
            <label style={{ fontSize: 13, fontWeight: 'bold', color: '#565959' }}>Target Catalog Product Name</label>
            <select
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #D5D9D9',
                borderRadius: '4px',
                marginTop: '4px',
                fontSize: '14px'
              }}
              value={selectedProduct}
              onChange={(e) => handleProductSelect(e.target.value)}
            >
              {catalogProducts.map(p => (
                <option key={p.id || p.name} value={p.name}>{p.name} [{p.category}]</option>
              ))}
            </select>
          </div>

          <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            <span className={styles.uploadIcon}>📤</span>
            <span className={styles.uploadText}>Upload Returned Product Image</span>
            <span className={styles.uploadSubtext}>Supports JPEG, PNG up to 10MB</span>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color: '#565959' }}>Or Select a Preset Evaluation Run:</span>
            <div className={styles.presetGrid}>
              {MOCK_PRESETS.map(p => (
                <div
                  key={p.id}
                  className={`${styles.presetCard} ${presetId === p.id ? styles.presetCardSelected : ''}`}
                  onClick={() => handlePresetSelect(p)}
                >
                  <img src={p.image} alt={p.name} className={styles.presetThumb} />
                  <span className={styles.presetLabel}>{p.name.split(' ')[0]} ({p.grade})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Preview Window */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🔬 Live Bounding Box View</h3>
          <p className={styles.cardSubtitle}>Inspect base64 frame feed overlays for damaged structures.</p>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {['front', 'back', 'package', 'close_up'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: viewMode === mode ? '#FFF8EE' : '#FFFFFF',
                  color: viewMode === mode ? '#C45500' : '#565959',
                  border: viewMode === mode ? '1px solid #FF9900' : '1px solid #D5D9D9',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {mode.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <div className={styles.previewSection}>
            {activeImage ? (
              <div className={styles.previewImageWrapper} style={{ position: 'relative' }}>
                <img src={activeImage} alt="Inspect preview" className={styles.previewImage} />
                
                {/* AI Laser Scanner Overlay */}
                <div className={`${styles.laserScanner} ${isInspecting ? styles.active : ''}`}></div>

                {/* Detected Bounding Boxes (CSS Overlays) */}
                {!isInspecting && report?.boxes && report.boxes.map((box, idx) => {
                  if (box.cx) {
                    return (
                      <div
                        key={idx}
                        className={styles.boundingCircle}
                        style={{
                          left: box.cx,
                          top: box.cy,
                          width: box.r * 2,
                          height: box.r * 2,
                          borderColor: box.color,
                        }}
                      >
                        <div className={styles.boundingBoxLabel} style={{ backgroundColor: box.color }}>
                          {box.text}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={styles.boundingBox}
                      style={{
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h,
                        borderColor: box.color,
                      }}
                    >
                      <div className={styles.boundingBoxLabel} style={{ backgroundColor: box.color }}>
                        {box.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#767676', fontSize: 14 }}>No product image selected.</p>
            )}
          </div>

          <div className={styles.confirmPanel} style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'center' }}>
            <button
              type="button"
              className={styles.inspectBtn}
              onClick={handleInspect}
              disabled={isInspecting || !activeImage}
            >
              {isInspecting ? '🔬 Running Computer Vision...' : '⚡ Start Visual Inspection'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Inspection Report Card */}
      {report && (
        <div className={styles.card}>
          <div className={styles.resultBanner}>
            <div className={styles.resultTitleBlock}>
              <span className={styles.resultTitleText}>Visual Grading Report:</span>
              <span className={`${styles.badge} ${report.grade === 'new' ? styles.badgeNew : report.grade === 'used' ? styles.badgeUsed : styles.badgeDamaged}`}>
                {report.grade}
              </span>
              <span style={{ fontSize: 13, color: '#565959', fontWeight: 'bold' }}>
                ({report.detailed_grade?.replace('_', ' ').toUpperCase()})
              </span>
            </div>

            <span className={`${styles.escalationTag} ${escalationClass}`}>
              {escalationLabel}
            </span>
          </div>

          <div className={styles.confidenceContainer}>
            <div className={styles.confidenceHeader}>
              <span>Inspection Confidence Score:</span>
              <span>{(report.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className={styles.confidenceTrack}>
              <div className={styles.confidenceFill} style={{ width: `${report.confidence * 100}%` }} />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#565959', textTransform: 'uppercase' }}>Condition Summary</h4>
            <p style={{ fontSize: 15, margin: 0, lineHeight: 1.5, color: '#0F1111' }}>{report.condition_summary}</p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#565959', textTransform: 'uppercase' }}>Detected Visible Issues</h4>
            <div className={styles.defectsList}>
              {report.visible_issues.map((issue, idx) => (
                <div key={idx} className={styles.defectItem}>
                  <span className={styles.defectBullet}>•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.progressGrid}>
            <div>
              <div className={styles.confidenceHeader}>
                <span>Repairability Index:</span>
                <span className={styles.progressValue}>{report.repairability_score}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={`${styles.progressBarFill} ${styles.progressBarFillGreen}`} 
                  style={{ width: `${report.repairability_score}%` }} 
                />
              </div>
              <span style={{ fontSize: 11, color: '#767676', display: 'block', marginTop: 4 }}>
                Refurbishment and parts assembly feasibility score.
              </span>
            </div>

            <div>
              <div className={styles.confidenceHeader}>
                <span>Value Recovery Score:</span>
                <span className={styles.progressValue}>{report.value_recovery_score}%</span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${report.value_recovery_score}%` }} 
                />
              </div>
              <span style={{ fontSize: 11, color: '#767676', display: 'block', marginTop: 4 }}>
                Estimated residual worth relative to catalog list price.
              </span>
            </div>
          </div>

          <div className={styles.confirmPanel}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 'bold', color: '#565959', textTransform: 'uppercase' }}>Recommended Recovery Decision:</span>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#B12704', marginTop: 4 }}>
                {report.recommended_action?.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            {saveResult ? (
              <div className={styles.highlightSuccess} style={{ margin: 0 }}>
                <span>✅ AI Visual Inspection saved! </span>
                <a
                  href={`/?id=${saveResult.id}`}
                  className={styles.passportLink}
                  onClick={(e) => {
                    // Force state updates or window reload
                  }}
                >
                  View Passport Log #{saveResult.publicId || saveResult.id.slice(0, 8)} →
                </a>
              </div>
            ) : (
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleConfirmAndRoute}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : '💾 Confirm AI Grade & Route'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session Audit History Section */}
      {history.length > 0 && (
        <div className={styles.card} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle}>📜 Visual Inspection Audit Log</h3>
          <p className={styles.cardSubtitle}>Audit trail of model evaluations run during this session.</p>

          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Overall Grade</th>
                <th>Confidence</th>
                <th>Detected Defects</th>
                <th>Recommended Action</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold' }}>{selectedProduct}</td>
                  <td>
                    <span className={`${styles.badge} ${h.grade === 'new' ? styles.badgeNew : h.grade === 'used' ? styles.badgeUsed : styles.badgeDamaged}`}>
                      {h.grade}
                    </span>
                  </td>
                  <td>{(h.confidence * 100).toFixed(0)}%</td>
                  <td>{h.visible_issues.join(', ')}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 'bold' }}>
                    {h.recommended_action.replace('_', ' ')}
                  </td>
                  <td style={{ fontWeight: 'bold', color: h.risk_level === 'high' ? '#B12704' : h.risk_level === 'medium' ? '#C45500' : '#067D62' }}>
                    {h.risk_level.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
