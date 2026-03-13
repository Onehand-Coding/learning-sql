// Main Application Logic
import { 
    createLessonEditor, 
    createPlaygroundEditor, 
    setEditorContent, 
    getEditorContent,
    setSchema,
    getSchema
} from './editor-simple.js';
import {
    initSqlJs,
    executeQuery,
    setServerMode,
    getServerMode,
    setCurrentDatabase,
    getCurrentDatabase,
    getCurrentSchema,
    getAllSchemas
} from './executor.js';

// State
let lessonEditor = null;
let playgroundEditor = null;
let currentLesson = null;
let allLessons = [];
let completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');

// DOM Elements
const elements = {
    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view'),
    runQuery: document.getElementById('runQuery'),
    checkAnswer: document.getElementById('checkAnswer'),
    hintBtn: document.getElementById('hintBtn'),
    hintBox: document.getElementById('hint-box'),
    prevLesson: document.getElementById('prevLesson'),
    nextLesson: document.getElementById('nextLesson'),
    lessonTitle: document.getElementById('lesson-title'),
    theoryContent: document.getElementById('theory-content'),
    exerciseInstruction: document.getElementById('exercise-instruction'),
    tableWrapper: document.getElementById('table-wrapper'),
    errorMessage: document.getElementById('error-message'),
    executionTime: document.getElementById('execution-time'),
    serverModeToggle: document.getElementById('serverModeToggle'),
    playgroundRun: document.getElementById('playgroundRun'),
    playgroundTable: document.getElementById('playground-table'),
    playgroundError: document.getElementById('playground-error'),
    playgroundTime: document.getElementById('playground-time'),
    databaseSelect: document.getElementById('database-select'),
    basicsList: document.getElementById('basics-list'),
    intermediateList: document.getElementById('intermediate-list'),
    advancedList: document.getElementById('advanced-list')
};

// Initialize application
async function init() {
    // Initialize sql.js
    const sqlInitialized = await initSqlJs();
    if (!sqlInitialized) {
        showError('Failed to initialize SQL engine. Some features may not work.', elements.errorMessage);
    }

    // Load lessons
    await loadLessons();

    // Initialize editors
    initializeEditors();

    // Setup event listeners
    setupEventListeners();

    // Load first lesson
    if (allLessons.length > 0) {
        loadLesson(allLessons[0]);
    }

    // Set initial schema
    updateSchema();
}

// Load lesson files
async function loadLessons() {
    const lessonFiles = [
        'lessons/basics/01-introduction.json',
        'lessons/basics/02-select-101.json',
        'lessons/basics/03-where-clause.json',
        'lessons/basics/04-order-by.json'
    ];

    try {
        for (const file of lessonFiles) {
            const response = await fetch(file);
            if (response.ok) {
                const lesson = await response.json();
                allLessons.push(lesson);
            }
        }
        
        // Sort lessons by order
        allLessons.sort((a, b) => a.order - b.order);
        
        // Render lesson list
        renderLessonList();
    } catch (error) {
        console.error('Error loading lessons:', error);
    }
}

// Render lesson list in sidebar
function renderLessonList() {
    const modules = {
        basics: elements.basicsList,
        intermediate: elements.intermediateList,
        advanced: elements.advancedList
    };

    // Clear existing lists
    Object.values(modules).forEach(list => list.innerHTML = '');

    // Group lessons by module
    allLessons.forEach(lesson => {
        const list = modules[lesson.module];
        if (list) {
            const li = document.createElement('li');
            li.textContent = lesson.title;
            li.dataset.lessonId = lesson.id;
            
            if (completedLessons.includes(lesson.id)) {
                li.classList.add('completed');
            }
            
            if (currentLesson && currentLesson.id === lesson.id) {
                li.classList.add('active');
            }
            
            li.addEventListener('click', () => {
                loadLesson(lesson);
            });
            
            list.appendChild(li);
        }
    });
}

