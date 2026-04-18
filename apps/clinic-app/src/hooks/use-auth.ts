import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("local_auth") === "true"
  );
  const [isLoading, setIsLoading] = useState(false);

  const user = {
    firstName: "دكتورة",
    lastName: "سعاد",
    email: "doctor@clinic.com",
    id: "local",
    role: "doctor"
  };

  const login = () => {
    localStorage.setItem("local_auth", "true");
    setIsAuthenticated(true);
    window.location.href = "/";
  };

  const logout = () => {
    localStorage.removeItem("local_auth");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
}
