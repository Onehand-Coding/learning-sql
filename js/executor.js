// SQL Executor - Handles query execution using sql.js (browser) or server API

// Database state
let db = null;
let SQL = null;
let isServerMode = false;
let currentDatabase = 'world';

// Sample database schemas
const databaseSchemas = {
    world: {
        tables: ['countries', 'cities', 'languages'],
        columns: {
            countries: ['id', 'name', 'code', 'continent', 'region', 'surface_area', 'indep_year', 'population', 'life_expectancy', 'gnp', 'government_form', 'capital'],
            cities: ['id', 'name', 'country_code', 'district', 'population'],
            languages: ['country_code', 'language', 'is_official', 'percentage']
        }
    },
    employees: {
        tables: ['employees', 'departments', 'salaries', 'titles'],
        columns: {
            employees: ['emp_no', 'birth_date', 'first_name', 'last_name', 'gender', 'hire_date'],
            departments: ['dept_no', 'dept_name'],
            salaries: ['emp_no', 'salary', 'from_date', 'to_date'],
            titles: ['emp_no', 'title', 'from_date', 'to_date']
        }
    },
    ecommerce: {
        tables: ['customers', 'products', 'orders', 'order_items', 'categories'],
        columns: {
            customers: ['id', 'name', 'email', 'city', 'country', 'created_at'],
            products: ['id', 'name', 'description', 'price', 'category_id', 'stock'],
            orders: ['id', 'customer_id', 'order_date', 'status', 'total_amount'],
            order_items: ['id', 'order_id', 'product_id', 'quantity', 'price'],
            categories: ['id', 'name', 'parent_category_id']
        }
    }
};

// Initialize sql.js
export async function initSqlJs() {
    try {
        // Load sql.js from CDN
        const initSqlJsModule = await window.initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        SQL = initSqlJsModule;
        db = new SQL.Database();
        
        // Initialize sample databases
        await initializeSampleDatabases();
        
        return true;
    } catch (error) {
        console.error('Failed to initialize sql.js:', error);
        return false;
    }
}

