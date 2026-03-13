// CodeMirror Editor Setup
import { EditorView, basicSetup } from "./editor-bundle.js";
import { EditorState } from "./editor-bundle.js";
import { sql } from "./editor-bundle.js";
import { oneDark } from "./editor-bundle.js";
import { autocompletion } from "./editor-bundle.js";
import { history } from "./editor-bundle.js";

// SQL Keywords and Functions for Autocomplete
const sqlKeywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "BETWEEN", "LIKE", "IS NULL",
    "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "AS", "DISTINCT",
    "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CROSS JOIN",
    "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
    "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
    "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "TRUNCATE",
    "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "UNIQUE", "CHECK", "DEFAULT",
    "INDEX", "CREATE INDEX", "DROP INDEX",
    "CASE", "WHEN", "THEN", "ELSE", "END",
    "CAST", "COALESCE", "NULLIF", "GREATEST", "LEAST"
];

const sqlFunctions = [
    "COUNT()", "SUM()", "AVG()", "MIN()", "MAX()",
    "ROUND()", "CEIL()", "FLOOR()", "ABS()",
    "UPPER()", "LOWER()", "TRIM()", "LENGTH()", "SUBSTRING()", "CONCAT()",
    "NOW()", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP",
    "EXTRACT()", "DATE_PART()", "TO_CHAR()", "TO_DATE()",
    "COALESCE()", "IFNULL()", "CASE()",
    "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()",
    "LAG()", "LEAD()", "FIRST_VALUE()", "LAST_VALUE()",
    "STRING_AGG()", "ARRAY_AGG()", "JSON_AGG()"
];

// Database schema for autocomplete (will be populated dynamically)
let currentSchema = {
    tables: [],
    columns: {}
};

export function setSchema(schema) {
    currentSchema = schema;
}

export function getSchema() {
    return currentSchema;
}

// Custom autocompletion source
function sqlCompletionSource(context) {
    const word = context.matchBefore(/\w*/);
    if (!word || word.from === word.to) return null;

    const options = [];

    // Add SQL keywords
    sqlKeywords.forEach(kw => {
        options.push({
            label: kw,
            type: "keyword",
            detail: "Keyword"
        });
    });

    // Add SQL functions
    sqlFunctions.forEach(fn => {
        options.push({
            label: fn,
            type: "function",
            detail: "Function"
        });
    });

    // Add table names
    currentSchema.tables.forEach(table => {
        options.push({
            label: table,
            type: "type",
            detail: "Table"
        });
    });

    // Add column names if we have a table context
    const textBefore = context.state.doc.toString().slice(0, context.pos);
    const tableMatch = textBefore.match(/FROM\s+(\w+)|JOIN\s+(\w+)/i);
    if (tableMatch) {
        const tableName = tableMatch[1] || tableMatch[2];
        const columns = currentSchema.columns[tableName] || [];
        columns.forEach(col => {
            options.push({
                label: col,
                type: "field",
                detail: `Column of ${tableName}`
            });
        });
    }

    return {
        from: word.from,
        options: options
    };
}

// Create editor configuration
function createEditorConfig(container, options = {}) {
    const { 
        initialValue = "", 
        readOnly = false,
        onChange = null,
        onExecute = null
    } = options;

    const language = sql({ 
        dialect: "PostgreSQL",
        upperCaseKeywords: true
    });

    const autocomplete = autocompletion({
        override: [sqlCompletionSource],
        activateOnTyping: true,
        activateOnTypingDelay: 100
    });

    const extensions = [
        basicSetup,
        language,
        oneDark,
        autocomplete,
        history(),
        EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
                onChange(update.state.doc.toString());
            }
        }),
        EditorView.domEventHandlers({
            keydown: (event, view) => {
                // Ctrl/Cmd + Enter to execute
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault();
                    if (onExecute) {
                        onExecute();
                    }
                    return true;
                }
                return false;
            }
        })
    ];

    if (readOnly) {
        extensions.push(EditorView.editable.of(false));
    }

    const state = EditorState.create({
        doc: initialValue,
        extensions: extensions
    });

    const view = new EditorView({
        state: state,
        parent: container
    });

    return view;
}

// Create lesson editor
export function createLessonEditor(container, options = {}) {
    return createEditorConfig(container, {
        ...options,
        onChange: (value) => {
            if (options.onChange) options.onChange(value);
        },
        onExecute: () => {
            if (options.onExecute) options.onExecute();
        }
    });
}

// Create playground editor
export function createPlaygroundEditor(container, options = {}) {
    return createEditorConfig(container, {
        ...options,
        onChange: (value) => {
            // Save to localStorage
            localStorage.setItem('playground-query', value);
            if (options.onChange) options.onChange(value);
        },
        onExecute: () => {
            if (options.onExecute) options.onExecute();
        }
    });
}

// Create readonly editor for examples
export function createReadonlyEditor(container, code) {
    return createEditorConfig(container, {
        initialValue: code,
        readOnly: true
    });
}

// Get editor content
export function getEditorContent(editor) {
    return editor.state.doc.toString();
}

// Set editor content
export function setEditorContent(editor, content) {
    const transaction = editor.state.update({
        changes: { from: 0, to: editor.state.doc.length, insert: content }
    });
    editor.dispatch(transaction);
}

// Insert text at cursor position
export function insertText(editor, text) {
    const selection = editor.state.selection.main;
    const transaction = editor.state.update({
        changes: { from: selection.from, to: selection.to, insert: text }
    });
    editor.dispatch(transaction);
}

// Format SQL (basic formatting)
export function formatSQL(sql) {
    // Basic SQL formatter
    let formatted = sql.trim();
    
    // Add newlines before keywords
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
    
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${kw}`);
    });
    
    // Clean up multiple newlines
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    
    return formatted.trim();
}

// Export editor for external access
export { EditorView };
