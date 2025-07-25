# Appwrite Database Setup Guide

This guide will help you set up your Appwrite database structure for the Felearn project.

## Database Configuration

**Database ID**: `687a8ae6003b5969331a`
**Database Name**: `users`

## Collections Setup

### 1. Users Collection

**Collection ID**: `users`
**Display Name**: `Users` (rename from "user-keys")

**Required Attributes**:
- `email` (string, size: 255, required: true)
- `geminiKey` (string, size: 1000, required: false)
- `settings` (string, size: 2000, required: false) - Stores JSON string of user settings
- `isAdmin` (boolean, required: false, default: false)
- `createdAt` (datetime, required: true)
- `lastLogin` (datetime, required: false)
- `name` (string, size: 255, required: false)
- `bio` (string, size: 1000, required: false)
- `oauthProvider` (string, size: 255, required: false)
- `emailVerification` (boolean, required: false)
- `disabled` (boolean, required: false)

**Indexes**:
- `email_index` (unique, attributes: ["email"])
- `created_at_index` (key, attributes: ["createdAt"])

**Permissions**:
- Read: `read("users")`
- Write: `write("users")`
- Document Security: Enabled

### 2. Stories Collection

**Collection ID**: `stories`
**Display Name**: `Stories`

**Required Attributes**:
- `userId` (string, size: 255, required: true)
- `title` (string, size: 500, required: true)
- `content` (string, size: 10000, required: true)
- `images` (string, size: 2000, required: false) - Stores JSON string of image URLs
- `isPinned` (boolean, required: false, default: false)
- `createdAt` (datetime, required: true)
- `tags` (string, size: 1000, required: false) - Stores JSON string of tags

**Indexes**:
- `user_stories_index` (key, attributes: ["userId", "createdAt"])
- `created_at_index` (key, attributes: ["createdAt"])

**Permissions**:
- Read: `read("users")`
- Write: `write("users")`
- Document Security: Enabled

### 3. Admin Logs Collection

**Collection ID**: `admin_logs`
**Display Name**: `Admin Logs`

**Required Attributes**:
- `action` (string, size: 255, required: true)
- `adminId` (string, size: 255, required: true)
- `details` (string, size: 5000, required: false) - Stores JSON string of log details
- `timestamp` (datetime, required: true)

**Indexes**:
- `timestamp_index` (key, attributes: ["timestamp"])

**Permissions**:
- Read: `read("admins")`
- Write: `write("admins")`
- Document Security: Disabled

### 4. Error Logs Collection

**Collection ID**: `error_logs`
**Display Name**: `Error Logs`

**Required Attributes**:
- `type` (string, size: 50, required: true) - Values: 'frontend', 'backend', 'api'
- `message` (string, size: 1000, required: true)
- `stack` (string, size: 5000, required: false)
- `userId` (string, size: 255, required: false)
- `context` (string, size: 2000, required: false) - Stores JSON string of error context
- `severity` (string, size: 20, required: true) - Values: 'low', 'medium', 'high', 'critical'
- `resolved` (boolean, required: false, default: false)
- `timestamp` (datetime, required: true)

**Indexes**:
- `timestamp_index` (key, attributes: ["timestamp"])
- `severity_index` (key, attributes: ["severity"])

**Permissions**:
- Read: `read("admins")`
- Write: `write("users")`
- Document Security: Disabled

### 5. Analytics Collection

**Collection ID**: `analytics`
**Display Name**: `Analytics`

**Required Attributes**:
- `eventId` (string, size: 255, required: true)
- `userId` (string, size: 255, required: false)
- `eventType` (string, size: 100, required: true) - e.g., 'view', 'like', 'share'
- `resourceId` (string, size: 255, required: false) - ID of the related resource
- `resourceType` (string, size: 100, required: false) - Type of the related resource
- `timestamp` (datetime, required: true)
- `metadata` (string, size: 2000, required: false) - JSON string of additional data

**Indexes**:
- `timestamp_index` (key, attributes: ["timestamp"])
- `user_events_index` (key, attributes: ["userId", "timestamp"])
- `event_type_index` (key, attributes: ["eventType"])

**Permissions**:
- Read: `read("admins")`
- Write: `write("users")`
- Document Security: Disabled

## Storage Bucket

**Bucket ID**: `storytelling-images`
**Name**: `Storytelling Images`

**Configuration**:
- Maximum file size: 10MB
- Allowed extensions: jpg, jpeg, png, gif, webp
- Compression: gzip
- Encryption: enabled
- Antivirus: enabled

**Permissions**:
- Read: `read("users")`
- Write: `write("users")`
- File Security: Enabled

## Environment Variables

Update your `.env.local` file with:

```
# API Keys
VITE_GEMINI_API_KEY=your-gemini-api-key

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=felearn
VITE_APPWRITE_DATABASE_ID=687a8ae6003b5969331a
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_STORIES_COLLECTION_ID=stories
VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID=admin_logs
VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID=error_logs

# Feature Flags
VITE_ENABLE_IMAGE_GENERATION=true
```

## Authentication Setup

1. Go to the Appwrite Console: https://fra.cloud.appwrite.io/console/project-felearn/auth/providers
2. Enable Email/Password authentication
3. Configure OAuth providers (Google and GitHub) if needed

## API Keys

For development, create:
1. A Dev Key with appropriate permissions for local development
2. An API Key with appropriate permissions for production

## Next Steps

After setting up your database structure:

1. Update your `.env.local` file with the correct values
2. Update the `appwrite.config.ts` file with the correct collection IDs
3. Test your authentication flow
4. Verify that all collections are working correctly

## Troubleshooting

If you encounter any issues:

1. Check that all collections have the correct attributes and indexes
2. Verify that your API keys have the necessary permissions
3. Check that your environment variables are correctly set
4. Look for any errors in the Appwrite console logs