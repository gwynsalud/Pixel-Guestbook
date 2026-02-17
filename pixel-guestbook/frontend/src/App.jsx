import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- RPG Theme Constants ---
const COLORS = {
  bg: '#9bbc0f',      // Classic GameBoy Green
  panel: '#8bac0f',   // Darker Green
  text: '#0f380f',    // Deep Forest Green
  accent: '#306230',  // Darkest Green
  error: '#e64539'    // Retro Red
};

const rpgBorder = {
  border: `4px solid ${COLORS.text}`,
  boxShadow: `6px 6px 0px ${COLORS.accent}`,
  backgroundColor: COLORS.panel,
  imageRendering: 'pixelated'
};

const rpgInput = {
  width: '100%',
  padding: '12px',
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '1rem',
  border: `3px solid ${COLORS.text}`,
  backgroundColor: COLORS.bg,
  color: COLORS.text,
  boxSizing: 'border-box',
  outline: 'none',
  marginBottom: '10px'
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

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("QUEST FAILED: DATA NOT FOUND", "error"));
  
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
        showMsg(`WELCOME BACK, HERO ${res.data.username.toUpperCase()}!`);
      } else {
        showMsg("NEW HERO REGISTERED! LOG IN TO CONTINUE.");
      }
    } catch (err) { 
      showMsg(err.response?.data?.message?.toUpperCase() || "AUTH ERROR", "error"); 
    }
  };

  const logout = () => {
    localStorage.removeItem('pixel_user');
    setUser(null);
    showMsg("YOU HAVE LEFT THE PARTY.");
  };

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, { ...postForm, author_username: user.username });
      setPostForm({ name: '', message: '' });
      showMsg("MEMORY SAVED TO THE ANCIENT WALL!");
      load();
    } catch (err) { showMsg("SYSTEM ERROR: UNABLE TO POST", "error"); }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API}/${id}?username=${user.username}`, { message: editValue });
      setEditingId(null);
      showMsg("HISTORY HAS BEEN REWRITTEN!");
      load();
    } catch (err) { showMsg("UNAUTHORIZED EDIT ATTEMPT", "error"); }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${API}/${id}?username=${user.username}`);
      setDeleteConfirm(null);
      showMsg("PIXEL DELETED FROM EXISTENCE.");
      load();
    } catch (err) { showMsg("ANCIENT PROTECTION BLOCKS DELETION", "error"); }
  };

  return (
    <div style={{ 
      backgroundColor: COLORS.bg, 
      color: COLORS.text, 
      minHeight: '100vh', 
      fontFamily: '"Courier New", Courier, monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      
      {/* RPG HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0', textTransform: 'uppercase', letterSpacing: '4px' }}>
           🕹️ PIXEL GUESTBOOK
        </h1>
        <div style={{ height: '4px', background: COLORS.text, width: '100%', marginTop: '10px' }}></div>
      </header>

      {/* RPG STATUS BAR (Replaces Alerts) */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        height: '50px', 
        marginBottom: '20px',
        visibility: status.msg ? 'visible' : 'hidden'
      }}>
        <div style={{ 
          ...rpgBorder, 
          padding: '10px', 
          textAlign: 'center',
          backgroundColor: status.type === 'error' ? COLORS.error : COLORS.accent,
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {status.msg}
        </div>
      </div>

      <main style={{ width: '100%', maxWidth: '800px' }}>
        
        {/* AUTH / POST PANEL */}
        <section style={{ ...rpgBorder, padding: '30px', marginBottom: '40px' }}>
          {!user ? (
            <>
              <h2 style={{ marginTop: 0 }}>[ NEW PLAYER SIGN-IN ]</h2>
              <input placeholder="USERNAME" style={rpgInput} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input placeholder="PASSWORD" type="password" style={rpgInput} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <div style={{ display: 'flex', gap: '20px' }}>
                <button style={{ ...rpgInput, cursor: 'pointer', flex: 1, fontWeight: 'bold' }} onClick={() => handleAuth('login')}>LOG IN</button>
                <button style={{ ...rpgInput, cursor: 'pointer', flex: 1, fontWeight: 'bold', backgroundColor: COLORS.accent, color: '#fff' }} onClick={() => handleAuth('register')}>REGISTER</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span>HERO: <strong>{user.username.toUpperCase()}</strong></span>
                <button onClick={logout} style={{ ...rpgBorder, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>EXIT GAME</button>
              </div>
              <form onSubmit={submitPost}>
                <input placeholder="DISPLAY NAME" style={rpgInput} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                <textarea placeholder="LEAVE YOUR MARK ON THE WORLD..." style={{ ...rpgInput, height: '120px', resize: 'none' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
                <button type="submit" style={{ ...rpgInput, cursor: 'pointer', backgroundColor: COLORS.text, color: COLORS.bg, fontWeight: 'bold' }}>WRITE TO THE ANCIENT WALL</button>
              </form>
            </>
          )}
        </section>

        {/* GUESTBOOK ENTRIES */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {entries.map(e => (
            <div key={e.id} style={{ ...rpgBorder, padding: '25px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px dashed ${COLORS.accent}`, paddingBottom: '10px', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>{e.name.toUpperCase()}</span>
                <span style={{ fontSize: '0.7rem' }}>LEVEL: {e.author_username.toUpperCase()}</span>
              </div>
              
              {editingId === e.id ? (
                <div>
                  <textarea style={{ ...rpgInput, height: '100px' }} value={editValue} onChange={e => setEditValue(e.target.value)} />
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={{ ...rpgBorder, padding: '5px 15px', cursor: 'pointer' }} onClick={() => handleUpdate(e.id)}>SAVE</button>
                    <button style={{ ...rpgBorder, padding: '5px 15px', cursor: 'pointer' }} onClick={() => setEditingId(null)}>CANCEL</button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '1.2rem', margin: '20px 0', lineHeight: '1.6' }}>"{e.message}"</p>
                  
                  {user?.username === e.author_username && (
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                      <button onClick={() => { setEditingId(e.id); setEditValue(e.message); }} style={{ color: COLORS.accent, fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>[ EDIT ]</button>
                      
                      {deleteConfirm === e.id ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: COLORS.error, fontWeight: 'bold' }}>FORGET THIS MEMORY?</span>
                          <button onClick={() => remove(e.id)} style={{ color: COLORS.error, cursor: 'pointer', background: 'none', border: `1px solid ${COLORS.error}` }}>YES</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ cursor: 'pointer', background: 'none', border: `1px solid ${COLORS.text}` }}>NO</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(e.id)} style={{ color: COLORS.error, fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>[ DELETE ]</button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      </main>

      <footer style={{ marginTop: '60px', paddingBottom: '40px', fontSize: '0.8rem', opacity: 0.7 }}>
        PRESS START TO CONTINUE | PIXEL-GUESTBOOK v2.0
      </footer>
    </div>
  );
}

export default App;