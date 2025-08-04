// Entities System for The Pale Harbor
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        // Use deterministic ID generation to avoid Math.random() issues
        this.id = Date.now().toString(36) + (Math.floor(x + y + width + height)).toString(36);
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    render(ctx) {
        // Override in subclasses
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    intersects(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
}

class GhostlyFigure extends Entity {
    constructor(x, y, game) {
        super(x, y, 20, 40);
        this.game = game;
        this.opacity = 0.3 + (Math.sin(x * 0.1 + y * 0.1) + 1) * 0.2;
        this.driftSpeed = 20 + (Math.cos(x * 0.05 + y * 0.05) + 1) * 15;
        this.driftDirection = (x * 0.01 + y * 0.01) * Math.PI * 2;
        this.lifetime = 5 + (Math.sin(x * 0.02 + y * 0.02) + 1) * 5;
        this.maxLifetime = this.lifetime;
        this.flickerTimer = 0;
        this.visible = true;
        
        // Ghostly behavior patterns
        this.behaviorType = Math.sin(x * 0.1) > 0 ? 'wandering' : 'following';
        this.awarenessRadius = 100 + (Math.cos(y * 0.1) + 1) * 50;
        this.fearRadius = 80;
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.flickerTimer += deltaTime;
        
        // Flickering visibility
        if (this.flickerTimer > 0.1 + (Math.sin(this.x * 0.1) + 1) * 0.15) {
            this.visible = !this.visible;
            this.flickerTimer = 0;
        }
        
        // Movement behavior
        switch (this.behaviorType) {
            case 'wandering':
                this.updateWanderingBehavior(deltaTime);
                break;
            case 'following':
                this.updateFollowingBehavior(deltaTime);
                break;
        }
        
        // Check proximity to player for sanity effects
        this.checkPlayerProximity();
        
        // Fade out over time
        this.opacity = (this.lifetime / this.maxLifetime) * 0.7;
        
        // Remove when lifetime expires
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
    
    updateWanderingBehavior(deltaTime) {
        // Drift randomly
        this.x += Math.cos(this.driftDirection) * this.driftSpeed * deltaTime;
        this.y += Math.sin(this.driftDirection) * this.driftSpeed * deltaTime;
        
        // Occasionally change direction
        if (Math.sin(this.x * 0.01 + this.game.time) > 0.8) {
            this.driftDirection += (Math.sin(this.x * 0.1 + this.game.time) - 0.5) * Math.PI;
        }
    }
    
    updateFollowingBehavior(deltaTime) {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50 && distance < this.awarenessRadius) {
            // Follow player at a distance
            const followSpeed = this.driftSpeed * 0.7;
            this.x += (dx / distance) * followSpeed * deltaTime;
            this.y += (dy / distance) * followSpeed * deltaTime;
        } else if (distance <= 50) {
            // Stay back when too close
            const avoidSpeed = this.driftSpeed * 0.5;
            this.x -= (dx / distance) * avoidSpeed * deltaTime;
            this.y -= (dy / distance) * avoidSpeed * deltaTime;
        }
    }
    
    checkPlayerProximity() {
        const player = this.game.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.fearRadius) {
            // Decrease sanity when player is near
            this.game.decreaseSanity(0.1);
            
            // Trigger fear effects
            if (Math.sin(this.game.time * 2 + this.x * 0.1) > 0.99) {
                this.game.shakeCamera(3, 0.2);
                this.game.dialogue.showThought("Something's watching me...");
            }
        }
    }
    
    render(ctx) {
        if (!this.visible || this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Ghostly figure silhouette
        ctx.fillStyle = '#e0e0ff';
        ctx.fillRect(this.x - this.width/2, this.y - this.height, this.width, this.height);
        
        // Ethereal glow
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.height/2, this.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Eyes (if close enough to see detail)
        const player = this.game.player;
        const distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2));
        
        if (distance < 100) {
            ctx.fillStyle = '#4444ff';
            ctx.fillRect(this.x - 6, this.y - this.height + 8, 3, 3);
            ctx.fillRect(this.x + 3, this.y - this.height + 8, 3, 3);
        }
        
        ctx.restore();
    }
}

class AmbientCreature extends Entity {
    constructor(x, y, type = 'seagull') {
        super(x, y, 8, 8);
        this.type = type;
        this.speed = 40 + (Math.sin(x * 0.1 + y * 0.1) + 1) * 30;
        this.direction = (x * 0.01 + y * 0.01) * Math.PI * 2;
        this.animationTimer = 0;
        this.soundCooldown = 0;
        
        // Behavior properties
        this.wanderRadius = 200 + (Math.cos(x * 0.05) + 1) * 150;
        this.homeX = x;
        this.homeY = y;
        this.currentGoalX = x;
        this.currentGoalY = y;
        this.goalReachedDistance = 20;
    }
    
