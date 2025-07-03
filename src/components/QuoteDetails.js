import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './QuoteDetails.css';

const capitaliseFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const QuoteDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Define API URL based on environment
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Extract the status from the query parameters, e.g. ?status=created
  const status = searchParams.get('status');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!status) {
          // ✅ Instead of throwing an error, redirect to dashboard with helpful message
          console.warn('No status parameter provided, redirecting to dashboard');
          navigate('/dashboard?message=Please select a quote status to view quotes');
          return;
        }

        // ✅ Use environment variable for API URL
        const response = await fetch(`${API_URL}/api/quotes?status=${status}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quotes with status: ${status}`);
        }

        const data = await response.json();
        setQuotes(data);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err.message || 'An error occurred while fetching quotes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [status, API_URL, navigate]);

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
      return (
        <div className="quote-details-body error">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (quotes.length === 0) {
      return (
        <div className="quote-details-body">
          <p>No quotes found for this status.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      );
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
        Quotes: {capitaliseFirstLetter(status) || 'Loading...'}
      </h1>
      {renderContent()}
      
      {/* ✅ Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            fontSize: "12px",
            borderRadius: "4px",
          }}
        >
          <strong>Debug Info:</strong>
          <br />
          API_URL: {API_URL}
          <br />
          Status Parameter: {status || 'Missing'}
          <br />
          Quotes Endpoint: {API_URL}/api/quotes?status={status}
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