// Initialize CodeMirror editors
function initializeEditors() {
    // Lesson editor
    const lessonEditorContainer = document.getElementById('sql-editor');
    if (lessonEditorContainer) {
        lessonEditor = createLessonEditor(lessonEditorContainer, {
            initialValue: '',
            onChange: (value) => {
                // Auto-save draft
                localStorage.setItem(`lesson-${currentLesson?.id}-draft`, value);
            },
            onExecute: runLessonQuery
        });
    }

    // Playground editor
    const playgroundEditorContainer = document.getElementById('playground-editor');
    if (playgroundEditorContainer) {
        playgroundEditor = createPlaygroundEditor(playgroundEditorContainer, {
            initialValue: localStorage.getItem('playground-query') || '-- Write your SQL query here\nSELECT * FROM countries LIMIT 10;',
            onExecute: runPlaygroundQuery
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Run query buttons
    elements.runQuery.addEventListener('click', runLessonQuery);
    elements.playgroundRun.addEventListener('click', runPlaygroundQuery);

    // Exercise buttons
    elements.checkAnswer.addEventListener('click', checkAnswer);
    elements.hintBtn.addEventListener('click', showHint);

    // Lesson navigation
    elements.prevLesson.addEventListener('click', navigateLesson.bind(null, -1));
    elements.nextLesson.addEventListener('click', navigateLesson.bind(null, 1));

    // Server mode toggle
    elements.serverModeToggle.addEventListener('change', (e) => {
        setServerMode(e.target.checked);
        updateSchema();
    });

    // Database selection
    elements.databaseSelect.addEventListener('change', (e) => {
        setCurrentDatabase(e.target.value);
        updateSchema();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to run query
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeView = document.querySelector('.view.active');
            if (activeView.id === 'lessons-view') {
                runLessonQuery();
            } else if (activeView.id === 'playground-view') {
                runPlaygroundQuery();
            }
        }
    });
}

// Switch view
function switchView(viewName) {
    elements.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });
}

// Load lesson
function loadLesson(lesson) {
    currentLesson = lesson;
    
    // Update title
    elements.lessonTitle.textContent = lesson.title;
    
    // Update theory content
    let theoryHTML = lesson.theory.introduction || '';
    
    if (lesson.theory.sections) {
        lesson.theory.sections.forEach(section => {
            theoryHTML += `<h3>${section.title}</h3>`;
            theoryHTML += section.content;
        });
    }
    
    if (lesson.theory.examples) {
        theoryHTML += `<h3>Examples</h3>`;
        lesson.theory.examples.forEach(example => {
            theoryHTML += `
                <div class="code-example">
                    <div class="code-example-header">
                        <span class="code-example-title">${example.title}</span>
                    </div>
                    <pre><code>${escapeHtml(example.code)}</code></pre>
                </div>
            `;
        });
    }
    
    elements.theoryContent.innerHTML = theoryHTML;
    
    // Update exercise
    if (lesson.exercise) {
        elements.exerciseInstruction.innerHTML = lesson.exercise.instruction;
        setEditorContent(lessonEditor, lesson.exercise.starterCode || '');
        elements.hintBox.classList.remove('visible');
        
        // Load saved draft
        const draft = localStorage.getItem(`lesson-${lesson.id}-draft`);
        if (draft) {
            setEditorContent(lessonEditor, draft);
        }
    }
    
    // Clear previous results
    elements.tableWrapper.innerHTML = '';
    elements.errorMessage.classList.remove('visible');
    
    // Update lesson list
    renderLessonList();
    
    // Update schema for lesson
    updateSchema();
}

// Run query in lesson editor
async function runLessonQuery() {
    const query = getEditorContent(lessonEditor);
    await executeAndDisplayQuery(query, elements.tableWrapper, elements.errorMessage, elements.executionTime);
}

// Run query in playground editor
async function runPlaygroundQuery() {
    const query = getEditorContent(playgroundEditor);
    await executeAndDisplayQuery(query, elements.playgroundTable, elements.playgroundError, elements.playgroundTime);
}

