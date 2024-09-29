import React from 'react';
import '../styles/TestimonialCarousel.css';  // Your custom styles

const TestimonialCarousel = () => {
  const testimonials = [
    {
      company: 'Company A',
      person: 'John Doe',
      position: 'CEO',
      feedback: 'This platform is amazing for procurement!',
    },
    {
      company: 'Company B',
      person: 'Jane Smith',
      position: 'Procurement Manager',
      feedback: 'A game-changer in sourcing vendors efficiently.',
    },
    {
      company: 'Company C',
      person: 'Tom Lee',
      position: 'CTO',
      feedback: 'Saved us so much time and cost.',
    },
    {
      company: 'Company D',
      person: 'Emily Davis',
      position: 'Operations Head',
      feedback: 'Highly recommend this platform!',
    },
    {
      company: 'Company E',
      person: 'Robert Brown',
      position: 'VP of Procurement',
      feedback: 'Very efficient and easy to use.',
    }
  ];

  return (
    <div className="testimonial-list">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-item">
          <div className="testimonial-content">
            <h3>{testimonial.company}</h3>
            <p>{testimonial.person}, {testimonial.position}</p>
            <blockquote>"{testimonial.feedback}"</blockquote>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestimonialCarousel;
