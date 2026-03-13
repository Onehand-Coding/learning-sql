// API Routes for SQL Execution
import express from 'express';
import { executeQuery as executeSQLite, getTables as getSQLiteTables, getTableSchema as getSQLiteSchema } from '../db/sqlite.js';
import { executeQuery as executePostgres, getTables as getPostgresTables, getTableSchema as getPostgresSchema } from '../db/postgres.js';

const router = express.Router();

// Execute SQL query
router.post('/execute', async (req, res) => {
    const { query, database = 'sqlite', dbType = 'sqlite' } = req.body;
    
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Query is required' 
        });
    }
    
    // Security: Basic SQL injection prevention
    // In production, use parameterized queries and more robust validation
    const forbiddenPatterns = [
        /\bDROP\s+DATABASE\b/i,
        /\bTRUNCATE\b/i,
        /\bDELETE\s+FROM\s+ WITHOUT\s+WHERE/i
    ];
    
    for (const pattern of forbiddenPatterns) {
        if (pattern.test(query)) {
            return res.status(403).json({
                success: false,
                error: 'This query type is not allowed for security reasons'
            });
        }
    }
    
    try {
        let result;
        
        if (dbType === 'postgres') {
            result = await executePostgres(query);
        } else {
            result = executeSQLite(query);
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get database tables
router.get('/tables', async (req, res) => {
    const { dbType = 'sqlite' } = req.query;
    
    try {
        let result;
        
        if (dbType === 'postgres') {
            result = await getPostgresTables();
        } else {
            result = getSQLiteTables();
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get table schema
router.get('/schema/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const { dbType = 'sqlite' } = req.query;
    
    try {
        let result;
        
        if (dbType === 'postgres') {
            result = await getPostgresSchema(tableName);
        } else {
            result = getSQLiteSchema(tableName);
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/execute - Execute SQL query',
            'GET /api/tables - Get all tables',
            'GET /api/schema/:tableName - Get table schema'
        ]
    });
});

export default router;
