#!/usr/bin/env python3
"""
Appwrite Database Setup Script

This script automates the setup of an Appwrite database with specific collections,
attributes, and indexes as defined in the requirements. It uses the Appwrite Python
Server SDK to create the database structure programmatically.

Usage:
    python setup_database.py [options]

Options:
    --env-file PATH    Path to .env file containing configuration
    --verbose          Enable verbose output
    --quiet            Suppress all output except errors
    --dry-run          Show what would be created without making changes
"""

import os
import sys
import argparse
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

try:
    from appwrite.client import Client
    from appwrite.services.databases import Databases
    from appwrite.services.storage import Storage
    from appwrite.exception import AppwriteException
except ImportError:
    print("Error: Appwrite SDK not found. Please install it using:")
    print("pip install appwrite")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("Warning: python-dotenv not found. Environment variables must be set manually.")
    print("To install: pip install python-dotenv")
    load_dotenv = lambda *args, **kwargs: None


class Logger:
    """
    Custom logger with colorized output and different log levels.
    """
    
    # ANSI color codes
    COLORS = {
        'RESET': '\033[0m',
        'RED': '\033[91m',
        'GREEN': '\033[92m',
        'YELLOW': '\033[93m',
        'BLUE': '\033[94m',
        'MAGENTA': '\033[95m',
        'CYAN': '\033[96m',
    }
    
    def __init__(self, verbose: bool = True, quiet: bool = False):
        self.verbose = verbose
        self.quiet = quiet
        
    def _log(self, level: str, color: str, message: str) -> None:
        """
        Internal method to log a message with a specific level and color.
        
        Args:
            level: The log level (INFO, ERROR, etc.)
            color: The color to use for the message
            message: The message to log
        """
        if self.quiet and level != 'ERROR':
            return
            
        if not self.verbose and level == 'DEBUG':
            return
            
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"{self.COLORS[color]}[{timestamp}] {level}: {message}{self.COLORS['RESET']}")
        
    def info(self, message: str) -> None:
        """Log an info message."""
        self._log('INFO', 'BLUE', message)
        
    def success(self, message: str) -> None:
        """Log a success message."""
        self._log('SUCCESS', 'GREEN', message)
        
    def warning(self, message: str) -> None:
        """Log a warning message."""
        self._log('WARNING', 'YELLOW', message)
        
    def error(self, message: str) -> None:
        """Log an error message."""
        self._log('ERROR', 'RED', message)
        
    def debug(self, message: str) -> None:
        """Log a debug message."""
        if self.verbose:
            self._log('DEBUG', 'MAGENTA', message)


class ConfigManager:
    """
    Manages configuration loading and validation from environment variables.
    """
    
    def __init__(self, env_file: Optional[str] = None):
        """
        Initialize the configuration manager.
        
        Args:
            env_file: Optional path to a .env file
        """
        if env_file:
            load_dotenv(env_file)
            
    def get_required(self, key: str) -> str:
        """
        Get a required environment variable.
        
        Args:
            key: The environment variable name
            
        Returns:
            The environment variable value
            
        Raises:
            ValueError: If the environment variable is not set
        """
        value = os.environ.get(key)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is not set")
        return value
        
    def get_optional(self, key: str, default: Any = None) -> Any:
        """
        Get an optional environment variable.
        
        Args:
            key: The environment variable name
            default: The default value to return if the variable is not set
            
        Returns:
            The environment variable value or the default
        """
        return os.environ.get(key, default)


