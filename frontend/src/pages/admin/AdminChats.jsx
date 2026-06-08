import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import socket from "../../utils/socket";
import { useSelector } from "react-redux";

const AdminChats = () => {
  const { user } = useSelector((state) => state.auth);

  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");

  const selectedRef = useRef(null);
  const bottomRef = useRef(null);

  // ======================================
  // HELPER — extract sender ID whether
  // sender is a string OR { _id } object
  // ======================================
  const getSenderId = (sender) => {
    if (!sender) return "";
    if (typeof sender === "string") return sender;
    return sender._id?.toString() || "";
  };

  // ======================================
  // LOAD ALL COMPLAINTS
  // ======================================
  const loadTickets = async () => {
    try {
      const res = await axiosInstance.get("/admin/complaints");
      setTickets(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================
  // LOAD MESSAGES
  // ======================================
  const loadMessages = async (complaintId) => {
    try {
      const res = await axiosInstance.get(`/messages/${complaintId}`);
      const msgs = res.data.data || [];
      setMessages(msgs.reverse()); // oldest → latest
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================
  useEffect(() => {
    loadTickets();
  }, []);

  // ======================================
  // OPEN CHAT
  // ======================================
  const openChat = (item) => {
    if (selectedRef.current?._id) {
      socket.emit("leaveComplaint", selectedRef.current._id);
    }

    setMessages([]);
    setSelected(item);
    selectedRef.current = item;

    loadMessages(item._id);
    socket.emit("joinComplaint", item._id);
  };

  // ======================================
  // RECEIVE REALTIME MESSAGE
  // ======================================
  useEffect(() => {
    if (!selected?._id) return;

    const myId = (user?._id || user?.id)?.toString();

    const handleMessage = (msg) => {
      if (msg.complaintId?.toString() !== selected._id?.toString()) return;

      setMessages((prev) => {
        // Avoid duplicate
        const exists = prev.some(
          (m) => m._id?.toString() === msg._id?.toString()
        );
        if (exists) return prev;

        const msgSenderId = getSenderId(msg.sender);
        const isMine = msgSenderId === myId;

        // Remove matching temp optimistic message
        const filtered = prev.filter((m) => {
          const isTemp =
            typeof m._id === "string" && m._id.startsWith("temp");
          const sameText = m.message === msg.message;

          if (isTemp && sameText && isMine) return false;
          return true;
        });

        return [...filtered, msg];
      });
    };

    socket.on("receiveMessage", handleMessage);
    return () => socket.off("receiveMessage", handleMessage);
  }, [selected?._id, user]);

  // ======================================
  // RECEIVE SEEN UPDATE
  // ======================================
  useEffect(() => {
    const handleSeen = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id?.toString() === updatedMsg._id?.toString()
            ? { ...m, status: "seen" }
            : m
        )
      );
    };

    socket.on("messageSeen", handleSeen);
    return () => socket.off("messageSeen", handleSeen);
  }, []);

  // ======================================
  // SEND MESSAGE
  // ======================================
  const sendReply = () => {
    if (!reply.trim() || !selected) return;

    const senderId = (user?._id || user?.id)?.toString();

    if (!senderId) {
      console.error("❌ No sender ID found!");
      return;
    }

    // Optimistic temp message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      complaintId: selected._id,
      sender: senderId, // 
      message: reply,
      status: "sent",
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("sendMessage", {
      complaintId: selected._id,
      sender: senderId,
      message: reply,
    });

    setReply("");
  };

  // ======================================
  // ENTER KEY TO SEND
  // ======================================
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  // ======================================
  // MARK AS SEEN
  // ======================================
  useEffect(() => {
    if (!selected?._id) return;

    const myId = (user?._id || user?.id)?.toString();

    messages.forEach((msg) => {
      const msgSenderId = getSenderId(msg.sender);
      const isMyMessage = msgSenderId === myId;

      if (
        !isMyMessage &&
        msg.status !== "seen" &&
        typeof msg._id === "string" &&
        !msg._id.startsWith("temp")
      ) {
        socket.emit("messageSeen", {
          messageId: msg._id,
          complaintId: selected._id,
          viewerId: myId,
        });
      }
    });
  }, [messages, selected?._id, user]);

  // ======================================
  // AUTO SCROLL TO BOTTOM
  // ======================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ======================================
  // RENDER
  // ======================================
  return (
    <div className="flex h-[85vh] bg-white rounded-3xl overflow-hidden border border-slate-200">

      {/* SIDEBAR */}
      <div className="w-1/3 border-r overflow-y-auto bg-white">

        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">Conversations</h2>
          <p className="text-sm text-slate-500 mt-1">Complaint chats</p>
        </div>

        {tickets.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-6">
            No conversations yet
          </p>
        )}

        {tickets.map((item) => (
          <div
            key={item._id}
            onClick={() => openChat(item)}
            className={`p-4 cursor-pointer border-b transition hover:bg-slate-50 ${
              selected?._id === item._id ? "bg-blue-50" : ""
            }`}
          >
            <h3 className="font-semibold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {item.createdBy?.name}
            </p>
          </div>
        ))}
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-slate-50">

        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-lg">
            Select a conversation
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-5 border-b bg-white">
              <h2 className="font-bold text-lg">{selected.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Ticket #{selected.ticketId}
              </p>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {

                // ✅ works whether sender is string or { _id } object
                const myId = (user?._id || user?.id)?.toString();
                const isMe = getSenderId(msg.sender) === myId;

                return (
                  <div
                    key={msg._id}
                    className={`max-w-sm px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "ml-auto bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    <p>{msg.message}</p>

                    <div className="text-[10px] mt-2 opacity-70 flex items-center gap-1">
                      {msg.status === "sent" && <span>✓ Sent</span>}
                      {msg.status === "delivered" && (
                        <span>✓✓ Delivered</span>
                      )}
                      {msg.status === "seen" && (
                        <span className={isMe ? "text-blue-200" : ""}>
                          ✓✓ Seen
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t bg-white flex gap-3">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendReply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-2xl font-medium transition"
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