import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

// --- RPG CARD GAME COLORS ---
const THEME = {
  board: '#2c1e1a',     // Dark Mahogany Table
  cardBg: '#f4d29c',    // Aged Parchment
  cardBorder: '#5d4037',// Leather Brown
  mana: '#3a7bd5',      // Quest Blue
  gold: '#ffb300',      // Rare Card Gold
  text: '#3e2723',      // Dark Ink
};

const cardStyle = {
  backgroundColor: THEME.cardBg,
  border: `6px solid ${THEME.cardBorder}`,
  boxShadow: '0 8px 0px #1b1311',
  padding: '15px',
  color: THEME.text,
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  position: 'relative',
  minHeight: '220px',
  cursor: 'default',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  fontFamily: '"Courier New", Courier, monospace',
  backgroundColor: 'rgba(255,255,255,0.2)',
  border: `3px solid ${THEME.cardBorder}`,
  color: THEME.text,
  fontWeight: 'bold',
  outline: 'none',
  marginBottom: '8px'
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '' });
  const [status, setStatus] = useState({ msg: '', type: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("DECK LOAD ERROR", "error"));
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
        showMsg("PLAYER JOINED THE TABLE");
      } else {
        showMsg("NEW ACCOUNT FORGED");
      }
    } catch (err) { showMsg("INVALID MANA / ACCESS", "error"); }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '' });
    showMsg("CARD ADDED TO DECK");
    load();
  };

  return (
    <div style={{ 
      backgroundColor: THEME.board, 
      minHeight: '100vh', 
      width: '100vw', 
      margin: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: THEME.gold, fontSize: '3rem', margin: 0, textShadow: '4px 4px #000' }}>
          PIXEL CARD REALM
        </h1>
        <div style={{ color: '#fff', fontSize: '1rem', letterSpacing: '4px' }}>
          [ ACTIVE DECK: {entries.length} CARDS ]
        </div>
      </div>

      {/* TOP STATUS OVERLAY */}
      {status.msg && (
        <div style={{ 
          position: 'fixed', top: '20px', backgroundColor: status.type === 'error' ? '#d32f2f' : THEME.mana,
          padding: '10px 30px', border: '4px solid #fff', color: '#fff', zIndex: 100, fontWeight: 'bold'
        }}>
          {status.msg}
        </div>
      )}

      {/* CENTERED PLAY AREA */}
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        
        {/* ACTION PANEL (The "Player's Hand") */}
        <div style={{ ...cardStyle, maxWidth: '500px', margin: '0 auto 60px auto', height: 'auto', minHeight: 'unset' }}>
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 15px 0' }}>IDENTIFY PLAYER</h2>
              <input placeholder="USERNAME" style={inputStyle} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input type="password" placeholder="PASSWORD" style={inputStyle} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={{ ...inputStyle, background: THEME.gold, flex: 1, cursor: 'pointer' }} onClick={() => handleAuth('login')}>LOGIN</button>
                <button style={{ ...inputStyle, background: 'none', flex: 1, cursor: 'pointer' }} onClick={() => handleAuth('register')}>REGISTER</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${THEME.cardBorder}`, marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>NEW QUEST CARD</span>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '10px' }}>FORFEIT</button>
              </div>
              <form onSubmit={submitPost}>
                <input placeholder="CARD NAME" style={inputStyle} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                <textarea placeholder="CARD ABILITY / DESCRIPTION" style={{ ...inputStyle, height: '60px', resize: 'none' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
                <button type="submit" style={{ ...inputStyle, background: THEME.mana, color: '#fff', cursor: 'pointer', border: '4px solid #fff' }}>PLAY CARD</button>
              </form>
            </div>
          )}
        </div>

        {/* CARD GRID (The "Battlefield") */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '30px', 
          justifyContent: 'center' 
        }}>
          {entries.map(e => (
            <div key={e.id} className="pixel-card" style={cardStyle}>
              {/* Card Rarity Circle */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '25px', height: '25px', borderRadius: '50%', border: `3px solid ${THEME.cardBorder}`, background: THEME.gold }} />
              
              <div style={{ borderBottom: `3px solid ${THEME.cardBorder}`, paddingBottom: '5px', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{e.name}</h4>
                <small style={{ fontSize: '10px', opacity: 0.7 }}>LEVEL: {e.author_username}</small>
              </div>

              <div style={{ flexGrow: 1, fontSize: '1rem', fontStyle: 'italic', padding: '10px 0' }}>
                "{e.message}"
              </div>

              <div style={{ borderTop: `2px solid ${THEME.cardBorder}`, paddingTop: '10px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold' }}>
                -- COLLECTIBLE QUEST CARD --
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;