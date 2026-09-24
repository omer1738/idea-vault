import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/ideas";

function App() {
  const [ideas, setIdeas] = useState([]);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setIdeas(data);
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setIdeas(ideas.filter((idea) => idea._id !== id));
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>💡 Idea Vault</h1>
        <p className="subtitle">Save it before you forget it.</p>

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
                <button
                  onClick={() => deleteIdea(idea._id)}
                  className="delete"
                >
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