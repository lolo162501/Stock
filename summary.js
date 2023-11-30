const https = require('https');
const readline = require('readline');

const fetchData = () => {
  const apiUrl = `https://max-api.maicoin.com/api/v2/summary`;

  https.get(apiUrl, (response) => {
    let data = '';

    // A chunk of data has been received.
    response.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        calculatePoint(parsedData.tickers, 'btc')
        calculatePoint(parsedData.tickers, 'eth')
        calculatePoint(parsedData.tickers, 'sol')
        calculatePoint(parsedData.tickers, 'max')
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('Error making API request:', error.message);
  });

  function calculatePoint(tickers, market) {
    const twdInfo = tickers[market + 'twd'];
    const open = parseFloat(twdInfo.open);
    const low = parseFloat(twdInfo.low);
    const high = parseFloat(twdInfo.high);
    const last = parseFloat(twdInfo.last);
    const buy = parseFloat(twdInfo.buy);
    const sell = parseFloat(twdInfo.sell);
    const volume = parseFloat(twdInfo.volume);
    // const volumeInBtc = parseFloat(twdInfo.volume_in_btc);

    // 簡單趨勢分析
    const trend = last > open ? 'UP' : last < open ? 'DOWN' : 'UNCHANGED';

    // 支撐與阻力點
    const supportLevel = low;
    const resistanceLevel = high;

    // 輸出結果
    console.log(`${market.toUpperCase()}/TWD 技術分析:`);
    console.log(`當前價格: ${last}`);
    console.log(`買入價: ${buy}`);
    console.log(`賣出價: ${sell}`);
    console.log(`支撐點: ${supportLevel}`);
    console.log(`阻力點: ${resistanceLevel}`);
    console.log(`成交量: ${volume}`);
    console.log(`趨勢: ${trend}`);
  // console.log(`BTC 成交量: ${volumeInBtc}`);
    console.log('==============================');
  }
}
setInterval(fetchData, 500);