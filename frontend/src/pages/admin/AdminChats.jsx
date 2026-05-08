import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import socket from "../../utils/socket";
import { useSelector } from "react-redux";

const AdminChats = () => {
  const { user } = useSelector((state) => state.auth);

  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  // ================= LOAD ALL COMPLAINTS =================
  const loadTickets = async () => {
    try {
      const res = await axiosInstance.get("/admin/complaints");
      setTickets(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOAD MESSAGES =================
  const loadMessages = async (complaintId) => {
    try {
      const res = await axiosInstance.get(`/messages/${complaintId}`);
      setMessages((res.data.data || []).reverse());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // ================= OPEN CHAT =================
  const openChat = (item) => {
    setSelected(item);
    loadMessages(item._id);

    // 🔥 join socket room
    socket.emit("joinComplaint", item._id);
  };
useEffect(() => {
  if (!selected?._id) return;

  const handleMessage = (msg) => {
    if (msg.complaintId === selected._id) {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    }
  };

  socket.on("receiveMessage", handleMessage);

  return () => {
    socket.off("receiveMessage", handleMessage);
  };
}, [selected?._id]);

  // ================= SEND MESSAGE =================
 const sendReply = () => {
  if (!reply.trim() || !selected) return;

  const tempMessage = {
    _id: Date.now(), // temp id
    complaintId: selected._id,
    sender: { _id: user._id },
    message: reply,
    status: "sent",
  };

  // 🔥 show instantly in UI
  setMessages((prev) => [...prev, tempMessage]);

  // 🔥 send to socket
  socket.emit("sendMessage", {
    complaintId: selected._id,
    sender: user._id,
    message: reply,
  });

  setReply("");
};

  // ================= MARK AS SEEN =================

  useEffect(() => {
  if (!selected?._id) return;

  messages.forEach((msg) => {
    if (msg.status !== "seen") {
      socket.emit("messageSeen", {
        messageId: msg._id,
        complaintId: selected._id,
      });
    }
  });
}, [messages, selected?._id]);


  useEffect(() => {
  const handler = (msg) => {
    if (msg.complaintId === selected?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  };

  socket.on("receiveMessage", handler);

  return () => {
    socket.off("receiveMessage", handler);
  };
}, [selected]);

  return (
    <div className="flex h-[85vh] bg-white rounded-3xl overflow-hidden border">

      {/* ================= SIDEBAR ================= */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="p-4 font-bold text-lg border-b">
          Conversations
        </h2>

        {tickets.map((item) => (
          <div
            key={item._id}
            onClick={() => openChat(item)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
              selected?._id === item._id ? "bg-blue-50" : ""
            }`}
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">
              {item.createdBy?.name}
            </p>
          </div>
        ))}
      </div>

      {/* ================= CHAT WINDOW ================= */}
      <div className="flex-1 flex flex-col">

        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b font-semibold">
              {selected.title}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => {
                const isMe = msg.sender?._id === user._id;

                return (
                  <div
                    key={msg._id}
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.message}
                  </div>
                );
              })}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t flex gap-2">
              <input
                value={reply}
                onChange={(e) =>
                  setReply(e.target.value)
                }
                className="flex-1 border rounded-xl px-4 py-2 outline-none"
                placeholder="Type message..."
              />

              <button
                onClick={sendReply}
                className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChats;