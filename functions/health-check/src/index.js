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
  const storage = new sdk.Storage(client);
  
  // Check database connection
  let databaseStatus = false;
  try {
    // Try to list databases (will fail if database service is down)
    await databases.list();
    databaseStatus = true;
  } catch (error) {
    console.error('Database check failed:', error);
  }
  
  // Check storage connection
  let storageStatus = false;
  try {
    // Try to list buckets (will fail if storage service is down)
    await storage.listBuckets();
    storageStatus = true;
  } catch (error) {
    console.error('Storage check failed:', error);
  }
  
  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
  
  // Check system uptime
  const uptime = process.uptime();
  
  // Determine overall status
  const isHealthy = databaseStatus && storageStatus && memoryUsagePercent < 90;
  
  // Return health check results
  return res.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    details: {
      database: databaseStatus,
      storage: storageStatus,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: memoryUsagePercent
      },
      uptime: Math.round(uptime)
    }
  });
};