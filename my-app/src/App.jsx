import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./App.css";

const API = "https://idea-vault-qwkm.onrender.com";
const API_URL = `${API}/api/ideas`;

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchIdeas();
  }, [user]);

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
  }

  async function handleGoogleLogin(credentialResponse) {
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error("Login failed:", err);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIdeas([]);
  }

  async function fetchIdeas() {
    try {
      const res = await fetch(API_URL, { headers: authHeaders() });
      if (res.status === 401) return logout();
      setIdeas(await res.json());
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addIdea(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title, tag: tag || "General" }),
      });
      const newIdea = await res.json();
      setIdeas([newIdea, ...ideas]);
      setTitle("");
      setTag("");
    } catch (err) {
      console.error("Failed to add idea:", err);
    }
  }

  async function toggleFavorite(id, currentValue) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ favorite: !currentValue }),
      });
      const updated = await res.json();
      setIdeas(ideas.map((idea) => (idea._id === id ? updated : idea)));
    } catch (err) {
      console.error("Failed to update idea:", err);
    }
  }

  async function deleteIdea(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setIdeas(ideas.filter((idea) => idea._id !== id));
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  }

  // ---------- LANDING PAGE (logged out) ----------
  if (!user) {
    return (
      <div className="landing">
        <div className="glow glow1" />
        <div className="glow glow2" />

        <nav className="nav">
          <span className="logo">💡 Idea Vault</span>
        </nav>

        <section className="hero">
          <span className="badge">✨ Your second brain for ideas</span>
          <h1 className="hero-title">
            Capture every idea
            <br />
            <span className="gradient">before it disappears.</span>
          </h1>
          <p className="hero-sub">
            A clean, private space to save, tag, and favorite your ideas.
            Sign in once and they follow you everywhere.
          </p>

          <div className="login-card">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.error("Google login failed")}
              theme="filled_black"
              shape="pill"
              size="large"
            />
            <small>🔒 Secure sign-in with Google. We never see your password.</small>
          </div>

          <div className="features">
            <div className="feature">
              <span>⚡</span>
              <h3>Instant capture</h3>
              <p>Type it, tag it, done in seconds.</p>
            </div>
            <div className="feature">
              <span>⭐</span>
              <h3>Favorite the best</h3>
              <p>Star the ideas worth building.</p>
            </div>
            <div className="feature">
              <span>🔐</span>
              <h3>Private by default</h3>
              <p>Only you can see your vault.</p>
            </div>
          </div>
        </section>

        <footer className="footer">Built with React, Node.js and MongoDB</footer>
      </div>
    );
  }

  // ---------- IDEAS PAGE (logged in) ----------
  return (
    <div className="landing">
      <div className="glow glow1" />
      <div className="glow glow2" />

      <nav className="nav">
        <span className="logo">💡 Idea Vault</span>
        <div className="user-box">
          {user.picture && (
            <img src={user.picture} alt="" referrerPolicy="no-referrer" />
          )}
          <span className="user-email">{user.email}</span>
          <button onClick={logout} className="logout">
            Log out
          </button>
        </div>
      </nav>

      <div className="container">
        <h2 className="page-title">Your ideas</h2>

        <form onSubmit={addIdea} className="idea-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the idea?"
          />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag"
            className="tag-input"
          />
          <button type="submit">Add</button>
        </form>

        <div className="idea-list">
          {loading && <p className="empty">Loading...</p>}
          {!loading && ideas.length === 0 && (
            <p className="empty">No ideas yet. Add your first one above.</p>
          )}

          {ideas.map((idea) => (
            <div key={idea._id} className="idea-card">
              <div>
                <p className="idea-title">{idea.title}</p>
                <span className="idea-tag">{idea.tag}</span>
              </div>
              <div className="idea-actions">
                <button
                  onClick={() => toggleFavorite(idea._id, idea.favorite)}
                  className={`star ${idea.favorite ? "active" : ""}`}
                >
                  ★
                </button>
                <button onClick={() => deleteIdea(idea._id)} className="delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;