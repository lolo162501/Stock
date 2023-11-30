const axios = require('axios');

// Function to make the API call and process the data
const fetchData = () => {
  const stockListTSE = [
    '0050', '0056', '00713', '00878',
    '2330', '2303', '2454', '2317',
    '1517', '1609', '1605', '6443'
  ];
  const stockListOTC = ['5278'];

  const stockList1 = stockListTSE.map(stock => `tse_${stock}.tw`).join('|');
  const stockList2 = stockListOTC.map(stock => `otc_${stock}.tw`).join('|');
  const stockList = `${stockList1}|${stockList2}`;

  const queryUrl = `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${stockList}&delay=0`;

  axios.get(queryUrl).then(response => {
    if (response.status !== 200) {
      throw new Error('取得股票資訊失敗...');
    } else {
      const data = response.data;
      const columns = ['c', 'n', 'z', 'tv', 'v', 'o', 'h', 'l', 'y', 'tlong'];
      const stockDataFrame = data.msgArray.map(stock => {
        return {
          '股票代號': stock.c,
          '公司簡稱': stock.n,
          '成交價': (stock.z != '-' ? stock.z : previousPriceData[stock.c]?.['成交價'] || 0), // Use previous data if new data is not available
          '成交量': (stock.tv != '-' ? stock.tv : previousVolumData[stock.c]?.['成交量'] || 0),
          '累積成交量': stock.v,
          '開盤價': stock.o,
          '最高價': stock.h,
          '最低價': stock.l,
          '昨收價': stock.y,
          '資料更新時間': stock.tlong,
        };
      });

      const df = stockDataFrame.reduce((acc, stock) => {
        acc.push(stock);
        return acc;
      }, []);

      // 自行新增漲跌百分比欄位
      df.forEach(stock => {
        stock['漲跌百分比'] = 0.0;
      });

      // 用來計算漲跌百分比的函式
      const countPer = stock => {
        const result = (parseFloat(stock['成交價']) - parseFloat(stock['昨收價'])) / parseFloat(stock['昨收價']) * 100;
        stock['漲跌百分比'] = result === -100 ? '-' : result;
      };

      // 填入每支股票的漲跌百分比
      df.forEach(countPer);

      // 紀錄更新時間
      const time2str = t => {
        const taiwanTime = new Date(parseInt(t) + 8 * 60 * 60 * 1000);
        return taiwanTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
      };

      // 把 API 回傳的秒數時間轉成容易閱讀的格式
      df.forEach(stock => {
        stock['資料更新時間'] = time2str(stock['資料更新時間']);
      });

      console.table(df);

      // Store the current data to use as previous data in the next call
      previousPriceData = df.reduce((obj, stock) => {
        obj[stock['股票代號']] = { '成交價': stock['成交價'] };
        return obj;
      }, {});
      previousVolumData = df.reduce((obj, stock) => {
        obj[stock['股票代號']] = { '成交量': stock['成交量'] };
        return obj;
      }, {});
    }
  })
    .catch(error => console.error(error));
};

// Variable to store previous data
let previousPriceData = {};
let previousVolumData = {};

// Call the fetchData function every second
fetchData()
setInterval(fetchData, 3600);
