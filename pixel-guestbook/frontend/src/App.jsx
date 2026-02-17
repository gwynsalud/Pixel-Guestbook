import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- PIXEL RPG THEME (NES/GBC STYLE) ---
const THEME = {
  bg: '#212529',         // Charcoal Dark
  window: '#343a40',     // UI Blue-Grey
  border: '#ffffff',     // Classic White
  accent: '#ffcc00',     // Quest Gold
  success: '#44cc44',    // Level Up Green
  error: '#ff4444',      // HP Critical Red
  shadow: '#000000'
};

// --- CRT SCANLINE EFFECT (CSS Only) ---
const scanlineStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
  zIndex: 9999,
  backgroundSize: '100% 4px, 3px 100%',
  pointerEvents: 'none'
};

const boxStyle = {
  backgroundColor: THEME.window,
  border: `4px solid ${THEME.border}`,
  boxShadow: `0 0 0 4px ${THEME.shadow}, 8px 8px 0px ${THEME.shadow}`,
  padding: '20px',
  color: THEME.border,
  imageRendering: 'pixelated',
  position: 'relative'
};

const rpgBtn = (color = THEME.window, textColor = THEME.border) => ({
  backgroundColor: color,
  color: textColor,
  border: `4px solid ${THEME.border}`,
  boxShadow: `2px 2px 0px ${THEME.shadow}`,
  padding: '10px 20px',
  fontFamily: '"Courier New", Courier, monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
  textTransform: 'uppercase'
});

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [status, setStatus] = useState({ msg: '', type: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("QUEST DATA LOST", "error"));
  useEffect(() => { load(); }, []);

  const showMsg = (msg, type = 'success') => {
    setStatus({ msg: `> ${msg.toUpperCase()}`, type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
  };

  const handleAuth = async (type) => {
    try {
      const res = await axios.post(`${API}/${type}`, authForm);
      if (type === 'login') {
        localStorage.setItem('pixel_user', JSON.stringify(res.data));
        setUser(res.data);
        showMsg("HERO JOINED PARTY");
      } else {
        showMsg("NEW SAVE CREATED");
      }
    } catch (err) { showMsg("ACTION FAILED", "error"); }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '' });
    showMsg("SCROLL UPDATED");
    load();
  };

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', width: '100vw', margin: 0, padding: '40px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={scanlineStyle} /> {/* CRT OVERLAY */}

      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 10 }}>
        <h1 style={{ color: THEME.border, fontSize: '3.5rem', margin: 0, textShadow: `6px 6px 0px ${THEME.shadow}` }}>
          PIXEL ARCHIVES
        </h1>
        <div style={{ color: THEME.accent, fontSize: '1.2rem', marginTop: '10px' }}>
          -- WORLD LOGS: {entries.length} --
        </div>
      </div>

      <div style={{ width: '90%', maxWidth: '1000px', zIndex: 10 }}>
        
        {/* ACTION / AUTH WINDOW */}
        <div style={{ ...boxStyle, marginBottom: '50px' }}>
          {!user ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 10px 0', color: THEME.accent }}>WHO GOES THERE?</p>
                <input placeholder="NAME" style={{ ...rpgBtn(), width: '100%', marginBottom: '10px', textAlign: 'left' }} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
                <input type="password" placeholder="KEY" style={{ ...rpgBtn(), width: '100%', textAlign: 'left' }} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={rpgBtn(THEME.border, THEME.bg)} onClick={() => handleAuth('login')}>[ LOGIN ]</button>
                <button style={rpgBtn()} onClick={() => handleAuth('register')}>[ NEW GAME ]</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div>
                <p style={{ color: THEME.accent, margin: '0 0 10px 0' }}>STATUS: ACTIVE</p>
                <p style={{ margin: 0 }}>HERO: {user.username}</p>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ ...rpgBtn(), marginTop: '20px', fontSize: '0.7rem' }}>EXIT GAME</button>
              </div>
              <form onSubmit={submitPost}>
                <input placeholder="ENTRY TITLE" style={{ ...rpgBtn(), width: '100%', marginBottom: '10px' }} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                <textarea placeholder="DESCRIBE YOUR JOURNEY..." style={{ ...rpgBtn(), width: '100%', height: '80px', resize: 'none' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
                <button type="submit" style={{ ...rpgBtn(THEME.accent, THEME.shadow), width: '100%', marginTop: '10px' }}>WRITE TO HISTORY</button>
              </form>
            </div>
          )}
        </div>

        {/* NOTIFICATION BOX */}
        {status.msg && (
          <div style={{ ...boxStyle, border: `4px solid ${status.type === 'error' ? THEME.error : THEME.success}`, position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'auto', minWidth: '300px', textAlign: 'center' }}>
            <span style={{ color: status.type === 'error' ? THEME.error : THEME.success }}>{status.msg}</span>
          </div>
        )}

        {/* QUEST ENTRIES (THE WALL) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {entries.map(e => (
            <div key={e.id} style={boxStyle}>
              {/* Corner Accent Decoration */}
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', background: THEME.border, border: `2px solid ${THEME.shadow}` }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px dashed ${THEME.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
                <span style={{ color: THEME.accent, fontWeight: 'bold' }}>{e.name.toUpperCase()}</span>
                <span style={{ fontSize: '0.7rem' }}>@{e.author_username}</span>
              </div>
              
              <p style={{ margin: '15px 0', lineHeight: '1.6', fontSize: '1.1rem' }}>"{e.message}"</p>
              
              <div style={{ fontSize: '0.6rem', textAlign: 'right', opacity: 0.6 }}>
                DATE: {new Date(e.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;