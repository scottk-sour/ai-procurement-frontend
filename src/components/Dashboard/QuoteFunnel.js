import React from 'react';
import { useNavigate } from 'react-router-dom';

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
          <li
            className="quote-item"
            onClick={() => handleNavigation('created')}
            role="button"
            aria-label="View created quotes"
          >
            Created: {data.created}
          </li>
          <li
            className="quote-item"
            onClick={() => handleNavigation('pending')}
            role="button"
            aria-label="View pending quotes"
          >
            Pending: {data.pending}
          </li>
          <li
            className="quote-item"
            onClick={() => handleNavigation('won')}
            role="button"
            aria-label="View won quotes"
          >
            Won: {data.won}
          </li>
          <li
            className="quote-item"
            onClick={() => handleNavigation('lost')}
            role="button"
            aria-label="View lost quotes"
          >
            Lost: {data.lost}
          </li>
        </ul>
      ) : (
        <p>No Quote Data</p>
      )}
    </div>
  );
};

export default QuoteFunnel;
