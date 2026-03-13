// Simple SQL Editor with basic syntax highlighting
// This is a fallback when CodeMirror is not available

let editorElement = null;
let currentContent = '';
let onChangeCallback = null;
let onExecuteCallback = null;

// SQL keywords for highlighting
const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
    'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'JOIN',
    'UNION', 'ALL', 'INTERSECT', 'EXCEPT',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'ALTER', 'DROP', 'TRUNCATE',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
    'INDEX', 'CONSTRAINT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'ASC', 'DESC',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'CAST', 'COALESCE', 'NULLIF', 'EXTRACT'
];

// Create simple editor
export function createSimpleEditor(container, options = {}) {
    const { 
        initialValue = '', 
        readOnly = false,
        onChange = null,
        onExecute = null
    } = options;

    onChangeCallback = onChange;
    onExecuteCallback = onExecute;

    // Create textarea
    editorElement = document.createElement('textarea');
    editorElement.className = 'simple-sql-editor';
    editorElement.value = initialValue;
    editorElement.readOnly = readOnly;
    editorElement.spellcheck = false;
    editorElement.autocapitalize = 'off';
    editorElement.autocomplete = 'off';
    
    // Style the textarea
    Object.assign(editorElement.style, {
        width: '100%',
        height: '200px',
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        fontSize: '14px',
        padding: '12px',
        border: 'none',
        outline: 'none',
        resize: 'vertical',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        lineHeight: '1.5',
        boxSizing: 'border-box'
    });

    // Event listeners
    editorElement.addEventListener('input', (e) => {
        currentContent = e.target.value;
        if (onChangeCallback) {
            onChangeCallback(currentContent);
        }
    });

    editorElement.addEventListener('keydown', (e) => {
        // Tab to indent
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editorElement.selectionStart;
            const end = editorElement.selectionEnd;
            editorElement.value = editorElement.value.substring(0, start) + '  ' + editorElement.value.substring(end);
            editorElement.selectionStart = editorElement.selectionEnd = start + 2;
            currentContent = editorElement.value;
            if (onChangeCallback) {
                onChangeCallback(currentContent);
            }
        }
        
        // Ctrl/Cmd + Enter to execute
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (onExecuteCallback) {
                onExecuteCallback();
            }
        }
    });

    container.innerHTML = '';
    container.appendChild(editorElement);

    return {
        element: editorElement,
        getValue: () => editorElement.value,
        setValue: (value) => {
            editorElement.value = value;
            currentContent = value;
        }
    };
}

// Get editor content
export function getEditorContent(editor) {
    if (editor && editor.getValue) {
        return editor.getValue();
    }
    return editorElement ? editorElement.value : '';
}

// Set editor content
export function setEditorContent(editor, content) {
    if (editor && editor.setValue) {
        editor.setValue(content);
    } else if (editorElement) {
        editorElement.value = content;
    }
}

// Format SQL (basic)
export function formatSQL(sql) {
    let formatted = sql.trim();
    
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
    
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${kw}`);
    });
    
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    
    return formatted.trim();
}

// Export placeholder functions for compatibility
export function createLessonEditor(container, options = {}) {
    return createSimpleEditor(container, options);
}

export function createPlaygroundEditor(container, options = {}) {
    return createSimpleEditor(container, options);
}

export function createReadonlyEditor(container, code) {
    return createSimpleEditor(container, {
        initialValue: code,
        readOnly: true
    });
}

// Schema functions (placeholder)
let currentSchema = { tables: [], columns: {} };

export function setSchema(schema) {
    currentSchema = schema;
}

export function getSchema() {
    return currentSchema;
}
