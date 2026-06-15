import SmartRouting from '../components/SmartRouting/SmartRouting';

/**
 * SmartRoutingPage — thin wrapper that plugs the SmartRouting feature
 * into the app-level routing shell.
 *
 * SmartRouting owns its own internal nav (Route / Resale / Recycle)
 * and all its state. This page just mounts it.
 */
export default function SmartRoutingPage() {
  return <SmartRouting />;
}
