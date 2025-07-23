# Appwrite Database Setup Script

This script automates the setup of an Appwrite database with specific collections, attributes, and indexes as defined in the requirements. It uses the Appwrite Python Server SDK to create the database structure programmatically.

## Prerequisites

- Python 3.7+
- Appwrite Server SDK
- python-dotenv (optional, for loading environment variables from a file)

## Installation

1. Install the required dependencies:

```bash
pip install appwrite python-dotenv
```

## Configuration

Create a `.env.appwrite` file in the root directory of the project with the following content:

```
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id

# Collections
APPWRITE_USERS_COLLECTION_ID=users
APPWRITE_STORIES_COLLECTION_ID=stories
APPWRITE_ADMIN_LOGS_COLLECTION_ID=admin_logs
APPWRITE_ERROR_LOGS_COLLECTION_ID=error_logs
APPWRITE_ANALYTICS_COLLECTION_ID=analytics

# Storage
APPWRITE_IMAGES_BUCKET_ID=storytelling-images
```

Replace `your_project_id`, `your_api_key`, and `your_database_id` with your actual Appwrite project details.

## Usage

### Using the Helper Scripts

#### Windows (CMD)

```
cd scripts/appwrite_setup
run_setup.bat [options]
```

#### Windows (PowerShell)

```
cd scripts/appwrite_setup
.\run_setup.ps1 [options]
```

### Running the Script Directly

```bash
python scripts/appwrite_setup/setup_database.py --env-file .env.appwrite [options]
```

### Command Line Options

- `--env-file PATH`: Path to a .env file containing configuration (default: .env.appwrite)
- `--verbose`: Enable verbose output
- `--quiet`: Suppress all output except errors
- `--dry-run`: Show what would be created without making changes

### Examples

Run with verbose output:

```bash
python scripts/appwrite_setup/setup_database.py --env-file .env.appwrite --verbose
```

Run in dry run mode to preview changes:

```bash
python scripts/appwrite_setup/setup_database.py --env-file .env.appwrite --dry-run
```

## Created Resources

The script creates the following resources:

### Collections

1. **Users Collection**
   - ID: users
   - Attributes: email, geminiKey, settings, isAdmin, createdAt, lastLogin, name, bio, oauthProvider, emailVerification, disabled
   - Indexes: email_index, created_at_index

2. **Stories Collection**
   - ID: stories
   - Attributes: userId, title, content, images, isPinned, createdAt, tags
   - Indexes: user_stories_index, created_at_index

3. **Admin Logs Collection**
   - ID: admin_logs
   - Attributes: action, adminId, details, timestamp
   - Indexes: timestamp_index

4. **Error Logs Collection**
   - ID: error_logs
   - Attributes: type, message, stack, userId, context, severity, resolved, timestamp
   - Indexes: timestamp_index, severity_index

5. **Analytics Collection**
   - ID: analytics
   - Attributes: eventId, userId, eventType, resourceId, resourceType, timestamp, metadata
   - Indexes: timestamp_index, user_events_index, event_type_index

### Storage Buckets

1. **Storytelling Images Bucket**
   - ID: storytelling-images
   - Configuration:
     - Maximum file size: 10MB
     - Allowed extensions: jpg, jpeg, png, gif, webp
     - Compression: gzip
     - Encryption: enabled
     - Antivirus: enabled

## API Key Permissions

The API key used for this script needs the following permissions:

- `databases.read`
- `databases.write`
- `collections.read`
- `collections.write`
- `attributes.read`
- `attributes.write`
- `indexes.read`
- `indexes.write`
- `buckets.read`
- `buckets.write`

## Troubleshooting

If you encounter issues:

1. Ensure your API key has the necessary permissions
2. Check that your environment variables are set correctly
3. Run with `--verbose` for more detailed output
4. Check the Appwrite console for any additional error information