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
    budget: "",
    colour: "Black & White",
    min_speed: "",
    max_lease_price: "",
    required_functions: [],
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
        required_functions: checked
          ? [...prev.required_functions, value]
          : prev.required_functions.filter((item) => item !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Handle File Upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        alert("You must be logged in to submit a quote request.");
        navigate("/login");
        return;
      }

      console.log("🚀 Preparing API request...");
      let response, data;

      if (uploadedFiles.length > 0) {
        // ✅ If there are files, send `multipart/form-data`
        const requestData = new FormData();
        requestData.append("userRequirements", JSON.stringify(formData));
        requestData.append("userId", userId);
        uploadedFiles.forEach((file) => requestData.append("documents", file));

        console.log("📤 Sending API Request with files...");

        response = await fetch("http://localhost:5000/api/quotes/request", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // ✅ FormData handles Content-Type
          body: requestData,
        });
      } else {
        // ✅ If no files, send `application/json`
        console.log("📤 Sending API Request without files...");

        response = await fetch("http://localhost:5000/api/quotes/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userRequirements: formData, userId }),
        });
      }

      data = await response.json();
      console.log("📩 Response data:", data);

      if (!response.ok) throw new Error(data.message || "Failed to submit the request.");

      console.log("✅ Quote request submitted successfully!");
      navigate("/compare-vendors");

    } catch (error) {
      console.error("❌ Error submitting quote:", error);
      setErrorMessage(error.message || "Failed to fetch recommendations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-quote-container">
      <h2>Request a Quote</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label>Company Name: <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required /></label>
        <label>Industry Type: <input type="text" name="industryType" value={formData.industryType} onChange={handleChange} required /></label>
        <label>Number of Employees: <input type="number" name="numEmployees" value={formData.numEmployees} onChange={handleChange} required /></label>
        <label>Number of Office Locations: <input type="number" name="numLocations" value={formData.numLocations} onChange={handleChange} required /></label>
        <label>Multiple Floors? 
          <select name="multiFloor" value={formData.multiFloor} onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>Colour Preference: 
          <select name="colour" value={formData.colour} onChange={handleChange} required>
            <option value="Black & White">Black & White</option>
            <option value="Color">Color</option>
          </select>
        </label>

        <label>Minimum Speed (PPM): 
          <input type="number" name="min_speed" value={formData.min_speed} onChange={handleChange} required />
        </label>

        <label>Maximum Lease Price (£): 
          <input type="number" name="max_lease_price" value={formData.max_lease_price} onChange={handleChange} required />
        </label>

        <fieldset>
          <legend>Required Functions:</legend>
          <label><input type="checkbox" name="required_functions" value="Scanning" checked={formData.required_functions.includes("Scanning")} onChange={handleChange} /> Scanning</label>
          <label><input type="checkbox" name="required_functions" value="Fax" checked={formData.required_functions.includes("Fax")} onChange={handleChange} /> Fax</label>
          <label><input type="checkbox" name="required_functions" value="Wireless Printing" checked={formData.required_functions.includes("Wireless Printing")} onChange={handleChange} /> Wireless Printing</label>
          <label><input type="checkbox" name="required_functions" value="Duplex Printing" checked={formData.required_functions.includes("Duplex Printing")} onChange={handleChange} /> Duplex Printing</label>
        </fieldset>

        {/* 📂 Upload Documents */}
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Drag & drop lease agreements, invoices, and usage reports here, or click to upload.</p>
        </div>
        <p>{uploadedFiles.length} file(s) selected</p>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestQuote;
