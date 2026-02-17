import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- Reusable Retro Styles ---
const pixelBorder = { border: '3px solid #333', boxShadow: '4px 4px 0px #333' };
const inputStyle = { padding: '10px', fontFamily: 'monospace', border: '2px solid #333', outline: 'none' };
const btnStyle = { padding: '10px 15px', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', border: '2px solid #333', background: '#fff' };

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  
  // Replace alerts with status state
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("Failed to load wall.", "error"));
  
  useEffect(() => { load(); }, []);

  const showMsg = (msg, type = 'success') => {
    setStatus({ msg, type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
  };

  const handleAuth = async (type) => {
    try {
      const res = await axios.post(`${API}/${type}`, authForm);
      if (type === 'login') {
        localStorage.setItem('pixel_user', JSON.stringify(res.data));
        setUser(res.data);
        showMsg(`Welcome back, ${res.data.username}!`);
      } else {
        showMsg("Registration successful! Please login.");
      }
    } catch (err) { 
      showMsg(err.response?.data?.message || "Auth Error", "error"); 
    }
  };

  const logout = () => {
    localStorage.removeItem('pixel_user');
    setUser(null);
    showMsg("Logged out.");
  };

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, { ...postForm, author_username: user.username });
      setPostForm({ name: '', message: '' });
      showMsg("Memory posted to the wall!");
      load();
    } catch (err) { showMsg("Could not post.", "error"); }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API}/${id}?username=${user.username}`, { message: editValue });
      setEditingId(null);
      showMsg("Message updated!");
      load();
    } catch (err) { showMsg("Update failed.", "error"); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${API}/${id}?username=${user.username}`);
      setDeleteConfirm(null);
      showMsg("Pixel deleted forever.");
      load();
    } catch (err) { showMsg("Delete failed.", "error"); }
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto', color: '#333', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px' }}>🕹️ Pixel Guestbook</h1>

      {/* STATUS NOTIFICATION BAR */}
      {status.msg && (
        <div style={{ 
          ...pixelBorder, 
          padding: '10px', 
          marginBottom: '20px', 
          textAlign: 'center',
          backgroundColor: status.type === 'error' ? '#ff6b6b' : '#51cf66',
          color: 'white'
        }}>
          {status.msg}
        </div>
      )}

      {!user ? (
        <div style={{ ...pixelBorder, padding: '20px', background: '#fff' }}>
          <h3 style={{ marginTop: 0 }}>Join the Wall</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Username" style={inputStyle} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input placeholder="Password" type="password" style={inputStyle} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...btnStyle, flex: 1 }} onClick={() => handleAuth('login')}>Login</button>
              <button style={{ ...btnStyle, flex: 1, backgroundColor: '#eee' }} onClick={() => handleAuth('register')}>Register</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...pixelBorder, padding: '20px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span>Hello, <strong>{user.username}</strong></span>
            <button onClick={logout} style={{ ...btnStyle, padding: '4px 8px', fontSize: '10px' }}>LOGOUT</button>
          </div>
          <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Display Name" style={inputStyle} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
            <textarea placeholder="Write something pixelated..." style={{ ...inputStyle, height: '80px', resize: 'none' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
            <button type="submit" style={{ ...btnStyle, background: '#333', color: '#fff' }}>POST TO WALL</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        {entries.map(e => (
          <div key={e.id} style={{ ...pixelBorder, margin: '20px 0', padding: '20px', background: '#fff', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', marginBottom: '10px', paddingBottom: '5px' }}>
              <strong>{e.name}</strong>
              <span style={{ fontSize: '10px', color: '#888' }}>@{e.author_username}</span>
            </div>
            
            {editingId === e.id ? (
              <div>
                <textarea style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button style={btnStyle} onClick={() => handleUpdate(e.id)}>Save ✅</button>
                  <button style={btnStyle} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p style={{ lineHeight: '1.4', wordBreak: 'break-word' }}>{e.message}</p>
                {user?.username === e.author_username && (
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                    <button onClick={() => { setEditingId(e.id); setEditValue(e.message); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'blue', textDecoration: 'underline', padding: 0 }}>Edit</button>
                    
                    {deleteConfirm === e.id ? (
                      <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Sure?</span>
                        <button onClick={() => remove(e.id)} style={{ color: 'red', background: 'none', border: '1px solid red', cursor: 'pointer' }}>Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: '1px solid #333', cursor: 'pointer' }}>No</button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteConfirm(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red', textDecoration: 'underline', padding: 0 }}>Delete</button>
                    )}
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