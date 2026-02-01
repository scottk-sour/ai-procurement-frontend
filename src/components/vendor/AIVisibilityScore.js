/**
 * AI Visibility Score Component
 * Shows vendors how visible they are to AI assistants
 * and encourages them to complete profile / upgrade tier
 *
 * Scoring: Profile (25) + Products (25) + Trust (20) + Tier Bonus (30) = 100
 * - Listed (free): max 70/100
 * - Visible (£99): max 85/100
 * - Verified (£149): max 100/100
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

  const { score, maxScore, maxPossibleForTier, label, colour, breakdown, recommendations, nextMilestone, tier, tierDisplayName } = scoreData;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Format section name for display
  const formatSectionName = (key) => {
    if (key === 'tierBonus') return 'Tier Bonus';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="visibility-score-card">
      <div className="score-header">
        <h3>AI Visibility Score</h3>
        <span className="tier-badge" data-tier={tier}>{tierDisplayName || 'Listed (Free)'}</span>
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

        {/* Show max possible for current tier */}
        {tier !== 'verified' && maxPossibleForTier && (
          <p className="tier-limit-note">
            Your tier max: {maxPossibleForTier}/100
          </p>
        )}

        <p className="score-description">
          {score <= 30
            ? "AI assistants struggle to find your business. Complete your profile to improve discoverability."
            : score <= 50
            ? "Basic visibility. Add more details and consider upgrading for better AI placement."
            : score <= 70
            ? "Good visibility! Upgrade your tier to unlock higher scores and reach more AI queries."
            : score <= 85
            ? "Strong visibility! Upgrade to Verified to reach 100/100."
            : "Excellent! Your business is maximally visible to AI assistants."
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
            className={`breakdown-section ${expandedSection === key ? 'expanded' : ''}`}
          >
            <div
              className="breakdown-header"
              onClick={() => toggleSection(key)}
            >
              <span className="breakdown-title">
                {formatSectionName(key)}
              </span>
              <span className="breakdown-score">{section.earned}/{section.max}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: `${(section.earned / section.max) * 100}%`,
                  backgroundColor: colour
                }}
              ></div>
            </div>

            {expandedSection === key && section.items && (
              <div className="breakdown-items">
                {section.items.map((item, i) => (
                  <div key={i} className={`breakdown-item ${item.completed ? 'completed' : ''} ${item.upgrade ? 'upgrade-item' : ''}`}>
                    <span className="item-icon">
                      {item.completed ? '✅' : item.upgrade ? '⬆️' : '○'}
                    </span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-points">+{item.points}</span>
                    {item.price && !item.completed && (
                      <span className="item-price">{item.price}</span>
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
            <div key={i} className={`action-item ${rec.section === 'tierBonus' ? 'upgrade-action' : ''}`}>
              <span className="action-text">{rec.action}</span>
              <span className="action-points">+{rec.points} pts</span>
              {rec.price && (
                <span className="action-tier">{rec.price}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upgrade CTA for Listed (free) tier */}
      {tier === 'listed' && (
        <div className="upgrade-cta">
          <p className="cta-text">
            <strong>Upgrade to Visible (+15 pts)</strong>
            <br />
            <span className="cta-subtext">Or Verified (+30 pts) for maximum AI visibility</span>
          </p>
          <button
            className="upgrade-btn"
            onClick={() => navigate('/vendor-dashboard/upgrade')}
          >
            View Plans
          </button>
        </div>
      )}

      {/* Upgrade CTA for Visible tier */}
      {tier === 'visible' && (
        <div className="upgrade-cta secondary">
          <p className="cta-text">
            <strong>Upgrade to Verified (+15 pts)</strong>
            <br />
            <span className="cta-subtext">Reach 100/100 with priority AI placement</span>
          </p>
          <button
            className="upgrade-btn secondary"
            onClick={() => navigate('/vendor-dashboard/upgrade')}
          >
            Upgrade to Verified
          </button>
        </div>
      )}

      {/* Success message for Verified tier */}
      {tier === 'verified' && score >= 90 && (
        <div className="verified-success">
          <span className="success-icon">🏆</span>
          <p>You're at maximum AI visibility!</p>
        </div>
      )}
    </div>
  );
};

export default AIVisibilityScore;
