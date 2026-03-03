import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminNavbar from "./AdminNavBar";
import { Line, Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryRes, analyticsRes] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/global-analytics")
      ]);

      setSummary(summaryRes.data);
      setAnalytics(analyticsRes.data);

    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;
  if (!summary || !analytics) return null;

  return (
    <>
      <AdminNavbar />

      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 text-center shadow-sm">
              <h5>Total Users</h5>
              <h3>{summary.totalUsers}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 text-center shadow-sm">
              <h5>Total URLs</h5>
              <h3>{summary.totalUrls}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 text-center shadow-sm">
              <h5>Total Clicks</h5>
              <h3>{summary.totalClicks}</h3>
            </div>
          </div>
        </div>
        <div className="row mt-4">

  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>Clicks Today</h6>
      <h4>{summary.clicksToday}</h4>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>Clicks Yesterday</h6>
      <h4>{summary.clicksYesterday}</h4>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>Click Growth</h6>
      <h4>
        {summary.clickGrowth}%
      </h4>
    </div>
  </div>

</div>
        <div className="card p-4 mb-4 shadow-sm">
          <h5>Global Click Trend</h5>
          <Line
            data={{
              labels: analytics.timeline.map(t => t.date),
              datasets: [{
                label: "Clicks",
                data: analytics.timeline.map(t => t.count),
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.2)",
                fill: true
              }]
            }}
          />
        </div>

        <div className="card p-4 mb-4 shadow-sm">
          <h5>Clicks by Country</h5>
          <Bar
            data={{
              labels: analytics.countries.map(c => c.country),
              datasets: [{
                label: "Clicks",
                data: analytics.countries.map(c => c.count),
                backgroundColor: "rgba(255,99,132,0.6)"
              }]
            }}
          />
        </div>

        <div className="card p-4 shadow-sm">
          <h5>Top URLs</h5>
          <ul>
            {analytics.topUrls.map(url => (
              <li key={url.shortCode}>
                {url.shortCode} — {url.clicks} clicks
              </li>
            ))}
          </ul>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;