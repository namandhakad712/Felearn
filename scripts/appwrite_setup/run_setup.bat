@echo off
echo Appwrite Database Setup Script
echo ============================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python and try again.
    exit /b 1
)

REM Check if required packages are installed
python -c "import appwrite" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required packages...
    pip install appwrite python-dotenv
)

echo Running database setup script...
echo.

REM Run the script with the provided arguments
python setup_database.py --env-file ../../.env.appwrite %*

echo.
if %ERRORLEVEL% equ 0 (
    echo Setup completed successfully.
) else (
    echo Setup failed with error code %ERRORLEVEL%.
)