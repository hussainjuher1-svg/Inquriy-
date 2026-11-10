import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { generateAssistantReply } from './assistant.mjs';

const app = express();
app.disable('x-powered-by');
app.use('/api/daybook',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
app.use(express.json({limit:'64kb'}));
const dbPath = resolve(process.env.DAYBOOK_DB || 'daybook/data/daybook.sqlite');
mkdirSync(dirname(dbPath), {recursive:true});
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
for (const migration of ['001_initial.sql','002_communications.sql','003_business_knowledge.sql']) db.exec(readFileSync(`daybook/migrations/${migration}`,'utf8'));
const sha = x => createHash('sha256').update(x).digest('hex');
const hashPassword = password => { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex'); };
const checkPassword = (password,stored) => { const [salt,hash]=stored.split(':'); const b=scryptSync(password,salt,64); return timingSafeEqual(b,Buffer.from(hash,'hex')); };
const cookie = (req) => (req.headers.cookie || '').split(';').map(v=>v.trim()).find(v=>v.startsWith('daybook_session='))?.slice(16);
function setSession(res,user,business) {
 const token=randomBytes(32).toString('hex'), csrf=randomBytes(24).toString('hex');
 db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?)').run(sha(token),user,business,csrf,Date.now()+1000*60*60*24*7);
 res.setHeader('Set-Cookie',`daybook_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);
 return csrf;
}
function auth(req,res,next) {
 const token=cookie(req); if(!token) return res.status(401).json({error:'Please sign in.'});
 const s=db.prepare(`SELECT s.*,u.name,u.email,m.role FROM sessions s JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=s.user_id AND m.business_id=s.business_id WHERE s.token_hash=? AND s.expires_at>?`).get(sha(token),Date.now());
 if(!s) return res.status(401).json({error:'Session expired. Please sign in.'});
 if(!['GET','HEAD'].includes(req.method) && req.get('x-csrf-token')!==s.csrf) return res.status(403).json({error:'Invalid request token. Refresh and try again.'});
 req.user=s; next();
}
const emailOK = s => typeof s==='string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length<=254;
// Simple per-process throttle protects the local pilot against casual brute force; deploy behind a shared rate limiter.
const attempts = new Map();
function throttle(req,res,next) { const key=req.ip, now=Date.now(), a=(attempts.get(key)||[]).filter(t=>now-t<900000); if(a.length>=20) return res.status(429).json({error:'Too many attempts. Try again later.'}); a.push(now); attempts.set(key,a); next(); }
app.post('/api/daybook/register',throttle,(req,res)=>{
 const {name,email,password,business}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>120||!emailOK(email)||typeof password!=='string'||password.length<10||password.length>256||typeof business!=='string'||!business.trim()||business.length>120) return res.status(400).json({error:'Enter your name, business name, a valid email and a password of at least 10 characters.'});
 try { db.exec('BEGIN'); const u=db.prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)').run(name.trim(),email.trim().toLowerCase(),hashPassword(password)); const b=db.prepare('INSERT INTO businesses(name) VALUES (?)').run(business.trim()); db.prepare('INSERT INTO memberships VALUES (?,?,?)').run(b.lastInsertRowid,u.lastInsertRowid,'owner'); const csrf=setSession(res,u.lastInsertRowid,b.lastInsertRowid); db.exec('COMMIT'); res.json({csrf}); } catch(e) { try{db.exec('ROLLBACK')}catch{}; if(String(e).includes('UNIQUE')) return res.status(409).json({error:'An account with that email already exists.'}); console.error(e); res.status(500).json({error:'Could not create account.'}); }
});
app.post('/api/daybook/login',throttle,(req,res)=>{ const {email,password}=req.body||{}; if(!emailOK(email)||typeof password!=='string'||password.length>256) return res.status(400).json({error:'Enter your email and password.'}); const u=db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase()); if(!u||!checkPassword(password,u.password_hash)) return res.status(401).json({error:'Incorrect email or password.'}); const m=db.prepare('SELECT * FROM memberships WHERE user_id=? LIMIT 1').get(u.id); if(!m) return res.status(403).json({error:'No business membership found.'}); res.json({csrf:setSession(res,u.id,m.business_id)}); });
app.get('/api/daybook/me',auth,(req,res)=>res.json({user:{name:req.user.name,email:req.user.email,role:req.user.role},business:db.prepare('SELECT * FROM businesses WHERE id=?').get(req.user.business_id),csrf:req.user.csrf}));
app.post('/api/daybook/logout',auth,(req,res)=>{db.prepare('DELETE FROM sessions WHERE token_hash=?').run(req.user.token_hash);res.setHeader('Set-Cookie','daybook_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');res.json({ok:true});});
const configs={
 customers:{fields:['name','phone','email','address','notes'],required:['name']},
 inquiries:{fields:['title','customer_id','source','status','description','follow_up_date','assigned_to','notes'],required:['title'],statuses:['New','Needs Response','In Progress','Estimate Requested','Converted','Not Proceeding','Archived']},
 estimates:{fields:['title','customer_id','inquiry_id','amount','description','status','issue_date','valid_until','follow_up_date','notes'],required:['title'],statuses:['Draft','Sent','Awaiting Response','Follow-up Needed','Accepted','Declined','Expired']},
 appointments:{fields:['title','customer_id','date','time','duration','location','status','assigned_to','notes'],required:['title','date'],statuses:['Scheduled','Confirmation Needed','Confirmed','Completed','Cancelled','Rescheduled']},
 jobs:{fields:['title','customer_id','inquiry_id','estimate_id','description','date','status','assigned_to','notes'],required:['title'],statuses:['Not Started','Scheduled','In Progress','Waiting','Completed','Cancelled']},
 follow_ups:{fields:['title','customer_id','inquiry_id','estimate_id','job_id','date','status','assigned_to','notes'],required:['title','date'],statuses:['Open','Completed']},
};
const table = (req,res,next)=>{req.config=Object.hasOwn(configs,req.params.type)?configs[req.params.type]:null;if(!req.config)return res.status(404).json({error:'Unknown record type.'});next()};
function validate(body,cfg,partial=false) {
 if(!body || typeof body!=='object'||Array.isArray(body)) throw Error('Invalid record.');
 const result={}; for(const k of cfg.fields) if(k in body){let v=body[k]; if(k.endsWith('_id')) { if(v===''||v===null) v=null; else if(!Number.isSafeInteger(Number(v))||Number(v)<1) throw Error('Invalid linked record.'); else v=Number(v); } else if(k==='amount'){if(v===''||v===null)v=null;else {v=Number(v);if(!Number.isFinite(v)||v<0||v>1000000000)throw Error('Enter a valid amount.');}} else {if(typeof v!=='string'||v.length>4000)throw Error('Invalid '+k+'.'); v=v.trim(); if(k==='time' && v && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw Error('Use a valid time.'); if((k==='date'||k.endsWith('_date')||k==='valid_until')&&v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)) throw Error('Use a valid date.');} result[k]=v; }
 for(const k of cfg.required) if((!partial||k in result)&&!result[k]) throw Error(k+' is required.');
 if('status' in result && !cfg.statuses?.includes(result.status)) throw Error('Invalid status.');
 if(result.email && !emailOK(result.email)) throw Error('Enter a valid email.');
 return result;
}
function audit(req,type,id,action,details='') {db.prepare('INSERT INTO activity_logs(business_id,user_id,entity,entity_id,action,details) VALUES (?,?,?,?,?,?)').run(req.user.business_id,req.user.user_id,type,id,action,details);}
app.get('/api/daybook/records/:type',auth,table,(req,res)=>{const rows=db.prepare(`SELECT * FROM ${req.params.type} WHERE business_id=? ORDER BY id DESC`).all(req.user.business_id);res.json(rows)});
app.get('/api/daybook/records/:type/:id/activity',auth,table,(req,res)=>{const id=Number(req.params.id); if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Invalid record ID.'}); if(!db.prepare(`SELECT id FROM ${req.params.type} WHERE id=? AND business_id=?`).get(id,req.user.business_id))return res.status(404).json({error:'Not found.'});res.json(db.prepare('SELECT a.*,u.name AS actor FROM activity_logs a JOIN users u ON u.id=a.user_id WHERE a.business_id=? AND a.entity=? AND a.entity_id=? ORDER BY a.id DESC LIMIT 100').all(req.user.business_id,req.params.type,id));});
// Treat an operational mutation and its audit entry as a single unit.
function transaction(fn) { db.exec('BEGIN IMMEDIATE'); try { const result=fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } }
function duplicates(businessId, customer, excludeId) {
 const normPhone = value => String(value || '').replace(/\D/g,'');
 const normText = value => String(value || '').trim().toLocaleLowerCase();
 return db.prepare('SELECT id,name,email,phone FROM customers WHERE business_id=? AND id<>?').all(businessId,excludeId || 0).filter(other =>
  (normText(customer.name) && normText(customer.name) === normText(other.name)) ||
  (normText(customer.email) && normText(customer.email) === normText(other.email)) ||
  (normPhone(customer.phone) && normPhone(customer.phone) === normPhone(other.phone))
 ).map(({id,name})=>({id,name}));
}
function checkLinks(type,data,businessId) {
 const related={};
 for(const [field,tableName] of Object.entries({customer_id:'customers',inquiry_id:'inquiries',estimate_id:'estimates',job_id:'jobs'})) {
  if (!data[field]) continue;
  const row=db.prepare(`SELECT * FROM ${tableName} WHERE id=? AND business_id=?`).get(data[field],businessId);
  if(!row) throw new Error('A linked record was not found in your business.');
  related[field]=row;
 }
 const customerIds=[data.customer_id,...Object.values(related).map(r=>r.customer_id)].filter(Boolean);
 if(new Set(customerIds).size>1) throw new Error('Linked records must belong to the same customer.');
 if(data.inquiry_id && related.estimate_id?.inquiry_id && data.inquiry_id!==related.estimate_id.inquiry_id) throw new Error('The estimate belongs to a different inquiry.');
 if(data.inquiry_id && related.job_id?.inquiry_id && data.inquiry_id!==related.job_id.inquiry_id) throw new Error('The job belongs to a different inquiry.');
 if(data.estimate_id && related.job_id?.estimate_id && data.estimate_id!==related.job_id.estimate_id) throw new Error('The job belongs to a different estimate.');
}
function checkDependents(type,id,data,businessId) {
 if(!data.customer_id) return;
 const references={inquiries:[['estimates','inquiry_id'],['jobs','inquiry_id'],['follow_ups','inquiry_id']],estimates:[['jobs','estimate_id'],['follow_ups','estimate_id']],jobs:[['follow_ups','job_id']]};
 for(const [child,field] of references[type] || []) {
  if(db.prepare(`SELECT id FROM ${child} WHERE business_id=? AND ${field}=? AND customer_id IS NOT NULL AND customer_id<>? LIMIT 1`).get(businessId,id,data.customer_id)) throw Error('A related record belongs to a different customer. Update the linked record first.');
 }
}
function recordError(res,e) {
 if(e.code==='DUPLICATE') return res.status(409).json({error:'Possible duplicate customer. Review the matching records before saving.',duplicates:e.duplicates});
 if(String(e).includes('FOREIGN KEY')) return res.status(400).json({error:'A linked record was not found in your business.'});
 if(typeof e.code==='string' && e.code.startsWith('ERR_SQLITE')) {console.error('Database operation failed:',e.code);return res.status(500).json({error:'Could not save record.'});}
 return res.status(400).json({error:e.message||'Could not save record.'});
}
function checkDuplicates(req,data,id) {
 const matches=duplicates(req.user.business_id,data,id);
 if(matches.length && req.body.confirm_duplicate!==true) {const error=new Error('Possible duplicate customer.');error.code='DUPLICATE';error.duplicates=matches;throw error;}
}
app.post('/api/daybook/records/:type',auth,table,(req,res)=>{try{const data=validate(req.body,req.config);const keys=Object.keys(data);const result=transaction(()=>{checkLinks(req.params.type,data,req.user.business_id);if(req.params.type==='customers')checkDuplicates(req,data);const inserted=db.prepare(`INSERT INTO ${req.params.type} (business_id,${keys.join(',')}) VALUES (?,${keys.map(()=>'?').join(',')})`).run(req.user.business_id,...keys.map(k=>data[k]));audit(req,req.params.type,inserted.lastInsertRowid,'Created',JSON.stringify(data));return inserted;});res.status(201).json({id:result.lastInsertRowid});}catch(e){recordError(res,e);}});
app.patch('/api/daybook/records/:type/:id',auth,table,(req,res)=>{try{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Invalid record ID.'});const data=validate(req.body,req.config,true);const keys=Object.keys(data);if(!keys.length)throw Error('No changes provided.');const found=transaction(()=>{const old=db.prepare(`SELECT * FROM ${req.params.type} WHERE id=? AND business_id=?`).get(id,req.user.business_id);if(!old)return false;const merged={...old,...data};checkLinks(req.params.type,merged,req.user.business_id);checkDependents(req.params.type,id,merged,req.user.business_id);if(req.params.type==='customers' && keys.some(k=>['name','email','phone'].includes(k) && data[k]!==old[k]))checkDuplicates(req,merged,id);db.prepare(`UPDATE ${req.params.type} SET ${keys.map(k=>k+'=?').join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?`).run(...keys.map(k=>data[k]),id,req.user.business_id);audit(req,req.params.type,id,'Updated',JSON.stringify({before:Object.fromEntries(keys.map(k=>[k,old[k]])),after:data}));return true;});if(!found)return res.status(404).json({error:'Record not found.'});res.json({ok:true});}catch(e){recordError(res,e);}});
app.get('/api/daybook/communications',auth,(req,res)=>{
 const customerId=req.query.customer_id, inquiryId=req.query.inquiry_id;
 if ((!customerId&&!inquiryId)||(customerId&&inquiryId)) return res.status(400).json({error:'Choose one customer or inquiry.'});
 const field=customerId?'customer_id':'inquiry_id', id=Number(customerId||inquiryId);
 if (!Number.isSafeInteger(id)||id<1) return res.status(400).json({error:'Invalid record.'});
 const parent=customerId?'customers':'inquiries';
 if(!db.prepare(`SELECT id FROM ${parent} WHERE id=? AND business_id=?`).get(id,req.user.business_id))return res.status(404).json({error:'Record not found.'});
 res.json(db.prepare(`SELECT c.id,c.customer_id,c.inquiry_id,c.direction,c.channel,c.occurred_at,c.summary,c.created_at,u.name AS author FROM communications c JOIN users u ON u.id=c.user_id WHERE c.business_id=? AND c.${field}=? ORDER BY c.occurred_at DESC,c.id DESC`).all(req.user.business_id,id));
});
app.post('/api/daybook/communications',auth,(req,res)=>{
 try {
  const {customer_id,inquiry_id,direction,channel,occurred_at,summary}=req.body||{};
  const customerId=customer_id==null||customer_id===''?null:Number(customer_id), inquiryId=inquiry_id==null||inquiry_id===''?null:Number(inquiry_id);
  if((!customerId&&!inquiryId)||[customerId,inquiryId].some(id=>id!==null&&(!Number.isSafeInteger(id)||id<1)))throw Error('Choose a valid customer or inquiry.');
  if(!['Incoming','Outgoing','Internal'].includes(direction)||!['Phone','Email','In person','SMS','Other'].includes(channel))throw Error('Choose a valid direction and channel.');
  if(typeof occurred_at!=='string'||!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(occurred_at)||Number.isNaN(Date.parse(occurred_at))||new Date(occurred_at+'Z').toISOString().slice(0,16)!==occurred_at)throw Error('Enter a valid date and time.');
  if(typeof summary!=='string'||!summary.trim()||summary.length>4000)throw Error('Enter a summary of up to 4000 characters.');
  const id=transaction(()=>{
   let linkedCustomer=customerId;
   if(inquiryId){const inquiry=db.prepare('SELECT customer_id FROM inquiries WHERE business_id=? AND id=?').get(req.user.business_id,inquiryId);if(!inquiry)throw Error('Inquiry not found.');if(customerId&&inquiry.customer_id&&customerId!==inquiry.customer_id)throw Error('The inquiry belongs to a different customer.');linkedCustomer ||= inquiry.customer_id;}
   if(linkedCustomer&&!db.prepare('SELECT id FROM customers WHERE business_id=? AND id=?').get(req.user.business_id,linkedCustomer))throw Error('Customer not found.');
   const result=db.prepare('INSERT INTO communications(business_id,customer_id,inquiry_id,user_id,direction,channel,occurred_at,summary) VALUES (?,?,?,?,?,?,?,?)').run(req.user.business_id,linkedCustomer,inquiryId,req.user.user_id,direction,channel,occurred_at,summary.trim());
   if(inquiryId)audit(req,'inquiries',inquiryId,'Communication recorded',`Communication #${result.lastInsertRowid}`);
   if(linkedCustomer)audit(req,'customers',linkedCustomer,'Communication recorded',`Communication #${result.lastInsertRowid}`);
   return result.lastInsertRowid;
  });res.status(201).json({id});
 }catch(e){recordError(res,e)}
});
app.post('/api/daybook/inquiries/:id/convert',auth,(req,res)=>{try{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Invalid record ID.'});const inquiry=db.prepare('SELECT * FROM inquiries WHERE id=? AND business_id=?').get(id,req.user.business_id);if(!inquiry)return res.status(404).json({error:'Inquiry not found.'});if(inquiry.status==='Converted')return res.status(409).json({error:'This inquiry is already converted.'});if(!inquiry.customer_id)return res.status(400).json({error:'Link a customer to the inquiry before converting it.'});db.exec('BEGIN');const job=db.prepare("INSERT INTO jobs(business_id,customer_id,inquiry_id,title,description) VALUES (?,?,?,?,?)").run(req.user.business_id,inquiry.customer_id,inquiry.id,inquiry.title,inquiry.description);db.prepare("UPDATE inquiries SET status='Converted',updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?").run(inquiry.id,req.user.business_id);audit(req,'inquiries',inquiry.id,'Converted to job',`Job #${job.lastInsertRowid}`);audit(req,'jobs',job.lastInsertRowid,'Created from inquiry',`Inquiry #${inquiry.id}`);db.exec('COMMIT');res.json({id:job.lastInsertRowid});}catch(e){try{db.exec('ROLLBACK')}catch{};console.error(e);res.status(500).json({error:'Could not convert inquiry.'});}});
app.get('/api/daybook/team',auth,(req,res)=>{if(!['owner','admin'].includes(req.user.role))return res.status(403).json({error:'Only owners and administrators can view team accounts.'});res.json(db.prepare('SELECT u.id,u.name,u.email,m.role FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.business_id=? ORDER BY u.name').all(req.user.business_id));});
app.post('/api/daybook/team',auth,(req,res)=>{if(req.user.role!=='owner')return res.status(403).json({error:'Only the owner can create staff accounts.'});const {name,email,password,role}=req.body||{};if(typeof name!=='string'||!name.trim()||name.length>120||!emailOK(email)||typeof password!=='string'||password.length<10||password.length>256||!['admin','staff'].includes(role))return res.status(400).json({error:'Enter a name, valid email, role and password of at least 10 characters.'});try{db.exec('BEGIN');const u=db.prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)').run(name.trim(),email.trim().toLowerCase(),hashPassword(password));db.prepare('INSERT INTO memberships VALUES (?,?,?)').run(req.user.business_id,u.lastInsertRowid,role);audit(req,'business',req.user.business_id,'Staff account created',JSON.stringify({user_id:Number(u.lastInsertRowid),role}));db.exec('COMMIT');res.status(201).json({ok:true});}catch(e){try{db.exec('ROLLBACK')}catch{};if(String(e).includes('UNIQUE'))return res.status(409).json({error:'An account with that email already exists.'});console.error(e);res.status(500).json({error:'Could not create account.'});}});
app.post('/api/daybook/password',auth,(req,res)=>{const {current,password}=req.body||{};if(typeof current!=='string'||current.length>256||typeof password!=='string'||password.length<10||password.length>256)return res.status(400).json({error:'Enter your current password and a new password of at least 10 characters.'});const user=db.prepare('SELECT password_hash FROM users WHERE id=?').get(req.user.user_id);if(!checkPassword(current,user.password_hash))return res.status(400).json({error:'Current password is incorrect.'});transaction(()=>{db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hashPassword(password),req.user.user_id);db.prepare('DELETE FROM sessions WHERE user_id=? AND token_hash<>?').run(req.user.user_id,req.user.token_hash);audit(req,'business',req.user.business_id,'Password changed');});res.json({ok:true});});
app.patch('/api/daybook/settings',auth,(req,res)=>{if(!['owner','admin'].includes(req.user.role))return res.status(403).json({error:'Only owners and administrators can change settings.'});const fields=['name','email','phone','address','hours','services','areas','policies','payment_methods','currency','timezone'];try{const data=validate(req.body,{fields,required:['name']},true);if(data.timezone){try{new Intl.DateTimeFormat('en',{timeZone:data.timezone})}catch{throw Error('Enter a valid IANA timezone, such as America/New_York.')}}const keys=Object.keys(data);if(!keys.length)throw Error('No changes provided.');transaction(()=>{db.prepare(`UPDATE businesses SET ${keys.map(k=>k+'=?').join(',')} WHERE id=?`).run(...keys.map(k=>data[k]),req.user.business_id);audit(req,'business',req.user.business_id,'Settings updated',JSON.stringify(data));});res.json({ok:true});}catch(e){res.status(400).json({error:e.message})}});
app.get('/api/daybook/knowledge',auth,(req,res)=>res.json(db.prepare('SELECT id,title,content,created_at,updated_at FROM business_knowledge WHERE business_id=? ORDER BY id DESC').all(req.user.business_id)));
function knowledgeInput(body){if(!body||typeof body.title!=='string'||!body.title.trim()||body.title.length>160||typeof body.content!=='string'||!body.content.trim()||body.content.length>6000)throw Error('Enter a title (up to 160 characters) and content (up to 6000 characters).');return {title:body.title.trim(),content:body.content.trim()};}
function knowledgePermission(req,res,next){if(!['owner','admin'].includes(req.user.role))return res.status(403).json({error:'Only owners and administrators can edit business knowledge.'});next()}
app.post('/api/daybook/knowledge',auth,knowledgePermission,(req,res)=>{try{const entry=knowledgeInput(req.body);const id=transaction(()=>{const result=db.prepare('INSERT INTO business_knowledge(business_id,title,content) VALUES (?,?,?)').run(req.user.business_id,entry.title,entry.content);audit(req,'business_knowledge',result.lastInsertRowid,'Created',entry.title);return result.lastInsertRowid});res.status(201).json({id});}catch(e){recordError(res,e)}});
app.patch('/api/daybook/knowledge/:id',auth,knowledgePermission,(req,res)=>{try{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Invalid knowledge ID.'});const entry=knowledgeInput(req.body);const found=transaction(()=>{const existing=db.prepare('SELECT id FROM business_knowledge WHERE id=? AND business_id=?').get(id,req.user.business_id);if(!existing)return false;db.prepare('UPDATE business_knowledge SET title=?,content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?').run(entry.title,entry.content,id,req.user.business_id);audit(req,'business_knowledge',id,'Updated',entry.title);return true});if(!found)return res.status(404).json({error:'Knowledge entry not found.'});res.json({ok:true});}catch(e){recordError(res,e)}});
app.delete('/api/daybook/knowledge/:id',auth,knowledgePermission,(req,res)=>{try{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Invalid knowledge ID.'});const found=transaction(()=>{const row=db.prepare('SELECT title FROM business_knowledge WHERE id=? AND business_id=?').get(id,req.user.business_id);if(!row)return false;db.prepare('DELETE FROM business_knowledge WHERE id=? AND business_id=?').run(id,req.user.business_id);audit(req,'business_knowledge',id,'Deleted',row.title);return true});if(!found)return res.status(404).json({error:'Knowledge entry not found.'});res.json({ok:true});}catch(e){recordError(res,e)}});
app.post('/api/daybook/assistant',auth,async(req,res)=>{
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'The assistant is not configured yet. Add OPENAI_API_KEY to the Daybook server environment.'});
 const messages=req.body?.messages; if(!Array.isArray(messages)||messages.length<1||messages.length>20||messages.some(m=>!m || typeof m!=='object' || !['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>4000)||messages.at(-1).role!=='user')return res.status(400).json({error:'Invalid conversation.'});
 const business=db.prepare('SELECT timezone FROM businesses WHERE id=?').get(req.user.business_id);
 try {
  const result=await generateAssistantReply({db,businessId:req.user.business_id,timezone:business.timezone,messages,apiKey:process.env.OPENAI_API_KEY,endpoint:process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',model:process.env.OPENAI_MODEL||'gpt-4o-mini'});
  res.json(result);
 } catch(e) {console.error('AI request failed:',e.message);res.status(502).json({error:'The assistant is unavailable or timed out. Please try again.'});}
});
app.use('/api/daybook',(req,res)=>res.status(404).json({error:'Endpoint not found.'}));
if(process.env.NODE_ENV==='production' && existsSync('dist/index.html')) { app.use(express.static('dist')); app.get('/{*path}',(req,res)=>res.sendFile(resolve('dist/index.html'))); }
app.use((err,req,res,next)=>{if(err.type==='entity.too.large')return res.status(413).json({error:'Request is too large.'});if(err.type==='entity.parse.failed')return res.status(400).json({error:'Invalid JSON.'});console.error(err);res.status(500).json({error:'Something went wrong.'});});
const port=Number(process.env.DAYBOOK_PORT||3001);const server=app.listen(port,'0.0.0.0',()=>console.log(`Daybook API listening on ${server.address().port}; database ${dbPath}`));
