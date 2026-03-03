import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

function ShortenForm({onCreated}) {
  const PUBLIC = import.meta.env.VITE_PUBLIC_URL || "http://localhost:3001";
  const [form, setForm] = useState({
    originalUrl: "",
    customCode: "",
    expirationDate: ""
  });

  const [createdUrl, setCreatedUrl] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        originalUrl: form.originalUrl,
      };

      if (form.customCode) payload.customCode = form.customCode;
      if (form.expirationDate) {
        const selectedDate = new Date(form.expirationDate);
        const today = new Date();

        const diffTime = selectedDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        payload.expiresInDays = diffDays;
      }
      const { data } = await API.post("/url/shorten", payload);
      setCreatedUrl(data);
      toast.success("Short URL created!");
      if (onCreated) {
        onCreated(data);
      }
      setForm({
        originalUrl: "",
        customCode: "",
        expirationDate: ""
      });
      

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      createdUrl.shortUrl
    );
    toast.success("Copied to clipboard!");
  };
  return (
    <div className="mt-4">

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="url"
            name="originalUrl"
            className="form-control"
            placeholder="Enter URL"
            value={form.originalUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="customCode"
            className="form-control"
            placeholder="Custom short code (optional)"
            value={form.customCode}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <input
            type="datetime-local"
            name="expirationDate"
            className="form-control"
            value={form.expirationDate}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-dark w-100">
          Shorten
        </button>
      </form>

      {createdUrl && (
        <div className="alert alert-success mt-4 d-flex justify-content-between align-items-center">
          <a  href={`${PUBLIC}/${createdUrl.shortCode}`}  target="_blank"  rel="noreferrer">
            {createdUrl.shortCode}
          </a>

          <button
            className="btn btn-sm btn-outline-dark"
            onClick={copyToClipboard}
          >
            Copy
          </button>
        </div>
      )}

    </div>
  );
}

export default ShortenForm;