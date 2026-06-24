import { useState, useEffect } from "react";
import { ParafinWidget } from "@parafin/react";
import axios from "axios";

function App() {
  const [token, setToken] = useState(null);
  const [personId, setPersonId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [activeState, setActiveState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWidget = async (pid) => {
    try {
      const res = await axios.get(`/api/parafin/token/${pid}`);
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch token");
    }
  };

  const handleState = async (endpoint, label) => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await axios.post(`/api/state/${endpoint}`, {
        businessId,
      });
      const data = res.data;
      setPersonId(data.personId || personId);
      setBusinessId(data.businessId || businessId);
      setActiveState(label);
      await loadWidget(data.personId || personId);
    } catch (err) {
      setError(err.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 40,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>GrubDash Capital</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Powered by Parafin</p>

      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Person ID
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            placeholder="person_xxx"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
            }}
          />
          <button
            onClick={loadWidget}
            disabled={!personId || loading}
            style={{
              padding: "8px 16px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: personId && !loading ? "pointer" : "not-allowed",
              fontSize: 14,
            }}
          >
            {loading ? "Loading..." : "Load Widget"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: "#fee",
            border: "1px solid #fcc",
            borderRadius: 4,
            marginBottom: 24,
            color: "#c00",
          }}
        >
          {error}
        </div>
      )}

      {token && (
        <div
          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 24 }}
        >
          <ParafinWidget
            token={token}
            product="capital"
            onEvent={(eventType) => console.log("Parafin event:", eventType)}
            onExit={() => console.log("Widget exited")}
          />
        </div>
      )}
    </div>
  );
}

export default App;
