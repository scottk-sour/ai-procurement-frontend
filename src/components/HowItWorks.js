// src/components/HowItWorks.js
import React from 'react';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      step: "Step 1",
      title: "Chat with Our AI Advisor",
      content:
        "Forget endless forms or complicated processes. Our AI-powered advisor simplifies procurement by engaging in a smart, interactive conversation to understand your requirements.",
      details: [
        {
          title: "For Businesses:",
          points: [
            "Specify your needs, whether it's photocopiers, telecoms, or IT solutions.",
            "Highlight priorities such as cost, efficiency, or sustainability.",
            "Indicate preferences like vendor location or eco-friendly solutions.",
            "Define your budget and expected timeline.",
          ],
        },
        {
          title: "For Vendors:",
          points: [
            "Showcase your unique solutions and offerings.",
            "Define your service areas and capabilities.",
            "Provide competitive pricing and discount options.",
          ],
        },
      ],
    },
    {
      step: "Step 2",
      title: "AI-Driven Matching & Analysis",
      content:
        "Our AI algorithms assess your input and match you with tailored vendor solutions from our network of trusted providers.",
      details: [
        {
          title: "For Businesses:",
          points: [
            "Receive three highly tailored vendor recommendations.",
            "Matches prioritised based on best value, suitability, and preferences.",
          ],
        },
        {
          title: "For Vendors:",
          points: [
            "Connect with businesses actively seeking your products/services.",
            "Gain data-driven insights into client preferences and industry trends.",
          ],
        },
      ],
    },
    {
      step: "Step 3",
      title: "Instant Quotes Tailored to Your Needs",
      content:
        "Businesses receive personalised quotes outlining pricing, features, and vendor ratings. Vendors get instant access to real-time inquiries from interested clients.",
    },
    {
      step: "Step 4",
      title: "Real-Time Communication",
      content:
        "Streamline collaboration by communicating directly through our platform to refine quotes, ask questions, and ensure the perfect solution for your needs.",
    },
    {
      step: "Step 5",
      title: "Seamless Finalisation",
      content:
        "Finalise deals effortlessly with built-in contract management. Our platform ensures smooth transactions and secure documentation for a hassle-free experience.",
    },
    {
      step: "Step 6",
      title: "Continuous Learning & Improvement",
      content:
        "Our AI continuously learns from interactions, refining recommendations and improving procurement experiences for both businesses and vendors over time.",
    },
  ];

  return (
    <div className="how-it-works-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Revolutionising Procurement</h1>
          <p>Experience a smarter, faster, and more efficient way to manage procurement with AI-driven intelligence.</p>
        </div>
      </section>

      {/* Steps Section */}
      <div className="steps-container">
        {steps.map((step, index) => (
          <section className="step-section" key={index}>
            <h2>
              {step.step}: {step.title}
            </h2>
            <p>{step.content}</p>
            {step.details && (
              <div className="step-details">
                {step.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="step-box">
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
      </div>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to Experience Smarter Procurement?</h2>
        <p>Join <strong>Your Platform Name</strong> today and transform the way you do business.</p>
        <button className="cta-button">Get Started Now</button>
      </section>
    </div>
  );
};

export default HowItWorks;