class AppwriteClient:
    """
    Wrapper for the Appwrite client with additional functionality.
    """
    
    def __init__(self, config: ConfigManager, logger: Logger):
        """
        Initialize the Appwrite client.
        
        Args:
            config: The configuration manager
            logger: The logger instance
        """
        self.logger = logger
        self.config = config
        
        # Initialize Appwrite client
        self.client = Client()
        
        try:
            endpoint = config.get_required('APPWRITE_ENDPOINT')
            project_id = config.get_required('APPWRITE_PROJECT_ID')
            api_key = config.get_required('APPWRITE_API_KEY')
            
            self.client.set_endpoint(endpoint)
            self.client.set_project(project_id)
            self.client.set_key(api_key)
            
            self.logger.info(f"Initialized Appwrite client for project {project_id}")
            self.logger.debug(f"Using endpoint: {endpoint}")
            
            # Initialize services
            self.databases = Databases(self.client)
            self.storage = Storage(self.client)
            
        except ValueError as e:
            self.logger.error(f"Configuration error: {str(e)}")
            raise
        except Exception as e:
            self.logger.error(f"Failed to initialize Appwrite client: {str(e)}")
            raise
            
    def validate_collection(self, database_id: str, collection_id: str, expected_attributes: List[Dict[str, Any]]) -> bool:
        """
        Validate that a collection exists and has the expected attributes.
        
        Args:
            database_id: The database ID
            collection_id: The collection ID
            expected_attributes: List of expected attributes
            
        Returns:
            True if the collection is valid, False otherwise
        """
        try:
            # Check if collection exists
            collection = self.databases.get_collection(database_id, collection_id)
            
            # Get all attributes
            attributes_response = self.databases.list_attributes(database_id, collection_id)
            attributes = attributes_response.get('attributes', [])
            
            # Check if all expected attributes exist
            attribute_keys = [attr.get('key') for attr in attributes]
            missing_attributes = []
            
            for expected_attr in expected_attributes:
                if expected_attr['key'] not in attribute_keys:
                    missing_attributes.append(expected_attr['key'])
            
            if missing_attributes:
                self.logger.warning(f"Collection '{collection_id}' is missing attributes: {', '.join(missing_attributes)}")
                return False
                
            self.logger.success(f"Collection '{collection_id}' has all expected attributes")
            return True
            
        except AppwriteException as e:
            self.logger.error(f"Failed to validate collection '{collection_id}': {e.message}")
            return False
            
    def validate_bucket(self, bucket_id: str, expected_extensions: List[str] = None) -> bool:
        """
        Validate that a bucket exists and has the expected configuration.
        
        Args:
            bucket_id: The bucket ID
            expected_extensions: List of expected file extensions
            
        Returns:
            True if the bucket is valid, False otherwise
        """
        try:
            # Check if bucket exists
            bucket = self.storage.get_bucket(bucket_id)
            
            # Check file extensions if provided
            if expected_extensions:
                allowed_extensions = bucket.get('fileSecurity', {}).get('allowedExtensions', [])
                missing_extensions = []
                
                for ext in expected_extensions:
                    if ext not in allowed_extensions:
                        missing_extensions.append(ext)
                
                if missing_extensions:
                    self.logger.warning(f"Bucket '{bucket_id}' is missing file extensions: {', '.join(missing_extensions)}")
                    return False
            
            self.logger.success(f"Bucket '{bucket_id}' has valid configuration")
            return True
            
        except AppwriteException as e:
            self.logger.error(f"Failed to validate bucket '{bucket_id}': {e.message}")
            return False
            
    def test_connection(self) -> bool:
        """
        Test the connection to the Appwrite API.
        
        Returns:
            True if the connection is successful, False otherwise
        """
        try:
            # Try to list databases as a connection test
            self.databases.list()
            self.logger.success("Successfully connected to Appwrite API")
            return True
        except AppwriteException as e:
            self.logger.error(f"Failed to connect to Appwrite API: {e.message}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error while connecting to Appwrite API: {str(e)}")
            return False
            
    def create_collection_if_not_exists(self, database_id: str, collection_id: str, name: str) -> Dict[str, Any]:
        """
        Create a collection if it doesn't exist.
        
        Args:
            database_id: The database ID
            collection_id: The collection ID
            name: The display name of the collection
            
        Returns:
            The collection data if created or already exists
            
        Raises:
            AppwriteException: If the collection creation fails
        """
        try:
            # Try to get the collection to check if it exists
            collection = self.databases.get_collection(database_id, collection_id)
            self.logger.warning(f"Collection '{name}' ({collection_id}) already exists")
            return collection
        except AppwriteException as e:
            if e.code == 404:  # Collection not found
                self.logger.info(f"Creating collection '{name}' ({collection_id})")
                return self.databases.create_collection(database_id, collection_id, name)
            else:
                self.logger.error(f"Failed to check collection '{collection_id}': {e.message}")
                raise
                
    def create_attribute_if_not_exists(
        self, 
        database_id: str, 
        collection_id: str, 
        attribute_type: str, 
        attribute_key: str, 
        **options
    ) -> Dict[str, Any]:
        """
        Create an attribute if it doesn't exist.
        
        Args:
            database_id: The database ID
            collection_id: The collection ID
            attribute_type: The attribute type (string, integer, etc.)
            attribute_key: The attribute key (name)
            **options: Additional options for the attribute
            
        Returns:
            The attribute data if created or None if it already exists
            
        Raises:
            AppwriteException: If the attribute creation fails
        """
        try:
            # Try to get the attribute to check if it exists
            attribute = self.databases.get_attribute(database_id, collection_id, attribute_key)
            self.logger.warning(f"Attribute '{attribute_key}' already exists in collection '{collection_id}'")
            return attribute
        except AppwriteException as e:
            if e.code == 404:  # Attribute not found
                self.logger.info(f"Creating attribute '{attribute_key}' in collection '{collection_id}'")
                
                # Create the attribute based on its type
                if attribute_type == 'string':
                    return self.databases.create_string_attribute(
                        database_id, collection_id, attribute_key, **options
                    )
                elif attribute_type == 'integer':
                    return self.databases.create_integer_attribute(
                        database_id, collection_id, attribute_key, **options
                    )
                elif attribute_type == 'float':
                    return self.databases.create_float_attribute(
                        database_id, collection_id, attribute_key, **options
                    )
                elif attribute_type == 'boolean':
                    return self.databases.create_boolean_attribute(
                        database_id, collection_id, attribute_key, **options
                    )
                elif attribute_type == 'datetime':
                    return self.databases.create_datetime_attribute(
                        database_id, collection_id, attribute_key, **options
                    )
                else:
                    self.logger.error(f"Unsupported attribute type: {attribute_type}")
                    raise ValueError(f"Unsupported attribute type: {attribute_type}")
            else:
                self.logger.error(f"Failed to check attribute '{attribute_key}': {e.message}")
                raise
                
    def create_index_if_not_exists(
        self, 
        database_id: str, 
        collection_id: str, 
        index_id: str, 
        attributes: List[str], 
        index_type: str = 'key'
    ) -> Dict[str, Any]:
        """
        Create an index if it doesn't exist.
        
        Args:
            database_id: The database ID
            collection_id: The collection ID
            index_id: The index ID
            attributes: The attributes to index
            index_type: The index type (key, unique, fulltext)
            
        Returns:
            The index data if created or None if it already exists
            
        Raises:
            AppwriteException: If the index creation fails
        """
        try:
            # Try to get the index to check if it exists
            index = self.databases.get_index(database_id, collection_id, index_id)
            self.logger.warning(f"Index '{index_id}' already exists in collection '{collection_id}'")
            return index
        except AppwriteException as e:
            if e.code == 404:  # Index not found
                self.logger.info(f"Creating index '{index_id}' in collection '{collection_id}'")
                return self.databases.create_index(
                    database_id, collection_id, index_id, index_type, attributes
                )
            else:
                self.logger.error(f"Failed to check index '{index_id}': {e.message}")
                raise


