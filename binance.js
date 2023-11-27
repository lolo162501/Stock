const axios = require('axios');

// 定義要爬取的幣種和對應的 API 路徑
const coins = [
  { symbol: 'BTC', url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' },
  { symbol: 'ETH', url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT' },
  { symbol: 'SOL', url: 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT' },
  { symbol: 'YFI', url: 'https://api.binance.com/api/v3/ticker/price?symbol=YFIUSDT' },
  // 可以加入其他的幣種
];

async function getPrice(coin) {
  try {
    // 發送 GET 請求至幣安 API 取得即時價格
    const response = await axios.get(coin.url);

    // 解析 JSON 格式的回應
    const data = response.data;

    // 取得即時價格
    const price = parseFloat(data.price);

    console.log(`${coin.symbol} 即時價格：$${price}`);
  } catch (error) {
    console.error(`${coin.symbol} 發生錯誤：`, error.message);
  }
}

// 使用迴圈執行 getPrice 函式
async function getAllPrices() {
  for (const coin of coins) {
    await getPrice(coin);
  }
}

// 執行函式
getAllPrices();
