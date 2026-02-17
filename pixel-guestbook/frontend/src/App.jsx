import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const load = () => axios.get(API).then(res => setEntries(res.data));
  useEffect(() => { load(); }, []);

  // --- Auth Handlers ---
  const handleAuth = async (type) => {
    try {
      const res = await axios.post(`${API}/${type}`, authForm);
      if (type === 'login') {
        localStorage.setItem('pixel_user', JSON.stringify(res.data));
        setUser(res.data);
      } else {
        alert("Registered! Now please login.");
      }
    } catch (err) { alert(err.response?.data?.message || "Auth Error"); }
  };

  const logout = () => {
    localStorage.removeItem('pixel_user');
    setUser(null);
  };

  // --- CRUD Handlers ---
  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '' });
    load();
  };

  const handleUpdate = async (id) => {
    await axios.put(`${API}/${id}?username=${user.username}`, { message: editValue });
    setEditingId(null);
    load();
  };

  const remove = async (id) => {
    if (confirm("Delete this pixel memory?")) {
      await axios.delete(`${API}/${id}?username=${user.username}`);
      load();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
      <h1>🕹️ Pixel Guestbook</h1>

      {!user ? (
        <div className="auth-section" style={{ border: '2px dashed #333', padding: '15px', marginBottom: '20px' }}>
          <h3>Login or Register</h3>
          <input placeholder="Username" onChange={e => setAuthForm({...authForm, username: e.target.value})} />
          <input placeholder="Password" type="password" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handleAuth('login')}>Login</button>
            <button onClick={() => handleAuth('register')}>Register</button>
          </div>
        </div>
      ) : (
        <div className="post-section">
          <p>Logged in as: <strong>{user.username}</strong> <button onClick={logout}>Logout</button></p>
          <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Display Name (e.g. Lumine)" value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
            <textarea placeholder="Write something pixelated..." value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
            <button type="submit" style={{ background: '#333', color: '#fff', padding: '10px' }}>Post Message</button>
          </form>
        </div>
      )}

      <hr style={{ margin: '30px 0' }} />

      <div className="wall">
        {entries.map(e => (
          <div key={e.id} style={{ border: '2px solid #333', margin: '15px 0', padding: '15px', backgroundColor: '#f9f9f9' }}>
            <strong>{e.name}</strong> <small>(@{e.author_username})</small>
            
            {editingId === e.id ? (
              <div style={{ marginTop: '10px' }}>
                <textarea style={{ width: '100%' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                <button onClick={() => handleUpdate(e.id)}>Save ✅</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <p>{e.message}</p>
                {/* Only show controls if user is the author */}
                {user?.username === e.author_username && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setEditingId(e.id); setEditValue(e.message); }}>Edit</button>
                    <button onClick={() => remove(e.id)} style={{ color: 'red' }}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;