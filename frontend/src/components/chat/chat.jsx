import React, { useState, useEffect } from "react";
import "./chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import ChatApi from "../../api/chatApi";

export default function Chat(props) {
  const { data, onAction } = props;

  const [loading, setLoading] = useState(true);

  // 🔥 FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [formStatus, setFormStatus] = useState(""); // success/error

  // ===============================
  // LOAD + FORM DETECTION
  // ===============================
  useEffect(() => {
    setLoading(true);

    if (data?.related) {
      const hasForm = data.related.some(
        (item) => item.tag === "admission_form"
      );
      setShowForm(hasForm);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [data]);

  // ===============================
  // MAKE LINKS CLICKABLE
  // ===============================
  const formatMessage = (text) => {
    if (!text) return "";

    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:500;">$1</a>'
    );
  };

  // ===============================
  // FORM SUBMIT
  // ===============================
  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setFormStatus("❌ Please fill all fields");
      return;
    }

    try {
      await ChatApi.sendAdmissionForm(formData);

      setFormStatus("✅ Enquiry submitted successfully!");

      setFormData({
        name: "",
        phone: "",
        email: "",
      });

      // hide form after 2 sec
      setTimeout(() => {
        setShowForm(false);
        setFormStatus("");
      }, 2000);

    } catch (err) {
      setFormStatus("❌ Failed to submit. Try again.");
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="w-full">
      {/* LOADING */}
      {loading && data.created_by === "server" ? (
        <div className="w-full flex items-end p-2">
          <FontAwesomeIcon className="mb-4 text-blue-600" icon={faRobot} />

          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          <span className="flex-1"></span>
        </div>
      ) : (
        <>
          {/* ================= BOT ================= */}
          {data.created_by === "server" && (
            <div className="w-full flex items-end p-2">
              <FontAwesomeIcon className="mb-4 text-blue-600" icon={faRobot} />

              <div>
                {/* MESSAGE */}
                <div className="chat-message-server flex items-center m-1 p-3 w-72 flex-col">
                  <p
                    className="whitespace-pre-wrap w-64 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(data.message),
                    }}
                  ></p>
                </div>

                {/* 🔥 PROFESSIONAL FORM */}
                {showForm && (
                  <div className="form-box">
                    <h4 className="form-title">🎓 Admission Enquiry</h4>

                    <input
                      type="text"
                      placeholder="Full Name"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />

                    <input
                      type="text"
                      placeholder="Mobile Number"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email Address"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />

                    <button className="submit-btn" onClick={handleSubmit}>
                      Submit Enquiry
                    </button>

                    {/* ✅ STATUS MESSAGE */}
                    {formStatus && (
                      <p className="form-status">{formStatus}</p>
                    )}
                  </div>
                )}

                {/* QUICK OPTIONS */}
                <div className="m-1 p-2 w-72">
                  {data.related &&
                    Object.values(data.related)
                      .filter((value) => value.tag !== "admission_form")
                      .map((value, index) => (
                        <button
                          key={index}
                          className="direct-btn"
                          onClick={() => onAction(value.tag, value.text)}
                        >
                          {value.text}
                        </button>
                      ))}
                </div>
              </div>

              <span className="flex-1"></span>
            </div>
          )}

          {/* ================= USER ================= */}
          {data.created_by === "client" && (
            <div className="w-full flex items-end p-2">
              <span className="flex-1"></span>

              <div className="chat-message-client flex items-center m-1 p-3 w-72">
                <p className="whitespace-pre-wrap w-64 text-sm">
                  {data.message}
                </p>
              </div>

              <FontAwesomeIcon className="mb-2 text-blue-600" icon={faUser} />
            </div>
          )}
        </>
      )}
    </div>
  );
}