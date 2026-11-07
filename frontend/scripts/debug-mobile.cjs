const puppeteer = require('puppeteer-core'); const path=require('path'); const fs=require('fs');
const EDGE='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
(async()=>{
 const browser=await puppeteer.launch({executablePath:EDGE,headless:'new',args:['--no-sandbox']});
 const page=await browser.newPage();
 await page.setViewport({width:390,height:844});
 await page.evaluateOnNewDocument(()=>{localStorage.setItem('mmo_auth_users',JSON.stringify([{id:'admin',email:'a@b.c',username:'Aldric',passwordHash:'x'}]));localStorage.setItem('mmo_auth_session','admin');localStorage.setItem('mmo_player_characters',JSON.stringify([{id:'c1',profile_id:'admin',name:'Aldric',epithet:'the Bold',kingdom_id:1,profession:'farmer',profession_rank:2,origin:'x',motto:'y',banner_seed:1,onboarding_completed:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}]));});
 await page.goto('http://localhost:3000/world',{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,1500));
 const info=await page.evaluate(()=>{const aside=document.querySelector('aside'); const cs=getComputedStyle(aside); const main=document.body.innerText.slice(0,300); return {pos:cs.position, transform:cs.transform, width:aside.getBoundingClientRect().width, left:aside.getBoundingClientRect().left, bodyScroll:document.documentElement.scrollWidth, inner:window.innerWidth, asideClass:aside.className.slice(0,300), content:main};});
 console.log(JSON.stringify(info,null,2));
 await browser.close();
})();
