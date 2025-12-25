import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./AuthContext";

function Layout() {
  const { token, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">CoWatch</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-indigo-400">Home</Link>
            {token && (
              <Link to="/rooms" className="hover:text-indigo-400">
                My Rooms
              </Link>
            )}
            {!token ? (
              <>
                <Link to="/login" className="hover:text-indigo-400">Login</Link>
                <Link
                  to="/register"
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <h1 className="text-3xl font-semibold">CoWatch</h1>
    </div>
  );
}

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token);
        localStorage.setItem("username", data.user.username);
        navigate("/rooms");
      } else {
        setMessage("Invalid username or password");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 p-6 rounded-xl space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Login</h1>
        {message && <p className="text-sm text-red-400">{message}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setMessage("Account created, you can login now");
        navigate("/login");
      } else {
        setMessage("Error: " + JSON.stringify(data));
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 p-6 rounded-xl space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Register</h1>
        {message && <p className="text-sm text-red-400 break-all">{message}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}

function RoomsPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({name: "", is_public: true,});
  const [joinCode, setJoinCode] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!token) {
        setMessage("You must be logged in to see your rooms.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setRooms(data);
        } else {
          setMessage("Failed to load rooms.");
        }
      } catch (err) {
        setMessage("Server error while loading rooms.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]);

    const handleCreate = async (e) => {
      e.preventDefault();
      setMessage("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            is_public: form.is_public,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setRooms((prev) => [...prev, data]);
          setForm({ name: "", is_public: true });
        } else {
          setMessage("Failed to create room.");
        }
      } catch (err) {
        setMessage("Server error while creating room.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pt-16">
      <h1 className="text-3xl font-semibold mb-6">My Rooms</h1>

      <form
        onSubmit={handleCreate}
        className="w-full max-w-xl bg-slate-900 p-4 rounded-xl space-y-3 mb-6"
      >
        <input
          type="text"
          placeholder="Room name"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) =>
              setForm({ ...form, is_public: e.target.checked })
            }
        />
          Public room
        </label>
        <button
          type="submit"
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          Create room
        </button>
      </form>


      {loading && <p>Loading...</p>}
      {!loading && message && <p className="text-red-400">{message}</p>}
      {!loading && !message && rooms.length === 0 && (
        <p className="text-slate-400">You have no rooms yet.</p>
      )}
      <div className="w-full max-w-xl bg-slate-900 p-4 rounded-xl space-y-3 mb-6">
        <h2 className="text-lg font-semibold">Join room by invite code</h2>
        <input
          type="text"
          placeholder="Enter invite code (e.g. H1ANHMT0)"
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        />
        <button
          onClick={async () => {
            setJoinMessage("");
              if (!joinCode) {
                setJoinMessage("Please enter an invite code.");
                  return;
                }
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/rooms/join/`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({ invite_code: joinCode }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        navigate(`/rooms/${data.id}`);
                    } else if (res.status === 404) {
                      setJoinMessage("Room not found for that code.");
                    } else {
                      setJoinMessage("Failed to join room.");
                    }
                  } catch (err) {
                    setJoinMessage("Server error while joining room.");
                  }
                }}
                className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
              >
                Join room
              </button>
              {joinMessage && <p className="text-sm text-slate-400">{joinMessage}</p>}
            </div>

      <div className="mt-4 space-y-2 w-full max-w-xl">
        {rooms.map((room) => (
          <Link
            key={room.id}
            to={`/rooms/${room.id}`}
            className="block w-full bg-slate-900 px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{room.name}</p>
                <p className="text-xs text-slate-400">
                  Invite code: {room.invite_code}
                </p>
              </div>
              <span className="text-xs text-indigo-400 self-center">Open</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RoomDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [wsStatus, setWsStatus] = useState("disconnected");
  const socketRef = useRef(null);
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [localSender, setLocalSender] = useState(
    () => localStorage.getItem("username") || "Guest"
  );
  const [showChat, setShowChat] = useState(true);

  console.log("initial localSender:", localSender);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      if (!token) {
        setError("You must be logged in to view this room.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/rooms/${id}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
          setVideoUrl(data.youtube_url || "");
        } else {
          setError("Room not found or you are not the owner.");
        }
      } catch (err) {
        setError("Failed to load room.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, token]);

  // Helper: extract YouTube ID
  const getVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = room && room.youtube_url ? getVideoId(room.youtube_url) : null;

  // WebSocket setup
  useEffect(() => {
    if (!id) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/rooms/${id}/`;
    console.log("Connecting WebSocket to", wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS open");
      setWsStatus("connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WS message:", data);

        if (data.type === "playback" && playerRef.current && playerReady) {
          if (data.action === "PLAY") {
            playerRef.current.playVideo();
          } else if (data.action === "PAUSE") {
            playerRef.current.pauseVideo();
          } else if (data.action === "SEEK") {
            const t = typeof data.time === "number" ? data.time : 0;
            playerRef.current.seekTo(t, true);
          }
        } else if (data.type === "chat") {
          setChatMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.log("WS raw message:", event.data);
      }
    };

    socket.onclose = () => {
      console.log("WS closed");
      setWsStatus("disconnected");
    };

    socket.onerror = (err) => {
      console.error("WS error", err);
      setWsStatus("error");
    };

    return () => {
      console.log("Closing WS");
      socket.close();
    };
  }, [id, playerReady]);

  // Load YouTube IFrame API and create player
  useEffect(() => {
    if (!videoId) return;

    function createPlayer() {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player("cowatch-youtube-player", {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            console.log("YT player ready");
            setPlayerReady(true);
          },
          onStateChange: (e) => {
            if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
            const currentTime = e.target.getCurrentTime();

            if (e.data === window.YT.PlayerState.PLAYING) {
              sendPlayback("PLAY", currentTime);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              sendPlayback("PAUSE", currentTime);
            }
          },
        },
      });
    }

    if (!window.YT || !window.YT.Player) {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log("YT IFrame API ready");
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
        setPlayerReady(false);
      }
    };
  }, [videoId]);

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!token || !room) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/rooms/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ youtube_url: videoUrl }),
        }
      );
      if (res.ok) {
        const updatedRoom = await res.json();
        setRoom(updatedRoom);
        setError("Video URL saved!");
        setTimeout(() => setError(""), 2000);
      } else {
        setError("Failed to save video URL.");
      }
    } catch (err) {
      setError("Server error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const sendPlayback = (action, time = 0) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS not open, cannot send");
      return;
    }
    const payload = { type: "playback", action, time };
    console.log("Sending playback", payload);
    socketRef.current.send(JSON.stringify(payload));
  };

  const sendChat = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS not open, cannot send chat");
      return;
    }
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    console.log("sending as:", localSender);

    const payload = {
      type: "chat",
      text: trimmed,
      sender: localSender,
    };
    socketRef.current.send(JSON.stringify(payload));
    setChatInput("");
  };

  // Early returns AFTER all hooks
  if (loading)
    return <div className="text-center p-8">Loading room...</div>;
  if (error && !room)
    return (
      <div className="text-center p-8 text-red-400">
        {error}
      </div>
    );
  if (!room)
    return <div className="text-center p-8">Room not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Room Header - REMOVED toggle button */}
      <div className="bg-slate-900 p-6 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
          <p className="text-slate-400 mb-4">
            Invite code:{" "}
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">
              {room.invite_code}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            Share link:{" "}
            <span className="font-mono break-all">
              {window.location.href}
            </span>
          </p>
        </div>
      </div>

      {/* YouTube URL Form */}
      <form
        onSubmit={handleSaveUrl}
        className="bg-slate-900 p-6 rounded-xl space-y-4"
      >
        <h2 className="text-xl font-semibold">Set YouTube Video</h2>
        <input
          type="url"
          placeholder="Paste YouTube URL here..."
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-indigo-500 outline-none"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving || !videoUrl}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium"
        >
          {saving ? "Saving..." : "Save Video URL"}
        </button>
        {error && !saving && (
          <p
            className={`p-3 rounded-lg ${
              error.includes("saved")
                ? "bg-green-900/50 border border-green-500"
                : "bg-red-900/50 border border-red-500"
            }`}
          >
            {error}
          </p>
        )}
      </form>

      {/* WebSocket Controls + Toggle Button (Opposite Corner) */}
      <div className="bg-slate-900 p-4 rounded-xl space-y-2">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-slate-400">
            WebSocket status:{" "}
            <span className="font-mono">{wsStatus}</span> | Player:{" "}
            <span className="font-mono">
              {playerReady ? "ready" : "not-ready"}
            </span>
          </div>
          {/* Toggle Button - OPPOSITE CORNER */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
            title="Toggle chat panel"
          >
            {showChat ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Chat
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => sendPlayback("PLAY", 10)}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm"
          >
            Send PLAY
          </button>
          <button
            type="button"
            onClick={() => sendPlayback("PAUSE", 10)}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-sm"
          >
            Send PAUSE
          </button>
          <button
            type="button"
            onClick={() => sendPlayback("SEEK", 42)}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm"
          >
            Send SEEK to 42s
          </button>
        </div>
      </div>

      {/* Video + Chat Side-by-Side Layout - UNCHANGED */}
      <div className="flex flex-col lg:flex-row gap-6 space-y-6 lg:space-y-0">
        {/* LEFT: Video Player */}
        <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden">
          {videoId ? (
            <>
              <div
                id="cowatch-youtube-player"
                className="w-full aspect-video"
              />
              <div className="px-6 pb-6 pt-3 text-sm text-slate-400">
                Playback controlled via WebSocket (PLAY/PAUSE/SEEK)
              </div>
            </>
          ) : (
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <div className="text-center text-slate-400 p-8">
                <div className="w-24 h-24 border-4 border-dashed border-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.665z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg">No video selected</p>
                <p className="text-sm">
                  Paste a YouTube URL above and click Save
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat Panel (Toggleable) */}
        {showChat && (
          <div className="lg:w-80 bg-slate-900 rounded-xl p-4 space-y-3 flex flex-col h-[500px]">
            <h2 className="text-lg font-semibold text-slate-100">Chat</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-600">
              {chatMessages.map((m, idx) => {
                const fromMe = m.sender === localSender;
                return (
                  <div key={idx} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg ${
                      fromMe ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-100"
                    }`}>
                      <div className="text-xs text-slate-300 mb-1">
                        {m.sender || "Guest"}
                      </div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                <div className="text-slate-500 text-sm text-center py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 outline-none text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={sendChat}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