// Execute query and display results
async function executeAndDisplayQuery(query, tableContainer, errorContainer, timeContainer) {
    // Clear previous results
    tableContainer.innerHTML = '';
    errorContainer.classList.remove('visible');
    
    if (!query.trim()) {
        showError('Please enter a query.', errorContainer);
        return;
    }
    
    try {
        const result = await executeQuery(query, getCurrentDatabase());
        
        if (result.success) {
            if (result.rows && result.rows.length > 0) {
                displayResults(result, tableContainer);
                timeContainer.textContent = `${result.executionTime} ms`;
            } else {
                tableContainer.innerHTML = '<p class="success-message">Query executed successfully. No rows returned.</p>';
                timeContainer.textContent = `${result.executionTime} ms`;
            }
        } else {
            showError(result.error || 'Query execution failed.', errorContainer);
        }
    } catch (error) {
        showError(error.message, errorContainer);
    }
}

// Display results in table format
function displayResults(result, container) {
    const { columns, rows } = result;
    
    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col] !== null ? row[col] : 'NULL';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Show error message
function showError(message, container) {
    container.textContent = message;
    container.classList.add('visible');
}

// Check answer
function checkAnswer() {
    if (!currentLesson || !currentLesson.exercise) return;
    
    const query = getEditorContent(lessonEditor).trim();
    const exercise = currentLesson.exercise;
    
    // Execute the query
    executeQuery(query, getCurrentDatabase()).then(result => {
        if (!result.success) {
            showError('Query error: ' + result.error, elements.errorMessage);
            return;
        }
        
        // Validate based on validation type
        let isCorrect = false;
        let feedback = '';
        
        if (exercise.validation.type === 'exact') {
            // Check if expected columns match
            isCorrect = exercise.expectedColumns.every(col => 
                result.columns && result.columns.includes(col)
            );
        } else if (exercise.validation.type === 'columns') {
            // Check if result has expected columns
            isCorrect = exercise.validation.columns.every(col => 
                result.columns && result.columns.includes(col)
            );
            // Check if querying the right table
            const lowerQuery = query.toLowerCase();
            isCorrect = isCorrect && lowerQuery.includes(exercise.validation.table.toLowerCase());
        } else if (exercise.validation.type === 'condition') {
            // Check columns and condition
            isCorrect = exercise.columns.every(col => 
                result.columns && result.columns.includes(col)
            );
            const lowerQuery = query.toLowerCase();
            isCorrect = isCorrect && 
                       lowerQuery.includes(exercise.table.toLowerCase()) &&
                       lowerQuery.includes(exercise.condition.toLowerCase().replace('>', ' ')).split(' ').some(w => w.includes('>'));
        } else if (exercise.validation.type === 'orderby_limit') {
            // Check columns and limit
            isCorrect = exercise.columns.every(col => 
                result.columns && result.columns.includes(col)
            );
            isCorrect = isCorrect && result.rows.length <= exercise.limit;
        }
        
        // Show feedback
        if (isCorrect) {
            showFeedback(true, 'Correct! Well done! 🎉');
            if (!completedLessons.includes(currentLesson.id)) {
                completedLessons.push(currentLesson.id);
                localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
            }
        } else {
            showFeedback(false, 'Not quite right. Keep trying or check the hint!');
        }
    });
}

// Show feedback
function showFeedback(isSuccess, message) {
    // Remove existing feedback
    const existingFeedback = document.querySelector('.feedback-box');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    const feedbackBox = document.createElement('div');
    feedbackBox.className = `feedback-box feedback-${isSuccess ? 'success' : 'error'} visible`;
    feedbackBox.innerHTML = `
        <div class="feedback-title">
            ${isSuccess ? '✓' : '✗'} ${isSuccess ? 'Correct!' : 'Try Again'}
        </div>
        <p>${message}</p>
    `;
    
    elements.exerciseInstruction.after(feedbackBox);
    
    if (isSuccess) {
        // Scroll to feedback
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Show hint
function showHint() {
    if (currentLesson && currentLesson.exercise && currentLesson.exercise.hint) {
        elements.hintBox.textContent = 'Hint: ' + currentLesson.exercise.hint;
        elements.hintBox.classList.add('visible');
    }
}

// Navigate to previous/next lesson
function navigateLesson(direction) {
    if (!currentLesson) return;
    
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < allLessons.length) {
        loadLesson(allLessons[newIndex]);
    }
}

// Update schema for autocomplete
function updateSchema() {
    const schema = getCurrentSchema();
    setSchema(schema);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
