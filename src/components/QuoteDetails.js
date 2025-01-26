import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './QuoteDetails.css';

const capitaliseFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const QuoteDetails = () => {
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract the status from the query parameters, e.g. ?status=created
  const status = searchParams.get('status');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!status) {
          throw new Error('Status parameter missing.');
        }

        // Replace with your actual endpoint for fetching quotes by status
        const response = await fetch(`http://localhost:5000/api/quotes?status=${status}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch quotes with status: ${status}`);
        }

        const data = await response.json();
        setQuotes(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching quotes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [status]);

  const renderContent = () => {
    if (loading) {
      return (
        <p className="quote-details-body loading">
          <span className="spinner" />
          Loading quotes...
        </p>
      );
    }

    if (error) {
      return <p className="quote-details-body error">{error}</p>;
    }

    if (quotes.length === 0) {
      return <p className="quote-details-body">No quotes found for this status.</p>;
    }

    return (
      <ul className="quote-details-list">
        {quotes.map((quote) => (
          <li key={quote.id} className="quote-details-item">
            <p><strong>ID:</strong> {quote.id}</p>
            <p><strong>Vendor:</strong> {quote.vendorName}</p>
            <p><strong>Value:</strong> £{quote.value.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="quote-details-container">
      <h1 className="quote-details-header">
        Quotes: {capitaliseFirstLetter(status)}
      </h1>
      {renderContent()}
    </div>
  );
};

export default QuoteDetails;
