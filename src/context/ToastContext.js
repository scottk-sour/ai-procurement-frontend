// src/context/ToastContext.js
// Enhanced Toast notification system with TendorAI styling

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Toast.css';

const ToastContext = createContext();

// Toast duration in milliseconds
const TOAST_DURATION = 5000;

// Icon mapping for toast types
const toastIcons = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

// Default titles for toast types
const defaultTitles = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef({});
  const pausedTimeRefs = useRef({});

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  const removeToast = useCallback((id) => {
    // Add exiting class for animation
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, exiting: true } : t
    ));

    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
        delete timeoutRefs.current[id];
      }
      delete pausedTimeRefs.current[id];
    }, 200);
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const { title, duration = TOAST_DURATION } = options;

    const toast = {
      id,
      message,
      type,
      title: title || defaultTitles[type] || defaultTitles.info,
      createdAt: Date.now(),
      duration,
      exiting: false,
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    if (duration > 0) {
      timeoutRefs.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
      pausedTimeRefs.current[id] = { remaining: duration };
    }

    return id;
  }, [removeToast]);

  // Pause toast timer on hover
  const pauseToast = useCallback((id) => {
    if (timeoutRefs.current[id] && pausedTimeRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      const elapsed = Date.now() - (toasts.find(t => t.id === id)?.createdAt || Date.now());
      pausedTimeRefs.current[id].remaining = Math.max(0, pausedTimeRefs.current[id].remaining - elapsed);
    }
  }, [toasts]);

  // Resume toast timer
  const resumeToast = useCallback((id) => {
    if (pausedTimeRefs.current[id] && pausedTimeRefs.current[id].remaining > 0) {
      timeoutRefs.current[id] = setTimeout(() => {
        removeToast(id);
      }, pausedTimeRefs.current[id].remaining);
    }
  }, [removeToast]);

  // Convenience methods
  const success = useCallback((message, options) => showToast(message, 'success', options), [showToast]);
  const error = useCallback((message, options) => showToast(message, 'error', options), [showToast]);
  const warning = useCallback((message, options) => showToast(message, 'warning', options), [showToast]);
  const info = useCallback((message, options) => showToast(message, 'info', options), [showToast]);

  return (
    <ToastContext.Provider value={{
      showToast,
      removeToast,
      toasts,
      success,
      error,
      warning,
      info,
    }}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
        {toasts.map(toast => {
          const Icon = toastIcons[toast.type] || toastIcons.info;

          return (
            <div
              key={toast.id}
              className={`toast toast--${toast.type}${toast.exiting ? ' toast--exiting' : ''}`}
              onClick={() => removeToast(toast.id)}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
              role="alert"
            >
              <div className="toast__icon">
                <Icon />
              </div>

              <div className="toast__content">
                <div className="toast__title">{toast.title}</div>
                <div className="toast__message">{toast.message}</div>
              </div>

              <button
                className="toast__close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                aria-label="Dismiss notification"
              >
                <FaTimes />
              </button>

              {/* Progress bar */}
              {toast.duration > 0 && !toast.exiting && (
                <div
                  className="toast__progress"
                  style={{ animationDuration: `${toast.duration}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastContext;
