import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import AnalyticsModal from "./AnalyticsModal";

function MyUrls() {
  const PUBLIC = import.meta.env.VITE_PUBLIC_URL || "http://localhost:3001";
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const fetchMyUrls = async (pageNum = 1, append = false) => {
    try {
      if (pageNum < 1) return; 
      const { data } = await API.get(`/url/my?page=${pageNum}&limit=5`);
      setUrls(prev => append ? [...prev, ...data.data] : data.data);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.log(err)
      toast.error("Failed to fetch your URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUrls();
  }, []);

  const openAnalytics = async (shortCode) => {
    try {
      const url = urls.find(u => u.shortCode === shortCode); 
      const analyticsRes = await API.get(`/url/analytics/${shortCode}`);
      const timelineRes = await API.get(`/url/analytics/${shortCode}/timeline`);

      setAnalytics({
        ...analyticsRes.data,
        timeline: timelineRes.data.timeline,
        qrCode: url.qrCode 
      });
      setSelectedCode(shortCode);
    } catch (err) {
      toast.error("Failed to load analytics");
      console.error(err);
    }
  };



  if (loading) return <p>Loading your URLs...</p>;

  return (
    <div className="mt-4">
      {urls.length === 0 && <p className="mt-4">No URLs created yet.</p>}

      <table className="table table-bordered table-hover table-responsive">
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Clicks</th>
            <th>Status</th>
            <th>Expires</th>
            <th>Toggle</th>
            <th>Delete</th>
            <th>Analytics</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr key={url._id}>
              <td>
                <a href={`${PUBLIC}/${url.shortCode}`} target="_blank" rel="noreferrer">
                  {url.shortCode}
                </a>
              </td>
              <td>{url.clicks}</td>
              <td>{url.isActive ? "Active" : "Inactive"}</td>
              <td>{url.expiresAt ? new Date(url.expiresAt).toLocaleString() : "No Expiry"}</td>
              <td>
                <button className="btn btn-sm btn-warning"
                  onClick={async () => {
                    try {
                      await API.patch(`/url/${url.shortCode}/toggle`);
                      fetchMyUrls();
                    } catch {
                      toast.error("Failed to toggle");
                    }
                  }}>
                  {url.isActive && "Deactivate"}
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={async () => {
                  if (!window.confirm("Are you sure you want to delete this URL?")) return;
                  try {
                    await API.delete(`/url/${url.shortCode}`);
                    fetchMyUrls();
                  } catch {
                    toast.error("Delete failed");
                  }
                }}>
                  Delete
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-info" onClick={() => openAnalytics(url.shortCode)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCode && analytics && (
        <AnalyticsModal
          analytics={analytics}
          selectedCode={selectedCode}
          onClose={() => {
            setSelectedCode(null);
            setAnalytics(null);
          }}
        />
      )}
      <div className="d-flex justify-content-center mt-3 gap-2">
  <button
    className="btn btn-sm btn-secondary"
    disabled={page <= 1}
    onClick={() => fetchMyUrls(page - 1)}
  >
    Previous
  </button>
  <span>Page {page} of {totalPages}</span>
  <button
    className="btn btn-sm btn-secondary"
    disabled={page >= totalPages}
    onClick={() => fetchMyUrls(page + 1)}
  >
    Next
  </button>
</div>
    </div>
  );
}

export default MyUrls;