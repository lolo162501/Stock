const axios = require('axios');

// 要取得的股票代碼
const stockListTSE = ['1517', '1609', '2330', '2317', '1216'];
const stockListOTC = ['6547', '6180'];

// 組合 API 需要的股票清單字串
const stockList1 = stockListTSE.map(stock => `tse_${stock}.tw`).join('|');
const stockList2 = stockListOTC.map(stock => `otc_${stock}.tw`).join('|');
const stockList = `${stockList1}|${stockList2}`;

// 組合完整的 URL
const queryUrl = `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${stockList}`;

// 呼叫股票資訊 API
axios.get(queryUrl)
  .then(response => {
    // 判斷該 API 呼叫是否成功
    if (response.status !== 200) {
      throw new Error('取得股票資訊失敗.');
    } else {
      console.log(response.data);
      // 將回傳的 JSON 格式資料轉成 JavaScript 的物件
      const data = response.data;

      // 過濾出有用到的欄位
      const columns = ['c', 'n', 'z', 'tv', 'v', 'o', 'h', 'l', 'y', 'tlong'];
      const stockDataFrame = data.msgArray.map(stock => {
        return {
          '股票代號': stock.c,
          '公司簡稱': stock.n,
          '成交價': stock.z,
          '成交量': stock.tv,
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

      // 顯示股票資訊
      console.table(df);
    }
  })
  .catch(error => console.error(error));
