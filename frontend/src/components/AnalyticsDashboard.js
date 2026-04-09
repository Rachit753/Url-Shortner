import React, { useEffect, useState } from "react";
import axios from "axios";
import MetricCard from "./MetricCard";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = ({ shortId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shortId) return;

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/url/${shortId}/analytics`,
          { headers: { "Cache-Control": "no-cache" } }
        );

        setData({ ...res.data });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, [shortId]);

  if (!shortId) {
    return <p style={{ color: "white" }}>Enter a URL to generate & view analytics.</p>;
  }

  if (loading) {
    return <div style={{ color: "white" }}>⏳ Fetching analytics...</div>;
  }

  if (!data) {
    return <p style={{ color: "white" }}>No data found.</p>;
  }
  
  const dailyClicks = Object.entries(data.dailyClicks || {}).map(([date, count]) => ({
    date,
    count: Number(count)
  }));

  const browserStats = Object.entries(data.browserStats || {}).map(([name, value]) => ({
    name,
    value: Number(value)
  }));

  const locationStats = Object.entries(data.locationStats || {}).map(([name, value]) => ({
    name,
    value: Number(value)
  }));

  const hasAnalytics =
    data.totalClicks > 0 ||
    dailyClicks.length > 0 ||
    browserStats.length > 0 ||
    locationStats.length > 0;

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>📊 URL Analytics Dashboard</h1>

      <button onClick={() => window.location.reload()}>
        🔄 Refresh Analytics
      </button>

      <p><b>Short ID:</b> {data.shortId}</p>

      <p>
        <b>Original URL:</b>{" "}
        <a href={data.originalUrl} target="_blank" rel="noreferrer">
          {data.originalUrl}
        </a>
      </p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <MetricCard title="Total Clicks" value={data.totalClicks} />
        <MetricCard title="Unique Visitors" value={data.uniqueVisitors} />
      </div>

      {!hasAnalytics && (
        <p style={{ marginTop: "30px", color: "white" }}>
          No analytics yet. Click your short link.
        </p>
      )}

      {dailyClicks.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>📅 Daily Clicks</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyClicks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00a985" />
              <XAxis dataKey="date" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {locationStats.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>🌍 Location Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={locationStats} dataKey="value" nameKey="name" outerRadius={120}>
                {locationStats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

      {browserStats.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>💻 Browser Stats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={browserStats} dataKey="value" nameKey="name" outerRadius={120}>
                {browserStats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;