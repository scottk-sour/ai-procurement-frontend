// src/components/FAQ.js
import React from 'react';
import '../styles/FAQ.css'; // ✅ Required for styling

const faqs = [
  {
    question: 'What is TendorAI?',
    answer:
      'TendorAI is a platform designed to help businesses easily request and compare quotes from various vendors for services like photocopiers, telecoms, CCTV, and IT solutions. We use AI to streamline the matching process.',
  },
  {
    question: 'How much does it cost to use TendorAI?',
    answer:
      'For businesses seeking quotes, TendorAI is currently free to use for our MVP launch in South Wales.',
  },
  {
    question: 'How does the AI work?',
    answer:
      'Our AI helps match your quote request with the most relevant vendors based on your specified needs, service category, and location. This ensures you get tailored quotes from suppliers who can best meet your requirements.',
  },
  {
    question: 'Which areas do you serve?',
    answer:
      'Currently, our MVP is focused on serving businesses in South Wales. We plan to expand to other regions in the future.',
  },
  {
    question: 'How do I become a vendor on TendorAI?',
    answer:
      'Vendors interested in joining our platform can sign up through the Vendor Signup page. We have a vetting process to ensure quality and reliability.',
  },
];

const FAQ = () => {
  return (
    <section className="faq-container">
      <h1>Frequently Asked Questions</h1>
      {faqs.map((item, index) => (
        <details className="faq-item" key={index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
};

export default FAQ;
