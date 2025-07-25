# Using Appwrite Dev Keys in Your Project

## What are Dev Keys?

Dev keys are special authentication tokens used by Appwrite Client SDKs to avoid abuse limits in testing environments. They provide several benefits:

- **Bypass Rate Limits**: Avoid hitting API rate limits during development and testing
- **Bypass CORS Restrictions**: Avoid cross-origin resource sharing issues
- **Configurable Expiration**: Choose from 1-day, 7-day, or 30-day expiration periods

## When to Use Dev Keys

Dev keys should **ONLY** be used in:
- Local development environments
- Testing environments
- CI/CD pipelines for automated testing

**NEVER** use Dev keys in:
- Production environments
- Public-facing applications
- Client-side code that will be deployed to production

## How to Create a Dev Key

1. Navigate to the Appwrite Console: https://fra.cloud.appwrite.io/console/project-felearn
2. Go to **Overview > Integrations > Dev keys**
3. Click **Create Dev key**
4. Set a name for your key (e.g., "Local Development")
5. Choose an expiration period (1, 7, or 30 days)
6. Click **Create**

## How to Use Dev Keys in Your Code

### JavaScript/TypeScript

```javascript
import { Client } from "appwrite";

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('felearn')
    .setDevKey('YOUR_DEV_KEY'); // Add your Dev key here
```

### React with Environment Variables

```javascript
import { Client } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT);

// Only use Dev key in development
if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_APPWRITE_DEV_KEY) {
    client.setDevKey(process.env.REACT_APP_APPWRITE_DEV_KEY);
}
```

### Using with Our Config File

```typescript
import { Client } from "appwrite";
import { appwriteConfig } from './appwrite.config';

const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.project);

// Add Dev key for development environments
if (process.env.NODE_ENV !== 'production' && appwriteConfig.devKey) {
    client.setDevKey(appwriteConfig.devKey);
}
```

## Best Practices for Managing Dev Keys

1. **Never commit Dev keys to version control**:
   - Store them in `.env` files that are gitignored
   - Use environment variables in CI/CD pipelines

2. **Rotate keys regularly**:
   - Create new keys before old ones expire
   - Delete unused keys

3. **Use different keys for different environments**:
   - One for local development
   - One for CI/CD pipelines
   - One for staging environments

4. **Monitor key usage**:
   - Check the Appwrite console for usage statistics
   - Look for unusual patterns that might indicate misuse

## Example Environment Setup

Create a `.env.local` file (add to .gitignore):

```
REACT_APP_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
REACT_APP_APPWRITE_PROJECT=felearn
REACT_APP_APPWRITE_DEV_KEY=your-dev-key-here
```

## Replacing Dev Keys

When your Dev key is about to expire:

1. Create a new Dev key in the Appwrite Console
2. Update your environment variables or configuration files
3. Test that everything works with the new key
4. Delete the old key once you've confirmed the new one works

## Security Considerations

Remember that Dev keys bypass security measures that are in place to protect your application. Always ensure:

1. Dev keys are never exposed to end users
2. Production builds never include Dev keys
3. Dev keys have the minimum necessary permissions
4. Dev keys are rotated regularly

By following these guidelines, you can safely use Dev keys to improve your development experience without compromising security.