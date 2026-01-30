import React, { useState } from "react";
import UrlCreator from "./components/UrlCreator";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./App.css";

function App() {
  const [activeShortId, setActiveShortId] = useState("");

  return (
    <div className="App">
      <UrlCreator onAnalytics={(id) => setActiveShortId(id)} />

      {/* Only show dashboard after a short URL is created */}
      {activeShortId ? (
        <AnalyticsDashboard shortId={activeShortId} />
      ) : (
        <p style={{ marginTop: "30px", color: "white" }}>
          Enter a URL to generate & view analytics.
        </p>
      )}
    </div>
  );
}

export default App;

