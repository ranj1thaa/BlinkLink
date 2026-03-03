import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const useAuthContext=()=>useContext(AuthContext)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await API.get("/user/me")
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  checkAuth();
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider