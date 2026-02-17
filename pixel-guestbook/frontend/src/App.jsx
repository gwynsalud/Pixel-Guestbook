import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

const THEME = {
  board: '#2c1e1a',
  cardBg: '#f4d29c',
  cardBorder: '#5d4037',
  text: '#3e2723',
  // Mana Colors for Categories
  freedom: '#3a7bd5', 
  quest: '#ffb300',
  bounty: '#d32f2f'
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [postForm, setPostForm] = useState({ name: '', message: '', category: 'freedom' });
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState({ msg: '', type: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    // We send the category to the backend. 
    // Note: Ensure your backend DB schema supports a 'category' string column!
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '', category: 'freedom' });
    load();
  };

  // Filter logic
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.category === filter);

  const cardContainer = {
    backgroundColor: THEME.cardBg,
    border: `6px solid ${THEME.cardBorder}`,
    boxShadow: '0 8px 0px #1b1311',
    padding: '15px',
    color: THEME.text,
    position: 'relative',
    minHeight: '220px',
  };

  const categoryTab = (cat) => ({
    padding: '8px 15px',
    cursor: 'pointer',
    border: `3px solid ${THEME.cardBorder}`,
    background: filter === cat ? THEME[cat] || THEME.cardBg : 'transparent',
    color: filter === cat ? '#fff' : THEME.text,
    fontFamily: 'monospace',
    fontWeight: 'bold'
  });

  return (
    <div style={{ backgroundColor: THEME.board, minHeight: '100vh', width: '100vw', padding: '40px 0', color: '#fff', fontFamily: 'monospace' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: THEME.quest, fontSize: '3rem', margin: 0 }}>PIXEL CARD REALM</h1>
        
        {/* CATEGORY FILTER TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button style={categoryTab('all')} onClick={() => setFilter('all')}>ALL CARDS</button>
          <button style={categoryTab('freedom')} onClick={() => setFilter('freedom')}>FREEDOM</button>
          <button style={categoryTab('quest')} onClick={() => setFilter('quest')}>QUESTS</button>
          <button style={categoryTab('bounty')} onClick={() => setFilter('bounty')}>BOUNTIES</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* CREATE CARD PANEL */}
        {user && (
          <div style={{ ...cardContainer, maxWidth: '600px', margin: '0 auto 50px auto' }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>FORGE NEW CARD</h3>
            <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                placeholder="CARD NAME" 
                style={inputStyles} 
                value={postForm.name} 
                onChange={e => setPostForm({...postForm, name: e.target.value})} 
              />
              <textarea 
                placeholder="CARD DESCRIPTION..." 
                style={{ ...inputStyles, height: '60px' }} 
                value={postForm.message} 
                onChange={e => setPostForm({...postForm, message: e.target.value})} 
              />
              
              {/* CATEGORY SELECTOR */}
              <select 
                style={inputStyles} 
                value={postForm.category} 
                onChange={e => setPostForm({...postForm, category: e.target.value})}
              >
                <option value="freedom">TYPE: FREEDOM (NOTE)</option>
                <option value="quest">TYPE: QUEST (CHALLENGE)</option>
                <option value="bounty">TYPE: BOUNTY (HELP)</option>
              </select>

              <button type="submit" style={{ padding: '10px', background: THEME[postForm.category], color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                PLAY CARD onto BOARD
              </button>
            </form>
          </div>
        )}

        {/* BATTLEFIELD GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {filteredEntries.map(e => (
            <div key={e.id} style={cardContainer}>
              {/* Rarity Seal matches Category Mana Color */}
              <div style={{ 
                position: 'absolute', top: '10px', right: '10px', 
                width: '20px', height: '20px', borderRadius: '50%', 
                background: THEME[e.category] || THEME.quest,
                border: `2px solid ${THEME.cardBorder}`
              }} />
              
              <div style={{ borderBottom: `2px solid ${THEME.cardBorder}`, paddingBottom: '5px' }}>
                <strong style={{ fontSize: '1.2rem' }}>{e.name}</strong>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>CLASS: {e.category?.toUpperCase()}</div>
              </div>
              
              <p style={{ fontStyle: 'italic', margin: '15px 0' }}>"{e.message}"</p>
              
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', textAlign: 'right', fontWeight: 'bold' }}>
                - {e.author_username}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyles = {
  padding: '10px',
  border: `2px solid ${THEME.cardBorder}`,
  background: 'rgba(255,255,255,0.4)',
  fontFamily: 'monospace',
  outline: 'none'
};

export default App;