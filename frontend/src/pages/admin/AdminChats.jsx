// frontend/src/pages/admin/AdminChats.jsx

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";

import axiosInstance from "../../api/axiosInstance";

import {
  Search,
  Filter,
  Loader2,
  MessageSquare,
  SendHorizonal,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  User,
  UserCog,
} from "lucide-react";

const statusStyle = {
  open:
    "bg-yellow-100 text-yellow-700",
  in_progress:
    "bg-blue-100 text-blue-700",
  resolved:
    "bg-green-100 text-green-700",
  closed:
    "bg-slate-100 text-slate-700",
};

const priorityStyle = {
  high:
    "bg-red-100 text-red-700",
  medium:
    "bg-orange-100 text-orange-700",
  low:
    "bg-green-100 text-green-700",
};

const AdminChats = () => {
  const [loading, setLoading] =
    useState(true);

  const [tickets, setTickets] =
    useState([]);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [
    reply,
    setReply,
  ] = useState("");

  const bottomRef =
    useRef(null);

  // =====================================
  // LOAD TICKETS
  // =====================================
  const fetchChats =
    useCallback(
      async (
        showLoader = false
      ) => {
        try {
          if (
            showLoader
          ) {
            setLoading(
              true
            );
          }

          const res =
            await axiosInstance.get(
              "/admin/chats"
            );

          setTickets(
            res.data
              .tickets ||
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
      },
      []
    );

  useEffect(() => {
    fetchChats(false);
  }, [fetchChats]);

  // =====================================
  // LOAD MESSAGES
  // =====================================
  const loadMessages =
    async (
      complaintId
    ) => {
      try {
        const res =
          await axiosInstance.get(
            `/messages/${complaintId}`
          );

        setMessages(
          res.data
            .messages ||
            []
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // =====================================
  // SELECT CHAT
  // =====================================
  const openChat =
    (
      item
    ) => {
      setSelected(
        item
      );

      loadMessages(
        item._id
      );
    };

  // =====================================
  // SEND ADMIN MESSAGE
  // =====================================
  const sendReply =
    async () => {
      if (
        !reply.trim() ||
        !selected
      )
        return;

      try {
        await axiosInstance.post(
          "/messages",
          {
            complaintId:
              selected._id,
            message:
              reply,
            type:
              "admin",
          }
        );

        setReply("");

        loadMessages(
          selected._id
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      }
    };

  // =====================================
  // AUTO SCROLL
  // =====================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [messages]);

  // =====================================
  // FILTER DATA
  // =====================================
  const filtered =
    useMemo(() => {
      let data = [
        ...tickets,
      ];

      if (
        filter !==
        "all"
      ) {
        if (
          filter ===
          "inactive"
        ) {
          data =
            data.filter(
              (
                item
              ) =>
                item.noReply
            );
        } else {
          data =
            data.filter(
              (
                item
              ) =>
                item.status ===
                filter
            );
        }
      }

      if (
        search.trim()
      ) {
        const q =
          search.toLowerCase();

        data =
          data.filter(
            (
              item
            ) =>
              item.ticketId
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.title
                ?.toLowerCase()
                .includes(
                  q
                ) ||
              item.createdBy?.name
                ?.toLowerCase()
                .includes(
                  q
                )
          );
      }

      return data;
    }, [
      tickets,
      search,
      filter,
    ]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-slate-800">
              Admin Chats
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor all live complaint conversations.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="p-4 border-b space-y-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search chat..."
                value={search}
                onChange={(
                  e
                ) =>
                  setSearch(
                    e.target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <select
                value={filter}
                onChange={(
                  e
                ) =>
                  setFilter(
                    e.target
                      .value
                  )
                }
                className="w-full h-12 border rounded-2xl pl-11 pr-4 appearance-none outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  All Chats
                </option>
                <option value="open">
                  Open
                </option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="resolved">
                  Resolved
                </option>
                <option value="inactive">
                  No Reply
                </option>
              </select>
            </div>

          </div>

          {/* Chat List */}
          <div className="max-h-[72vh] overflow-y-auto">

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-slate-500" />
              </div>
            ) : filtered.length ===
              0 ? (
              <div className="p-10 text-center text-slate-500">
                No chats found.
              </div>
            ) : (
              filtered.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item._id
                    }
                    onClick={() =>
                      openChat(
                        item
                      )
                    }
                    className={`w-full text-left px-5 py-4 border-b hover:bg-slate-50 transition ${
                      selected?._id ===
                      item._id
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold text-slate-800">
                        {
                          item.ticketId
                        }
                      </h3>

                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                          priorityStyle[
                            item.priority
                          ]
                        }`}
                      >
                        {
                          item.priority
                        }
                      </span>

                    </div>

                    <p className="text-sm text-slate-600 mt-1 truncate">
                      {
                        item.title
                      }
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      {item.createdBy
                        ?.name ||
                        "User"}{" "}
                      •{" "}
                      {item.assignedTo
                        ?.name ||
                        "Unassigned"}
                    </p>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

          {!selected ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-10">
              <MessageSquare className="text-slate-400 mb-4" size={40} />
              <h3 className="text-xl font-bold text-slate-800">
                Select a Chat
              </h3>
              <p className="text-slate-500 mt-2">
                Open any complaint conversation.
              </p>
            </div>
          ) : (
            <>
              {/* TOP */}
              <div className="p-6 border-b">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {selected.ticketId}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {selected.title}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusStyle[
                          selected.status
                        ]
                      }`}
                    >
                      {
                        selected.status
                      }
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        priorityStyle[
                          selected.priority
                        ]
                      }`}
                    >
                      {
                        selected.priority
                      }
                    </span>

                  </div>

                </div>

                <div className="flex gap-4 mt-4 text-sm text-slate-600 flex-wrap">

                  <span className="flex items-center gap-2">
                    <User size={14} />
                    {selected.createdBy
                      ?.name ||
                      "User"}
                  </span>

                  <span className="flex items-center gap-2">
                    <UserCog size={14} />
                    {selected.assignedTo
                      ?.name ||
                      "No Agent"}
                  </span>

                </div>

              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">

                {messages.map(
                  (
                    msg,
                    index
                  ) => {
                    const admin =
                      msg.type ===
                      "admin";

                    return (
                      <div
                        key={
                          index
                        }
                        className={`flex ${
                          admin
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-lg px-5 py-3 rounded-3xl shadow-sm ${
                            admin
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white border rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">
                            {
                              msg.message
                            }
                          </p>

                          <p className="text-[11px] opacity-70 mt-2">
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}

                <div ref={bottomRef} />

              </div>

              {/* ADMIN ACTION BAR */}
              <div className="border-t bg-white p-4">

                <div className="grid lg:grid-cols-3 gap-3 mb-4">

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-center gap-2">
                    <Clock3 size={15} />
                    Last Activity Tracked
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-center gap-2">
                    <AlertTriangle size={15} />
                    Escalation Ready
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-center gap-2">
                    <ShieldCheck size={15} />
                    Audit Safe
                  </div>

                </div>

                <div className="flex gap-3">

                  <input
                    type="text"
                    placeholder="Send admin intervention message..."
                    value={reply}
                    onChange={(
                      e
                    ) =>
                      setReply(
                        e.target
                          .value
                      )
                    }
                    onKeyDown={(
                      e
                    ) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        sendReply();
                      }
                    }}
                    className="flex-1 h-14 border rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={
                      sendReply
                    }
                    className="h-14 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <SendHorizonal size={18} />
                    Send
                  </button>

                </div>

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminChats;