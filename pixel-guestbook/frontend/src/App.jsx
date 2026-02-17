import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- RPG GOLD & BLUE PALETTE ---
const COLORS = {
  bg: '#0a0a0f',       // Void Black
  surface: '#121225',  // Deep Blue Panel
  border: '#c5a059',   // Antique Gold
  text: '#fdfdfd',     // Parchment White
  accent: '#7b61ff',   // Magic Purple
  success: '#50fa7b',  // Level Up Green
  error: '#ff5555'     // HP Low Red
};

const rpgContainer = {
  width: '100%',
  border: `4px double ${COLORS.border}`,
  backgroundColor: COLORS.surface,
  boxShadow: `inset 0 0 15px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.8)`,
  padding: '30px',
  boxSizing: 'border-box',
  marginBottom: '40px'
};

const rpgInput = {
  width: '100%',
  padding: '15px',
  fontFamily: '"Courier New", Courier, monospace',
  backgroundColor: '#05050a',
  color: '#fff',
  border: `2px solid ${COLORS.border}`,
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '10px',
  fontSize: '1rem'
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

  const MAX_CHAR = 150;

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("SYSTEM: CONNECTION TO REALM SEVERED", "error"));
  
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
        showMsg(`HERO ${res.data.username} HAS JOINED THE PARTY`);
      } else {
        showMsg("NEW JOURNEY REGISTERED. PROCEED TO LOGIN.");
      }
    } catch (err) { 
      showMsg(err.response?.data?.message || "QUEST DENIED", "error"); 
    }
  };

  const logout = () => {
    localStorage.removeItem('pixel_user');
    setUser(null);
    showMsg("HERO HAS LEFT THE REALM.");
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (postForm.message.length > MAX_CHAR) return showMsg("SCROLL IS TOO SHORT FOR THIS TALE!", "error");
    try {
      await axios.post(API, { ...postForm, author_username: user.username });
      setPostForm({ name: '', message: '' });
      showMsg("YOUR LEGEND HAS BEEN RECORDED.");
      load();
    } catch (err) { showMsg("MAGIC MISFIRE: POST FAILED", "error"); }
  };

  return (
    <div style={{ 
      backgroundColor: COLORS.bg, 
      color: COLORS.text, 
      minHeight: '100vh', 
      width: '100%', 
      fontFamily: '"Courier New", Courier, monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '50px 0',
      margin: 0
    }}>
      
      {/* RPG HEADER & GLOBAL COUNTER */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '4rem', color: COLORS.border, textShadow: '0 0 10px #c5a059', margin: 0, letterSpacing: '8px' }}>
          THE PIXEL ARCHIVES
        </h1>
        <div style={{ marginTop: '10px', fontSize: '1.2rem', color: COLORS.accent }}>
          [ GLOBAL QUESTS COMPLETED: {entries.length} ]
        </div>
      </div>

      {/* NOTIFICATION BOX (RPG POPUP STYLE) */}
      {status.msg && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, width: '400px', backgroundColor: '#000', border: `3px solid ${COLORS.border}`,
          padding: '15px', textAlign: 'center', boxShadow: '0 0 20px #000'
        }}>
          <span style={{ color: status.type === 'error' ? COLORS.error : COLORS.success }}>▶ {status.msg}</span>
        </div>
      )}

      <div style={{ width: '90%', maxWidth: '1100px' }}>
        
        {/* PLAYER COMMAND CENTER */}
        <div style={rpgContainer}>
          {!user ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <h2 style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: '10px' }}>IDENTIFY TRAVELLER</h2>
                <input placeholder="USERNAME" style={rpgInput} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
                <input placeholder="PASSWORD" type="password" style={rpgInput} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '15px' }}>
                <button style={{ ...rpgInput, cursor: 'pointer', backgroundColor: COLORS.border, color: '#000', border: 'none', fontWeight: 'bold' }} onClick={() => handleAuth('login')}>ENTER WORLD</button>
                <button style={{ ...rpgInput, cursor: 'pointer', backgroundColor: 'transparent', color: COLORS.border }} onClick={() => handleAuth('register')}>NEW GAME</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', color: COLORS.accent }}>
                <span>[ CURRENT HERO: {user.username.toUpperCase()} ]</span>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: COLORS.error, cursor: 'pointer', fontSize: '0.9rem' }}>LOGOUT</button>
              </div>
              <form onSubmit={submitPost}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                  <input placeholder="TITLE / NAME" style={rpgInput} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      placeholder="LEAVE A MESSAGE IN THE ARCHIVES..." 
                      style={{ ...rpgInput, height: '52px', resize: 'none' }} 
                      value={postForm.message} 
                      onChange={e => setPostForm({...postForm, message: e.target.value})} 
                      required 
                    />
                    <div style={{ position: 'absolute', right: '10px', bottom: '20px', fontSize: '0.7rem' }}>
                      {postForm.message.length}/{MAX_CHAR}
                    </div>
                  </div>
                </div>
                <button type="submit" style={{ ...rpgInput, width: '100%', backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, cursor: 'pointer', color: COLORS.border, marginTop: '10px' }}>
                  RECORD LEGEND
                </button>
              </form>
            </div>
          )}
        </div>

        {/* THE ANCIENT WALL (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {entries.map(e => (
            <div key={e.id} style={{ ...rpgContainer, padding: '20px', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '10px', opacity: 0.8 }}>
                <span style={{ color: COLORS.accent, fontWeight: 'bold' }}>{e.name.toUpperCase()}</span>
                <span style={{ fontSize: '0.6rem' }}>LVL. {e.author_username}</span>
              </div>
              
              <div style={{ padding: '20px 0', minHeight: '80px', fontSize: '1.1rem' }}>
                {editingId === e.id ? (
                  <textarea style={{ ...rpgInput, height: '70px' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                ) : (
                  <p style={{ margin: 0, fontStyle: 'italic' }}>"{e.message}"</p>
                )}
              </div>

              {user?.username === e.author_username && (
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.7rem', borderTop: `1px solid ${COLORS.border}`, paddingTop: '10px' }}>
                    <button onClick={() => { setEditingId(e.id); setEditValue(e.message); }} style={{ color: COLORS.text, background: 'none', border: 'none', cursor: 'pointer' }}>[ ALTER ]</button>
                    <button onClick={() => setDeleteConfirm(e.id)} style={{ color: COLORS.error, background: 'none', border: 'none', cursor: 'pointer' }}>[ BANISH ]</button>
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