// Save Token to Local Storage
export const setToken = (token) => {
    if (token && typeof token === "string") {
      localStorage.setItem("token", token);
    } else {
      console.warn("Invalid token provided");
    }
  };
  
  // Retrieve Token
  export const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  
  // Check if User is Authenticated (with expiration check for JWT)
  export const isAuthenticated = () => {
    const token = getAuthToken();
    if (!token) return false;
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiration; // Check if token is still valid
    } catch (error) {
      console.error("Invalid token format:", error);
      return false;
    }
  };
  
  // Remove Token (Logout)
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("vendorId");
    localStorage.removeItem("role");
  };
  
  // Save User ID
  export const setUserId = (userId) => {
    if (userId && typeof userId === "string") {
      localStorage.setItem("userId", userId);
    } else {
      console.warn("Invalid userId provided");
    }
  };
  
  // Retrieve User ID
  export const getUserId = () => {
    return localStorage.getItem("userId");
  };
  
  // Save User Role
  export const setRole = (role) => {
    const validRoles = ["user", "admin", "vendor"]; // Define valid roles
    if (role && validRoles.includes(role)) {
      localStorage.setItem("role", role);
    } else {
      console.warn("Invalid role provided");
    }
  };
  
  // Retrieve User Role
  export const getRole = () => {
    return localStorage.getItem("role");
  };
  
  // ------------------------------
  // **Vendor-Specific Functions**
  // ------------------------------
  
  // Save Vendor Token
  export const setVendorToken = (token) => {
    if (token && typeof token === "string") {
      localStorage.setItem("vendorToken", token);
    } else {
      console.warn("Invalid vendor token provided");
    }
  };
  
  // Retrieve Vendor Token
  export const getVendorToken = () => {
    return localStorage.getItem("vendorToken");
  };
  
  // Save Vendor ID
  export const setVendorId = (vendorId) => {
    if (vendorId && typeof vendorId === "string") {
      localStorage.setItem("vendorId", vendorId);
    } else {
      console.warn("Invalid vendorId provided");
    }
  };
  
  // Retrieve Vendor ID
  export const getVendorId = () => {
    return localStorage.getItem("vendorId");
  };
  