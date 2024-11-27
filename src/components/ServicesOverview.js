import React from 'react';
import './ServicesOverview.css'; // Import the CSS file for styling

const ServicesOverview = () => {
  const services = [
    {
      title: 'Multi-Functional Systems',
      description: 'Advanced printing and copying solutions.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/photocopier.PNG',
      cta: { label: 'Learn More', link: '/multi-functional-systems' },
    },
    {
      title: 'Telecoms',
      description: 'Reliable communication systems for businesses.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/phone.PNG',
      cta: { label: 'Get Started', link: '/telecoms' },
    },
    {
      title: 'CCTV',
      description: 'High-quality surveillance and security systems.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/cctv.png',
      cta: { label: 'Explore Now', link: '/cctv' },
    },
    {
      title: 'IT Services',
      description: 'Comprehensive IT support and services.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/wifi.PNG',
      cta: { label: 'Contact Us', link: '/it-services' },
    },
  ];

  return (
    <div className="services-overview">
      {services.map((service, index) => (
        <div key={index} className="service-item">
          <img src={service.imgSrc} alt={service.title} className="service-image" />
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <a href={service.cta.link} className="cta-button">{service.cta.label}</a>
        </div>
      ))}
    </div>
  );
};

export default ServicesOverview;
