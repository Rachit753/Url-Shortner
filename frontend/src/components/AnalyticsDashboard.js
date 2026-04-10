import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import MetricCard from "./MetricCard";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#00F5A0", "#00D9F5", "#FFBB28", "#FF6B6B"];

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(16px)",
  borderRadius: "20px",
  padding: "20px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const glowButton = {
  background: "linear-gradient(135deg, #00F5A0, #00D9F5)",
  border: "none",
  padding: "10px 18px",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const AnalyticsDashboard = ({ shortId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    browser: ""
  });

  const fetchAnalytics = useCallback(async (customFilters = filters) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/url/${shortId}/analytics`,
        {
          params: customFilters,
          headers: { "Cache-Control": "no-cache" }
        }
      );

      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [shortId, filters]);

  useEffect(() => {
    if (!shortId) return;
    fetchAnalytics();
  }, [shortId, fetchAnalytics]);

  if (!shortId) return <p style={{ color: "white" }}>Enter URL</p>;
  if (loading) return <p style={{ color: "white" }}>⏳ Loading...</p>;
  if (!data) return <p style={{ color: "white" }}>No data</p>;

  const dailyClicks = Object.entries(data.dailyClicks || {}).map(([date, count]) => ({ date, count }));
  const browserStats = Object.entries(data.browserStats || {}).map(([name, value]) => ({ name, value }));
  const locationStats = Object.entries(data.locationStats || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{
      minHeight: "100vh",
      padding: "30px",
      background: "radial-gradient(circle at top, #0f2027, #203a43, #2c5364)",
      color: "white"
    }}>

      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: "36px", fontWeight: "700" }}>
          Analytics Dashboard
        </h1>
        <p style={{ opacity: 0.7 }}>Real-time insights & performance</p>
      </motion.div>

      {/* ACTIONS */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button style={glowButton} onClick={() => fetchAnalytics()}>
          🔄 Refresh
        </button>

        <button
          style={glowButton}
          onClick={() => {
            const query = new URLSearchParams(filters).toString();
            window.open(
              `${process.env.REACT_APP_API_URL}/api/url/${shortId}/export?${query}`
            );
          }}
        >
          ⬇ Export CSV
        </button>
      </div>

      <motion.div
        style={{ ...glass, marginTop: "30px" }}
        whileHover={{ scale: 1.02 }}
      >
        <h3>Filters</h3>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <input type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          <select
            value={filters.browser}
            onChange={(e) => setFilters({ ...filters, browser: e.target.value })}
          >
            <option value="">All</option>
            <option value="Chrome">Chrome</option>
            <option value="Edge">Edge</option>
            <option value="Firefox">Firefox</option>
          </select>

          <button style={glowButton} onClick={() => fetchAnalytics(filters)}>
            Apply
          </button>
        </div>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
        gap: "20px",
        marginTop: "30px"
      }}>
        <motion.div style={glass} whileHover={{ scale: 1.05 }}>
          <MetricCard title="Total Clicks" value={data.totalClicks} />
        </motion.div>

        <motion.div style={glass} whileHover={{ scale: 1.05 }}>
          <MetricCard title="Visitors" value={data.uniqueVisitors} />
        </motion.div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px,1fr))",
        gap: "20px",
        marginTop: "40px"
      }}>

        {dailyClicks.length > 0 && (
          <motion.div style={glass} whileHover={{ scale: 1.02 }}>
            <h3>📈 Daily Clicks</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyClicks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00F5A0" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00F5A0"
                  strokeWidth={3}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {locationStats.length > 0 && (
          <motion.div style={glass}>
            <h3>🌍 Location</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={locationStats}
                  dataKey="value"
                  nameKey="name"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {locationStats.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {browserStats.length > 0 && (
          <motion.div style={glass}>
            <h3>💻 Browsers</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={browserStats}
                  dataKey="value"
                  nameKey="name"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {browserStats.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsDashboard;