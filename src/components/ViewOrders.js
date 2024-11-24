// src/components/ViewOrders.js
import React, { useState, useEffect } from 'react';
import './ViewOrders.css';

function ViewOrders() {
  const [orders, setOrders] = useState([
    { id: 1, name: "Product A", date: "2024-11-01", status: "Completed" },
    { id: 2, name: "Service B", date: "2024-10-28", status: "Pending" },
    { id: 3, name: "Product C", date: "2024-10-25", status: "Shipped" },
  ]);

  const [showForm, setShowForm] = useState(false); // Controls visibility of the Edit Order form
  const [currentOrder, setCurrentOrder] = useState(null); // Holds the currently edited order

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

  const handleEditOrder = (order) => {
    setCurrentOrder(order); // Load the selected order into the form
    setShowForm(true); // Show the modal
  };

  const handleSaveOrder = (e) => {
    e.preventDefault();
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === currentOrder.id ? currentOrder : order
      )
    );
    setShowForm(false); // Close the modal
    alert(`Order #${currentOrder.id} has been updated.`);
  };

  const handleFormChange = (field, value) => {
    setCurrentOrder((prevOrder) => ({ ...prevOrder, [field]: value }));
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
                <button onClick={() => handleEditOrder(order)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Order Modal */}
      {showForm && currentOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Order #{currentOrder.id}</h3>
            <form onSubmit={handleSaveOrder}>
              <label>
                Product/Service Name:
                <input
                  type="text"
                  value={currentOrder.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                />
              </label>
              <label>
                Order Date:
                <input
                  type="date"
                  value={currentOrder.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  required
                />
              </label>
              <label>
                Status:
                <select
                  value={currentOrder.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewOrders;