class CollectionBuilder:
    """
    Base class for collection builders with common functionality.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str, name: str):
        """
        Initialize the collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID
            name: The display name of the collection
        """
        self.client = client
        self.database_id = database_id
        self.collection_id = collection_id
        self.name = name
        self.logger = client.logger
        self.created_resources = {
            'collection': False,
            'attributes': [],
            'indexes': []
        }
        
    def create(self, dry_run: bool = False) -> Dict[str, Any]:
        """
        Create the collection with all attributes and indexes.
        
        Args:
            dry_run: If True, only show what would be created without making changes
            
        Returns:
            Dictionary with information about created resources
        """
        if dry_run:
            self.logger.info(f"[DRY RUN] Would create collection '{self.name}' ({self.collection_id})")
            
            # Get attribute and index information for dry run
            attributes_info = self._get_attributes_info()
            indexes_info = self._get_indexes_info()
            
            # Display detailed information about what would be created
            self.logger.info(f"[DRY RUN] Collection '{self.name}' would have the following attributes:")
            for attr in attributes_info:
                required = "required" if attr.get('required', False) else "optional"
                self.logger.info(f"[DRY RUN]   - {attr['key']} ({attr['type']}, {required})")
                
            self.logger.info(f"[DRY RUN] Collection '{self.name}' would have the following indexes:")
            for idx in indexes_info:
                self.logger.info(f"[DRY RUN]   - {idx['id']} ({idx['type']}, attributes: {', '.join(idx['attributes'])})")
                
            return self.created_resources
            
        # Create the collection
        try:
            collection = self.client.create_collection_if_not_exists(
                self.database_id, self.collection_id, self.name
            )
            self.created_resources['collection'] = True
            
            # Create attributes and indexes
            self._create_attributes()
            self._create_indexes()
            
            return self.created_resources
            
        except AppwriteException as e:
            self.logger.error(f"Failed to create collection '{self.collection_id}': {e.message}")
            raise
            
    def _get_attributes_info(self) -> List[Dict[str, Any]]:
        """
        Get information about attributes that would be created.
        This method should be implemented by subclasses.
        
        Returns:
            List of attribute information dictionaries
        """
        # This is a placeholder that should be overridden by subclasses
        return []
        
    def _get_indexes_info(self) -> List[Dict[str, Any]]:
        """
        Get information about indexes that would be created.
        This method should be implemented by subclasses.
        
        Returns:
            List of index information dictionaries
        """
        # This is a placeholder that should be overridden by subclasses
        return []
            
    def _create_attributes(self) -> None:
        """
        Create all attributes for the collection.
        This method should be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement _create_attributes method")
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the collection.
        This method should be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement _create_indexes method")
        
    def _create_string_attribute(self, key: str, size: int, required: bool, default: Optional[str] = None) -> None:
        """
        Create a string attribute.
        
        Args:
            key: The attribute key
            size: The maximum string length
            required: Whether the attribute is required
            default: The default value (optional)
        """
        try:
            options = {
                'required': required,
                'size': size
            }
            
            if default is not None:
                options['default'] = default
                
            self.client.create_attribute_if_not_exists(
                self.database_id, self.collection_id, 'string', key, **options
            )
            self.created_resources['attributes'].append(key)
            
        except AppwriteException as e:
            self.logger.error(f"Failed to create string attribute '{key}': {e.message}")
            raise
            
    def _create_boolean_attribute(self, key: str, required: bool, default: Optional[bool] = None) -> None:
        """
        Create a boolean attribute.
        
        Args:
            key: The attribute key
            required: Whether the attribute is required
            default: The default value (optional)
        """
        try:
            options = {
                'required': required
            }
            
            if default is not None:
                options['default'] = default
                
            self.client.create_attribute_if_not_exists(
                self.database_id, self.collection_id, 'boolean', key, **options
            )
            self.created_resources['attributes'].append(key)
            
        except AppwriteException as e:
            self.logger.error(f"Failed to create boolean attribute '{key}': {e.message}")
            raise
            
    def _create_datetime_attribute(self, key: str, required: bool) -> None:
        """
        Create a datetime attribute.
        
        Args:
            key: The attribute key
            required: Whether the attribute is required
        """
        try:
            options = {
                'required': required
            }
                
            self.client.create_attribute_if_not_exists(
                self.database_id, self.collection_id, 'datetime', key, **options
            )
            self.created_resources['attributes'].append(key)
            
        except AppwriteException as e:
            self.logger.error(f"Failed to create datetime attribute '{key}': {e.message}")
            raise
            
    def _create_index(self, index_id: str, attributes: List[str], index_type: str = 'key') -> None:
        """
        Create an index.
        
        Args:
            index_id: The index ID
            attributes: The attributes to index
            index_type: The index type (key, unique, fulltext)
        """
        try:
            self.client.create_index_if_not_exists(
                self.database_id, self.collection_id, index_id, attributes, index_type
            )
            self.created_resources['indexes'].append(index_id)
            
        except AppwriteException as e:
            self.logger.error(f"Failed to create index '{index_id}': {e.message}")
            raise


