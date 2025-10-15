import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CITIES } from '../data/cities';
import { City } from '../types';

interface AddressAutocompleteProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (city: City) => void;
  label: string;
  placeholder?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  label,
  placeholder = '',
}) => {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(() => {
    if (!value) return [];
    const lowercasedValue = value.toLowerCase();
    return CITIES.filter(
      city =>
        city.name.toLowerCase().includes(lowercasedValue) ||
        city.country.toLowerCase().includes(lowercasedValue)
    ).slice(0, 5); // Limit to top 5 suggestions
  }, [value]);

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
    onSelect(city);
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