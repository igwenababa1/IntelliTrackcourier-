import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CITIES } from '../data/cities';
import { City } from '../types';

interface AddressAutocompleteProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (city: City) => void;
  label: string;
  placeholder?: string;
  error?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  label,
  placeholder = '',
  error,
}) => {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const isStreet = label.toLowerCase().includes('street');

  const filteredCities = useMemo(() => {
    if (!value || isStreet) return [];
    const lowercasedValue = value.toLowerCase();
    return CITIES.filter(
      city =>
        city.name.toLowerCase().includes(lowercasedValue) ||
        city.country.toLowerCase().includes(lowercasedValue)
    ).slice(0, 5); // Limit to top 5 suggestions
  }, [value, isStreet]);

  useEffect(() => {
    if (isStreet && value.length > 0) {
      // Real-time validation for street address
      const streetRegex = /^\d+\s+[a-zA-Z0-9\s.-]+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|ln|lane|dr|drive|ct|court|pl|place|apt|apartment|suite|way|terrace|pkwy|parkway|aly|alley|cir|circle|cove|cv|hwy|highway|sq|square|trl|trail)\b.*$/i;
      if (!streetRegex.test(value.trim())) {
        setInternalError("Please enter a valid format: Number, Name, Type (e.g., '123 Main St')");
      } else {
        setInternalError(null);
      }
    } else {
      setInternalError(null);
    }
  }, [value, isStreet]);

  useEffect(() => {
    if (value.length > 0 && filteredCities.length > 0) {
      setSuggestions(filteredCities);
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  }, [value, filteredCities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (city: City) => {
    if (onSelect) onSelect(city);
    setIsDropdownVisible(false);
  };

  return (
    <div className="form-field" ref={containerRef}>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete="off" // Disable native browser autocomplete
        onFocus={() => {
            if (value.length > 0 && filteredCities.length > 0) {
                setIsDropdownVisible(true);
            }
        }}
      />
      {error && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
      {internalError && !error && <span className="warning-text" style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{internalError}</span>}
      {isDropdownVisible && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map(city => (
            <li
              key={`${city.name}-${city.country}`}
              className="autocomplete-suggestion"
              onClick={() => handleSelect(city)}
            >
              {city.name}<span>{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;