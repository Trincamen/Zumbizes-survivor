@echo off
net session >nul 2>&1 || (powershell -NoProfile -Command "Start-Process '%~f0' -Verb RunAs" & exit /b)
netsh advfirewall firewall add rule name="Horda Cooperativa" dir=in action=allow protocol=TCP localport=8080 profile=any
echo Porta 8080 liberada no Firewall do Windows.
pause
