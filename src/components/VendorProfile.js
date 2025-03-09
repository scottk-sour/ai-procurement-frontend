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
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [error, setError] = useState('');
  const availableServiceAreas = ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh'];
  const token = localStorage.getItem('vendorToken');

  // Fetch vendor profile on mount
  useEffect(() => {
    if (!token) {
      navigate('/vendor-login');
      return;
    }

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

  // Handle text input changes
  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  // Handle multi-select service areas
  const handleServiceAreaChange = (e) => {
    const selectedAreas = Array.from(e.target.selectedOptions, (option) => option.value);
    setVendor({ ...vendor, serviceAreas: selectedAreas });
  };

  // Handle logo upload with preview and loading state
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingLogo(true);
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
      .catch((error) => {
        console.error('Error uploading logo:', error);
        setError('Failed to upload logo. Please try again.');
      })
      .finally(() => setLoadingLogo(false));
  };

  // Validate and submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vendor.companyName || !vendor.contactEmail) {
      setError('Company name and contact email are required.');
      return;
    }

    axios
      .put('http://localhost:5000/api/vendors/profile', vendor, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => alert('Profile updated successfully!')) // Replace with toast in production
      .catch((error) => {
        console.error('Error updating profile:', error);
        setError('Failed to update profile. Please try again.');
      });
  };

  return (
    <div className="vendor-profile-container">
      <h2>Edit Vendor Profile</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={vendor.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contact Email:</label>
          <input
            type="email"
            name="contactEmail"
            value={vendor.contactEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={vendor.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Business Type:</label>
          <input
            type="text"
            name="businessType"
            value={vendor.businessType}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Service Areas:</label>
          <select multiple value={vendor.serviceAreas} onChange={handleServiceAreaChange}>
            {availableServiceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Company Logo:</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          {loadingLogo && <div className="loading-spinner">Uploading...</div>}
          {logoPreview && <img src={logoPreview} alt="Company Logo" className="logo-preview" />}
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default VendorProfile;