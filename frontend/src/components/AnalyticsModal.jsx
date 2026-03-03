import { Bar, Line } from "react-chartjs-2";
import QrCodeDisplay from "./QrCodeDisplay";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Filler,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";


ChartJS.register(
  Filler,
  CategoryScale, 
  LinearScale, 
  BarElement,    
  LineElement,  
  PointElement, 
  Title,
  Tooltip,
  Legend
);
function AnalyticsModal({ analytics, selectedCode, onClose }) {
  const PUBLIC = import.meta.env.VITE_PUBLIC_URL || "http://localhost:3001";
  if (!analytics) return null;
  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <h4>Total Clicks: {analytics.totalClicks}</h4>
          <button
            className="btn btn-sm btn-danger float-end"
            onClick={onClose}
          >
            Close
          </button>

          <QrCodeDisplay
            qrCode={analytics.qrCode}
            url={`${PUBLIC}/${selectedCode}`}
            fileName={`${selectedCode}_qrCode.png`}
          />

          {analytics.countries?.length > 0 && (
            <>
              <Bar
                data={{
                  labels: analytics.countries.map(c => c.country),
                  datasets: [{
                    label: "Clicks by Country",
                    data: analytics.countries.map(c => c.count),
                    backgroundColor: analytics.countries.map(() => `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`),
                    borderColor: "rgba(0,0,0,0.8)",
                    borderWidth: 1
                  }]
                }}
              />

              <Bar
                data={{
                  labels: analytics.browsers.map(b => b.browser),
                  datasets: [{
                    label: "Clicks by Browser",
                    data: analytics.browsers.map(b => b.count),
                    backgroundColor: analytics.browsers.map(() => `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`),
                    borderColor: "rgba(0,0,0,0.8)",
                    borderWidth: 1
                  }]
                }}
              />

              <Bar
                data={{
                  labels: analytics.devices.map(d => d.device),
                  datasets: [{
                    label: "Clicks by Device",
                    data: analytics.devices.map(d => d.count),
                    backgroundColor: analytics.devices.map(() => `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.6)`),
                    borderColor: "rgba(0,0,0,0.8)",
                    borderWidth: 1
                  }]
                }}
              />

              <Line
                data={{
                  labels: analytics.timeline.map(t => t.date),
                  datasets: [{
                    label: "Clicks Over Time",
                    data: analytics.timeline.map(t => t.count),
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    tension: 0.4,
                    fill: true
                  }]
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsModal;