// Read public announcements on demand; never infer opening from ordinary hours.
export const MALLS = [
 {id:'bigcity',name:'Big City 巨城',aliases:['Big City巨城','BigCity巨城','巨城'],url:'https://www.febigcity.com/'},
 {id:'zhubei',name:'遠百竹北',aliases:['遠百竹北','竹北遠百','竹北大遠百'],url:'https://www.feds.com.tw/tw/72/Event/List'},
 {id:'shown',name:'享平方',aliases:['享平方'],url:'https://www.facebook.com/shownsquare2022/'},
 {id:'feds',name:'新竹大遠百',aliases:['新竹大遠百','遠百新竹'],url:'https://www.feds.com.tw/tw/42/Event/List'},
 {id:'sogo',name:'SOGO 新竹店',aliases:['SOGO新竹店','新竹SOGO'],url:'https://www.sogo.com.tw/'},
 {id:'ifg',name:'iFG 遠雄廣場新竹店',aliases:['iFG遠雄廣場新竹店','遠雄廣場新竹店'],url:'https://www.ifg.com.tw/'}
];
const REPORT='https://udn.com/news/story/7324/9834758';
const plain=s=>(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();
export const taiwanDay=(now=new Date())=>{const p=new Intl.DateTimeFormat('en',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(t=>p.find(x=>x.type===t).value).join('-');};
function published(html){
 for(const m of html.matchAll(/<meta\b[^>]*>/gi)){if(/published_time|datePublished|pubdate/i.test(m[0])){const v=m[0].match(/content=["']([^"']+)/i)?.[1];if(v&&/^\d{4}-\d{2}-\d{2}/.test(v))return v;}}
 return html.match(/["']datePublished["']\s*:\s*["'](\d{4}-\d{2}-\d{2}[^"']*)/i)?.[1]||null;
}
function opening(s){
 const compact=s.replace(/\s+/g,'');
 if(/正常營業|照常營業|正常營運/.test(compact))return {kind:'open',state:'正常營業'};
 if(!/部分|專櫃|餐廳|影城|KTV/i.test(compact)&&/暫停營業|停止營業|休館|全館公休/.test(compact))return {kind:'closed',state:'暫停營業'};
 if(/延後|延至|開始營業|起營業|開門|開店/.test(compact)){
  let m=compact.match(/(上午|下午|中午|晚間)?\s*(\d{1,2})(?::(\d{2})|[時點](?:(\d{1,2})分)?)/);
  if(!m)return null;let h=+m[2];const minute=+(m[3]||m[4]||0);if(/下午|晚間/.test(m[1]||'')&&h<12)h+=12;if(m[1]==='中午'&&h<11)h+=12;
  if(h>23||minute>59)return null;return {kind:'delayed',state:String(h).padStart(2,'0')+':'+String(minute).padStart(2,'0')+' 開始營業'};
 }
 return null;
}
export function parseMall(html,mall,day,sourceType='official'){
 const stamp=published(html);if(stamp&&stamp.slice(0,10)!==day)return null;
 let body=sourceType==='news'?html.match(/<section\b[^>]*class=["'][^"']*article-content__editor[^"']*["'][^>]*>([\s\S]*?)<\/section>/i)?.[1]:html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
 if(sourceType==='news'&&!body)return null;body=body||html;
 const title=plain(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
 const content=plain(body.replace(/<\/(?:p|div|li|figcaption|h[1-6])\s*>|<br\s*\/?>/gi,'。')),compact=content.replace(/\s+/g,'');
 if(!/颱風|營業公告|營業異動|營業調整|恢復營業|休館公告/.test(title+' '+content))return null;
 // Never bind the computer's date to an undated announcement.
 const y=+day.slice(0,4),month=+day.slice(5,7),d=+day.slice(8,10);
 const dated=new RegExp('(?:'+y+'[年/.-]0?'+month+'[月/.-]0?'+d+'(?:日|[^0-9]|$)|'+(y-1911)+'年0?'+month+'月0?'+d+'日)');
 const shortDate=new RegExp('(?:^|[^0-9])0?'+month+'(?:/|月)0?'+d+'(?:日|[^0-9]|$)');
 const sameDay=stamp?.slice(0,10)===day;
 const chunks=content.split(/[。；;\n]/).filter(Boolean);const candidates=[];
 for(const chunk of chunks){
  const c=chunk.replace(/\s+/g,'');if(!mall.aliases.some(a=>c.includes(a.replace(/\s+/g,''))))continue;
  if(/明天|明日|翌日|隔日|昨天|昨日|前日/.test(c))continue;
  if(mall.id==='ifg'&&!/iFG|遠雄/i.test(title+' '+chunk))continue;
  // Multi-day lists only qualify when the date is in the same statement.
  if(!sameDay&&!dated.test(chunk)&&!(dated.test(title)&&shortDate.test(title)))continue;
  if(sameDay){const explicit=[...chunk.matchAll(/(?:^|[^0-9])(\d{1,2})[月/](\d{1,2})(?:日|[^0-9]|$)/g)];if(explicit.length&&explicit.every(m=>+m[1]!==month||+m[2]!==d))continue;}
  const status=opening(chunk);if(status)candidates.push(status);
 }
 // An official article scoped to one mall may put its date/name in the title.
 const bodyDates=[...content.matchAll(/(?:^|[^0-9])(\d{1,2})[月/](\d{1,2})(?:日|[^0-9]|$)/g)];
 if(!candidates.length&&bodyDates.every(m=>+m[1]===month&&+m[2]===d)&&sourceType==='official'&&!/明天|明日|翌日|隔日|昨天|昨日|前日/.test(content)&&mall.aliases.some(a=>title.replace(/\s+/g,'').includes(a.replace(/\s+/g,'')))&&(sameDay||dated.test(title))){const s=opening(content);if(s)candidates.push(s);}
 const unique=[...new Map(candidates.map(x=>[x.state,x])).values()];if(unique.length!==1)return null;
 const partial=mall.aliases.some(a=>compact.includes(a.replace(/\s+/g,'')+'部分專櫃'));
 return {...unique[0],date:day,publishedAt:stamp,note:partial?'部分專櫃暫停營業，請查看原公告。':mall.id==='shown'?'影城及 KTV 請另查各店公告。':'實際安排以來源最新公告為準。'};
}
function links(html,url){
 const origin=new URL(url).origin;const out=[];
 for(const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  if(!/颱風|營業公告|營業異動|營業調整|休館|恢復營業/.test(plain(m[2])))continue;
  try{const u=new URL(m[1].replace(/&amp;/g,'&'),url);if(u.origin===origin&&u.href!==url&&!out.includes(u.href))out.push(u.href);}catch{}
 }
 return out.slice(0,2);
}
export async function getMalls(fetcher=fetch,now=new Date()){
 const checkedAt=now.toISOString(),date=taiwanDay(now),memo=new Map();
 const load=url=>{if(!memo.has(url))memo.set(url,(async()=>{try{const r=await fetcher(url,{headers:{Accept:'text/html','Cache-Control':'no-cache'},signal:AbortSignal.timeout(8000),cf:{cacheTtl:0,cacheEverything:false}});if(!r.ok)return null;const html=await r.text();return html.length<=2500000?html:null;}catch{return null;}})());return memo.get(url);};
 const reportPromise=load(REPORT);
 const items=await Promise.all(MALLS.map(async mall=>{
  const base={id:mall.id,name:mall.name,officialUrl:mall.url,checkedAt,date};
  const html=await load(mall.url);const candidates=[];
  if(html){const first=parseMall(html,mall,date);if(first)candidates.push({...first,sourceUrl:mall.url,sourceType:'official'});
   const docs=await Promise.all(links(html,mall.url).map(async url=>{const h=await load(url);return h?{parsed:parseMall(h,mall,date),url}:null;}));
   for(const doc of docs)if(doc?.parsed)candidates.push({...doc.parsed,sourceUrl:doc.url,sourceType:'official'});
  }
  const states=new Set(candidates.map(x=>x.state));
  if(states.size>1)return {...base,ok:false,kind:'unknown',state:'公告不一致',note:'找到不同安排，請查看官方最新公告。'};
  if(candidates.length)return {...base,ok:true,...candidates.at(-1)};
  const report=await reportPromise;const result=report&&parseMall(report,mall,date,'news');
  if(result)return {...base,ok:true,...result,sourceType:'news',sourceUrl:REPORT,officialChecked:!!html};
  return {...base,ok:false,kind:'unknown',state:'本次無法確認',note:html?'未找到可核對日期的當日營業公告。':'官方來源暫時無法讀取；請開啟官方資訊確認。'};
 }));
 return {checkedAt,date,items};
}
