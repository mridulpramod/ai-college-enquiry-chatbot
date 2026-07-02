import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocketchat } from "@fortawesome/free-brands-svg-icons";
import "./App.css";

import ChatBox from "./components/chatbox/chatbox";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import ManageIntent from "./admin/ManageIntent";

function Home() {
  const [chatboxState, setChatboxState] = useState(false);

  function toggleChatWindow(newState) {
    setChatboxState(newState);
  }

  return (
    <div className="bg-custom-image">
      <div className="content">

        {/* Floating Chat Button */}
        <button 
          className="control-button"
          onClick={() => toggleChatWindow(true)}
        >
          <FontAwesomeIcon icon={faRocketchat} />
        </button>

        {/* Chat Window */}
        <ChatBox
          isActive={chatboxState}
          toggle={() => toggleChatWindow(false)}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manage/:intent" element={<ManageIntent />} />
      </Routes>
    </Router>
  );
}

export default App;