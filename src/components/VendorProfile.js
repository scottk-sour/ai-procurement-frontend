import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/VendorProfile.css';

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState({
    companyName: '',
    contactEmail: '',
    phoneNumber: '',
    businessType: '',
    serviceAreas: [],
    companyLogo: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const availableServiceAreas = ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh'];
  const token = localStorage.getItem('vendorToken');

  useEffect(() => {
    if (!token) {
      navigate('/vendor-login');
      return;
    }

    // Fetch existing vendor profile
    axios
      .get('http://localhost:5000/api/vendors/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setVendor(response.data);
        if (response.data.companyLogo) {
          setLogoPreview(response.data.companyLogo);
        }
      })
      .catch((error) => console.error('Error fetching vendor profile:', error));
  }, [navigate, token]);

  // Handle form input changes
  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  // Handle service area selection
  const handleServiceAreaChange = (e) => {
    const selectedAreas = Array.from(e.target.selectedOptions, (option) => option.value);
    setVendor({ ...vendor, serviceAreas: selectedAreas });
  };

  // Handle logo upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('companyLogo', file);

    axios
      .post('http://localhost:5000/api/vendors/upload-logo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setLogoPreview(response.data.logoUrl);
        setVendor({ ...vendor, companyLogo: response.data.logoUrl });
      })
      .catch((error) => console.error('Error uploading logo:', error));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put('http://localhost:5000/api/vendors/profile', vendor, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => alert('Profile updated successfully!'))
      .catch((error) => console.error('Error updating profile:', error));
  };

  return (
    <div className="vendor-profile-container">
      <h2>Edit Vendor Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Company Name:</label>
        <input
          type="text"
          name="companyName"
          value={vendor.companyName}
          onChange={handleChange}
          required
        />

        <label>Contact Email:</label>
        <input
          type="email"
          name="contactEmail"
          value={vendor.contactEmail}
          onChange={handleChange}
          required
        />

        <label>Phone Number:</label>
        <input
          type="text"
          name="phoneNumber"
          value={vendor.phoneNumber}
          onChange={handleChange}
        />

        <label>Business Type:</label>
        <input
          type="text"
          name="businessType"
          value={vendor.businessType}
          onChange={handleChange}
        />

        <label>Service Areas:</label>
        <select multiple value={vendor.serviceAreas} onChange={handleServiceAreaChange}>
          {availableServiceAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <label>Company Logo:</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        {logoPreview && <img src={logoPreview} alt="Company Logo" className="logo-preview" />}

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default VendorProfile;
