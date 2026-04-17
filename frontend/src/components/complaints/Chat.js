import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = ({ complaintId, user }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("joinComplaint", complaintId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [complaintId]);

  const sendMessage = () => {
    socket.emit("sendMessage", {
      complaintId,
      message,
      sender: user.id,
    });

    setMessage("");
  };

  return (
    <div>
      <h3>Chat</h3>

      <div>
        {messages.map((m, i) => (
          <p key={i}>{m.message}</p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;