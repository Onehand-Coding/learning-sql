// SQLite Database Connection (Server-side)
// This module provides server-side SQLite operations using better-sqlite3

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

// Initialize database connection
export function initDatabase(dbPath = ':memory:') {
    try {
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        console.log('SQLite database initialized');
        return true;
    } catch (error) {
        console.error('Failed to initialize SQLite:', error.message);
        return false;
    }
}

// Execute a query
export function executeQuery(query) {
    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        const stmt = db.prepare(query);
        
        // Determine query type
        const upperQuery = query.trim().toUpperCase();
        
        if (upperQuery.startsWith('SELECT')) {
            // Return all rows for SELECT queries
            const columns = stmt.columns().map(col => col.name);
            const rows = stmt.all();
            return {
                success: true,
                columns,
                rows,
                changes: 0
            };
        } else {
            // Execute and return changes for INSERT/UPDATE/DELETE
            const result = stmt.run();
            return {
                success: true,
                columns: [],
                rows: [],
                changes: result.changes,
                lastInsertRowid: result.lastInsertRowid
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            columns: [],
            rows: []
        };
    }
}

// Get table schema
export function getTableSchema(tableName) {
    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
        const columns = stmt.all();
        return {
            success: true,
            columns: columns.map(col => ({
                name: col.name,
                type: col.type,
                notNull: col.notnull,
                primaryKey: col.pk,
                defaultValue: col.dflt_value
            }))
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Get all tables
export function getTables() {
    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        const stmt = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        const tables = stmt.all();
        return {
            success: true,
            tables: tables.map(t => t.name)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Close database connection
export function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}

// Export database instance for direct access
export function getDatabase() {
    return db;
}
