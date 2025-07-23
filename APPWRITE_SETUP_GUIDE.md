# Appwrite Database Setup Guide

This guide explains how to set up the Appwrite database for the project using the automated setup script.

## Prerequisites

- Python 3.7+
- Appwrite account with a project created
- API key with appropriate permissions

## Step 1: Configure Environment Variables

1. Copy the `.env.appwrite` file to the root directory of the project.
2. Update the following variables in the file:
   - `APPWRITE_PROJECT_ID`: Your Appwrite project ID
   - `APPWRITE_API_KEY`: Your Appwrite API key with appropriate permissions
   - `APPWRITE_DATABASE_ID`: Your Appwrite database ID

## Step 2: Run the Setup Script

### Windows (CMD)

```
cd scripts/appwrite_setup
run_setup.bat
```

### Windows (PowerShell)

```
cd scripts/appwrite_setup
.\run_setup.ps1
```

### Unix-based Systems (Linux/macOS)

```bash
cd scripts/appwrite_setup
chmod +x run_setup.sh
./run_setup.sh
```

### Options

You can add the following options to the script:

- `--verbose`: Enable verbose output
- `--quiet`: Suppress all output except errors
- `--dry-run`: Show what would be created without making changes

Example:

```bash
./run_setup.sh --dry-run --verbose
```

## Step 3: Verify the Setup

After running the script, verify that the following resources have been created in your Appwrite project:

1. Collections:
   - Users
   - Stories
   - Admin Logs
   - Error Logs
   - Analytics

2. Storage Buckets:
   - storytelling-images

## Troubleshooting

If you encounter any issues:

1. Check that your API key has the necessary permissions
2. Run the script with the `--verbose` option for more detailed output
3. Check the Appwrite console for any additional error information

For more detailed information, refer to the [README](scripts/appwrite_setup/README.md) in the `scripts/appwrite_setup` directory.