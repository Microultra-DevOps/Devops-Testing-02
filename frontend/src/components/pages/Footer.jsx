import React, { useState, useEffect } from 'react';

export const Footer = ({ darkMode }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Theme configuration matching sidebar
  const theme = {
    sidebarBackground: darkMode ? "#1E1E1E" : "rgba(255, 255, 255, 0.95)",
    textPrimary: darkMode ? "#E1E1E1" : "#1e293b",
    accentColor: darkMode ? "#2563eb" : "#10b981",
    border: darkMode ? "#333333" : "rgba(0, 0, 0, 0.1)",
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <footer
      className="border-top shadow-sm"
      style={{
        background: theme.sidebarBackground,
        backdropFilter: 'blur(20px)',
        color: theme.textPrimary,
        borderTopColor: theme.border,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: isMobile ? '16px 12px' : '20px 24px',
        textAlign: 'center',
        fontSize: isMobile ? '0.8rem' : '0.9rem',
        fontWeight: '500',
        lineHeight: isMobile ? '1.4' : '1.5'
      }}
    >
      {isMobile ? (
        // Mobile layout - stacked
        <div>
          <div style={{ marginBottom: '4px' }}>
            Copyright © {new Date().getFullYear()}
          </div>
          <div>
            <span style={{ color: theme.accentColor, fontWeight: '600' }}>
              Sri Lanka Telecom PLC
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
            All rights reserved.
          </div>
        </div>
      ) : (
        // Desktop layout - inline
        <div>
          Copyright © {new Date().getFullYear()}{' '}
          <span style={{ color: theme.accentColor, fontWeight: '600' }}>
            Sri Lanka Telecom PLC
          </span>{' '}
          All rights reserved.
        </div>
      )}
    </footer>
  );
};