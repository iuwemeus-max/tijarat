import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, CheckCircle2, ClipboardList, Download, LockKeyhole, Printer, RefreshCw, ShoppingBag, Truck, Users, Wallet } from 'lucide-react';
import * as XLSX from 'xlsx';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const offers = [
  { id: 'single', name: '1 Bottle', detail: '250ml Happy Life Massage Oil', price: 79, tag: 'Starter Offer' },
  { id: 'combo', name: 'Combo Pack', detail: '250ml + 100ml Happy Life Massage Oil', price: 99, tag: 'Most Popular' },
  { id: 'two', name: '2 Bottle Deal', detail: '2 x 250ml Happy Life Massage Oil', price: 120, tag: 'Best Value' }
];
const emirates = ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain','Al Ain'];
const statuses = ['New','Confirmed','Dispatched','With Courier','Delivered','Cancelled','Refused','Returned'];
const tabs = ['Dashboard','Orders','AWB Center','Dispatch','Couriers','Inventory','Customers','Finance','Reports','Users'];

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function excel(name, rows) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ message: 'No data' }]), 'Report');
  XLSX.writeFile(wb, name);
}
function Landing() {
  const [offerId, setOfferId] = useState('combo');
  const [form, setForm] = useState({ customerName: '', phone: '', emirate: 'Dubai', address: '', notes: '', quantity: 1 });
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const offer = offers.find(o => o.id === offerId) || offers[1];
  const total = offer.price * Number(form.quantity || 1);
  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const order = await request('/api/orders', { method: 'POST', body: JSON.stringify({ ...form, packageName: offer.name, packageDetail: offer.detail, total }) });
      setDone(order.order);
    } catch (err) { setError(err.message); }
  }
  if (done) return <main className="center"><section className="card success"><CheckCircle2 size={72}/><h1>Order Confirmed</h1><p>Your tracking number is:</p><h2>{done.trackingNumber}</h2><button onClick={() => setDone(null)}>Place another order</button></section></main>;
  return <main className="landing"><section className="hero"><p className="tag">Free Delivery All Over UAE • Cash on Delivery</p><h1>Happy Life Massage Oil</h1><p>Premium massage oil order system with full ERP backend.</p></section><section className="offers">{offers.map(o => <button key={o.id} onClick={() => setOfferId(o.id)} className={offerId === o.id ? 'offer active' : 'offer'}><b>{o.tag}</b><h2>{o.name}</h2><p>{o.detail}</p><strong>AED {o.price}</strong></button>)}</section><form onSubmit={submit} className="card form"><h2>Selected: {offer.detail} — AED {total}</h2><input placeholder="Full name" value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})}/><input placeholder="Mobile number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><select value={form.emirate} onChange={e=>setForm({...form,emirate:e.target.value})}>{emirates.map(e=><option key={e}>{e}</option>)}</select><input type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:Number(e.target.value)})}/><textarea placeholder="Full delivery address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><input placeholder="Notes / landmark" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>{error && <p className="error">{error}</p>}<button className="gold"><ShoppingBag/> Place My Order</button></form></main>;
}
function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');
  const [staffName, setStaffName] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('Dashboard');
  const [data, setData] = useState({ orders: [], inventory: [], couriers: [], users: [] });
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [newCourier, setNewCourier] = useState('');
  const [newStock, setNewStock] = useState({ label: '', sku: '', stock: 0, unitCost: 0, sellingPrice: 0 });
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const load = async () => { if (!token) return; setData(await request('/api/erp', { headers })); };
  useEffect(() => { load(); }, [token]);
  const stats = useMemo(() => ({ total: data.orders.length, today: data.orders.filter(o => o.orderDate === new Date().toISOString().slice(0,10)).length, delivered: data.orders.filter(o=>o.status==='Delivered').length, failed: data.orders.filter(o=>['Cancelled','Refused','Returned'].includes(o.status)).length, cod: data.orders.filter(o=>!['Cancelled','Refused','Returned'].includes(o.status)).reduce((s,o)=>s+Number(o.total||0),0) }), [data.orders]);
  const orders = data.orders.filter(o => `${o.trackingNumber} ${o.customerName} ${o.phone} ${o.address} ${o.status}`.toLowerCase().includes(query.toLowerCase()));
  async function login(e) { e.preventDefault(); const r = await request('/api/login', { method:'POST', body: JSON.stringify({ staffName, password }) }); sessionStorage.setItem('token', r.token); setToken(r.token); }
  async function updateOrder(id, patch) { await request(`/api/orders/${id}`, { method:'PUT', headers, body: JSON.stringify(patch) }); await load(); }
  async function bulk(status) { await request('/api/orders/bulk', { method:'POST', headers, body: JSON.stringify({ ids: selected, patch: { status } }) }); setNotice(`${selected.length} orders updated`); setSelected([]); await load(); }
  async function addCourier() { await request('/api/couriers', { method:'POST', headers, body: JSON.stringify({ name: newCourier }) }); setNewCourier(''); await load(); }
  async function addStock() { await request('/api/inventory', { method:'POST', headers, body: JSON.stringify(newStock) }); setNewStock({ label:'', sku:'', stock:0, unitCost:0, sellingPrice:0 }); await load(); }
  function printAwb() { const printable = orders.filter(o => !['Cancelled','Refused','Returned'].includes(o.status)); const html = printable.map(o => `<div style="width:4in;height:6in;padding:.2in;border:2px solid #111;page-break-after:always;font-family:Arial"><h2>HAPPY LIFE MASSAGE OIL</h2><h1>${o.trackingNumber}</h1><p><b>${o.customerName}</b><br>${o.phone}<br>${o.address}, ${o.emirate}</p><h1>AED ${o.total}</h1><p>Courier: ${o.courierName || 'Unassigned'}</p><div style="font-size:40px;letter-spacing:4px">||||||||||||||||</div></div>`).join(''); const w = window.open(''); w.document.write(html); w.print(); }
  if (!token) return <main className="center"><form onSubmit={login} className="card login"><LockKeyhole/><h1>Private Operations Login</h1><input placeholder="Staff name" value={staffName} onChange={e=>setStaffName(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button>Login</button></form></main>;
  return <main className="erp"><aside><h1>HL ERP</h1>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'on':''}>{t}</button>)}<button onClick={()=>{sessionStorage.clear();setToken('')}}>Logout</button></aside><section><header><h1>{tab}</h1><button onClick={load}><RefreshCw/> Refresh</button></header>{notice && <p className="notice">{notice}</p>}{tab==='Dashboard' && <div className="grid"><K label="Today" value={stats.today} icon={<ClipboardList/>}/><K label="Orders" value={stats.total} icon={<BarChart3/>}/><K label="Delivered" value={stats.delivered} icon={<CheckCircle2/>}/><K label="Failed" value={stats.failed} icon={<Users/>}/><K label="Expected COD" value={`AED ${stats.cod}`} icon={<Wallet/>}/><K label="Stock Items" value={data.inventory.length} icon={<Boxes/>}/></div>}{tab==='Orders' && <Panel><input placeholder="Search orders" value={query} onChange={e=>setQuery(e.target.value)}/><button onClick={()=>excel('orders.xlsx', orders)}>Export Excel</button><table><thead><tr><th></th><th>Tracking</th><th>Customer</th><th>Phone</th><th>COD</th><th>Status</th><th>Courier</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><input type="checkbox" checked={selected.includes(o.id)} onChange={()=>setSelected(s=>s.includes(o.id)?s.filter(x=>x!==o.id):[...s,o.id])}/></td><td>{o.trackingNumber}</td><td>{o.customerName}</td><td>{o.phone}</td><td>AED {o.total}</td><td><select value={o.status} onChange={e=>updateOrder(o.id,{status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td><input value={o.courierName||''} onChange={e=>updateOrder(o.id,{courierName:e.target.value})}/></td></tr>)}</tbody></table></Panel>}{tab==='AWB Center' && <Panel><button onClick={printAwb}><Printer/> Print 4x6 AWBs</button><p>Cancelled, Refused and Returned orders are blocked from AWB printing.</p></Panel>}{tab==='Dispatch' && <Panel><button onClick={()=>bulk('Dispatched')}><Truck/> Mark selected dispatched</button><button onClick={()=>bulk('With Courier')}>Mark with courier</button></Panel>}{tab==='Couriers' && <Panel><input placeholder="Courier name" value={newCourier} onChange={e=>setNewCourier(e.target.value)}/><button onClick={addCourier}>Add Courier</button>{data.couriers.map(c=><p key={c.id}>{c.name}</p>)}</Panel>}{tab==='Inventory' && <Panel><input placeholder="Item" value={newStock.label} onChange={e=>setNewStock({...newStock,label:e.target.value})}/><input placeholder="SKU" value={newStock.sku} onChange={e=>setNewStock({...newStock,sku:e.target.value})}/><input type="number" placeholder="Stock" value={newStock.stock} onChange={e=>setNewStock({...newStock,stock:Number(e.target.value)})}/><button onClick={addStock}>Add Stock</button>{data.inventory.map(i=><p key={i.id}>{i.label} — {i.stock} pcs</p>)}</Panel>}{tab==='Customers' && <Panel>{[...new Map(data.orders.map(o=>[o.phone,o])).values()].map(c=><p key={c.phone}>{c.customerName} — {c.phone}</p>)}</Panel>}{tab==='Finance' && <Panel><h2>Expected COD: AED {stats.cod}</h2><h2>Delivered COD: AED {data.orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+Number(o.total||0),0)}</h2></Panel>}{tab==='Reports' && <Panel><button onClick={()=>excel('erp-report.xlsx', data.orders)}>Download Full Report</button></Panel>}{tab==='Users' && <Panel>{data.users.map(u=><p key={u.id}>{u.name} — {u.role}</p>)}</Panel>}</section></main>;
}
function K({label,value,icon}){return <div className="kpi">{icon}<span>{label}</span><b>{value}</b></div>}
function Panel({children}){return <div className="panel">{children}</div>}
export default function App(){return location.hash === '#admin' ? <Admin/> : <Landing/>}
