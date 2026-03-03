import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

function Login() {
  const {setUser} =useAuthContext()
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    
    const { data } = await API.post("/user/login", form);

    toast.success(data.message || "Login successful");

    setUser(data.user);

    const user = data.user;   

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }

  } catch (err) {
    if (err.response) {
      const errors = err.response.data.errors;

      if (errors && errors.length > 0) {
        toast.error(errors[0].msg);
      } else {
        toast.error(err.response.data.message || "Login failed");
      }
    } else {
      toast.error("Server not reachable");
    }
  }
};

  return (
    <div className="container mt-5">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-success w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;