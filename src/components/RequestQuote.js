import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import "./RequestQuote.css";

const RequestQuote = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    industryType: "",
    numEmployees: "",
    numLocations: "",
    multiFloor: "No",
    leaseOrOwn: "Lease",
    currentMachines: "",
    leaseEndDate: "",
    monthlyLeasePayment: "",
    settlementCost: "",
    printVolume: "",
    printColor: "No",
    paperTrays: "1 Tray",
    specialFeatures: [],
    budget: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        specialFeatures: checked
          ? [...prev.specialFeatures, value]
          : prev.specialFeatures.filter((item) => item !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Handle File Upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf,.xlsx,.csv",
    onDrop: (acceptedFiles) => {
      setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    },
  });

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to submit a quote request.");
        navigate("/login");
        return;
      }

      // Prepare Request Data
      const requestData = new FormData();
      Object.keys(formData).forEach((key) => {
        requestData.append(key, formData[key]);
      });

      uploadedFiles.forEach((file) => {
        requestData.append("documents", file);
      });

      // ✅ Send API Request to AI System
      const response = await fetch("http://localhost:5000/api/quotes/request", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: requestData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit the request.");

      console.log("AI Response:", data);
      navigate("/compare-vendors"); // Redirect to compare vendors page
    } catch (error) {
      setErrorMessage(error.message || "Failed to fetch recommendations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>
      <form onSubmit={handleSubmit}>

        {/* 🏢 Business Details */}
        <label>Company Name: <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required /></label>
        <label>Industry Type: <input type="text" name="industryType" value={formData.industryType} onChange={handleChange} required /></label>
        <label>Number of Employees: <input type="number" name="numEmployees" value={formData.numEmployees} onChange={handleChange} required /></label>
        <label>Number of Office Locations: <input type="number" name="numLocations" value={formData.numLocations} onChange={handleChange} required /></label>
        <label>Multiple Floors? <select name="multiFloor" value={formData.multiFloor} onChange={handleChange}><option>Yes</option><option>No</option></select></label>

        {/* 📄 Printer Details */}
        <label>Do you lease or own your machines? <select name="leaseOrOwn" value={formData.leaseOrOwn} onChange={handleChange}><option>Lease</option><option>Own</option></select></label>
        <label>Current Printer Model: <input type="text" name="currentMachines" value={formData.currentMachines} onChange={handleChange} required /></label>
        {formData.leaseOrOwn === "Lease" && (
          <>
            <label>Lease End Date: <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} /></label>
            <label>Monthly Lease Payment (£): <input type="number" name="monthlyLeasePayment" value={formData.monthlyLeasePayment} onChange={handleChange} /></label>
            <label>Settlement Cost (£): <input type="number" name="settlementCost" value={formData.settlementCost} onChange={handleChange} /></label>
          </>
        )}

        {/* 🖨 Printing Usage */}
        <label>Monthly Print Volume (pages): <input type="number" name="printVolume" value={formData.printVolume} onChange={handleChange} required /></label>
        <label>Do you print in color? <select name="printColor" value={formData.printColor} onChange={handleChange}><option>Yes</option><option>No</option></select></label>
        <label>Number of Paper Trays: <select name="paperTrays" value={formData.paperTrays} onChange={handleChange}><option>1 Tray</option><option>2 Trays</option><option>3 Trays</option><option>4+ Trays</option></select></label>

        {/* ⭐ Special Features */}
        <fieldset>
          <legend>Special Features:</legend>
          <label><input type="checkbox" name="specialFeatures" value="Secure Print" onChange={handleChange} /> Secure Print (PIN/User Auth)</label>
          <label><input type="checkbox" name="specialFeatures" value="Stapling & Finishing" onChange={handleChange} /> Stapling & Finishing</label>
          <label><input type="checkbox" name="specialFeatures" value="Cloud Printing" onChange={handleChange} /> Cloud Printing</label>
          <label><input type="checkbox" name="specialFeatures" value="Mobile Printing" onChange={handleChange} /> Mobile Printing</label>
        </fieldset>

        {/* 💰 Budget */}
        <label>Budget Range (£): <input type="text" name="budget" value={formData.budget} onChange={handleChange} required /></label>

        {/* 📂 Upload Documents */}
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Drag & drop lease agreements, invoices, and usage reports here, or click to upload.</p>
        </div>

        {/* 🚀 Submit Button */}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Request"}</button>

      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default RequestQuote;
