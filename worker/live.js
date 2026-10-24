import ICONS from './icons.js';
import PAGE from './page.js';
// Public, read-only official-source endpoint. No keys or user data.
const RSS='https://www.cwa.gov.tw/rss/Data/cwa_warning.xml';
const DGPA='https://www.dgpa.gov.tw/typh/daily/nds.html';
const CITIES=new Set('基隆市 臺北市 新北市 桃園市 新竹市 新竹縣 苗栗縣 臺中市 彰化縣 雲林縣 南投縣 嘉義市 嘉義縣 臺南市 高雄市 屏東縣 宜蘭縣 花蓮縣 臺東縣 澎湖縣 連江縣 金門縣'.split(' '));
const text=s=>(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
export function parseWarnings(xml){
 if(!/<rss\b/i.test(xml)||!/<channel\b/i.test(xml))throw Error('Invalid RSS');
 const items=[...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(m=>{const field=t=>text(m[1].match(new RegExp('<'+t+'[^>]*>([\\s\\S]*?)<\\/'+t+'>','i'))?.[1]);return {title:field('title'),url:field('link'),publishedAt:field('pubDate')};}).filter(x=>x.title&&x.url.startsWith('https://www.cwa.gov.tw/')&&Number.isFinite(Date.parse(x.publishedAt))).map(x=>({...x,publishedAt:new Date(x.publishedAt).toISOString()})).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
 return {ok:true,url:'https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_WARN.html',items};
}
export function parseClosures(html){
 const all=text(html),date=all.match(/(\d{3,4})年\s*(\d+)月\s*(\d+)日\s*天然災害/),updated=all.match(/更新時間[：:]\s*(\d{4})\/(\d+)\/(\d+)\s+(\d{2}:\d{2}:\d{2})/);
 if(!date||!updated)throw Error('Source date missing');
 const counties=[];
 for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>text(x[1]));
  const i=cells.findIndex(x=>CITIES.has(x));if(i<0)continue;
  const t=cells.slice(i+1).join(' ').trim();let kind='unknown',label='尚未確認';
  if(t.includes('未達')){kind='below';label='未達停班課標準';}
  else if(t.includes('已達')){kind='threshold';label='達停班課標準';}
  else if(t.includes('部分')||t.includes('停止')&&/[鄉村區]/.test(t)){kind='partial';label='部分停班課';}
  else if(t.includes('停止上班')&&/停止上課|及上課/.test(t)){kind='off';label='停班停課';}
  else if(t.includes('照常')){kind='normal';label='照常上班上課';}
  counties.push({name:cells[i],text:t,kind,label});
 }
 if(counties.length!==22||new Set(counties.map(x=>x.name)).size!==22)throw Error('Incomplete counties');
 let year=+date[1];if(year<1911)year+=1911;
 const pad=x=>String(x).padStart(2,'0');return {ok:true,url:DGPA,date:`${year}-${pad(date[2])}-${pad(date[3])}`,updatedAt:`${updated[1]}-${pad(updated[2])}-${pad(updated[3])}T${updated[4]}+08:00`,counties};
}
export async function getLive(fetcher=fetch){
 const generatedAt=new Date().toISOString();
 const load=async(url,parse)=>{try{const r=await fetcher(url,{headers:{'Cache-Control':'no-cache',Accept:'text/html,application/xml,text/xml'},signal:AbortSignal.timeout(15000),cf:{cacheTtl:0}});if(!r.ok)throw Error('upstream');return {...parse(await r.text()),fetchedAt:generatedAt};}catch{return {ok:false,url,error:'官方來源暫時無法讀取'};}};
 const [weather,closures]=await Promise.all([load(RSS,parseWarnings),load(DGPA,parseClosures)]);return {generatedAt,weather,closures};
}
export default {async fetch(request){const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff'};if(request.method==='OPTIONS')return new Response(null,{headers});if(!['GET','HEAD'].includes(request.method))return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});const path=new URL(request.url).pathname;if(ICONS[path]){const icon=ICONS[path];return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(icon.base64),c=>c.charCodeAt(0)),{headers:{'Content-Type':icon.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});}if(path==='/manifest.webmanifest')return new Response(request.method==='HEAD'?null:"{\"id\":\"/\",\"name\":\"颱風觀測者\",\"short_name\":\"颱風觀測者\",\"lang\":\"zh-Hant\",\"start_url\":\"/\",\"scope\":\"/\",\"display\":\"standalone\",\"background_color\":\"#061720\",\"theme_color\":\"#061720\",\"icons\":[{\"src\":\"/icons/typhoon-192-v3.png\",\"sizes\":\"192x192\",\"type\":\"image/png\",\"purpose\":\"any maskable\"},{\"src\":\"/icons/typhoon-512-v3.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"any maskable\"}]}",{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'no-cache'}});if(path==='/'||path==='/index.html')return new Response(request.method==='HEAD'?null:PAGE,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});if(path!=='/api/live')return new Response(JSON.stringify({error:'Not found'}),{status:404,headers});const data=await getLive();return new Response(request.method==='HEAD'?null:JSON.stringify(data),{headers});}};
