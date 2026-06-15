import styles from '../SmartRouting.module.css';
import { useConfig } from '../contexts/ConfigContext';
import { calculateDistance } from '../utils/routingEngine';

/**
 * A visual SVG-based "map" showing warehouse locations relative to the user.
 * Uses a simple bounding-box projection — not a real geo map but gives a
 * clear spatial overview for the demo.
 */
export default function WarehouseMap({ userLocation, nearestWarehouseId }) {
  const { warehouses } = useConfig();
  if (!userLocation) return null;

  const WIDTH = 400;
  const HEIGHT = 280;
  const PADDING = 40;

  // Collect all points (user + warehouses)
  const allPoints = [
    { lat: userLocation.lat, lng: userLocation.lng },
    ...warehouses.map((w) => ({ lat: w.lat, lng: w.lng })),
  ];

  const minLat = Math.min(...allPoints.map((p) => p.lat));
  const maxLat = Math.max(...allPoints.map((p) => p.lat));
  const minLng = Math.min(...allPoints.map((p) => p.lng));
  const maxLng = Math.max(...allPoints.map((p) => p.lng));

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  function project(lat, lng) {
    const x = PADDING + ((lng - minLng) / lngRange) * (WIDTH - 2 * PADDING);
    // Flip y: higher lat = higher on screen
    const y = HEIGHT - PADDING - ((lat - minLat) / latRange) * (HEIGHT - 2 * PADDING);
    return { x, y };
  }

  const userPos = project(userLocation.lat, userLocation.lng);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>🗺 Warehouse Overview</h2>
      <p className={styles.cardSubtitle}>
        Your location vs. nearby Amazon fulfilment warehouses.
      </p>

      <div className={styles.mapContainer} aria-label="Warehouse map">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          role="img"
          aria-label="Map showing user location and warehouses"
        >
          {/* Draw lines from user to all warehouses */}
          {warehouses.map((wh) => {
            const pos = project(wh.lat, wh.lng);
            const isNearest = wh.id === nearestWarehouseId;
            return (
              <line
                key={wh.id}
                x1={userPos.x}
                y1={userPos.y}
                x2={pos.x}
                y2={pos.y}
                stroke={isNearest ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={isNearest ? 2 : 1}
                strokeDasharray={isNearest ? '0' : '4 3'}
                opacity={isNearest ? 1 : 0.5}
              />
            );
          })}

          {/* Warehouse markers */}
          {warehouses.map((wh) => {
            const pos = project(wh.lat, wh.lng);
            const isNearest = wh.id === nearestWarehouseId;
            const distKm = Math.round(
              calculateDistance(userLocation.lat, userLocation.lng, wh.lat, wh.lng)
            );
            return (
              <g key={wh.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isNearest ? 10 : 7}
                  fill={isNearest ? '#f59e0b' : '#64748b'}
                  stroke={isNearest ? '#b45309' : '#475569'}
                  strokeWidth={1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y - 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isNearest ? '#92400e' : '#475569'}
                  fontWeight={isNearest ? '700' : '400'}
                >
                  {wh.city} ({distKm} km)
                </text>
              </g>
            );
          })}

          {/* User marker */}
          <circle cx={userPos.x} cy={userPos.y} r={8} fill="#6366f1" stroke="#4338ca" strokeWidth={2} />
          <text x={userPos.x} y={userPos.y - 13} textAnchor="middle" fontSize="10" fill="#4338ca" fontWeight="700">
            You
          </text>
        </svg>
      </div>

      <div className={styles.mapLegend}>
        <span><span className={styles.legendDot} style={{ background: '#6366f1' }} /> Your location</span>
        <span><span className={styles.legendDot} style={{ background: '#f59e0b' }} /> Nearest warehouse</span>
        <span><span className={styles.legendDot} style={{ background: '#64748b' }} /> Other warehouses</span>
      </div>
    </div>
  );
}
