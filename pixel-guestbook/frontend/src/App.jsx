import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- NEW RPG NOIR PALETTE ---
const COLORS = {
  bg: '#1a1a2e',      // Deep Midnight
  panel: '#16213e',   // Dark Navy
  text: '#e94560',    // Crimson Pink (Accent)
  subtext: '#ffffff', // White
  border: '#0f3460',  // Muted Blue
  success: '#00d1ff', // Cyan
  error: '#ff4d4d'    // Bright Red
};

const rpgBorder = {
  border: `4px solid ${COLORS.text}`,
  boxShadow: `8px 8px 0px ${COLORS.border}`,
  backgroundColor: COLORS.panel,
  padding: '25px',
  imageRendering: 'pixelated',
  marginBottom: '30px'
};

const rpgInput = {
  width: '100%',
  padding: '12px',
  fontFamily: '"Courier New", Courier, monospace',
  backgroundColor: '#0f3460',
  color: '#fff',
  border: `2px solid ${COLORS.text}`,
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '5px'
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const MAX_CHAR = 150; // Character limit for the "Quest Log"

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("QUEST DATA LOST IN THE VOID", "error"));
  
  useEffect(() => { load(); }, []);

  const showMsg = (msg, type = 'success') => {
    setStatus({ msg: msg.toUpperCase(), type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
  };

  const handleAuth = async (type) => {
    try {
      const res = await axios.post(`${API}/${type}`, authForm);
      if (type === 'login') {
        localStorage.setItem('pixel_user', JSON.stringify(res.data));
        setUser(res.data);
        showMsg(`WELCOME, PLAYER: ${res.data.username}`);
      } else {
        showMsg("NEW ACCOUNT FORGED! LOG IN NOW.");
      }
    } catch (err) { 
      showMsg(err.response?.data?.message || "AUTH FAILED", "error"); 
    }
  };

  const logout = () => {
    localStorage.removeItem('pixel_user');
    setUser(null);
    showMsg("YOU HAVE DISCONNECTED.");
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (postForm.message.length > MAX_CHAR) return showMsg("MESSAGE TOO LONG!", "error");
    try {
      await axios.post(API, { ...postForm, author_username: user.username });
      setPostForm({ name: '', message: '' });
      showMsg("MEMORIES ETCHED INTO THE WALL.");
      load();
    } catch (err) { showMsg("CONNECTION ERROR", "error"); }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API}/${id}?username=${user.username}`, { message: editValue });
      setEditingId(null);
      showMsg("TIMELINE ALTERED.");
      load();
    } catch (err) { showMsg("FORBIDDEN ACTION", "error"); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${API}/${id}?username=${user.username}`);
      setDeleteConfirm(null);
      showMsg("DELETED FROM HISTORY.");
      load();
    } catch (err) { showMsg("DELETE FAILED", "error"); }
  };

  return (
    <div style={{ 
      backgroundColor: COLORS.bg, 
      color: COLORS.subtext, 
      minHeight: '100vh', 
      width: '100vw', // FULL SCREEN WIDTH
      fontFamily: '"Courier New", Courier, monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 0',
      margin: 0,
      overflowX: 'hidden'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3.5rem', color: COLORS.text, textShadow: '4px 4px #000', margin: 0 }}>
          PIXEL GUESTBOOK
        </h1>
        <p style={{ color: COLORS.success, letterSpacing: '2px' }}>V2.0 // QUEST_LOG_CONNECTED</p>
      </div>

      {/* FLOATING STATUS BAR */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        zIndex: 100, 
        width: '90%', 
        maxWidth: '600px',
        textAlign: 'center',
        display: status.msg ? 'block' : 'none',
        backgroundColor: status.type === 'error' ? COLORS.error : COLORS.success,
        padding: '10px',
        border: '3px solid #fff',
        boxShadow: '4px 4px 0px #000',
        fontWeight: 'bold',
        color: '#000'
      }}>
        {status.msg}
      </div>

      <div style={{ width: '90%', maxWidth: '900px' }}>
        
        {/* ACTION PANEL */}
        <div style={rpgBorder}>
          {!user ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h2 style={{ color: COLORS.text }}>IDENTIFY YOURSELF</h2>
                <input placeholder="USERNAME" style={rpgInput} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
                <input placeholder="PASSWORD" type="password" style={rpgInput} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
                <button style={{ ...rpgInput, cursor: 'pointer', backgroundColor: COLORS.text, border: 'none' }} onClick={() => handleAuth('login')}>[ LOGIN ]</button>
                <button style={{ ...rpgInput, cursor: 'pointer', backgroundColor: 'transparent' }} onClick={() => handleAuth('register')}>[ NEW GAME ]</button>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: COLORS.success }}>PLAYER: {user.username.toUpperCase()}</span>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: COLORS.text, cursor: 'pointer', textDecoration: 'underline' }}>LOGOUT</button>
              </div>
              <form onSubmit={submitPost}>
                <input placeholder="DISPLAY NAME" style={rpgInput} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                <textarea 
                  placeholder="WRITE YOUR MESSAGE..." 
                  style={{ ...rpgInput, height: '100px', resize: 'none' }} 
                  value={postForm.message} 
                  onChange={e => setPostForm({...postForm, message: e.target.value})} 
                  required 
                />
                
                {/* CHARACTER COUNTER */}
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: postForm.message.length > MAX_CHAR ? COLORS.error : COLORS.subtext }}>
                  {postForm.message.length} / {MAX_CHAR}
                </div>

                <button type="submit" style={{ ...rpgInput, marginTop: '10px', backgroundColor: COLORS.text, cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>
                  POST TO THE ANCIENT WALL
                </button>
              </form>
            </div>
          )}
        </div>

        {/* WALL ENTRIES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {entries.map(e => (
            <div key={e.id} style={rpgBorder}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px' }}>
                <span style={{ color: COLORS.text, fontWeight: 'bold' }}>{e.name.toUpperCase()}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>@{e.author_username}</span>
              </div>
              
              <div style={{ padding: '20px 0' }}>
                {editingId === e.id ? (
                  <textarea style={{ ...rpgInput, height: '80px' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                ) : (
                  <p style={{ fontSize: '1.1rem', margin: 0 }}>"{e.message}"</p>
                )}
              </div>

              {user?.username === e.author_username && (
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                  {editingId === e.id ? (
                    <>
                      <button onClick={() => handleUpdate(e.id)} style={{ color: COLORS.success, background: 'none', border: 'none', cursor: 'pointer' }}>[ SAVE ]</button>
                      <button onClick={() => setEditingId(null)} style={{ color: COLORS.subtext, background: 'none', border: 'none', cursor: 'pointer' }}>[ CANCEL ]</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(e.id); setEditValue(e.message); }} style={{ color: COLORS.subtext, background: 'none', border: 'none', cursor: 'pointer' }}>[ EDIT ]</button>
                      
                      {deleteConfirm === e.id ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ color: COLORS.error }}>SURE?</span>
                          <button onClick={() => remove(e.id)} style={{ color: COLORS.error, background: 'none', border: 'none', cursor: 'pointer' }}>YES</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ color: COLORS.subtext, background: 'none', border: 'none', cursor: 'pointer' }}>NO</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(e.id)} style={{ color: COLORS.error, background: 'none', border: 'none', cursor: 'pointer' }}>[ DELETE ]</button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;