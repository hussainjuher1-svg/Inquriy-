// Deterministic, read-only business overview. Returned details are capped, counts are not.
const isoDate=(date,timezone)=>new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
const shiftDate=(date,days)=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)};
function localTimestamp(value,timezone){const d=new Date(value.replace(' ','T')+'Z');return Number.isNaN(d.getTime())?'':isoDate(d,timezone)}
function group(rows,reason){return {count:rows.length,returned:Math.min(rows.length,12),truncated:rows.length>12,records:rows.slice(0,12).map(row=>({...row,reason}))};}
export function getBusinessOverview(db,businessId,timezone,now=new Date()) {
 const today=isoDate(now,timezone);
 const weekday=new Date(today+'T00:00:00Z').getUTCDay();
 const weekStart=shiftDate(today,-((weekday+6)%7));
 const select=(table,fields)=>db.prepare(`SELECT ${fields} FROM ${table} WHERE business_id=? ORDER BY id DESC`).all(businessId);
 const inquiries=select('inquiries','id,title,customer_id,status,source,follow_up_date,created_at');
 const estimates=select('estimates','id,title,customer_id,status,follow_up_date,valid_until');
 const appointments=select('appointments','id,title,customer_id,status,date,time,assigned_to');
 const jobs=select('jobs','id,title,customer_id,status,date,assigned_to');
 const followups=select('follow_ups','id,title,customer_id,inquiry_id,estimate_id,job_id,status,date,assigned_to');
 const openFollowups=followups.filter(r=>r.status==='Open');
 const inquiriesWithFollowUps=new Set(openFollowups.map(r=>r.inquiry_id).filter(Boolean));
 const estimatesWithFollowUps=new Set(openFollowups.map(r=>r.estimate_id).filter(Boolean));
 const activeInquiries=inquiries.filter(r=>!['Converted','Not Proceeding','Archived'].includes(r.status));
 const activeEstimates=estimates.filter(r=>['Sent','Awaiting Response','Follow-up Needed'].includes(r.status));
 const sortDue=rows=>rows.sort((a,b)=>(a.date||a.follow_up_date||'9999').localeCompare(b.date||b.follow_up_date||'9999')||b.id-a.id);
 const relevantAppointments=appointments.filter(r=>!['Completed','Cancelled','Rescheduled'].includes(r.status));
 const relevantJobs=jobs.filter(r=>!['Completed','Cancelled'].includes(r.status));
 return {
  today, timezone, week:{start:weekStart,end:today,definition:'Monday through today, inclusive'},
  inquiries_received_this_week:inquiries.filter(r=>{const d=localTimestamp(r.created_at,timezone);return d>=weekStart&&d<=today}).length,
  attention:{
   overdue_follow_ups:group(sortDue(openFollowups.filter(r=>r.date<today)),'Open follow-up is overdue'),
   follow_ups_due_today:group(sortDue(openFollowups.filter(r=>r.date===today)),'Open follow-up is due today'),
   inquiries_needing_response:group(activeInquiries.filter(r=>['New','Needs Response'].includes(r.status)),'Status is New or Needs Response'),
   inquiry_follow_ups_due:group(sortDue(activeInquiries.filter(r=>r.follow_up_date&&r.follow_up_date<=today)),'Recorded inquiry follow-up date is due'),
   estimates_follow_up_due:group(sortDue(activeEstimates.filter(r=>r.status==='Follow-up Needed'||(r.follow_up_date&&r.follow_up_date<=today))),'Estimate status is Follow-up Needed or its recorded follow-up date is due'),
   appointments_needing_confirmation:group(sortDue(relevantAppointments.filter(r=>r.status==='Confirmation Needed'&&r.date>=today)),'Status is Confirmation Needed'),
   inquiries_without_scheduled_follow_up:group(activeInquiries.filter(r=>!r.follow_up_date&&!inquiriesWithFollowUps.has(r.id)),'No follow-up date or linked open follow-up is recorded'),
   estimates_without_scheduled_follow_up:group(activeEstimates.filter(r=>!r.follow_up_date&&!estimatesWithFollowUps.has(r.id)),'No follow-up date or linked open follow-up is recorded'),
  },
  today_schedule:{appointments:group(sortDue(relevantAppointments.filter(r=>r.date===today)),'Scheduled for today'),jobs:group(sortDue(relevantJobs.filter(r=>r.date===today)),'Scheduled for today')},
  limitations:['The same record can appear in multiple categories; counts must not be added together.','Missing follow-up or communication records do not prove that no contact or next step happened outside Daybook.','Only explicitly recorded dates, statuses and linked follow-ups are considered.']
 };
}
