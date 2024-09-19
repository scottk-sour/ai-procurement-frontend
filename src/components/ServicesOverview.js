// src/components/ServicesOverview.js
import React from 'react';
import './ServicesOverview.css'; // Import the CSS file for styling

const ServicesOverview = () => {
  const services = [
    { title: 'Multi-Functional Systems', description: 'Advanced printing and copying solutions.' },
    { title: 'Telecoms', description: 'Reliable communication systems for businesses.' },
    { title: 'CCTV', description: 'High-quality surveillance and security systems.' },
    { title: 'IT Services', description: 'Comprehensive IT support and services.' },
  ];

  return (
    <div className="services-overview">
      {services.map((service, index) => (
        <div key={index} className="service-item">
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServicesOverview;
