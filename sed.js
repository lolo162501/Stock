const fs = require('fs');

// 輸入檔案路徑
const filePath = '/Users/allen/code/android/sunfun/wt_android/app/src/main/java/com/sunfun/wetouch/activity/profile/MyProfileActivity.java';

// 讀取檔案
fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // 使用正規表達式進行替換
    const updatedContent = data.replace(/findViewById\(R\.id\.activityMyProfile_([a-zA-Z]+)\)/g, (match, p1) => {
        // 將第一個英文字轉成大寫
        const firstChar = p1.charAt(0).toUpperCase();
        // 組合新的字串
        return `binding.activityMyProfile${firstChar}${p1.slice(1)}`;
    });

    // 寫回檔案
    fs.writeFile(filePath, updatedContent, 'utf-8', (err) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('腳本執行完成');
    });
});