// Initialize sample databases
async function initializeSampleDatabases() {
    // World Database
    db.run(`
        CREATE TABLE IF NOT EXISTS countries (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT UNIQUE,
            continent TEXT,
            region TEXT,
            surface_area REAL,
            indep_year INTEGER,
            population INTEGER,
            life_expectancy REAL,
            gnp REAL,
            government_form TEXT,
            capital INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS cities (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            country_code TEXT,
            district TEXT,
            population INTEGER,
            FOREIGN KEY (country_code) REFERENCES countries(code)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS languages (
            country_code TEXT,
            language TEXT,
            is_official INTEGER,
            percentage REAL,
            FOREIGN KEY (country_code) REFERENCES countries(code)
        )
    `);

    // Insert sample world data
    const countries = [
        [1, 'United States', 'USA', 'North America', 'North America', 9363520, 1776, 278357000, 77.1, 8510700, 'Federal Republic', 3813],
        [2, 'China', 'CHN', 'Asia', 'Eastern Asia', 9572900, -1523, 1277558000, 71.4, 982268, 'People\'s Republic', 1891],
        [3, 'India', 'IND', 'Asia', 'Southern and Central Asia', 3287263, 1947, 1013662000, 62.5, 447114, 'Federal Republic', 1109],
        [4, 'United Kingdom', 'GBR', 'Europe', 'British Islands', 242900, 1066, 59623400, 77.7, 1378330, 'Constitutional Monarchy', 456],
        [5, 'Japan', 'JPN', 'Asia', 'Eastern Asia', 377829, -660, 126714000, 80.7, 3787042, 'Constitutional Monarchy', 1532],
        [6, 'Germany', 'DEU', 'Europe', 'Western Europe', 357022, 1955, 82164700, 77.4, 2133367, 'Federal Republic', 3068],
        [7, 'France', 'FRA', 'Europe', 'Western Europe', 551500, 843, 59225700, 78.8, 1424285, 'Republic', 2974],
        [8, 'Brazil', 'BRA', 'South America', 'South America', 8547403, 1822, 170115000, 62.9, 776739, 'Federal Republic', 211],
        [9, 'Canada', 'CAN', 'North America', 'North America', 9970610, 1867, 31147000, 79.4, 598862, 'Constitutional Monarchy', 1822],
        [10, 'Australia', 'AUS', 'Oceania', 'Australia and New Zealand', 7741220, 1901, 18886000, 79.8, 351182, 'Constitutional Monarchy', 2331]
    ];

    countries.forEach(country => {
        db.run(`INSERT INTO countries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, country);
    });

    const cities = [
        [1, 'New York', 'USA', 'New York', 8008278],
        [2, 'Los Angeles', 'USA', 'California', 3694820],
        [3, 'Chicago', 'USA', 'Illinois', 2896016],
        [4, 'Beijing', 'CHN', 'Beijing', 7472000],
        [5, 'Shanghai', 'CHN', 'Shanghai', 9696300],
        [6, 'Mumbai', 'IND', 'Maharashtra', 10500000],
        [7, 'Delhi', 'IND', 'Delhi', 7206704],
        [8, 'London', 'GBR', 'England', 7285000],
        [9, 'Tokyo', 'JPN', 'Tokyo', 7980230],
        [10, 'Berlin', 'DEU', 'Berliini', 3386667],
        [11, 'Paris', 'FRA', 'Île-de-France', 2125246],
        [12, 'São Paulo', 'BRA', 'São Paulo', 9968485],
        [13, 'Toronto', 'CAN', 'Ontario', 688276],
        [14, 'Sydney', 'AUS', 'New South Wales', 3276207]
    ];

    cities.forEach(city => {
        db.run(`INSERT INTO cities VALUES (?, ?, ?, ?, ?)`, city);
    });

    const languages = [
        ['USA', 'English', 1, 86.2],
        ['USA', 'Spanish', 0, 7.5],
        ['CHN', 'Chinese', 1, 92.0],
        ['IND', 'Hindi', 1, 39.0],
        ['IND', 'English', 1, 12.0],
        ['GBR', 'English', 1, 97.0],
        ['JPN', 'Japanese', 1, 99.0],
        ['DEU', 'German', 1, 91.0],
        ['FRA', 'French', 1, 93.0],
        ['BRA', 'Portuguese', 1, 97.0],
        ['CAN', 'English', 1, 60.0],
        ['CAN', 'French', 1, 23.0],
        ['AUS', 'English', 1, 81.0]
    ];

    languages.forEach(lang => {
        db.run(`INSERT INTO languages VALUES (?, ?, ?, ?)`, lang);
    });

    // Employees Database
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            emp_no INTEGER PRIMARY KEY,
            birth_date TEXT,
            first_name TEXT,
            last_name TEXT,
            gender TEXT,
            hire_date TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS departments (
            dept_no TEXT PRIMARY KEY,
            dept_name TEXT UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS salaries (
            emp_no INTEGER,
            salary INTEGER,
            from_date TEXT,
            to_date TEXT,
            FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS titles (
            emp_no INTEGER,
            title TEXT,
            from_date TEXT,
            to_date TEXT,
            FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
        )
    `);

    // Insert sample employees data
    const employees = [
        [10001, '1953-09-02', 'Georgi', 'Facello', 'M', '1986-06-26'],
        [10002, '1964-06-02', 'Bezalel', 'Simmel', 'F', '1985-11-21'],
        [10003, '1959-12-03', 'Parto', 'Bamford', 'M', '1986-08-28'],
        [10004, '1954-05-01', 'Chirstian', 'Koblick', 'M', '1986-12-01'],
        [10005, '1955-01-21', 'Kyoichi', 'Maliniak', 'M', '1989-09-12'],
        [10006, '1953-04-20', 'Anneke', 'Preusig', 'F', '1989-06-02'],
        [10007, '1957-05-23', 'Tzvetan', 'Zielinski', 'F', '1989-02-10'],
        [10008, '1958-02-19', 'Saniya', 'Kalloufi', 'M', '1994-09-15'],
        [10009, '1952-04-19', 'Sumant', 'Peac', 'F', '1985-02-18'],
        [10010, '1963-06-01', 'Duangkaew', 'Piveteau', 'F', '1989-08-24']
    ];

    employees.forEach(emp => {
        db.run(`INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?)`, emp);
    });

    const departments = [
        ['d001', 'Marketing'],
        ['d002', 'Finance'],
        ['d003', 'Human Resources'],
        ['d004', 'Production'],
        ['d005', 'Development'],
        ['d006', 'Quality Management'],
        ['d007', 'Sales'],
        ['d008', 'Research']
    ];

    departments.forEach(dept => {
        db.run(`INSERT INTO departments VALUES (?, ?)`, dept);
    });

    const salaries = [
        [10001, 60117, '1986-06-26', '9999-01-01'],
        [10002, 62042, '1985-11-21', '9999-01-01'],
        [10003, 55124, '1986-08-28', '9999-01-01'],
        [10004, 73596, '1986-12-01', '9999-01-01'],
        [10005, 61165, '1989-09-12', '9999-01-01'],
        [10006, 58784, '1989-06-02', '9999-01-01'],
        [10007, 71046, '1989-02-10', '9999-01-01'],
        [10008, 52082, '1994-09-15', '9999-01-01'],
        [10009, 54827, '1985-02-18', '9999-01-01'],
        [10010, 52982, '1989-08-24', '9999-01-01']
    ];

    salaries.forEach(sal => {
        db.run(`INSERT INTO salaries VALUES (?, ?, ?, ?)`, sal);
    });

    const titles = [
        [10001, 'Senior Engineer', '1986-06-26', '9999-01-01'],
        [10002, 'Staff', '1985-11-21', '9999-01-01'],
        [10003, 'Senior Engineer', '1986-08-28', '9999-01-01'],
        [10004, 'Engineer', '1986-12-01', '9999-01-01'],
        [10005, 'Manager', '1989-09-12', '9999-01-01'],
        [10006, 'Senior Engineer', '1989-06-02', '9999-01-01'],
        [10007, 'Senior Engineer', '1989-02-10', '9999-01-01'],
        [10008, 'Assistant Engineer', '1994-09-15', '9999-01-01'],
        [10009, 'Assistant Engineer', '1985-02-18', '1990-02-18'],
        [10010, 'Engineer', '1989-08-24', '9999-01-01']
    ];

    titles.forEach(title => {
        db.run(`INSERT INTO titles VALUES (?, ?, ?, ?)`, title);
    });

    // E-commerce Database
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            parent_category_id INTEGER,
            FOREIGN KEY (parent_category_id) REFERENCES categories(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            city TEXT,
            country TEXT,
            created_at TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price REAL,
            category_id INTEGER,
            stock INTEGER,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            order_date TEXT,
            status TEXT,
            total_amount REAL,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Insert sample e-commerce data
    const categories = [
        [1, 'Electronics', null],
        [2, 'Clothing', null],
        [3, 'Books', null],
        [4, 'Smartphones', 1],
        [5, 'Laptops', 1],
        [6, 'Men\'s Clothing', 2],
        [7, 'Women\'s Clothing', 2]
    ];

    categories.forEach(cat => {
        db.run(`INSERT INTO categories VALUES (?, ?, ?)`, cat);
    });

    const customers_data = [
        [1, 'John Doe', 'john@example.com', 'New York', 'USA', '2024-01-15'],
        [2, 'Jane Smith', 'jane@example.com', 'London', 'UK', '2024-02-20'],
        [3, 'Bob Johnson', 'bob@example.com', 'Paris', 'France', '2024-03-10'],
        [4, 'Alice Brown', 'alice@example.com', 'Tokyo', 'Japan', '2024-04-05'],
        [5, 'Charlie Wilson', 'charlie@example.com', 'Berlin', 'Germany', '2024-05-12']
    ];

    customers_data.forEach(cust => {
        db.run(`INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)`, cust);
    });

    const products_data = [
        [1, 'iPhone 15 Pro', 'Latest Apple smartphone', 999.99, 4, 100],
        [2, 'Samsung Galaxy S24', 'Latest Samsung smartphone', 899.99, 4, 150],
        [3, 'MacBook Pro 16"', 'Apple laptop with M3 chip', 2499.99, 5, 50],
        [4, 'Dell XPS 15', 'Premium Windows laptop', 1799.99, 5, 75],
        [5, 'Men\'s T-Shirt', 'Cotton casual t-shirt', 29.99, 6, 500],
        [6, 'Women\'s Dress', 'Summer casual dress', 59.99, 7, 300],
        [7, 'SQL Cookbook', 'Learn SQL through recipes', 49.99, 3, 200],
        [8, 'JavaScript Guide', 'Complete JS reference', 44.99, 3, 180]
    ];

    products_data.forEach(prod => {
        db.run(`INSERT INTO products VALUES (?, ?, ?, ?, ?, ?)`, prod);
    });

    const orders_data = [
        [1, 1, '2024-06-01', 'delivered', 1049.98],
        [2, 2, '2024-06-05', 'delivered', 2529.98],
        [3, 3, '2024-06-10', 'shipped', 89.98],
        [4, 1, '2024-06-15', 'processing', 899.99],
        [5, 4, '2024-06-20', 'delivered', 1829.98]
    ];

    orders_data.forEach(order => {
        db.run(`INSERT INTO orders VALUES (?, ?, ?, ?, ?)`, order);
    });

    const order_items_data = [
        [1, 1, 1, 1, 999.99],
        [2, 1, 5, 1, 29.99],
        [3, 1, 7, 1, 49.99],
        [4, 2, 3, 1, 2499.99],
        [5, 2, 6, 1, 59.99],
        [6, 3, 5, 1, 29.99],
        [7, 3, 7, 1, 49.99],
        [8, 4, 2, 1, 899.99],
        [9, 5, 4, 1, 1799.99],
        [10, 5, 8, 1, 44.99]
    ];

    order_items_data.forEach(item => {
        db.run(`INSERT INTO order_items VALUES (?, ?, ?, ?, ?)`, item);
    });
}

// Execute query in browser mode
export function executeQueryBrowser(query) {
    if (!db) {
        throw new Error('Database not initialized. Call initSqlJs first.');
    }

    const startTime = performance.now();
    
    try {
        const results = db.exec(query);
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        if (results.length === 0) {
            return {
                success: true,
                columns: [],
                rows: [],
                executionTime,
                message: 'Query executed successfully (no results returned)'
            };
        }

        const result = results[0];
        const rows = result.values.map(row => {
            const obj = {};
            result.columns.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        });

        return {
            success: true,
            columns: result.columns,
            rows: rows,
            executionTime
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            executionTime: 0
        };
    }
}

// Execute query in server mode
export async function executeQueryServer(query, database = 'world') {
    const startTime = performance.now();
    
    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                database
            })
        });

        const result = await response.json();
        const endTime = performance.now();
        
        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Query execution failed',
                executionTime: 0
            };
        }

        return {
            ...result,
            executionTime: (endTime - startTime).toFixed(2)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            executionTime: 0
        };
    }
}

// Main execute function (routes to browser or server)
export async function executeQuery(query, database = 'world') {
    if (isServerMode) {
        return await executeQueryServer(query, database);
    } else {
        return executeQueryBrowser(query);
    }
}

// Set server mode
export function setServerMode(mode) {
    isServerMode = mode;
}

// Get current mode
export function getServerMode() {
    return isServerMode;
}

// Set current database
export function setCurrentDatabase(databaseName) {
    currentDatabase = databaseName;
}

// Get current database
export function getCurrentDatabase() {
    return currentDatabase;
}

// Get schema for current database
export function getCurrentSchema() {
    return databaseSchemas[currentDatabase] || databaseSchemas.world;
}

// Get all database schemas
export function getAllSchemas() {
    return databaseSchemas;
}

// Reset database (for exercises)
export function resetDatabase() {
    if (db) {
        db.close();
        db = new SQL.Database();
        initializeSampleDatabases();
    }
}

// Export database for debugging
export function getDatabase() {
    return db;
}