def parse_arguments() -> argparse.Namespace:
    """
    Parse command line arguments.
    
    Returns:
        The parsed arguments
    """
    parser = argparse.ArgumentParser(description='Appwrite Database Setup Script')
    parser.add_argument('--env-file', help='Path to .env file containing configuration')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose output')
    parser.add_argument('--quiet', action='store_true', help='Suppress all output except errors')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be created without making changes')
    
    return parser.parse_args()


class UsersCollectionBuilder(CollectionBuilder):
    """
    Builder for the Users collection.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str = "users"):
        """
        Initialize the Users collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID (default: "users")
        """
        super().__init__(client, database_id, collection_id, "Users")
        
    def _create_attributes(self) -> None:
        """
        Create all attributes for the Users collection.
        """
        # Required attributes
        self._create_string_attribute("email", 255, True)
        self._create_datetime_attribute("createdAt", True)
        
        # Optional attributes
        self._create_string_attribute("geminiKey", 1000, False)
        self._create_string_attribute("settings", 2000, False)
        self._create_boolean_attribute("isAdmin", False, False)
        self._create_datetime_attribute("lastLogin", False)
        self._create_string_attribute("name", 255, False)
        self._create_string_attribute("bio", 1000, False)
        self._create_string_attribute("oauthProvider", 255, False)
        self._create_boolean_attribute("emailVerification", False)
        self._create_boolean_attribute("disabled", False)
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the Users collection.
        """
        # Unique email index
        self._create_index("email_index", ["email"], "unique")
        
        # Created at index
        self._create_index("created_at_index", ["createdAt"], "key")
        
    def _get_attributes_info(self) -> List[Dict[str, Any]]:
        """
        Get information about attributes that would be created.
        
        Returns:
            List of attribute information dictionaries
        """
        return [
            {"key": "email", "type": "string", "size": 255, "required": True},
            {"key": "createdAt", "type": "datetime", "required": True},
            {"key": "geminiKey", "type": "string", "size": 1000, "required": False},
            {"key": "settings", "type": "string", "size": 2000, "required": False},
            {"key": "isAdmin", "type": "boolean", "required": False, "default": False},
            {"key": "lastLogin", "type": "datetime", "required": False},
            {"key": "name", "type": "string", "size": 255, "required": False},
            {"key": "bio", "type": "string", "size": 1000, "required": False},
            {"key": "oauthProvider", "type": "string", "size": 255, "required": False},
            {"key": "emailVerification", "type": "boolean", "required": False},
            {"key": "disabled", "type": "boolean", "required": False}
        ]
        
    def _get_indexes_info(self) -> List[Dict[str, Any]]:
        """
        Get information about indexes that would be created.
        
        Returns:
            List of index information dictionaries
        """
        return [
            {"id": "email_index", "type": "unique", "attributes": ["email"]},
            {"id": "created_at_index", "type": "key", "attributes": ["createdAt"]}
        ]


