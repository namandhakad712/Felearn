Write-Host "Appwrite Database Setup Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Using $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python and try again." -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
try {
    python -c "import appwrite" | Out-Null
    Write-Host "Appwrite SDK is installed." -ForegroundColor Green
} catch {
    Write-Host "Installing required packages..." -ForegroundColor Yellow
    pip install appwrite python-dotenv
}

Write-Host "Running database setup script..." -ForegroundColor Cyan
Write-Host ""

# Run the script with the provided arguments
$arguments = $args -join " "
$command = "python setup_database.py --env-file ../../.env.appwrite $arguments"
Write-Host "Executing: $command" -ForegroundColor Gray
Invoke-Expression $command

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "Setup completed successfully." -ForegroundColor Green
} else {
    Write-Host "Setup failed with error code $LASTEXITCODE." -ForegroundColor Red
}