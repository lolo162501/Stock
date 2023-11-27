const https = require('https');
const readline = require('readline');

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

                // Sort the data based on the first value in each sub-array (time).
                const sortedData = jsonData.sort((a, b) => a[0] - b[0]);

                // Print the sorted data with formatted time.
                sortedData.forEach((item) => {
                    const time = new Date(item[0] * 1000);
                    var day = String(time.getDate()).padStart(2, '0');
                    var month = String(time.getMonth() + 1).padStart(2, '0');
                    var year = time.getFullYear();
                    hour = String(time.getHours()).padStart(2, '0');
                    minute = String(time.getMinutes()).padStart(2, '0');
                    second = String(time.getSeconds()).padStart(2, '0');
                    const formattedTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                    console.log(`${market.toLocaleUpperCase()} 價格: ${item[1]}, 時間: ${formattedTime}`);
                });
            } catch (error) {
                console.error('Error parsing JSON:', error.message);
            }
        });
    }).on('error', (error) => {
        console.error('Error making API request:', error.message);
    });
});
