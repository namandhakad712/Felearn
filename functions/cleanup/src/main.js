const sdk = require('node-appwrite');

/**
 * Cleanup Function
 * Cleans up expired data, temporary files, and performs maintenance tasks
 */

// Initialize Appwrite SDK
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);

client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

/**
 * Clean up old error logs
 */
async function cleanupErrorLogs(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const oldLogs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_ERROR_LOGS_COLLECTION_ID || 'error_logs',
      [
        sdk.Query.lessThan('timestamp', cutoffDate.toISOString()),
        sdk.Query.limit(100) // Process in batches
      ]
    );
    
    let deletedCount = 0;
    
    for (const log of oldLogs.documents) {
      try {
        await databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_ERROR_LOGS_COLLECTION_ID || 'error_logs',
          log.$id
        );
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete error log ${log.$id}:`, error);
      }
    }
    
    return { deletedCount, totalFound: oldLogs.total };
  } catch (error) {
    console.error('Error cleaning up error logs:', error);
    return { deletedCount: 0, totalFound: 0, error: error.message };
  }
}

/**
 * Clean up old admin logs
 */
async function cleanupAdminLogs(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const oldLogs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_ADMIN_LOGS_COLLECTION_ID || 'admin_logs',
      [
        sdk.Query.lessThan('timestamp', cutoffDate.toISOString()),
        sdk.Query.limit(100) // Process in batches
      ]
    );
    
    let deletedCount = 0;
    
    for (const log of oldLogs.documents) {
      try {
        await databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_ADMIN_LOGS_COLLECTION_ID || 'admin_logs',
          log.$id
        );
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete admin log ${log.$id}:`, error);
      }
    }
    
    return { deletedCount, totalFound: oldLogs.total };
  } catch (error) {
    console.error('Error cleaning up admin logs:', error);
    return { deletedCount: 0, totalFound: 0, error: error.message };
  }
}

/**
 * Clean up old analytics data
 */
async function cleanupAnalyticsData(daysToKeep = 365) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const oldAnalytics = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics',
      [
        sdk.Query.lessThan('createdAt', cutoffDate.toISOString()),
        sdk.Query.limit(50) // Process in smaller batches for analytics
      ]
    );
    
    let deletedCount = 0;
    
    for (const analytics of oldAnalytics.documents) {
      try {
        await databases.deleteDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics',
          analytics.$id
        );
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete analytics data ${analytics.$id}:`, error);
      }
    }
    
    return { deletedCount, totalFound: oldAnalytics.total };
  } catch (error) {
    console.error('Error cleaning up analytics data:', error);
    return { deletedCount: 0, totalFound: 0, error: error.message };
  }
}

/**
 * Clean up orphaned files in storage
 */
async function cleanupOrphanedFiles() {
  try {
    // This is a simplified version - in a real implementation,
    // you would cross-reference files with database records
    const files = await storage.listFiles(
      process.env.APPWRITE_STORAGE_BUCKET_ID || 'storytelling-images',
      [sdk.Query.limit(100)]
    );
    
    // For now, just return file count for monitoring
    return { 
      totalFiles: files.total,
      message: 'File cleanup not implemented - requires cross-referencing with database'
    };
  } catch (error) {
    console.error('Error checking storage files:', error);
    return { totalFiles: 0, error: error.message };
  }
}

/**
 * Generate cleanup report
 */
function generateCleanupReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      errorLogs: results.errorLogs,
      adminLogs: results.adminLogs,
      analyticsData: results.analyticsData,
      storageFiles: results.storageFiles
    },
    totalItemsDeleted: (results.errorLogs?.deletedCount || 0) + 
                      (results.adminLogs?.deletedCount || 0) + 
                      (results.analyticsData?.deletedCount || 0),
    errors: []
  };
  
  // Collect any errors
  if (results.errorLogs?.error) report.errors.push(`Error logs: ${results.errorLogs.error}`);
  if (results.adminLogs?.error) report.errors.push(`Admin logs: ${results.adminLogs.error}`);
  if (results.analyticsData?.error) report.errors.push(`Analytics: ${results.analyticsData.error}`);
  if (results.storageFiles?.error) report.errors.push(`Storage: ${results.storageFiles.error}`);
  
  return report;
}

/**
 * Main function handler
 */
module.exports = async ({ req, res, log, error }) => {
  try {
    log('Starting cleanup process...');
    
    // Run all cleanup tasks
    const results = {
      errorLogs: await cleanupErrorLogs(),
      adminLogs: await cleanupAdminLogs(),
      analyticsData: await cleanupAnalyticsData(),
      storageFiles: await cleanupOrphanedFiles()
    };
    
    // Generate cleanup report
    const report = generateCleanupReport(results);
    
    log(`Cleanup completed. Deleted ${report.totalItemsDeleted} items total.`);
    
    if (report.errors.length > 0) {
      error(`Cleanup completed with errors: ${report.errors.join(', ')}`);
    }
    
    return res.json({
      success: true,
      message: 'Cleanup process completed',
      report
    });
    
  } catch (err) {
    error(`Cleanup function error: ${err.message}`);
    
    return res.json({
      success: false,
      error: 'Failed to complete cleanup process',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, 500);
  }
};