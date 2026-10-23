const RSS_URL='https://www.cwa.gov.tw/rss/Data/cwa_warning.xml';
const baseHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
export default {
 async fetch(request){
  const url=new URL(request.url);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(url.pathname==='/api/warnings'){
   try{
    const upstream=await fetch(RSS_URL,{headers:{Accept:'application/rss+xml, application/xml, text/xml'},signal:AbortSignal.timeout(10000),cf:{cacheTtl:120,cacheEverything:true}});
    if(!upstream.ok)throw new Error('upstream');
    const xml=await upstream.text();
    if(xml.length>250000||!xml.includes('<rss')||!xml.includes('<channel>'))throw new Error('format');
    return new Response(request.method==='HEAD'?null:xml,{headers:{...baseHeaders,'Content-Type':'application/xml; charset=utf-8','Cache-Control':'private, max-age=0, must-revalidate'}});
   }catch{return new Response('Official feed unavailable',{status:502,headers:{...baseHeaders,'Cache-Control':'no-store'}});}
  }
  if(url.pathname!=='/'&&url.pathname!=='/index.html')return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:PAGE,{headers:{...baseHeaders,'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-cache'}});
 }
};
