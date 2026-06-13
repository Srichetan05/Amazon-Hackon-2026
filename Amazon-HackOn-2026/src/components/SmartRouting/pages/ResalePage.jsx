import { useState } from 'react';
import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';

const GRADE_COLOR = { NEW: styles.gradeNew, USED: styles.gradeUsed, DAMAGED: styles.gradeDamaged };

export default function ResalePage({ withinWindow, pastWindow }) {
  const { LOCAL_RESALE_WINDOW_DAYS, CURRENCY_SYMBOL } = useConfig();
  const [searchQuery, setSearchQuery] = useState('');

  const filterItems = (items) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.city?.toLowerCase().includes(q) || 
      item.deliveryPointName?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  };

  const filteredWithin = filterItems(withinWindow);
  const filteredPast = filterItems(pastWindow);
  return (
    <div>
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle}>🛍️ Local Resale Marketplace</h2>
        <p className={styles.pageSubtitle}>
          Products listed at nearby temporary storage hubs for up to{' '}
          <strong>{LOCAL_RESALE_WINDOW_DAYS} days</strong>. Amazon users in the area
          can buy them at discounted prices. Days are calculated live from the exact
          time each item was added. Recycle / Donate only activates after the holdout
          window expires.
        </p>
        <div style={{ marginTop: 16 }}>
          <input
            type="search"
            placeholder="Search by product, city or hub location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d5d9d9',
              width: '100%',
              maxWidth: '400px',
              fontSize: '14px',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(15,17,17,0.15) inset'
            }}
          />
        </div>
      </div>

      {/* ── Active listings ── */}
      <div className={styles.card}>
        <div className={styles.sectionHeading}>
          ✅ Available Now
          <span className={styles.sectionCount}>{filteredWithin.length}</span>
        </div>
        <p className={styles.sectionNote}>
          Within the {LOCAL_RESALE_WINDOW_DAYS}-day window — buy it before it's gone.
        </p>

        {filteredWithin.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredWithin.map(item => <ActiveProductCard key={item.id} item={item} LOCAL_RESALE_WINDOW_DAYS={LOCAL_RESALE_WINDOW_DAYS} CURRENCY_SYMBOL={CURRENCY_SYMBOL} />)}
          </div>
        ) : (
          <p className={styles.emptyState}>No active listings found.</p>
        )}
      </div>

      {/* ── Expired ── */}
      {filteredPast.length > 0 && (
        <div className={styles.card}>
          <div className={`${styles.sectionHeading} ${styles.sectionHeadingAlert}`}>
            ⚠️ Holdout Period Expired
            <span className={styles.sectionCount}>{filteredPast.length}</span>
          </div>
          <p className={styles.sectionNote}>
            These products weren't sold within {LOCAL_RESALE_WINDOW_DAYS} days.
            Head to <strong>Recycle &amp; Donate</strong> to dispatch them.
          </p>
          <div className={styles.productGrid}>
            {filteredPast.map(item => <ExpiredProductCard key={item.id} item={item} LOCAL_RESALE_WINDOW_DAYS={LOCAL_RESALE_WINDOW_DAYS} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveProductCard({ item, LOCAL_RESALE_WINDOW_DAYS, CURRENCY_SYMBOL }) {
  const daysLeft = LOCAL_RESALE_WINDOW_DAYS - item.daysListed;
  const pct = Math.min((item.daysListed / LOCAL_RESALE_WINDOW_DAYS) * 100, 100);
  const barColor = pct >= 66 ? '#B12704' : pct >= 33 ? '#C45500' : '#067D62';

  return (
    <div className={styles.productCard}>
      <div className={styles.productCardHeader}>
        <div>
          <div className={styles.productCardName}>{item.name}</div>
          <div className={styles.productCardCategory}>{item.category}</div>
        </div>
        <span className={`${styles.gradeBadge} ${GRADE_COLOR[item.grade]}`}>{item.grade}</span>
      </div>

      <div className={styles.productCardPricing}>
        <span className={styles.productCardPrice}>
          {CURRENCY_SYMBOL}{item.discountedPrice.toLocaleString('en-IN')}
        </span>
        <span className={styles.productCardWas}>
          {CURRENCY_SYMBOL}{item.originalPrice.toLocaleString('en-IN')}
        </span>
        <span className={styles.productCardDiscount}>
          {Math.round((1 - item.discountedPrice / item.originalPrice) * 100)}% off
        </span>
      </div>

      <div className={styles.productCardMeta}>
        <div className={styles.productCardMetaRow}>
          <span className={styles.productCardMetaIcon}>📍</span>
          {item.deliveryPointName}, {item.city}
        </div>
        <div className={styles.productCardMetaRow}>
          <span className={styles.productCardMetaIcon}>🕐</span>
          <span className={styles.listedAtText}>
            Added {new Date(item.listedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        {item.nearbyBuyers > 0 && (
          <div className={styles.productCardMetaRow}>
            <span className={styles.productCardMetaIcon}>👥</span>
            <span className={styles.productCardBuyers}>{item.nearbyBuyers} nearby buyers interested</span>
          </div>
        )}
        {item.interestedUsers?.length > 0 && (
          <div className={styles.productCardInterested}>
            👀 {item.interestedUsers.slice(0, 2).join(', ')}
            {item.interestedUsers.length > 2 && ` +${item.interestedUsers.length - 2} more`}
          </div>
        )}
      </div>

      <div className={styles.productCardFooter}>
        <div className={styles.daysBarWrapper}>
          <span className={styles.daysBarLabel}>{item.daysListed}/{LOCAL_RESALE_WINDOW_DAYS} days</span>
          <div className={styles.daysBarTrack}>
            <div className={styles.daysBarFill} style={{ width: `${pct}%`, background: barColor }} />
          </div>
        </div>
        <span className={styles.statusActive} style={{ marginLeft: 12, flexShrink: 0 }}>
          ⏳ {daysLeft}d left
        </span>
      </div>
    </div>
  );
}

function ExpiredProductCard({ item, LOCAL_RESALE_WINDOW_DAYS }) {
  const overBy = item.daysListed - LOCAL_RESALE_WINDOW_DAYS;
  const nextAction = '❤️/♻️ Donation / Recycling';

  return (
    <div className={styles.expiredCard}>
      <div className={styles.productCardHeader}>
        <div>
          <div className={styles.productCardName}>{item.name}</div>
          <div className={styles.productCardCategory}>{item.category}</div>
        </div>
        <span className={`${styles.gradeBadge} ${GRADE_COLOR[item.grade]}`}>{item.grade}</span>
      </div>
      <div className={styles.productCardMeta}>
        <div className={styles.productCardMetaRow}>
          <span>📍</span> {item.deliveryPointName}, {item.city}
        </div>
        <div className={styles.productCardMetaRow}>
          <span>🕐</span>
          <span className={styles.listedAtText}>
            Added {new Date(item.listedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div className={styles.daysBarWrapper}>
          <span className={styles.daysBarLabel}>{item.daysListed}/{LOCAL_RESALE_WINDOW_DAYS} days</span>
          <div className={styles.daysBarTrack}>
            <div className={styles.daysBarFill} style={{ width: '100%', background: '#B12704' }} />
          </div>
        </div>
        <span className={styles.statusExpired} style={{ marginLeft: 12, flexShrink: 0 }}>
          {nextAction}<span className={styles.overByLabel}> ({overBy}d over)</span>
        </span>
      </div>
    </div>
  );
}
