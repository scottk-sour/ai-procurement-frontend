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
  const API_URL = process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

  // Extract the status from the query parameters, e.g. ?status=pending
  const status = searchParams.get('status') || 'all';

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user information from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user._id || user.id;
        
        if (!userId) {
          throw new Error('User not authenticated. Please log in again.');
        }

        // ✅ Use the correct endpoint from backend logs: /api/quotes/requests
        const endpoint = `/api/quotes/requests?userId=${userId}&page=1&limit=100`;
        console.log(`🔍 Fetching quotes from: ${API_URL}${endpoint}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Raw response data:', data);

        // ✅ Handle the response structure from your backend
        let quotesData = data.quotes || data.data || data || [];
        
        // ✅ Filter by status if not 'all'
        if (status && status !== 'all') {
          quotesData = quotesData.filter(quote => quote.status === status);
        }
        
        console.log(`✅ Filtered quotes (status: ${status}):`, quotesData);
        setQuotes(Array.isArray(quotesData) ? quotesData : []);

      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err.message || 'An error occurred while fetching quotes.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [status, API_URL, navigate]);

  const handleStatusFilter = (newStatus) => {
    navigate(`/quote-details?status=${newStatus}`);
  };

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
          <p>No quotes found {status !== 'all' ? `with status "${status}"` : ''}.</p>
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
          <li key={quote._id || quote.id} className="quote-details-item">
            <div className="quote-header">
              <h3>{quote.companyName || 'Unknown Company'}</h3>
              <span className={`status-badge ${quote.status}`}>
                {capitaliseFirstLetter(quote.status)}
              </span>
            </div>
            <div className="quote-details">
              <p><strong>ID:</strong> {quote._id || quote.id}</p>
              <p><strong>Contact:</strong> {quote.contactName}</p>
              <p><strong>Email:</strong> {quote.email}</p>
              <p><strong>Service:</strong> {quote.serviceType}</p>
              <p><strong>Industry:</strong> {quote.industryType}</p>
              <p><strong>Monthly Volume:</strong> {quote.monthlyVolume?.total || 'N/A'} pages</p>
              <p><strong>Budget:</strong> £{quote.budget?.maxLeasePrice || 'N/A'}/month</p>
              <p><strong>Location:</strong> {quote.location?.postcode}</p>
              <p><strong>Submitted:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
              {quote.quotes && quote.quotes.length > 0 && (
                <p><strong>Vendor Quotes:</strong> {quote.quotes.length}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="quote-details-container">
      <h1 className="quote-details-header">
        Quote Requests: {capitaliseFirstLetter(status) || 'Loading...'}
      </h1>
      
      {/* Status Filter Buttons */}
      <div className="status-filters" style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => handleStatusFilter('all')}
          className={status === 'all' ? 'active' : ''}
        >
          All
        </button>
        <button 
          onClick={() => handleStatusFilter('pending')}
          className={status === 'pending' ? 'active' : ''}
        >
          Pending
        </button>
        <button 
          onClick={() => handleStatusFilter('created')}
          className={status === 'created' ? 'active' : ''}
        >
          Created
        </button>
        <button 
          onClick={() => handleStatusFilter('completed')}
          className={status === 'completed' ? 'active' : ''}
        >
          Completed
        </button>
      </div>

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
          Status Parameter: {status}
          <br />
          Correct Endpoint: {API_URL}/api/quotes/requests?userId=...
          <br />
          Total Quotes Found: {quotes.length}
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
