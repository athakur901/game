class Frog {
    constructor(x, y, size, game) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.game = game;
        this.color = '#2ecc71';
        this.isHit = false;
        this.hitAnimation = 0;
        this.successAnimation = 0;
    }

    draw(ctx) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;

        if (this.successAnimation > 0) {
            // Draw sparkle effect
            const sparkleCount = 12;
            const radius = this.size * (0.6 + Math.sin(this.successAnimation * 0.2) * 0.2);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            
            for (let i = 0; i < sparkleCount; i++) {
                const angle = (i / sparkleCount) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.moveTo(x - 8, y - 8);
                ctx.lineTo(x + 8, y + 8);
                ctx.moveTo(x - 8, y + 8);
                ctx.lineTo(x + 8, y - 8);
                ctx.stroke();
            }
            
            this.successAnimation--;
        }
        
        const isHit = this.hitAnimation > 0;
        const hitColor = this.hitAnimation % 2 === 0 ? '#FF0000' : '#2ecc71';
        
        // Draw legs
        ctx.fillStyle = isHit ? hitColor : '#1a9850';
        // Back legs
        ctx.beginPath();
        ctx.ellipse(this.x + this.size * 0.2, this.y + this.size * 0.8, this.size * 0.2, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + this.size * 0.8, this.y + this.size * 0.8, this.size * 0.2, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Front legs
        ctx.beginPath();
        ctx.ellipse(this.x + this.size * 0.25, this.y + this.size * 0.3, this.size * 0.2, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + this.size * 0.75, this.y + this.size * 0.3, this.size * 0.2, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw body
        ctx.fillStyle = isHit ? hitColor : '#2ecc71';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#ffffff';
        const eyeSize = this.size * 0.15;
        const eyeOffset = this.size * 0.15;
        // Eye whites
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, centerY - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, centerY - eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = '#000000';
        const pupilSize = eyeSize * 0.5;
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, centerY - eyeOffset, pupilSize, 0, Math.PI * 2);
        ctx.arc(centerX + eyeOffset, centerY - eyeOffset, pupilSize, 0, Math.PI * 2);
        ctx.fill();

        if (this.hitAnimation > 0) {
            this.hitAnimation--;
        }
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
            this.successAnimation = 30; // Number of frames for success animation
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
        // Get frog's center point and radius
        const frogCenterX = frog.x + frog.size / 2;
        const frogCenterY = frog.y + frog.size / 2;
        const frogRadius = frog.size * 0.4; // Same as body radius in draw method

        // Find closest point on car to frog center
        const closestX = Math.max(this.x, Math.min(frogCenterX, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(frogCenterY, this.y + this.height));

        // Calculate distance between closest point and frog center
        const distanceX = frogCenterX - closestX;
        const distanceY = frogCenterY - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        return distanceSquared < (frogRadius * frogRadius);
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
        document.getElementById('gameOver').addEventListener('click', () => {
            if (this.gameOver) {
                this.reset();
            }
        });
        
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
            this.frog.hitAnimation = 10; // Number of frames for hit animation
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
        const carsPerLane = 2;
        const minGap = carWidth * 2; // Minimum gap between cars in the same lane
        
        for (let lane = 0; lane < this.numLanes; lane++) {
            const y = this.cellSize + (lane * this.cellSize) + (this.cellSize - carHeight) / 2;
            const direction = lane % 2 === 0 ? 1 : -1;
            // Slower speeds for each lane type
            let speed;
            switch (lane % 3) {
                case 0:
                    speed = 0.8; // Slow lanes
                    break;
                case 1:
                    speed = 1.2; // Medium lanes
                    break;
                case 2:
                    speed = 1.6; // Fast lanes
                    break;
            }
            
            // Generate random positions for cars in this lane
            const positions = [];
            for (let i = 0; i < carsPerLane; i++) {
                let x;
                do {
                    x = Math.random() * (600 - carWidth); // Random position within canvas width
                } while (positions.some(pos => Math.abs(pos - x) < minGap)); // Ensure minimum gap
                positions.push(x);
                
                // For cars moving left, adjust their initial position
                if (direction < 0) {
                    x = 600 - x - carWidth;
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
