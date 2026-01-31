// src/components/vendor/UpgradePlan.js
// AI Visibility-focused subscription upgrade page for vendors

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, Shield, Bot, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './UpgradePlan.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-procurement-backend-q35u.onrender.com';

const UpgradePlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error, info } = useToast();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Listed',
      price: 'Free',
      period: '',
      description: 'Basic listing for suppliers wanting to be found',
      scoreMax: 30,
      features: [
        { text: 'Basic company listing', included: true },
        { text: 'Appear in search results', included: true },
        { text: 'AI Visibility Score (capped at 30)', included: true },
        { text: 'Full profile & description', included: false },
        { text: 'Product catalog', included: false },
        { text: 'Verified badge', included: false },
        { text: 'Priority in AI recommendations', included: false },
        { text: 'Receive enquiries', included: false },
      ],
      ctaStyle: 'outlined',
      popular: false
    },
    {
      id: 'basic',
      name: 'Visible',
      price: '£99',
      period: '/month',
      description: 'Get found by AI assistants and potential customers',
      scoreMax: 80,
      features: [
        { text: 'Everything in Listed', included: true },
        { text: 'Full company profile', included: true },
        { text: 'Upload product catalog', included: true },
        { text: 'AI Visibility Score up to 80', included: true },
        { text: 'Appear in AI recommendations', included: true },
        { text: 'Receive customer enquiries', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Verified badge', included: false },
        { text: 'Priority placement', included: false },
      ],
      ctaStyle: 'primary',
      popular: true
    },
    {
      id: 'managed',
      name: 'Verified',
      price: '£149',
      period: '/month',
      description: 'Maximum visibility with verified trust signals',
      scoreMax: 100,
      features: [
        { text: 'Everything in Visible', included: true },
        { text: 'Verified Supplier badge', included: true },
        { text: 'Priority in search results', included: true },
        { text: 'Priority in AI recommendations', included: true },
        { text: 'AI Visibility Score up to 100', included: true },
        { text: 'We optimise your profile for AI', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Priority support', included: true },
      ],
      ctaStyle: 'premium',
      popular: false
    }
  ];

  const faqs = [
    {
      q: 'What is AI Visibility?',
      a: 'AI Visibility measures how easily AI assistants like ChatGPT, Google AI, and Perplexity can find and recommend your business. When someone asks an AI "Who are the best photocopier suppliers in Cardiff?", a higher score means you\'re more likely to be in the answer.'
    },
    {
      q: 'Do you guarantee leads or enquiries?',
      a: 'No. We guarantee visibility, not leads. We make your business discoverable to AI assistants and customers searching our platform. Whether they contact you depends on your profile quality, pricing, and fit for their needs.'
    },
    {
      q: 'Can I change plans later?',
      a: 'Yes. Upgrade anytime and get immediate access to new features. Downgrades take effect at the end of your billing cycle.'
    },
    {
      q: 'Is there a contract?',
      a: 'No contracts. All plans are month-to-month. Cancel anytime.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit and debit cards through Stripe, our secure payment partner.'
    },
    {
      q: 'How do I improve my AI Visibility Score?',
      a: 'Complete your profile, add your product catalog, upload accreditations, and ensure your information is accurate and detailed. The more AI assistants know about you, the better they can recommend you.'
    }
  ];

  // Check for subscription status from URL params
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      success('Your subscription has been activated!');
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

  // Map backend plan names to frontend plan IDs
  const normalizePlanName = (backendPlan) => {
    const planMapping = {
      'listed': 'free',
      'free': 'free',
      'visible': 'basic',
      'basic': 'basic',
      'verified': 'managed',
      'managed': 'managed',
      'enterprise': 'enterprise'
    };
    return planMapping[backendPlan?.toLowerCase()] || 'free';
  };

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
        // Normalize the plan name from backend to frontend format
        const normalizedPlan = normalizePlanName(data.plan);
        setCurrentPlan(normalizedPlan);
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
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
      <div className="pricing-page pricing-page--loading">
        <div className="pricing-spinner" />
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <Helmet>
        <title>Get Found by AI | TendorAI Supplier Plans</title>
        <meta
          name="description"
          content="Increase your AI visibility and get found by businesses using ChatGPT, Google AI, and other AI assistants to find suppliers."
        />
      </Helmet>

      <header className="pricing-header">
        <h1>Get Found by AI</h1>
        <p>
          Businesses increasingly use AI assistants to find suppliers.
          Make sure your company is visible when they ask.
        </p>
        {currentPlan !== 'free' && subscription && (
          <p className="pricing-current-plan">
            Currently on <strong>{currentPlan === 'basic' ? 'Visible (£99/mo)' : currentPlan === 'managed' ? 'Verified (£149/mo)' : currentPlan}</strong> plan
          </p>
        )}
        <div className="trust-badges">
          <span><Shield size={16} /> Secure payments via Stripe</span>
          <span><Check size={16} /> Cancel anytime</span>
          <span><Check size={16} /> UK-based support</span>
        </div>
      </header>

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const planOrder = ['free', 'basic', 'managed', 'enterprise'];
          const canUpgrade = planOrder.indexOf(plan.id) > planOrder.indexOf(currentPlan);

          return (
            <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}>
              {plan.popular && <span className="popular-badge">Most Popular</span>}
              {isCurrentPlan && <span className="current-badge">Current Plan</span>}

              <div className="plan-header">
                <h2>{plan.name}</h2>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="score-indicator">
                <Bot size={16} />
                <span>AI Score up to <strong>{plan.scoreMax}/100</strong></span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i} className={feature.included ? 'included' : 'excluded'}>
                    {feature.included ? <Check size={16} /> : <X size={16} />}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`plan-cta ${plan.ctaStyle} ${!canUpgrade && !isCurrentPlan ? 'disabled' : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={!canUpgrade || processingPlan === plan.id}
              >
                {processingPlan === plan.id ? (
                  'Processing...'
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : canUpgrade ? (
                  `Upgrade to ${plan.name}`
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
        <div className="pricing-manage">
          <p>
            Need to update payment method, view invoices, or cancel?{' '}
            <button onClick={handleManageSubscription} className="pricing-manage-link">
              Manage Subscription
            </button>
          </p>
        </div>
      )}

      <section className="why-visibility">
        <h2>Why AI Visibility Matters</h2>
        <div className="visibility-points">
          <div className="point">
            <Bot size={32} />
            <h3>AI Is Changing Search</h3>
            <p>More businesses ask ChatGPT and Google AI for supplier recommendations instead of Googling. If AI can't find you, you're invisible.</p>
          </div>
          <div className="point">
            <Eye size={32} />
            <h3>Be In The Answer</h3>
            <p>When someone asks "Who supplies photocopiers in Bristol?", your business needs to be in the AI's knowledge base to be recommended.</p>
          </div>
          <div className="point">
            <TrendingUp size={32} />
            <h3>Stay Ahead</h3>
            <p>Early adopters who optimise for AI visibility now will dominate as AI search becomes the norm. Don't get left behind.</p>
          </div>
        </div>
      </section>

      <section className="faqs">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="faq-item"
              open={openFaq === i}
              onClick={(e) => {
                e.preventDefault();
                setOpenFaq(openFaq === i ? null : i);
              }}
            >
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UpgradePlan;