    update(deltaTime) {
        this.animationTimer += deltaTime;
        this.soundCooldown -= deltaTime;
        
        this.updateMovement(deltaTime);
        this.updateBehavior(deltaTime);
        
        // Occasionally make sounds
        if (this.soundCooldown <= 0 && Math.sin(this.x * 0.01 + this.animationTimer * 0.5) > 0.95) {
            this.makeSound();
            this.soundCooldown = 3 + (Math.cos(this.x * 0.1) + 1) * 3.5;
        }
    }
    
    updateMovement(deltaTime) {
        // Move towards current goal
        const dx = this.currentGoalX - this.x;
        const dy = this.currentGoalY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.goalReachedDistance) {
            this.x += (dx / distance) * this.speed * deltaTime;
            this.y += (dy / distance) * this.speed * deltaTime;
            this.direction = Math.atan2(dy, dx);
        } else {
            // Pick new goal within wander radius
            const angle = (this.x * 0.01 + this.animationTimer * 0.1) * Math.PI * 2;
            const radius = (Math.sin(this.y * 0.1 + this.animationTimer * 0.05) + 1) * 0.5 * this.wanderRadius;
            this.currentGoalX = this.homeX + Math.cos(angle) * radius;
            this.currentGoalY = this.homeY + Math.sin(angle) * radius;
        }
    }
    
    updateBehavior(deltaTime) {
        switch (this.type) {
            case 'seagull':
                // Seagulls fly higher and faster
                this.y += Math.sin(this.animationTimer * 4) * 10 * deltaTime;
                break;
                
            case 'cat':
                // Cats move more erratically and pause frequently
                if (Math.sin(this.animationTimer * 0.5 + this.x * 0.1) > 0.7) {
                    this.speed = Math.cos(this.y * 0.1) > 0 ? 0 : 60; // Stop or go
                }
                break;
                
            case 'rat':
                // Rats scurry quickly and hide
                this.speed = 80 + Math.sin(this.animationTimer * 6) * 20;
                break;
        }
    }
    
    makeSound() {
        // This would integrate with the horror effects system
        // For now, just a placeholder
        console.log(`${this.type} made a sound`);
    }
    
    render(ctx) {
        ctx.save();
        
        switch (this.type) {
            case 'seagull':
                this.renderSeagull(ctx);
                break;
            case 'cat':
                this.renderCat(ctx);
                break;
            case 'rat':
                this.renderRat(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    renderSeagull(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.direction);
        
        // Wings (animated)
        const wingFlap = Math.sin(this.animationTimer * 8) * 0.3;
        ctx.fillRect(-6, -2 + wingFlap, 12, 2);
        ctx.fillRect(-3, -4 - wingFlap, 6, 2);
        
        // Body
        ctx.fillRect(-2, -1, 4, 2);
        
        ctx.restore();
    }
    
    renderCat(ctx) {
        ctx.fillStyle = '#2a2a2a';
        
        // Body
        ctx.fillRect(this.x - 4, this.y - 3, 8, 6);
        
        // Head
        ctx.fillRect(this.x - 3, this.y - 6, 6, 4);
        
        // Eyes (glow in low light)
        ctx.fillStyle = '#88ff88';
        ctx.fillRect(this.x - 2, this.y - 5, 1, 1);
        ctx.fillRect(this.x + 1, this.y - 5, 1, 1);
        
        // Tail (animated)
        const tailSway = Math.sin(this.animationTimer * 3) * 3;
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(this.x + 4, this.y + tailSway, 6, 2);
    }
    
    renderRat(ctx) {
        ctx.fillStyle = '#4a4a4a';
        
        // Body
        ctx.fillRect(this.x - 3, this.y - 2, 6, 4);
        
        // Head
        ctx.fillRect(this.x - 2, this.y - 3, 4, 2);
        
        // Tail
        ctx.fillRect(this.x + 3, this.y, 8, 1);
    }
}

class InteractableObject extends Entity {
    constructor(x, y, width, height, type, data = {}) {
        super(x, y, width, height);
        this.type = type;
        this.data = data;
        this.isInteractable = true;
        this.interactionRange = 40;
        this.hasBeenInteracted = false;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }
    
    update(deltaTime) {
        // Update glow effect for interactable objects
        if (this.isInteractable && !this.hasBeenInteracted) {
            this.glowIntensity += this.glowDirection * deltaTime * 2;
            if (this.glowIntensity > 1) {
                this.glowIntensity = 1;
                this.glowDirection = -1;
            } else if (this.glowIntensity < 0) {
                this.glowIntensity = 0;
                this.glowDirection = 1;
            }
        }
    }
    
    canInteract(player) {
        const dx = player.x - (this.x + this.width / 2);
        const dy = player.y - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return this.isInteractable && distance <= this.interactionRange;
    }
    
    interact(game) {
        if (this.hasBeenInteracted && !this.data.repeatable) {
            return false;
        }
        
        this.hasBeenInteracted = true;
        
        switch (this.type) {
            case 'note':
                return this.interactWithNote(game);
            case 'key':
                return this.interactWithKey(game);
            case 'door':
                return this.interactWithDoor(game);
            case 'mysterious_object':
                return this.interactWithMysteriousObject(game);
            default:
                return false;
        }
    }
    
    interactWithNote(game) {
        const messages = this.data.messages || ['An old, weathered note.'];
        game.dialogue.start(messages);
        
        if (this.data.sanityLoss) {
            game.decreaseSanity(this.data.sanityLoss);
        }
        
        if (this.data.addToInventory) {
            game.addToInventory(this.data.addToInventory);
        }
        
        return true;
    }
    
    interactWithKey(game) {
        const keyName = this.data.keyName || 'Mysterious Key';
        game.dialogue.start([`You found: ${keyName}`]);
        game.addToInventory(keyName);
        this.active = false; // Remove key from world
        return true;
    }
    
    interactWithDoor(game) {
        const requiredKey = this.data.requiredKey;
        
        if (!requiredKey || game.hasItem(requiredKey)) {
            const messages = this.data.openMessages || ['The door creaks open...'];
            game.dialogue.start(messages);
            
            if (this.data.teleportTo) {
                // Teleport player to new location
                game.player.x = this.data.teleportTo.x;
                game.player.y = this.data.teleportTo.y;
            }
            
            if (this.data.sanityLoss) {
                game.decreaseSanity(this.data.sanityLoss);
            }
            
            return true;
        } else {
            const messages = this.data.lockedMessages || ['The door is locked.'];
            game.dialogue.start(messages);
            return false;
        }
    }
    
    interactWithMysteriousObject(game) {
        const sanityLevel = Math.floor(game.sanity / 25); // 0-3 based on sanity
        const messageGroups = this.data.sanityBasedMessages || [
            ['A strange object lies before you.'], // High sanity
            ['The object seems to pulse with an otherworldly energy.'], // Medium-high sanity
            ['The object whispers secrets you shouldn\'t hear.'], // Medium-low sanity
            ['The object... it knows you\'re here. It sees you.'] // Low sanity
        ];
        
        const messages = messageGroups[Math.min(sanityLevel, messageGroups.length - 1)];
        game.dialogue.start(messages);
        
        // Escalating sanity loss based on current sanity
        const sanityLoss = 5 + (3 - sanityLevel) * 3;
        game.decreaseSanity(sanityLoss);
        
        // Trigger horror effects at low sanity
        if (game.sanity < 30) {
            game.horrorEffects.screenFlash('#ff0000', 0.5, 0.2);
            game.shakeCamera(8, 1.0);
        }
        
        return true;
    }
    
    render(ctx) {
        switch (this.type) {
            case 'note':
                this.renderNote(ctx);
                break;
            case 'key':
                this.renderKey(ctx);
                break;
            case 'door':
                this.renderDoor(ctx);
                break;
            case 'mysterious_object':
                this.renderMysteriousObject(ctx);
                break;
        }
        
        // Render interaction glow
        if (this.isInteractable && !this.hasBeenInteracted && this.glowIntensity > 0) {
            ctx.save();
            ctx.globalAlpha = this.glowIntensity * 0.3;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
            ctx.restore();
        }
    }
    
    renderNote(ctx) {
        ctx.fillStyle = '#f0f0e0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Simple text indication
        ctx.fillStyle = '#333333';
        ctx.font = '8px Courier New';
        ctx.fillText('?', this.x + 2, this.y + this.height - 2);
    }
    
    renderKey(ctx) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Key shape
        ctx.fillStyle = '#cc9900';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 2);
    }
    
    renderDoor(ctx) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + this.width - 6, this.y + this.height / 2 - 2, 4, 4);
    }
    
    renderMysteriousObject(ctx) {
        // Render based on player's sanity level for extra horror
        const game = window.game;
        const sanity = game ? game.sanity : 100;
        
        if (sanity > 60) {
            // Normal appearance
            ctx.fillStyle = '#666666';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (sanity > 30) {
            // Slightly disturbing
            const flicker = Math.sin(game.time * 2) > 0 ? '#666666' : '#444444';
            ctx.fillStyle = flicker;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            // Highly disturbing appearance
            const colors = ['#660000', '#000066', '#006600', '#666600'];
            const colorIndex = Math.floor(game.time * 2) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add pulsing effect
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(game.time * 4) * 0.3;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
            ctx.restore();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Entity,
        GhostlyFigure,
        AmbientCreature,
        InteractableObject
    };
}
