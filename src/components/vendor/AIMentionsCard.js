/**
 * AI Mentions Card Component
 * Displays AI mention analytics for vendors
 * Shows how often AI assistants mentioned their company
 */

import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const AIMentionsCard = ({ vendorId, token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!vendorId) return;

      setLoading(true);
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(
          `${API_URL}/api/analytics/vendor/${vendorId}?period=${period}`,
          { headers }
        );

        if (!res.ok) throw new Error('Failed to fetch analytics');

        const data = await res.json();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [vendorId, period, token]);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ animation: 'pulse 2s infinite' }}>
          <div style={{ height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '40%', marginBottom: '16px' }}></div>
          <div style={{ height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '30%', marginBottom: '16px' }}></div>
          <div style={{ height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white'
      }}>
        <p style={{ opacity: 0.8 }}>{error}</p>
      </div>
    );
  }

  const aiMentions = analytics?.aiMentions || 0;
  const bySource = analytics?.aiMentionsBySource || {};
  const recentQueries = analytics?.recentAiQueries || [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>AI Mentions</h3>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setPeriod('7d')}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: period === '7d' ? 'white' : 'transparent',
              color: period === '7d' ? '#7c3aed' : 'rgba(255,255,255,0.8)'
            }}
          >
            7 days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: period === '30d' ? 'white' : 'transparent',
              color: period === '30d' ? '#7c3aed' : 'rgba(255,255,255,0.8)'
            }}
          >
            30 days
          </button>
        </div>
      </div>

      {/* Main Metric */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <span style={{ fontSize: '48px', fontWeight: '700', lineHeight: 1 }}>{aiMentions}</span>
          {aiMentions > 0 && (
            <span style={{ color: '#86efac', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              AI recommendations
            </span>
          )}
        </div>
        <p style={{ opacity: 0.7, fontSize: '14px', marginTop: '4px' }}>
          Times AI assistants mentioned your company
        </p>
      </div>

      {/* Source Breakdown */}
      {aiMentions > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{bySource.chatgpt || 0}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>ChatGPT</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{bySource.claude || 0}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Claude</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{bySource.perplexity || 0}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Perplexity</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{bySource.other || 0}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Other</div>
          </div>
        </div>
      )}

      {/* Recent Queries */}
      {recentQueries.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '500', opacity: 0.8, marginBottom: '8px' }}>Recent AI Queries</h4>
          <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {recentQueries.slice(0, 5).map((q, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    "{q.query || 'Search query'}"
                  </span>
                  <span style={{ opacity: 0.6, fontSize: '12px', marginLeft: '8px' }}>
                    #{q.position || '?'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', opacity: 0.5 }}>
                  <span style={{ textTransform: 'capitalize' }}>{q.source || 'AI'}</span>
                  <span>{q.timestamp ? new Date(q.timestamp).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {aiMentions === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '12px' }}>
            No AI mentions yet. Improve your visibility:
          </p>
          <ul style={{ opacity: 0.6, fontSize: '13px', listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '4px' }}>• Add more products with pricing</li>
            <li style={{ marginBottom: '4px' }}>• Complete your company description</li>
            <li>• Upgrade to Visible or Verified tier</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIMentionsCard;
