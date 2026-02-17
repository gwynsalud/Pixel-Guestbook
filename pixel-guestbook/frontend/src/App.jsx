import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. DYNAMIC API URL: Uses Vercel's variable in production, localhost in development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${API_BASE}/guestbook`;

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', secret_pin: '' });
  
  // New states for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const load = () => axios.get(API).then(res => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(API, form);
    setForm({ name: '', message: '', secret_pin: '' });
    load();
  };

  // The actual Update (PUT) logic
  const handleUpdate = async (id) => {
    const pin = prompt("Confirm your 4-digit PIN to save changes:");
    if (!pin) return;

    try {
      await axios.put(`${API}/${id}?pin=${pin}`, { message: editValue });
      setEditingId(null); // Close the edit mode
      load();
    } catch (err) {
      alert("Unauthorized: Wrong PIN!");
    }
  };

  const remove = async (id) => {
    const pin = prompt("Enter PIN to delete:");
    if (!pin) return;
    try {
      await axios.delete(`${API}/${id}?pin=${pin}`);
      load();
    } catch (err) { alert("Wrong PIN!"); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🕹️ Pixel Guestbook</h1>
      
      {/* Form remains the same */}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
        <input placeholder="Set 4-Digit PIN" type="password" value={form.secret_pin} onChange={e => setForm({...form, secret_pin: e.target.value})} required />
        <button type="submit" style={{ cursor: 'pointer', padding: '10px', background: '#333', color: '#fff' }}>Post to Wall</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <div className="wall">
        {entries.map(e => (
          <div key={e.id} style={{ border: '2px solid #333', margin: '10px 0', padding: '15px' }}>
            <strong>{e.name}</strong> 
            
            {/* INLINE EDIT LOGIC: Show textarea if editing, otherwise show text */}
            {editingId === e.id ? (
              <div style={{ marginTop: '10px' }}>
                <textarea 
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                />
                <button onClick={() => handleUpdate(e.id)}>Save ✅</button>
                <button onClick={() => setEditingId(null)}>Cancel ❌</button>
              </div>
            ) : (
              <>
                <p style={{ margin: '10px 0' }}>{e.message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => {
                    setEditingId(e.id);
                    setEditValue(e.message);
                  }} style={{ fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => remove(e.id)} style={{ fontSize: '12px', cursor: 'pointer', color: 'red' }}>Delete</button>
                </div>
              </>
            )}
            
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