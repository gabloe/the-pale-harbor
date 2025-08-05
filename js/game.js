// Main Game Engine for The Pale Harbor
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'playing'; // playing, paused, dialogue, menu
        this.currentLocation = 'lighthouse_entrance';
        this.sanity = 100;
        this.time = 0;
        this.gameTime = 18.5; // Start at 6:30 PM (18.5 hours)
        
        // Core systems
        // Initialize player in front of the lighthouse door
        this.player = new Player(this, 550, 630);
        this.world = new World(this);
        this.dialogue = new DialogueSystem(this);
        this.horrorEffects = new HorrorEffects(this);
        this.inventory = ['Lighthouse Key', 'Old Journal'];
        
        // Input handling
        this.keys = {};
        this.lastKeyPressTime = {}; // Track last press time for each key
        this.keyDebounceTime = 200; // 200ms debounce for action keys (E, I, M)
        this.lastInteractionTime = 0; // Track last interaction time to prevent spam
        this.setupInput();
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            target: this.player,
            shake: 0,
            shakeX: 0,
            shakeY: 0
        };
        
        // Game loop
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        // Initialize UI
        this.updateInventoryUI();
        
        // Initialize first scene
        this.startGame();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Handle arrow keys specifically
            let keyName = e.key;
            if (keyName.startsWith('Arrow')) {
                this.keys[keyName] = true;
            } else {
                this.keys[keyName.toLowerCase()] = true;
            }
            
            // Helper function to check if enough time has passed since last key press
            const canPressKey = (key) => {
                const now = Date.now();
                const lastPress = this.lastKeyPressTime[key] || 0;
                if (now - lastPress >= this.keyDebounceTime) {
                    this.lastKeyPressTime[key] = now;
                    return true;
                }
                return false;
            };
            
            // Handle specific actions with debouncing
            if (e.key === ' ' && this.gameState === 'dialogue') {
                this.dialogue.advance();
                e.preventDefault();
            }
            
            if (e.key.toLowerCase() === 'e' && canPressKey('e')) {
                this.interact();
            }
            
            if (e.key.toLowerCase() === 'i' && canPressKey('i')) {
                this.toggleInventory();
            }
            
            if (e.key.toLowerCase() === 'm' && canPressKey('m')) {
                this.attemptMeditation();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // Handle arrow keys specifically
            let keyName = e.key;
            if (keyName.startsWith('Arrow')) {
                this.keys[keyName] = false;
            } else {
                this.keys[keyName.toLowerCase()] = false;
            }
        });
    }
    
    startGame() {
        // Initial dialogue with survival tips
        this.dialogue.start([
            "The boat's engine sputters to silence as you reach the dock.",
            "Pale Harbor stretches before you, shrouded in an unnatural fog.",
            "The lighthouse beam hasn't been seen for three days...",
            "Something is wrong here. You can feel it in your bones.",
            "",
            "Remember: Your sanity will drain at night but heal during dawn and day.",
            "Press 'M' to meditate in safe places during daylight to restore sanity.",
            "Sleep in beds, pray at statues, and find important items to stay sane."
        ]);
        
        this.updateLocation('Lighthouse Entrance');
    }
    
    gameLoop(currentTime) {
        try {
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(this.gameLoop);
        } catch (error) {
            console.error('Error in game loop:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        this.gameTime += deltaTime / 60; // 1 real second = 1 game minute
        
        if (this.gameTime >= 24) this.gameTime = 0;
        
        // Update systems based on game state
        if (this.gameState === 'playing') {
            this.player.update(deltaTime);
            this.world.update(deltaTime);
            this.updateCamera(deltaTime);
        }
        
        this.horrorEffects.update(deltaTime);
        this.dialogue.update(deltaTime);
        
        // Sanity changes over time (much slower rates)
        if (this.gameTime > 22 || this.gameTime < 6) { 
            // Night time - lose sanity slowly (takes about 8-10 minutes to lose all sanity)
            this.sanity -= deltaTime * 0.2;
        } else if (this.gameTime >= 6 && this.gameTime <= 8) {
            // Dawn - slowly restore sanity
            this.sanity += deltaTime * 0.3;
        } else if (this.gameTime >= 10 && this.gameTime <= 16) {
            // Midday - slowly restore sanity when it's bright
            this.sanity += deltaTime * 0.1;
        }
        
        this.sanity = Math.max(0, Math.min(100, this.sanity));
        
        // Check for game over conditions
        if (this.sanity <= 0 && this.gameState === 'playing') {
            this.triggerGameOver('sanity');
            return; // Stop further updates
        }
        
        this.updateUI();
    }
    
    updateCamera(deltaTime) {
        // Follow player with smooth movement
        const lerpFactor = 3 * deltaTime;
        this.camera.x = this.lerp(this.camera.x, this.player.x - this.width / 2, lerpFactor);
        this.camera.y = this.lerp(this.camera.y, this.player.y - this.height / 2, lerpFactor);
        
                // Camera shake effect (using deterministic shake)
        if (this.camera.shake > 0) {
            this.camera.shakeX = (Math.sin(this.time * 15) - 0.5) * this.camera.shake;
            this.camera.shakeY = (Math.cos(this.time * 17) - 0.5) * this.camera.shake;
            this.camera.shake *= 0.9; // Reduce shake over time
        }
    }
    
    render() {
        try {
            // Clear screen
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Save context for camera transform
            this.ctx.save();
            
            // Apply camera transform with shake
            this.ctx.translate(
                -this.camera.x + this.camera.shakeX,
                -this.camera.y + this.camera.shakeY
            );
            
            // Render world
            this.world.render(this.ctx);
            
            // Render player
            this.player.render(this.ctx);
            
            // Restore context
            this.ctx.restore();
            
            // Render horror effects (screen space)
            this.horrorEffects.render(this.ctx);
            
            // Render UI elements
            this.renderTimeOfDay();
        } catch (error) {
            console.error('Error in render:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    renderTimeOfDay() {
        // Create atmospheric overlay based on time
        const alpha = this.getTimeAlpha();
        
        if (alpha > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 20, ${alpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Add fog effect
        const fogAlpha = 0.1 + (Math.sin(this.time * 0.5) * 0.05);
        this.ctx.fillStyle = `rgba(200, 200, 220, ${fogAlpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    getTimeAlpha() {
        // Return darkness level based on time (0 = day, 1 = night)
        if (this.gameTime >= 6 && this.gameTime <= 18) {
            return Math.max(0, 0.2); // Light during day
        } else {
            return Math.min(0.8, 0.3 + (1 - this.sanity / 100) * 0.5); // Darker at night, worse with low sanity
        }
    }
    
    interact() {
        if (this.gameState !== 'playing') return;
        
        // Prevent rapid interaction spam
        const now = Date.now();
        if (this.lastInteractionTime && now - this.lastInteractionTime < 300) {
            return; // 300ms cooldown between interactions
        }
        this.lastInteractionTime = now;
        
        const interactables = this.world.getInteractablesNear(this.player.x, this.player.y, 50);
        
        if (interactables.length > 0) {
            const item = interactables[0];
            item.interact(this);
        }
    }
    
    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            this.updateInventoryUI();
            
            // Gaining important story items restores some sanity (knowledge brings hope)
            const importantItems = [
                'Lighthouse Key', 'Keeper\'s Journal', 'Old Lantern', 'Cursed Tome', 
                'Ship\'s Log', 'Final Entry', 'Lighthouse Lens'
            ];
            
            if (importantItems.includes(item)) {
                this.increaseSanity(5);
                console.log(`Found important item: ${item}. Sanity restored.`);
            }
        }
    }
    
    hasItem(item) {
        return this.inventory.includes(item);
    }
    
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            this.updateInventoryUI();
        }
    }
    
    toggleInventory() {
        // Implementation for inventory toggle
        console.log('Inventory:', this.inventory);
    }
    
    updateLocation(location) {
        this.currentLocation = location;
        document.getElementById('location').textContent = location;
    }
    
    updateUI() {
        // Update sanity bar
        const sanityFill = document.getElementById('sanityFill');
        sanityFill.style.width = `${this.sanity}%`;
        
        if (this.sanity < 30) {
            sanityFill.style.backgroundColor = '#e24a4a';
        } else if (this.sanity < 60) {
            sanityFill.style.backgroundColor = '#e2a04a';
        } else {
            sanityFill.style.backgroundColor = '#4a90e2';
        }
        
        // Debug: Show game time in corner
        const hours = Math.floor(this.gameTime);
        const minutes = Math.floor((this.gameTime - hours) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        let timeDisplay = document.getElementById('timeDisplay');
        if (!timeDisplay) {
            timeDisplay = document.createElement('div');
            timeDisplay.id = 'timeDisplay';
            timeDisplay.style.position = 'absolute';
            timeDisplay.style.top = '10px';
            timeDisplay.style.right = '10px';
            timeDisplay.style.color = 'white';
            timeDisplay.style.fontSize = '14px';
            timeDisplay.style.fontFamily = 'monospace';
            timeDisplay.style.zIndex = '1000';
            document.body.appendChild(timeDisplay);
        }
        
        // Show sanity status and restoration info
        let sanityStatus = '';
        if (this.gameTime >= 6 && this.gameTime <= 8) {
            sanityStatus = ' (Dawn - Slowly Healing)';
            timeDisplay.style.color = '#90c090'; // Light green
        } else if (this.gameTime >= 10 && this.gameTime <= 16) {
            sanityStatus = ' (Daylight - Healing)';
            timeDisplay.style.color = '#c0c090'; // Light yellow
        } else if (this.gameTime > 22 || this.gameTime < 6) {
            sanityStatus = ' (Night - Losing Sanity)';
            timeDisplay.style.color = '#c09090'; // Light red
        } else {
            timeDisplay.style.color = 'white';
        }
        
        timeDisplay.textContent = `Time: ${timeString}${sanityStatus}`;
    }
    
    updateInventoryUI() {
        const inventoryItems = document.getElementById('inventoryItems');
        inventoryItems.innerHTML = '';
        
        this.inventory.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item;
            div.style.cursor = 'pointer';
            div.style.padding = '2px 4px';
            div.style.borderRadius = '2px';
            div.style.transition = 'background-color 0.2s ease';
            
            // Add hover effect
            div.addEventListener('mouseenter', () => {
                div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            div.addEventListener('mouseleave', () => {
                div.style.backgroundColor = 'transparent';
            });
            
            // Add click handler for item descriptions
            div.addEventListener('click', () => {
                this.showItemDescription(item);
            });
            
            inventoryItems.appendChild(div);
        });
    }
    
    showItemDescription(item) {
        const descriptions = {
            'Lighthouse Key': [
                "A heavy brass key, tarnished with age and salt air.",
                "The metal feels cold to the touch, as if it holds memories.",
                "This key unlocks the lighthouse door, but what secrets lie within?"
            ],
            'Keeper\'s Journal': [
                "A water-damaged journal with pages yellowed by time.",
                "The entries speak of strange happenings and growing dread.",
                "Reading it fills you with unease, but also understanding."
            ],
            'Old Lantern': [
                "A rusted lantern that still contains some oil.",
                "Despite its age, the flame burns steady and bright.",
                "Light is precious in this fog-shrouded harbor."
            ],
            'Cursed Tome': [
                "'Maritime Legends of Pale Harbor' by E. Blackwood",
                "The pages describe ancient horrors from beneath the waves.",
                "Knowledge is power, but some truths come at a cost."
            ],
            'Ship\'s Log': [
                "A captain's log from a vessel that never made it home.",
                "The entries tell of strange lights and inhuman singing.",
                "The final pages are stained with what looks like seawater... or tears."
            ],
            'Final Entry': [
                "The lighthouse keeper's last desperate message.",
                "His handwriting grows more erratic with each word.",
                "A warning about the deep ones and their calling song."
            ],
            'Lighthouse Lens': [
                "The massive focusing lens from the lighthouse beacon.",
                "It pulses with an otherworldly energy.",
                "This lens doesn't just guide ships - it holds back darker things."
            ],
            'Tunnel Access': [
                "Knowledge of the hidden entrance to underground tunnels.",
                "The carvings match symbols from the cursed tome.",
                "Some paths are better left unexplored."
            ],
            'Navigation Notes': [
                "A small notebook filled with maritime observations.",
                "The keeper noted strange changes in local weather patterns.",
                "His final entries speak of 'singing rocks' and unnatural fog."
            ],
            'Personal Letter': [
                "A crumpled letter to someone named Martha.",
                "The lighthouse keeper's loneliness and fear are evident.",
                "His isolation was taking a heavy toll on his mind."
            ],
            'Broken Compass': [
                "A brass compass that spins wildly without direction.",
                "Something in this area disrupts magnetic navigation.",
                "The supernatural forces here affect even simple instruments."
            ]
        };
        
        const description = descriptions[item] || [
            `You examine the ${item} closely.`,
            "It seems ordinary enough, but in this place...",
            "Nothing is quite what it appears to be."
        ];
        
        this.dialogue.start(description);
    }
    
    shakeCamera(intensity = 10, duration = 0.5) {
        this.camera.shake = Math.max(this.camera.shake, intensity);
    }
    
    decreaseSanity(amount) {
        this.sanity -= amount;
        this.sanity = Math.max(0, this.sanity);
        this.shakeCamera(amount / 2, 0.3);
    }
    
    increaseSanity(amount) {
        this.sanity += amount;
        this.sanity = Math.min(100, this.sanity);
    }
    
    attemptMeditation() {
        // Check if meditation is possible
        if (this.gameState !== 'playing') return;
        
        // Must be during daylight hours (6 AM to 9 PM) - extended hours
        if (this.gameTime < 6 || this.gameTime > 21) {
            this.dialogue.start([
                "It's too dark to find peace right now.",
                "You can meditate safely from 6 AM to 9 PM."
            ]);
            return;
        }
        
        // Check if sanity is already full
        if (this.sanity >= 95) {
            this.dialogue.start([
                "You feel as calm as you can be in this place.",
                "Your mind is already at relative peace."
            ]);
            return;
        }
        
        // Check if player is in a safe area (not near water or in lighthouse interior)
        const playerY = this.player.y;
        const isNearWater = playerY > 750; // Water starts around y=800
        const isInDangerZone = isNearWater; // Removed lighthouse interior restriction
        
        if (isInDangerZone) {
            this.dialogue.start([
                "This doesn't feel like a safe place to rest.",
                "You need to find a quieter location away from the water."
            ]);
            return;
        }
        
        // Successful meditation - better restoration
        const sanityGain = 12 + Math.floor(Math.random() * 8); // 12-19 sanity
        const timePass = 0.25; // 15 minutes
        
        this.dialogue.start([
            "You sit quietly and close your eyes.",
            "Taking deep breaths, you try to center yourself.",
            "The daylight warms your face and calms your nerves.",
            `You feel much more at peace. (+${sanityGain} Sanity)`
        ]);
        
        this.increaseSanity(sanityGain);
        this.gameTime += timePass;
        
        // Ensure time doesn't go past 24 hours
        if (this.gameTime >= 24) {
            this.gameTime -= 24; // Reset to next day
        }
    }
    
    triggerChapterEnd() {
        this.gameState = 'chapter_end';
        
        // Show Chapter 1 completion screen
        this.showChapterEndScreen();
        
        // Set up for potential continuation or restart
        setTimeout(() => {
            this.showChapterContinueOptions();
        }, 5000);
    }
    
    showChapterEndScreen() {
        // Create chapter end overlay
        let chapterEndDiv = document.getElementById('chapterEndScreen');
        if (!chapterEndDiv) {
            chapterEndDiv = document.createElement('div');
            chapterEndDiv.id = 'chapterEndScreen';
            chapterEndDiv.style.position = 'fixed';
            chapterEndDiv.style.top = '0';
            chapterEndDiv.style.left = '0';
            chapterEndDiv.style.width = '100%';
            chapterEndDiv.style.height = '100%';
            chapterEndDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            chapterEndDiv.style.color = '#ffffff';
            chapterEndDiv.style.display = 'flex';
            chapterEndDiv.style.flexDirection = 'column';
            chapterEndDiv.style.justifyContent = 'center';
            chapterEndDiv.style.alignItems = 'center';
            chapterEndDiv.style.fontSize = '24px';
            chapterEndDiv.style.fontFamily = 'serif';
            chapterEndDiv.style.textAlign = 'center';
            chapterEndDiv.style.zIndex = '10000';
            chapterEndDiv.style.opacity = '0';
            chapterEndDiv.style.transition = 'opacity 3s ease-in';
            document.body.appendChild(chapterEndDiv);
        }
        
        chapterEndDiv.innerHTML = `
            <div style="margin-bottom: 40px; font-size: 48px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); color: #4a90e2;">
                CHAPTER ONE COMPLETE
            </div>
            <div style="margin-bottom: 30px; font-size: 28px; color: #cccccc;">
                "The Lighthouse Keeper's Secret"
            </div>
            <div style="margin-bottom: 40px; font-size: 18px; color: #999999; max-width: 600px; line-height: 1.6;">
                You have uncovered the truth behind the lighthouse and claimed the mysterious lens. 
                The first chapter of your journey through Pale Harbor has ended, but darker mysteries await...
            </div>
            <div style="margin-bottom: 20px; font-size: 16px; color: #888888;">
                Survival Time: ${this.getFormattedSurvivalTime()}
            </div>
            <div style="margin-bottom: 20px; font-size: 16px; color: #888888;">
                Final Sanity: ${Math.round(this.sanity)}%
            </div>
            <div style="font-size: 14px; color: #666666; font-style: italic;">
                Preparing for Chapter Two...
            </div>
        `;
        
        // Fade in the chapter end screen
        setTimeout(() => {
            chapterEndDiv.style.opacity = '1';
        }, 100);
    }
    
    showChapterContinueOptions() {
        const chapterEndDiv = document.getElementById('chapterEndScreen');
        if (chapterEndDiv) {
            // Add continue options
            const continueDiv = document.createElement('div');
            continueDiv.style.marginTop = '40px';
            continueDiv.innerHTML = `
                <div style="margin-bottom: 30px; font-size: 32px; color: #e2a04a; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                    CHAPTER TWO
                </div>
                <div style="margin-bottom: 30px; font-size: 20px; color: #cccccc;">
                    "The Deep Ones Rising"
                </div>
                <div style="margin-bottom: 40px; font-size: 16px; color: #999999; max-width: 500px; line-height: 1.5;">
                    The lighthouse lens pulses with otherworldly energy in your hands. 
                    Something stirs in the harbor depths, drawn by the lens's power. 
                    Your true test is only beginning...
                </div>
                <div style="font-size: 24px; color: #ff6666; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                    TO BE CONTINUED...
                </div>
                <div style="margin-top: 30px; font-size: 14px; color: #888888;">
                    Press F5 to restart Chapter One
                </div>
            `;
            
            chapterEndDiv.appendChild(continueDiv);
        }
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    triggerGameOver(type) {
        this.gameState = 'gameover';
        
        // Immediately show game over screen
        this.showGameOverScreen(type);
        
        // Stop the game loop essentially by preventing player updates
        switch (type) {
            case 'sanity':
                this.dialogue.start([
                    "The shadows close in around you...",
                    "Your mind fractures under the weight of unspeakable truths.",
                    "In the darkness, whispers become screams.",
                    "The lighthouse beam fades forever.",
                    "",
                    "You have been consumed by the horror of Pale Harbor.",
                    "",
                    "GAME OVER - MADNESS CLAIMED YOU",
                    "",
                    "Press F5 to restart your journey."
                ]);
                
                // Dramatic visual effect
                this.horrorEffects.screenFlash('#000000', 1.0, 5.0);
                this.shakeCamera(20, 3.0);
                break;
                
            case 'shadow':
                this.dialogue.start([
                    "The shadow figure reaches out with impossible fingers...",
                    "Cold touches your soul as reality tears apart.",
                    "You become one with the eternal darkness.",
                    "",
                    "CONSUMED BY SHADOWS",
                    "",
                    "Press F5 to restart your journey."
                ]);
                
                this.horrorEffects.screenFlash('#000000', 0.9, 3.0);
                this.shakeCamera(15, 2.0);
                break;
                
            default:
                this.dialogue.start([
                    "The horror of Pale Harbor has claimed another soul...",
                    "",
                    "GAME OVER",
                    "",
                    "Press F5 to restart your journey."
                ]);
        }
        
        // Gradually fade out the game
        setTimeout(() => {
            this.horrorEffects.effects.push({
                type: 'final_fade',
                duration: 10,
                time: 0,
                active: true,
                update: function(deltaTime) {
                    this.time += deltaTime;
                    if (this.time >= this.duration) {
                        this.active = false;
                    }
                },
                render: function(ctx) {
                    const alpha = Math.min(0.95, this.time / this.duration * 0.95);
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.restore();
                }
            });
        }, 3000);
    }
    
    showGameOverScreen(type) {
        // Create a more visible game over overlay
        let gameOverDiv = document.getElementById('gameOverScreen');
        if (!gameOverDiv) {
            gameOverDiv = document.createElement('div');
            gameOverDiv.id = 'gameOverScreen';
            gameOverDiv.style.position = 'fixed';
            gameOverDiv.style.top = '0';
            gameOverDiv.style.left = '0';
            gameOverDiv.style.width = '100%';
            gameOverDiv.style.height = '100%';
            gameOverDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            gameOverDiv.style.color = '#ff4444';
            gameOverDiv.style.display = 'flex';
            gameOverDiv.style.flexDirection = 'column';
            gameOverDiv.style.justifyContent = 'center';
            gameOverDiv.style.alignItems = 'center';
            gameOverDiv.style.fontSize = '24px';
            gameOverDiv.style.fontFamily = 'serif';
            gameOverDiv.style.textAlign = 'center';
            gameOverDiv.style.zIndex = '9999';
            gameOverDiv.style.opacity = '0';
            gameOverDiv.style.transition = 'opacity 2s ease-in';
            document.body.appendChild(gameOverDiv);
        }
        
        const messages = {
            'sanity': {
                title: 'MADNESS CONSUMED YOU',
                subtitle: 'Your sanity reached zero in the cursed harbor',
                flavor: 'The whispers from the deep claimed your mind...'
            },
            'shadow': {
                title: 'SHADOW TOUCHED',
                subtitle: 'The darkness between worlds found you',
                flavor: 'You became one with the eternal shadow...'
            },
            'default': {
                title: 'GAME OVER',
                subtitle: 'The horror of Pale Harbor claims another soul',
                flavor: 'Some mysteries are too dangerous to uncover...'
            }
        };
        
        const message = messages[type] || messages['default'];
        
        gameOverDiv.innerHTML = `
            <div style="margin-bottom: 30px; font-size: 36px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                ${message.title}
            </div>
            <div style="margin-bottom: 20px; font-size: 18px; color: #cc6666;">
                ${message.subtitle}
            </div>
            <div style="margin-bottom: 30px; font-size: 16px; color: #999999; font-style: italic;">
                ${message.flavor}
            </div>
            <div style="margin-bottom: 20px; font-size: 14px; color: #ffffff;">
                Survival Time: ${this.getFormattedSurvivalTime()}
            </div>
            <div style="font-size: 16px; color: #888888;">
                Press F5 to restart your journey into darkness
            </div>
        `;
        
        // Fade in the game over screen
        setTimeout(() => {
            gameOverDiv.style.opacity = '1';
        }, 100);
    }
    
    getFormattedSurvivalTime() {
        const totalMinutes = Math.floor(this.time / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m ${Math.floor(this.time % 60)}s`;
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    try {
        window.game = new Game();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        console.error('Stack trace:', error.stack);
        
        // Display error to user
        document.body.innerHTML = `
            <div style="color: red; padding: 20px; font-family: monospace;">
                <h2>Game Failed to Load</h2>
                <p>Error: ${error.message}</p>
                <p>Check the browser console for more details.</p>
            </div>
        `;
    }
});