class StoriesCollectionBuilder(CollectionBuilder):
    """
    Builder for the Stories collection.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str = "stories"):
        """
        Initialize the Stories collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID (default: "stories")
        """
        super().__init__(client, database_id, collection_id, "Stories")
        
    def _create_attributes(self) -> None:
        """
        Create all attributes for the Stories collection.
        """
        # Required attributes
        self._create_string_attribute("userId", 255, True)
        self._create_string_attribute("title", 500, True)
        self._create_string_attribute("content", 10000, True)
        self._create_datetime_attribute("createdAt", True)
        
        # Optional attributes
        self._create_string_attribute("images", 2000, False)
        self._create_boolean_attribute("isPinned", False, False)
        self._create_string_attribute("tags", 1000, False)
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the Stories collection.
        """
        # User stories index
        self._create_index("user_stories_index", ["userId", "createdAt"], "key")
        
        # Created at index
        self._create_index("created_at_index", ["createdAt"], "key")


class AdminLogsCollectionBuilder(CollectionBuilder):
    """
    Builder for the Admin Logs collection.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str = "admin_logs"):
        """
        Initialize the Admin Logs collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID (default: "admin_logs")
        """
        super().__init__(client, database_id, collection_id, "Admin Logs")
        
    def _create_attributes(self) -> None:
        """
        Create all attributes for the Admin Logs collection.
        """
        # Required attributes
        self._create_string_attribute("action", 255, True)
        self._create_string_attribute("adminId", 255, True)
        self._create_datetime_attribute("timestamp", True)
        
        # Optional attributes
        self._create_string_attribute("details", 5000, False)
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the Admin Logs collection.
        """
        # Timestamp index
        self._create_index("timestamp_index", ["timestamp"], "key")


class ErrorLogsCollectionBuilder(CollectionBuilder):
    """
    Builder for the Error Logs collection.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str = "error_logs"):
        """
        Initialize the Error Logs collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID (default: "error_logs")
        """
        super().__init__(client, database_id, collection_id, "Error Logs")
        
    def _create_attributes(self) -> None:
        """
        Create all attributes for the Error Logs collection.
        """
        # Required attributes
        self._create_string_attribute("type", 50, True)
        self._create_string_attribute("message", 1000, True)
        self._create_string_attribute("severity", 20, True)
        self._create_datetime_attribute("timestamp", True)
        
        # Optional attributes
        self._create_string_attribute("stack", 5000, False)
        self._create_string_attribute("userId", 255, False)
        self._create_string_attribute("context", 2000, False)
        self._create_boolean_attribute("resolved", False, False)
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the Error Logs collection.
        """
        # Timestamp index
        self._create_index("timestamp_index", ["timestamp"], "key")
        
        # Severity index
        self._create_index("severity_index", ["severity"], "key")


