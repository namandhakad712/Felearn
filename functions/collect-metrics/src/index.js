const sdk = require('node-appwrite');

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200
  
  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function(req, res) {
  const client = new sdk.Client();
  
  // Initialize Appwrite client
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const metricsCollectionId = 'system_metrics';
  const usersCollectionId = 'users';
  const storiesCollectionId = 'stories';
  const requestLogsCollectionId = 'request_logs';
  const apiUsageLogsCollectionId = 'api_usage_logs';
  
  try {
    // Get timestamp
    const timestamp = new Date().toISOString();
    
    // Measure database response time
    const startTime = Date.now();
    await databases.listDocuments(databaseId, usersCollectionId, [
      sdk.Query.limit(1)
    ]);
    const responseTime = Date.now() - startTime;
    
    // Get active users (users who logged in within last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const activeUsersResult = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [sdk.Query.greaterThan('lastLogin', yesterday)]
    );
    
    // Get stories generated today
    const today = new Date().toISOString().split('T')[0];
    const storiesResult = await databases.listDocuments(
      databaseId,
      storiesCollectionId,
      [sdk.Query.greaterThan('createdAt', today)]
    );
    
    // Calculate error rate from recent logs
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Get total requests and errors from logs
    const totalRequests = await databases.listDocuments(
      databaseId,
      requestLogsCollectionId,
      [sdk.Query.greaterThan('timestamp', oneHourAgo)]
    );
    
    const errorRequests = await databases.listDocuments(
      databaseId,
      requestLogsCollectionId,
      [
        sdk.Query.greaterThan('timestamp', oneHourAgo),
        sdk.Query.greaterThanEqual('status', 400)
      ]
    );
    
    const errorRate = totalRequests.total > 0 
      ? (errorRequests.total / totalRequests.total) * 100 
      : 0;
    
    // Get API usage statistics
    const apiCallsResult = await databases.listDocuments(
      databaseId,
      apiUsageLogsCollectionId,
      [sdk.Query.greaterThan('timestamp', today)]
    );
    
    // Create metrics document
    const metrics = {
      timestamp,
      responseTime,
      errorRate,
      activeUsers: activeUsersResult.total,
      storiesGenerated: storiesResult.total,
      apiUsage: apiCallsResult.total
    };
    
    // Store metrics
    const result = await databases.createDocument(
      databaseId,
      metricsCollectionId,
      sdk.ID.unique(),
      metrics
    );
    
    // Check for alerts
    await checkAlerts(databases, databaseId, metrics);
    
    return res.json({
      success: true,
      metrics: result
    });
  } catch (error) {
    console.error('Failed to collect metrics:', error);
    
    return res.json({
      success: false,
      error: error.message
    }, 500);
  }
};

// Check metrics against alert thresholds
async function checkAlerts(databases, databaseId, metrics) {
  try {
    const alertConfigsCollectionId = 'alert_configs';
    const alertsCollectionId = 'alerts';
    
    // Get alert configurations
    const configsResult = await databases.listDocuments(
      databaseId,
      alertConfigsCollectionId
    );
    
    const configs = configsResult.documents;
    
    for (const config of configs) {
      if (!config.enabled) continue;
      
      const value = metrics[config.metric];
      const shouldAlert = evaluateThreshold(value, config.threshold, config.operator);
      
      if (shouldAlert) {
        const alert = {
          configId: config.$id,
          message: `${config.name}: ${config.metric} is ${value} (threshold: ${config.threshold})`,
          severity: calculateSeverity(value, config.threshold, config.operator),
          timestamp: new Date().toISOString(),
          resolved: false
        };
        
        // Store alert
        await databases.createDocument(
          databaseId,
          alertsCollectionId,
          sdk.ID.unique(),
          alert
        );
        
        // Send notifications (would be implemented in a real system)
        console.log(`Alert triggered: ${alert.message}`);
      }
    }
  } catch (error) {
    console.error('Failed to check alerts:', error);
  }
}

// Evaluate if a value exceeds a threshold
function evaluateThreshold(value, threshold, operator) {
  switch (operator) {
    case 'gt': return value > threshold;
    case 'lt': return value < threshold;
    case 'eq': return value === threshold;
    default: return false;
  }
}

// Calculate alert severity based on how far the value is from the threshold
function calculateSeverity(value, threshold, operator) {
  const ratio = Math.abs(value - threshold) / threshold;
  
  if (ratio > 0.5) return 'critical';
  if (ratio > 0.3) return 'high';
  if (ratio > 0.1) return 'medium';
  return 'low';
}