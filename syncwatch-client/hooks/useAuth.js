import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useAuth() {
  const [user, setUser] = useState(null);     
  const [authLoading, setAuthLoading] = useState(true); 

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, {
      credentials: "include", 
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {}) 
      .finally(() => setAuthLoading(false));
  }, []);

  async function register(email, username, password) {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Registration failed");

    setUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Login failed");

    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  return { user, authLoading, register, login, logout };
}