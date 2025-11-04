import React, { useEffect, useState } from "react";
import axios from "axios";
import MetricCard from "./MetricCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [shortId, setShortId] = useState("U-o1oa9E"); // 🔧 change to your shortId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch analytics
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/url/${shortId}/analytics`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching analytics:", err);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAnalytics();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchAnalytics, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [shortId]);

  if (loading) return <p>Loading analytics...</p>;
  if (!data) return <p>No data found.</p>;

  const dailyClicks = Object.entries(data.dailyClicks || {}).map(([date, count]) => ({ date, count }));
  const browserStats = Object.entries(data.browserStats || {}).map(([name, value]) => ({ name, value }));
  const locationStats = Object.entries(data.locationStats || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>📊 URL Analytics Dashboard</h1>

      {/* Input box for dynamic shortId */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={shortId}
          onChange={(e) => setShortId(e.target.value)}
          placeholder="Enter short ID..."
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
      </div>

      <p><b>Short ID:</b> {data.shortId}</p>
      <p><b>Original URL:</b> {data.originalUrl}</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <MetricCard title="Total Clicks" value={data.totalClicks} />
        <MetricCard title="Unique Visitors" value={data.uniqueVisitors} />
      </div>

      <h2 style={{ marginTop: "40px" }}>📅 Daily Clicks</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyClicks}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>🌍 Location Breakdown</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={locationStats}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {locationStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: "40px" }}>💻 Browser Stats</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={browserStats}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {browserStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsDashboard;
