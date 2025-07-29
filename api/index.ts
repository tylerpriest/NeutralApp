import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple API handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log the request
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);

  // Route handling
  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  
  // Health check
  if (pathname === '/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      deployment: 'vercel'
    });
  }

  // API status
  if (pathname === '/api/status') {
    return res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: {
        auth: 'JWT authentication available',
        plugins: 'Plugin management API endpoints available', 
        settings: 'Settings API endpoints available',
        admin: 'Admin dashboard API endpoints available',
        logging: 'Logging API endpoints available'
      }
    });
  }

  // Dashboard widgets
  if (pathname === '/api/dashboard/widgets') {
    return res.status(200).json({ 
      widgets: []
    });
  }

  // Auth session
  if (pathname === '/api/auth/session') {
    return res.status(200).json({
      success: true,
      user: null,
      message: 'No active session'
    });
  }

  // Plugins
  if (pathname === '/api/plugins') {
    return res.status(200).json({ 
      available: [],
      installed: []
    });
  }

  // Admin health
  if (pathname === '/api/admin/health') {
    return res.status(200).json({ 
      health: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  }

  // Default response for unmatched routes
  return res.status(404).json({ 
    error: 'API endpoint not found',
    path: pathname,
    method: req.method,
    available: ['/health', '/api/status', '/api/dashboard/widgets', '/api/auth/session', '/api/plugins', '/api/admin/health']
  });
} 