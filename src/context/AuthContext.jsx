import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        const dm = parsedUser.dark_mode || false;
        setDarkMode(dm);
        if (dm) document.documentElement.classList.add("dark");
      }
    } catch(e) {
      localStorage.clear();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login/", { email, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    const dm = res.data.user.dark_mode || false;
    setDarkMode(dm);
    if (dm) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return res.data.user;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setDarkMode(false);
    document.documentElement.classList.remove("dark");
  };

  const register = async (data) => {
    const res = await API.post("/auth/register/", data);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const toggleDarkMode = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      const updatedUser = { ...user, dark_mode: newMode };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      await API.patch("/auth/profile/", { dark_mode: newMode });
    } catch(e) {
      console.error("Dark mode toggle failed", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
