import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuoteFunnel.css';

const QuoteFunnel = ({ data = { created: 0, pending: 0, won: 0, lost: 0 } }) => {
  const navigate = useNavigate();

  const handleNavigation = (status) => {
    navigate(`/quotes?status=${status}`);
  };

  return (
    <div className="quote-funnel">
      <h3>Quote Funnel</h3>
      {data ? (
        <ul>
          {Object.entries(data).map(([status, count]) => (
            <li
              key={status}
              className="quote-item"
              onClick={() => handleNavigation(status)}
              role="button"
              aria-label={`View ${status} quotes`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
            </li>
          ))}
        </ul>
      ) : (
        <p>No Quote Data</p>
      )}
    </div>
  );
};

export default QuoteFunnel;