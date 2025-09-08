class ASCIIBlueprint {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        console.log('ASCII Blueprint initializing...');
        this.ctx = this.canvas.getContext('2d');
        this.blueprints = [];
        this.mousePos = { x: 0, y: 0 };
        this.time = 0;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        
        // Start with first blueprint immediately
        this.createNewBlueprint();
        setTimeout(() => this.createNewBlueprint(), 2000);
        setTimeout(() => this.createNewBlueprint(), 4000);
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createNewBlueprint() {
        const types = ['ui-window', 'flowchart', 'circuit', 'database', 'mobile-ui'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Random position on screen
        const x = Math.random() * (this.canvas.width - 200) + 100;
        const y = Math.random() * (this.canvas.height - 200) + 100;
        
        const blueprint = {
            type: type,
            x: x,
            y: y,
            progress: 0,
            opacity: 0,
            elements: this.generateBlueprintElements(type, x, y),
            fadeOut: false,
            age: 0
        };
        
        this.blueprints.push(blueprint);
    }
    
    generateBlueprintElements(type, baseX, baseY) {
        const elements = [];
        
        switch(type) {
            case 'ui-window':
                // Randomize window dimensions
                const winWidth = 120 + Math.random() * 100;
                const winHeight = 80 + Math.random() * 80;
                const titleHeight = 15 + Math.random() * 10;
                
                // Window frame
                elements.push({
                    type: 'rect',
                    x: baseX,
                    y: baseY,
                    width: winWidth,
                    height: winHeight,
                    progress: 0
                });
                // Title bar
                elements.push({
                    type: 'line',
                    x1: baseX,
                    y1: baseY + titleHeight,
                    x2: baseX + winWidth,
                    y2: baseY + titleHeight,
                    progress: 0
                });
                // Random number of buttons
                const numButtons = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < numButtons; i++) {
                    elements.push({
                        type: 'circle',
                        x: baseX + 8 + i * 12,
                        y: baseY + titleHeight/2,
                        radius: 3 + Math.random() * 2,
                        progress: 0
                    });
                }
                // Random content elements
                const numLines = Math.floor(Math.random() * 5) + 2;
                for (let i = 0; i < numLines; i++) {
                    const lineLength = Math.random() * 0.7 + 0.2;
                    elements.push({
                        type: 'line',
                        x1: baseX + 10,
                        y1: baseY + titleHeight + 15 + i * 15,
                        x2: baseX + 10 + winWidth * lineLength,
                        y2: baseY + titleHeight + 15 + i * 15,
                        progress: 0
                    });
                }
                // Maybe add some buttons
                if (Math.random() > 0.5) {
                    const btnWidth = 30 + Math.random() * 20;
                    const btnHeight = 15 + Math.random() * 5;
                    elements.push({
                        type: 'rect',
                        x: baseX + winWidth - btnWidth - 10,
                        y: baseY + winHeight - btnHeight - 10,
                        width: btnWidth,
                        height: btnHeight,
                        progress: 0
                    });
                }
                break;
                
            case 'flowchart':
                // Random flowchart structure
                const numNodes = Math.floor(Math.random() * 4) + 3;
                const nodePositions = [];
                
                for (let i = 0; i < numNodes; i++) {
                    const nodeX = baseX + (Math.random() - 0.5) * 100;
                    const nodeY = baseY + i * 40;
                    nodePositions.push({x: nodeX, y: nodeY});
                    
                    // Random node type
                    const nodeType = Math.random();
                    if (nodeType < 0.3) {
                        elements.push({
                            type: 'circle',
                            x: nodeX,
                            y: nodeY,
                            radius: 10 + Math.random() * 10,
                            progress: 0
                        });
                    } else if (nodeType < 0.6) {
                        elements.push({
                            type: 'rect',
                            x: nodeX - 20 - Math.random() * 10,
                            y: nodeY - 10,
                            width: 40 + Math.random() * 20,
                            height: 20 + Math.random() * 10,
                            progress: 0
                        });
                    } else {
                        elements.push({
                            type: 'diamond',
                            x: nodeX,
                            y: nodeY,
                            size: 15 + Math.random() * 10,
                            progress: 0
                        });
                    }
                }
                
                // Connect nodes with lines
                for (let i = 0; i < nodePositions.length - 1; i++) {
                    if (Math.random() > 0.2) {
                        elements.push({
                            type: 'line',
                            x1: nodePositions[i].x,
                            y1: nodePositions[i].y,
                            x2: nodePositions[i + 1].x,
                            y2: nodePositions[i + 1].y,
                            progress: 0
                        });
                    }
                }
                break;
                
            case 'circuit':
                // Random circuit board pattern
                const cols = Math.floor(Math.random() * 3) + 3;
                const rows = Math.floor(Math.random() * 3) + 2;
                const spacing = 25 + Math.random() * 20;
                const nodes = [];
                
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const nx = baseX + i * spacing + (Math.random() - 0.5) * 10;
                        const ny = baseY + j * spacing + (Math.random() - 0.5) * 10;
                        nodes.push({x: nx, y: ny});
                        
                        // Random component type
                        if (Math.random() > 0.7) {
                            // Chip
                            elements.push({
                                type: 'rect',
                                x: nx - 8,
                                y: ny - 8,
                                width: 16,
                                height: 16,
                                progress: 0
                            });
                        } else if (Math.random() > 0.5) {
                            // Junction
                            elements.push({
                                type: 'square',
                                x: nx - 3,
                                y: ny - 3,
                                size: 6,
                                progress: 0
                            });
                        } else {
                            // Connection point
                            elements.push({
                                type: 'circle',
                                x: nx,
                                y: ny,
                                radius: 3,
                                progress: 0
                            });
                        }
                    }
                }
                
                // Create random connections
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                        if (dist < spacing * 1.5 && Math.random() > 0.6) {
                            elements.push({
                                type: 'line',
                                x1: nodes[i].x,
                                y1: nodes[i].y,
                                x2: nodes[j].x,
                                y2: nodes[j].y,
                                progress: 0
                            });
                        }
                    }
                }
                break;
                
            case 'database':
                // Database cylinder
                elements.push({
                    type: 'ellipse',
                    x: baseX,
                    y: baseY,
                    width: 60,
                    height: 15,
                    progress: 0
                });
                elements.push({
                    type: 'rect',
                    x: baseX - 30,
                    y: baseY,
                    width: 60,
                    height: 60,
                    progress: 0
                });
                elements.push({
                    type: 'ellipse',
                    x: baseX,
                    y: baseY + 60,
                    width: 60,
                    height: 15,
                    progress: 0
                });
                // Table rows
                for (let i = 0; i < 3; i++) {
                    elements.push({
                        type: 'line',
                        x1: baseX - 25,
                        y1: baseY + 20 + i * 12,
                        x2: baseX + 25,
                        y2: baseY + 20 + i * 12,
                        progress: 0
                    });
                }
                break;
                
            case 'mobile-ui':
                // Random phone dimensions
                const phoneWidth = 60 + Math.random() * 30;
                const phoneHeight = 100 + Math.random() * 50;
                
                // Phone frame
                elements.push({
                    type: 'roundRect',
                    x: baseX,
                    y: baseY,
                    width: phoneWidth,
                    height: phoneHeight,
                    radius: 4 + Math.random() * 6,
                    progress: 0
                });
                // Screen
                elements.push({
                    type: 'rect',
                    x: baseX + 5,
                    y: baseY + 8,
                    width: phoneWidth - 10,
                    height: phoneHeight - 20,
                    progress: 0
                });
                
                // Random UI elements
                const uiType = Math.random();
                if (uiType < 0.3) {
                    // Grid of icons
                    const cols = Math.floor(Math.random() * 2) + 3;
                    const rows = Math.floor(Math.random() * 3) + 2;
                    for (let i = 0; i < rows; i++) {
                        for (let j = 0; j < cols; j++) {
                            if (Math.random() > 0.2) {
                                elements.push({
                                    type: Math.random() > 0.5 ? 'square' : 'circle',
                                    x: baseX + 12 + j * (phoneWidth/cols),
                                    y: baseY + 20 + i * 20,
                                    size: 8 + Math.random() * 4,
                                    radius: 4 + Math.random() * 2,
                                    progress: 0
                                });
                            }
                        }
                    }
                } else if (uiType < 0.6) {
                    // List view
                    const numItems = Math.floor(Math.random() * 5) + 3;
                    for (let i = 0; i < numItems; i++) {
                        elements.push({
                            type: 'line',
                            x1: baseX + 10,
                            y1: baseY + 20 + i * 15,
                            x2: baseX + phoneWidth - 10,
                            y2: baseY + 20 + i * 15,
                            progress: 0
                        });
                    }
                } else {
                    // Mixed UI
                    // Header
                    elements.push({
                        type: 'rect',
                        x: baseX + 8,
                        y: baseY + 15,
                        width: phoneWidth - 16,
                        height: 20,
                        progress: 0
                    });
                    // Content areas
                    for (let i = 0; i < 2; i++) {
                        elements.push({
                            type: 'rect',
                            x: baseX + 8,
                            y: baseY + 45 + i * 30,
                            width: phoneWidth - 16,
                            height: 25,
                            progress: 0
                        });
                    }
                }
                
                // Maybe add home indicator
                if (Math.random() > 0.5) {
                    elements.push({
                        type: 'line',
                        x1: baseX + phoneWidth/2 - 15,
                        y1: baseY + phoneHeight - 5,
                        x2: baseX + phoneWidth/2 + 15,
                        y2: baseY + phoneHeight - 5,
                        progress: 0
                    });
                }
                break;
        }
        
        return elements;
    }
    
    drawElement(element, opacity) {
        // Use cyan for active drawing, fade to subtle blue for background
        const isBackground = opacity < 0.1;
        if (isBackground) {
            this.ctx.strokeStyle = `rgba(26, 58, 82, ${opacity * 2})`;
        } else {
            this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
        }
        this.ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 0.3})`;
        this.ctx.lineWidth = 0.5;
        
        const progress = element.progress;
        
        switch(element.type) {
            case 'rect':
                this.ctx.strokeRect(
                    element.x,
                    element.y,
                    element.width * progress,
                    element.height * progress
                );
                break;
                
            case 'roundRect':
                const w = element.width * progress;
                const h = element.height * progress;
                const r = element.radius;
                this.ctx.beginPath();
                this.ctx.moveTo(element.x + r, element.y);
                this.ctx.lineTo(element.x + w - r, element.y);
                this.ctx.arcTo(element.x + w, element.y, element.x + w, element.y + r, r);
                this.ctx.lineTo(element.x + w, element.y + h - r);
                this.ctx.arcTo(element.x + w, element.y + h, element.x + w - r, element.y + h, r);
                this.ctx.lineTo(element.x + r, element.y + h);
                this.ctx.arcTo(element.x, element.y + h, element.x, element.y + h - r, r);
                this.ctx.lineTo(element.x, element.y + r);
                this.ctx.arcTo(element.x, element.y, element.x + r, element.y, r);
                this.ctx.stroke();
                break;
                
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(element.x, element.y, element.radius * progress, 0, Math.PI * 2 * progress);
                this.ctx.stroke();
                break;
                
            case 'square':
                const size = element.size * progress;
                this.ctx.strokeRect(element.x, element.y, size, size);
                break;
                
            case 'line':
                const x2 = element.x1 + (element.x2 - element.x1) * progress;
                const y2 = element.y1 + (element.y2 - element.y1) * progress;
                this.ctx.beginPath();
                this.ctx.moveTo(element.x1, element.y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                break;
                
            case 'ellipse':
                this.ctx.beginPath();
                this.ctx.ellipse(
                    element.x,
                    element.y,
                    element.width * progress,
                    element.height * progress,
                    0, 0, Math.PI * 2
                );
                this.ctx.stroke();
                break;
                
            case 'diamond':
                const s = element.size * progress;
                this.ctx.beginPath();
                this.ctx.moveTo(element.x, element.y - s);
                this.ctx.lineTo(element.x + s, element.y);
                this.ctx.lineTo(element.x, element.y + s);
                this.ctx.lineTo(element.x - s, element.y);
                this.ctx.closePath();
                this.ctx.stroke();
                break;
        }
    }
    
    drawGrid() {
        // Very subtle background grid
        this.ctx.fillStyle = 'rgba(26, 58, 82, 0.05)';
        
        for (let x = 0; x < this.canvas.width; x += 20) {
            for (let y = 0; y < this.canvas.height; y += 20) {
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        
        // Update and draw blueprints
        this.blueprints = this.blueprints.filter(blueprint => {
            blueprint.age++;
            
            // Fade in
            if (blueprint.opacity < 0.4 && !blueprint.fadeOut) {
                blueprint.opacity += 0.008;
            }
            
            // Start fading to background after some time
            if (blueprint.age > 400 && !blueprint.fadeOut) {
                blueprint.fadeOut = true;
            }
            
            if (blueprint.fadeOut) {
                // Fade to background opacity, not zero
                if (blueprint.opacity > 0.05) {
                    blueprint.opacity -= 0.003;
                }
            }
            
            // Animate elements much slower for visible drawing
            blueprint.elements.forEach((element, index) => {
                const delay = index * 8; // Bigger stagger between elements
                if (blueprint.age > delay && element.progress < 1) {
                    element.progress += 0.008; // Much slower drawing
                    if (element.progress > 1) element.progress = 1;
                }
                
                // Only draw if has some progress
                if (element.progress > 0) {
                    this.drawElement(element, blueprint.opacity);
                }
            });
            
            return true; // Never remove blueprints, they stay as background
        });
        
        // Add new blueprints occasionally
        if (this.time % 200 === 0 && this.blueprints.length < 15) {
            this.createNewBlueprint();
        }
        
        this.time++;
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Export for use in Astro
if (typeof window !== 'undefined') {
    window.ASCIIBlueprint = ASCIIBlueprint;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('digital-view')) {
                new ASCIIBlueprint('ascii-blueprint');
            }
        });
    } else {
        // DOM already loaded
        if (document.body.classList.contains('digital-view')) {
            new ASCIIBlueprint('ascii-blueprint');
        }
    }
}