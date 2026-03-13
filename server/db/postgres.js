// PostgreSQL Database Connection (Server-side)
// This module provides server-side PostgreSQL operations using pg

import pkg from 'pg';
const { Client, Pool } = pkg;

// Database configuration
// In production, use environment variables
const config = {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'sql_learning',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

let pool = null;

// Initialize database connection pool
export async function initDatabase() {
    try {
        pool = new Pool(config);
        
        // Test connection
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        console.log('PostgreSQL database connected');
        return true;
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error.message);
        console.log('PostgreSQL server mode will be unavailable until configured');
        return false;
    }
}

// Execute a query
export async function executeQuery(query) {
    if (!pool) {
        throw new Error('Database not initialized');
    }

    const client = await pool.connect();
    
    try {
        const startTime = Date.now();
        const result = await client.query(query);
        const executionTime = Date.now() - startTime;
        
        return {
            success: true,
            columns: result.fields.map(field => field.name),
            rows: result.rows,
            rowCount: result.rowCount,
            executionTime: `${executionTime}ms`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            columns: [],
            rows: []
        };
    } finally {
        client.release();
    }
}

// Execute multiple queries in a transaction
export async function executeTransaction(queries) {
    if (!pool) {
        throw new Error('Database not initialized');
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const results = [];
        for (const query of queries) {
            const result = await client.query(query);
            results.push({
                success: true,
                columns: result.fields.map(field => field.name),
                rows: result.rows,
                rowCount: result.rowCount
            });
        }
        
        await client.query('COMMIT');
        
        return {
            success: true,
            results
        };
    } catch (error) {
        await client.query('ROLLBACK');
        return {
            success: false,
            error: error.message
        };
    } finally {
        client.release();
    }
}

// Get table schema
export async function getTableSchema(tableName) {
    if (!pool) {
        throw new Error('Database not initialized');
    }

    const query = `
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
    `;
    
    const client = await pool.connect();
    
    try {
        const result = await client.query(query, [tableName]);
        return {
            success: true,
            columns: result.rows.map(row => ({
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable === 'YES',
                defaultValue: row.column_default,
                maxLength: row.character_maximum_length,
                precision: row.numeric_precision,
                scale: row.numeric_scale
            }))
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    } finally {
        client.release();
    }
}

// Get all tables
export async function getTables() {
    if (!pool) {
        throw new Error('Database not initialized');
    }

    const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `;
    
    const client = await pool.connect();
    
    try {
        const result = await client.query(query);
        return {
            success: true,
            tables: result.rows.map(row => row.table_name)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    } finally {
        client.release();
    }
}

// Initialize sample tables for learning
export async function initializeSampleTables() {
    const createTables = `
        CREATE TABLE IF NOT EXISTS countries (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(3) UNIQUE,
            continent VARCHAR(50),
            region VARCHAR(100),
            surface_area DECIMAL(15, 2),
            indep_year INTEGER,
            population BIGINT,
            life_expectancy DECIMAL(5, 2),
            gnp DECIMAL(15, 2),
            government_form VARCHAR(100),
            capital INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS cities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            country_code VARCHAR(3),
            district VARCHAR(100),
            population BIGINT,
            FOREIGN KEY (country_code) REFERENCES countries(code)
        );
        
        CREATE TABLE IF NOT EXISTS employees (
            emp_no INTEGER PRIMARY KEY,
            birth_date DATE,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            gender CHAR(1),
            hire_date DATE
        );
        
        CREATE TABLE IF NOT EXISTS salaries (
            emp_no INTEGER,
            salary INTEGER,
            from_date DATE,
            to_date DATE,
            FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
        );
    `;
    
    return await executeTransaction(createTables.split(';').filter(q => q.trim()));
}

// Close database connection pool
export async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection pool closed');
    }
}

// Export pool for direct access
export function getPool() {
    return pool;
}
