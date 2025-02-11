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

        // Horizontal boundary checks only
        if (this.x < 0) this.x = 0;
        if (this.x + this.size > this.game.width) this.x = this.game.width - this.size;

        // Prevent moving below bottom safe zone
        const bottomSafeZoneStart = this.game.cellSize + (this.game.numLanes * this.game.cellSize);
        if (this.y > bottomSafeZoneStart) {
            this.y = bottomSafeZoneStart;
        }

        // Check if frog reached the top safe zone
        if (this.y <= this.game.cellSize && this.y >= 0) {
            this.game.score++;
            this.reset();
            document.getElementById('score').textContent = this.game.score;
        }
    }

    reset() {
        this.x = this.game.width / 2 - this.size / 2;
        // Position frog in the middle of bottom safe zone
        const safeZoneHeight = this.game.cellSize;
        const totalRoadHeight = this.game.numLanes * this.game.cellSize;
        this.y = safeZoneHeight + totalRoadHeight; // Bottom safe zone start
    }
}

class Car {
    constructor(x, y, width, height, speed, direction) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = direction; // 1 for right, -1 for left
    }

    draw(ctx) {
        // Main car body
        ctx.fillStyle = this.direction > 0 ? '#4A90E2' : '#E24A4A';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Windows
        ctx.fillStyle = '#87CEFA';
        const windowWidth = this.width * 0.2;
        const windowHeight = this.height * 0.5;
        const windowY = this.y + (this.height - windowHeight) / 2;
        
        // Front window
        const frontWindowX = this.direction > 0 ? 
            this.x + this.width - windowWidth - 5 : 
            this.x + 5;
        ctx.fillRect(frontWindowX, windowY, windowWidth, windowHeight);
        
        // Back window
        const backWindowX = this.direction > 0 ? 
            this.x + 5 : 
            this.x + this.width - windowWidth - 5;
        ctx.fillRect(backWindowX, windowY, windowWidth, windowHeight);
    }

    update() {
        this.x += this.speed * this.direction;
        
        // Wrap around when car goes off screen
        if (this.direction > 0 && this.x > 600) { // Canvas width is 600
            this.x = -this.width;
        } else if (this.direction < 0 && this.x + this.width < 0) {
            this.x = 600;
        }
    }

    collidesWith(frog) {
        return !(this.x + this.width < frog.x ||
                this.x > frog.x + frog.size ||
                this.y + this.height < frog.y ||
                this.y > frog.y + frog.size);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.numLanes = 10;
        // Adjust cell size to fit 10 lanes plus 2 safe zones
        this.cellSize = Math.floor(this.height / (this.numLanes + 2));
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        
        // Initialize cars
        this.cars = [];
        this.initializeCars();

        // Initialize frog in bottom safe zone
        const safeZoneHeight = this.cellSize;
        const totalRoadHeight = this.numLanes * this.cellSize;
        this.frog = new Frog(
            this.width / 2 - this.cellSize / 2,
            safeZoneHeight + totalRoadHeight,  // Position in bottom safe zone
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
        const totalRoadHeight = this.numLanes * laneHeight;
        const safeZoneHeight = laneHeight;

        // Draw road lanes first
        for (let i = 0; i < this.numLanes; i++) {
            // Alternate road colors for better visibility
            this.ctx.fillStyle = i % 2 === 0 ? '#808080' : '#696969';
            const y = safeZoneHeight + (i * laneHeight); // Start after top safe zone
            this.ctx.fillRect(0, y, this.width, laneHeight);

            // Draw lane markers (dashed lines)
            if (i < this.numLanes - 1) {  // Don't draw after last lane
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

    initializeCars() {
        const carWidth = this.cellSize * 1.5;
        const carHeight = this.cellSize * 0.8;
        const carsPerLane = 4;
        
        for (let lane = 0; lane < this.numLanes; lane++) {
            const y = this.cellSize + (lane * this.cellSize) + (this.cellSize - carHeight) / 2;
            const direction = lane % 2 === 0 ? 1 : -1;
            const speed = 1.5 + (lane % 3); // Slightly slower base speed
            
            for (let i = 0; i < carsPerLane; i++) {
                const spacing = 600 / (carsPerLane - 0.5); // Add some extra space between cars
                let x = i * spacing;
                // For cars moving left, start from the right side
                if (direction < 0) {
                    x = 600 - (i * spacing);
                }
                this.cars.push(new Car(x, y, carWidth, carHeight, speed, direction));
            }
        }
    }

    checkCollisions() {
        for (const car of this.cars) {
            if (car.collidesWith(this.frog)) {
                this.loseLife();
                break;
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw cars
        for (const car of this.cars) {
            car.draw(this.ctx);
        }
        
        // Draw frog
        this.frog.draw(this.ctx);
    }

    gameLoop() {
        if (!this.gameOver) {
            // Update cars
            for (const car of this.cars) {
                car.update();
            }
            
            // Check collisions
            this.checkCollisions();
            
            // Draw everything
            this.draw();
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};
