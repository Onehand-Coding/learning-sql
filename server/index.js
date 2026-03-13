// Express Server for SQL Learning Platform
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..')));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'index.html'));
});

// API endpoint for SQL execution (placeholder for PostgreSQL mode)
app.post('/api/execute', async (req, res) => {
    const { query, database } = req.body;
    
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Query is required' 
        });
    }
    
    try {
        // In a full implementation, this would connect to PostgreSQL
        // For now, return a message indicating server mode needs setup
        res.json({
            success: false,
            error: 'Server mode requires PostgreSQL connection. Configure database credentials in server/db/postgres.js',
            columns: [],
            rows: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: 'browser (sql.js)'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           SQL Learning Platform Server                    ║
╠═══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}               ║
║  Mode: Browser (sql.js)                                   ║
║                                                           ║
║  Open your browser and start learning SQL!                ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
