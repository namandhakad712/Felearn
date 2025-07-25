# Appwrite Functions Deployment Guide

This guide covers deploying server-side functions for the AI Storytelling Platform.

## Prerequisites

1. **Appwrite CLI**: Install the Appwrite CLI
2. **Appwrite Account**: Access to your Appwrite project
3. **API Key**: Server API key with appropriate permissions
4. **Node.js**: Version 18 or higher

## Installation

### Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### Login to Appwrite

```bash
appwrite login
```

### Initialize Project

```bash
appwrite init project
```

## Functions Overview

### 1. Export Story Function
- **ID**: `export-story`
- **Purpose**: Generate PDF and JSON exports of stories
- **Runtime**: Node.js 18
- **Trigger**: HTTP request
- **Timeout**: 30 seconds

### 2. Analytics Function
- **ID**: `analytics`
- **Purpose**: Process and aggregate analytics data
- **Runtime**: Node.js 18
- **Trigger**: Scheduled (daily at 2 AM)
- **Timeout**: 5 minutes

### 3. Cleanup Function
- **ID**: `cleanup`
- **Purpose**: Clean up expired data and temporary files
- **Runtime**: Node.js 18
- **Trigger**: Scheduled (weekly on Sunday at 3 AM)
- **Timeout**: 10 minutes

## Deployment Methods

### Automated Deployment

Use the deployment script to deploy all functions:

```bash
# Deploy all functions
npm run deploy:functions

# Or run the script directly
node scripts/deploy-functions.js
```

### Manual Deployment

Deploy individual functions using the Appwrite CLI:

```bash
# Create function
appwrite functions create \
  --functionId export-story \
  --name "Export Story" \
  --runtime node-18.0 \
  --execute '["users"]' \
  --entrypoint src/main.js \
  --timeout 30

# Deploy code
appwrite functions createDeployment \
  --functionId export-story \
  --entrypoint src/main.js \
  --code functions/export-story
```

### Using Configuration File

Deploy using the `appwrite.json` configuration:

```bash
# Deploy all resources defined in appwrite.json
appwrite deploy
```

## Environment Variables

### Function-Level Variables

Set environment variables for each function in the Appwrite console:

#### Export Story Function
```bash
APPWRITE_FUNCTION_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your-project-id
APPWRITE_FUNCTION_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_STORIES_COLLECTION_ID=stories
NODE_ENV=production
```

#### Analytics Function
```bash
APPWRITE_FUNCTION_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your-project-id
APPWRITE_FUNCTION_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_USERS_COLLECTION_ID=users
APPWRITE_STORIES_COLLECTION_ID=stories
APPWRITE_ANALYTICS_COLLECTION_ID=analytics
NODE_ENV=production
```

#### Cleanup Function
```bash
APPWRITE_FUNCTION_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_FUNCTION_PROJECT_ID=your-project-id
APPWRITE_FUNCTION_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_ERROR_LOGS_COLLECTION_ID=error_logs
APPWRITE_ADMIN_LOGS_COLLECTION_ID=admin_logs
APPWRITE_ANALYTICS_COLLECTION_ID=analytics
APPWRITE_STORAGE_BUCKET_ID=storytelling-images
NODE_ENV=production
```

## Permissions and Security

### API Key Permissions

Create a server API key with the following scopes:

- `databases.read`
- `databases.write`
- `files.read`
- `files.write`
- `functions.read`
- `functions.write`

### Function Execution Permissions

Functions are configured with appropriate execution permissions:

- **Export Story**: `["users"]` - Authenticated users only
- **Analytics**: `["users"]` - System execution
- **Cleanup**: `["users"]` - System execution

## Scheduling

### Cron Expressions

Functions use standard cron expressions for scheduling:

- **Analytics**: `0 2 * * *` (Daily at 2:00 AM)
- **Cleanup**: `0 3 * * 0` (Weekly on Sunday at 3:00 AM)

### Timezone

All schedules use UTC timezone. Adjust accordingly for your local timezone.

## Monitoring and Logging

### Function Logs

View function logs in the Appwrite console:

1. Go to Functions section
2. Select the function
3. Click on "Logs" tab

### Error Handling

Functions include comprehensive error handling:

- Structured error responses
- Detailed logging
- Graceful failure handling
- Development vs production error details

### Performance Monitoring

Monitor function performance:

- Execution time
- Memory usage
- Success/failure rates
- Invocation frequency

## Testing

### Local Testing

Test functions locally before deployment:

```bash
cd functions/export-story
npm install
node src/main.js
```

### Integration Testing

Test deployed functions:

```bash
# Test export function
curl -X POST https://cloud.appwrite.io/v1/functions/export-story/executions \
  -H "X-Appwrite-Project: your-project-id" \
  -H "X-Appwrite-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"storyId": "story-id", "format": "pdf", "userId": "user-id"}'
```

## Troubleshooting

### Common Issues

1. **Function Not Found**
   - Verify function ID matches deployment
   - Check function is enabled
   - Ensure proper permissions

2. **Timeout Errors**
   - Increase function timeout
   - Optimize function code
   - Check for infinite loops

3. **Permission Denied**
   - Verify API key permissions
   - Check function execution permissions
   - Ensure user authentication

4. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure values are correct

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

### Log Analysis

Common log patterns to look for:

- `Starting [function] process...` - Function initialization
- `[Function] completed successfully` - Successful execution
- `[Function] error:` - Error conditions
- `Processing [count] items` - Batch processing status

## Versioning and Rollback

### Function Versions

Appwrite maintains function deployment history:

1. View deployment history in console
2. Activate previous deployment if needed
3. Compare deployment differences

### Rollback Procedure

To rollback a function:

1. Go to Functions > [Function Name] > Deployments
2. Find the previous working deployment
3. Click "Activate" on the desired version

## CI/CD Integration

Functions are automatically deployed via GitHub Actions when:

- Changes are pushed to the main branch
- Function code is modified
- Configuration is updated

See `.github/workflows/deploy-functions.yml` for CI/CD configuration.

## Best Practices

### Code Organization

- Keep functions focused and single-purpose
- Use proper error handling
- Include comprehensive logging
- Follow Node.js best practices

### Performance

- Minimize cold start time
- Use efficient algorithms
- Implement proper caching
- Monitor memory usage

### Security

- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Follow principle of least privilege

### Maintenance

- Regular dependency updates
- Monitor function performance
- Clean up unused functions
- Document function changes