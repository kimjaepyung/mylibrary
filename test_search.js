async function testProxies(query) {
  const targetUrl = `https://www.yes24.com/Product/Search?domain=ALL&query=${encodeURIComponent(query)}`;
  console.log('\nTarget URL:', targetUrl);

  const proxies = [
    { name: 'allorigins-raw', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}` },
    { name: 'codetabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}` }
  ];

  for (const p of proxies) {
    try {
      console.log(`Trying proxy: ${p.name}`);
      const res = await fetch(p.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      console.log(` - Status: ${res.status}, Length: ${html.length}`);
      
      const itemChunks = html.split('class="itemUnit"').slice(1);
      console.log(` - Found itemUnits: ${itemChunks.length}`);

      if (itemChunks.length > 0) {
        for (const chunk of itemChunks.slice(0, 5)) {
          const goodsMatch = chunk.match(/data-goods-no="(\d+)"/);
          const titleMatch = chunk.match(/class="gd_name"[^>]*>([^<]+)<\/a>/);
          const authMatch = chunk.match(/class="info_auth"[^>]*>([\s\S]*?)<\/span>/);
          const pubMatch = chunk.match(/class="info_pub"[^>]*>([\s\S]*?)<\/span>/);
          const dateMatch = chunk.match(/class="info_date"[^>]*>([\s\S]*?)<\/span>/);

          if (titleMatch) {
            const goodsNo = goodsMatch ? goodsMatch[1] : '';
            const title = titleMatch[1].trim();
            const author = authMatch ? authMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            const pub = pubMatch ? pubMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            const date = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
            console.log(`   * [${goodsNo}] "${title}" | 저자: ${author} | 출판사: ${pub} | 발행: ${date}`);
            console.log(`     Cover: https://image.yes24.com/goods/${goodsNo}/XL`);
          }
        }
        return; // Success!
      }
    } catch(err) {
      console.error(` - Proxy ${p.name} failed:`, err.message);
    }
  }
}

async function run() {
  await testProxies('미적분으로 바라본 하루');
  await testProxies('클린 코드');
  await testProxies('코스모스');
}

run();
