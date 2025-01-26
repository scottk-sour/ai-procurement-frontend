import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './QuoteDetails.css';

const QuoteDetails = () => {
  const { status } = useParams(); // Get the status from the URL parameters
  const [quotes, setQuotes] = useState([]); // State to hold fetched quotes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint for fetching quotes by status
        const response = await fetch(`http://localhost:5000/api/quotes?status=${status}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        const data = await response.json();
        setQuotes(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching quotes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [status]);

  return (
    <div className="quote-details-container">
      <h1 className="quote-details-header">
        Quotes: {status.charAt(0).toUpperCase() + status.slice(1)}
      </h1>

      {loading ? (
        <p className="quote-details-body">Loading quotes...</p>
      ) : error ? (
        <p className="quote-details-body error">{error}</p>
      ) : quotes.length === 0 ? (
        <p className="quote-details-body">No quotes found for this status.</p>
      ) : (
        <ul className="quote-details-list">
          {quotes.map((quote) => (
            <li key={quote.id} className="quote-details-item">
              <p><strong>ID:</strong> {quote.id}</p>
              <p><strong>Vendor:</strong> {quote.vendorName}</p>
              <p><strong>Value:</strong> ${quote.value}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuoteDetails;
