import React from 'react';
import './ServicesOverview.css'; // Import the CSS file for styling

const ServicesOverview = () => {
  const services = [
    {
      title: 'Multi-Functional Systems',
      description: 'Advanced printing and copying solutions.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/copiertest2.png', // Image for Multi-Functional Systems
    },
    {
      title: 'Telecoms',
      description: 'Reliable communication systems for businesses.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/telecom.png', // Replace with your actual Telecoms image
    },
    {
      title: 'CCTV',
      description: 'High-quality surveillance and security systems.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/cctv.png', // Replace with your actual CCTV image
    },
    {
      title: 'IT Services',
      description: 'Comprehensive IT support and services.',
      imgSrc: process.env.PUBLIC_URL + '/assets/images/it-services.png', // Replace with your actual IT Services image
    },
  ];

  return (
    <div className="services-overview">
      {services.map((service, index) => (
        <div key={index} className="service-item">
          <img src={service.imgSrc} alt={service.title} className="service-image" />
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServicesOverview;
