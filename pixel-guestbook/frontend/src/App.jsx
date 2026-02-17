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
  oracle: '#9c27b0' // Changed Bounty Red to Oracle Purple
};

function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('pixel_user')));
  const [postForm, setPostForm] = useState({ name: '', message: '', category: 'freedom' });
  const [filter, setFilter] = useState('all');
  const [revealedIds, setRevealedIds] = useState([]); // Track flipped oracle cards

  const load = () => axios.get(API).then(res => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...postForm, author_username: user.username });
    setPostForm({ name: '', message: '', category: 'freedom' });
    load();
  };

  const toggleFlip = (id) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => (e.category === filter || (filter === 'oracle' && e.category === 'bounty')));

  const categoryTab = (cat) => ({
    padding: '8px 15px',
    cursor: 'pointer',
    border: `3px solid ${THEME.cardBorder}`,
    background: filter === cat ? (THEME[cat] || THEME.cardBg) : 'transparent',
    color: filter === cat ? '#fff' : THEME.text,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  });

  return (
    <div style={{ backgroundColor: THEME.board, minHeight: '100vh', width: '100vw', padding: '40px 0', color: '#fff', fontFamily: 'monospace' }}>
      
      {/* CSS Animations for the Oracle Flip and Hover */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .pixel-card { animation: float 4s ease-in-out infinite; }
        .pixel-card:hover { animation-play-state: paused; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: THEME.quest, fontSize: '3rem', margin: 0, textShadow: '4px 4px #000' }}>PIXEL CARD REALM</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button style={categoryTab('all')} onClick={() => setFilter('all')}>All Cards</button>
          <button style={categoryTab('freedom')} onClick={() => setFilter('freedom')}>Freedom</button>
          <button style={categoryTab('quest')} onClick={() => setFilter('quest')}>Quests</button>
          <button style={categoryTab('oracle')} onClick={() => setFilter('oracle')}>🔮 Oracle</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {user && (
          <div style={{ backgroundColor: THEME.cardBg, border: `6px solid ${THEME.cardBorder}`, boxShadow: '0 8px 0px #1b1311', padding: '20px', color: THEME.text, maxWidth: '600px', margin: '0 auto 50px auto' }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>FORGE NEW CARD</h3>
            <form onSubmit={submitPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="CARD NAME" style={inputStyles} value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} />
              <textarea placeholder="MESSAGE OR FORTUNE..." style={{ ...inputStyles, height: '60px' }} value={postForm.message} onChange={e => setPostForm({...postForm, message: e.target.value})} />
              <select style={inputStyles} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                <option value="freedom">TYPE: FREEDOM (NOTE)</option>
                <option value="quest">TYPE: QUEST (CHALLENGE)</option>
                <option value="bounty">TYPE: ORACLE (MYSTERY)</option>
              </select>
              <button type="submit" style={{ padding: '12px', background: THEME[postForm.category === 'bounty' ? 'oracle' : postForm.category], color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                PLAY CARD
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredEntries.map(e => {
            const isOracle = e.category === 'bounty' || e.category === 'oracle';
            const isRevealed = revealedIds.includes(e.id);
            const cardColor = THEME[e.category === 'bounty' ? 'oracle' : e.category] || THEME.quest;

            return (
              <div 
                key={e.id} 
                className="pixel-card"
                onClick={() => isOracle && toggleFlip(e.id)}
                style={{ 
                  backgroundColor: (isOracle && !isRevealed) ? '#3d2b24' : THEME.cardBg,
                  border: `6px solid ${isOracle && !isRevealed ? THEME.oracle : THEME.cardBorder}`,
                  boxShadow: '0 8px 0px #1b1311',
                  padding: '15px',
                  color: (isOracle && !isRevealed) ? '#fff' : THEME.text,
                  position: 'relative',
                  minHeight: '220px',
                  cursor: isOracle ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {isOracle && !isRevealed ? (
                  /* CARD BACK (ORACLE) */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔮</div>
                    <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: THEME.oracle }}>CLICK TO REVEAL<br/>YOUR FATE</div>
                  </div>
                ) : (
                  /* CARD FRONT */
                  <>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: cardColor, border: `2px solid ${THEME.cardBorder}` }} />
                    <div style={{ borderBottom: `2px solid ${THEME.cardBorder}`, paddingBottom: '5px' }}>
                      <strong style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>{e.name}</strong>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>CLASS: {isOracle ? 'ORACLE' : e.category?.toUpperCase()}</div>
                    </div>
                    <p style={{ fontStyle: 'italic', margin: '15px 0', fontSize: '1rem', lineHeight: '1.4' }}>"{e.message}"</p>
                    <div style={{ marginTop: 'auto', fontSize: '0.8rem', textAlign: 'right', fontWeight: 'bold', color: isOracle ? THEME.oracle : 'inherit' }}>
                      {isOracle ? '— THE VOID —' : `- ${e.author_username}`}
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
  padding: '10px',
  border: `2px solid #5d4037`,
  background: 'rgba(255,255,255,0.6)',
  fontFamily: 'monospace',
  outline: 'none',
  fontWeight: 'bold'
};

export default App;