// src/components/HowItWorks.js
import React from 'react';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      step: "Step 1",
      title: "Chat with Our AI Advisor",
      content:
        "Forget endless forms or complicated processes. Our friendly AI advisor will guide you through a conversational chat to learn about your requirements, preferences, and budget.",
      details: [
        {
          title: "For Businesses:",
          points: [
            "Your requirements, such as photocopiers, telecoms, or IT solutions.",
            "Your priorities, like cost savings or speed of delivery.",
            "Your preferences, such as eco-friendly options or local vendors.",
            "Your budget and timeline.",
          ],
        },
        {
          title: "For Vendors:",
          points: [
            "Details about your unique solutions or products.",
            "Your service area and delivery capabilities.",
            "Pricing competitiveness and discount options.",
          ],
        },
      ],
    },
    {
      step: "Step 2",
      title: "AI-Driven Matching & Analysis",
      content:
        "Our AI algorithms analyze your input to match you with tailored options from our database of trusted vendors.",
      details: [
        {
          title: "For Businesses:",
          points: [
            "Receive three tailored vendor options that best meet your needs.",
            "Options are prioritised based on value, suitability, and preferences.",
          ],
        },
        {
          title: "For Vendors:",
          points: [
            "Connect with businesses whose needs align with your offerings.",
            "Gain valuable insights into client requirements.",
          ],
        },
      ],
    },
    {
      step: "Step 3",
      title: "Instant Quotes Tailored to Your Needs",
      content:
        "For businesses, receive personalised quotes with pricing, features, and vendor ratings. Vendors gain direct access to matching inquiries.",
    },
    {
      step: "Step 4",
      title: "Real-Time Communication",
      content:
        "Communicate directly through the platform to refine quotes, clarify details, and ensure the best solution.",
    },
    {
      step: "Step 5",
      title: "Seamless Finalisation",
      content:
        "Finalise deals directly through the platform, with all documents and contracts ready to save time and effort.",
    },
    {
      step: "Step 6",
      title: "Continuous Learning & Improvement",
      content:
        "Our platform continually learns from every interaction, improving matches for both businesses and vendors.",
    },
  ];

  return (
    <div className="how-it-works-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Revolutionising Procurement</h1>
          <p>Experience a smarter, easier, and more efficient way to manage procurement.</p>
        </div>
      </section>

      {/* Step Sections */}
      {steps.map((step, index) => (
        <section className="step-section" key={index}>
          <h2>
            {step.step}: {step.title}
          </h2>
          <p>{step.content}</p>
          {step.details && (
            <div className="step-details">
              {step.details.map((detail, detailIndex) => (
                <div key={detailIndex}>
                  <h3>{detail.title}</h3>
                  <ul>
                    {detail.points.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to Experience Smarter Procurement?</h2>
        <p>Join [Your Platform Name] today and take your procurement to the next level.</p>
        <button className="cta-button">Get Started Now</button>
      </section>
    </div>
  );
};

export default HowItWorks;
