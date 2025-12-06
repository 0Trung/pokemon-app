@echo off
title Pokemon Type Calculator
mode con: cols=50 lines=10

echo ==========================================
echo    DANG KHOI DONG POKEMON CALCULATOR...
echo ==========================================

:: 1. Dọn dẹp server cũ (nếu lỡ quên tắt lần trước)
taskkill /F /IM node.exe >nul 2>&1

:: 2. Chạy Server mới (Thu nhỏ xuống taskbar)
echo Dang bat Server...
start /min cmd /c "npm run dev"

:: 3. Đợi 4 giây để server kịp chạy
timeout /t 4 >nul

:: 4. Mở giao diện Ứng dụng (Không có thanh địa chỉ)
:: Lưu ý: Nếu bạn dùng Edge thì đổi 'chrome' thành 'msedge'
echo Dang mo Giao dien...
start chrome --app=http://localhost:5173 --window-size=1000,800

:: 5. Thông báo kết thúc
cls
echo ==========================================
echo        UNG DUNG DANG CHAY!
echo ==========================================
echo.
echo [!] Khi nao dung xong:
echo     Hay dong cua so den nay lai de tat han.
echo.
pause
:: Khi người dùng bấm phím bất kỳ hoặc tắt cửa sổ này, server sẽ tắt theo
taskkill /F /IM node.exe >nul 2>&1