// src/components/AboutUs.js
import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      {/* Full-width banner with background image */}
      <section
        className="banner"
        style={{ backgroundImage: `url(/assets/images/landingpagepic.png)` }}
      >
        <h1 className="banner-title">About Us</h1>
      </section>

      <div className="content-wrapper">
        {/* Two-column layout for overview and mission */}
        <div className="two-column section-background">
          <section className="company-overview box-shadow">
            <h2>Welcome to [Your Platform Name]</h2>
            <p>
              I'm Scott Davies, and I've spent over 25 years in sales,
              procurement, and digital marketing. Throughout my career, I've
              witnessed firsthand the challenges businesses face when sourcing
              reliable vendors for office equipment. Many organisations
              struggle with time-consuming and costly procurement processes,
              often falling victim to aggressive sales tactics that promise the
              world but fail to deliver.
            </p>
          </section>

          <section className="mission box-shadow">
            <h2>Our Mission</h2>
            <p>
              Recognising these challenges, we created{" "}
              <strong>[Your Platform Name]</strong>, an AI-powered procurement
              platform that revolutionises the way businesses source products
              and services. Our platform offers personalised, competitive
              quotes from a curated selection of vendors, streamlining
              procurement and ensuring that companies receive the best value
              for their investments.
            </p>
          </section>
        </div>

        {/* How It Works Section */}
        <section className="how-it-works section-background">
          <h2 className="section-title">How It Works</h2>
          <div className="how-it-works-grid">
            <div className="card box-shadow">
              <h3>User Interaction and Data Collection</h3>
              <p>
                Our intuitive form allows users to easily input their
                procurement needs, including product specifications, budget, and
                service preferences.
              </p>
            </div>
            <div className="card box-shadow">
              <h3>AI-Driven Vendor Matching</h3>
              <p>
                Our advanced AI algorithms intelligently match user
                requirements with the most suitable vendors, eliminating
                guesswork and manual effort.
              </p>
            </div>
            <div className="card box-shadow">
              <h3>Automated Quote Generation</h3>
              <p>
                Users receive detailed, customised quotes within seconds, saving
                significant time and effort.
              </p>
            </div>
            <div className="card box-shadow">
              <h3>Quote Presentation and Comparison</h3>
              <p>
                A user-friendly comparison interface empowers users to make
                informed decisions based on price, features, and vendor ratings.
              </p>
            </div>
          </div>
        </section>

        <footer className="about-us-footer">
          <h2>Get in Touch</h2>
          <p>
            Want to learn more about us?{" "}
            <a href="/contact" className="contact-link">
              Contact us
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
