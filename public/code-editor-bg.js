class CodeEditorBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        console.log('Code Editor Background initializing...');
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.lineHeight = 18;
        this.charWidth = 9;
        this.leftPadding = 60; // Space for line numbers
        this.mousePos = { x: 0, y: 0 };
        this.isMouseOverCanvas = false;
        
        // Editor state
        this.lines = [
            '// portfolio-backend/src/main.rs',
            'use actix_web::{web, App, HttpServer, Result};',
            'use serde::{Deserialize, Serialize};',
            'use std::collections::HashMap;',
            '',
            '#[derive(Serialize, Deserialize)]',
            'pub struct Project {',
            '    id: u32,',
            '    name: String,',
            '    description: String,',
            '    tech_stack: Vec<String>,',
            '    status: String,',
            '}',
            '',
            'pub struct Portfolio {',
            '    projects: HashMap<u32, Project>,',
            '    next_id: u32,',
            '}',
            '',
            'impl Portfolio {',
            '    pub fn new() -> Self {',
            '        Self {',
            '            projects: HashMap::new(),',
            '            next_id: 1,',
            '        }',
            '    }',
            '',
            '    pub fn add_project(&mut self, name: String, desc: String) {',
            '        let project = Project {',
            '            id: self.next_id,',
            '            name,',
            '            description: desc,',
            '            tech_stack: vec![],',
            '            status: "active".to_string(),',
            '        };',
            '        ',
            '        self.projects.insert(self.next_id, project);',
            '        self.next_id += 1;',
            '    }',
            '}'
        ];
        
        this.cursor = { line: 0, char: 0 };
        this.typingState = 'typing'; // 'typing', 'editing', 'navigating'
        this.typingSpeed = 1;
        this.pauseCounter = 0;
        this.scrollOffset = 0;
        
        // Actions queue for realistic editing behavior
        this.actions = [
            { type: 'type', text: '\n\n// Add endpoint handlers' },
            { type: 'type', text: '\nasync fn get_projects() -> Result<web::Json<Vec<Project>>> {' },
            { type: 'type', text: '\n    // TODO: Return projects from database' },
            { type: 'navigate', line: 28, char: 0 },
            { type: 'edit', text: '    pub fn get_project(&self, id: u32) -> Option<&Project> {' },
            { type: 'type', text: '\n        self.projects.get(&id)' },
            { type: 'type', text: '\n    }' },
            { type: 'navigate', line: 35, char: 8 },
            { type: 'edit', text: 'self.projects.insert(self.next_id, project);' },
            { type: 'navigate', line: 40, char: 0 },
            { type: 'type', text: '\n\n#[actix_web::main]' },
            { type: 'type', text: '\nasync fn main() -> std::io::Result<()> {' },
            { type: 'type', text: '\n    HttpServer::new(|| {' },
            { type: 'type', text: '\n        App::new()' },
            { type: 'type', text: '\n            .route("/projects", web::get().to(get_projects))' },
            { type: 'navigate', line: 7, char: 4 },
            { type: 'edit', text: 'id: u32,' },
            { type: 'navigate', line: 46, char: 0 },
            { type: 'type', text: '\n    })' },
            { type: 'type', text: '\n    .bind("127.0.0.1:8080")?' },
            { type: 'type', text: '\n    .run()' },
            { type: 'type', text: '\n    .await' },
            { type: 'type', text: '\n}' }
        ];
        this.currentAction = 0;
        this.actionProgress = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Add mouse tracking and scroll handling
        this.canvas.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            this.isMouseOverCanvas = true;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOverCanvas = false;
        });
        
        // Handle wheel events for code scrolling
        this.canvas.addEventListener('wheel', (e) => {
            if (this.isMouseOverCanvas) {
                e.preventDefault();
                const scrollAmount = e.deltaY > 0 ? 3 : -3;
                const maxScroll = Math.max(0, this.lines.length - Math.floor(this.canvas.height / this.lineHeight) + 5);
                this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + scrollAmount));
            }
        });
        
        this.animate();
    }
    
    resize() {
        // Get device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set the internal size to the display size times the device pixel ratio
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        
        // Scale the canvas back down using CSS
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        this.ctx.scale(dpr, dpr);
        
        // Position cursor at end of existing code
        this.cursor.line = Math.max(0, this.lines.length - 1);
        this.cursor.char = this.lines[this.cursor.line] ? this.lines[this.cursor.line].length : 0;
    }
    
    getSyntaxColor(word, context) {
        const rustKeywords = ['use', 'pub', 'struct', 'impl', 'fn', 'let', 'mut', 'self', 'Self', 'async', 'await'];
        const rustTypes = ['String', 'u32', 'Vec', 'HashMap', 'Result', 'Option'];
        const rustMacros = ['vec!', 'println!'];
        
        // Comments
        if (word.startsWith('//') || context.startsWith('//')) {
            return { color: 'rgba(100, 100, 100, 0.06)', type: 'comment' };
        }
        
        // Strings
        if ((word.startsWith('"') && word.endsWith('"')) || word.includes('"')) {
            return { color: 'rgba(120, 120, 120, 0.08)', type: 'string' };
        }
        
        // Keywords
        if (rustKeywords.includes(word)) {
            return { color: 'rgba(80, 80, 80, 0.1)', type: 'keyword' };
        }
        
        // Types
        if (rustTypes.includes(word)) {
            return { color: 'rgba(110, 110, 110, 0.08)', type: 'type' };
        }
        
        // Numbers
        if (/^\d+$/.test(word)) {
            return { color: 'rgba(90, 90, 90, 0.08)', type: 'number' };
        }
        
        // Attributes
        if (word.startsWith('#[')) {
            return { color: 'rgba(105, 105, 105, 0.07)', type: 'attribute' };
        }
        
        return { color: 'rgba(130, 130, 130, 0.06)', type: 'default' };
    }
    
    drawEditor() {
        // Dark background with subtle grid - only draw visible portion
        const viewportHeight = window.innerHeight;
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
        this.ctx.fillRect(0, 0, window.innerWidth, viewportHeight);
        
        // Line grid - only draw visible lines
        this.ctx.strokeStyle = 'rgba(30, 41, 59, 0.02)';
        this.ctx.lineWidth = 0.3;
        const startGridY = Math.max(0, this.scrollOffset * this.lineHeight);
        const endGridY = startGridY + window.innerHeight + this.lineHeight;
        
        for (let y = startGridY; y < endGridY; y += this.lineHeight) {
            const screenY = y - (this.scrollOffset * this.lineHeight);
            if (screenY >= 0 && screenY <= window.innerHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, screenY);
                this.ctx.lineTo(this.canvas.width, screenY);
                this.ctx.stroke();
            }
        }
        
        // Draw lines - only visible ones
        const viewportLines = Math.ceil(window.innerHeight / this.lineHeight) + 2;
        const startLine = Math.max(0, this.scrollOffset);
        const endLine = Math.min(this.lines.length, startLine + viewportLines);
        
        this.ctx.font = '14px JetBrains Mono, monospace';
        
        for (let i = startLine; i < endLine; i++) {
            const line = this.lines[i];
            const y = (i - this.scrollOffset) * this.lineHeight + 20;
            
            if (y < 0 || y > window.innerHeight) continue;
            
            // Line number
            this.ctx.fillStyle = 'rgba(100, 116, 139, 0.06)';
            this.ctx.fillText((i + 1).toString().padStart(3, ' '), 10, y);
            
            // Line content with syntax highlighting
            if (line) {
                const words = line.split(/(\s+|[(){}[\],;:.&|<>=!+-])/);
                let x = this.leftPadding;
                
                words.forEach(word => {
                    if (word.length === 0) return;
                    
                    const style = this.getSyntaxColor(word, line);
                    this.ctx.fillStyle = style.color;
                    this.ctx.fillText(word, x, y);
                    x += this.ctx.measureText(word).width;
                });
            }
            
            // Cursor
            if (i === this.cursor.line && this.time % 60 < 30) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                // Calculate cursor position more accurately
                const lineText = this.lines[this.cursor.line] ? this.lines[this.cursor.line].substring(0, this.cursor.char) : '';
                const cursorX = this.leftPadding + this.ctx.measureText(lineText).width;
                this.ctx.fillRect(cursorX, y - 14, 1, 16);
            }
        }
        
        // Scrollbar - show position in the growing file
        const scrollViewportHeight = window.innerHeight;
        const scrollViewportLines = Math.floor(scrollViewportHeight / this.lineHeight);
        
        if (this.lines.length > scrollViewportLines) {
            const scrollBarHeight = Math.max(20, (scrollViewportLines / this.lines.length) * scrollViewportHeight);
            const maxScroll = Math.max(1, this.lines.length - scrollViewportLines);
            const scrollBarY = (this.scrollOffset / maxScroll) * (scrollViewportHeight - scrollBarHeight);
            
            this.ctx.fillStyle = 'rgba(80, 80, 80, 0.06)';
            this.ctx.fillRect(this.canvas.width - 12, scrollBarY, 10, scrollBarHeight);
        }
    }
    
    executeAction() {
        if (this.currentAction >= this.actions.length) {
            // Reset to beginning and start over
            this.currentAction = 0;
            this.cursor.line = Math.max(0, this.lines.length - 1);
            this.cursor.char = this.lines[this.cursor.line] ? this.lines[this.cursor.line].length : 0;
            
            // Expand canvas if needed for growing content
            const neededHeight = this.lines.length * this.lineHeight + 100;
            if (neededHeight > this.canvas.height) {
                this.canvas.height = neededHeight;
            }
            return;
        }
        
        const action = this.actions[this.currentAction];
        
        switch (action.type) {
            case 'type':
                if (this.actionProgress < action.text.length) {
                    const char = action.text[this.actionProgress];
                    if (char === '\n') {
                        // New line
                        const currentLine = this.lines[this.cursor.line] || '';
                        const beforeCursor = currentLine.substring(0, this.cursor.char);
                        const afterCursor = currentLine.substring(this.cursor.char);
                        
                        this.lines[this.cursor.line] = beforeCursor;
                        this.lines.splice(this.cursor.line + 1, 0, afterCursor);
                        
                        this.cursor.line++;
                        this.cursor.char = 0;
                    } else {
                        // Regular character
                        if (!this.lines[this.cursor.line]) {
                            this.lines[this.cursor.line] = '';
                        }
                        
                        const line = this.lines[this.cursor.line];
                        this.lines[this.cursor.line] = 
                            line.substring(0, this.cursor.char) + 
                            char + 
                            line.substring(this.cursor.char);
                        
                        this.cursor.char++;
                    }
                    this.actionProgress++;
                } else {
                    this.currentAction++;
                    this.actionProgress = 0;
                }
                break;
                
            case 'navigate':
                this.cursor.line = Math.min(action.line, this.lines.length - 1);
                this.cursor.char = Math.min(action.char, this.lines[this.cursor.line]?.length || 0);
                this.currentAction++;
                this.actionProgress = 0;
                break;
                
            case 'edit':
                this.lines[this.cursor.line] = action.text;
                this.cursor.char = action.text.length;
                this.currentAction++;
                this.actionProgress = 0;
                break;
        }
        
        // Only auto-scroll if mouse is not actively controlling scroll
        if (!this.isMouseOverCanvas) {
            this.autoScrollToCursor();
        }
    }
    
    autoScrollToCursor() {
        const viewportHeight = window.innerHeight;
        const visibleLines = Math.floor(viewportHeight / this.lineHeight) - 1;
        
        // Gently follow the cursor when adding new content
        if (this.cursor.line >= this.scrollOffset + visibleLines - 5) {
            this.scrollOffset = Math.max(0, this.cursor.line - visibleLines + 8);
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawEditor();
        
        this.time++;
        
        // Execute actions at varied speeds, slightly slower for readability
        if (this.time % (4 + Math.floor(Math.random() * 3)) === 0) {
            this.executeAction();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in Astro
if (typeof window !== 'undefined') {
    window.CodeEditorBackground = CodeEditorBackground;
    
    // Auto-initialize when DOM is ready
    function initializeEditor() {
        if (document.body && document.body.classList.contains('digital-view')) {
            console.log('Initializing CodeEditorBackground...');
            try {
                new CodeEditorBackground('ascii-blueprint');
            } catch (error) {
                console.error('Error initializing CodeEditorBackground:', error);
            }
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEditor);
    } else {
        // DOM already loaded
        initializeEditor();
    }
}