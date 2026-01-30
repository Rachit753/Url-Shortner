import React from "react";

const MetricCard = ({ title, value }) => {
  return (
    <div className="metric-card">
      <h3 style={{ marginBottom: "8px", fontWeight: "600" }}>{title}</h3>
      <p style={{ fontSize: "2rem", fontWeight: "700" }}>{value}</p>
    </div>
  );
};

export default MetricCard;
