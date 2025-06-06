import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null); // <-- Create a ref
  const recognitionRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]); // <-- Scroll whenever messages or typing indicator change

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Recognized speech:", transcript);
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    const existing = localStorage.getItem("session_id");
    if (!existing) {
      const newId = crypto.randomUUID();
      localStorage.setItem("session_id", newId);
      console.log("Generated new session ID:", newId);
    } else {
      console.log("Found existing session ID:", existing);
    }
  }, []);

  const sendMessage = async (message = userInput) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setUserInput(""); // Clear input only if typed

    setIsTyping(true);

    try {
      const response = await axios.post("https://mcpcllient.gleeze.com/chat", {
        message: userInput,
        session_id: localStorage.getItem("session_id")
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
        <div ref={chatEndRef} /> {/* Marker for scroll */}
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
        <button onClick={() => recognitionRef.current?.start()} title="Speak">
          🎤
        </button>
      </div>
    </div>
  );
}

export default App;
