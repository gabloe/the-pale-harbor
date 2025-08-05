// Dialogue System for The Pale Harbor
class DialogueSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.currentDialogue = [];
        this.currentIndex = 0;
        this.textSpeed = 30; // characters per second
        this.displayedText = '';
        this.fullText = '';
        this.textTimer = 0;
        this.isTextComplete = false;
        
        // UI elements
        this.dialogueBox = document.getElementById('dialogue');
        this.dialogueText = document.getElementById('dialogueText');
        
        // Typewriter sound effect simulation
        this.lastCharTime = 0;
        this.charSoundInterval = 0.08; // seconds between character sounds
    }
    
    start(dialogue) {
        if (!Array.isArray(dialogue)) {
            dialogue = [dialogue];
        }
        
        this.currentDialogue = dialogue;
        this.currentIndex = 0;
        this.isActive = true;
        this.game.gameState = 'dialogue';
        
        this.showDialogue();
        this.startCurrentText();
    }
    
    showDialogue() {
        this.dialogueBox.style.display = 'block';
        this.updateDialogueAppearance();
    }
    
    hideDialogue() {
        this.dialogueBox.style.display = 'none';
        this.isActive = false;
        this.game.gameState = 'playing';
    }
    
    updateDialogueAppearance() {
        // Change dialogue box appearance based on sanity level
        const sanity = this.game.sanity;
        const box = this.dialogueBox;
        
        if (sanity < 30) {
            // Low sanity - disturbing visual effects
            box.style.backgroundColor = 'rgba(20, 0, 0, 0.95)';
            box.style.borderColor = '#800000';
            box.style.color = '#ffcccc';
            box.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        } else if (sanity < 60) {
            // Medium sanity - unsettling appearance
            box.style.backgroundColor = 'rgba(10, 10, 0, 0.92)';
            box.style.borderColor = '#666600';
            box.style.color = '#ffffcc';
            box.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        } else {
            // High sanity - normal appearance
            box.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            box.style.borderColor = '#666666';
            box.style.color = '#ffffff';
            box.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        }
        
        // Don't override dialogueText styles here - let applyCSSFormatting handle emphasis
    }
    
    startCurrentText() {
        if (this.currentIndex >= this.currentDialogue.length) {
            this.hideDialogue();
            return;
        }
        
        // Skip empty or whitespace-only dialogue entries
        let currentText = this.currentDialogue[this.currentIndex];
        if (!currentText || currentText.trim() === '') {
            this.currentIndex++;
            this.startCurrentText(); // Recursively try the next one
            return;
        }
        
        this.fullText = this.processText(currentText);
        this.displayedText = '';
        this.textTimer = 0;
        this.isTextComplete = false;
        this.lastCharTime = 0;
        
        this.updateDialogueAppearance();
    }
    
    processText(text) {
        // Process special text effects based on sanity
        const sanity = this.game.sanity;
        
        if (sanity < 30) {
            // At very low sanity, add disturbing text effects
            text = this.addTextDistortions(text);
        } else if (sanity < 60) {
            // At medium sanity, add subtle effects
            text = this.addSubtleEffects(text);
        }
        
        return text;
    }
    
    addTextDistortions(text) {
        // Add deterministic character replacements and repetitions based on text content
        let distorted = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = char.charCodeAt(0);
            
            // Always preserve spaces to prevent word merging
            if (char === ' ') {
                distorted += ' ';
                continue;
            }
            
            // Use deterministic "randomness" based on character position and ASCII value
            const pseudo1 = (i * 7 + charCode * 3) % 100;
            const pseudo2 = (i * 11 + charCode * 5) % 100;
            
            if (pseudo1 < 5) {
                // Replace with disturbing characters
                const distortChars = ['█', '▓', '▒', '░', '?', '#', '@'];
                distorted += distortChars[charCode % distortChars.length];
            } else if (pseudo2 < 3) {
                // Repeat character (but not spaces)
                distorted += char + char;
            } else {
                distorted += char;
            }
        }
        
        // Deterministically add extra disturbing text based on text length
        if ((text.length * 13) % 100 < 30) {
            const additions = [
                ' ...they watch...',
                ' ...whispers in the fog...',
                ' ...it\'s not real...',
                ' ...behind you...'
            ];
            distorted += additions[text.length % additions.length];
        }
        
        return distorted;
    }
    
    addSubtleEffects(text) {
        // Add occasional typos or stuttering using deterministic methods
        let processed = '';
        const words = text.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            
            // Occasional stuttering effect based on word index and length
            if ((i * 17 + word.length * 7) % 100 < 10 && word.length > 3) {
                word = word[0] + '-' + word;
            }
            
            processed += word;
            // Always add space between words except after the last word
            if (i < words.length - 1) {
                processed += ' ';
            }
        }
        
        return processed;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.textTimer += deltaTime;
        
        if (!this.isTextComplete) {
            // Handle empty text case
            if (!this.fullText || this.fullText.length === 0) {
                this.isTextComplete = true;
                this.displayedText = this.fullText || '';
                this.updateDisplay();
                return;
            }
            
            // Typewriter effect
            const charactersToShow = Math.floor(this.textTimer * this.textSpeed);
            this.displayedText = this.fullText.substring(0, charactersToShow);
            
            // Simulate typewriter sound
            if (this.textTimer - this.lastCharTime > this.charSoundInterval) {
                this.playCharacterSound();
                this.lastCharTime = this.textTimer;
            }
            
            if (this.displayedText.length >= this.fullText.length) {
                this.isTextComplete = true;
                this.displayedText = this.fullText;
            }
            
            this.updateDisplay();
        }
    }
    
    playCharacterSound() {
        // Simulate typewriter sound with Web Audio API (optional)
        // For now, we'll just create a subtle audio cue
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Use deterministic frequency based on character position instead of random
            const freq = 800 + ((this.displayedText.length * 23) % 200);
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio not supported or blocked
        }
    }
    
    updateDisplay() {
        let displayText = this.displayedText;
        
        // Apply glitch effect at very low sanity
        if (this.game.sanity < 30) {
            // Add glitch effect based on game time instead of random
            const timeBasedGlitch = Math.floor(this.game.time * 10) % 100;
            if (timeBasedGlitch < 10) {
                displayText = this.applyGlitchEffect(displayText);
            }
        }
        
        // Always use textContent to preserve spacing
        this.dialogueText.textContent = displayText;
        
        // Apply CSS-based formatting when text is complete
        if (this.isTextComplete) {
            this.applyCSSFormatting();
        }
    }
    
    applyCSSFormatting() {
        // Get the original plain text
        const text = this.dialogueText.textContent;
        this.dialogueText.setAttribute('data-original-text', text);
        
        // Clear any previous emphasis styles on the element itself
        this.dialogueText.style.textShadow = '';
        this.dialogueText.style.fontWeight = '';
        this.dialogueText.style.color = '';
        this.dialogueText.style.filter = '';
        
        // Split text into words while preserving spaces
        const words = text.split(/(\s+)/); // This keeps the spaces in the array
        let formattedHTML = '';
        let hasEmphasis = false;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            // If it's whitespace, wrap in a span to preserve it
            if (/^\s+$/.test(word)) {
                formattedHTML += `<span style="white-space: pre;">${word}</span>`;
            }
            // Check for words to emphasize
            else if (/^lighthouse$/i.test(word.trim())) {
                formattedHTML += `<span style="text-shadow: 0 0 20px rgba(255, 255, 255, 1.0), 0 0 10px rgba(255, 255, 255, 0.8), 2px 2px 4px rgba(0,0,0,0.8); font-weight: bold; color: #ffffff; filter: brightness(1.5); white-space: pre;">lighthouse</span>`;
                hasEmphasis = true;
            }
            else if (/^key$/i.test(word.trim())) {
                formattedHTML += `<span style="text-shadow: 0 0 20px rgba(255, 221, 0, 1.0), 0 0 10px rgba(255, 221, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.8); font-weight: bold; color: #ffdd00; filter: brightness(1.5); white-space: pre;">key</span>`;
                hasEmphasis = true;
            }
            else if (/^journal$/i.test(word.trim())) {
                formattedHTML += `<span style="text-shadow: 0 0 20px rgba(136, 204, 255, 1.0), 0 0 10px rgba(136, 204, 255, 0.8), 2px 2px 4px rgba(0,0,0,0.8); font-weight: bold; color: #88ccff; filter: brightness(1.5); white-space: pre;">journal</span>`;
                hasEmphasis = true;
            }
            else {
                // Regular word, wrap in span to maintain consistency
                formattedHTML += `<span style="white-space: pre;">${word}</span>`;
            }
        }
        
        if (hasEmphasis) {
            this.dialogueText.innerHTML = formattedHTML;
        } else {
            this.dialogueText.textContent = text;
        }
    }
    
    applyGlitchEffect(text) {
        // Deterministically corrupt some characters based on their position and content
        let glitched = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCode = char.charCodeAt(0);
            
            // Always preserve spaces and basic punctuation to maintain readability
            if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?') {
                glitched += char;
                continue;
            }
            
            // Use deterministic "randomness" based on position and game time
            const pseudo = (i * 13 + Math.floor(this.game.time * 5) + charCode) % 100;
            if (pseudo < 5) {
                glitched += String.fromCharCode(33 + ((i * 7 + charCode) % 94));
            } else {
                glitched += char;
            }
        }
        return glitched;
    }
    
    advance() {
        if (!this.isActive) return;
        
        if (!this.isTextComplete) {
            // Skip to end of current text
            this.displayedText = this.fullText;
            this.isTextComplete = true;
            this.updateDisplay();
        } else {
            // Move to next dialogue
            this.currentIndex++;
            
            if (this.currentIndex >= this.currentDialogue.length) {
                this.hideDialogue();
            } else {
                this.startCurrentText();
            }
        }
    }
    
    // Special dialogue types
    showThought(text) {
        const thoughtText = `*${text}*`;
        this.start([thoughtText]);
    }
    
    showNarration(text) {
        this.start([text]);
    }
    
    showChoices(prompt, choices, callbacks) {
        // For future implementation - dialogue choices
        // This would create interactive dialogue options
        console.log('Choice dialogue not yet implemented');
        this.start([prompt]);
    }
    
    // Sanity-based random dialogue
    getTriggerDialogue(triggerType) {
        const sanity = this.game.sanity;
        const dialogues = {
            low_sanity_whispers: [
                "Did you hear that? No... it's nothing.",
                "The fog seems to be moving closer...",
                "I could swear someone just called my name.",
                "The shadows... they're not where they should be."
            ],
            medium_sanity_unease: [
                "Something doesn't feel right about this place.",
                "The air feels heavy here.",
                "I should stay alert.",
                "This fog is unnaturally thick."
            ],
            environmental_observations: [
                "The lighthouse beam cuts through the fog intermittently.",
                "Seagulls cry in the distance.",
                "The harbor water laps gently against the docks.",
                "A cold breeze carries the scent of salt and decay."
            ]
        };
        
        // Use deterministic selection based on game time instead of Math.random()
        const timeBasedPseudo = Math.floor(this.game.time * 3) % 100;
        
        if (sanity < 30 && triggerType === 'random' && timeBasedPseudo < 30) {
            const whispers = dialogues.low_sanity_whispers;
            return whispers[Math.floor(this.game.time) % whispers.length];
        } else if (sanity < 60 && triggerType === 'random' && timeBasedPseudo < 20) {
            const unease = dialogues.medium_sanity_unease;
            return unease[Math.floor(this.game.time) % unease.length];
        } else if (triggerType === 'environmental' && timeBasedPseudo < 10) {
            const observations = dialogues.environmental_observations;
            return observations[Math.floor(this.game.time) % observations.length];
        }
        
        return null;
    }
}
