// src/components/ViewOrders.js
import React, { useState, useEffect } from 'react';
import './ViewOrders.css';

function ViewOrders() {
  const [orders, setOrders] = useState([
    { id: 1, name: "Product A", date: "2024-11-01", status: "Completed" },
    { id: 2, name: "Service B", date: "2024-10-28", status: "Pending" },
    { id: 3, name: "Product C", date: "2024-10-25", status: "Shipped" },
  ]);

  useEffect(() => {
    // This is where you could fetch orders from the backend API
    // axios.get('/api/orders').then(response => setOrders(response.data));
  }, []);

  const handleViewDetails = (orderId) => {
    alert(`Viewing details for order #${orderId}`);
    // Implement navigation or modal to show order details
  };

  const handleCancelOrder = (orderId) => {
    const confirmed = window.confirm(`Are you sure you want to cancel order #${orderId}?`);
    if (confirmed) {
      // Call the API to cancel the order, and update state if necessary
      setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
      alert(`Order #${orderId} canceled.`);
    }
  };

  return (
    <div className="view-orders-container">
      <h2>My Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product/Service Name</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.name}</td>
              <td>{order.date}</td>
              <td>{order.status}</td>
              <td>
                <button onClick={() => handleViewDetails(order.id)}>View Details</button>
                {order.status === "Pending" && (
                  <button onClick={() => handleCancelOrder(order.id)} className="cancel-button">
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewOrders;
