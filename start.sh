#!/bin/bash

# SQL Learning Platform - Easy Start Script
# This script starts a simple HTTP server to run the SQL Learning Platform

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=${1:-8000}

echo "
╔═══════════════════════════════════════════════════════════╗
║           SQL Learning Platform                           ║
╠═══════════════════════════════════════════════════════════╣
║  Starting local server...                                 ║
║  Port: $PORT                                               ║
║                                                           ║
║  Opening in your browser...                               ║
╚═══════════════════════════════════════════════════════════╝
"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    cd "$SCRIPT_DIR"
    
    # Try to open browser based on OS
    case "$(uname -s)" in
        Linux*)
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:$PORT" 2>/dev/null || echo "Open http://localhost:$PORT in your browser"
            else
                echo "Open http://localhost:$PORT in your browser"
            fi
            ;;
        Darwin*)
            open "http://localhost:$PORT" 2>/dev/null || echo "Open http://localhost:$PORT in your browser"
            ;;
        *)
            echo "Open http://localhost:$PORT in your browser"
            ;;
    esac
    
    python3 -m http.server "$PORT"
    
elif command -v python &> /dev/null; then
    echo "Using Python 2 HTTP server..."
    cd "$SCRIPT_DIR"
    
    case "$(uname -s)" in
        Linux*)
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:$PORT" 2>/dev/null || echo "Open http://localhost:$PORT in your browser"
            else
                echo "Open http://localhost:$PORT in your browser"
            fi
            ;;
        Darwin*)
            open "http://localhost:$PORT" 2>/dev/null || echo "Open http://localhost:$PORT in your browser"
            ;;
        *)
            echo "Open http://localhost:$PORT in your browser"
            ;;
    esac
    
    python -m SimpleHTTPServer "$PORT"
    
else
    echo "Error: Python is not installed."
    echo "Please install Python or use 'npm start' for Node.js server."
    exit 1
fi
