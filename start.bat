@echo off
echo Starting StackIt...
echo.

echo Installing backend dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo Starting the application...
npm run dev

pause 