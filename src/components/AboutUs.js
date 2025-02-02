import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css'; // Ensure correct import path

import heroImage from '../assets/images/team.png'; // Ensure the image exists in the correct location

const AboutUs = () => {
  return (
    <div className="aboutUsPage">
      {/* Hero Section */}
      <header
        className="heroSection"
        style={{
          backgroundImage: `url(${heroImage})`, // Background image
        }}
      >
        <div className="heroOverlay" /> {/* Overlay for better text readability */}
        <div className="heroContent">
          <h1>Hello and Welcome</h1>
          <p>Hi, I’m Scott Davies, the founder of TENDORAI.</p>
        </div>
      </header>

      {/* About Section */}
      <section className="aboutUsSection">
        <h2>About Me</h2>
        <p>
          With over 25 years of experience in sales, procurement, and digital marketing, I’ve witnessed firsthand the challenges businesses face when navigating the procurement process. 
          From time-consuming vendor searches to unreliable quotes, I knew there had to be a better way. That’s why I founded TENDORAI: to revolutionise how businesses find the right solutions.
        </p>
        <p className="founderName"><strong>Scott Davies</strong></p>
      </section>

      {/* Mission Statement Section */}
      <section className="missionSection">
        <h2>Our Mission</h2>
        <p>
          At TENDORAI, our mission is simple yet transformative: to empower businesses by making procurement smarter, faster, and more cost-effective. 
          We aim to eliminate inefficiencies and deliver tailored vendor solutions through our AI-powered platform.
        </p>
        <p>
          We believe that businesses should focus on growth, not on wading through complex procurement processes. 
          That’s why we use cutting-edge technology to match businesses with trusted vendors, saving both time and money.
        </p>
      </section>

      {/* Our Story Section */}
      <section className="ourStorySection">
        <h2>Our Story</h2>
        <p>
          Throughout my career, I’ve seen businesses struggle to find reliable vendors. Many fall victim to aggressive sales tactics or outdated procurement methods that fail to meet their needs.
          Recognising this gap, I combined my expertise in procurement with innovative AI technology to create a platform that simplifies and personalises the entire process.
        </p>
        <p>
          Since launching TENDORAI, we’ve helped countless businesses streamline their procurement, reduce costs, and build lasting partnerships with trusted vendors.
        </p>
      </section>

      {/* Why Choose Us Section */}
      <section className="whyChooseUsSection">
        <h2>Why Choose Us?</h2>
        <ul className="featuresList">
          <li><strong>Personalised Matching:</strong> Our advanced AI algorithms analyse your unique needs to connect you with the most suitable vendors.</li>
          <li><strong>Instant Quotes:</strong> Receive detailed and competitive quotes within seconds, saving valuable time.</li>
          <li><strong>Trusted Vendors:</strong> We partner with a curated network of reliable vendors to ensure quality and value.</li>
          <li><strong>Customer Focused:</strong> Our platform is designed with your convenience in mind, making procurement effortless and stress-free.</li>
        </ul>
      </section>

      {/* Core Values Section */}
      <section className="coreValuesSection">
        <h2>Our Core Values</h2>
        <ul className="valuesList">
          <li><strong>Transparency:</strong> We prioritise honest and clear communication at every stage.</li>
          <li><strong>Efficiency:</strong> Our platform is built to save you time and resources.</li>
          <li><strong>Innovation:</strong> We constantly improve our technology to deliver the best results.</li>
          <li><strong>Customer Satisfaction:</strong> Your success is our top priority.</li>
        </ul>
      </section>

      {/* Vision Section */}
      <section className="visionSection">
        <h2>Our Vision</h2>
        <p>
          We’re committed to transforming procurement for businesses of all sizes. 
          As we grow, we aim to expand our network of trusted vendors, refine our AI algorithms, and continue leading the digital procurement revolution.
        </p>
      </section>

      {/* Get in Touch Section */}
      <section className="getInTouchSection">
        <h2>Get in Touch</h2>
        <p>
          Whether you’re a business looking for tailored solutions or a vendor ready to showcase your services, we’re here to help.
          Visit our Contact Us page to connect with us, or learn more about our process on the How It Works page.
        </p>
        <p>Let’s make procurement smarter, together.</p>
        <p className="founderName"><strong>Scott Davies</strong><br/>Founder, TENDORAI</p>

        <div className="ctaButtons">
          <Link to="/contact" className="primaryButton">Contact Us</Link>
          <Link to="/how-it-works" className="secondaryButton">How It Works</Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
