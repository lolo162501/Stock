const https = require('https');
const readline = require('readline');

// Function to calculate the moving average of an array of prices
function calculateMovingAverage(prices, period) {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    const start = Math.max(0, i - period + 1);
    const average = prices.slice(start, i + 1).reduce((sum, price) => sum + price, 0) / (i - start + 1);
    result.push(average);
  }
  return result;
}

// Function to detect crossover (Golden Cross or Death Cross)
function detectCross(prevShortMA, shortMA, prevLongMA, longMA) {
  if (prevShortMA < prevLongMA && shortMA >= longMA) {
    return 'Golden Cross';
  } else if (prevShortMA > prevLongMA && shortMA <= longMA) {
    return 'Death Cross';
  }
  return null;
}

function determineLabel(currentPrice, mas) {
  const aboveMAs = mas.filter((ma) => currentPrice > ma).length;

  if (aboveMAs === 4) {
    return 'A';
  } else if (aboveMAs === 3) {
    return 'B';
  } else if (aboveMAs === 2) {
    return 'C';
  } else if (aboveMAs === 1) {
    return 'D';
  } else {
    return 'E';
  }
}

function fetchData(market) {
  const apiUrl = `https://max-api.maicoin.com/api/v2/k?market=${market}twd&period=1`;

  https.get(apiUrl, (response) => {
    let data = '';

    // A chunk of data has been received.
    response.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received.
    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        const sortedData = jsonData.sort((a, b) => a[0] - b[0]);

        // Extracting prices and timestamps
        const prices = sortedData.map(item => item[1]);

        // Calculate moving averages (7-day, 14-day, 21-day, 63-day)
        const ma7 = calculateMovingAverage(prices, 7);
        const ma14 = calculateMovingAverage(prices, 14);
        const ma21 = calculateMovingAverage(prices, 21);
        const ma63 = calculateMovingAverage(prices, 63);

        // Print the sorted data with formatted time and moving averages
        for (let i = 0; i < sortedData.length; i++) {
          const item = sortedData[i];
          const time = new Date(item[0] * 1000);
          var day = String(time.getDate()).padStart(2, '0');
          var month = String(time.getMonth() + 1).padStart(2, '0');
          var year = time.getFullYear();
          hour = String(time.getHours()).padStart(2, '0');
          minute = String(time.getMinutes()).padStart(2, '0');
          second = String(time.getSeconds()).padStart(2, '0');
          const formattedTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

          const ma7Value = ma7[i];
          const ma14Value = ma14[i];
          const ma21Value = ma21[i];
          const ma63Value = ma63[i];
          const label = determineLabel(item[1], [ma7Value, ma14Value, ma21Value, ma63Value]);
          var cross = '';
          // Check for crossover (Golden Cross or Death Cross)
          if (i > 0) {
            const prevMa7 = ma7[i - 1];
            const prevMa14 = ma14[i - 1];
            const prevMa21 = ma21[i - 1];
            const prevMa63 = ma63[i - 1];
            const cross7_14 = detectCross(prevMa7, ma7Value, prevMa14, ma14Value);
            const cross14_21 = detectCross(prevMa14, ma14Value, prevMa21, ma21Value);
            const cross21_63 = detectCross(prevMa21, ma21Value, prevMa63, ma63Value);
            if (cross7_14) {
              cross += (`7/14 ${cross7_14}  `);
            }
            if (cross14_21) {
              cross += (`14/21 ${cross14_21}  `);
            }
            if (cross21_63) {
              cross += (`21/63 ${cross21_63}  `);
            }
            console.log(`============================================ 
               P: ${item[1]},
               T: ${formattedTime},
              m7: ${ma7Value},
             m14: ${ma14Value},
             m21: ${ma21Value}, 
             m63: ${ma63Value},
           label: ${label},
           cross: ${cross.length > 0 ? cross : 'No Change'}`);
          }
        }
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('Error making API request:', error.message);
  });
}

// User input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('請輸入數字選擇市場（1. BTC, 2. ETH, 3. SOL）: ', (answer) => {
  rl.close();

  let market;

  switch (answer) {
    case '1':
      market = 'btc';
      break;
    case '2':
      market = 'eth';
      break;
    case '3':
      market = 'sol';
      break;
    default:
      console.error('請輸入有效的數字（1, 2, 3）');
      process.exit(1);
  }

  // Run fetchData initially
  fetchData(market);

  // Set interval to run fetchData every 30 seconds
  setInterval(() => {
    fetchData(market);
  }, 1000);
});
