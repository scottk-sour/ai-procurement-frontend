import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/QuotesRequested.css"; // Make sure this CSS file exists for styling

const QuotesRequested = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotes = async () => {
      const token = localStorage.getItem("userToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/quotes/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Fixed Bearer token definition
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quotes.");
        }

        const data = await response.json();
        setQuotes(data.quotes || []);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        setError("⚠ Unable to load quotes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [navigate]);

  return (
    <div className="quotes-requested-container">
      <h2>Your Requested Quotes</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : quotes.length === 0 ? (
        <p>No quotes requested yet.</p>
      ) : (
        <ul className="quotes-list">
          {quotes.map((quote, index) => (
            <li key={index} className="quote-item">
              <strong>{quote.product}</strong> - {quote.status}
              <br />
              Vendors: {quote.vendors ? quote.vendors.join(", ") : "N/A"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuotesRequested;
