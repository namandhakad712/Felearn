@echo off
echo Setting up Appwrite database with improved script...

echo Installing required dependencies...
npm install dotenv

echo Running improved setup script...
node improved-setup-appwrite-database.js

echo Done!
pause