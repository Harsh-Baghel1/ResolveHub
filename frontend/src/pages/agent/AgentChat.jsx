// frontend/src/pages/agent/AgentChat.jsx

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import axiosInstance from "../../api/axiosInstance";
import socket from "../../utils/socket";

import {
  ArrowLeft,
  SendHorizonal,
  Loader2,
  User,
  Ticket,
  CircleDot,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

const AgentChat = () => {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useSelector(
      (state) =>
        state.auth || {}
    );

  const [
    complaint,
    setComplaint,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    typing,
    setTyping,
  ] = useState(false);

  const bottomRef =
    useRef(null);

  // =====================================
  // LOAD DATA
  // =====================================
  useEffect(() => {
    const loadData =
      async () => {
        try {
          const [
            complaintRes,
            messageRes,
          ] =
            await Promise.all(
              [
                axiosInstance.get(
                  `/complaints/${id}`
                ),
                axiosInstance.get(
                  `/messages/${id}`
                ),
              ]
            );

          setComplaint(
            complaintRes
              .data
              .data ||
              complaintRes.data
          );

          setMessages(
            messageRes
              .data
              .messages ||
              []
          );
        } catch (
          error
        ) {
          console.log(
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, [id]);

  // =====================================
  // SOCKET
  // =====================================
  useEffect(() => {
    socket.connect();

    socket.emit(
      "joinComplaint",
      id
    );

    socket.on(
      "receiveMessage",
      (
        data
      ) => {
        setMessages(
          (
            prev
          ) => [
            ...prev,
            data,
          ]
        );
      }
    );

    socket.on(
      "typing",
      () =>
        setTyping(
          true
        )
    );

    socket.on(
      "stopTyping",
      () =>
        setTyping(
          false
        )
    );

    return () => {
      socket.off(
        "receiveMessage"
      );

      socket.off(
        "typing"
      );

      socket.off(
        "stopTyping"
      );

      socket.disconnect();
    };
  }, [id]);

  // =====================================
  // SCROLL
  // =====================================
  useEffect(() => {
    bottomRef
      .current
      ?.scrollIntoView(
        {
          behavior:
            "smooth",
        }
      );
  }, [messages]);

  // =====================================
  // SEND
  // =====================================
  const handleSend =
    () => {
      if (
        !message.trim()
      )
        return;

      socket.emit(
        "sendMessage",
        {
          complaintId:
            id,
          sender:
            user.id,
          message:
            message.trim(),
        }
      );

      setMessage(
        ""
      );

      socket.emit(
        "stopTyping",
        {
          complaintId:
            id,
        }
      );
    };

  const handleTyping =
    (e) => {
      setMessage(
        e.target
          .value
      );

      socket.emit(
        "typing",
        {
          complaintId:
            id,
        }
      );

      setTimeout(
        () => {
          socket.emit(
            "stopTyping",
            {
              complaintId:
                id,
            }
          );
        },
        1000
      );
    };

  const quickReply =
    (
      text
    ) => {
      setMessage(
        text
      );
    };

  const formatStatus =
    (
      value
    ) =>
      value
        ?.replaceAll(
          "_",
          " "
        )
        ?.replace(
          /\b\w/g,
          (
            c
          ) =>
            c.toUpperCase()
        );

  return (
      <div className="max-w-7xl mx-auto h-[84vh] grid lg:grid-cols-3 gap-6">

        {/* ================================= SIDEBAR */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b">

            <button
              onClick={() =>
                navigate(
                  "/agent/complaints"
                )
              }
              className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2"
            >
              <ArrowLeft
                size={
                  16
                }
              />
              Back
            </button>

            <h2 className="text-xl font-bold text-slate-800">
              Ticket Details
            </h2>

          </div>

          {/* Content */}
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="p-6 space-y-6">

              <div>
                <p className="text-xs text-slate-500">
                  Ticket ID
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {complaint?.ticketId ||
                    "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Title
                </p>

                <p className="font-semibold text-slate-700 mt-1">
                  {
                    complaint?.title
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  User
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <User
                      size={
                        18
                      }
                    />
                  </div>

                  <div>
                    <p className="font-medium text-slate-800">
                      {complaint
                        ?.createdBy
                        ?.name ||
                        "User"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {complaint
                        ?.createdBy
                        ?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Priority
                  </p>

                  <p className="font-semibold text-slate-700 mt-1">
                    {
                      complaint?.priority
                    }
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="font-semibold text-blue-700 mt-1">
                    {formatStatus(
                      complaint?.status
                    )}
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/agent/resolve/${id}`
                  )
                }
                className="w-full h-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              >
                <CheckCircle2
                  size={
                    18
                  }
                />
                Resolve Ticket
              </button>

            </div>
          )}

        </div>

        {/* ================================= CHAT */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

          {/* Top */}
          <div className="px-6 py-5 border-b flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <MessageSquare
                  size={
                    20
                  }
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Live Support Chat
                </h2>

                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <CircleDot
                    size={
                      12
                    }
                    className="text-green-500"
                  />
                  Active Session
                </p>
              </div>

            </div>

            <span className="px-3 py-2 rounded-xl bg-slate-50 text-sm text-slate-600 flex items-center gap-2">
              <Ticket
                size={
                  15
                }
              />
              {complaint?.ticketId}
            </span>

          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">

            {loading ? (
              <div className="h-full flex justify-center items-center text-slate-500">
                <Loader2 className="animate-spin mr-2" />
                Loading messages...
              </div>
            ) : messages.length ===
              0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <MessageSquare className="text-slate-400 mb-3" />
                <h3 className="font-semibold text-slate-700">
                  No Messages Yet
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Start helping the customer.
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {messages.map(
                  (
                    msg,
                    index
                  ) => {
                    const mine =
                      msg.sender?._id ===
                        user.id ||
                      msg.sender ===
                        user.id;

                    return (
                      <div
                        key={
                          index
                        }
                        className={`flex ${
                          mine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-lg px-5 py-3 rounded-3xl shadow-sm ${
                            mine
                              ? "bg-indigo-600 text-white rounded-br-md"
                              : "bg-white border rounded-bl-md"
                          }`}
                        >
                          {!mine && (
                            <p className="text-xs font-semibold text-blue-600 mb-1">
                              User
                            </p>
                          )}

                          <p className="text-sm">
                            {
                              msg.message
                            }
                          </p>

                          <p className="text-[11px] mt-2 opacity-70">
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}

                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white border px-4 py-3 rounded-3xl text-sm text-slate-500">
                      User is typing...
                    </div>
                  </div>
                )}

                <div
                  ref={
                    bottomRef
                  }
                />

              </div>
            )}

          </div>

          {/* Quick Replies */}
          <div className="px-5 pt-4 flex flex-wrap gap-2 border-t bg-white">
            {[
              "Hello, how may I help you?",
              "We are checking your issue.",
              "Please share more details.",
              "Issue has been resolved.",
            ].map(
              (
                text
              ) => (
                <button
                  key={
                    text
                  }
                  onClick={() =>
                    quickReply(
                      text
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm text-slate-700"
                >
                  {text}
                </button>
              )
            )}
          </div>

          {/* Footer */}
          <div className="p-5 bg-white">

            <div className="flex gap-3">

              <input
                type="text"
                value={
                  message
                }
                onChange={
                  handleTyping
                }
                onKeyDown={(
                  e
                ) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleSend();
                  }
                }}
                placeholder="Type response..."
                className="flex-1 h-14 border rounded-2xl px-5 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={
                  handleSend
                }
                className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <SendHorizonal
                  size={
                    18
                  }
                />
                Send
              </button>

            </div>

          </div>

        </div>

      </div>
    
  );
};

export default AgentChat;