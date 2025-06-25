import { useState } from 'react';

// Dashboard route configuration
export const DASHBOARD_ROUTES = {
  individual: "/individual-home",
  institute: "/institute-home", 
  admin: "/admin-home",
  staff: "/staff-home"
};

// Loading messages for different user types
export const LOADING_MESSAGES = {
  individual: "Setting up your home...",
  institute: "Loading institute portal...",
  admin: "Accessing admin panel...",
  staff: "Connecting to staff portal..."
};

// Navigation hook with loading state management
export const useNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState("");

  const navigateToUserDashboard = (userType, delay = 2000) => {
    setIsNavigating(true);
    setNavigationMessage(LOADING_MESSAGES[userType] || "Loading dashboard...");
    
    // Store user type in localStorage for future reference
    localStorage.setItem("userType", userType);
    
    // Simulate loading time then redirect
    setTimeout(() => {
      const route = DASHBOARD_ROUTES[userType];
      if (route) {
        window.location.href = route;
      } else {
        console.error("Unknown user type:", userType);
        setIsNavigating(false);
        setNavigationMessage("");
      }
    }, delay);
  };

  const clearNavigation = () => {
    setIsNavigating(false);
    setNavigationMessage("");
  };

  return {
    isNavigating,
    navigationMessage,
    navigateToUserDashboard,
    clearNavigation
  };
};

// Utility function to get user type from token (if JWT)
export const getUserTypeFromToken = (token) => {
  try {

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userType || payload.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Utility function to handle different authentication responses
export const handleAuthSuccess = (response, navigateToUserDashboard) => {
  const { token, userType, user } = response;
  
  // Store authentication data
  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  
  // Navigate to appropriate dashboard
  navigateToUserDashboard(userType);
  
  return { success: true, userType };
};

// Check if user is already authenticated and redirect if needed
export const checkAuthAndRedirect = () => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  
  if (token && userType) {
    const route = DASHBOARD_ROUTES[userType];
    if (route && window.location.pathname === "/login") {
      window.location.href = route;
      return true;
    }
  }
  return false;
};