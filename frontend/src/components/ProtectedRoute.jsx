import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) return <p className="text-center mt-5">Checking auth...</p>;

  if (!user) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;