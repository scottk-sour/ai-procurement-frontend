import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const { auth } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define API URL based on environment
  const API_URL = process.env.REACT_APP_API_URL || "https://ai-procurement-backend-q35u.onrender.com";

  // Extract the status from the query parameters, e.g. ?status=pending
  const status = searchParams.get('status') || 'all';

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // FIXED: Use let instead of const to allow reassignment
        let currentUserId = auth?.user?.userId;
        
        if (!currentUserId) {
          console.log('🔍 No userId in auth context, getting user profile...');
          
          // Fallback: Get user profile like UserDashboard does
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
          console.log('🔍 Complete userData structure:', JSON.stringify(userData, null, 2));
          
          // FIXED: Use the same extraction logic as UserDashboard
          const profileUserId = userData.user?.userId || userData.user?._id || userData.userId || userData._id || userData.id;
          
          if (!profileUserId) {
            console.error('❌ User data structure:', userData);
            throw new Error('User ID not found in profile. Please log in again.');
          }
          
          console.log('✅ Got userId from profile:', profileUserId);
          currentUserId = profileUserId; // ✅ Now this works because currentUserId is let, not const
        } else {
          console.log('✅ Got userId from auth context:', currentUserId);
        }

        // FIXED: Use the same API endpoint structure as UserDashboard
        const endpoint = `/api/quotes/requests?userId=${currentUserId}&submittedBy=${currentUserId}&page=1&limit=100`;
        console.log(`🔍 Fetching quotes from: ${API_URL}${endpoint}`);

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
        console.log('✅ Raw response data:', data);

        // FIXED: Handle the response structure like UserDashboard does
        let quotesData = data.requests || data.data || data.quotes || data || [];
        
        // FIXED: Filter quotes to only show user's own requests (same as UserDashboard)
        const userQuotes = quotesData.filter(quote => {
          const quoteUserId = getUserId(quote);
          return quoteUserId === currentUserId;
        });
        
        // Filter by status if not 'all'
        let filteredQuotes = userQuotes;
        if (status && status !== 'all') {
          filteredQuotes = userQuotes.filter(quote => quote.status === status);
        }
        
        console.log(`✅ Filtered quotes (status: ${status}):`, filteredQuotes);
        setQuotes(Array.isArray(filteredQuotes) ? filteredQuotes : []);

      } catch (err) {
        console.error('❌ Error fetching quotes:', err);
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
  }, [status, API_URL, navigate, auth]);

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
              {quote.quotes && quote.quotes.length > 0 && (
                <p><strong>Vendor Quotes:</strong> {quote.quotes.length}</p>
              )}
              {/* Show submission source for debugging */}
              <p><strong>User ID:</strong> {getUserId(quote)} {quote.userId && quote.submittedBy ? '(both fields)' : quote.userId ? '(userId only)' : '(submittedBy only)'}</p>
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
          Auth User ID: {auth?.user?.userId || 'Not found'}
          <br />
          Total Quotes Found: {quotes.length}
        </div>
      )}
    </div>
  );
};

export default QuoteDetails;