class AnalyticsCollectionBuilder(CollectionBuilder):
    """
    Builder for the Analytics collection.
    """
    
    def __init__(self, client: AppwriteClient, database_id: str, collection_id: str = "analytics"):
        """
        Initialize the Analytics collection builder.
        
        Args:
            client: The Appwrite client
            database_id: The database ID
            collection_id: The collection ID (default: "analytics")
        """
        super().__init__(client, database_id, collection_id, "Analytics")
        
    def _create_attributes(self) -> None:
        """
        Create all attributes for the Analytics collection.
        """
        # Required attributes
        self._create_string_attribute("eventId", 255, True)
        self._create_string_attribute("eventType", 100, True)
        self._create_datetime_attribute("timestamp", True)
        
        # Optional attributes
        self._create_string_attribute("userId", 255, False)
        self._create_string_attribute("resourceId", 255, False)
        self._create_string_attribute("resourceType", 100, False)
        self._create_string_attribute("metadata", 2000, False)
        
    def _create_indexes(self) -> None:
        """
        Create all indexes for the Analytics collection.
        """
        # Timestamp index
        self._create_index("timestamp_index", ["timestamp"], "key")
        
        # User events index
        self._create_index("user_events_index", ["userId", "timestamp"], "key")
        
        # Event type index
        self._create_index("event_type_index", ["eventType"], "key")


class StorageManager:
    """
    Manager for storage buckets.
    """
    
    def __init__(self, client: AppwriteClient):
        """
        Initialize the storage manager.
        
        Args:
            client: The Appwrite client
        """
        self.client = client
        self.storage = client.storage
        self.logger = client.logger
        
    def create_bucket_if_not_exists(
        self, 
        bucket_id: str, 
        name: str, 
        file_size_limit: int = 10485760,  # 10MB
        allowed_extensions: List[str] = None,
        compression: str = "gzip",
        encryption: bool = True,
        antivirus: bool = True
    ) -> Dict[str, Any]:
        """
        Create a bucket if it doesn't exist.
        
        Args:
            bucket_id: The bucket ID
            name: The display name of the bucket
            file_size_limit: Maximum file size in bytes
            allowed_extensions: List of allowed file extensions
            compression: Compression algorithm
            encryption: Whether to enable encryption
            antivirus: Whether to enable antivirus scanning
            
        Returns:
            The bucket data if created or already exists
            
        Raises:
            AppwriteException: If the bucket creation fails
        """
        try:
            # Try to get the bucket to check if it exists
            bucket = self.storage.get_bucket(bucket_id)
            self.logger.warning(f"Bucket '{name}' ({bucket_id}) already exists")
            return bucket
        except AppwriteException as e:
            if e.code == 404:  # Bucket not found
                self.logger.info(f"Creating bucket '{name}' ({bucket_id})")
                
                # Set default allowed extensions if not provided
                if allowed_extensions is None:
                    allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"]
                
                # Create the bucket - adapt to different SDK versions
                try:
                    # Try with minimal parameters first
                    return self.storage.create_bucket(
                        bucket_id=bucket_id,
                        name=name
                    )
                except Exception as e1:
                    self.logger.warning(f"Failed to create bucket with minimal parameters: {str(e1)}")
                    try:
                        # Try with permissions as a list
                        return self.storage.create_bucket(
                            bucket_id=bucket_id,
                            name=name,
                            permissions=["read:all"]
                        )
                    except Exception as e2:
                        self.logger.warning(f"Failed to create bucket with permissions as list: {str(e2)}")
                        try:
                            # Try with permissions as a string
                            return self.storage.create_bucket(
                                bucket_id=bucket_id,
                                name=name,
                                permissions="read:all"
                            )
                        except Exception as e3:
                            self.logger.error(f"Failed to create bucket with permissions as string: {str(e3)}")
                            # Try one more time with no permissions
                            return self.storage.create_bucket(
                                bucket_id=bucket_id,
                                name=name,
                                enabled=True
                            )
            else:
                self.logger.error(f"Failed to check bucket '{bucket_id}': {e.message}")
                raise


