@echo off
echo ===============================
echo 🚀 React Native 清除與重建工具
echo ===============================

:: 移除 node_modules
echo 🔄 移除 node_modules...
rmdir /s /q node_modules

:: 移除 lock files
echo 🔄 移除 yarn.lock / package-lock.json...
del /f /q yarn.lock
del /f /q package-lock.json

:: 清除 Android build cache
echo 🔄 移除 Android build 緩存...
rmdir /s /q android\.gradle
rmdir /s /q android\app\build

:: 清除 Metro 與 Expo 緩存
echo 🔄 移除 .expo / .metro 資料夾...
rmdir /s /q .expo
rmdir /s /q .metro

:: 安裝依賴
echo ⬇️ 安裝 npm 套件中...
call npm install

:: 重啟 Metro Server
echo 🔁 啟動 Metro Server...
start cmd /k "npx react-native start"

:: 延遲一點讓 Metro server 開好
timeout /t 5 > nul

:: 執行 Android app
echo 📱 編譯並安裝至 Android 裝置中...
call npx react-native run-android

echo ===============================
echo ✅ 完成！Enjoy Coding 😎
pause
