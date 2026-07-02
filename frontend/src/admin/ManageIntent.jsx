import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./admin.css";

function ManageIntent() {
  const { intent } = useParams();

  const [queries, setQueries] = useState([]);
  const [responses, setResponses] = useState([]);
  const [related, setRelated] = useState([]);

  const [newQuery, setNewQuery] = useState("");
  const [newResponse, setNewResponse] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ==========================
  // LOAD INTENT DATA
  // ==========================

  const loadIntent = async () => {
    const res = await axios.get("http://localhost:8000/admin/full-data");

    const q = res.data.querys.find((x) => x.intent === intent);
    const r = res.data.responses.find((x) => x.intent === intent);
    const rel = res.data.related.find((x) => x.intent === intent);

    setQueries(q?.questions || []); // ✅ FIXED
    setResponses(r?.responses || []);
    setRelated(rel?.related || []);
  };

  useEffect(() => {
    loadIntent();
  }, []);

  // ==========================
  // QUERY FUNCTIONS
  // ==========================

  const addQuery = () => {
    if (!newQuery.trim()) return;
    setQueries([...queries, newQuery.trim()]);
    setNewQuery("");
  };

  const deleteQuery = (index) => {
    setQueries(queries.filter((_, i) => i !== index));
  };

  const editQuery = (index, value) => {
    const updated = [...queries];
    updated[index] = value;
    setQueries(updated);
  };

  // ==========================
  // RESPONSE FUNCTIONS
  // ==========================

  const addResponse = () => {
    if (!newResponse.trim()) return;
    setResponses([...responses, newResponse.trim()]);
    setNewResponse("");
  };

  const deleteResponse = (index) => {
    setResponses(responses.filter((_, i) => i !== index));
  };

  const editResponse = (index, value) => {
    const updated = [...responses];
    updated[index] = value;
    setResponses(updated);
  };

  // ==========================
  // SAVE & AUTO RETRAIN
  // ==========================

  const saveChanges = async () => {
    try {
      setLoading(true);
      setProgress(0);

      await axios.post("http://localhost:8000/admin/update-intent", {
        intent,
        queries,
        responses,
        related,
      });

      // Start retraining
      await axios.post("http://localhost:8000/admin/retrain");

      // Poll training status
      const interval = setInterval(async () => {
        const res = await axios.get(
          "http://localhost:8000/admin/training-status"
        );

        setProgress(res.data.progress);

        if (!res.data.is_training) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 500);
    } catch (err) {
      alert("Error saving changes");
      setLoading(false);
    }
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div className="dashboard-container">
      <h2>Manage Intent: {intent}</h2>

      {/* ===================== */}
      {/* QUERIES SECTION */}
      {/* ===================== */}

      <h3>Queries</h3>

      {queries.map((q, i) => (
        <div key={i} className="item-row">
          <input
            value={q}
            onChange={(e) => editQuery(i, e.target.value)}
          />
          <button onClick={() => deleteQuery(i)}>Delete</button>
        </div>
      ))}

      <div className="add-section">
        <input
          placeholder="Add new query"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
        />
        <button onClick={addQuery}>Add Query</button>
      </div>

      {/* ===================== */}
      {/* RESPONSES SECTION */}
      {/* ===================== */}

      <h3>Responses</h3>

      {responses.map((r, i) => (
        <div key={i} className="item-row">
          <input
            value={r}
            onChange={(e) => editResponse(i, e.target.value)}
          />
          <button onClick={() => deleteResponse(i)}>Delete</button>
        </div>
      ))}

      <div className="add-section">
        <input
          placeholder="Add new response"
          value={newResponse}
          onChange={(e) => setNewResponse(e.target.value)}
        />
        <button onClick={addResponse}>Add Response</button>
      </div>

      {/* ===================== */}
      {/* SAVE BUTTON */}
      {/* ===================== */}

      <br />

      <button
        className="btn-primary"
        onClick={saveChanges}
        disabled={loading}
      >
        {loading ? "Training..." : "Save & Retrain Model"}
      </button>

      {/* ===================== */}
      {/* PROGRESS BAR */}
      {/* ===================== */}

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#333",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4caf50",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ marginTop: "8px" }}>{progress}%</p>
        </div>
      )}
    </div>
  );
}

export default ManageIntent;