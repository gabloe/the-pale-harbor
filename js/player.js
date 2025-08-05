// Player Character for The Pale Harbor
class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        
        // Movement
        this.speed = 120; // pixels per second
        this.direction = 'down';
        this.isMoving = false;
        
        // Animation
        this.animationTime = 0;
        this.animationFrame = 0;
        this.animationSpeed = 8; // frames per second
        
        // State
        this.health = 100;
        this.stamina = 100;
        
        // Sprite data (simple colored rectangles for now, can be replaced with actual sprites)
        this.colors = {
            body: '#3a4a5c',
            clothes: '#2a3a4c',
            skin: '#d4b5a0'
        };
    }
    
    update(deltaTime) {
        // Don't update player if game is over
        if (this.game.gameState === 'gameover') {
            return;
        }
        
        this.handleInput(deltaTime);
        this.updateAnimation(deltaTime);
        this.updatePosition(deltaTime);
        
        // Slowly regenerate stamina
        this.stamina = Math.min(100, this.stamina + deltaTime * 20);
    }
    
    handleInput(deltaTime) {
        const keys = this.game.keys;
        let dx = 0;
        let dy = 0;
        let moving = false;
        
        // Movement input
        if (keys['w'] || keys['ArrowUp']) {
            dy -= 1;
            this.direction = 'up';
            moving = true;
        }
        if (keys['s'] || keys['ArrowDown']) {
            dy += 1;
            this.direction = 'down';
            moving = true;
        }
        if (keys['a'] || keys['ArrowLeft']) {
            dx -= 1;
            this.direction = 'left';
            moving = true;
        }
        if (keys['d'] || keys['ArrowRight']) {
            dx += 1;
            this.direction = 'right';
            moving = true;
        }
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/sqrt(2)
            dy *= 0.707;
        }
        
        // Apply movement
        let currentSpeed = this.speed;
        
        // Running (uses stamina)
        if (keys['shift'] && this.stamina > 0 && moving) {
            currentSpeed *= 1.8;
            this.stamina -= deltaTime * 30;
            this.stamina = Math.max(0, this.stamina);
        }
        
        // Fear effect - slower movement at low sanity
        if (this.game.sanity < 50) {
            const fearFactor = 0.5 + (this.game.sanity / 100) * 0.5;
            currentSpeed *= fearFactor;
        }
        
        this.velocityX = dx * currentSpeed * deltaTime;
        this.velocityY = dy * currentSpeed * deltaTime;
        this.isMoving = moving;
    }
    
    updatePosition(deltaTime) {
        // Store old position for collision detection
        const oldX = this.x;
        const oldY = this.y;
        
        // Try to move horizontally
        this.x += this.velocityX;
        if (this.checkCollision()) {
            this.x = oldX; // Revert if collision
        }
        
        // Try to move vertically
        this.y += this.velocityY;
        if (this.checkCollision()) {
            this.y = oldY; // Revert if collision
        }
        
        // Check for area transitions
        this.checkAreaTransitions();
    }
    
    checkCollision() {
        // Get collision bounds
        const bounds = this.getCollisionBounds();
        
        // Check world boundaries and obstacles
        return this.game.world.checkCollision(bounds);
    }
    
    checkAreaTransitions() {
        // Check if player has moved to a different area
        const newArea = this.game.world.getAreaAt(this.x, this.y);
        if (newArea && newArea !== this.game.currentLocation) {
            this.game.updateLocation(newArea);
            
            // Trigger area-specific events only if we haven't seen this area before
            this.onAreaEnter(newArea);
        }
    }
    
    onAreaEnter(area) {
        // Initialize visited areas tracker if it doesn't exist
        if (!this.visitedAreas) {
            this.visitedAreas = new Set();
        }
        
        // Only show area dialogue if we haven't visited this area before in this session
        if (this.visitedAreas.has(area)) {
            return; // Already visited, don't repeat dialogue
        }
        
        // Mark area as visited
        this.visitedAreas.add(area);
        
        // Add a small delay before showing dialogue to prevent rapid-fire triggers
        setTimeout(() => {
            switch (area) {
                case 'Lighthouse Interior':
                    this.game.dialogue.start([
                        "The lighthouse creaks ominously as you step inside.",
                        "Dust motes dance in the pale light filtering through grimy windows.",
                        "Something feels... wrong about this place."
                    ]);
                    this.game.decreaseSanity(5);
                    break;
                    
                case 'Harbor Docks':
                    this.game.dialogue.start([
                        "The docks stretch into the fog like skeletal fingers.",
                        "You can hear water lapping against the posts, but can't see the shore.",
                        "Is that... whispering you hear in the mist?"
                    ]);
                    this.game.decreaseSanity(3);
                    break;
                    
                case 'Town Square':
                    this.game.dialogue.start([
                        "The town square is eerily empty.",
                        "Street lamps flicker intermittently, casting dancing shadows.",
                        "Where is everyone?"
                    ]);
                    break;
            }
        }, 100); // Small delay to prevent rapid triggering
    }
    
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.animationTime += deltaTime * this.animationSpeed;
            this.animationFrame = Math.floor(this.animationTime) % 4; // 4 frame walk cycle
        } else {
            this.animationFrame = 0;
            this.animationTime = 0;
        }
    }
    
    render(ctx) {
        // Get render position
        const renderX = Math.floor(this.x - this.width / 2);
        const renderY = Math.floor(this.y - this.height / 2);
        
        // Calculate bob offset for walking animation
        let bobOffset = 0;
        if (this.isMoving) {
            bobOffset = Math.sin(this.animationTime * 3) * 1;
        }
        
        const finalY = renderY + bobOffset;
        
        // Character shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(renderX + this.width/2, renderY + this.height - 2, this.width/2 - 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        this.renderDetailedCharacter(ctx, renderX, finalY);
        
        // Low sanity visual effects
        if (this.game.sanity < 30) {
            this.renderSanityEffects(ctx, renderX, finalY);
        }
    }
    
    renderDetailedCharacter(ctx, renderX, renderY) {
        // Determine walking animation frame
        const walkFrame = this.isMoving ? Math.floor(this.animationTime * 8) % 4 : 0;
        const legOffset = this.isMoving ? Math.sin(this.animationTime * 6) * 2 : 0;
        
        // Render based on direction for proper layering
        switch (this.direction) {
            case 'up':
                this.renderCharacterUp(ctx, renderX, renderY, walkFrame, legOffset);
                break;
            case 'down':
                this.renderCharacterDown(ctx, renderX, renderY, walkFrame, legOffset);
                break;
            case 'left':
                this.renderCharacterSide(ctx, renderX, renderY, walkFrame, legOffset, true);
                break;
            case 'right':
                this.renderCharacterSide(ctx, renderX, renderY, walkFrame, legOffset, false);
                break;
        }
    }
    
    renderCharacterDown(ctx, x, y, walkFrame, legOffset) {
        // Legs (behind body when facing down)
        ctx.fillStyle = '#2a3a4c'; // Dark pants
        ctx.fillRect(x + 6, y + 22, 4, 10 + Math.abs(legOffset));
        ctx.fillRect(x + 14, y + 22, 4, 10 - Math.abs(legOffset));
        
        // Shoes
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 5, y + 30, 6, 3);
        ctx.fillRect(x + 13, y + 30, 6, 3);
        
        // Body/Torso
        ctx.fillStyle = '#3a4a5c'; // Coat
        ctx.fillRect(x + 4, y + 14, 16, 12);
        
        // Coat details
        ctx.fillStyle = '#2a3a4c';
        ctx.fillRect(x + 5, y + 15, 2, 10); // Left lapel
        ctx.fillRect(x + 17, y + 15, 2, 10); // Right lapel
        
        // Arms
        ctx.fillStyle = '#3a4a5c';
        ctx.fillRect(x + 2, y + 16, 4, 8); // Left arm
        ctx.fillRect(x + 18, y + 16, 4, 8); // Right arm
        
        // Hands
        ctx.fillStyle = '#d4b5a0';
        ctx.fillRect(x + 3, y + 22, 2, 3);
        ctx.fillRect(x + 19, y + 22, 2, 3);
        
        // Head/Face
        ctx.fillStyle = '#d4b5a0';
        ctx.fillRect(x + 6, y + 4, 12, 12);
        
        // Hair
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x + 5, y + 2, 14, 6);
        
        // Hat
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x + 4, y + 1, 16, 4);
        ctx.fillRect(x + 2, y + 4, 20, 2); // Hat brim
        
        // Face details
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 9, y + 8, 1, 1); // Left eye
        ctx.fillRect(x + 14, y + 8, 1, 1); // Right eye
        ctx.fillRect(x + 11, y + 11, 2, 1); // Mouth
        
        // Coat buttons
        ctx.fillStyle = '#8a8a8a';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 11, y + 17 + i * 3, 1, 1);
        }
    }
    
    renderCharacterUp(ctx, x, y, walkFrame, legOffset) {
        // Legs (behind body when facing up)
        ctx.fillStyle = '#2a3a4c';
        ctx.fillRect(x + 6, y + 22, 4, 10 - Math.abs(legOffset));
        ctx.fillRect(x + 14, y + 22, 4, 10 + Math.abs(legOffset));
        
        // Shoes
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 5, y + 30, 6, 3);
        ctx.fillRect(x + 13, y + 30, 6, 3);
        
        // Body/Torso (back view)
        ctx.fillStyle = '#3a4a5c';
        ctx.fillRect(x + 4, y + 14, 16, 12);
        
        // Arms
        ctx.fillStyle = '#3a4a5c';
        ctx.fillRect(x + 2, y + 16, 4, 8);
        ctx.fillRect(x + 18, y + 16, 4, 8);
        
        // Head (back view)
        ctx.fillStyle = '#d4b5a0';
        ctx.fillRect(x + 6, y + 4, 12, 12);
        
        // Hair (back)
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x + 5, y + 2, 14, 8);
        
        // Hat (back)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x + 4, y + 1, 16, 4);
        ctx.fillRect(x + 2, y + 4, 20, 2);
    }
    
    renderCharacterSide(ctx, x, y, walkFrame, legOffset, facingLeft) {
        const flip = facingLeft ? 1 : -1;
        const centerX = x + this.width/2;
        
        // Legs (side view with walking animation)
        ctx.fillStyle = '#2a3a4c';
        if (this.isMoving) {
            // Animated walking legs
            const frontLegY = y + 22 + legOffset;
            const backLegY = y + 22 - legOffset;
            
            ctx.fillRect(centerX - 2, Math.min(frontLegY, backLegY), 4, 10 + Math.abs(legOffset));
            ctx.fillRect(centerX + 2 * flip, Math.max(frontLegY, backLegY), 4, 10 - Math.abs(legOffset));
        } else {
            ctx.fillRect(centerX - 2, y + 22, 4, 10);
            ctx.fillRect(centerX + 2, y + 22, 4, 10);
        }
        
        // Shoes
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(centerX - 3, y + 30, 7, 3);
        if (this.isMoving) {
            ctx.fillRect(centerX + 1 * flip, y + 30 + legOffset/2, 6, 3);
        } else {
            ctx.fillRect(centerX + 1, y + 30, 6, 3);
        }
        
        // Body (side profile)
        ctx.fillStyle = '#3a4a5c';
        ctx.fillRect(centerX - 6, y + 14, 12, 12);
        
        // Arm (visible arm)
        ctx.fillStyle = '#3a4a5c';
        if (this.isMoving) {
            const armSwing = Math.sin(this.animationTime * 6) * 2;
            ctx.fillRect(centerX + 6 * flip, y + 16 + armSwing, 4, 8);
        } else {
            ctx.fillRect(centerX + 6 * flip, y + 16, 4, 8);
        }
        
        // Hand
        ctx.fillStyle = '#d4b5a0';
        ctx.fillRect(centerX + 7 * flip, y + 22, 2, 3);
        
        // Head (side profile)
        ctx.fillStyle = '#d4b5a0';
        ctx.fillRect(centerX - 6, y + 4, 12, 12);
        
        // Hair (side)
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(centerX - 7, y + 2, 14, 8);
        
        // Hat (side)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(centerX - 8, y + 1, 16, 4);
        ctx.fillRect(centerX - 10, y + 4, 20, 2); // Extended brim
        
        // Side profile features
        ctx.fillStyle = '#1a1a1a';
        if (facingLeft) {
            ctx.fillRect(centerX - 4, y + 8, 1, 1); // Eye
            ctx.fillRect(centerX - 6, y + 10, 2, 1); // Nose
            ctx.fillRect(centerX - 4, y + 12, 1, 1); // Mouth
        } else {
            ctx.fillRect(centerX + 3, y + 8, 1, 1); // Eye
            ctx.fillRect(centerX + 4, y + 10, 2, 1); // Nose
            ctx.fillRect(centerX + 3, y + 12, 1, 1); // Mouth
        }
        
        // Coat details (side view)
        ctx.fillStyle = '#2a3a4c';
        ctx.fillRect(centerX - 5, y + 15, 1, 8); // Coat edge
        
        // Buttons (side view)
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(centerX - 3, y + 17, 1, 1);
        ctx.fillRect(centerX - 3, y + 20, 1, 1);
    }
    
    renderSanityEffects(ctx, renderX, renderY) {
        // Distortion effect at low sanity
        ctx.save();
        
        // Shaky outline using deterministic shake
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.lineWidth = 1;
        const shakeX = (Math.sin(this.game.time * 10 + this.x * 0.1) - 0.5) * 3;
        const shakeY = (Math.cos(this.game.time * 12 + this.y * 0.1) - 0.5) * 3;
        ctx.strokeRect(renderX + shakeX, renderY + shakeY, this.width, this.height);
        
        // Ghostly afterimage
        if (this.isMoving) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(renderX - 2, renderY - 2, this.width + 4, this.height + 4);
        }
        
        // Sanity particles around character using deterministic timing
        const particleChance = Math.sin(this.game.time * 3 + this.x * 0.01) * 0.5 + 0.5;
        if (particleChance > 0.7) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
            for (let i = 0; i < 5; i++) {
                const px = renderX + (Math.sin(this.game.time * 2 + i) + 1) * 0.5 * this.width;
                const py = renderY + (Math.cos(this.game.time * 1.5 + i) + 1) * 0.5 * this.height;
                ctx.fillRect(px, py, 1, 1);
            }
        }
        
        ctx.restore();
    }
    
    getCollisionBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2 + this.height * 0.6, // Only check bottom half for collision
            width: this.width,
            height: this.height * 0.4
        };
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health);
        this.game.decreaseSanity(amount / 2);
        this.game.shakeCamera(5, 0.3);
    }
    
    heal(amount) {
        this.health += amount;
        this.health = Math.min(100, this.health);
        this.game.increaseSanity(amount / 4);
    }
}
