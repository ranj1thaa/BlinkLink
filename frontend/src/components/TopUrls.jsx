import { useEffect, useState } from "react";
import API from "../api/axios";

function TopUrls() {
  const PUBLIC = import.meta.env.VITE_PUBLIC_URL || "http://localhost:3001";
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const { data } = await API.get("/url/top");
        setUrls(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTop();
  }, []);

  return (
    <div className="mt-5">
      <ul className="list-group">
        {urls.map((url) => (
          <li key={url.shortCode} className="list-group-item d-flex justify-content-between">
            <a
              href={`${PUBLIC}/${url.shortCode}`}
              target="_blank"
            >
              {url.shortCode}
            </a>
            <span>{url.clicks} clicks</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopUrls;