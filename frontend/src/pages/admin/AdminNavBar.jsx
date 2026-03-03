import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import API from "../../api/axios";

export default function AdminNavbar() {
  const { setUser } = useAuthContext();

  const handleLogout = async () => {
    await API.post("/user/logout");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/admin/dashboard">Admin Panel</Link>
        <div className="d-flex">
          <Link className="btn btn-outline-primary me-2" to="/admin/users">Users</Link>
          <Link className="btn btn-outline-secondary me-2" to="/admin/urls">URLs</Link>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}