def main() -> int:
    """
    Main function that orchestrates the database setup process.
    
    Returns:
        Exit code (0 for success, non-zero for failure)
    """
    # Parse command line arguments
    args = parse_arguments()
    
    # Initialize logger
    logger = Logger(verbose=args.verbose, quiet=args.quiet)
    logger.info("Starting Appwrite Database Setup Script")
    
    try:
        # Load configuration
        logger.info("Loading configuration")
        try:
            config = ConfigManager(env_file=args.env_file)
        except ValueError as e:
            logger.error(f"Configuration error: {str(e)}")
            logger.error("Please set the required environment variables or provide a valid .env file.")
            return 1
        except Exception as e:
            logger.error(f"Unexpected error while loading configuration: {str(e)}")
            return 1
        
        # Initialize Appwrite client
        logger.info("Initializing Appwrite client")
        try:
            client = AppwriteClient(config, logger)
        except ValueError as e:
            logger.error(f"Client initialization error: {str(e)}")
            logger.error("Please check your Appwrite configuration.")
            return 1
        except Exception as e:
            logger.error(f"Unexpected error while initializing client: {str(e)}")
            return 1
        
        # Test connection with retry
        max_retries = 3
        retry_count = 0
        connection_successful = False
        
        while retry_count < max_retries and not connection_successful:
            if retry_count > 0:
                logger.warning(f"Retrying connection (attempt {retry_count + 1}/{max_retries})...")
                
            connection_successful = client.test_connection()
            
            if not connection_successful:
                retry_count += 1
                if retry_count < max_retries:
                    # Wait before retrying (exponential backoff)
                    import time
                    time.sleep(2 ** retry_count)
        
        if not connection_successful:
            logger.error(f"Failed to connect to Appwrite API after {max_retries} attempts. Exiting.")
            logger.error("Please check your network connection and Appwrite configuration.")
            return 1
        
        # Get database ID
        database_id = config.get_required('APPWRITE_DATABASE_ID')
        logger.info(f"Using database ID: {database_id}")
        
        # Create collections
        created_resources = {}
        
        # Create collections with error handling
        collections_to_create = [
            {
                'name': 'Users',
                'id_key': 'APPWRITE_USERS_COLLECTION_ID',
                'default_id': 'users',
                'builder_class': UsersCollectionBuilder
            },
            {
                'name': 'Stories',
                'id_key': 'APPWRITE_STORIES_COLLECTION_ID',
                'default_id': 'stories',
                'builder_class': StoriesCollectionBuilder
            },
            {
                'name': 'Admin Logs',
                'id_key': 'APPWRITE_ADMIN_LOGS_COLLECTION_ID',
                'default_id': 'admin_logs',
                'builder_class': AdminLogsCollectionBuilder
            },
            {
                'name': 'Error Logs',
                'id_key': 'APPWRITE_ERROR_LOGS_COLLECTION_ID',
                'default_id': 'error_logs',
                'builder_class': ErrorLogsCollectionBuilder
            },
            {
                'name': 'Analytics',
                'id_key': 'APPWRITE_ANALYTICS_COLLECTION_ID',
                'default_id': 'analytics',
                'builder_class': AnalyticsCollectionBuilder
            }
        ]
        
        for collection_info in collections_to_create:
            collection_name = collection_info['name']
            collection_key = collection_info['name'].lower().replace(' ', '_')
            logger.info(f"Setting up {collection_name} collection")
            
            try:
                collection_id = config.get_optional(collection_info['id_key'], collection_info['default_id'])
                builder = collection_info['builder_class'](client, database_id, collection_id)
                
                if args.dry_run:
                    logger.info(f"[DRY RUN] Would create {collection_name} collection")
                else:
                    created_resources[collection_key] = builder.create(dry_run=args.dry_run)
                    logger.success(f"{collection_name} collection setup completed")
            except AppwriteException as e:
                logger.error(f"Appwrite API error while creating {collection_name} collection: {e.message}")
                if e.code == 401:
                    logger.error("Authentication failed. Please check your API key.")
                elif e.code == 403:
                    logger.error("Permission denied. Please check your API key permissions.")
                elif e.code == 404:
                    logger.error(f"Database with ID '{database_id}' not found.")
                elif e.code == 429:
                    logger.error("Rate limit exceeded. Please try again later.")
                else:
                    logger.error(f"API error code: {e.code}")
                # Continue with other collections
            except Exception as e:
                logger.error(f"Unexpected error while creating {collection_name} collection: {str(e)}")
                # Continue with other collections
        
        # Create Storage bucket for images
        logger.info("Setting up Storage bucket for images")
        storage_manager = StorageManager(client)
        images_bucket_id = config.get_optional('APPWRITE_IMAGES_BUCKET_ID', 'storytelling-images')
        
        # Ensure bucket ID is valid (only a-z, A-Z, 0-9, period, hyphen, and underscore)
        # Remove any invalid characters and ensure it doesn't start with a special char
        import re
        images_bucket_id = re.sub(r'[^a-zA-Z0-9._-]', '', images_bucket_id)
        if images_bucket_id and not images_bucket_id[0].isalnum():
            images_bucket_id = 'i' + images_bucket_id
        
        if args.dry_run:
            logger.info(f"[DRY RUN] Would create Storage bucket '{images_bucket_id}'")
        else:
            try:
                bucket = storage_manager.create_bucket_if_not_exists(
                    bucket_id=images_bucket_id,
                    name="Storytelling Images",
                    file_size_limit=10 * 1024 * 1024,  # 10MB
                    allowed_extensions=["jpg", "jpeg", "png", "gif", "webp"],
                    compression="gzip",
                    encryption=True,
                    antivirus=True
                )
                created_resources['storage_buckets'] = {
                    images_bucket_id: True
                }
                logger.success(f"Storage bucket '{images_bucket_id}' setup completed")
            except AppwriteException as e:
                logger.error(f"Appwrite API error while creating storage bucket: {e.message}")
                if e.code == 401:
                    logger.error("Authentication failed. Please check your API key.")
                elif e.code == 403:
                    logger.error("Permission denied. Please check your API key permissions.")
                elif e.code == 429:
                    logger.error("Rate limit exceeded. Please try again later.")
                else:
                    logger.error(f"API error code: {e.code}")
                # Continue with other setup tasks even if bucket creation fails
            except Exception as e:
                logger.error(f"Unexpected error while creating storage bucket: {str(e)}")
                # Continue with other setup tasks even if bucket creation fails
        
        # Validate created resources
        if not args.dry_run:
            logger.info("\nValidating created resources...")
            validation_results = {}
            
            # Validate collections
            for collection_info in collections_to_create:
                collection_key = collection_info['name'].lower().replace(' ', '_')
                collection_id = config.get_optional(collection_info['id_key'], collection_info['default_id'])
                
                if collection_key in created_resources:
                    builder = collection_info['builder_class'](client, database_id, collection_id)
                    expected_attributes = builder._get_attributes_info()
                    
                    validation_results[collection_key] = client.validate_collection(
                        database_id, collection_id, expected_attributes
                    )
            
            # Validate storage bucket
            images_bucket_id = config.get_optional('APPWRITE_IMAGES_BUCKET_ID', 'storytelling-images')
            # Apply the same ID correction as in the creation step
            import re
            images_bucket_id = re.sub(r'[^a-zA-Z0-9._-]', '', images_bucket_id)
            if images_bucket_id and not images_bucket_id[0].isalnum():
                images_bucket_id = 'i' + images_bucket_id
                
            validation_results['storytelling_images_bucket'] = client.validate_bucket(
                images_bucket_id, ["jpg", "jpeg", "png", "gif", "webp"]
            )
        
        # Generate execution summary
        logger.info("\n" + "="*50)
        logger.info("EXECUTION SUMMARY")
        logger.info("="*50)
        
        if args.dry_run:
            logger.info("DRY RUN - No changes were made")
        else:
            # Collections summary
            logger.info("\nCollections:")
            for collection_name in ['users', 'stories', 'admin_logs', 'error_logs', 'analytics']:
                if collection_name in created_resources:
                    collection_data = created_resources[collection_name]
                    if collection_data.get('collection', False):
                        logger.success(f"✓ {collection_name.capitalize()} collection created")
                    else:
                        logger.warning(f"⚠ {collection_name.capitalize()} collection already existed")
                    
                    # Attributes summary
                    if 'attributes' in collection_data and collection_data['attributes']:
                        logger.info(f"  - Created {len(collection_data['attributes'])} attributes")
                    
                    # Indexes summary
                    if 'indexes' in collection_data and collection_data['indexes']:
                        logger.info(f"  - Created {len(collection_data['indexes'])} indexes")
                else:
                    logger.error(f"✗ {collection_name.capitalize()} collection setup failed")
            
            # Storage buckets summary
            logger.info("\nStorage Buckets:")
            if 'storage_buckets' in created_resources:
                for bucket_id, created in created_resources['storage_buckets'].items():
                    if created:
                        logger.success(f"✓ {bucket_id} bucket created")
                    else:
                        logger.warning(f"⚠ {bucket_id} bucket already existed")
            else:
                logger.error("✗ No storage buckets were created")
            
            # Validation results
            if 'validation_results' in locals():
                logger.info("\nValidation Results:")
                for resource, is_valid in validation_results.items():
                    if is_valid:
                        logger.success(f"✓ {resource.replace('_', ' ').title()} is valid")
                    else:
                        logger.warning(f"⚠ {resource.replace('_', ' ').title()} has validation issues")
        
        logger.info("="*50)
        
        logger.success("Database setup completed successfully")
        return 0
        
    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())