import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./AuthContext";


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
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token);
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
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
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
  const [form, setForm] = useState({
    name: "",
    is_public: true,
  });

  useEffect(() => {
    const fetchRooms = async () => {
      if (!token) {
        setMessage("You must be logged in to see your rooms.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/rooms/", {
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
        const res = await fetch("http://127.0.0.1:8000/api/auth/rooms/", {
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
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      if (!token) {
        setMessage("You must be logged in to view this room.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/auth/rooms/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setRoom(data);
          setVideoUrl(data.youtube_url || "");
        } else {
          setMessage("Room not found or you are not the owner.");
        }
      } catch (err) {
        setMessage("Server error while loading room.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, token]);

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/auth/rooms/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ youtube_url: videoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoom(data);
        setMessage("Video URL saved.");
      } else {
        setMessage("Failed to save video URL.");
      }
    } catch (err) {
      setMessage("Server error while saving video URL.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading room...</p>
      </div>
    );
  }

  if (message && !room) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-red-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pt-16 px-4">
      <h1 className="text-3xl font-semibold mb-2">{room.name}</h1>
      <p className="text-sm text-slate-400 mb-4">
        Invite code: {room.invite_code}
      </p>
      <p className="text-xs text-slate-500 mb-6">
        Share link: {window.location.href}
      </p>

      {message && <p className="text-sm text-emerald-400 mb-4">{message}</p>}

      <form
        onSubmit={handleSaveVideo}
        className="w-full max-w-xl bg-slate-900 p-4 rounded-xl space-y-3 mb-6"
      >
        <label className="text-sm text-slate-300">
          YouTube URL for this room
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-2 rounded bg-slate-800 outline-none"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
        >
          Save video URL
        </button>
      </form>

      <div className="w-full max-w-3xl bg-slate-900 rounded-xl p-4 min-h-[300px] flex items-center justify-center text-slate-400">
        {room.youtube_url ? (
          <p>Video player placeholder for: {room.youtube_url}</p>
        ) : (
          <p>No video set yet. Paste a YouTube URL above.</p>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);