import React, { useEffect, useRef, useState } from "react";
import "./chatbox.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMicrophone,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";
import ChatApi from "../../api/chatApi";
import Chat from "../chat/chat";

export default function ChatBox(props) {
  const [chatBoxValue, setChatBoxValue] = useState("");
  const [micActive, setMicActive] = useState(false);
  const locked = useRef(false);
  const inputRef = useRef(null);
  const divRef = useRef(null);
  const [chats, setChats] = useState([]);

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setChatBoxValue(result);
    },
  });

  const { speak } = useSpeechSynthesis();

  // ✅ ADD CHAT
  function updateChats(created_by, message, related = null) {
    setChats((prev) => [
      ...prev,
      {
        created_by,
        message,
        related,
      },
    ]);

    if (micActive && created_by === "server") {
      speak({ text: message });
    }
  }

  // ✅ HANDLE RESPONSE
  function onDataReceived(data) {
    setChatBoxValue("");

    if (data["status"] === 200) {
      const related = Object.values(data["related"] || []);

      updateChats(
        "server",
        data["message"],
        related.length > 0 ? related : null
      );
    } else {
      updateChats("server", data["message"] || "An error occurred.");
    }

    locked.current = false;
  }

  // ✅ SEND MESSAGE
  function sendMessage(text) {
    if (!text || text.trim() === "") return;

    if (locked.current) return;
    locked.current = true;

    updateChats("client", text);
    ChatApi.query_request(text).then(onDataReceived);
  }

  // ✅ INITIAL LOAD + SCROLL
  useEffect(() => {
    if (chats.length === 0) {
      ChatApi.direct_request("welcomegreeting").then(onDataReceived);
    }

    const scrollTimer = setTimeout(() => {
      if (divRef.current) {
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [chats]);

  return (
    <div
      className="chat-box-container flex flex-col"
      style={{
        height: props.isActive ? "580px" : 0,
        width: props.isActive ? "490px" : 0,
        opacity: props.isActive ? 1 : 0,
      }}
    >
      {/* HEADER */}
      <div
        className="chat-box-top h-11 w-full text-white flex items-center px-5"
        style={{
          background: "linear-gradient(90deg, #2563eb, #1e40af)",
        }}
      >
        <h6 className="font-bold mx-2 text-xs">COET AI Assistant</h6>
        <span className="flex-1" />

        {/* MIC TOGGLE */}
        <button
          className="speach-btn hover:scale-125 m-5"
          style={{ color: micActive ? "#22c55e" : "white" }}
          onClick={() => setMicActive(!micActive)}
        >
          <FontAwesomeIcon className="text-xl" icon={faMicrophone} />
        </button>

        {/* CLOSE */}
        <button
          className="hover:text-red-300 hover:scale-125"
          onClick={() => props.toggle()}
        >
          <FontAwesomeIcon className="text-xl" icon={faXmark} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="chat-box-middle flex-1 overflow-auto" ref={divRef}>
        {chats.map((item, index) => (
          <Chat
            key={index}
            data={item}
            onAction={(klass, text) => {
              if (locked.current) return;

              locked.current = true;
              updateChats("client", text);
              ChatApi.direct_request(klass).then(onDataReceived);
            }}
          />
        ))}
      </div>

      {/* INPUT AREA */}
      <div
        className="chat-box-bottom h-16 w-full flex items-center justify-center p-3"
        style={{
          background: "linear-gradient(90deg, #2563eb, #1e40af)",
        }}
      >
        <input
          type="text"
          className="text-sm"
          placeholder="Ask anything about COET..."
          value={chatBoxValue}
          onChange={(e) => setChatBoxValue(e.target.value)}
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(chatBoxValue);
            }
          }}
        />

        {/* VOICE INPUT */}
        <button
          className="s2t-mic-btn"
          style={{ color: listening ? "red" : "white" }}
          onClick={() => {
            if (!supported) {
              alert("Browser does not support voice input.");
              return;
            }

            if (listening) {
              stop();
              inputRef.current.focus();
            } else {
              listen();
            }
          }}
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </button>

        {/* SEND BUTTON */}
        <button
          className="text-white hover:text-blue-200"
          onClick={() => sendMessage(chatBoxValue)}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}