// Horror Effects System for The Pale Harbor
class HorrorEffects {
    constructor(game) {
        this.game = game;
        this.effects = [];
        this.lastEffectTime = 0;
        this.ambientTimer = 0;
        
        // Screen distortion effects
        this.screenNoise = [];
        this.generateScreenNoise();
        
        // Audio context for atmospheric sounds
        this.initializeAudio();
        
        // Hallucination tracking
        this.hallucinationCooldown = 0;
        this.activeHallucinations = [];
        
        // Weather effects
        this.weatherIntensity = 0;
        this.fogIntensity = 0.1;
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        } catch (e) {
            console.log('Audio not supported');
            this.audioContext = null;
        }
    }
    
    generateScreenNoise() {
        // Generate static noise pattern for screen effects using deterministic values
        for (let i = 0; i < 1000; i++) {
            this.screenNoise.push({
                x: (i * 73.7) % this.game.width, // Deterministic positioning
                y: (i * 127.3) % this.game.height,
                opacity: (Math.sin(i * 0.7) + 1) * 0.15, // 0-0.3 range
                life: (Math.cos(i * 1.2) + 1) * 0.25 + 0.1 // 0.1-0.6 range
            });
        }
    }
    
    update(deltaTime) {
        try {
            this.ambientTimer += deltaTime;
            this.hallucinationCooldown -= deltaTime;
            
            // Prevent horror effects near critical game areas (like docks) to avoid freezing
            const player = this.game.player;
            const nearDock = (player.x > 350 && player.x < 550 && player.y > 750 && player.y < 1050);
            
            // Limit number of active effects to prevent performance issues
            if (this.effects.length > 10) {
                this.effects = this.effects.slice(0, 10);
            }
            
            if (this.activeHallucinations.length > 3) {
                this.activeHallucinations = this.activeHallucinations.slice(0, 3);
            }
            
            if (!nearDock) {
                // Update existing effects safely
                this.effects = this.effects.filter(effect => {
                    try {
                        if (effect && effect.update) {
                            effect.update(deltaTime);
                            return effect.active;
                        }
                        return false;
                    } catch (e) {
                        console.warn('Error updating effect:', e);
                        return false;
                    }
                });
                
                // Update hallucinations safely
                this.activeHallucinations = this.activeHallucinations.filter(hall => {
                    if (hall && typeof hall.life === 'number') {
                        hall.life -= deltaTime;
                        return hall.life > 0;
                    }
                    return false;
                });
                
                // Trigger effects based on sanity and time with safety checks
                this.triggerSanityEffects(deltaTime);
                this.triggerTimeBasedEffects(deltaTime);
                this.triggerAmbientEffects(deltaTime);
            }
            
            // Update screen noise (always update this for performance)
            this.updateScreenNoise(deltaTime);
        } catch (error) {
            console.error('Error in HorrorEffects.update:', error);
            // Reset effects to prevent continuous errors
            this.effects = [];
            this.activeHallucinations = [];
        }
    }
    
    triggerSanityEffects(deltaTime) {
        const sanity = this.game.sanity;
        const timeSinceLastEffect = this.ambientTimer - this.lastEffectTime;
        const time = this.game.time;
        
        // Low sanity effects using deterministic timing
        if (sanity < 30) {
            // Frequent disturbing effects
            const effectChance = Math.sin(time * 0.5) * 0.5 + 0.5;
            if (timeSinceLastEffect > 3 && effectChance > 0.7) {
                this.triggerRandomLowSanityEffect();
                this.lastEffectTime = this.ambientTimer;
            }
            
            // Hallucinations using deterministic timing
            const hallucinationChance = Math.cos(time * 0.3) * 0.5 + 0.5;
            if (this.hallucinationCooldown <= 0 && hallucinationChance > 0.9) {
                this.triggerHallucination();
                this.hallucinationCooldown = 5 + (Math.sin(time * 0.2) + 1) * 5; // 5-15 seconds
            }
        } else if (sanity < 60) {
            // Medium sanity - subtle effects
            const mediumEffectChance = Math.sin(time * 0.2) * 0.5 + 0.5;
            if (timeSinceLastEffect > 8 && mediumEffectChance > 0.85) {
                this.triggerRandomMediumSanityEffect();
                this.lastEffectTime = this.ambientTimer;
            }
        }
        
        // Screen distortion intensity based on sanity
        this.screenDistortionIntensity = (100 - sanity) / 100 * 0.3;
    }
    
    triggerTimeBasedEffects(deltaTime) {
        const gameTime = this.game.gameTime;
        const time = this.game.time;
        
        // Night time effects (10 PM to 6 AM) using deterministic timing
        if (gameTime > 22 || gameTime < 6) {
            // More frequent effects at night
            const nightEffectChance = Math.sin(time * 0.1) * 0.5 + 0.5;
            if (nightEffectChance > 0.95) {
                this.triggerNightEffect();
            }
        }
        
        // Witching hour (3-4 AM)
        if (gameTime >= 3 && gameTime <= 4) {
            const witchingHourChance = Math.cos(time * 0.07) * 0.5 + 0.5;
            if (witchingHourChance > 0.9) {
                this.triggerWitchingHourEffect();
            }
        }
    }
    
    triggerAmbientEffects(deltaTime) {
        const time = this.game.time;
        
        // Periodic ambient effects regardless of sanity using deterministic timing
        const ambientEffectChance = Math.sin(time * 0.05) * 0.5 + 0.5;
        if (ambientEffectChance > 0.98) {
            this.triggerAmbientEffect();
        }
        
        // Weather effects
        const weatherEffectChance = Math.cos(time * 0.03) * 0.5 + 0.5;
        if (weatherEffectChance > 0.99) {
            this.triggerWeatherEffect();
        }
    }
    
    triggerRandomLowSanityEffect() {
        const effects = [
            () => this.screenFlash('#ff0000', 0.3, 0.1),
            () => this.screenShake(15, 1.0),
            () => this.addScreenNoise(0.4, 2.0),
            () => this.whisperEffect(),
            () => this.shadowMovement(),
            () => this.temporaryBlindness(0.5),
            () => this.pulseEffect('#800000', 2.0)
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.sin(this.game.time * 0.73) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
    }
    
    triggerRandomMediumSanityEffect() {
        const effects = [
            () => this.screenFlash('#ffff00', 0.1, 0.05),
            () => this.screenShake(5, 0.3),
            () => this.addScreenNoise(0.1, 1.0),
            () => this.subtleWhisper(),
            () => this.peripheralMovement()
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.cos(this.game.time * 0.67) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
    }
    
    triggerNightEffect() {
        const effects = [
            () => this.fogThicken(3.0),
            () => this.distantSound('owl'),
            () => this.lighthouseFlicker(),
            () => this.shadowLengthen()
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.sin(this.game.time * 0.43) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
    }
    
    triggerWitchingHourEffect() {
        const effects = [
            () => this.allLightsFlicker(),
            () => this.temperatureDrop(),
            () => this.whisperChorus(),
            () => this.realityDistortion(2.0)
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.cos(this.game.time * 0.37) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
        
        // Extra sanity loss during witching hour
        this.game.decreaseSanity(1);
    }
    
    triggerAmbientEffect() {
        const effects = [
            () => this.distantSound('seagull'),
            () => this.distantSound('foghorn'),
            () => this.distantSound('wave'),
            () => this.windGust(),
            () => this.fogShift()
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.sin(this.game.time * 0.67) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
    }
    
    triggerWeatherEffect() {
        const effects = [
            () => this.rainStart(),
            () => this.windIncrease(),
            () => this.fogRoll(),
            () => this.lightningFlash()
        ];
        
        // Use deterministic selection based on game time
        const effectIndex = Math.floor((Math.sin(this.game.time * 1.13) + 1) * 0.5 * effects.length);
        const effect = effects[effectIndex % effects.length];
        effect();
    }
    
    triggerHallucination() {
        const hallucinations = [
            () => this.phantomPerson(),
            () => this.disappearingObject(),
            () => this.falseExit(),
            () => this.mirrorSelf(),
            () => this.timeSkip()
        ];
        
        // Use deterministic selection based on game time and sanity
        const selectionSeed = this.game.time * 0.89 + (100 - this.game.sanity) * 0.01;
        const hallucinationIndex = Math.floor((Math.sin(selectionSeed) + 1) * 0.5 * hallucinations.length);
        const hallucination = hallucinations[hallucinationIndex % hallucinations.length];
        hallucination();
    }
    
    // Specific effect implementations
    screenFlash(color, intensity, duration) {
        this.effects.push({
            type: 'flash',
            color: color,
            intensity: intensity,
            duration: duration,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const alpha = Math.max(0, this.intensity * (1 - this.time / this.duration));
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            }
        });
    }
    
    screenShake(intensity, duration) {
        this.game.shakeCamera(intensity, duration);
    }
    
    addScreenNoise(intensity, duration) {
        this.effects.push({
            type: 'noise',
            intensity: intensity,
            duration: duration,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const alpha = this.intensity * (1 - this.time / this.duration);
                ctx.save();
                ctx.globalAlpha = alpha;
                
                // Render noise pattern
                for (let i = 0; i < 200; i++) {
                    const x = Math.random() * ctx.canvas.width;
                    const y = Math.random() * ctx.canvas.height;
                    const brightness = Math.random() * 255;
                    ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
                    ctx.fillRect(x, y, 1, 1);
                }
                
                ctx.restore();
            }
        });
    }
    
    whisperEffect() {
        try {
            this.playSound('whisper', 0.3, 200);
            
            // Show random whisper text with safety check
            const whispers = [
                "...behind you...",
                "...they're coming...",
                "...you don't belong here...",
                "...leave while you can...",
                "...we see you...",
                "...the lighthouse calls..."
            ];
            
            const whisper = whispers[Math.floor(Math.random() * whispers.length)];
            if (this.game.dialogue && this.game.dialogue.showThought) {
                this.game.dialogue.showThought(whisper);
            }
        } catch (error) {
            console.warn('Error in whisperEffect:', error);
        }
    }
    
    subtleWhisper() {
        this.playSound('whisper', 0.1, 150);
    }
    
    shadowMovement() {
        // Add moving shadow entities
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        
        const shadow = {
            type: 'moving_shadow',
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            targetX: player.x + Math.cos(angle + Math.PI) * distance,
            targetY: player.y + Math.sin(angle + Math.PI) * distance,
            opacity: 0.6,
            speed: 50,
            lifetime: 3,
            game: this.game,
            render: function(ctx) {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x - 15, this.y - 30, 30, 60);
                ctx.restore();
            },
            update: function(deltaTime) {
                // Move towards target
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    this.x += (dx / distance) * this.speed * deltaTime;
                    this.y += (dy / distance) * this.speed * deltaTime;
                }
                
                // Check distance to player - if too close and sanity is very low, trigger game over
                const playerDistance = Math.sqrt(
                    Math.pow(this.x - this.game.player.x, 2) + 
                    Math.pow(this.y - this.game.player.y, 2)
                );
                
                if (playerDistance < 30 && this.game.sanity < 10) {
                    this.game.triggerGameOver('shadow');
                    return; // Stop updating this shadow
                }
                
                this.lifetime -= deltaTime;
                this.opacity *= 0.99;
                
                if (this.lifetime <= 0 || this.opacity < 0.1) {
                    const index = this.game.world.entities.indexOf(this);
                    if (index > -1) {
                        this.game.world.entities.splice(index, 1);
                    }
                }
            }
        };
        
        this.game.world.entities.push(shadow);
    }
    
    peripheralMovement() {
        // Subtle movement at edge of vision
        this.game.shakeCamera(2, 0.2);
    }
    
    temporaryBlindness(duration) {
        this.effects.push({
            type: 'blindness',
            duration: duration,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const alpha = 0.9 * (1 - this.time / this.duration);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            }
        });
    }
    
    pulseEffect(color, duration) {
        this.effects.push({
            type: 'pulse',
            color: color,
            duration: duration,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const pulse = Math.sin(this.time * 8) * 0.5 + 0.5;
                const alpha = pulse * 0.2 * (1 - this.time / this.duration);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
            }
        });
    }
    
    lighthouseFlicker() {
        // This would affect lighthouse rendering in the world
        // For now, just create a brief flash effect
        this.screenFlash('#ffff88', 0.2, 0.3);
    }
    
    phantomPerson() {
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 100;
        
        this.activeHallucinations.push({
            type: 'phantom_person',
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            life: 2 + Math.random() * 3,
            opacity: 0.4 + Math.random() * 0.3
        });
        
        this.game.dialogue.showThought("Was that... someone standing there?");
    }
    
    disappearingObject() {
        // Create a fake object that disappears when looked at directly
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        
        this.activeHallucinations.push({
            type: 'disappearing_object',
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            life: 3 + Math.random() * 2,
            opacity: 0.6,
            flickerTime: 0
        });
        
        this.game.dialogue.showThought("Did I just see something there?");
    }
    
    falseExit() {
        // Show a fake door or exit that isn't really there
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 80;
        
        this.activeHallucinations.push({
            type: 'false_exit',
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            life: 4 + Math.random() * 3,
            opacity: 0.7
        });
        
        this.game.dialogue.showThought("Is that... a way out?");
    }
    
    mirrorSelf() {
        // Create a phantom version of the player
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 100;
        
        this.activeHallucinations.push({
            type: 'mirror_self',
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            life: 3 + Math.random() * 2,
            opacity: 0.5
        });
        
        this.game.dialogue.showThought("That figure... it looks like me.");
    }
    
    timeSkip() {
        // Brief screen distortion suggesting time has skipped
        this.screenFlash('#ffffff', 0.8, 0.1);
        this.game.gameTime += 0.1 + Math.random() * 0.2; // Skip 6-18 minutes
        this.game.dialogue.showThought("How long was I standing here?");
    }
    
    fogThicken(duration) {
        // Temporarily increase fog density
        this.fogIntensity = Math.min(1.0, this.fogIntensity + 0.3);
        
        setTimeout(() => {
            this.fogIntensity = Math.max(0.1, this.fogIntensity - 0.2);
        }, (duration || 3) * 1000);
    }
    
    shadowLengthen() {
        // Create elongated shadow effects
        this.effects.push({
            type: 'shadow_lengthen',
            duration: 2,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const alpha = 0.3 * (1 - this.time / this.duration);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#000000';
                
                // Draw elongated shadows from bottom of screen
                for (let i = 0; i < 5; i++) {
                    const x = (i / 4) * ctx.canvas.width;
                    const height = 100 + Math.sin(this.time * 3 + i) * 50;
                    ctx.fillRect(x - 10, ctx.canvas.height - height, 20, height);
                }
                
                ctx.restore();
            }
        });
    }
    
    allLightsFlicker() {
        // Make all light sources flicker
        this.lighthouseFlicker();
        this.screenFlash('#ffff88', 0.1, 0.2);
    }
    
    temperatureDrop() {
        // Visual effect suggesting sudden cold
        this.effects.push({
            type: 'temperature_drop',
            duration: 3,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const alpha = 0.2 * Math.sin(this.time * 5) * (1 - this.time / this.duration);
                if (alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#aabbdd';
                    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.restore();
                }
            }
        });
        
        this.game.dialogue.showThought("The air suddenly feels ice cold...");
    }
    
    whisperChorus() {
        // Multiple overlapping whispers
        this.playSound('whisper', 0.2, 180, 0.3);
        this.playSound('whisper', 0.15, 220, 0.4);
        this.playSound('whisper', 0.1, 160, 0.5);
        
        this.game.dialogue.showThought("Voices... so many voices...");
    }
    
    realityDistortion(duration) {
        // Warp the visual field
        this.effects.push({
            type: 'reality_distortion',
            duration: duration,
            time: 0,
            active: true,
            update: function(deltaTime) {
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.active = false;
                }
            },
            render: function(ctx) {
                const intensity = 0.3 * Math.sin(this.time * 10) * (1 - this.time / this.duration);
                if (Math.abs(intensity) > 0.1) {
                    ctx.save();
                    ctx.globalAlpha = Math.abs(intensity);
                    ctx.fillStyle = intensity > 0 ? '#ff0000' : '#0000ff';
                    
                    // Create distortion pattern
                    for (let y = 0; y < ctx.canvas.height; y += 8) {
                        const offset = Math.sin(y * 0.1 + this.time * 15) * 20 * intensity;
                        ctx.fillRect(offset, y, ctx.canvas.width, 4);
                    }
                    
                    ctx.restore();
                }
            }
        });
    }
    
    distantSound(type) {
        let frequency, duration;
        switch (type) {
            case 'seagull':
                frequency = 800;
                duration = 0.3;
                break;
            case 'foghorn':
                frequency = 80;
                duration = 2.0;
                break;
            case 'wave':
                frequency = 60;
                duration = 1.5;
                break;
            case 'owl':
                frequency = 400;
                duration = 0.4;
                break;
            default:
                frequency = 200;
                duration = 0.5;
        }
        
        this.playSound(type, 0.1, frequency, duration);
    }
    
    playSound(type, volume, frequency, duration = 0.5) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type === 'whisper' ? 'sawtooth' : 'sine';
            
            filterNode.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Audio error - ignore
        }
    }
    
    updateScreenNoise(deltaTime) {
        // Update noise particles
        this.screenNoise.forEach(particle => {
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                particle.x = Math.random() * this.game.width;
                particle.y = Math.random() * this.game.height;
                particle.opacity = Math.random() * 0.3;
                particle.life = Math.random() * 0.5 + 0.1;
            }
        });
    }
    
    render(ctx) {
        // Render screen-space effects
        this.effects.forEach(effect => {
            if (effect.render) {
                effect.render(ctx);
            }
        });
        
        // Render sanity-based screen distortion
        if (this.screenDistortionIntensity > 0) {
            this.renderScreenDistortion(ctx);
        }
        
        // Render hallucinations
        this.renderHallucinations(ctx);
        
        // Render atmospheric overlay
        this.renderAtmosphericOverlay(ctx);
    }
    
    renderScreenDistortion(ctx) {
        const intensity = this.screenDistortionIntensity;
        
        // Static noise
        ctx.save();
        ctx.globalAlpha = intensity * 0.5;
        
        this.screenNoise.forEach(particle => {
            if (particle.life > 0) {
                const brightness = Math.random() * 255;
                ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
                ctx.fillRect(particle.x, particle.y, 1, 1);
            }
        });
        
        ctx.restore();
        
        // Scanlines
        if (intensity > 0.2) {
            ctx.save();
            ctx.globalAlpha = intensity * 0.3;
            ctx.fillStyle = '#000000';
            
            for (let y = 0; y < this.game.height; y += 4) {
                ctx.fillRect(0, y, this.game.width, 1);
            }
            
            ctx.restore();
        }
    }
    
    renderHallucinations(ctx) {
        this.activeHallucinations.forEach(hall => {
            ctx.save();
            ctx.globalAlpha = hall.opacity * (hall.life / 5); // Fade out over time
            
            switch (hall.type) {
                case 'phantom_person':
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(hall.x - 10, hall.y - 20, 20, 40);
                    break;
                    
                case 'disappearing_object':
                    // Flicker effect
                    hall.flickerTime = (hall.flickerTime || 0) + 0.1;
                    if (Math.sin(hall.flickerTime * 10) > 0) {
                        ctx.fillStyle = '#444444';
                        ctx.fillRect(hall.x - 8, hall.y - 8, 16, 16);
                    }
                    break;
                    
                case 'false_exit':
                    ctx.fillStyle = '#2a1a0a';
                    ctx.fillRect(hall.x - 15, hall.y - 25, 30, 50);
                    // Door handle
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(hall.x + 8, hall.y, 3, 8);
                    break;
                    
                case 'mirror_self':
                    // Draw a phantom version of the player
                    ctx.fillStyle = '#3a4a5c';
                    ctx.fillRect(hall.x - 12, hall.y - 16, 24, 32);
                    break;
            }
            
            ctx.restore();
        });
    }
    
    renderAtmosphericOverlay(ctx) {
        // Time-based atmospheric effects
        const gameTime = this.game.gameTime;
        const isNight = gameTime > 20 || gameTime < 6;
        
        if (isNight) {
            // Darker, more oppressive atmosphere at night
            const nightIntensity = 0.3 + (this.game.sanity < 50 ? 0.2 : 0);
            ctx.save();
            ctx.globalAlpha = nightIntensity;
            ctx.fillStyle = '#000020';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            ctx.restore();
        }
        
        // Fog overlay
        const fogIntensity = 0.1 + Math.sin(this.ambientTimer * 0.3) * 0.05;
        ctx.save();
        ctx.globalAlpha = fogIntensity;
        ctx.fillStyle = '#ccccdd';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        ctx.restore();
    }

    // Weather Effects
    rainStart() {
        // Simple rain effect - could be enhanced with particles
        this.weatherIntensity = Math.min(1.0, this.weatherIntensity + 0.3);
    }

    windIncrease() {
        // Increase camera shake for wind effect
        this.game.shakeCamera(2, 1.0);
    }

    fogRoll() {
        // Increase fog opacity temporarily
        this.fogIntensity = Math.min(1.0, (this.fogIntensity || 0.1) + 0.2);
    }

    lightningFlash() {
        // Very brief, realistic lightning flash - just like real lightning
        this.screenFlash('#ffffff', 0.7, 0.05); // Only 0.05 seconds (50ms)
        
        // Optional second micro-flash for realism
        setTimeout(() => {
            this.screenFlash('#e6e6ff', 0.3, 0.03); // Even briefer second flash
        }, 80);
        
        // Thunder comes after lightning
        setTimeout(() => {
            this.game.shakeCamera(4, 0.3);
        }, Math.floor(Math.sin(this.game.time) * 800 + 1200)); // 1.2-2.0 second delay
    }

    fogShift() {
        // Subtle fog movement effect - could increase fog intensity temporarily
        this.fogIntensity = Math.min(0.8, this.fogIntensity + 0.1);
        
        // Gradually reduce fog intensity back to normal
        setTimeout(() => {
            this.fogIntensity = Math.max(0.1, this.fogIntensity - 0.05);
        }, 3000);
    }

    windGust() {
        // Brief camera shake for wind effect
        this.game.shakeCamera(3, 0.8);
        
        // Could add particle effects here in the future
        // For now, just create a brief atmospheric effect
    }
}
