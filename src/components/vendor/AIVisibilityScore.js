/**
 * AI Visibility Score Component
 * Shows vendors how visible they are to AI assistants
 * and encourages them to complete profile / upgrade tier
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIVisibilityScore.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const AIVisibilityScore = ({ token }) => {
  const navigate = useNavigate();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchScore();
  }, [token]);

  const fetchScore = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/visibility/score`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visibility score');
      }

      const result = await response.json();
      if (result.success) {
        setScoreData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load score');
      }
    } catch (err) {
      console.error('Visibility score error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="visibility-score-card loading">
        <div className="score-ring-skeleton"></div>
        <div className="score-text-skeleton"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visibility-score-card error">
        <p>Unable to load visibility score</p>
        <button onClick={fetchScore} className="retry-btn">Try Again</button>
      </div>
    );
  }

  if (!scoreData) return null;

  const { score, maxScore, label, colour, breakdown, recommendations, nextMilestone, tier } = scoreData;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="visibility-score-card">
      <div className="score-header">
        <h3>AI Visibility Score</h3>
        <span
          className="score-info-icon"
          title="This score shows how visible your business is to AI assistants like ChatGPT, Google AI, and Perplexity"
        >
          ?
        </span>
      </div>

      <div className="score-main">
        <div className="score-ring-container">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle
              className="score-ring-bg"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
            />
            <circle
              className="score-ring-progress"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                stroke: colour
              }}
            />
          </svg>
          <div className="score-value">
            <span className="score-number">{score}</span>
            <span className="score-max">/{maxScore}</span>
          </div>
        </div>
        <div className="score-label" style={{ color: colour }}>{label}</div>
        <p className="score-description">
          {score <= 30
            ? "AI assistants struggle to find your business. Complete your profile to improve discoverability."
            : score <= 50
            ? "Basic visibility. Add more details and consider upgrading for better AI placement."
            : score <= 70
            ? "Good visibility! Complete remaining items or upgrade to reach more AI queries."
            : "Excellent! Your business is well-positioned for AI discovery."
          }
        </p>

        {nextMilestone && nextMilestone.pointsNeeded > 0 && (
          <div className="next-milestone">
            <span className="milestone-text">
              {nextMilestone.pointsNeeded} more points to reach "{nextMilestone.label}"
            </span>
          </div>
        )}
      </div>

      <div className="score-breakdown">
        <h4>Score Breakdown</h4>
        {Object.entries(breakdown).map(([key, section]) => (
          <div
            key={key}
            className={`breakdown-section ${section.locked ? 'locked' : ''} ${expandedSection === key ? 'expanded' : ''}`}
          >
            <div
              className="breakdown-header"
              onClick={() => toggleSection(key)}
            >
              <span className="breakdown-title">
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {section.locked && <span className="lock-icon">🔒</span>}
              </span>
              <span className="breakdown-score">{section.earned}/{section.max}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(section.earned / section.max) * 100}%`,
                  backgroundColor: section.locked ? '#9ca3af' : colour
                }}
              ></div>
            </div>

            {expandedSection === key && section.items && (
              <div className="breakdown-items">
                {section.items.map((item, i) => (
                  <div key={i} className={`breakdown-item ${item.completed ? 'completed' : ''}`}>
                    <span className="item-icon">{item.completed ? '✅' : '○'}</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-points">+{item.points}</span>
                    {item.requiresTier && !item.completed && (
                      <span className="item-tier-badge">{item.requiresTier}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions based on recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="score-actions">
          <h4>Improve Your Score</h4>
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="action-item">
              <span className="action-text">{rec.action}</span>
              <span className="action-points">+{rec.points} pts</span>
              {rec.tier !== 'free' && rec.price && (
                <span className="action-tier">{rec.price}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upgrade CTA for free tier */}
      {tier === 'free' && (
        <div className="upgrade-cta">
          <p className="cta-text">
            <strong>Unlock +60 more points</strong> with product uploads, trust badges, and AI optimisation
          </p>
          <button
            className="upgrade-btn"
            onClick={() => navigate('/vendor-dashboard/upgrade')}
          >
            View Upgrade Options
          </button>
        </div>
      )}

      {/* Upgrade CTA for basic tier */}
      {tier === 'basic' && (
        <div className="upgrade-cta secondary">
          <p className="cta-text">
            <strong>Get Verified Badge</strong> and real-time AI sync with Managed tier
          </p>
          <button
            className="upgrade-btn secondary"
            onClick={() => navigate('/vendor-dashboard/upgrade')}
          >
            Upgrade to Managed
          </button>
        </div>
      )}
    </div>
  );
};

export default AIVisibilityScore;
