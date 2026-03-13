# SQL Learning Platform

An interactive, browser-based SQL learning platform that teaches SQL from basics to advanced concepts. Built with SQLite (in-browser via sql.js) and optional PostgreSQL server support.

## Features

- 🎯 **Interactive Lessons** - Step-by-step tutorials from SQL basics to advanced topics
- 🖥️ **In-Browser SQL Editor** - Write and execute SQL queries directly in your browser
- 📊 **Sample Databases** - Pre-loaded databases (World, Employees, E-commerce) for practice
- 🎨 **Syntax Highlighting** - CodeMirror-powered SQL editor with autocomplete
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 💾 **Progress Tracking** - Your completed lessons are saved locally
- 🔌 **Dual Mode** - Browser-only mode or server mode with PostgreSQL

## Quick Start

### Option 1: Browser-Only Mode (Recommended for Learning)

No installation required! Simply open the `index.html` file in your browser:

```bash
# On Linux/Mac
open index.html

# On Windows
start index.html

# Or use a simple HTTP server
python3 -m http.server 8000
# Then open http://localhost:8000
```

### Option 2: Server Mode (For PostgreSQL Support)

1. **Install dependencies:**

```bash
npm install
```

2. **Start the server:**

```bash
npm start
```

3. **Open your browser:**

```
http://localhost:3000
```

## Curriculum

### Module 1: Basics
1. **Introduction to SQL** - What is SQL, database terminology
2. **SELECT Queries 101** - Selecting columns, DISTINCT, aliases
3. **Filtering with WHERE** - Comparison operators, AND/OR, BETWEEN, IN, LIKE
4. **Sorting with ORDER BY** - ASC/DESC, multiple columns, LIMIT/OFFSET

### Module 2: Intermediate (Coming Soon)
- Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
- GROUP BY and HAVING
- JOINs (INNER, LEFT, RIGHT, FULL)
- NULL Handling
- Subqueries

### Module 3: Advanced (Coming Soon)
- Window Functions
- Common Table Expressions (CTEs)
- UNION, INTERSECT, EXCEPT
- Indexes and Performance
- Transactions

## Project Structure

```
sql/
├── index.html              # Main HTML file
├── css/
│   ├── main.css           # Core styles
│   ├── editor.css         # CodeMirror editor styles
│   └── tutorial.css       # Lesson/tutorial styles
├── js/
│   ├── app.js             # Main application logic
│   ├── editor.js          # CodeMirror SQL editor setup
│   └── executor.js        # SQL execution (sql.js)
├── lessons/
│   ├── basics/
│   │   ├── 01-introduction.json
│   │   ├── 02-select-101.json
│   │   ├── 03-where-clause.json
│   │   └── 04-order-by.json
│   ├── intermediate/      # (Coming soon)
│   └── advanced/          # (Coming soon)
├── server/
│   ├── index.js           # Express server
│   ├── routes/
│   │   └── api.js         # API endpoints
│   └── db/
│       ├── sqlite.js      # SQLite connection
│       └── postgres.js    # PostgreSQL connection
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Sample Databases

### World Database
- `countries` - Country information (name, code, continent, population, GNP, etc.)
- `cities` - City data with population and district
- `languages` - Languages spoken in each country

### Employees Database
- `employees` - Employee details (name, gender, hire date)
- `departments` - Department names
- `salaries` - Salary history
- `titles` - Employee titles

### E-commerce Database
- `customers` - Customer information
- `products` - Product catalog with prices
- `orders` - Order history
- `order_items` - Order line items
- `categories` - Product categories

## Usage

### Writing Queries

1. Select a lesson from the sidebar
2. Read the theory section
3. Write your SQL query in the editor
4. Click **Run Query** or press `Ctrl/Cmd + Enter`
5. Check your results and click **Check Answer**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Run query |
| `Ctrl/Cmd + /` | Toggle comment |
| `Ctrl/Cmd + F` | Search |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |

### Server Mode Toggle

The **Server Mode** toggle in the header allows you to switch between:
- **Browser Mode** (default): Uses sql.js, runs entirely in your browser
- **Server Mode**: Connects to a PostgreSQL database (requires configuration)

## Configuration

### PostgreSQL Setup (Optional)

To enable PostgreSQL support:

1. Install PostgreSQL on your system
2. Create a database:

```sql
CREATE DATABASE sql_learning;
```

3. Update environment variables or edit `server/db/postgres.js`:

```javascript
const config = {
    host: 'localhost',
    port: 5432,
    database: 'sql_learning',
    user: 'postgres',
    password: 'your_password'
};
```

4. Start the server with PostgreSQL:

```bash
PGHOST=localhost PGDATABASE=sql_learning PGPASSWORD=your_password npm start
```

## Adding New Lessons

Lessons are defined as JSON files in the `lessons/` directory. Here's the structure:

```json
{
  "id": "basics-05",
  "title": "Lesson Title",
  "module": "basics",
  "order": 5,
  "theory": {
    "introduction": "<p>Intro content</p>",
    "sections": [
      {
        "title": "Section Title",
        "content": "<p>Section content with HTML</p>"
      }
    ],
    "examples": [
      {
        "title": "Example Title",
        "description": "Description",
        "code": "SELECT * FROM table;"
      }
    ]
  },
  "exercise": {
    "instruction": "What the user should do",
    "starterCode": "-- Starting code",
    "expectedColumns": ["col1", "col2"],
    "hint": "Optional hint",
    "solution": "SELECT * FROM table;"
  },
  "learningObjectives": [
    "Objective 1",
    "Objective 2"
  ]
}
```

Then add the file path to `js/app.js` in the `loadLessons()` function.

## Technologies Used

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript (ES6+)** - Application logic
- **CodeMirror 6** - SQL code editor with syntax highlighting
- **sql.js** - SQLite compiled to WebAssembly for in-browser execution

### Backend (Optional)
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **better-sqlite3** - Fast SQLite3 library
- **pg** - PostgreSQL client

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Requires WebAssembly support.

## Troubleshooting

### sql.js not loading
- Ensure you have an internet connection (sql.js loads from CDN)
- Try using a modern browser with WebAssembly support

### Queries not executing
- Check browser console for errors
- Ensure the table names are correct
- Verify SQL syntax

### Server mode not working
- Check if PostgreSQL is running
- Verify database credentials in `server/db/postgres.js`
- Check server logs for connection errors

## Contributing

Contributions are welcome! Here's how you can help:

1. Add new lessons (create JSON files in `lessons/`)
2. Improve the UI/UX
3. Add more sample databases
4. Fix bugs or improve performance

## License

MIT License - Feel free to use this for your learning!

## Resources

- [SQLBolt](https://sqlbolt.com/) - Interactive SQL tutorials
- [SQLZoo](https://sqlzoo.net/) - SQL practice platform
- [SQLite Documentation](https://sqlite.org/docs.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [CodeMirror 6](https://codemirror.net/docs/)

## Contact

For questions or feedback, please open an issue on the repository.

---

Happy Learning! 🚀
