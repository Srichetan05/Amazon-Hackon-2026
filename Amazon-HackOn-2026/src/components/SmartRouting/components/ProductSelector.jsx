import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';

const GRADE_LABELS = {
  NEW:     { label: 'New',     emoji: '🟢', desc: 'Unopened / like new' },
  DAMAGED: { label: 'Damaged', emoji: '🔴', desc: 'Physical / functional damage' },
};

const getDamageOptions = (DAMAGE_LEVELS) => [
  { value: DAMAGE_LEVELS.MINOR,        label: 'Minor',        emoji: '🟡', desc: 'Cosmetic scratches — fully functional', discount: 'Dynamic % off' },
  { value: DAMAGE_LEVELS.MAJOR,        label: 'Major',        emoji: '🟠', desc: 'Significant damage — partially functional', discount: 'Dynamic % off' },
  { value: DAMAGE_LEVELS.IRREPAIRABLE, label: 'Irrepairable', emoji: '🔴', desc: 'Cannot be fixed — direct recycle', discount: '—' },
];

export default function ProductSelector({ selectedProduct, selectedGrade, selectedDamageLevel, onProductChange, onGradeChange, onDamageLevelChange }) {
  const { sampleProducts, CURRENCY_SYMBOL, DAMAGE_LEVELS } = useConfig();
  const DAMAGE_OPTIONS = getDamageOptions(DAMAGE_LEVELS);
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <span className={styles.stepBadge}>1</span> Return Item
      </h2>
      <p className={styles.cardSubtitle}>
        Select the product and its current condition. For damaged items, specify
        the level of damage — this determines the routing and resale discount.
      </p>

      {/* Product dropdown */}
      <label className={styles.label}>
        Product
        <select
          className={styles.select}
          value={selectedProduct?.id ?? ''}
          onChange={e => onProductChange(sampleProducts.find(p => p.id === e.target.value) ?? null)}
          aria-label="Select product"
        >
          <option value="">— Select a product —</option>
          {sampleProducts.map(p => (
            <option key={p.id} value={p.id}>
              {p.category}  {p.name} — {CURRENCY_SYMBOL}{p.originalPrice.toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </label>

      {/* Grade selection */}
      {selectedProduct && (
        <div className={styles.gradeGroup}>
          <span className={styles.label}>Condition</span>
          <div className={styles.gradeOptions} role="radiogroup" aria-label="Product condition">
            {Object.entries(GRADE_LABELS).map(([grade, info]) => (
              <label
                key={grade}
                className={`${styles.gradeOption} ${selectedGrade === grade ? styles.gradeOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="grade"
                  value={grade}
                  checked={selectedGrade === grade}
                  onChange={() => { onGradeChange(grade); if (grade !== 'DAMAGED') onDamageLevelChange(null); }}
                  className={styles.srOnly}
                />
                <span className={styles.gradeEmoji}>{info.emoji}</span>
                <span>
                  <span className={styles.gradeLabel}>{info.label}</span>
                  <span className={styles.gradeDesc}>{info.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Damage level — only for DAMAGED */}
      {selectedProduct && selectedGrade === 'DAMAGED' && (
        <div className={styles.damageGroup}>
          <span className={styles.label}>Damage Level</span>
          <div className={styles.damageOptions} role="radiogroup" aria-label="Damage level">
            {DAMAGE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`${styles.damageOption} ${selectedDamageLevel === opt.value ? styles.damageOptionSelected : ''}`}
              >
                <input
                  type="radio"
                  name="damageLevel"
                  value={opt.value}
                  checked={selectedDamageLevel === opt.value}
                  onChange={() => onDamageLevelChange(opt.value)}
                  className={styles.srOnly}
                />
                <div className={styles.damageOptionTop}>
                  <span>{opt.emoji}</span>
                  <span className={styles.damageLevelLabel}>{opt.label}</span>
                  <span className={styles.damageLevelDiscount}>
                    {opt.discount !== '—' ? `${opt.discount} off` : 'Direct Recycle'}
                  </span>
                </div>
                <p className={styles.damageLevelDesc}>{opt.desc}</p>
              </label>
            ))}
          </div>

          {selectedDamageLevel === DAMAGE_LEVELS.IRREPAIRABLE && (
            <div className={styles.irreparableWarning}>
              ⚠️ <strong>Irrepairable items are recycled directly.</strong> No warehouse return or local resale — this product goes straight to a certified recycling facility.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
