import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if a token exists and fetch the current user
  useEffect(() => {
    const token = localStorage.getItem("hms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("hms_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("hms_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
