import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Agno.css";

function Agno() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  // ✅ Set user_id once
  useEffect(() => {
    let storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      storedUserId = generateUUID();
      localStorage.setItem("user_id", storedUserId);
    }
    setUserId(storedUserId);

    // Always generate new session_id on load
    const newSessionId = generateUUID();
    sessionStorage.setItem("session_id", newSessionId);
    setSessionId(newSessionId);

    console.log("User ID:", storedUserId);
    console.log("Session ID:", newSessionId);
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim() || !userId || !sessionId) return;

    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("https://droplet.gleeze.com/agno-chat/process", {
        text: userInput,
        user_id: userId,
        session_id: sessionId
      });

      const aiResponse = response.data.response;
      setMessages((prev) => [...prev, { role: "assistant", text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.role === "user" ? "user" : "assistant"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="chat-message assistant typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Agno;
