import ShortenForm from "../components/ShortenForm";
import MyUrls from "../components/MyUrls";
import TopUrls from "../components/TopUrls";
import { useAuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Dashboard() {
  const [myUrlsKey, setMyUrlsKey] = useState(0);
  const { user, loading, setUser } = useAuthContext();
  const navigate=useNavigate()
  if (loading) return <p className="text-center mt-5">Loading...</p>;
  const handleLogout = async () => {
    try {
      await API.post("/user/logout");
      setUser(null);
      navigate('/login')
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container mt-4">
      {user && (
        <button onClick={handleLogout}>LogOut</button>
      )}
      <h1 className="mb-4">BlinkLink 🔗</h1>

      <div className="card p-4 mb-4 shadow-sm">
        <h5>Create Short URL</h5>
        <ShortenForm onCreated={() => {
   setMyUrlsKey(prev => prev + 1);
}} />
      </div>

      {user && (
        <div className="card p-4 mb-4 shadow-sm">
          <h5>My URLs</h5>
          <MyUrls key={myUrlsKey} />
        </div>
      )}

      {!user && (
        <p className="text-muted mb-4">
          Login to manage and track your URLs.
        </p>
      )}

      <div className="card p-4 shadow-sm">
        <h5>Top 10 Public URLs</h5>
        <TopUrls />
      </div>
    </div>
  );
}

export default Dashboard;