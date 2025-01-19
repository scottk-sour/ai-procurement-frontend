import React from 'react';
import './AboutUs.css';

function AboutUs() {
  const platformName = 'Your Platform Name';

  return (
    <div className="about-us-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>About Us</h1>
          <p>Welcome to {platformName}</p>
        </div>
      </section>

      {/* INTRODUCTION / SCOTT DAVIES */}
      <section className="introduction-section">
        <div className="intro-text">
          <h2>Hello and Welcome</h2>
          <p>
            Hi, I’m Scott Davies, the founder of {platformName}. With over 25 years of experience
            in sales, procurement, and digital marketing, I’ve witnessed firsthand the challenges
            businesses face when navigating the procurement process. From time-consuming vendor
            searches to unreliable quotes, I knew there had to be a better way. That’s why I founded
            {` ${platformName}`}: to revolutionise how businesses find the right solutions.
          </p>
        </div>
        <div className="founder-image">
          {/* Replace with a real image URL or import your image */}
          <img
            src="https://via.placeholder.com/400x400"
            alt="Scott Davies"
          />
        </div>
      </section>

      {/* OUR MISSION & OUR STORY (TWO-COLUMN LAYOUT) */}
      <section className="two-column-section">
        <div className="column">
          <h2>Our Mission</h2>
          <p>
            At {platformName}, our mission is simple yet transformative:
            to empower businesses by making procurement smarter, faster,
            and more cost-effective. We aim to eliminate inefficiencies and
            deliver tailored vendor solutions through our AI-powered platform.
          </p>
          <p>
            We believe that businesses should focus on growth, not on wading
            through complex procurement processes. That’s why we use cutting-edge
            technology to match businesses with trusted vendors, saving both time
            and money.
          </p>
        </div>
        <div className="column">
          <h2>Our Story</h2>
          <p>
            Throughout my career, I’ve seen businesses struggle to find reliable
            vendors. Many fall victim to aggressive sales tactics or outdated
            procurement methods that fail to meet their needs. Recognising this gap,
            I combined my expertise in procurement with innovative AI technology
            to create a platform that simplifies and personalises the entire process.
          </p>
          <p>
            Since launching {platformName}, we’ve helped countless businesses streamline
            their procurement, reduce costs, and build lasting partnerships with trusted vendors.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE US? */}
      <section className="why-choose-us-section">
        <h2>Why Choose Us?</h2>
        <ul className="features-list">
          <li>
            <strong>Personalised Matching:</strong> Our advanced AI algorithms analyse your
            unique needs to connect you with the most suitable vendors.
          </li>
          <li>
            <strong>Instant Quotes:</strong> Receive detailed and competitive quotes
            within seconds, saving valuable time.
          </li>
          <li>
            <strong>Trusted Vendors:</strong> We partner with a curated network of
            reliable vendors to ensure quality and value.
          </li>
          <li>
            <strong>Customer Focused:</strong> Our platform is designed with your
            convenience in mind, making procurement effortless and stress-free.
          </li>
        </ul>
      </section>

      {/* CORE VALUES */}
      <section className="core-values-section">
        <h2>Our Core Values</h2>
        <ul className="values-list">
          <li>
            <strong>Transparency:</strong> We prioritise honest and clear communication
            at every stage.
          </li>
          <li>
            <strong>Efficiency:</strong> Our platform is built to save you time
            and resources.
          </li>
          <li>
            <strong>Innovation:</strong> We constantly improve our technology to
            deliver the best results.
          </li>
          <li>
            <strong>Customer Satisfaction:</strong> Your success is our top priority.
          </li>
        </ul>
      </section>

      {/* OUR VISION */}
      <section className="vision-section">
        <h2>Our Vision</h2>
        <p>
          We’re committed to transforming procurement for businesses of all sizes. As we
          grow, we aim to expand our network of trusted vendors, refine our AI algorithms,
          and continue leading the digital procurement revolution.
        </p>
      </section>

      {/* GET IN TOUCH */}
      <section className="get-in-touch-section">
        <h2>Get in Touch</h2>
        <p>
          Whether you’re a business looking for tailored solutions or a vendor ready to
          showcase your services, we’re here to help. Visit our Contact Us page to connect
          with us, or learn more about our process on the How It Works page.
        </p>
        <p>Let’s make procurement smarter, together.</p>
        <p>
          Scott Davies<br />
          Founder, {platformName}
        </p>

        {/* Example CTA button */}
        <button className="cta-button">Contact Us</button>
      </section>
    </div>
  );
}

export default AboutUs;
