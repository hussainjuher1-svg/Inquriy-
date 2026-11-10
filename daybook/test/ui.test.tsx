// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Daybook from '../../src/daybook/Daybook';

type RecordRow = Record<string, string | number>;
let session = '';
let stores: Record<string, Record<string, RecordRow[]>>;
let expireAssistant = false;
const types = ['customers','inquiries','estimates','appointments','jobs','follow_ups'];
function response(value: unknown, status = 200) { return {ok:status >= 200 && status < 300,status,json:async()=>value}; }
beforeEach(()=>{
 session=''; expireAssistant=false;
 stores={};
 vi.stubGlobal('fetch',vi.fn(async (url:string,options:RequestInit={})=>{
  const path=url.replace('/api/daybook',''), method=options.method || 'GET';
  const body=options.body?JSON.parse(String(options.body)):{};
  if(path==='/register'){session=body.email;stores[session]=Object.fromEntries(types.map(t=>[t,[]]));return response({csrf:'csrf-'+session});}
  if(path==='/login'){session=body.email;stores[session] ||= Object.fromEntries(types.map(t=>[t,[]]));return response({csrf:'csrf-'+session});}
  if(path==='/me')return session?response({csrf:'csrf-'+session,user:{name:session==='owner@example.com'?'Alex':'Sam',role:'owner'},business:{name:session==='owner@example.com'?'Alex business':'Sam business',timezone:'UTC'}}):response({error:'Please sign in.'},401);
  if(!session)return response({error:'Please sign in.'},401);
  if(path==='/logout'){session='';return response({ok:true});}
  if(path==='/assistant' && expireAssistant){session='';return response({error:'Session expired.'},401);}
  if(path==='/assistant')return response({message:'**Follow up** on the inquiry.',sources:[{type:'inquiries',id:1,label:'Leaking tap'}],sources_truncated:false});
  if(path==='/team')return response([]);
  if(path==='/knowledge'&&method==='GET')return response(stores[session].knowledge||[]);
  if(path==='/knowledge'&&method==='POST'){stores[session].knowledge||=[];stores[session].knowledge.push({...body,id:1,updated_at:'2026-11-10 12:00:00'});return response({id:1},201)}
  if(path.startsWith('/records/')){const [, ,type,id,activity]=path.split('/');if(activity)return response([]);if(method==='GET')return response(stores[session][type]);if(method==='POST'){const row={...body,id:1};stores[session][type].push(row);return response({id:1},201)}if(method==='PATCH'){Object.assign(stores[session][type].find(r=>String(r.id)===id)!,body);return response({ok:true})}}
  if(path.startsWith('/communications?'))return response(stores[session].communications||[]);
  if(path==='/communications'&&method==='POST'){stores[session].communications ||= [];stores[session].communications.push({...body,id:1,author:'Alex'});return response({id:1},201)}
  return response({error:'Not found'},404);
 }));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals()});

