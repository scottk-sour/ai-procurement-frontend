import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const QuotesResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const status = searchParams.get('status') || 'all';
  
  useEffect(() => {
    fetchQuotes();
  }, [status]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('🔍 QuotesResults fetching with:', { userId, status });
      
      if (!token || !userId) {
        throw new Error('Missing authentication credentials');
      }

      const response = await fetch(
        `https://ai-procurement-backend-q35u.onrender.com/api/quotes/requests?userId=${userId}&submittedBy=${userId}&page=1&limit=50`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 API Response:', data);
      
      // Based on your API test results, the data structure is:
      // { success: true, requests: Array(2), data: Array(2), pagination: {...} }
      const quotesData = data.requests || data.data || [];
      console.log('📋 Extracted quotes:', quotesData);
      
      setQuotes(quotesData);
      
    } catch (err) {
      console.error('❌ Error fetching quotes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quoteStatus) => {
    const statusColors = {
      'pending': '#f59e0b',
      'matched': '#10b981',
      'completed': '#3b82f6',
      'rejected': '#ef4444'
    };
    
    return (
      <span 
        style={{ 
          backgroundColor: statusColors[quoteStatus] || '#6b7280',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {quoteStatus?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const filterTabs = [
    { key: 'all', label: 'All Quotes' },
    { key: 'pending', label: 'Pending' },
    { key: 'matched', label: 'Matched' },
    { key: 'completed', label: 'Completed' }
  ];

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading quotes...</h2>
        <p>Fetching your quote requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Error Loading Quotes</h2>
        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
        <button 
          onClick={fetchQuotes}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Quote Requests</h1>
        <button 
          onClick={() => navigate('/request-quote')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + New Quote Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(`/quotes?status=${tab.key}`)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: status === tab.key ? '#3b82f6' : 'none',
              color: status === tab.key ? 'white' : '#6b7280',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: status === tab.key ? '3px solid #3b82f6' : '3px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px' }}>
          <h3>No quotes found</h3>
          <p>
            {status === 'all' 
              ? "You haven't submitted any quote requests yet." 
              : `No ${status} quotes found.`
            }
          </p>
          <button 
            onClick={() => navigate('/request-quote')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Submit Your First Quote Request
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {quotes.map((quote, index) => (
            <div key={quote._id || index} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, flexGrow: 1, marginRight: '10px' }}>
                  {quote.companyName || quote.title || 'Quote Request'}
                </h3>
                {getStatusBadge(quote.status)}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Company:</strong> {quote.companyName || 'N/A'}</p>
                <p><strong>Service:</strong> {quote.serviceType || quote.category || 'N/A'}</p>
                {quote.estimatedPrice && (
                  <p><strong>Estimated Price:</strong> £{quote.estimatedPrice}</p>
                )}
                <p><strong>Submitted:</strong> {
                  quote.createdAt 
                    ? new Date(quote.createdAt).toLocaleDateString()
                    : 'Unknown'
                }</p>
                
                {quote.matchedVendors && quote.matchedVendors.length > 0 && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: '#f0fdf4', 
                    borderRadius: '6px',
                    borderLeft: '4px solid #10b981'
                  }}>
                    <strong>Matched Vendors:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {quote.matchedVendors.map((vendor, idx) => (
                        <li key={idx} style={{ margin: '4px 0', color: '#065f46', fontSize: '0.9rem' }}>
                          {vendor.vendorName} - £{vendor.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => navigate(`/quotes/${quote._id}`)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                {quote.status === 'matched' && (
                  <button 
                    onClick={() => navigate('/compare-vendors', { state: { quote } })}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Compare Vendors
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesResults;
