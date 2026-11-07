const puppeteer=require('puppeteer-core');const path=require('path');const fs=require('fs');
const EDGE='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
(async()=>{
 const browser=await puppeteer.launch({executablePath:EDGE,headless:'new',args:['--no-sandbox']});
 const page=await browser.newPage(); await page.setViewport({width:1440,height:900});
 await page.evaluateOnNewDocument(()=>{localStorage.setItem('mmo_auth_users',JSON.stringify([{id:'admin',email:'a@b.c',username:'Aldric',passwordHash:'x'}]));localStorage.setItem('mmo_auth_session','admin');localStorage.setItem('mmo_player_characters',JSON.stringify([{id:'c1',profile_id:'admin',name:'Aldric',epithet:'the Bold',kingdom_id:1,profession:'farmer',profession_rank:2,origin:'x',motto:'y',banner_seed:1,onboarding_completed:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}]));});
 await page.goto('http://localhost:3000/world',{waitUntil:'networkidle2'});
 await page.waitForFunction(()=>document.body.innerText.includes('AL-ANDALUS'),{timeout:15000});
 await page.evaluate(()=>{ [...document.querySelectorAll('button')].find(b=>b.innerText.includes('WARFARE'))?.click(); });
 await new Promise(r=>setTimeout(r,1500));
 await page.screenshot({path:path.join(__dirname,'../public/screenshots/world-warfare-layer-desktop-1440.png')});
 // select Steel Bastion
 await page.evaluate(()=>{ [...document.querySelectorAll('button')].find(b=>b.innerText.includes('STEEL BASTION'))?.click(); });
 await new Promise(r=>setTimeout(r,1000));
 await page.screenshot({path:path.join(__dirname,'../public/screenshots/world-steel-bastion-desktop-1440.png')});
 await browser.close(); console.log('done');
})();

