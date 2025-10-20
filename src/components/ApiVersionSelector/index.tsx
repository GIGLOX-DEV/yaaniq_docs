import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface ApiVersion {
  version: string;
  label: string;
  releaseDate: string;
  status: 'current' | 'deprecated' | 'beta';
}

const API_VERSIONS: ApiVersion[] = [
  {
    version: '1.0.0',
    label: 'v1.0.0',
    releaseDate: 'October 2024',
    status: 'current',
  },
  {
    version: '1.1.0',
    label: 'v1.1.0',
    releaseDate: 'October 2025',
    status: 'beta',
  },
];

export default function ApiVersionSelector(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(API_VERSIONS[0]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('yaniq-api-version');
    if (saved) {
      const found = API_VERSIONS.find((v) => v.version === saved);
      if (found) {
        setSelectedVersion(found);
      }
    }
  }, []);

  const handleVersionSelect = (version: ApiVersion) => {
    setSelectedVersion(version);
    setIsOpen(false);

    // Store selection in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('yaniq-api-version', version.version);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <span className={styles.badgeCurrent}>Current</span>;
      case 'beta':
        return <span className={styles.badgeBeta}>Beta</span>;
      case 'deprecated':
        return <span className={styles.badgeDeprecated}>Deprecated</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.versionSelector}>
      <button
        className={styles.versionButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select API version"
        aria-expanded={isOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={styles.icon}
        >
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 12H7V7h2v5zm0-6H7V4h2v2z" />
        </svg>
        <span className={styles.versionLabel}>API {selectedVersion.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4>Select API Version</h4>
          </div>
          <div className={styles.versionList}>
            {API_VERSIONS.map((version) => (
              <button
                key={version.version}
                className={`${styles.versionItem} ${
                  selectedVersion.version === version.version ? styles.versionItemActive : ''
                }`}
                onClick={() => handleVersionSelect(version)}
              >
                <div className={styles.versionInfo}>
                  <div className={styles.versionHeader}>
                    <span className={styles.versionNumber}>{version.label}</span>
                    {getStatusBadge(version.status)}
                  </div>
                  <span className={styles.versionDate}>{version.releaseDate}</span>
                </div>
                {selectedVersion.version === version.version && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className={styles.checkIcon}
                  >
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className={styles.dropdownFooter}>
            <Link to="/docs/libraries/common-api-usage-guide" className={styles.footerLink}>
              View API Documentation →
            </Link>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
