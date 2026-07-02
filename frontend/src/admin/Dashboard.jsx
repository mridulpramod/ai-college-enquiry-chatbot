import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./admin.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [newIntent, setNewIntent] = useState("");
  const [creating, setCreating] = useState(false);
  const [training, setTraining] = useState(false);

  // 🔥 TRAIN STATUS
  const [trainStatus, setTrainStatus] = useState({
    progress: 0,
    message: "",
    is_training: false,
  });

  const navigate = useNavigate();

  // ===============================
  // LOAD INTENTS
  // ===============================

  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/full-data");
      setData(res.data.intends);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===============================
  // 🔥 TRAIN STATUS POLLING
  // ===============================

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/admin/training-status"
        );
        setTrainStatus(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // CREATE INTENT
  // ===============================

  const createIntent = async () => {
    if (!newIntent.trim()) return;

    try {
      setCreating(true);

      await axios.post("http://localhost:8000/admin/add-intent", {
        intent: newIntent.trim(),
        queries: [],
        responses: [],
        related: [],
      });

      setNewIntent("");
      loadData();
    } catch {
      alert("Intent already exists!");
    } finally {
      setCreating(false);
    }
  };

  // ===============================
  // DELETE INTENT
  // ===============================

  const deleteIntent = async (intent) => {
    if (!window.confirm("Delete this intent?")) return;

    await axios.delete(
      `http://localhost:8000/admin/delete-intent/${intent}`
    );
    loadData();
  };

  // ===============================
  // RETRAIN
  // ===============================

  const retrain = async () => {
    try {
      setTraining(true);
      await axios.post("http://localhost:8000/admin/retrain");
    } catch {
      alert("Retrain failed");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      {/* ========================= */}
      {/* CREATE INTENT */}
      {/* ========================= */}

      <h3>Create New Intent</h3>
      <div className="add-section">
        <input
          placeholder="Enter intent name (example: placement_info)"
          value={newIntent}
          onChange={(e) => setNewIntent(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={createIntent}
          disabled={creating}
        >
          {creating ? "Creating..." : "Add Intent"}
        </button>
      </div>

      <br />

      {/* ========================= */}
      {/* RETRAIN */}
      {/* ========================= */}

      <button
        onClick={retrain}
        className="btn-primary"
        disabled={trainStatus.is_training}
      >
        {trainStatus.is_training ? "Training..." : "Retrain Model"}
      </button>

      {/* 🔥 TRAIN PROGRESS */}
      {trainStatus.is_training && (
        <div className="training-box">
          <p>{trainStatus.message}</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${trainStatus.progress}%` }}
            ></div>
          </div>

          <p>{trainStatus.progress}%</p>
        </div>
      )}

      <br />

      {/* ========================= */}
      {/* 🔥 VIEW LEADS */}
      {/* ========================= */}

      <button
        className="btn-secondary"
        onClick={() => navigate("/admin/admissions")}
      >
        View Admission Leads
      </button>

      <br /><br />

      {/* ========================= */}
      {/* INTENT GRID */}
      {/* ========================= */}

      <div className="intent-grid">
        {data.map((intent) => (
          <div key={intent} className="intent-card">
            <h4>{intent}</h4>

            <div>
              <button onClick={() => navigate(`/admin/manage/${intent}`)}>
                Manage
              </button>

              <button onClick={() => deleteIntent(intent)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;