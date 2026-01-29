// src/components/vendor/UpgradePlan.js
// Subscription upgrade page for vendors

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaCheck,
  FaCrown,
  FaStar,
  FaRocket,
  FaArrowRight,
  FaShieldAlt,
  FaChartLine,
  FaHeadset,
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import './UpgradePlan.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

// Plan configurations
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    description: 'Perfect for small suppliers getting started',
    icon: FaStar,
    color: '#3b82f6',
    features: [
      'Up to 20 leads per month',
      'Basic profile listing',
      'Email notifications',
      'Standard support',
    ],
    notIncluded: [
      'Featured profile listing',
      'Priority lead matching',
      'Analytics dashboard',
      'API access',
    ],
  },
  {
    id: 'managed',
    name: 'Managed',
    price: 149,
    description: 'For growing businesses seeking more leads',
    icon: FaRocket,
    color: '#f97316',
    popular: true,
    features: [
      'Up to 50 leads per month',
      'Featured profile listing',
      'Priority lead matching',
      'Analytics dashboard',
      'Priority support',
    ],
    notIncluded: [
      'Unlimited leads',
      'Premium profile placement',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    description: 'Maximum visibility for established suppliers',
    icon: FaCrown,
    color: '#1e40af',
    features: [
      'Unlimited leads',
      'Premium profile placement',
      'Exclusive lead access',
      'Advanced analytics',
      'Dedicated account manager',
      'API access',
      '24/7 support',
    ],
    notIncluded: [],
  },
];

const UpgradePlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error, info } = useToast();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Check for subscription status from URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      success('Your subscription has been activated!');
      // Clear the URL params
      navigate('/vendor-dashboard/upgrade', { replace: true });
    } else if (subscriptionStatus === 'cancelled') {
      info('Subscription checkout was cancelled.');
      navigate('/vendor-dashboard/upgrade', { replace: true });
    }
  }, [searchParams, navigate, success, info]);

  // Fetch current subscription status
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/stripe/subscription-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    // Prevent downgrading through this UI
    const planOrder = ['free', 'basic', 'managed', 'enterprise'];
    if (planOrder.indexOf(planId) <= planOrder.indexOf(currentPlan)) {
      if (planId === currentPlan) {
        info("You're already on this plan.");
      } else {
        info('To downgrade your plan, please contact support.');
      }
      return;
    }

    setProcessingPlan(planId);

    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        error('Please log in to upgrade your plan.');
        navigate('/vendor-login');
        return;
      }

      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        error(data.message || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Failed to initiate checkout:', err);
      error('Failed to initiate checkout. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('vendorToken');
      const response = await fetch(`${API_URL}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        error(data.message || 'Failed to open billing portal');
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      error('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="upgrade-plan upgrade-plan--loading">
        <div className="upgrade-plan__spinner" />
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="upgrade-plan">
      <Helmet>
        <title>Upgrade Your Plan | TendorAI Partner Program</title>
        <meta
          name="description"
          content="Choose the right TendorAI plan for your business. Get more leads, better visibility, and grow your supplier business."
        />
      </Helmet>

      {/* Header */}
      <div className="upgrade-plan__header">
        <h1>Choose Your Plan</h1>
        <p>
          Unlock more leads and grow your business with TendorAI's supplier program.
          {currentPlan !== 'free' && subscription && (
            <span className="upgrade-plan__current">
              Currently on <strong>{currentPlan}</strong> plan
            </span>
          )}
        </p>
      </div>

      {/* Trust badges */}
      <div className="upgrade-plan__trust">
        <div className="upgrade-plan__trust-item">
          <FaShieldAlt />
          <span>Secure payments via Stripe</span>
        </div>
        <div className="upgrade-plan__trust-item">
          <FaChartLine />
          <span>Cancel anytime</span>
        </div>
        <div className="upgrade-plan__trust-item">
          <FaHeadset />
          <span>UK-based support</span>
        </div>
      </div>

      {/* Plans grid */}
      <div className="upgrade-plan__grid">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const planOrder = ['free', 'basic', 'managed', 'enterprise'];
          const canUpgrade = planOrder.indexOf(plan.id) > planOrder.indexOf(currentPlan);

          return (
            <div
              key={plan.id}
              className={`upgrade-plan__card ${plan.popular ? 'upgrade-plan__card--popular' : ''} ${isCurrentPlan ? 'upgrade-plan__card--current' : ''}`}
            >
              {plan.popular && (
                <div className="upgrade-plan__badge">Most Popular</div>
              )}
              {isCurrentPlan && (
                <div className="upgrade-plan__badge upgrade-plan__badge--current">
                  Current Plan
                </div>
              )}

              <div className="upgrade-plan__card-header" style={{ '--plan-color': plan.color }}>
                <Icon className="upgrade-plan__icon" />
                <h2>{plan.name}</h2>
                <p className="upgrade-plan__description">{plan.description}</p>
              </div>

              <div className="upgrade-plan__price">
                <span className="upgrade-plan__currency">£</span>
                <span className="upgrade-plan__amount">{plan.price}</span>
                <span className="upgrade-plan__period">/month</span>
              </div>

              <ul className="upgrade-plan__features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="upgrade-plan__feature">
                    <FaCheck className="upgrade-plan__feature-icon" />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, index) => (
                  <li key={`not-${index}`} className="upgrade-plan__feature upgrade-plan__feature--disabled">
                    <span className="upgrade-plan__feature-icon upgrade-plan__feature-icon--disabled">×</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`upgrade-plan__cta ${canUpgrade ? '' : 'upgrade-plan__cta--disabled'}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={!canUpgrade || processingPlan === plan.id}
              >
                {processingPlan === plan.id ? (
                  'Processing...'
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : canUpgrade ? (
                  <>
                    Upgrade to {plan.name} <FaArrowRight />
                  </>
                ) : (
                  'Contact Support'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Manage subscription link */}
      {subscription && (
        <div className="upgrade-plan__manage">
          <p>
            Need to update payment method, view invoices, or cancel?{' '}
            <button
              onClick={handleManageSubscription}
              className="upgrade-plan__manage-link"
            >
              Manage Subscription
            </button>
          </p>
        </div>
      )}

      {/* FAQ section */}
      <div className="upgrade-plan__faq">
        <h3>Frequently Asked Questions</h3>
        <div className="upgrade-plan__faq-grid">
          <div className="upgrade-plan__faq-item">
            <h4>Can I change plans later?</h4>
            <p>
              Yes! You can upgrade your plan at any time. Downgrades take effect at the
              end of your billing cycle.
            </p>
          </div>
          <div className="upgrade-plan__faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>
              We accept all major credit and debit cards through our secure payment
              partner, Stripe.
            </p>
          </div>
          <div className="upgrade-plan__faq-item">
            <h4>Is there a contract?</h4>
            <p>
              No contracts! All plans are month-to-month and you can cancel anytime.
            </p>
          </div>
          <div className="upgrade-plan__faq-item">
            <h4>How do leads work?</h4>
            <p>
              Leads are quote requests from businesses in your service area. You
              receive their details and can respond with your best offer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlan;
