import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';

const ConnectivityNotification = () => {
  const [connectionState, setConnectionState] = useState(navigator.onLine ? 'online' : 'offline');
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setConnectionState('online');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    };
    
    const handleOffline = () => {
      setConnectionState('offline');
      setShowNotification(true);
    };
    
    // Function to check connection quality
    const checkConnectionQuality = () => {
      if (!navigator.onLine) return;
      
      // Use the Navigation Timing API to estimate connection quality
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        // Check if we have connection info
        if (connection.effectiveType === '2g' || connection.downlink < 0.5) {
          setConnectionState('poor');
          setShowNotification(true);
        }
      } else {
        // Fallback: Use a ping test to check connection quality
        const start = Date.now();
        fetch('/ping', { method: 'HEAD', cache: 'no-store' })
          .then(response => {
            const latency = Date.now() - start;
            if (latency > 3000) {
              setConnectionState('poor');
              setShowNotification(true);
            }
          })
          .catch(() => {
            // Connection failed
            if (navigator.onLine) {
              setConnectionState('poor');
              setShowNotification(true);
            }
          });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection quality periodically
    const intervalId = setInterval(checkConnectionQuality, 10000);
    
    // Show notification immediately if offline at mount
    if (!navigator.onLine) {
      setShowNotification(true);
    } else {
      checkConnectionQuality();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  
  const handleClose = () => {
    if (connectionState !== 'offline') {
      setShowNotification(false);
    }
  };
  
  if (!showNotification && connectionState !== 'offline') return null;
  
  // Configuration for different connection states
  const config = {
    online: {
      variant: "success",
      borderColor: "border-success",
      bgColor: "#198754",
      icon: (
        <svg
          width="24" 
          height="24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      title: "You're online now",
      message: "Internet is connected."
    },
    poor: {
      variant: "warning",
      borderColor: "border-warning",
      bgColor: "#ffc107",
      icon: (
        <svg
          width="24" 
          height="24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: "Bad connection",
      message: "Your internet connection is unstable."
    },
    offline: {
      variant: "secondary",
      borderColor: "border-secondary",
      bgColor: "#6c757d",
      icon: (
        <svg
          width="24" 
          height="24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      ),
      title: "No signal",
      message: "You're completely offline. Check your connection."
    }
  };
  
  const currentConfig = config[connectionState];
  
  return (
    <div className="connectivity-notification" style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1050,
      maxWidth: '400px',
      minWidth: '320px'
    }}>
      <Alert
        variant={currentConfig.variant}
        className={`d-flex align-items-center ${currentConfig.borderColor}`}
        style={{
          borderLeftWidth: '4px',
          animation: 'fadeIn 0.3s',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className={`rounded-circle p-2 me-3 text-white d-flex justify-content-center align-items-center`}
          style={{
            backgroundColor: currentConfig.bgColor,
            width: '40px',
            height: '40px'
          }}
        >
          {currentConfig.icon}
        </div>
        <div>
          <h5 className="mb-0">
            {currentConfig.title}
          </h5>
          <p className="mb-0 text-muted small">
            {currentConfig.message}
          </p>
        </div>
        {connectionState !== 'offline' && (
          <Button
            variant="light"
            size="sm"
            className="ms-auto"
            onClick={handleClose}
            style={{ padding: '0.375rem' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </Alert>
    </div>
  );
};

export default ConnectivityNotification;