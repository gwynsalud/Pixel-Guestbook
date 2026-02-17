import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- CLASSIC RPG COLORS (SNES BLUE THEME) ---
const COLORS = {
  bg: '#050505',       // Pure black backdrop
  windowBg: 'linear-gradient(180deg, #0000aa 0%, #000044 100%)', // Classic RPG Blue
  border: '#e7e7e7',   // Silver/White border
  gold: '#ffcc00',     // UI Highlight
  text: '#ffffff',
  error: '#ff4444'
};

const windowStyle = {
  background: COLORS.windowBg,
  border: `4px solid ${COLORS.border}`,
  borderRadius: '8px',
  boxShadow: '0 0 0 2px #000, 4px 4px 0px rgba(0,0,0,0.5)',
  padding: '20px',
  color: COLORS.text,
  imageRendering: 'pixelated'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontFamily: '"Courier New", Courier, monospace',
  backgroundColor: 'rgba(0,0,0,0.3)',
  color: COLORS.gold,
  border: `1px solid ${COLORS.border}`,
  outline: 'none',
  boxSizing: 'border-box'
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [status, setStatus] = useState({ msg: '', type: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("CONNECTION ERROR", "error"));
  useEffect(() => { load(); }, []);

  const showMsg = (msg, type = 'success') => {
    setStatus({ msg: msg.toUpperCase(), type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  const handleAuth = async (type) => {
    try {
      const res = await axios.post(`${API}/${type}`, authForm);
      if (type === 'login') {
        localStorage.setItem('pixel_user', JSON.stringify(res.data));
        setUser(res.data);
        showMsg("PARTY MEMBER JOINED");
      } else {
        showMsg("NEW HERO REGISTERED");
      }
    } catch (err) { showMsg("ACTION FAILED", "error"); }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '' });
    showMsg("LOG UPDATED");
    load();
  };

  return (
    <div style={{ 
      backgroundColor: COLORS.bg, 
      minHeight: '100vh', 
      width: '100%', 
      fontFamily: '"Courier New", Courier, monospace',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: COLORS.text, fontSize: '3rem', margin: 0, textShadow: '4px 4px #000' }}>
          THE PIXEL ARCHIVES
        </h1>
        <p style={{ color: COLORS.gold }}>[ TOTAL QUESTS: {entries.length} ]</p>
      </div>

      {/* TOP NOTIFICATION AREA */}
      <div style={{ height: '40px', textAlign: 'center', marginBottom: '20px' }}>
        {status.msg && (
          <span style={{ 
            background: COLORS.windowBg, 
            padding: '10px 40px', 
            border: `2px solid ${COLORS.border}`,
            color: status.type === 'error' ? COLORS.error : COLORS.gold
          }}>
            {status.msg}
          </span>
        )}
      </div>

      {/* MAIN LAYOUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
        
        {/* LEFT SIDE: COMMAND MENU */}
        <aside>
          <div style={windowStyle}>
            {!user ? (
              <>
                <h3 style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: '5px' }}>COMMAND</h3>
                <label style={{ fontSize: '0.8rem' }}>NAME:</label>
                <input style={inputStyle} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
                <label style={{ fontSize: '0.8rem' }}>PASS:</label>
                <input type="password" style={inputStyle} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                <button style={{ ...inputStyle, cursor: 'pointer', marginTop: '10px', background: COLORS.border, color: '#000' }} onClick={() => handleAuth('login')}>▶ LOGIN</button>
                <button style={{ ...inputStyle, cursor: 'pointer', marginTop: '5px', background: 'none' }} onClick={() => handleAuth('register')}>▶ NEW GAME</button>
              </>
            ) : (
              <>
                <h3 style={{ borderBottom: `2px solid ${COLORS.border}` }}>STATUS</h3>
                <p style={{ color: COLORS.gold }}>HERO: {user.username}</p>
                <form onSubmit={submitPost}>
                   <input placeholder="TITLE" style={rpgInput} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                   <textarea placeholder="MESSAGE" style={{...inputStyle, height: '80px', marginTop: '10px'}} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
                   <button type="submit" style={{ ...inputStyle, cursor: 'pointer', marginTop: '10px', background: COLORS.gold, color: '#000' }}>▶ POST</button>
                </form>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: COLORS.error, cursor: 'pointer', marginTop: '20px' }}>[ RESET ]</button>
              </>
            )}
          </div>
        </aside>

        {/* RIGHT SIDE: THE WALL (FULL WIDTH GRID) */}
        <main style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          alignContent: 'start'
        }}>
          {entries.map(e => (
            <div key={e.id} style={{ ...windowStyle, padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: COLORS.gold, marginBottom: '10px' }}>
                <span>{e.name.toUpperCase()}</span>
                <span>@{e.author_username}</span>
              </div>
              <p style={{ margin: 0, lineHeight: '1.4' }}>"{e.message}"</p>
            </div>
          ))}
        </main>

      </div>
    </div>
  );
}

export default App;