import React, { useState } from "react";
import axios from "axios";

const UrlCreator = ({ onAnalytics }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const endpoint = customCode
        ? "http://localhost:5000/api/url/custom"
        : "http://localhost:5000/api/url/shorten";

      const payload = customCode
        ? { originalUrl, customCode }
        : { originalUrl };

      const res = await axios.post(endpoint, payload);
      setShortUrl(res.data.shortUrl);

      // pass the shortId (customCode or generated) to parent to show analytics
      onAnalytics(res.data.shortId || customCode);
    } catch (err) {
      setError("Failed to shorten URL. Check backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", borderBottom: "1px solid #ccc" }}>
      <h2>🔗 Create a Short URL</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Enter original URL (e.g. https://example.com)"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          style={{ flex: 2, padding: "8px" }}
          required
        />
        <input
          type="text"
          placeholder="Custom short code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Processing..." : "Shorten"}
        </button>
      </form>

      {shortUrl && (
        <p style={{ marginTop: "10px" }}>
          ✅ Short URL:
          <a href={shortUrl} target="_blank" rel="noreferrer"> {shortUrl}</a>
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UrlCreator;
