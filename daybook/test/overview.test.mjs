import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {getBusinessOverview} from '../server/assistant-overview.mjs';

test('overview uses business-local dates, exact counts and explicit evidence',()=>{
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');db.exec(readFileSync('daybook/migrations/001_initial.sql','utf8'));
 db.exec(`INSERT INTO businesses(id,name,timezone) VALUES (1,'One','America/Los_Angeles'),(2,'Two','UTC');
 INSERT INTO inquiries(business_id,title,status,created_at,follow_up_date) VALUES
 (1,'Monday inquiry','New','2026-11-09 09:00:00','2026-11-09'),
 (1,'Sunday local','In Progress','2026-11-09 01:00:00',''),
 (2,'Private inquiry','New','2026-11-10 20:00:00','');
 INSERT INTO estimates(business_id,title,status,follow_up_date) VALUES (1,'Estimate due','Awaiting Response','2026-11-09'),(1,'Draft','Draft','2026-11-09');
 INSERT INTO follow_ups(business_id,title,status,date,inquiry_id) VALUES (1,'Overdue','Open','2026-11-09',1),(1,'Done','Completed','2026-11-09',NULL),(2,'Private','Open','2026-11-09',NULL);
 INSERT INTO appointments(business_id,title,date,time,status) VALUES (1,'Today visit','2026-11-10','09:00','Confirmation Needed'),(1,'Cancelled','2026-11-10','12:00','Cancelled');
 INSERT INTO jobs(business_id,title,date,status) VALUES (1,'Today work','2026-11-10','Scheduled'),(1,'Finished','2026-11-10','Completed');`);
 const result=getBusinessOverview(db,1,'America/Los_Angeles',new Date('2026-11-11T01:00:00Z'));
 assert.equal(result.today,'2026-11-10');assert.deepEqual(result.week,{start:'2026-11-09',end:'2026-11-10',definition:'Monday through today, inclusive'});assert.equal(result.inquiries_received_this_week,1);assert.equal(result.attention.overdue_follow_ups.count,1);assert.equal(result.attention.inquiries_needing_response.count,1);assert.equal(result.attention.inquiry_follow_ups_due.count,1);assert.equal(result.attention.estimates_follow_up_due.count,1);assert.equal(result.attention.inquiries_without_scheduled_follow_up.count,1);assert.equal(result.today_schedule.appointments.count,1);assert.equal(result.today_schedule.jobs.count,1);assert.equal(result.attention.appointments_needing_confirmation.count,1);assert.doesNotMatch(JSON.stringify(result),/Private/);assert.match(result.limitations.join(' '),/same record/i);
 for(let i=0;i<15;i++)db.prepare("INSERT INTO follow_ups(business_id,title,status,date) VALUES (1,?,'Open','2026-11-08')").run('Call '+i);
 const many=getBusinessOverview(db,1,'America/Los_Angeles',new Date('2026-11-11T01:00:00Z'));assert.equal(many.attention.overdue_follow_ups.count,16);assert.equal(many.attention.overdue_follow_ups.records.length,12);assert.equal(many.attention.overdue_follow_ups.truncated,true);db.close();
});
