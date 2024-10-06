// src/components/AboutUs.js
import React from 'react';
import './AboutUs.css'; // Import the CSS file for styling

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1 className="about-us-title">About Us</h1>
      
      <section className="company-overview">
        <h2>Welcome to [Your Platform Name]</h2>
        <p>
          I'm Scott Davies, and I've spent over 25 years in sales, procurement, and digital marketing. Throughout my career, I've witnessed firsthand the challenges businesses face when sourcing reliable vendors for office equipment. Many organizations struggle with time-consuming and costly procurement processes, often falling victim to aggressive sales tactics that promise the world but fail to deliver.
        </p>
        <p>
          In today's competitive landscape, companies are under pressure to reduce costs while employees seek higher wages and commissions. Additionally, hiring and training new employees can be an expensive gamble—after three months, many prove to be poor fits or move on, wasting valuable time and resources.
        </p>
      </section>

      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          Recognizing these challenges, we created <strong>[Your Platform Name]</strong>, an AI-powered procurement platform that revolutionizes the way businesses source products and services. Our platform offers personalized, competitive quotes from a curated selection of vendors, streamlining procurement and ensuring that companies receive the best value for their investments.
        </p>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <h3>User Interaction and Data Collection</h3>
        <p>
          Our intuitive form allows users to easily input their procurement needs, including product specifications, budget, and service preferences.
        </p>

        <h3>AI-Driven Vendor Matching</h3>
        <p>
          Our advanced AI algorithms intelligently match user requirements with the most suitable vendors, eliminating guesswork and manual effort.
        </p>

        <h3>Automated Quote Generation</h3>
        <p>
          Users receive detailed, customized quotes within seconds, saving significant time and effort.
        </p>

        <h3>Quote Presentation and Comparison</h3>
        <p>
          A user-friendly comparison interface empowers users to make informed decisions based on price, features, and vendor ratings.
        </p>

        <h3>Finalization and Vendor Engagement</h3>
        <p>
          We facilitate a seamless transition from quote comparison to contract finalization, ensuring maximum transparency and minimal delays.
        </p>

        <h3>Continuous Learning and Improvement</h3>
        <p>
          Our platform learns from every user interaction, continually optimizing its algorithms to enhance accuracy and relevance.
        </p>
      </section>

      <section className="join-us">
        <h2>Join Us on This Journey</h2>
        <p>
          At <strong>[Your Platform Name]</strong>, we believe in transforming the procurement process for businesses of all sizes. Our innovative approach not only saves time and reduces costs but also drives user satisfaction and retention. As we expand our vendor network and enhance our AI capabilities, we are excited to lead the digital procurement space and empower businesses to thrive.
        </p>
      </section>

      <footer className="about-us-footer">
        <h2>Get in Touch</h2>
        <p>Want to learn more about us? <a href="/contact">Contact us</a>.</p>
      </footer>
    </div>
  );
};

export default AboutUs;
