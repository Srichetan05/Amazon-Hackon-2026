import appStyles from './AppShell.module.css';
import AppHeader from './AppHeader';

/**
 * AppShell — wraps every page with the shared header and page container.
 * Feature pages are rendered as children — they own their own padding/layout.
 */
export default function AppShell({ currentFeature, onNavigate, features, children }) {
  return (
    <div className={appStyles.shell}>
      <AppHeader
        currentFeature={currentFeature}
        onNavigate={onNavigate}
        features={features}
      />
      <main className={appStyles.main} id="main-content">
        {children}
      </main>
    </div>
  );
}
