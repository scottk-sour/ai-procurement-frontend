import React, { useState } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post('/api/chat', { message: input });

      const botMessage = { role: 'assistant', content: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Oops! Something went wrong. Please try again later.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatbot-message ${
              msg.role === 'user' ? 'user-message' : 'bot-message'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chatbot-form">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chatbot-input"
        />
        <button type="submit" className="chatbot-send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
