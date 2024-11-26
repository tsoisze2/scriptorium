import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// Define the shape of the AuthContext
interface AuthContextProps {
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load tokens from localStorage when the app starts
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    setAccessToken(storedAccessToken);
    setRefreshToken(storedRefreshToken);
  }, []);

  // Function to handle login
  const login = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  // Function to handle logout
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/users/login");
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await axios.post("/api/user/refresh", { refreshToken });
      const newAccessToken = response.data.accessToken;
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
