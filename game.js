const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 600;
canvas.height = 600;

// Physics constants
const gravity = 0.5;
const friction = 0.99;
const bounceFactor = 0.7;

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    dx: 3,
    dy: 0
};

// Hexagon properties
const hexagonRadius = 250;
const numSides = 6;

// Add rotation properties
let rotationAngle = 0;
const rotationSpeed = 0.050; // Adjust speed as needed

// Modify the hexagon points calculation function
function calculateHexagonPoints() {
    const points = [];
    for (let i = 0; i < numSides; i++) {
        const angle = (i * 2 * Math.PI / numSides) - Math.PI / 2 + rotationAngle;
        points.push({
            x: canvas.width / 2 + hexagonRadius * Math.cos(angle),
            y: canvas.height / 2 + hexagonRadius * Math.sin(angle)
        });
    }
    return points;
}

// Replace the original hexagon points calculation with the function call
let hexagonPoints = calculateHexagonPoints();

function drawHexagon() {
    ctx.beginPath();
    ctx.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
    for (let i = 1; i < hexagonPoints.length; i++) {
        ctx.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0066cc';
    ctx.fill();
    ctx.closePath();
}

function checkCollision() {
    for (let i = 0; i < numSides; i++) {
        const p1 = hexagonPoints[i];
        const p2 = hexagonPoints[(i + 1) % numSides];
        
        // Line segment vector
        const sx = p2.x - p1.x;
        const sy = p2.y - p1.y;
        
        // Vector from line start to ball
        const ballX = ball.x - p1.x;
        const ballY = ball.y - p1.y;
        
        // Project ball onto line segment
        const length = sx * sx + sy * sy;
        const dot = ballX * sx + ballY * sy;
        const t = Math.max(0, Math.min(1, dot / length));
        
        // Closest point on line segment
        const closestX = p1.x + t * sx;
        const closestY = p1.y + t * sy;
        
        // Distance from ball to line segment
        const distance = Math.sqrt(
            Math.pow(ball.x - closestX, 2) + 
            Math.pow(ball.y - closestY, 2)
        );
        
        if (distance < ball.radius) {
            // Normal vector
            const nx = (ball.x - closestX) / distance;
            const ny = (ball.y - closestY) / distance;
            
            // Reflect velocity
            const dot = ball.dx * nx + ball.dy * ny;
            ball.dx = (ball.dx - 2 * dot * nx) * bounceFactor;
            ball.dy = (ball.dy - 2 * dot * ny) * bounceFactor;
            
            // Move ball out of collision
            ball.x = closestX + nx * ball.radius;
            ball.y = closestY + ny * ball.radius;
        }
    }
}

function update() {
    // Apply gravity
    ball.dy += gravity;
    
    // Apply friction
    ball.dx *= friction;
    ball.dy *= friction;
    
    // Update position
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Check collisions
    checkCollision();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update rotation
    rotationAngle += rotationSpeed;
    hexagonPoints = calculateHexagonPoints();
    
    drawHexagon();
    drawBall();
    update();
    
    requestAnimationFrame(animate);
}

animate();

// Add click event to give the ball initial velocity
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Calculate velocity based on click position
    ball.dx = (clickX - ball.x) * 0.1;
    ball.dy = (clickY - ball.y) * 0.1;
});
