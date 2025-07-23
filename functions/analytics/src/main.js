const sdk = require('node-appwrite');

/**
 * Analytics Function
 * Processes and aggregates analytics data for the admin dashboard
 */

// Initialize Appwrite SDK
const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

/**
 * Calculate daily new users
 */
async function calculateDailyNewUsers(days = 30) {
  const results = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    try {
      const users = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_USERS_COLLECTION_ID,
        [
          sdk.Query.greaterThanEqual('createdAt', date.toISOString()),
          sdk.Query.lessThan('createdAt', nextDate.toISOString())
        ]
      );
      
      results.push({
        date: date.toISOString().split('T')[0],
        value: users.total
      });
    } catch (error) {
      console.error(`Error calculating users for ${date.toISOString()}:`, error);
      results.push({
        date: date.toISOString().split('T')[0],
        value: 0
      });
    }
  }
  
  return results;
}

/**
 * Calculate daily story generations
 */
async function calculateDailyStoryGenerations(days = 30) {
  const results = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    try {
      const stories = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_STORIES_COLLECTION_ID,
        [
          sdk.Query.greaterThanEqual('createdAt', date.toISOString()),
          sdk.Query.lessThan('createdAt', nextDate.toISOString())
        ]
      );
      
      results.push({
        date: date.toISOString().split('T')[0],
        value: stories.total
      });
    } catch (error) {
      console.error(`Error calculating stories for ${date.toISOString()}:`, error);
      results.push({
        date: date.toISOString().split('T')[0],
        value: 0
      });
    }
  }
  
  return results;
}

/**
 * Generate API usage heatmap data
 */
async function generateApiUsageHeatmap(days = 30) {
  const results = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    try {
      // Count stories created (proxy for API usage)
      const stories = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_STORIES_COLLECTION_ID,
        [
          sdk.Query.greaterThanEqual('createdAt', date.toISOString()),
          sdk.Query.lessThan('createdAt', nextDate.toISOString())
        ]
      );
      
      results.push({
        date: date.toISOString().split('T')[0],
        count: stories.total
      });
    } catch (error) {
      console.error(`Error calculating API usage for ${date.toISOString()}:`, error);
      results.push({
        date: date.toISOString().split('T')[0],
        count: 0
      });
    }
  }
  
  return results;
}

/**
 * Store analytics data
 */
async function storeAnalyticsData(data) {
  try {
    // Create or update analytics document
    const analyticsId = `analytics_${new Date().toISOString().split('T')[0]}`;
    
    try {
      // Try to update existing document
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics',
        analyticsId,
        {
          ...data,
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      // If document doesn't exist, create it
      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics',
        analyticsId,
        {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Error storing analytics data:', error);
    throw error;
  }
}

/**
 * Main function handler
 */
module.exports = async ({ req, res, log, error }) => {
  try {
    log('Starting analytics processing...');
    
    // Calculate analytics data
    const [dailyNewUsers, dailyStoryGenerations, apiUsageHeatmap] = await Promise.all([
      calculateDailyNewUsers(),
      calculateDailyStoryGenerations(),
      generateApiUsageHeatmap()
    ]);
    
    const analyticsData = {
      dailyNewUsers: JSON.stringify(dailyNewUsers),
      dailyStoryGenerations: JSON.stringify(dailyStoryGenerations),
      apiUsageHeatmap: JSON.stringify(apiUsageHeatmap),
      processedAt: new Date().toISOString()
    };
    
    // Store the analytics data
    await storeAnalyticsData(analyticsData);
    
    log('Analytics processing completed successfully');
    
    return res.json({
      success: true,
      message: 'Analytics data processed and stored',
      data: {
        dailyNewUsersCount: dailyNewUsers.length,
        dailyStoryGenerationsCount: dailyStoryGenerations.length,
        apiUsageHeatmapCount: apiUsageHeatmap.length,
        processedAt: analyticsData.processedAt
      }
    });
    
  } catch (err) {
    error(`Analytics function error: ${err.message}`);
    
    return res.json({
      success: false,
      error: 'Failed to process analytics data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, 500);
  }
};