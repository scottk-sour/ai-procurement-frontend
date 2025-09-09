import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const QuotesResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  
  const status = searchParams.get('status') || 'all';
  
  useEffect(() => {
    fetchQuotes();
  }, [status]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug info
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('🔍 QuotesResults Debug Info:');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('UserId:', userId);
      console.log('Status param:', status);
      
      setDebugInfo({
        hasToken: !!token,
        tokenLength: token?.length,
        userId,
        status
      });
      
      if (!token || !userId) {
        throw new Error('Missing authentication credentials');
      }

      const url = `https://ai-procurement-backend-q35u.onrender.com/api/quotes/requests?userId=${userId}&submittedBy=${userId}&page=1&limit=50`;
      console.log('🌐 Fetching URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
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
      console.log('📄 Raw API Response:', data);
      
      // Try different possible response structures
      const quotesData = data.requests || data.quotes || data.data || data || [];
      console.log('📋 Extracted quotes:', quotesData);
      console.log('📋 Quotes count:', quotesData.length);
      
      setQuotes(quotesData);
      
    } catch (err) {
      console.error('❌ Error fetching quotes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug rendering
  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Loading Quotes...</h1>
        <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '10px' }}>
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Error Loading Quotes</h1>
        <div style={{ background: '#ffebee', padding: '10px', color: 'red' }}>
          <p><strong>Error:</strong> {error}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '10px' }}>
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        <button onClick={fetchQuotes} style={{ marginTop: '10px', padding: '10px 20px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Quotes Results</h1>
      <p>Status filter: <strong>{status}</strong></p>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <h3>Debug Info:</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <p><strong>Quotes found:</strong> {quotes.length}</p>
      </div>

      {quotes.length === 0 ? (
        <div style={{ background: '#fff3cd', padding: '20px', border: '1px solid #ffeaa7' }}>
          <h3>No quotes found</h3>
          <p>The API returned {quotes.length} quotes.</p>
          <p>Check the debug info above to see what data was returned.</p>
        </div>
      ) : (
        <div>
          <h2>Found {quotes.length} quotes:</h2>
          {quotes.map((quote, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '10px',
              background: 'white'
            }}>
              <h3>Quote #{index + 1}</h3>
              <div style={{ background: '#f9f9f9', padding: '10px' }}>
                <pre>{JSON.stringify(quote, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px' }}>
          Back to Dashboard
        </button>
        <button onClick={fetchQuotes} style={{ padding: '10px 20px', marginLeft: '10px' }}>
          Refresh
        </button>
      </div>
    </div>
  );
};

export default QuotesResults;
