import express, { Request, Response } from 'express';
import { NeutralApp } from './index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize NeutralApp
const neutralApp = new NeutralApp();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NeutralApp</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 600px;
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 20px;
                font-weight: 700;
            }
            p {
                font-size: 1.2rem;
                line-height: 1.6;
                margin-bottom: 30px;
                opacity: 0.9;
            }
            .status {
                background: rgba(255, 255, 255, 0.2);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .feature h3 {
                margin: 0 0 10px 0;
                color: #fff;
            }
            .feature p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 NeutralApp</h1>
            <p>A domain-agnostic, ultra-modular application shell</p>
            
            <div class="status">
                <strong>Status:</strong> Server running on port ${PORT}
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🔌 Plugin System</h3>
                    <p>Modular architecture with secure plugin management</p>
                </div>
                <div class="feature">
                    <h3>🔐 Authentication</h3>
                    <p>Secure user authentication with Supabase</p>
                </div>
                <div class="feature">
                    <h3>⚙️ Settings</h3>
                    <p>Hierarchical settings management system</p>
                </div>
                <div class="feature">
                    <h3>📊 Dashboard</h3>
                    <p>Configurable dashboard with widget system</p>
                </div>
                <div class="feature">
                    <h3>👨‍💼 Admin Panel</h3>
                    <p>Comprehensive admin dashboard and monitoring</p>
                </div>
                <div class="feature">
                    <h3>🧪 Testing</h3>
                    <p>Comprehensive test coverage with Jest</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/api/status', async (req: Request, res: Response) => {
  try {
    await neutralApp.initialize();
    res.json({
      status: 'running',
      message: 'NeutralApp is running successfully',
      timestamp: new Date().toISOString(),
      port: PORT
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize NeutralApp',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeutralApp server running at http://localhost:${PORT}`);
  console.log(`📊 API status available at http://localhost:${PORT}/api/status`);
});

export default app; 