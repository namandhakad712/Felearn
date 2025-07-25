#!/bin/bash

echo "Appwrite Database Setup Script"
echo "============================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed or not in PATH."
    echo "Please install Python and try again."
    exit 1
fi

# Check if required packages are installed
if ! python3 -c "import appwrite" &> /dev/null; then
    echo "Installing required packages..."
    pip3 install appwrite python-dotenv
fi

echo "Running database setup script..."
echo ""

# Run the script with the provided arguments
python3 setup_database.py --env-file ../../.env.appwrite "$@"

if [ $? -eq 0 ]; then
    echo ""
    echo "Setup completed successfully."
else
    echo ""
    echo "Setup failed with error code $?."
fi