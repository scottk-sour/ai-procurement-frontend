import React from 'react';
import { useParams } from 'react-router-dom';

const AdminVendorDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Vendor Details</h1>
      <p>Vendor ID: {id}</p>
    </div>
  );
};

export default AdminVendorDetails;
