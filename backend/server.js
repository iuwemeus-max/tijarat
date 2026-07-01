import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const app = express();
const db = new Database(process.env.DB_FILE || './erp.sqlite');
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const CALLCENTER_PASSWORD = process.env.CALLCENTER_PASSWORD || 'Call@12345';
const failed = ['Cancelled','Refused','Returned'];

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

function run(sql){ db.exec(sql); }
run(`CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,trackingNumber TEXT,createdAt TEXT,orderDate TEXT,status TEXT,callStatus TEXT,packageName TEXT,packageDetail TEXT,quantity INTEGER,total REAL,customerName TEXT,phone TEXT,emirate TEXT,address TEXT,notes TEXT,source TEXT,staffName TEXT,courierName TEXT,courierTracking TEXT,dispatchDate TEXT,deliveredDate TEXT,returnReceivedDate TEXT,cancelledReason TEXT,adminNotes TEXT,customerTag TEXT,riskLevel TEXT,timeline TEXT);
CREATE TABLE IF NOT EXISTS inventory(id TEXT PRIMARY KEY,sku TEXT,label TEXT,category TEXT,stock INTEGER,unitCost REAL,sellingPrice REAL,lowStockAlert INTEGER,active INTEGER,updatedAt TEXT);
CREATE TABLE IF NOT EXISTS couriers(id TEXT PRIMARY KEY,name TEXT,phone TEXT,notes TEXT,active INTEGER,createdAt TEXT);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT,role TEXT,active INTEGER,createdAt TEXT);`);

function id(){ return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function tracking(){ return `HLUAE${new Date().toISOString().slice(2,10).replaceAll('-','')}${Math.floor(100000+Math.random()*900000)}`; }
function now(){ return new Date().toISOString(); }
function clean(v){ return String(v || '').trim(); }
function event(action,note,actor='System'){ return { at: now(), action, note, actor }; }
function token(payload){ return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); }
function auth(req,res,next){ const raw = req.headers.authorization || ''; const t = raw.replace('Bearer ',''); try { req.user = jwt.verify(t, JWT_SECRET); next(); } catch { res.status(401).json({ error:'Unauthorized' }); } }
function all(table){ return db.prepare(`SELECT * FROM ${table}`).all(); }
function parseOrder(row){ return { ...row, timeline: row.timeline ? JSON.parse(row.timeline) : [] }; }
function score(phone){ const rows = all('orders'); const same = rows.filter(o => String(o.phone).replace(/\D/g,'').slice(-9) === String(phone).replace(/\D/g,'').slice(-9)); const bad = same.filter(o => failed.includes(o.status)).length; return { customerTag: same.length ? 'Repeat Customer' : 'New Customer', riskLevel: bad >= 2 ? 'Red' : bad ? 'Yellow' : 'Green' }; }
function stats(orders){ return { total: orders.length, today: orders.filter(o=>o.orderDate===new Date().toISOString().slice(0,10)).length, delivered: orders.filter(o=>o.status==='Delivered').length, cancelled: orders.filter(o=>failed.includes(o.status)).length, revenue: orders.filter(o=>!failed.includes(o.status)).reduce((s,o)=>s+Number(o.total||0),0), pendingCod: orders.filter(o=>!['Delivered',...failed].includes(o.status)).reduce((s,o)=>s+Number(o.total||0),0), deliveredCod: orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+Number(o.total||0),0) }; }
function seed(){ if (!db.prepare('SELECT COUNT(*) c FROM inventory').get().c) { db.prepare('INSERT INTO inventory VALUES (?,?,?,?,?,?,?,?,?,?)').run(id(),'bottle250','250ml Bottle','Massage Oil',100,20,79,20,1,now()); db.prepare('INSERT INTO inventory VALUES (?,?,?,?,?,?,?,?,?,?)').run(id(),'bottle100','100ml Bottle','Massage Oil',100,10,35,20,1,now()); } if (!db.prepare('SELECT COUNT(*) c FROM users').get().c) { db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id(),'Owner / Super Admin','admin',1,now()); db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id(),'Call Center Staff','callcenter',1,now()); } }
seed();

