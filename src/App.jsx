import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // New typing state

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput(""); // <-- Clear input immediately

    setIsTyping(true); // Show typing...

    try {
      const response = await axios.post("https://mcpai.gleeze.com/chat/chat", {
        message: userInput,
      });

      const aiResponse = response.data.response;

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false); // Remove typing whether success or error
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
            className={`chat-message ${msg.role === "user" ? "user" : "assistant"}`}
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

export default App;
