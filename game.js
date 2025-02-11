class Frog {
    constructor(x, y, size, game) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.game = game;
        this.color = '#2ecc71';
    }

    draw(ctx) {
        // Draw frog body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw eyes
        ctx.fillStyle = '#000000';
        const eyeSize = this.size / 6;
        const eyeOffset = this.size / 4;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(this.x + eyeOffset, this.y + eyeOffset, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(this.x + this.size - eyeOffset, this.y + eyeOffset, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
    }

    move(direction) {
        const oldX = this.x;
        const oldY = this.y;

        switch(direction) {
            case 'up':
                this.y -= this.size;
                break;
            case 'down':
                this.y += this.size;
                break;
            case 'left':
                this.x -= this.size;
                break;
            case 'right':
                this.x += this.size;
                break;
        }

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.size > this.game.width) this.x = this.game.width - this.size;
        if (this.y < 0) this.y = 0;
        if (this.y + this.size > this.game.height) this.y = this.game.height - this.size;

        // Check if frog reached the top
        if (this.y === 0) {
            this.game.score++;
            this.reset();
            document.getElementById('score').textContent = this.game.score;
        }
    }

    reset() {
        this.x = this.game.width / 2 - this.size / 2;
        this.y = this.game.height - this.size;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.cellSize = 40;
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        
        // Initialize frog
        this.frog = new Frog(
            this.width / 2 - this.cellSize / 2,
            this.height - this.cellSize,
            this.cellSize,
            this
        );
        
        // Bind event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Start game loop
        this.gameLoop();
    }

    handleKeyPress(event) {
        if (this.gameOver) return;

        switch(event.key) {
            case 'ArrowUp':
                this.frog.move('up');
                break;
            case 'ArrowDown':
                this.frog.move('down');
                break;
            case 'ArrowLeft':
                this.frog.move('left');
                break;
            case 'ArrowRight':
                this.frog.move('right');
                break;
        }
    }

    loseLife() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        
        if (this.lives <= 0) {
            this.gameOver = true;
            document.getElementById('gameOver').classList.remove('hidden');
        } else {
            this.frog.reset();
        }
    }

    reset() {
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('score').textContent = this.score;
        document.getElementById('gameOver').classList.add('hidden');
        this.frog.reset();
    }

    drawBackground() {
        const laneHeight = this.cellSize;
        const numLanes = 5;
        const totalRoadHeight = numLanes * laneHeight;
        const safeZoneHeight = laneHeight;

        // Draw road lanes first
        for (let i = 0; i < numLanes; i++) {
            // Alternate road colors for better visibility
            this.ctx.fillStyle = i % 2 === 0 ? '#808080' : '#696969';
            const y = safeZoneHeight + (i * laneHeight); // Start after top safe zone
            this.ctx.fillRect(0, y, this.width, laneHeight);

            // Draw lane markers (dashed lines)
            if (i < numLanes - 1) {  // Don't draw after last lane
                this.ctx.setLineDash([20, 20]);  // Create dashed line
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.moveTo(0, y + laneHeight);
                this.ctx.lineTo(this.width, y + laneHeight);
                this.ctx.stroke();
                this.ctx.setLineDash([]);  // Reset line style
            }
        }

        // Draw safe zones (start and finish) on top and bottom
        this.ctx.fillStyle = '#FFC0CB';  // Pink for safe zones
        this.ctx.fillRect(0, 0, this.width, safeZoneHeight);  // Finish zone at top
        this.ctx.fillRect(0, safeZoneHeight + totalRoadHeight, this.width, safeZoneHeight);  // Start zone at bottom
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw frog
        this.frog.draw(this.ctx);
    }

    gameLoop() {
        if (!this.gameOver) {
            this.draw();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
