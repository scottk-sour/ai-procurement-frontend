// src/components/QuoteFunnel.js
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./QuoteFunnel.css";

const QuoteFunnel = ({
  data = { created: 0, pending: 0, matched: 0, completed: 0 },
  statusLabels = {
    created: "Created",
    pending: "Pending",
    matched: "Matched",
    completed: "Completed",
  },
  isLoading = false,
}) => {
  const navigate = useNavigate();

  // Memoize funnelData to prevent unnecessary re-renders
  const funnelData = useMemo(() => ({
    created: Math.max(Number(data.created) || 0, 0),
    pending: Math.max(Number(data.pending) || 0, 0),
    matched: Math.max(Number(data.matched) || 0, 0),
    completed: Math.max(Number(data.completed) || 0, 0),
  }), [data]);

  // Handle navigation on click
  const handleNavigation = useCallback((status) => {
    navigate(`/quotes?status=${status}`);
  }, [navigate]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e, status) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigation(status);
    }
  }, [handleNavigation]);

  // Check if all counts are zero
  const isEmpty = Object.values(funnelData).every((count) => count === 0);

  if (isLoading) {
    return (
      <div className="quote-funnel" aria-live="polite">
        <h3>Quote Funnel</h3>
        <div className="funnel-loading">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="quote-funnel" aria-live="polite">
        <h3>Quote Funnel</h3>
        <div className="funnel-empty">
          <p className="no-data">No quote data available. Start by requesting a quote!</p>
          <button
            className="request-quote-button"
            onClick={() => navigate("/request-quote")}
            aria-label="Request a new quote to start tracking"
          >
            Request Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-funnel" aria-live="polite">
      <h3>Quote Funnel</h3>
      <div className="funnel-container">
        {Object.entries(funnelData).map(([status, count], index) => (
          <div
            key={status}
            className={`quote-step quote-${status}`}
            style={{ width: `${100 - index * 20}%`, "--index": index }}
            onClick={() => handleNavigation(status)}
            onKeyDown={(e) => handleKeyDown(e, status)}
            role="button"
            tabIndex={0}
            aria-label={`View ${statusLabels[status] || status} quotes with ${count} items`}
            aria-describedby={`quote-${status}-count`}
          >
            <span className="step-label">{statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span id={`quote-${status}-count`} className="step-count">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

QuoteFunnel.propTypes = {
  data: PropTypes.shape({
    created: PropTypes.number,
    pending: PropTypes.number,
    matched: PropTypes.number,
    completed: PropTypes.number,
  }),
  statusLabels: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default QuoteFunnel;