describe('Daybook UI',()=>{
 it('registers, creates an inquiry and updates the Today overview',async()=>{
  const user=userEvent.setup();render(<Daybook/>);
  await user.click(await screen.findByRole('button',{name:'Create an account'}));
  await user.type(screen.getByLabelText('Your name'),'Alex');await user.type(screen.getByLabelText('Business name'),'Alex business');
  await user.type(screen.getByLabelText('Email address'),'owner@example.com');await user.type(screen.getByLabelText('Password'),'password12345');
  await user.click(screen.getByRole('button',{name:/Create workspace/}));
  expect(await screen.findByText(/Good to see you, Alex/)).toBeTruthy();
  await user.click(screen.getByRole('button',{name:'New inquiry'}));
  const editor=screen.getByRole('dialog',{name:'New inquiry'});
  await user.type(within(editor).getByLabelText(/Inquiry title/),'Leaking tap');
  await user.click(within(editor).getByRole('button',{name:'Save inquiry'}));
  await waitFor(()=>expect(screen.queryByRole('dialog',{name:'New inquiry'})).toBeNull());
  expect(await screen.findByText('Leaking tap')).toBeTruthy();
  expect(screen.getByText('Inquiry needs a response')).toBeTruthy();
  await user.click(screen.getByText('Leaking tap'));const details=screen.getByRole('dialog',{name:'Edit inquiry'});await user.click(await within(details).findByRole('button',{name:'Record communication'}));await user.type(within(details).getByLabelText('When (business time)'),'2026-11-10T14:30');await user.type(within(details).getByLabelText('Summary'),'Called the customer');await user.click(within(details).getByRole('button',{name:'Save communication'}));expect(await within(details).findByText('Called the customer')).toBeTruthy();
 });
 it('clears open conversations and business records when a session expires',async()=>{
  stores['owner@example.com']=Object.fromEntries(types.map(t=>[t,[]]));stores['owner@example.com'].inquiries=[{id:1,title:'Private inquiry',status:'New'}];
  const user=userEvent.setup();render(<Daybook/>);
  await user.type(await screen.findByLabelText('Email address'),'owner@example.com');await user.type(screen.getByLabelText('Password'),'password12345');await user.click(screen.getByRole('button',{name:/Sign in/}));
  expect(await screen.findByText('Private inquiry')).toBeTruthy();
  await user.click(screen.getAllByRole('button',{name:/Ask Daybook/})[0]);expireAssistant=true;
  await user.type(screen.getByLabelText('Your question'),'Private question');await user.click(screen.getByRole('button',{name:'Send question'}));
  await screen.findByLabelText('Email address');
  await user.type(screen.getByLabelText('Email address'),'other@example.com');await user.type(screen.getByLabelText('Password'),'password12345');await user.click(screen.getByRole('button',{name:/Sign in/}));
  await screen.findByText(/Good to see you, Sam/);
  expect(screen.queryByText('Private inquiry')).toBeNull();
  expect(screen.queryByText('Private question')).toBeNull();
  expect(screen.queryByRole('dialog',{name:'Ask Daybook'})).toBeNull();
 });
 it('saves business knowledge and opens an assistant-consulted record',async()=>{
  stores['owner@example.com']=Object.fromEntries(types.map(t=>[t,[]]));stores['owner@example.com'].inquiries=[{id:1,title:'Leaking tap',status:'New'}];
  const user=userEvent.setup();render(<Daybook/>);
  await user.type(await screen.findByLabelText('Email address'),'owner@example.com');await user.type(screen.getByLabelText('Password'),'password12345');await user.click(screen.getByRole('button',{name:/Sign in/}));
  await screen.findByText('Leaking tap');await user.click(screen.getByRole('button',{name:'Business settings'}));
  await user.type(await screen.findByLabelText('Topic'),'Visit preparation');await user.type(screen.getByLabelText('What should the assistant know?'),'Please clear the area before we arrive.');await user.click(screen.getByRole('button',{name:'Add knowledge'}));
  expect(await screen.findByText('Please clear the area before we arrive.')).toBeTruthy();
  await user.click(screen.getAllByRole('button',{name:/Ask Daybook/})[0]);await user.type(screen.getByLabelText('Your question'),'What needs attention?');await user.click(screen.getByRole('button',{name:'Send question'}));
  let chat=screen.getByRole('dialog',{name:'Ask Daybook'});expect(await within(chat).findByText('Follow up')).toBeTruthy();await user.click(within(chat).getByRole('button',{name:'Close assistant'}));await user.click(screen.getAllByRole('button',{name:/Ask Daybook/})[0]);chat=screen.getByRole('dialog',{name:'Ask Daybook'});expect(within(chat).getByText('Follow up')).toBeTruthy();await user.click(within(chat).getByRole('button',{name:/Leaking tap · #1/}));
  expect(await screen.findByRole('dialog',{name:'Edit inquiry'})).toBeTruthy();
 });

});
