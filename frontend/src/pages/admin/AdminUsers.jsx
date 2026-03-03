import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/admin/users?page=${page}&limit=10&search=${search}`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  const handleBan = async (userId) => {
  try {
    await API.patch(`/admin/users/${userId}/ban`);
    toast.success("Status updated");
    fetchUsers();
  } catch {
    toast.error("Failed");
  }
};

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  return (
    <div className="container">
      <h2>All Users</h2>
      <input type="text" className="form-control mb-3" placeholder="Search by username or email"value={search}onChange={(e) => {
      setPage(1);
      setSearch(e.target.value);}}/>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleString()}</td>
              <td>
                {user.role !== "admin" && (
                  <button  className={`btn btn-sm ${user.isBanned ? "btn-success" : "btn-warning"}`} onClick={() => handleBan(user._id)}>
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>Page {page} of {totalPages}</span>

        <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)} >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUsers;