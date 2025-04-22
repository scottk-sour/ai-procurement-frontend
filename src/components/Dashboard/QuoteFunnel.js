// src/components/QuoteFunnel.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./QuoteFunnel.css";

const QuoteFunnel = ({ data = { created: 0, pending: 0, won: 0, lost: 0 } }) => {
  const navigate = useNavigate();

  const handleNavigation = (status) => {
    navigate(`/quotes?status=${status}`);
  };

  return (
    <div className="quote-funnel">
      <h3>Quote Funnel</h3>
      <div className="funnel-container">
        {Object.entries(data).map(([status, count], index) => (
          <div
            key={status}
            className={`quote-step quote-${status}`}
            style={{ width: `${100 - index * 20}%` }}
            onClick={() => handleNavigation(status)}
            role="button"
            aria-label={`View ${status} quotes`}
          >
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuoteFunnel;