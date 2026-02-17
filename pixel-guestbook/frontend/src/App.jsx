import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3000/guestbook';

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', secret_pin: '' });

  const load = () => axios.get(API).then(res => setEntries(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(API, form);
    setForm({ name: '', message: '', secret_pin: '' });
    load();
  };

  const remove = async (id) => {
    const pin = prompt("Enter PIN to delete:");
    try {
      await axios.delete(`${API}/${id}?pin=${pin}`);
      load();
    } catch (err) { alert("Wrong PIN!"); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Pixel Guestbook</h1>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><br/>
        <textarea placeholder="Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required /><br/>
        <input placeholder="PIN" type="password" value={form.secret_pin} onChange={e => setForm({...form, secret_pin: e.target.value})} required /><br/>
        <button type="submit">Post</button>
      </form>
      <hr />
      {entries.map(e => (
        <div key={e.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
          <strong>{e.name}</strong> says: {e.message}
          <button onClick={() => remove(e.id)} style={{ marginLeft: '10px' }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
export default App;