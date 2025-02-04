import React, { useState } from "react";
import "./RequestQuote.css"; // Import the CSS for styling

const RequestQuote = () => {
  const [formData, setFormData] = useState({
    serviceType: "",
    quantity: "",
    preferredVendor: "",
    deadline: "",
    specialRequirements: "",
    budgetRange: "",
  });

  const [vendors, setVendors] = useState([]); // Stores AI-recommended vendors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setVendors([]); // Clear previous vendors before making a new request

    try {
      const token = localStorage.getItem("token"); // Get user token
      if (!token) {
        alert("You must be logged in to submit a quote request.");
        setIsSubmitting(false);
        return;
      }

      // Prepare Request Data
      const userRequirements = {
        serviceType: formData.serviceType,
        quantity: Number(formData.quantity),
        budget: formData.budgetRange,
        preferredVendor: formData.preferredVendor,
        deadline: formData.deadline,
        specialRequirements: formData.specialRequirements,
      };

      // Send API Request to AI System
      const response = await fetch("http://localhost:5000/api/quotes/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the authorisation token
        },
        body: JSON.stringify({ userRequirements }), // Send user requirements
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit the request.");
      }

      console.log("AI Response:", data);
      setVendors(data.recommendedVendors || []); // Store recommended vendors
    } catch (error) {
      console.error("Error:", error.message);
      setErrorMessage(error.message || "Failed to fetch recommendations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Service/Product Type:
          <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
            <option value="" disabled>Select a service type</option>
            <option value="CCTV">CCTV</option>
            <option value="Photocopiers">Photocopiers</option>
            <option value="IT">IT</option>
            <option value="Telecoms">Telecoms</option>
          </select>
        </label>

        <label>
          Quantity:
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter the quantity" required />
        </label>

        <label>
          Preferred Vendor (optional):
          <input type="text" name="preferredVendor" value={formData.preferredVendor} onChange={handleChange} placeholder="Vendor name" />
        </label>

        <label>
          Deadline:
          <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
        </label>

        <label>
          Special Requirements:
          <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} placeholder="Enter additional details (optional)" />
        </label>

        <label>
          Budget Range (£):
          <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} required>
            <option value="" disabled>Select a budget range</option>
            <option value="Under 500">Under £500</option>
            <option value="500-1000">£500 - £1000</option>
            <option value="1000-5000">£1000 - £5000</option>
            <option value="Over 5000">Over £5000</option>
          </select>
        </label>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* Display Error Message */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Display AI-Recommended Vendors */}
      {vendors.length > 0 && (
        <div>
          <h3>Top AI-Recommended Vendors:</h3>
          <ul>
            {vendors.map((vendor, index) => (
              <li key={index}>{vendor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RequestQuote;
