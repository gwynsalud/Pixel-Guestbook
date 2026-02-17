import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. DYNAMIC API URL: Uses Vercel's variable in production, localhost in development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', secret_pin: '' });

  // GET - Fetch entries
  const load = () => axios.get(API).then(res => setEntries(res.data)).catch(err => console.error("Error loading:", err));
  
  useEffect(() => { load(); }, []);

  // POST - Create entry
  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form);
      setForm({ name: '', message: '', secret_pin: '' });
      load();
    } catch (err) { alert("Error posting message."); }
  };

  // PUT - Edit entry
  const editMessage = async (id) => {
    const newMsg = prompt("Enter your new message:");
    if (!newMsg) return;
    const pin = prompt("Enter your PIN to confirm update:");
    
    try {
      // Sends the PIN as a query param and the new message in the body
      await axios.put(`${API}/${id}?pin=${pin}`, { message: newMsg });
      load();
    } catch (err) {
      alert("Unauthorized: Wrong PIN!");
    }
  };

  // DELETE - Remove entry
  const remove = async (id) => {
    const pin = prompt("Enter PIN to delete:");
    if (!pin) return;
    try {
      await axios.delete(`${API}/${id}?pin=${pin}`);
      load();
    } catch (err) { alert("Unauthorized: Wrong PIN!"); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🕹️ Pixel Guestbook</h1>
      
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
        <input placeholder="Set 4-Digit PIN" type="password" value={form.secret_pin} onChange={e => setForm({...form, secret_pin: e.target.value})} required />
        <button type="submit" style={{ cursor: 'pointer', padding: '10px', background: '#333', color: '#fff' }}>Post to Wall</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <div className="wall">
        {entries.length === 0 ? <p>No messages yet. Be the first!</p> : entries.map(e => (
          <div key={e.id} style={{ border: '2px solid #333', margin: '10px 0', padding: '15px', position: 'relative' }}>
            <strong>{e.name}</strong> 
            <p style={{ margin: '10px 0' }}>{e.message}</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => editMessage(e.id)} style={{ fontSize: '12px', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => remove(e.id)} style={{ fontSize: '12px', cursor: 'pointer', color: 'red' }}>Delete</button>
            </div>
            
            <small style={{ display: 'block', marginTop: '10px', color: '#888', fontSize: '10px' }}>
              {new Date(e.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;