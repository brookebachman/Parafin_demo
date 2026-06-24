import { useState } from "react";
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
    const res = await axios.get(`/api/parafin/token/${pid}`);
    setToken(res.data.token);
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

  const reloadWidget = async () => {
    setToken(null);
    setLoading(true);
    try {
      await loadWidget(personId);
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

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
      >
        <button
          onClick={() => handleState("no-offers", "No Offers")}
          disabled={loading}
          style={btnStyle}
        >
          1. No Offers
        </button>
        <button
          onClick={() => handleState("pre-approved", "Pre-Approved")}
          disabled={loading}
          style={btnStyle}
        >
          2. Pre-Approved Offer
        </button>
        <button
          onClick={() => handleState("fund", "Capital On Its Way")}
          disabled={loading || !businessId}
          style={btnStyle}
        >
          3. Fund (Capital On Its Way)
        </button>
        <button
          onClick={() => handleState("payment", "Outstanding Balance")}
          disabled={loading || !businessId}
          style={btnStyle}
        >
          4. Payment (Outstanding Balance)
        </button>
      </div>

      {(personId || businessId) && (
        <div
          style={{
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 4,
            marginBottom: 24,
            fontSize: 13,
          }}
        >
          {activeState && (
            <div>
              <strong>State:</strong> {activeState}
            </div>
          )}
          {personId && (
            <div>
              <strong>Person ID:</strong> {personId}
            </div>
          )}
          {businessId && (
            <div>
              <strong>Business ID:</strong> {businessId}
            </div>
          )}
          <button
            onClick={reloadWidget}
            style={{
              marginTop: 8,
              padding: "4px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reload Widget
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}

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
          {typeof error === "string" ? error : JSON.stringify(error)}
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

const btnStyle = {
  padding: "8px 16px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};

export default App;
