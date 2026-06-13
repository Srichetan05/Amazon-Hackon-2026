import { useState, useEffect, useRef } from 'react';
import styles from '../SmartRouting.module.css';

/**
 * UserLocationInput — searchable location picker backed by the free
 * OpenStreetMap Nominatim geocoding API.
 *
 * The user types any Indian city / area / address and gets a live
 * dropdown of matching results. No API key required.
 */
export default function UserLocationInput({ onLocationSet }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch suggestions whenever query changes (debounced 400 ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(query)}` +
          `&countrycodes=in` +    // restrict to India
          `&format=json` +
          `&addressdetails=1` +
          `&limit=8`;

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en' },
        });

        if (!res.ok) throw new Error('Search failed. Please try again.');

        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch (err) {
        setError(err.message || 'Could not reach location service.');
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(place) {
    const label = place.display_name.split(',').slice(0, 3).join(', ');
    setQuery(label);
    setSelected(place);
    setSuggestions([]);
    setShowDropdown(false);
    onLocationSet({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      label,
    });
  }

  function handleClear() {
    setQuery('');
    setSelected(null);
    setSuggestions([]);
    setShowDropdown(false);
    setError('');
  }

  // Build a short readable label from Nominatim address details
  function formatLabel(place) {
    const a = place.address || {};
    const parts = [
      a.city || a.town || a.village || a.county || a.state_district,
      a.state,
    ].filter(Boolean);
    return parts.join(', ') || place.display_name.split(',').slice(0, 2).join(', ');
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <span className={styles.stepBadge}>2</span> Your Location
      </h2>
      <p className={styles.cardSubtitle}>
        Search for any city, area, or locality in India. We&apos;ll find the
        nearest warehouse and calculate the shipping cost from your location.
      </p>

      <div className={styles.searchWrapper} ref={containerRef}>
        <div className={styles.searchInputRow}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="e.g. Koramangala, Bengaluru or Lajpat Nagar, Delhi…"
            aria-label="Search for your location"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {isLoading && <span className={styles.searchSpinner} aria-label="Loading…" />}
          {query && !isLoading && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Clear location"
            >
              ✕
            </button>
          )}
        </div>

        {showDropdown && suggestions.length > 0 && (
          <ul
            className={styles.suggestionList}
            role="listbox"
            aria-label="Location suggestions"
          >
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                role="option"
                className={styles.suggestionItem}
                onMouseDown={() => handleSelect(place)}
              >
                <span className={styles.suggestionIcon} aria-hidden="true">
                  {getPlaceIcon(place.type)}
                </span>
                <div className={styles.suggestionText}>
                  <span className={styles.suggestionMain}>
                    {formatLabel(place)}
                  </span>
                  <span className={styles.suggestionSub}>
                    {place.display_name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showDropdown && suggestions.length === 0 && !isLoading && query.length >= 2 && (
          <div className={styles.noResults}>No locations found for &ldquo;{query}&rdquo;</div>
        )}
      </div>

      {error && (
        <p className={styles.errorText} role="alert">{error}</p>
      )}

      {selected && (
        <div className={styles.selectedLocation}>
          <span aria-hidden="true">📍</span>
          <div>
            <span className={styles.selectedLabel}>{query}</span>
            <span className={styles.selectedCoords}>
              {parseFloat(selected.lat).toFixed(4)}°N,{' '}
              {parseFloat(selected.lon).toFixed(4)}°E
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlaceIcon(type) {
  const icons = {
    city: '🏙️',
    town: '🏘️',
    village: '🏡',
    suburb: '🏠',
    neighbourhood: '🏠',
    administrative: '🗺️',
    state: '🗺️',
    district: '🗺️',
    railway: '🚉',
    airport: '✈️',
    university: '🎓',
    hospital: '🏥',
  };
  return icons[type] || '📍';
}
