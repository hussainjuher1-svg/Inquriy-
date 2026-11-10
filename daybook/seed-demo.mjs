// Explicit opt-in demo seed. Never run against a real business database.
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const email=process.env.DEMO_EMAIL, password=process.env.DEMO_PASSWORD;
if(!email || !password || password.length<10) { console.error('Set DEMO_EMAIL and DEMO_PASSWORD (at least 10 characters). Use a dedicated demo database.'); process.exit(1); }
const path=resolve(process.env.DAYBOOK_DB||'daybook/data/demo.sqlite');mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec('PRAGMA foreign_keys=ON');db.exec(readFileSync('daybook/migrations/001_initial.sql','utf8'));
const salt=randomBytes(16).toString('hex'), hash=salt+':'+scryptSync(password,salt,64).toString('hex');
try{db.exec('BEGIN');const b=db.prepare("INSERT INTO businesses(name,services,timezone) VALUES ('DEMONSTRATION — Willow & Co.','Demonstration services only','UTC')").run();const u=db.prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)').run('Demo Owner',email.toLowerCase(),hash);db.prepare("INSERT INTO memberships VALUES (?,?,'owner')").run(b.lastInsertRowid,u.lastInsertRowid);const c=db.prepare("INSERT INTO customers(business_id,name,email,notes) VALUES (?,?,?,?)").run(b.lastInsertRowid,'DEMO Customer','demo-customer@example.test','Fictional demonstration record');db.prepare("INSERT INTO inquiries(business_id,customer_id,title,source,status,description) VALUES (?,?,?,?,?,?)").run(b.lastInsertRowid,c.lastInsertRowid,'DEMO inquiry','Manual','New','Fictional demonstration record');db.exec('COMMIT');console.log('Created DEMONSTRATION workspace in '+path);}catch(e){db.exec('ROLLBACK');console.error('Could not seed demo:',e.message);process.exitCode=1}
