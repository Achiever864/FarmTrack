import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("farmtrack_token"));
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null); // null = Individual Mode

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.auth.getMe();
        setUser(user);
        await refreshOrganizations();
      } catch (err) {
        console.error("Auth initialization failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  async function refreshOrganizations() {
    try {
      const orgs = await api.orgs.listMine();
      setOrganizations(orgs);
      // If activeOrg was set, update it or keep it
      if (activeOrg) {
        const found = orgs.find((o) => o._id === activeOrg._id);
        if (found) setActiveOrg(found);
      }
    } catch (err) {
      console.error("Failed to load organizations:", err);
    }
  }

  function login(newToken, userData) {
    localStorage.setItem("farmtrack_token", newToken);
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("farmtrack_token");
    setToken(null);
    setUser(null);
    setActiveOrg(null);
    setOrganizations([]);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        organizations,
        activeOrg,
        setActiveOrg,
        refreshOrganizations,
        isOrgMode: !!activeOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
