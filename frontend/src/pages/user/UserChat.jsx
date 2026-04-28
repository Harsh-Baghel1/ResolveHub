// frontend/src/pages/user/UserChat.jsx

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import axiosInstance from "../../api/axiosInstance";
import socket from "../../utils/socket";

import UserLayout from "../../layouts/UserLayout";

import {
  ArrowLeft,
  SendHorizonal,
  Loader2,
  Headset,
  ShieldCheck,
  CircleDot,
  Clock3,
  UserCheck,
  MessageSquare,
} from "lucide-react";

const UserChat = () => {
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
  // SOCKET ONLY IF AGENT ASSIGNED
  // =====================================
  useEffect(() => {
    if (
      !complaint
        ?.assignedTo
    )
      return;

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
  }, [
    complaint,
    id,
  ]);

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
        !message.trim() ||
        !complaint
          ?.assignedTo
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
        1200
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

  const assigned =
    complaint
      ?.assignedTo;

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto h-[82vh] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

        {/* ================================= HEADER */}
        <div className="px-7 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Headset
                size={
                  26
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">
                  Support Chat
                </h1>

                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1">
                  <CircleDot
                    size={
                      10
                    }
                  />
                  {assigned
                    ? "Connected"
                    : "Pending"}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Ticket #
                <span className="font-semibold text-slate-700">
                  {" "}
                  {complaint
                    ?.ticketId ||
                    "Loading..."}
                </span>
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {complaint
                  ?.title ||
                  "Support Case"}
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              navigate(
                -1
              )
            }
            className="px-4 py-2 rounded-xl border hover:bg-slate-50 flex items-center gap-2"
          >
            <ArrowLeft
              size={16}
            />
            Back
          </button>

        </div>

        {/* ================================= BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">

          {loading ? (
            <div className="h-full flex justify-center items-center text-slate-500">
              <Loader2 className="animate-spin mr-2" />
              Loading support...
            </div>
          ) : !assigned ? (
            /* NO AGENT ASSIGNED */
            <div className="h-full flex items-center justify-center">

              <div className="bg-white border rounded-3xl shadow-sm p-10 max-w-xl w-full text-center">

                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-5">
                  <Clock3
                    size={
                      30
                    }
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Awaiting Agent Assignment
                </h2>

                <p className="text-slate-500 mt-3 leading-relaxed">
                  Your complaint has been received successfully.
                  A support agent will be assigned soon based on
                  availability and priority.
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-4 text-left">

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs text-slate-500">
                      Ticket ID
                    </p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {
                        complaint
                          ?.ticketId
                      }
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs text-slate-500">
                      Current Status
                    </p>

                    <p className="font-semibold text-blue-600 mt-1">
                      {formatStatus(
                        complaint?.status
                      )}
                    </p>
                  </div>

                </div>

                <div className="mt-6 bg-blue-50 text-blue-700 rounded-2xl p-4 text-sm">
                  You’ll be able to chat instantly once an
                  agent is assigned.
                </div>

              </div>

            </div>
          ) : messages.length ===
            0 ? (
            /* CONNECTED NO MSG */
            <div className="h-full flex flex-col justify-center items-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                <UserCheck
                  size={
                    28
                  }
                  className="text-green-600"
                />
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                {assigned.name ||
                  "Support Agent"}{" "}
                Joined
              </h2>

              <p className="text-slate-500 mt-2">
                Start chatting with your assigned support
                representative.
              </p>

            </div>
          ) : (
            /* CHAT */
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
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white border rounded-bl-md"
                        }`}
                      >
                        {!mine && (
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            {assigned.name ||
                              "Support"}
                          </p>
                        )}

                        <p className="text-sm">
                          {
                            msg.message
                          }
                        </p>

                        <p className="text-[11px] opacity-70 mt-2">
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
                    {assigned.name ||
                      "Agent"}{" "}
                    is typing...
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

        {/* ================================= FOOTER */}
        <div className="border-t bg-white px-5 py-4">

          {assigned ? (
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
                placeholder="Write your message..."
                className="flex-1 h-14 rounded-2xl border px-5 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={
                  handleSend
                }
                className="h-14 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <SendHorizonal
                  size={
                    18
                  }
                />
                Send
              </button>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <MessageSquare
                size={
                  16
                }
              />
              Messaging will activate after agent assignment.
            </div>
          )}

        </div>

      </div>
    </UserLayout>
  );
};

export default UserChat;