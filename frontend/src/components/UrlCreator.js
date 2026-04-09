import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

const UrlCreator = ({ onAnalytics }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);
    try {
      const endpoint = customCode
        ? "http://localhost:5000/api/url/custom"
        : "http://localhost:5000/api/url/shorten";

      const payload = customCode
        ? { originalUrl, customCode }
        : { originalUrl };

      const res = await axios.post(endpoint, payload);

      const newShortId = customCode || res.data.shortUrl.split("/").pop();
      const finalShortUrl = `http://localhost:5000/${newShortId}`;

      setShortUrl(finalShortUrl);
      onAnalytics(newShortId);
    } catch (err) {
      setError("Failed to shorten URL. Check backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "650px",
        margin: "0 auto 35px auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "18px", fontWeight: "600" }}>
        🔗 Create a Short URL
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Enter original URL (e.g. https://example.com)"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Custom short code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Shorten"}
        </button>
      </form>

      {shortUrl && (
        <div style={{ marginTop: "15px" }}>
          <p style={{ fontSize: "16px", color: "#00ffb7" }}>
            Short URL:{" "}
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#00ffb7", fontWeight: "600" }}
            >
              {shortUrl}
            </a>
          </p>

          <button
            onClick={() => {
              navigator.clipboard.writeText(shortUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ marginTop: "10px" }}
          >
            Copy
          </button>

          {copied && (
            <p style={{ color: "#00ffb7", marginTop: "8px" }}>
              Copied!
            </p>
          )}

          <div style={{ marginTop: "20px" }}>
            <QRCodeCanvas value={shortUrl} size={120} />
          </div>
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default UrlCreator;