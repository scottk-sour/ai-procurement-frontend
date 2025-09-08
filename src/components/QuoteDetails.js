import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './QuoteDetails.css';

const capitaliseFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to get user ID from either field name
const getUserId = (record) => {
  return record.userId || record.submittedBy;
};

const QuoteDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define API URL based on environment
  const API_URL = process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

  // Extract the status from the query parameters, e.g. ?status=pending
  const status = searchParams.get('status') || 'all';
  const quoteId = searchParams.get('Id');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // FIXED: First check if userProfile was passed in navigation state
        const navigationUserProfile = location.state?.userProfile;
        const navigationQuotes = location.state?.quotes;
        const navigationQuoteData = location.state?.quoteData;
        
        console.log('Navigation state:', location.state);
        
        // If we have quotes from navigation state and a specific quote ID, use those
        if (quoteId && navigationQuotes && navigationQuotes.length > 0) {
          console.log('Using quotes from navigation state:', navigationQuotes);
          setQuotes(navigationQuotes);
          setLoading(false);
          return;
        }
        
        // If we have a single quote from navigation state, use that
        if (quoteId && navigationQuoteData) {
          console.log('Using single quote from navigation state:', navigationQuoteData);
          setQuotes([navigationQuoteData]);
          setLoading(false);
          return;
        }
        
        let currentUserId;
        
        // Use userProfile from navigation state if available
        if (navigationUserProfile) {
          console.log('Using userProfile from navigation state:', navigationUserProfile);
          currentUserId = navigationUserProfile._id || navigationUserProfile.userId || navigationUserProfile.id;
        } else {
          // Fallback to auth context
          currentUserId = auth?.user?.userId;
          
          if (!currentUserId) {
            console.log('Getting user profile from API...');
            
            const userResponse = await fetch(`${API_URL}/api/users/profile`, {
              headers: {
                'Authorization': `Bearer ${auth?.token || localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
            });

            if (!userResponse.ok) {
              throw new Error('Failed to get user profile. Please log in again.');
            }

            const userData = await userResponse.json();
            console.log('Complete userData structure:', JSON.stringify(userData, null, 2));
            
            const profileUserId = userData.user?.userId || userData.user?._id || userData.userId || userData._id || userData.id;
            
            if (!profileUserId) {
              console.error('User data structure:', userData);
              throw new Error('User ID not found in profile. Please log in again.');
            }
            
            console.log('Got userId from profile:', profileUserId);
            currentUserId = profileUserId;
          } else {
            console.log('Got userId from auth context:', currentUserId);
          }
        }

        if (!currentUserId) {
          throw new Error('User ID not found. Please log in again.');
        }

        // If we have a specific quote ID, try to fetch just that quote first
        if (quoteId) {
          try {
            console.log(`Fetching specific quote: ${quoteId}`);
            const specificQuoteResponse = await fetch(`${API_URL}/api/quotes/requests/${quoteId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.token || localStorage.getItem('token')}`,
              },
            });

            if (specificQuoteResponse.ok) {
              const specificQuoteData = await specificQuoteResponse.json();
              console.log('Specific quote data:', specificQuoteData);
              
              // Check if this quote belongs to the current user
              const quoteUserId = getUserId(specificQuoteData);
              if (quoteUserId === currentUserId) {
                setQuotes([specificQuoteData]);
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.log('Failed to fetch specific quote, falling back to general fetch');
          }
        }

        // Fallback: fetch all quotes for the user
        const endpoint = `/api/quotes/requests?userId=${currentUserId}&submittedBy=${currentUserId}&page=1&limit=100`;
        console.log(`Fetching quotes from: ${API_URL}${endpoint}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.token || localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw response data:', data);

        let quotesData = data.requests || data.data || data.quotes || data || [];
        
        // Filter quotes to only show user's own requests
        const userQuotes = quotesData.filter(quote => {
          const quoteUserId = getUserId(quote);
          return quoteUserId === currentUserId;
        });
        
        // Filter by status if not 'all'
        let filteredQuotes = userQuotes;
        if (status && status !== 'all') {
          filteredQuotes = userQuotes.filter(quote => quote.status === status);
        }
        
        console.log(`Filtered quotes (status: ${status}):`, filteredQuotes);
        setQuotes(Array.isArray(filteredQuotes) ? filteredQuotes : []);

      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err.message || 'An error occurred while fetching quotes.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated
    if (auth?.isAuthenticated) {
      fetchQuotes();
    } else {
      navigate('/login', { replace: true });
    }
  }, [status, quoteId, API_URL, navigate, auth, location.state]);

  const handleStatusFilter = (newStatus) => {
    navigate(`/quote-details?status=${newStatus}`);
  };

  const renderQuoteActions = (quote) => {
    if (quote.quotes && quote.quotes.length > 0) {
      return (
        <div className="quote-actions">
          <button 
            onClick={() => navigate(`/quote-comparison/${quote._id}`)}
            className="primary-button"
          >
            View {quote.quotes.length} Quote{quote.quotes.length > 1 ? 's' : ''}
          </button>
        </div>
      );
    }
    
    if (quote.status === 'matched') {
      return (
        <div className="quote-actions">
          <p className="ai-match-info">AI has found {quote.aiAnalysis?.recommendations?.length || 'several'} matches for your requirements</p>
          <button 
            onClick={() => navigate(`/quote-comparison/${quote._id}`)}
            className="primary-button"
          >
            View AI Recommendations
          </button>
        </div>
      );
    }
    
    return null;
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
            onClick={() => navigate('/request-quote')}
            className="primary-button"
            style={{ marginRight: '10px' }}
          >
            Create New Quote Request
          </button>
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
              <p><strong>Employees:</strong> {quote.numEmployees || 'N/A'}</p>
              <p><strong>Monthly Volume:</strong> {quote.monthlyVolume?.total || 'N/A'} pages</p>
              <p><strong>Budget:</strong> £{quote.budget?.maxLeasePrice || 'N/A'}/month</p>
              <p><strong>Location:</strong> {quote.location?.postcode}</p>
              <p><strong>Submitted:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
              
              {/* AI Analysis Information */}
              {quote.status === 'matched' && quote.aiAnalysis?.processed && (
                <div className="ai-analysis-summary">
                  <p><strong>AI Analysis:</strong> Complete</p>
                  {quote.aiAnalysis.volumeCategory && (
                    <p><strong>Volume Category:</strong> {quote.aiAnalysis.volumeCategory}</p>
                  )}
                  {quote.aiAnalysis.recommendations?.length > 0 && (
                    <p><strong>AI Recommendations:</strong> {quote.aiAnalysis.recommendations.length} matches found</p>
                  )}
                </div>
              )}
              
              {/* Quote/Vendor Information */}
              {quote.quotes && quote.quotes.length > 0 ? (
                <p><strong>Vendor Quotes:</strong> {quote.quotes.length} quote{quote.quotes.length > 1 ? 's' : ''} received</p>
              ) : quote.status === 'matched' ? (
                <p><strong>Status:</strong> AI matching complete - quotes being generated</p>
              ) : null}
              
              {/* Actions based on quote status */}
              {renderQuoteActions(quote)}
              
              {/* Debug info in development */}
              {process.env.NODE_ENV === "development" && (
                <p style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Debug - User ID:</strong> {getUserId(quote)} 
                  {quote.userId && quote.submittedBy ? ' (both fields)' : quote.userId ? ' (userId only)' : ' (submittedBy only)'}
                </p>
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
        {quoteId ? 'Quote Request Details' : `Quote Requests: ${capitaliseFirstLetter(status) || 'Loading...'}`}
      </h1>
      
      {/* Status Filter Buttons - only show if not viewing a specific quote */}
      {!quoteId && (
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
            onClick={() => handleStatusFilter('matched')}
            className={status === 'matched' ? 'active' : ''}
          >
            Matched
          </button>
          <button 
            onClick={() => handleStatusFilter('quotes_generated')}
            className={status === 'quotes_generated' ? 'active' : ''}
          >
            Quotes Ready
          </button>
          <button 
            onClick={() => handleStatusFilter('completed')}
            className={status === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
        </div>
      )}

      {renderContent()}
      
      {/* Navigation buttons */}
      <div className="navigation-buttons" style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          Back to Dashboard
        </button>
        {!quoteId && (
          <button 
            onClick={() => navigate('/request-quote')}
            className="primary-button"
            style={{ marginLeft: '10px' }}
          >
            Create New Quote Request
          </button>
        )}
      </div>
      
      {/* Debug info in development */}
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
          Quote ID: {quoteId || 'None'}
          <br />
          Auth User ID: {auth?.user?.userId || 'Not found'}
          <br />
          Navigation State: {location.state ? 'Present' : 'Not present'}
          <br />
          Total Quotes Found: {quotes.length}
          <br />
          Navigation Quotes: {location.state?.quotes?.length || 'None'}
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
