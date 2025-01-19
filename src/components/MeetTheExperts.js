import React from 'react';
import '../styles/MeetTheExperts.css';

function MeetTheExperts() {
  return (
    <div className="experts-container">
      <h1>Meet the Experts</h1>
      <p className="experts-intro">
        Our diverse team of specialists is here to guide you through every aspect
        of AI-driven sales, procurement, and customer experience. Whether you’re
        optimising current processes or exploring new strategies, our experts are
        dedicated to helping your business thrive.
      </p>

      <div className="experts-grid">
        {/* Expert 1 */}
        <div className="expert-card">
          <img
            src="https://via.placeholder.com/200"
            alt="Jane Doe"
            className="expert-image"
          />
          <h2>Jane Doe</h2>
          <p className="expert-title">AI Sales Advisor</p>
          <p className="expert-bio">
            With a background in enterprise sales and market analytics, Jane has
            spent over 10 years helping businesses refine their sales pipelines.
            She specialises in B2B solutions for tech and service industries.
          </p>
          <button className="cta-button">Contact Jane</button>
        </div>

        {/* Expert 2 */}
        <div className="expert-card">
          <img
            src="https://via.placeholder.com/200"
            alt="John Smith"
            className="expert-image"
          />
          <h2>John Smith</h2>
          <p className="expert-title">Procurement Solutions Lead</p>
          <p className="expert-bio">
            John brings 15 years of global procurement experience, with a focus
            on cost reduction and vendor management. He’s adept at utilising AI
            to streamline supply chain processes in various sectors.
          </p>
          <button className="cta-button">Contact John</button>
        </div>

        {/* Expert 3 */}
        <div className="expert-card">
          <img
            src="https://via.placeholder.com/200"
            alt="Emily Clarke"
            className="expert-image"
          />
          <h2>Emily Clarke</h2>
          <p className="expert-title">Customer Experience Strategist</p>
          <p className="expert-bio">
            Emily is passionate about improving customer journeys using AI-driven
            insights. She’s helped numerous e-commerce and service-based companies
            enhance customer satisfaction and retention.
          </p>
          <button className="cta-button">Contact Emily</button>
        </div>

        {/* Expert 4 */}
        <div className="expert-card">
          <img
            src="https://via.placeholder.com/200"
            alt="Michael Brown"
            className="expert-image"
          />
          <h2>Michael Brown</h2>
          <p className="expert-title">Data & Analytics Specialist</p>
          <p className="expert-bio">
            A data science veteran, Michael focuses on harnessing AI and machine
            learning to deliver actionable insights. He has experience in finance,
            healthcare, and manufacturing analytics.
          </p>
          <button className="cta-button">Contact Michael</button>
        </div>
      </div>

      <div className="experts-cta">
        <h3>Ready to Talk?</h3>
        <p>
          Get in touch with our experts today to discuss how we can tailor our
          solutions to meet your business needs. 
        </p>
        <button className="cta-button">Schedule a Call</button>
      </div>
    </div>
  );
}

export default MeetTheExperts;
