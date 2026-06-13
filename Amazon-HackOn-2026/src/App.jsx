import { useState } from 'react';
import AppShell from './layout/AppShell';
import SmartRoutingPage from './pages/SmartRoutingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LifecyclePage from './pages/LifecyclePage';

/**
 * FEATURES — the single source of truth for top-level navigation.
 *
 * To add a new feature:
 *  1. Create src/pages/YourFeaturePage.jsx
 *  2. Import it here
 *  3. Add an entry below — the header tab appears automatically
 *
 * Fields:
 *  key       — unique string identifier used in URL-style routing
 *  label     — text shown in the header tab
 *  icon      — emoji icon shown next to the label
 *  component — the React component to render when this tab is active
 * */
const FEATURES = [
  {
    key: 'smart-routing',
    label: 'Smart Product Routing',
    icon: '🚚',
    component: SmartRoutingPage,
  },
  {
    key: 'product-grading',
    label: 'Product Grading',
    icon: '🔍',
    component: (props) => <PlaceholderPage feature={props.feature} />,
  },
  {
    key: 'lifecycle-card',
    label: 'Lifecycle Card',
    icon: '📋',
    component: LifecyclePage,
  },
];

export default function App() {
  const [currentFeature, setCurrentFeature] = useState(() => {
    // If a product ID is detected in the URL parameters, auto-navigate to the Digital Passport tab
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) {
      return 'lifecycle-card';
    }
    return FEATURES[0].key;
  });

  const active = FEATURES.find(f => f.key === currentFeature) ?? FEATURES[0];
  const ActiveComponent = active.component;

  return (
    <AppShell
      currentFeature={currentFeature}
      onNavigate={setCurrentFeature}
      features={FEATURES}
    >
      <ActiveComponent feature={active} />
    </AppShell>
  );
}
