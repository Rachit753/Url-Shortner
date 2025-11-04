import React from "react";

const MetricCard = ({ title, value }) => {
  return (
    <div className="metric-card" style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      flex: 1
    }}>
      <h3 style={{ marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
    </div>
  );
};

export default MetricCard;