app.get('/api/health',(req,res)=>res.json({ok:true}));
app.post('/api/login',(req,res)=>{ const { password, staffName } = req.body || {}; const role = password === ADMIN_PASSWORD ? 'admin' : password === CALLCENTER_PASSWORD ? 'callcenter' : null; if(!role) return res.status(401).json({error:'Invalid password'}); res.json({ token: token({ role, staffName: clean(staffName)||role }), role, staffName: clean(staffName)||role }); });
app.post('/api/orders',(req,res)=>{ const b=req.body||{}; if(clean(b.customerName).length<2 || clean(b.phone).length<7 || clean(b.address).length<5) return res.status(400).json({error:'Name, phone and full address required'}); const s=score(b.phone); const record={ id:id(), trackingNumber:tracking(), createdAt:now(), orderDate:now().slice(0,10), status:'New', callStatus:'Not Called', packageName:clean(b.packageName), packageDetail:clean(b.packageDetail), quantity:Number(b.quantity||1), total:Number(b.total||0), customerName:clean(b.customerName), phone:clean(b.phone), emirate:clean(b.emirate||'Dubai'), address:clean(b.address), notes:clean(b.notes), source:clean(b.source||'Landing Page'), staffName:clean(b.staffName||'Customer'), courierName:'', courierTracking:'', dispatchDate:'', deliveredDate:'', returnReceivedDate:'', cancelledReason:'', adminNotes:'', customerTag:s.customerTag, riskLevel:s.riskLevel, timeline:JSON.stringify([event('Order Placed',`Risk ${s.riskLevel}`,'Customer')])}; db.prepare(`INSERT INTO orders VALUES (@id,@trackingNumber,@createdAt,@orderDate,@status,@callStatus,@packageName,@packageDetail,@quantity,@total,@customerName,@phone,@emirate,@address,@notes,@source,@staffName,@courierName,@courierTracking,@dispatchDate,@deliveredDate,@returnReceivedDate,@cancelledReason,@adminNotes,@customerTag,@riskLevel,@timeline)`).run(record); res.json({ order:{...record,timeline:JSON.parse(record.timeline)} }); });
app.get('/api/erp',auth,(req,res)=>{ const orders=all('orders').map(parseOrder).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))); res.json({ orders, stats:stats(orders), inventory:all('inventory'), couriers:all('couriers').filter(c=>c.active), users:all('users').filter(u=>u.active) }); });
app.put('/api/orders/:id',auth,(req,res)=>{ const current=db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id); if(!current) return res.status(404).json({error:'Order not found'}); const patch=req.body||{}; const next={...current,...patch}; if(patch.status==='Dispatched'&&!current.dispatchDate) next.dispatchDate=now(); if(patch.status==='Delivered'&&!current.deliveredDate) next.deliveredDate=now(); const tl=current.timeline?JSON.parse(current.timeline):[]; tl.push(event('Updated',JSON.stringify(patch),req.user.staffName)); next.timeline=JSON.stringify(tl); db.prepare(`UPDATE orders SET status=@status,callStatus=@callStatus,courierName=@courierName,courierTracking=@courierTracking,dispatchDate=@dispatchDate,deliveredDate=@deliveredDate,returnReceivedDate=@returnReceivedDate,cancelledReason=@cancelledReason,adminNotes=@adminNotes,timeline=@timeline WHERE id=@id`).run(next); res.json({ order: parseOrder(next) }); });
app.post('/api/orders/bulk',auth,(req,res)=>{ const {ids=[],patch={}}=req.body||{}; ids.forEach(orderId=>{ const current=db.prepare('SELECT * FROM orders WHERE id=?').get(orderId); if(current){ const tl=current.timeline?JSON.parse(current.timeline):[]; tl.push(event('Bulk Updated',JSON.stringify(patch),req.user.staffName)); db.prepare('UPDATE orders SET status=COALESCE(?,status), courierName=COALESCE(?,courierName), timeline=? WHERE id=?').run(patch.status||null,patch.courierName||null,JSON.stringify(tl),orderId); }}); res.json({updated:ids.length}); });
app.post('/api/couriers',auth,(req,res)=>{ const c={id:id(),name:clean(req.body.name),phone:clean(req.body.phone),notes:clean(req.body.notes),active:1,createdAt:now()}; db.prepare('INSERT INTO couriers VALUES (@id,@name,@phone,@notes,@active,@createdAt)').run(c); res.json(c); });
app.post('/api/inventory',auth,(req,res)=>{ const i={id:id(),sku:clean(req.body.sku||`SKU-${Date.now()}`),label:clean(req.body.label),category:clean(req.body.category||'General'),stock:Number(req.body.stock||0),unitCost:Number(req.body.unitCost||0),sellingPrice:Number(req.body.sellingPrice||0),lowStockAlert:Number(req.body.lowStockAlert||5),active:1,updatedAt:now()}; db.prepare('INSERT INTO inventory VALUES (@id,@sku,@label,@category,@stock,@unitCost,@sellingPrice,@lowStockAlert,@active,@updatedAt)').run(i); res.json(i); });
app.post('/api/users',auth,(req,res)=>{ const u={id:id(),name:clean(req.body.name),role:clean(req.body.role||'staff'),active:1,createdAt:now()}; db.prepare('INSERT INTO users VALUES (@id,@name,@role,@active,@createdAt)').run(u); res.json(u); });

app.listen(PORT,()=>console.log(`ERP backend running on ${PORT}`));
