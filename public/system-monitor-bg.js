class SystemMonitorBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        
        console.log('System Monitor Background initializing...');
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        
        // System metrics
        this.cpuHistory = [];
        this.memoryHistory = [];
        this.networkHistory = [];
        this.batteryLevel = 100;
        this.processes = [];
        
        // Mouse tracking for mask
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        
        // Display settings
        this.maxHistoryLength = 100;
        this.updateInterval = 1000; // Update every second
        this.lastUpdate = 0;
        
        // Layout
        this.padding = 20;
        this.chartHeight = 60;
        this.chartSpacing = 80;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Add mouse tracking
        window.addEventListener('mousemove', (e) => this.updateMousePosition(e));
        
        // Start collecting system data
        this.collectSystemData();
        
        this.animate();
    }
    
    updateMousePosition(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    
    calculateMaskRotation(maskCenterX, maskCenterY) {
        // Calculate target rotation based on mouse position relative to mask center
        const maxDistance = 300; // Max distance for full rotation
        
        // Calculate relative position to the mask center
        const deltaX = this.mouseX - maskCenterX;
        const deltaY = this.mouseY - maskCenterY;
        
        // Normalize to -1 to 1 based on distance
        const relativeX = Math.max(-1, Math.min(1, deltaX / maxDistance));
        const relativeY = Math.max(-1, Math.min(1, deltaY / maxDistance));
        
        // Set target rotation
        this.targetRotationX = relativeY * 0.3; // Max 30% rotation on Y axis
        this.targetRotationY = relativeX * 0.4;  // Max 40% rotation on X axis
    }
    
    resize() {
        // Get device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        this.ctx.scale(dpr, dpr);
    }
    
    async collectSystemData() {
        try {
            // Use simulated CPU data (removed API call to stop errors)
            let cpuUsage = Math.sin(Date.now() / 10000) * 30 + 40 + Math.random() * 20;
            
            // Real memory usage from browser
            const memoryUsage = performance.memory ? 
                (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100 : 
                50 + Math.random() * 20;
            
            // Real network info
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const networkUsage = connection ? 
                (connection.downlink || 10) * 1024 : // Convert Mbps to Kbps
                Math.random() * 50 + 10;
            
            // Real battery API
            if (navigator.getBattery) {
                const battery = await navigator.getBattery();
                this.batteryLevel = battery.level * 100;
                this.isCharging = battery.charging;
            }
            
            // Add to history
            this.cpuHistory.push({ time: Date.now(), value: cpuUsage });
            this.memoryHistory.push({ time: Date.now(), value: memoryUsage });
            this.networkHistory.push({ time: Date.now(), value: networkUsage });
            
            // Trim history
            if (this.cpuHistory.length > this.maxHistoryLength) {
                this.cpuHistory.shift();
                this.memoryHistory.shift();
                this.networkHistory.shift();
            }
            
            // Generate fake process list
            this.updateProcessList();
            
        } catch (error) {
            console.log('System data collection error:', error);
        }
        
        // Schedule next update
        setTimeout(() => this.collectSystemData(), this.updateInterval);
    }
    
    updateProcessList() {
        const processes = [
            'node server.js',
            'npm run dev',
            'code --no-sandbox',
            'git fetch origin',
            'rust-analyzer',
            'cargo build',
            'docker ps',
            'firebase deploy',
            'flutter run',
            'postgres',
        ];
        
        this.processes = processes.map(name => ({
            name,
            cpu: Math.random() * 15,
            memory: Math.random() * 200 + 50,
            pid: Math.floor(Math.random() * 9000) + 1000
        })).slice(0, 6);
    }
    
    drawChart(x, y, width, height, data, color, label, unit = '%') {
        if (data.length < 2) return;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
        this.ctx.fillRect(x, y, width, height);
        
        // Border
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(x, y, width, height);
        
        // Label
        this.ctx.font = '12px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        this.ctx.fillText(label, x + 5, y - 5);
        
        // Current value
        const currentValue = data[data.length - 1]?.value || 0;
        this.ctx.fillStyle = color;
        this.ctx.fillText(`${currentValue.toFixed(1)}${unit}`, x + width - 60, y - 5);
        
        // Chart line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        const maxValue = Math.max(100, Math.max(...data.map(d => d.value)));
        
        data.forEach((point, i) => {
            const chartX = x + (i / (this.maxHistoryLength - 1)) * width;
            const chartY = y + height - (point.value / maxValue) * height;
            
            if (i === 0) {
                this.ctx.moveTo(chartX, chartY);
            } else {
                this.ctx.lineTo(chartX, chartY);
            }
        });
        
        this.ctx.stroke();
        
        // Fill area under curve
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = color;
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    drawProcessList() {
        // Right side, second cell (1x1) - positioned in right available space
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvEndX = ((window.innerWidth - cvTotalWidth) / 2) + cvTotalWidth;
        const rightSpace = window.innerWidth - cvEndX;
        const x = cvEndX + Math.max(20, (rightSpace - 280) / 2); // Center in right available space
        
        const cellHeight = window.innerHeight / 4;
        const cellBottom = cellHeight * 2; // Bottom of second cell
        const contentHeight = 20 + (5 * 16); // Header + 5 processes
        const y = cellBottom - contentHeight - 10; // Align to bottom with padding
        
        this.ctx.font = '11px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.fillText('PROCESSES', x, y);
        
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.25)';
        this.ctx.font = '10px JetBrains Mono';
        
        // Limit to 5 processes to fit in 1x1 cell
        this.processes.slice(0, 5).forEach((proc, i) => {
            const processY = y + 20 + i * 16;
            
            // PID
            this.ctx.fillText(proc.pid.toString().padStart(4), x, processY);
            
            // CPU
            this.ctx.fillText(`${proc.cpu.toFixed(1)}%`, x + 40, processY);
            
            // Memory
            this.ctx.fillText(`${proc.memory.toFixed(0)}M`, x + 80, processY);
            
            // Process name (truncated)
            const name = proc.name.length > 18 ? proc.name.substring(0, 15) + '...' : proc.name;
            this.ctx.fillText(name, x + 120, processY);
        });
    }
    
    drawSystemInfo() {
        // Left side, fourth cell (1x1) - positioned in left available space
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvStartX = (window.innerWidth - cvTotalWidth) / 2;
        const leftSpace = cvStartX;
        const x = Math.max(20, (leftSpace - 200) / 2); // Center in left available space
        
        const cellHeight = window.innerHeight / 4;
        const cellBottom = window.innerHeight; // Bottom of fourth cell
        const contentHeight = 20 + (5 * 14); // Header + 5 info lines
        const y = cellBottom - contentHeight - 20; // Align to bottom with padding
        
        this.ctx.font = '11px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.fillText('SYSTEM', x, y);
        
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.25)';
        this.ctx.font = '10px JetBrains Mono';
        
        const uptime = Math.floor((Date.now() - (performance.timeOrigin || Date.now())) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        // Real browser memory info
        const memoryInfo = performance.memory ? 
            `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)}MB` : 'N/A';
        
        const info = [
            `UPTIME: ${hours}h ${minutes}m`,
            `BATTERY: ${this.batteryLevel.toFixed(0)}%${this.isCharging ? ' ⚡' : ''}`,
            `CORES: ${navigator.hardwareConcurrency || 'N/A'}`,
            `HEAP: ${memoryInfo}`,
            `PLATFORM: ${navigator.platform}`
        ];
        
        info.forEach((text, i) => {
            this.ctx.fillText(text, x, y + 20 + i * 14);
        });
    }
    
    drawNetworkActivity() {
        // Right side, fourth cell (1x1) - positioned in right available space
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvEndX = ((window.innerWidth - cvTotalWidth) / 2) + cvTotalWidth;
        const rightSpace = window.innerWidth - cvEndX;
        const x = cvEndX + Math.max(20, (rightSpace - 280) / 2); // Center in right available space
        
        const cellHeight = window.innerHeight / 4;
        const cellBottom = window.innerHeight; // Bottom of fourth cell
        const contentHeight = 20 + (4 * 14) + 20; // Header + 4 info lines + bars
        const y = cellBottom - contentHeight - 20; // Align to bottom with padding
        
        this.ctx.font = '11px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.fillText('NETWORK', x, y);
        
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.25)';
        this.ctx.font = '10px JetBrains Mono';
        
        const activity = this.networkHistory[this.networkHistory.length - 1]?.value || 0;
        const intensity = Math.min(1, activity / 1000); // Normalize for Kbps
        
        // Connection info
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';
        const downlink = connection ? connection.downlink : 'N/A';
        
        const netInfo = [
            `TYPE: ${connectionType.toUpperCase()}`,
            `SPEED: ${activity.toFixed(0)} Kbps`,
            `DOWNLINK: ${downlink} Mbps`,
            `ACTIVITY: ${(intensity * 100).toFixed(0)}%`
        ];
        
        netInfo.forEach((text, i) => {
            this.ctx.fillText(text, x, y + 20 + i * 14);
        });
        
        // Small activity bars
        const barX = x + 200;
        for (let i = 0; i < 4; i++) {
            const barHeight = (i + 1) * 3;
            const barIntensity = Math.max(0, intensity - (i * 0.25));
            
            if (barIntensity > 0) {
                this.ctx.fillStyle = `rgba(100, 100, 100, ${barIntensity * 0.3})`;
                this.ctx.fillRect(barX + i * 4, y + 40 - barHeight, 2, barHeight);
            }
        }
    }
    
    drawTimeAndDate() {
        // Right side, first cell (1x1) - positioned in right available space
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvEndX = ((window.innerWidth - cvTotalWidth) / 2) + cvTotalWidth;
        const rightSpace = window.innerWidth - cvEndX;
        const x = cvEndX + Math.max(20, (rightSpace - 260) / 2); // Center in right available space
        
        const cellHeight = window.innerHeight / 4;
        const cellBottom = cellHeight; // Bottom of first cell
        const contentHeight = 20 + 50; // Header + time/date/timezone
        const y = cellBottom - contentHeight - 10; // Align to bottom with padding
        
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const date = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        this.ctx.font = '11px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.fillText('CLOCK', x, y);
        
        this.ctx.font = '14px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.35)';
        this.ctx.fillText(time, x, y + 30);
        
        this.ctx.font = '10px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.25)';
        this.ctx.fillText(date.toUpperCase(), x, y + 50);
        
        // Timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.ctx.fillText(timezone, x, y + 65);
    }
    
    draw3DPalestineFlagRemoved() {
        // Left side, first two cells (1x2) - positioned in left available space
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvStartX = (window.innerWidth - cvTotalWidth) / 2;
        const leftSpace = cvStartX;
        const flagWidth = 300; // Total width for the flag
        const x = Math.max(20, (leftSpace - flagWidth) / 2); // Center in left available space
        
        const cellHeight = window.innerHeight / 4;
        const cellBottom = cellHeight * 2; // Bottom of second cell
        const contentHeight = 180; // Flag height for 2 cells
        const y = cellBottom - contentHeight - 10; // Align to bottom with padding
        const centerX = x + (flagWidth / 2); // Center of flag
        const centerY = y + 90;
        
        this.ctx.font = '11px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        this.ctx.fillText('PALESTINE', x, y);
        
        // Gentle waving animation like flag in the breeze
        const waveTime = this.time * 0.015; // Slower wave animation
        const waveAmplitude = 0.08; // Subtle wave amplitude
        const waveSideMotion = Math.sin(waveTime) * waveAmplitude; // Side-to-side wave
        const waveVerticalMotion = Math.sin(waveTime * 1.3) * (waveAmplitude * 0.5); // Subtle vertical wave
        
        // Very subtle depth variation for flag movement
        const depth = 0.8; // Keep mostly flat, no dramatic 3D rotation
        
        // Much dimmer and subtle appearance
        const flicker = 0.95 + Math.sin(this.time * 0.01) * 0.02; // Very subtle flicker
        const baseOpacity = 0.08; // Much dimmer overall
        
        // Helper function for waving flag projection
        const project3D = (x3d, y3d, z3d) => {
            // Apply gentle waving motion based on horizontal position
            const waveInfluence = (x3d / (flagWidthReal/2)); // -1 to 1 based on x position
            const waveOffsetX = waveInfluence * waveSideMotion * 20; // Right side waves more
            const waveOffsetY = waveInfluence * waveVerticalMotion * 15;
            
            const projectedX = centerX + x3d + waveOffsetX;
            const projectedY = centerY + y3d + waveOffsetY;
            return { x: projectedX, y: projectedY };
        };
        
        // Palestine flag dimensions (bigger size)
        const flagWidthReal = 160; // Increased from 120
        const flagHeightReal = 80;  // Increased from 60
        
        // Flag vertices for 3D rectangle
        const flagVertices = [
            // Front face
            [-flagWidthReal/2, -flagHeightReal/2, 0], // Top left
            [flagWidthReal/2, -flagHeightReal/2, 0],  // Top right
            [flagWidthReal/2, flagHeightReal/2, 0],   // Bottom right
            [-flagWidthReal/2, flagHeightReal/2, 0],  // Bottom left
            // Back face (for 3D depth)
            [-flagWidthReal/2, -flagHeightReal/2, -5], // Top left back
            [flagWidthReal/2, -flagHeightReal/2, -5],  // Top right back
            [flagWidthReal/2, flagHeightReal/2, -5],   // Bottom right back
            [-flagWidthReal/2, flagHeightReal/2, -5]   // Bottom left back
        ];
        
        // Project all vertices
        const projectedVertices = flagVertices.map(v => project3D(v[0], v[1], v[2]));
        
        // Palestine flag colors (red triangle more solid to cover stripes)
        const blackStripe = `rgba(40, 40, 40, ${baseOpacity * flicker})`;
        const whiteStripe = `rgba(100, 100, 100, ${baseOpacity * flicker})`;
        const greenStripe = `rgba(50, 80, 50, ${baseOpacity * flicker})`;
        const redTriangle = `rgba(120, 50, 50, ${baseOpacity * flicker * 3})`; // Much more opaque and redder
        
        // Draw flag base (entire rectangle first)
        const frontFace = projectedVertices.slice(0, 4);
        
        // Draw the complete flag stripes across entire width first
        const stripeHeight = flagHeightReal / 3;
        
        // Black stripe (top) - full width
        const blackTop = project3D(-flagWidthReal/2, -flagHeightReal/2, 0);
        const blackBottom = project3D(flagWidthReal/2, -flagHeightReal/2 + stripeHeight, 0);
        this.ctx.fillStyle = blackStripe;
        this.ctx.fillRect(blackTop.x, blackTop.y, blackBottom.x - blackTop.x, stripeHeight * depth);
        
        // White stripe (middle) - full width
        const whiteTop = project3D(-flagWidthReal/2, -flagHeightReal/2 + stripeHeight, 0);
        const whiteBottom = project3D(flagWidthReal/2, -flagHeightReal/2 + stripeHeight * 2, 0);
        this.ctx.fillStyle = whiteStripe;
        this.ctx.fillRect(whiteTop.x, whiteTop.y, whiteBottom.x - whiteTop.x, stripeHeight * depth);
        
        // Green stripe (bottom) - full width
        const greenTop = project3D(-flagWidthReal/2, -flagHeightReal/2 + stripeHeight * 2, 0);
        const greenBottom = project3D(flagWidthReal/2, flagHeightReal/2, 0);
        this.ctx.fillStyle = greenStripe;
        this.ctx.fillRect(greenTop.x, greenTop.y, greenBottom.x - greenTop.x, stripeHeight * depth);
        
        // Now draw the red triangle ON TOP to cover the stripes on the left
        // Make it bigger to completely cover the left portion
        const triangleVertices = [
            project3D(-flagWidthReal/2, -flagHeightReal/2, 0),     // Top left corner
            project3D(-flagWidthReal/2 + 60, 0, 0),               // Right point (extends further right)
            project3D(-flagWidthReal/2, flagHeightReal/2, 0)      // Bottom left corner
        ];
        
        // Draw the solid red triangle
        this.ctx.fillStyle = redTriangle;
        this.ctx.beginPath();
        this.ctx.moveTo(triangleVertices[0].x, triangleVertices[0].y);
        this.ctx.lineTo(triangleVertices[1].x, triangleVertices[1].y);
        this.ctx.lineTo(triangleVertices[2].x, triangleVertices[2].y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add a second layer to make it even more solid
        this.ctx.globalAlpha = 0.8;
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
        
        // Very subtle outline (much thinner and dimmer)
        this.ctx.strokeStyle = `rgba(70, 70, 70, ${baseOpacity * 0.6 * flicker})`;
        this.ctx.lineWidth = 0.5; // Much thinner border
        
        // Simple flag outline (no bold 3D borders) - reuse frontFace from above
        this.ctx.beginPath();
        frontFace.forEach((vertex, i) => {
            if (i === 0) this.ctx.moveTo(vertex.x, vertex.y);
            else this.ctx.lineTo(vertex.x, vertex.y);
        });
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Very subtle scan lines effect (much dimmer)
        this.ctx.strokeStyle = `rgba(60, 60, 60, ${baseOpacity * 0.15 * flicker})`;
        this.ctx.lineWidth = 0.3;
        const scanLineOffset = (this.time * 1.5) % 20;
        for (let i = -flagHeightReal/2; i <= flagHeightReal/2; i += 5) {
            const scanY = centerY + i + scanLineOffset;
            if (scanY > centerY - flagHeightReal/2 && scanY < centerY + flagHeightReal/2) {
                this.ctx.beginPath();
                this.ctx.moveTo(centerX - flagWidthReal/2, scanY);
                this.ctx.lineTo(centerX + flagWidthReal/2, scanY);
                this.ctx.stroke();
            }
        }
        
        // Status indicators (dimmer)
        this.ctx.font = '9px JetBrains Mono';
        this.ctx.fillStyle = 'rgba(70, 70, 70, 0.15)';
        const wavePhase = (waveTime * 57.2958).toFixed(1);
        this.ctx.fillText(`WAVE: ${wavePhase}°`, x, y + contentHeight + 15);
        this.ctx.fillText(`FREE PALESTINE`, x + 120, y + contentHeight + 15);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Very subtle background
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.01)';
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Calculate CV content area (max-width: 900px, centered with 40px padding)
        const cvMaxWidth = 900;
        const cvPadding = 40;
        const cvTotalWidth = Math.min(cvMaxWidth + (cvPadding * 2), window.innerWidth);
        const cvStartX = (window.innerWidth - cvTotalWidth) / 2;
        const cvEndX = cvStartX + cvTotalWidth;
        
        // Available space on each side of CV
        const leftSpace = cvStartX;
        const rightSpace = window.innerWidth - cvEndX;
        
        // Grid layout: Charts now take the full left side (no flag)
        const cellHeight = window.innerHeight / 3; // Divide into 3 sections instead of 4
        const chartWidth = Math.min(220, leftSpace - 40); // Fit within left space
        const chartHeight = 60; // Slightly bigger charts
        const chartSpacing = 80; // More space between charts
        
        // Charts section - Left side, distributed across full height
        const totalChartsHeight = (chartSpacing * 2) + chartHeight * 3 + 40; // Total height for 3 charts
        const chartsStartY = (window.innerHeight - totalChartsHeight) / 2; // Center vertically
        const chartsX = Math.max(20, (leftSpace - chartWidth) / 2); // Center in left available space
        
        // CPU Chart
        this.drawChart(
            chartsX, 
            chartsStartY, 
            chartWidth, 
            chartHeight,
            this.cpuHistory,
            'rgba(100, 100, 100, 0.3)',
            'CPU',
            '%'
        );
        
        // Memory Chart
        this.drawChart(
            chartsX, 
            chartsStartY + chartSpacing, 
            chartWidth, 
            chartHeight,
            this.memoryHistory,
            'rgba(120, 120, 120, 0.3)',
            'MEMORY',
            '%'
        );
        
        // Network Chart
        this.drawChart(
            chartsX, 
            chartsStartY + chartSpacing * 2, 
            chartWidth, 
            chartHeight,
            this.networkHistory,
            'rgba(80, 80, 80, 0.3)',
            'NETWORK',
            'Kb/s'
        );
        
        // Left side components (no flag, redistributed)
        // Charts take the full left side now
        this.drawSystemInfo();        // Bottom left
        
        // Right side components (1x1 each, all centered)
        this.drawTimeAndDate();      // Cell 1
        this.drawProcessList();       // Cell 2
        // Cell 3 is empty for now
        this.drawNetworkActivity();   // Cell 4
    }
    
    animate() {
        this.draw();
        this.time++;
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in Astro
if (typeof window !== 'undefined') {
    window.SystemMonitorBackground = SystemMonitorBackground;
    
    // Auto-initialize when DOM is ready
    function initializeMonitor() {
        if (document.body && document.body.classList.contains('digital-view')) {
            console.log('Initializing SystemMonitorBackground...');
            try {
                new SystemMonitorBackground('ascii-blueprint');
            } catch (error) {
                console.error('Error initializing SystemMonitorBackground:', error);
            }
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMonitor);
    } else {
        initializeMonitor();
    }
}