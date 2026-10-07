import { useEffect, useState } from 'react';
import { api } from './api.js';
const emptyForm = { name: '', price: '', stock: '0' };
const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export default function App() {
  // เก็บรายการสินค้า ฟอร์ม หน้าที่เลือก และสถานะระหว่างเรียก API
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function load(targetPage = page) {
    setLoading(true);
    try {
      const result = await api(`/products?page=${targetPage}`);
      // เมื่อรายการสุดท้ายของหน้าถูกลบ ให้กลับไปหน้าก่อนหน้า
      if (!result.data.length && targetPage > 1) { setPage(targetPage - 1); return; }
      setItems(result.data); setTotal(result.total);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    // ยกเลิกการรับผล request เก่าเมื่อเปลี่ยนหน้า หรือ component ถูกถอดออก
    let active = true;
    setLoading(true); setError('');
    api(`/products?page=${page}`).then(result => {
      if (active) { setItems(result.data); setTotal(result.total); }
    }).catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);
  function reset() { setEditingId(null); setForm(emptyForm); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      // ราคาเก็บเป็น string ระหว่างส่ง เพื่อรักษาทศนิยมที่ผู้ใช้กรอก
      const result = await api(editingId ? `/products/${editingId}` : '/products', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ name: form.name.trim(), price: form.price, stock: form.stock }),
      });
      setNotice(result.message); reset();
      if (page !== 1) setPage(1); else await load(1);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function remove(item) {
    // ยืนยันก่อนลบ และปิดปุ่มระหว่างทำงานเพื่อป้องกันการส่งซ้ำ
    if (!window.confirm(`ต้องการลบสินค้า "${item.name}" ใช่ไหม?`)) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api(`/products/${item.id}`, { method: 'DELETE' });
      if (editingId === item.id) reset();
      setNotice(result.message); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  function edit(item) {
    setEditingId(item.id); setForm({ name: item.name, price: String(item.price), stock: String(item.stock) });
    setError(''); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const busy = saving || loading;
  return <main>
    <header><span className="badge">React · CodeIgniter · PostgreSQL</span><h1>ระบบจัดการสินค้า</h1><p>เพิ่ม แก้ไข และลบสินค้าผ่าน REST API</p></header>
    {error && <div className="error" role="alert">{error}</div>}
    {notice && <div className="success" role="status">{notice}</div>}
    <section><h2>{editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
      <form onSubmit={save}><fieldset disabled={busy}>
        <label>ชื่อสินค้า<input required maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="เช่น กาแฟอาราบิก้า" /></label>
        <label>ราคา (บาท)<input required type="number" min="0" max="9999999999.99" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
        <label>จำนวนคงเหลือ<input required type="number" min="0" max="2147483647" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></label>
        <div className="actions"><button type="submit">{saving ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : '+ เพิ่มสินค้า'}</button>{editingId && <button type="button" className="secondary" onClick={reset}>ยกเลิก</button>}</div>
      </fieldset></form>
    </section>
    <section><div className="title"><h2>รายการสินค้า</h2><span>{total} รายการ</span><button className="secondary" disabled={busy} onClick={() => { setError(''); load(); }}>รีเฟรช</button></div>
      {loading ? <p role="status">กำลังโหลด...</p> : <div className="table-wrap"><table><thead><tr><th>ชื่อสินค้า</th><th>ราคา (บาท)</th><th>คงเหลือ</th><th>จัดการ</th></tr></thead><tbody>
        {!items.length && <tr><td colSpan="4" className="empty">ยังไม่มีสินค้า เพิ่มรายการแรกได้เลย</td></tr>}
        {items.map(item => <tr key={item.id}><td>{item.name}</td><td>{money.format(Number(item.price))}</td><td>{item.stock}</td><td><div className="actions"><button className="secondary" disabled={busy} onClick={() => edit(item)}>แก้ไข</button><button className="danger" disabled={busy} onClick={() => remove(item)}>ลบ</button></div></td></tr>)}
      </tbody></table></div>}
      <div className="pagination"><button className="secondary" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>ก่อนหน้า</button><span>หน้า {page} / {Math.max(1, Math.ceil(total / 10))}</span><button className="secondary" disabled={page * 10 >= total || busy} onClick={() => setPage(page + 1)}>ถัดไป</button></div>
    </section>
  </main>;
}
