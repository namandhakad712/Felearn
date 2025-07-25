# Appwrite Functions

This directory contains server-side functions for the AI Storytelling Platform.

## Functions Overview

### 1. Export Function (`export-story`)
- **Purpose**: Generate PDF and JSON exports of stories
- **Runtime**: Node.js 18
- **Trigger**: HTTP request
- **Permissions**: Authenticated users only

### 2. Analytics Function (`analytics`)
- **Purpose**: Process and aggregate analytics data
- **Runtime**: Node.js 18
- **Trigger**: Scheduled (daily)
- **Permissions**: System only

### 3. Cleanup Function (`cleanup`)
- **Purpose**: Clean up expired data and temporary files
- **Runtime**: Node.js 18
- **Trigger**: Scheduled (weekly)
- **Permissions**: System only

## Development

### Local Development
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Initialize functions
appwrite init function

# Deploy function
appwrite deploy function
```

### Function Structure
```
functions/
├── export-story/
│   ├── src/
│   │   └── main.js
│   ├── package.json
│   └── .env.example
├── analytics/
│   ├── src/
│   │   └── main.js
│   ├── package.json
│   └── .env.example
└── cleanup/
    ├── src/
    │   └── main.js
    ├── package.json
    └── .env.example
```

## Deployment

Functions are automatically deployed via GitHub Actions when changes are pushed to the main branch.

### Manual Deployment
```bash
# Deploy all functions
npm run deploy:functions

# Deploy specific function
appwrite deploy function --functionId export-story
```

## Environment Variables

Each function has its own environment variables configured in the Appwrite console:

- `APPWRITE_FUNCTION_ENDPOINT`
- `APPWRITE_FUNCTION_API_KEY`
- `APPWRITE_FUNCTION_PROJECT_ID`
- Custom variables per function

## Monitoring

Functions are monitored through:
- Appwrite Console logs
- Custom error reporting
- Performance metrics
- Execution statistics