import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import socket from "../../utils/socket";
import { useSelector } from "react-redux";

const AdminChats = () => {
  const { user } = useSelector(
    (state) => state.auth
  );

  const [tickets, setTickets] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [reply, setReply] =
    useState("");

  // ======================================
  // LOAD ALL COMPLAINTS
  // ======================================
  const loadTickets = async () => {
    try {
      const res =
        await axiosInstance.get(
          "/admin/complaints"
        );

      setTickets(
        res.data.data || []
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================
  // LOAD MESSAGES
  // ======================================
  const loadMessages = async (
    complaintId
  ) => {
    try {
      const res =
        await axiosInstance.get(
          `/messages/${complaintId}`
        );

      const msgs =
        res.data.data || [];

      // oldest → latest
      setMessages(
        msgs.reverse()
      );

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
    setSelected(item);

    loadMessages(item._id);
if (selected?._id) {
  socket.emit(
    "leaveComplaint",
    selected._id
  );
}

socket.emit(
  "joinComplaint",
  item._id
);
  };

  // ======================================
  // RECEIVE REALTIME MESSAGE
  // ======================================
  useEffect(() => {
    if (!selected?._id) return;

 const handleMessage = (msg) => {

  if (
    msg.complaintId?.toString() ===
    selected?._id?.toString()
  ) {

    setMessages((prev) => {

      // avoid duplicate DB message
      const exists = prev.some(
        (m) =>
          m._id?.toString() ===
          msg._id?.toString()
      );

      if (exists) return prev;

      // remove temp optimistic message
      const filtered = prev.filter(
        (m) =>
          !(
            typeof m._id === "string" &&
            m._id.startsWith("temp") &&
            m.message === msg.message
          )
      );

      return [...filtered, msg];
    });
  }
};

    socket.on(
      "receiveMessage",
      handleMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleMessage
      );
    };
  }, [selected?._id]);

  // ======================================
  // SEND MESSAGE
  // ======================================
  const sendReply = () => {
    if (
      !reply.trim() ||
      !selected
    ) {
      return;
    }

    // TEMP MESSAGE
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      complaintId:
        selected._id,
      sender: {
        _id: user._id,
      },
      message: reply,
      status: "sent",
    };

    // SHOW INSTANTLY
    setMessages((prev) => [
      ...prev,
      tempMessage,
    ]);

    // SEND SOCKET
    socket.emit(
      "sendMessage",
      {
        complaintId:
          selected._id,
        sender: user.id || user._id,
        message: reply,
      }
    );

    setReply("");
  };

  // ======================================
  // MARK AS SEEN
  // ======================================
  useEffect(() => {

  if (!selected?._id) return;

  messages.forEach((msg) => {

    const isMyMessage =
      msg.sender?._id ===
      user._id;

    if (
      !isMyMessage &&
      msg.status !== "seen" &&
      typeof msg._id === "string" &&
      !msg._id.startsWith("temp")
    ) {

      socket.emit(
        "messageSeen",
        {
          messageId: msg._id,
          complaintId:
            selected._id,
        }
      );
    }
  });

}, [
  messages,
  selected?._id,
  user._id,
]);

  return (
    <div className="flex h-[85vh] bg-white rounded-3xl overflow-hidden border border-slate-200">

      {/* SIDEBAR */}
      <div className="w-1/3 border-r overflow-y-auto bg-white">

        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">
            Conversations
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Complaint chats
          </p>
        </div>

        {tickets.map((item) => (
          <div
            key={item._id}
            onClick={() =>
              openChat(item)
            }
            className={`p-4 cursor-pointer border-b transition hover:bg-slate-50 ${
              selected?._id ===
              item._id
                ? "bg-blue-50"
                : ""
            }`}
          >
            <h3 className="font-semibold text-slate-800">
              {item.title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {
                item.createdBy
                  ?.name
              }
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
              <h2 className="font-bold text-lg">
                {selected.title}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Ticket #
                {
                  selected.ticketId
                }
              </p>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {messages.map(
                (msg) => {
                  const isMe =
                    msg.sender
                      ?._id ===
                    user._id;

                  return (
                    <div
                      key={
                        msg._id
                      }
                      className={`max-w-sm px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "ml-auto bg-blue-600 text-white"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      <p>
                        {
                          msg.message
                        }
                      </p>

                      <div className="text-[10px] mt-2 opacity-70 flex items-center gap-1">

  {msg.status === "sent" && (
    <span>✓ Sent</span>
  )}

  {msg.status === "delivered" && (
    <span>✓✓ Delivered</span>
  )}

  {msg.status === "seen" && (
    <span className="text-blue-200">
      ✓✓ Seen
    </span>
  )}

</div>
                    </div>
                  );
                }
              )}

            </div>

            {/* INPUT */}
            <div className="p-4 border-t bg-white flex gap-3">

              <input
                type="text"
                value={reply}
                onChange={(
                  e
                ) =>
                  setReply(
                    e.target.value
                  )
                }
                placeholder="Type your message..."
                className="flex-1 border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={
                  sendReply
                }
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