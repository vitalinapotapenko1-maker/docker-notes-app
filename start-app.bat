@echo off
echo Zostavovanie a spustanie Docker kontajnerov...
docker-compose up --build -d
echo.
echo Aplikacia bola spustena! Otvorte http://localhost:8080
echo.
pause