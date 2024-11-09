// src/components/LanguageSwitcher.js
import { useState } from 'react';

import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setDropdownOpen(false); // Close dropdown after selection
  };
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
    {/* Icon Button to toggle the dropdown */}
    <button
      onClick={toggleDropdown}
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '30px',
        color: '#333',
      }}
      title="Select Language"
    >
      🌐 {/* This represents a language globe icon, can be replaced with any SVG or icon */}
    </button>

    {/* Dropdown Menu */}
    {dropdownOpen && (
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          zIndex: '1000',
        }}
      >
        <button
          onClick={() => changeLanguage('en')}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 20px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#333',
            borderBottom: '1px solid #ddd',
          }}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => changeLanguage('mr')}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px 20px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#333',
          }}
        >
          🇮🇳 Marathi
        </button>
      </div>
    )}
  </div>
  );
};

export default LanguageSwitcher;
