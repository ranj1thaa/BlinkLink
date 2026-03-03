import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) return <p>Checking auth...</p>;

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
};

export default AdminRoute;