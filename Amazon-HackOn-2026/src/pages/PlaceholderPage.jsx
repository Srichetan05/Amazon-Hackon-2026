import styles from './PlaceholderPage.module.css';

/**
 * PlaceholderPage — drop-in template for teammates adding new features.
 *
 * Replace this component entirely with your feature.
 * The AppShell header, routing, and global styles are already wired up —
 * just export your root component as default from your page file
 * and register it in FEATURES inside App.jsx.
 */
export default function PlaceholderPage({ feature }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">{feature.icon}</div>
        <h1 className={styles.title}>{feature.label}</h1>
        <p className={styles.subtitle}>
          This feature is under development. Replace{' '}
          <code>src/pages/PlaceholderPage.jsx</code> with your feature component,
          then register it in the <code>FEATURES</code> array in{' '}
          <code>src/App.jsx</code>.
        </p>

        <div className={styles.instructions}>
          <h2>Integration guide</h2>
          <ol>
            <li>Create your feature folder: <code>src/components/YourFeature/</code></li>
            <li>Build your root component (e.g. <code>YourFeature.jsx</code>)</li>
            <li>Create a page wrapper in <code>src/pages/YourFeaturePage.jsx</code></li>
            <li>
              Add an entry to the <code>FEATURES</code> array in <code>App.jsx</code>:
              <pre className={styles.code}>{`{ key: 'your-feature', label: 'Your Feature', icon: '🔧', component: YourFeaturePage }`}</pre>
            </li>
            <li>Done — your feature appears in the global header automatically.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
