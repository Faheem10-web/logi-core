import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem('logicore-cookie-consent');
    if (!consent) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible && !isExiting) {
        handleAction(false);
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, isExiting]);

  const handleAction = (accepted) => {
    const consentData = {
      accepted,
      date: new Date().toISOString()
    };
    
    localStorage.setItem('logicore-cookie-consent', JSON.stringify(consentData));
    
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 250); // Matches fade out duration
  };

  if (!mounted || (!isVisible && !isExiting)) return null;

  return (
    <div 
      className={`cookie-consent-banner ${isExiting ? 'cookie-consent-exit' : 'cookie-consent-enter'}`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      aria-live="polite"
    >
      <div className="cookie-consent-content">
        <h3 id="cookie-consent-title" className="cookie-consent-title">
          <span aria-hidden="true">🍪</span> We use cookies
        </h3>
        <p id="cookie-consent-desc" className="cookie-consent-desc">
          We use cookies to improve your browsing experience, analyze website traffic, and enhance your experience. By clicking "Accept", you agree to our <a href="#privacy" className="cookie-policy-link">Cookie Policy</a>.
        </p>
        <div className="cookie-consent-actions">
          <button 
            className="cookie-btn cookie-btn-primary" 
            onClick={() => handleAction(true)}
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button 
            className="cookie-btn cookie-btn-secondary" 
            onClick={() => handleAction(false)}
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
