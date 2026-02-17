import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

const THEME = {
  board: '#2c1e1a',
  cardBg: '#f4d29c',
  cardBorder: '#5d4037',
  text: '#3e2723',
  freedom: '#3a7bd5', 
  quest: '#ffb300',
  oracle: '#9c27b0'
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [postForm, setPostForm] = useState({ name: '', message: '', category: 'freedom' });
  const [filter, setFilter] = useState('all');
  const [revealedIds, setRevealedIds] = useState([]);
  const [status, setStatus] = useState({ msg: '', type: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(() => showMsg("DECK DISCONNECTED", "error"));
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
        showMsg("PLAYER JOINED TABLE");
      } else {
        showMsg("NEW PROFILE FORGED");
      }
    } catch (err) { showMsg("INVALID MANA / PASSWORD", "error"); }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '', category: 'freedom' });
    showMsg("CARD PLAYED");
    load();
  };

  const toggleFlip = (id) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => (e.category === filter || (filter === 'oracle' && e.category === 'bounty')));

  const cardStyle = {
    backgroundColor: THEME.cardBg,
    border: `6px solid ${THEME.cardBorder}`,
    boxShadow: '0 8px 0px #1b1311',
    padding: '20px',
    color: THEME.text,
    position: 'relative'
  };

  return (
    <div style={{ backgroundColor: THEME.board, minHeight: '100vh', width: '100vw', padding: '40px 0', color: '#fff', fontFamily: 'monospace' }}>
      
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .pixel-card { animation: float 4s ease-in-out infinite; }
        .pixel-card:hover { animation-play-state: paused; }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: THEME.quest, fontSize: '3rem', margin: 0, textShadow: '4px 4px #000' }}>PIXEL CARD REALM</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          {['all', 'freedom', 'quest', 'oracle'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 15px', cursor: 'pointer', border: `3px solid ${THEME.cardBorder}`,
              background: filter === cat ? (THEME[cat] || THEME.cardBg) : 'transparent',
              color: filter === cat ? '#fff' : THEME.text, fontWeight: 'bold'
            }}>{cat === 'oracle' ? '🔮 ORACLE' : cat.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* PLAYER ACTION PANEL */}
        <div style={{ ...cardStyle, maxWidth: '600px', margin: '0 auto 50px auto' }}>
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>IDENTIFY PLAYER</h3>
              <input placeholder="USERNAME" style={inputStyles} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input type="password" placeholder="PASSWORD" style={inputStyles} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={{ ...inputStyles, background: THEME.quest, flex: 1, cursor: 'pointer' }} onClick={() => handleAuth('login')}>LOGIN</button>
                <button style={{ ...inputStyles, background: 'none', flex: 1, cursor: 'pointer' }} onClick={() => handleAuth('register')}>NEW PLAYER</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${THEME.cardBorder}`, marginBottom: '15px' }}>
                <strong>PLAYER: {user.username}</strong>
                <button onClick={() => { localStorage.clear(); setUser(null); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '10px' }}>[ EXIT ]</button>
              </div>
              <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input placeholder="CARD NAME" style={inputStyles} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} required />
                <textarea placeholder="MESSAGE OR FORTUNE..." style={{ ...inputStyles, height: '60px' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} required />
                <select style={inputStyles} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option value="freedom">CLASS: FREEDOM</option>
                  <option value="quest">CLASS: QUEST</option>
                  <option value="bounty">CLASS: ORACLE</option>
                </select>
                <button type="submit" style={{ padding: '12px', background: THEME[postForm.category === 'bounty' ? 'oracle' : postForm.category], color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>PLAY CARD</button>
              </form>
            </div>
          )}
        </div>

        {/* BATTLEFIELD */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredEntries.map(e => {
            const isOracle = e.category === 'bounty' || e.category === 'oracle';
            const isRevealed = revealedIds.includes(e.id);
            return (
              <div key={e.id} className="pixel-card" onClick={() => isOracle && toggleFlip(e.id)} style={{ 
                ...cardStyle, minHeight: '220px', cursor: isOracle ? 'pointer' : 'default',
                backgroundColor: (isOracle && !isRevealed) ? '#3d2b24' : THEME.cardBg,
                border: `6px solid ${isOracle && !isRevealed ? THEME.oracle : THEME.cardBorder}`,
                color: (isOracle && !isRevealed) ? '#fff' : THEME.text,
                display: 'flex', flexDirection: 'column'
              }}>
                {isOracle && !isRevealed ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '3rem' }}>🔮</div>
                    <div style={{ fontSize: '0.8rem', color: THEME.oracle }}>DRAW TO REVEAL</div>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '15px', height: '15px', borderRadius: '50%', background: THEME[e.category === 'bounty' ? 'oracle' : e.category] }} />
                    <div style={{ borderBottom: `2px solid ${THEME.cardBorder}`, paddingBottom: '5px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{e.name}</strong>
                    </div>
                    <p style={{ fontStyle: 'italic', margin: '15px 0', flex: 1 }}>"{e.message}"</p>
                    <div style={{ fontSize: '0.7rem', textAlign: 'right', fontWeight: 'bold' }}>
                      {isOracle ? '— THE VOID —' : `@${e.author_username}`}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const inputStyles = {
  padding: '10px', border: `2px solid #5d4037`, background: 'rgba(255,255,255,0.6)',
  fontFamily: 'monospace', outline: 'none', fontWeight: 'bold'
};

export default App;