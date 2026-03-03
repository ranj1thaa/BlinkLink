import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AdminUrls = () => {
  const [urls, setUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const fetchUrls = async () => {
    try {
      const { data } = await API.get(
        `/admin/urls?page=${page}&limit=10&search=${search}`
      );

      setUrls(data.urls);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch URLs");
    }
  };

  const handleDelete = async (shortCode) => {
    if (!window.confirm("Delete this URL?")) return;

    try {
      await API.delete(`/admin/urls/${shortCode}`);
      toast.success("Deleted");
      fetchUrls();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [page, search]);

  return (
    <div className="container">
      <h2>All URLs</h2>
      <input
  type="text"
  className="form-control mb-3"
  placeholder="Search by short code or original URL"
  value={search}
  onChange={(e) => {
    setPage(1);
    setSearch(e.target.value);
  }}
/>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ShortCode</th>
            <th>User</th>
            <th>Clicks</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {urls.map(url => (
            <tr key={url._id}>
              <td>{url.shortCode}</td>
              <td>{url.createdBy?.email}</td>
              <td>{url.clicks}</td>
              <td>{url.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(url.shortCode)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between mt-3">
  <button
    className="btn btn-secondary"
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>

  <span>Page {page} of {totalPages}</span>

  <button
    className="btn btn-secondary"
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>
</div>
    </div>
  );
};

export default AdminUrls;