import React, { useState } from "react";
import UrlCreator from "./components/UrlCreator";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  const [activeShortId, setActiveShortId] = useState("");

  return (
    <div>
      <UrlCreator onAnalytics={setActiveShortId} />
      <AnalyticsDashboard shortId={activeShortId} />
    </div>
  );
}

export default App;
