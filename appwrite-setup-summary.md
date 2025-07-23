# Appwrite Setup Summary

Based on the analysis of your code and database requirements, here's what you need to do to properly set up your Appwrite project:

## 1. API Key Permissions

Your current API key doesn't have sufficient permissions. You need to create a new API key with the following permissions:

- `databases.read`
- `databases.write`
- `collections.read`
- `collections.write`
- `documents.read`
- `documents.write`
- `attributes.read`
- `attributes.write`
- `indexes.read`
- `indexes.write`
- `users.read` (if you're using Appwrite authentication)

## 2. Database Structure

Follow the detailed instructions in the `appwrite-database-setup-guide.md` file to set up your database structure manually through the Appwrite console.

## 3. Environment Variables

Make sure your `.env.local` file contains all the necessary variables:

```
VITE_APPWRITE_DATABASE_ID=687a8ae6003b5969331a
VITE_APPWRITE_USERS_COLLECTION_ID=users
VITE_APPWRITE_STORIES_COLLECTION_ID=stories
VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID=admin_logs
VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID=error_logs
```

## 4. Collection Attributes

Here's a summary of the required attributes for each collection:

### Users Collection
- `email` (string)
- `geminiKey` (string)
- `settings` (string - JSON)
- `isAdmin` (boolean)
- `createdAt` (datetime)
- `lastLogin` (datetime)
- `name` (string)
- `bio` (string)
- `oauthProvider` (string)
- `emailVerification` (boolean)
- `disabled` (boolean)

### Stories Collection
- `userId` (string)
- `title` (string)
- `content` (string)
- `images` (string - JSON array)
- `isPinned` (boolean)
- `createdAt` (datetime)
- `tags` (string - JSON array)

### Admin Logs Collection
- `action` (string)
- `adminId` (string)
- `details` (string - JSON)
- `timestamp` (datetime)

### Error Logs Collection
- `type` (string - 'frontend', 'backend', 'api')
- `message` (string)
- `stack` (string)
- `userId` (string)
- `context` (string - JSON)
- `severity` (string - 'low', 'medium', 'high', 'critical')
- `resolved` (boolean)
- `timestamp` (datetime)

### Analytics Collection
- `eventId` (string)
- `userId` (string)
- `eventType` (string)
- `resourceId` (string)
- `resourceType` (string)
- `timestamp` (datetime)
- `metadata` (string - JSON)

## 5. Authentication Setup

Configure authentication methods in the Appwrite console:
- Email/Password authentication
- OAuth providers (Google, GitHub)

## 6. Storage Bucket

Create a storage bucket for story images:
- Bucket ID: `storytelling-images`
- Name: `Storytelling Images`
- File size limit: 10MB
- Allowed extensions: jpg, jpeg, png, gif, webp

## Next Steps

1. Follow the detailed setup guide in `appwrite-database-setup-guide.md`
2. Create a new API key with proper permissions
3. Update your environment variables
4. Test your application to ensure everything is working correctly

If you encounter any issues, refer to the troubleshooting section in the setup guide.