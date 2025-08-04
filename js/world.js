// World and Environment System for The Pale Harbor
class World {
    constructor(game) {
        this.game = game;
        this.currentMap = 'lighthouse_area';
        this.entities = [];
        this.interactables = [];
        this.collisionObjects = [];
        
        // Lighthouse state tracking
        this.playerInsideLighthouse = false;
        
        // Map data
        this.maps = {
            lighthouse_area: {
                width: 2048,
                height: 1536,
                background: '#1a2a3a',
                areas: [
                    { name: 'Lighthouse Entrance', x: 400, y: 600, width: 300, height: 200 },
                    { name: 'Lighthouse Interior', x: 450, y: 550, width: 200, height: 150 },
                    { name: 'Harbor Docks', x: 340, y: 780, width: 220, height: 220 },
                    { name: 'Town Square', x: 800, y: 400, width: 400, height: 400 }
                ],
                staticObjects: [
                    // Lighthouse
                    { type: 'lighthouse', x: 500, y: 400, width: 100, height: 200 },
                    // Dock structures (extending from shore into water)
                    { type: 'dock', x: 390, y: 780, width: 120, height: 200 },
                    // Town Buildings - arranged in a proper grid around central square
                    // North row
                    { type: 'building', x: 850, y: 450, width: 75, height: 80 },
                    { type: 'building', x: 980, y: 450, width: 80, height: 85 },
                    { type: 'building', x: 1150, y: 450, width: 75, height: 75 },
                    { type: 'building', x: 1280, y: 450, width: 85, height: 80 },
                    
                    // South row  
                    { type: 'building', x: 850, y: 650, width: 85, height: 80 },
                    { type: 'building', x: 980, y: 650, width: 80, height: 75 },
                    { type: 'building', x: 1150, y: 650, width: 90, height: 85 },
                    { type: 'building', x: 1280, y: 650, width: 80, height: 75 },
                    
                    // East and West buildings (flanking the square but not blocking paths)
                    { type: 'building', x: 680, y: 480, width: 80, height: 75 }, // Moved north and west
                    { type: 'building', x: 1400, y: 550, width: 85, height: 80 },
                    // Welcome sign (positioned at town entrance, not overlapping building)
                    { type: 'sign', x: 800, y: 520, width: 40, height: 60 },
                    // Sailboat in the harbor
                    { type: 'sailboat', x: 320, y: 1000, width: 60, height: 40 },
                    // Trees and obstacles - positioned to avoid building overlaps
                    { type: 'tree', x: 300, y: 300, width: 40, height: 60 },
                    { type: 'tree', x: 700, y: 200, width: 35, height: 50 },
                    { type: 'tree', x: 650, y: 400, width: 30, height: 45 },
                    { type: 'tree', x: 1500, y: 350, width: 35, height: 55 },
                    
                    // Additional trees around the lighthouse area
                    { type: 'tree', x: 380, y: 450, width: 45, height: 70 },
                    { type: 'tree', x: 650, y: 480, width: 25, height: 40 },
                    { type: 'tree', x: 420, y: 350, width: 32, height: 48 },
                    
                    // Trees positioned around town square (not overlapping buildings)
                    { type: 'tree', x: 780, y: 380, width: 38, height: 58 }, // Moved away from building overlap
                    { type: 'tree', x: 1520, y: 480, width: 42, height: 65 },
                    { type: 'tree', x: 700, y: 700, width: 35, height: 45 },
                    
                    // Scattered trees around the map edges
                    { type: 'tree', x: 180, y: 600, width: 30, height: 50 },
                    { type: 'tree', x: 120, y: 400, width: 35, height: 55 },
                    { type: 'tree', x: 250, y: 750, width: 28, height: 45 },
                    { type: 'tree', x: 1600, y: 300, width: 40, height: 62 },
                    { type: 'tree', x: 1550, y: 700, width: 33, height: 48 },
                    
                    // Small bushes/young trees in open areas
                    { type: 'tree', x: 320, y: 580, width: 18, height: 25 },
                    { type: 'tree', x: 680, y: 320, width: 20, height: 30 },
                    { type: 'tree', x: 1600, y: 420, width: 22, height: 32 },
                    
                    // Street lamps - better spaced and positioned at key intersections
                    { type: 'lamppost', x: 350, y: 720, width: 12, height: 80 }, // Near dock
                    { type: 'lamppost', x: 870, y: 550, width: 12, height: 80 }, // West entrance to square
                    { type: 'lamppost', x: 1220, y: 480, width: 12, height: 80 }, // Northeast corner
                    { type: 'lamppost', x: 1220, y: 620, width: 12, height: 80 }, // Southeast corner
                    { type: 'lamppost', x: 920, y: 480, width: 12, height: 80 }, // Northwest corner
                    
                    // Rocks and other details
                    { type: 'rock', x: 150, y: 500, width: 30, height: 25 },
                    { type: 'rock', x: 780, y: 380, width: 25, height: 20 }
                ]
            }
        };
        
        this.initializeWorld();
    }
    
    initializeWorld() {
        const map = this.maps[this.currentMap];
        
        // Clear existing entities
        this.entities = [];
        this.interactables = [];
        this.collisionObjects = [];
        
        // Create static objects
        map.staticObjects.forEach(obj => {
            this.createStaticObject(obj);
        });
        
        // Create interactive objects
        this.createInteractables();
        
        // Create water collision (prevent walking on water)
        this.createWaterCollision();
        
        // Create atmospheric entities
        this.createAtmosphericElements();
    }
    
    createStaticObject(obj) {
        // Add to collision objects, but make lighthouse interior passable when unlocked
        if (obj.type === 'lighthouse') {
            // Create collision for lighthouse walls but not the interior
            // Left wall
            this.collisionObjects.push({
                x: obj.x,
                y: obj.y,
                width: 15,
                height: obj.height,
                type: obj.type + '_wall'
            });
            // Right wall
            this.collisionObjects.push({
                x: obj.x + obj.width - 15,
                y: obj.y,
                width: 15,
                height: obj.height,
                type: obj.type + '_wall'
            });
            // Top wall
            this.collisionObjects.push({
                x: obj.x,
                y: obj.y,
                width: obj.width,
                height: 15,
                type: obj.type + '_wall'
            });
            // Bottom wall (with door opening)
            this.collisionObjects.push({
                x: obj.x,
                y: obj.y + obj.height - 15,
                width: 35, // Left side of door
                height: 15,
                type: obj.type + '_wall'
            });
            this.collisionObjects.push({
                x: obj.x + 65, // Right side of door
                y: obj.y + obj.height - 15,
                width: 35,
                height: 15,
                type: obj.type + '_wall'
            });
            
            // Add door collision that blocks the doorway - this forces interaction
            this.collisionObjects.push({
                x: obj.x + 35, // Door opening area
                y: obj.y + obj.height - 15,
                width: 30, // Width of door opening
                height: 15,
                type: 'lighthouse_door',
                blocksMovement: true // Always blocks movement - player must use interaction
            });
        } else {
            // Normal collision object - but make docks and lampposts walkable
            if (obj.type !== 'dock' && obj.type !== 'lamppost') {
                this.collisionObjects.push({
                    x: obj.x,
                    y: obj.y,
                    width: obj.width,
                    height: obj.height,
                    type: obj.type
                });
            }
        }
        
        // Add to entities for rendering
        this.entities.push({
            ...obj,
            isStaticWorldObject: true, // Mark as protected static object
            render: (ctx) => this.renderStaticObject(ctx, obj)
        });
    }
    
    createInteractables() {
        // Lighthouse door (handles both entering and exiting)
        this.interactables.push({
            x: 520,
            y: 580,
            width: 30,
            height: 20,
            type: 'door',
            name: 'Lighthouse Door',
            interact: (game) => {
                // Use state flag instead of position detection
                if (this.playerInsideLighthouse) {
                    // Player is inside - handle exit
                    if (game.hasItem('Lighthouse Lens')) {
                        game.dialogue.start([
                            "With the lighthouse lens in hand, you feel a sense of completion.",
                            "The fog outside seems less threatening now.",
                            "You step back outside, ready to face whatever comes next."
                        ]);
                        game.increaseSanity(10);
                    } else {
                        game.dialogue.start([
                            "You step back outside into the fog-shrouded harbor.",
                            "The lighthouse door closes with a heavy thud behind you.",
                            "You feel like you're missing something important inside..."
                        ]);
                    }
                    // Move player outside
                    game.player.x = 550;
                    game.player.y = 620; // Just outside the door
                    
                    // Update state and remove interior objects
                    this.playerInsideLighthouse = false;
                    game.world.removeLighthouseInteriorEntities();
                } else {
                    // Player is outside - handle entrance
                    if (game.hasItem('Lighthouse Key')) {
                        game.dialogue.start([
                            "The key turns with a heavy click.",
                            "The door creaks open, revealing the lighthouse interior.",
                            "A musty smell wafts out, carrying whispers of the past.",
                            "You step inside and hear the door close behind you..."
                        ]);
                        // Move player inside the lighthouse interior
                        game.player.x = 550; // Center of lighthouse
                        game.player.y = 550; // Inside the lighthouse
                        game.decreaseSanity(8);
                        
                        // Update state and add interior objects
                        this.playerInsideLighthouse = true;
                        this.addLighthouseInteriorObjects(game);
                        this.addLighthouseInteriorEntities();
                    } else {
                        game.dialogue.start([
                            "The lighthouse door is locked.",
                            "You need a key to enter.",
                            "Perhaps the previous keeper left it somewhere nearby..."
                        ]);
                    }
                }
            }
        });
        
        // Mysterious journal on dock
        this.interactables.push({
            x: 440,
            y: 900,
            width: 20,
            height: 15,
            type: 'item',
            name: 'Soggy Journal',
            collected: false,
            interact: function(game) {
                if (!this.collected) {
                    game.dialogue.start([
                        "A water-damaged journal lies abandoned on the dock.",
                        "'Day 23: The fog hasn't lifted. Something moves in it...'",
                        "'Day 24: I can hear them calling my name. I must resist.'",
                        "'Day 25: The lighthouse... it's not what it seems...'"
                    ]);
                    game.addToInventory('Keeper\'s Journal');
                    this.collected = true;
                    game.decreaseSanity(12);
                } else {
                    game.dialogue.start(["You've already taken the journal."]);
                }
            }
        });
        
        // Strange statue in town square (moved slightly right to avoid path intersection)
        this.interactables.push({
            x: 1120, // Moved right from 1070 to avoid the vertical street at x=1070
            y: 550,  // Centered vertically
            width: 40,
            height: 60,
            type: 'statue',
            name: 'Weathered Statue',
            examined: false,
            interact: function(game) {
                // First time - examination
                if (!this.examined) {
                    const responses = [
                        [
                            "An old statue stands in the center of the town square.",
                            "The inscription is too weathered to read clearly.",
                            "But you can make out: '...those who watch... harbor...'"
                        ],
                        [
                            "As you examine the statue closer, you notice its eyes...",
                            "They seem to follow you as you move around the square.",
                            "Surely it's just a trick of the light... right?"
                        ],
                        [
                            "The statue's expression seems different now.",
                            "More... knowing. More aware.",
                            "You feel watched, even when you look away from the square."
                        ]
                    ];
                    
                    const level = Math.min(Math.floor((100 - game.sanity) / 30), 2);
                    game.dialogue.start(responses[level]);
                    game.decreaseSanity(5 + level * 3);
                    this.examined = true;
                } else {
                    // Allow prayer/meditation for sanity restoration during day
                    if (game.gameTime >= 6 && game.gameTime <= 18 && game.sanity < 80) {
                        game.dialogue.start([
                            "You kneel before the weathered statue and close your eyes.",
                            "Despite its unsettling presence, you find a moment of peace.",
                            "The daylight feels warm and protective.",
                            "Your troubled mind feels slightly calmer."
                        ]);
                        game.increaseSanity(12);
                        game.gameTime += 0.25; // 15 minutes pass
                    } else if (game.gameTime < 6 || game.gameTime > 18) {
                        game.dialogue.start([
                            "At night, the statue's presence feels malevolent.",
                            "You dare not linger here in the darkness.",
                            "Those stone eyes seem to pierce your soul."
                        ]);
                        game.decreaseSanity(3);
                    } else {
                        game.dialogue.start([
                            "The statue watches silently over the town square.",
                            "You've found what peace you can here."
                        ]);
                    }
                }
            }
        });
        
        // Hidden item behind lighthouse
        this.interactables.push({
            x: 580,
            y: 420,
            width: 15,
            height: 10,
            type: 'item',
            name: 'Rusted Lantern',
            collected: false,
            interact: function(game) {
                if (!this.collected) {
                    game.dialogue.start([
                        "A rusted lantern is hidden behind the lighthouse.",
                        "Despite its age, it still contains some oil.",
                        "It might be useful in dark places..."
                    ]);
                    game.addToInventory('Old Lantern');
                    this.collected = true;
                    game.increaseSanity(5); // Finding useful items helps sanity
                } else {
                    game.dialogue.start(["The hiding spot is empty now."]);
                }
            }
        });
        
        // Welcome sign interaction
        this.interactables.push({
            x: 800,
            y: 520,
            width: 40,
            height: 60,
            type: 'sign',
            name: 'Welcome Sign',
            interact: (game) => {
                const responses = [
                    [
                        "A weathered welcome sign stands at the town entrance.",
                        "'Welcome to Pale Harbor - Est. 1847'",
                        "'Population... the number appears scratched out.'"
                    ],
                    [
                        "The sign looks different now... older somehow.",
                        "The paint is peeling, revealing something underneath.",
                        "'Abandon Hope All Ye Who Enter Here' ...no, that can't be right."
                    ],
                    [
                        "The welcome sign now reads something else entirely.",
                        "'They're all watching... they know you're here...'",
                        "Your eyes must be playing tricks on you."
                    ]
                ];
                
                const level = Math.min(Math.floor((100 - game.sanity) / 35), 2);
                game.dialogue.start(responses[level]);
                if (level > 0) {
                    game.decreaseSanity(3 + level * 2);
                }
            }
        });

        // Lighthouse Key - hidden in town square
        this.interactables.push({
            x: 1180,
            y: 690,
            width: 15,
            height: 10,
            type: 'item',
            name: 'Lighthouse Key',
            collected: false,
            interact: function(game) {
                if (!this.collected) {
                    game.dialogue.start([
                        "A brass key lies partially buried near an old building.",
                        "It's tarnished with age, but still solid.",
                        "This must be the lighthouse key you need.",
                        "You feel a chill as you pick it up... as if something is watching."
                    ]);
                    game.addToInventory('Lighthouse Key');
                    this.collected = true;
                    game.decreaseSanity(5);
                } else {
                    game.dialogue.start(["The key is no longer here."]);
                }
            }
        });

        // Mysterious book in one of the buildings
        this.interactables.push({
            x: 860,
            y: 440,
            width: 30,
            height: 30,
            type: 'building_door',
            name: 'Old Bookshop',
            interact: (game) => {
                if (game.hasItem('Keeper\'s Journal')) {
                    game.dialogue.start([
                        "Inside the dusty bookshop, you find a tome that matches the journal.",
                        "'Maritime Legends of Pale Harbor' by E. Blackwood",
                        "'Chapter 7: The Lighthouse Keeper's Curse'",
                        "The pages describe strange lights and voices from the sea...",
                        "This explains what happened to the previous keeper."
                    ]);
                    game.addToInventory('Cursed Tome');
                    game.decreaseSanity(15);
                } else {
                    game.dialogue.start([
                        "The old bookshop is locked tight.",
                        "A sign reads: 'Key holders only'",
                        "You need to find something that proves your purpose here."
                    ]);
                }
            }
        });

        // Strange well in town square (positioned near but not overlapping statue)
        this.interactables.push({
            x: 1000, // Adjusted to be west of the repositioned statue
            y: 520,
            width: 40,
            height: 40,
            type: 'well',
            name: 'Ancient Well',
            interact: (game) => {
                if (game.hasItem('Old Lantern') && game.hasItem('Cursed Tome')) {
                    game.dialogue.start([
                        "You lower the lantern into the well by its chain.",
                        "The light reveals strange carvings on the walls below.",
                        "They match the symbols from the cursed tome...",
                        "A rope ladder descends into darkness.",
                        "You've found the entrance to the underground tunnels!"
                    ]);
                    game.addToInventory('Tunnel Access');
                    game.decreaseSanity(20);
                } else if (game.hasItem('Old Lantern')) {
                    game.dialogue.start([
                        "You peer into the well with your lantern.",
                        "There's something carved into the walls below...",
                        "But you can't make sense of the symbols.",
                        "You need more knowledge to understand this place."
                    ]);
                    game.decreaseSanity(8);
                } else {
                    game.dialogue.start([
                        "An ancient stone well sits in the town center.",
                        "It's too dark to see the bottom.",
                        "You need light to explore it properly."
                    ]);
                }
            }
        });

        // Sailboat interaction - adds story depth
        this.interactables.push({
            x: 320,
            y: 1000,
            width: 60,
            height: 40,
            type: 'sailboat',
            name: 'Abandoned Sailboat',
            searched: false,
            interact: function(game) {
                if (!this.searched) {
                    if (game.sanity < 70) {
                        game.dialogue.start([
                            "The sailboat rocks gently in the harbor.",
                            "Inside, you find a captain's log, water-damaged but readable:",
                            "'Day 12: The lighthouse hasn't lit for three nights...'",
                            "'Day 15: We can hear singing from the water. Not human singing.'",
                            "'Day 18: God help us. They're coming up from the deep.'"
                        ]);
                    } else {
                        game.dialogue.start([
                            "An old sailboat bobs in the harbor.",
                            "Inside, you find a ship's log with concerning entries:",
                            "'Lighthouse has been dark for days.'",
                            "'Strange sounds from the water at night.'",
                            "The entries abruptly stop two weeks ago."
                        ]);
                    }
                    game.addToInventory('Ship\'s Log');
                    this.searched = true;
                    game.decreaseSanity(10);
                } else {
                    game.dialogue.start([
                        "The sailboat creaks ominously in the wind.",
                        "You've already searched it thoroughly."
                    ]);
                }
            }
        });
    }
    
    addLighthouseInteriorObjects(game) {
        // Only add these once
        if (this.lighthouseInteriorAdded) return;
        this.lighthouseInteriorAdded = true;
        
        // Lighthouse stairs
        this.interactables.push({
            x: 545,
            y: 420,
            width: 20,
            height: 30,
            type: 'stairs',
            name: 'Spiral Staircase',
            interact: (game) => {
                if (game.hasItem('Cursed Tome')) {
                    game.dialogue.start([
                        "The wooden stairs creak ominously as you climb.",
                        "Each step echoes in the hollow tower.",
                        "You reach the lamp room at the top.",
                        "The massive lens sits dark and cold.",
                        "But now you understand what needs to be done..."
                    ]);
                    game.player.x = 550;
                    game.player.y = 370; // Move to top of lighthouse
                    game.decreaseSanity(5);
                } else {
                    game.dialogue.start([
                        "Ancient wooden stairs spiral upward.",
                        "But something feels wrong... dangerous.",
                        "You need to understand this place better before ascending.",
                        "Perhaps there's knowledge to be found elsewhere first."
                    ]);
                    game.decreaseSanity(3);
                }
            }
        });
        
        // Keeper's desk
        this.interactables.push({
            x: 520,
            y: 500,
            width: 25,
            height: 20,
            type: 'desk',
            name: 'Keeper\'s Desk',
            searched: false,
            interact: function(game) {
                if (!this.searched) {
                    game.dialogue.start([
                        "The lighthouse keeper's desk is covered in dust.",
                        "Among the papers, you find a final log entry:",
                        "'The voices from the sea grow stronger each night.'",
                        "'I can see shapes moving beneath the waves.'",
                        "'If anyone finds this, beware the calling of the deep ones.'"
                    ]);
                    game.addToInventory('Final Entry');
                    this.searched = true;
                    game.decreaseSanity(12);
                } else {
                    game.dialogue.start([
                        "The desk has been thoroughly searched.",
                        "Only dust and shadows remain."
                    ]);
                }
            }
        });
        
        // Lighthouse lens (at the top)
        this.interactables.push({
            x: 540,
            y: 350,
            width: 30,
            height: 30,
            type: 'lens',
            name: 'Lighthouse Lens',
            collected: false,
            interact: function(game) {
                const playerAtTop = (game.player.x > 520 && game.player.x < 580 && 
                                   game.player.y > 340 && game.player.y < 390);
                                   
                if (!playerAtTop) {
                    game.dialogue.start([
                        "You can see a large lens mechanism above.",
                        "You need to climb the stairs to reach it."
                    ]);
                    return;
                }
                
                if (!this.collected) {
                    if (game.hasItem('Final Entry') && game.hasItem('Cursed Tome')) {
                        game.dialogue.start([
                            "The lighthouse lens gleams with an otherworldly light.",
                            "As you touch it, visions flash before your eyes:",
                            "Ships lost at sea, creatures rising from the depths...",
                            "You understand now - this lens doesn't just guide ships,",
                            "It holds back something far more sinister.",
                            "You carefully remove the lens. The town's fate now rests with you."
                        ]);
                        game.addToInventory('Lighthouse Lens');
                        this.collected = true;
                        game.decreaseSanity(25);
                        
                        // But understanding the truth also brings some peace
                        setTimeout(() => {
                            game.increaseSanity(15);
                            game.dialogue.start([
                                "As the shock passes, you feel a strange sense of purpose.",
                                "Understanding the truth, however horrible, brings clarity.",
                                "You are no longer helpless against the unknown."
                            ]);
                        }, 2000);
                        // This could trigger the final sequence
                        if (game.triggerFinalSequence) {
                            game.triggerFinalSequence();
                        }
                    } else {
                        game.dialogue.start([
                            "The lighthouse lens pulses with strange energy.",
                            "But you don't understand its true purpose yet.",
                            "You need more knowledge before disturbing it."
                        ]);
                        game.decreaseSanity(8);
                    }
                } else {
                    game.dialogue.start([
                        "The lens housing sits empty now.",
                        "Whatever power it held, you now carry with you."
                    ]);
                }
            }
        });
        
        // Old bookshelf against the wall
        this.interactables.push({
            x: 515,
            y: 440,
            width: 15,
            height: 30,
            type: 'bookshelf',
            name: 'Keeper\'s Bookshelf',
            searched: false,
            interact: function(game) {
                if (!this.searched) {
                    game.dialogue.start([
                        "The bookshelf holds maritime charts and weather logs.",
                        "Most books are damaged by salt air and neglect.",
                        "You find a small notebook tucked between volumes:",
                        "'Navigation Notes - Beware the singing rocks near the harbor mouth.'",
                        "'The fog patterns have changed... something stirs below.'"
                    ]);
                    game.addToInventory('Navigation Notes');
                    this.searched = true;
                    game.decreaseSanity(5);
                } else {
                    game.dialogue.start([
                        "The remaining books are too damaged to read.",
                        "Salt and moisture have claimed most of the collection."
                    ]);
                }
            }
        });
        
        // Withered plant in the corner
        this.interactables.push({
            x: 580,
            y: 540,
            width: 12,
            height: 15,
            type: 'plant',
            name: 'Dying Plant',
            interact: (game) => {
                const responses = [
                    [
                        "A small potted plant sits in the corner.",
                        "Its leaves are brown and brittle from neglect.", 
                        "Even plants can't thrive in this cursed place."
                    ],
                    [
                        "The plant's leaves seem to move without any breeze.",
                        "Upon closer inspection, they appear to be... breathing?",
                        "You step back, disturbed by what you've seen."
                    ],
                    [
                        "The plant's branches now resemble twisted fingers.",
                        "Dark veins pulse through its withered leaves.",
                        "Nature itself recoils from the evil in this place."
                    ]
                ];
                
                const level = Math.min(Math.floor((100 - game.sanity) / 35), 2);
                game.dialogue.start(responses[level]);
                game.decreaseSanity(3 + level * 2);
            }
        });
        
        // Old cot/bed in the corner
        this.interactables.push({
            x: 565,
            y: 465,
            width: 25,
            height: 15,
            type: 'bed',
            name: 'Keeper\'s Cot',
            searched: false,
            interact: function(game) {
                if (!this.searched) {
                    game.dialogue.start([
                        "A simple cot where the lighthouse keeper once slept.",
                        "The blankets are musty and moth-eaten.",
                        "Under the pillow, you find a crumpled letter:",
                        "'My dearest Martha, the isolation grows harder each day...'",
                        "'The sounds from the water at night... they're not natural.'"
                    ]);
                    game.addToInventory('Personal Letter');
                    this.searched = true;
                    game.decreaseSanity(8);
                } else {
                    // Allow resting during daytime for sanity restoration
                    if (game.gameTime >= 6 && game.gameTime <= 18) {
                        game.dialogue.start([
                            "Despite the unpleasant surroundings, you rest briefly.",
                            "The daylight streaming through the windows is comforting.",
                            "You feel slightly more at ease."
                        ]);
                        game.increaseSanity(8);
                        // Skip some time
                        game.gameTime += 0.5; // 30 minutes
                    } else {
                        game.dialogue.start([
                            "The cot creaks ominously in the lighthouse wind.",
                            "You wouldn't want to sleep here at night.",
                            "The darkness holds too many unknowns."
                        ]);
                        game.decreaseSanity(2);
                    }
                }
            }
        });
        
        // Oil lamp on a small table
        this.interactables.push({
            x: 530,
            y: 470,
            width: 8,
            height: 12,
            type: 'lamp',
            name: 'Oil Lamp',
            interact: (game) => {
                if (game.hasItem('Old Lantern')) {
                    game.dialogue.start([
                        "An old oil lamp sits on a small wooden table.",
                        "You refill your lantern with oil from the lamp's reservoir.",
                        "The flame burns brighter now, pushing back the darkness."
                    ]);
                    game.increaseSanity(3);
                } else {
                    game.dialogue.start([
                        "An oil lamp with a cracked glass chimney.",
                        "There's still some oil in the base.",
                        "If only you had something to carry it in..."
                    ]);
                }
            }
        });
        
        // Weather instruments on the wall
        this.interactables.push({
            x: 505,
            y: 445,
            width: 8,
            height: 15,
            type: 'instruments',
            name: 'Weather Instruments',
            interact: (game) => {
                game.dialogue.start([
                    "A barometer and thermometer hang on the wall.",
                    "The barometer needle points to 'STORM' and won't budge.",
                    "The thermometer reads an impossible -20 degrees.",
                    "These instruments haven't worked properly in years..."
                ]);
                game.decreaseSanity(4);
            }
        });
        
        // Coat hook with keeper's jacket
        this.interactables.push({
            x: 580,
            y: 455,
            width: 8,
            height: 20,
            type: 'coat',
            name: 'Keeper\'s Coat',
            searched: false,
            interact: function(game) {
                if (!this.searched) {
                    game.dialogue.start([
                        "The lighthouse keeper's heavy wool coat hangs on a peg.",
                        "The fabric is stiff with salt and age.",
                        "In the pocket, you find a brass compass.",
                        "The needle spins wildly, unable to find magnetic north.",
                        "Something is interfering with natural forces here."
                    ]);
                    game.addToInventory('Broken Compass');
                    this.searched = true;
                    game.decreaseSanity(6);
                } else {
                    game.dialogue.start([
                        "The coat sways slightly in the lighthouse draft.",
                        "It still carries the scent of tobacco and fear."
                    ]);
                }
            }
        });
    }
    
    addLighthouseInteriorEntities() {
        // Don't remove interior entities anymore - the interactables should stay
        // Don't add visual entities - the interactables will handle rendering
        // This avoids duplicate rendering and confusion
    }
    
    removeLighthouseInteriorEntities() {
        // Remove all lighthouse interior interactables
        this.interactables = this.interactables.filter(interactable => {
            return !(interactable.type === 'stairs' || 
                    interactable.type === 'desk' || 
                    interactable.type === 'lens' ||
                    interactable.type === 'bookshelf' ||
                    interactable.type === 'plant' ||
                    interactable.type === 'bed' ||
                    interactable.type === 'lamp' ||
                    interactable.type === 'instruments' ||
                    interactable.type === 'coat');
        });
        
        // Reset the flag so interior objects can be added again when re-entering
        this.lighthouseInteriorAdded = false;
    }
    
    createWaterCollision() {
        const map = this.maps[this.currentMap];
        
        // Create collision for the entire water area (below y=780)
        // But carve out precise walkable areas for docks
        const waterY = 780;
        const dockArea = { x: 390, y: 780, width: 120, height: 200 }; // Main dock area
        
        // Left side of water (before dock)
        if (dockArea.x > 0) {
            this.collisionObjects.push({
                x: 0,
                y: waterY,
                width: dockArea.x,
                height: map.height - waterY,
                type: 'water'
            });
        }
        
        // Right side of water (after dock)
        if (dockArea.x + dockArea.width < map.width) {
            this.collisionObjects.push({
                x: dockArea.x + dockArea.width,
                y: waterY,
                width: map.width - (dockArea.x + dockArea.width),
                height: map.height - waterY,
                type: 'water'
            });
        }
        
        // Water below dock (if dock doesn't extend to bottom)
        if (dockArea.y + dockArea.height < map.height) {
            this.collisionObjects.push({
                x: dockArea.x,
                y: dockArea.y + dockArea.height,
                width: dockArea.width,
                height: map.height - (dockArea.y + dockArea.height),
                type: 'water'
            });
        }
        
        // Create collision strips on the sides of the dock to prevent walking around it
        const sideBuffer = 5; // Small buffer zone
        
        // Left side of dock
        this.collisionObjects.push({
            x: dockArea.x - sideBuffer,
            y: waterY,
            width: sideBuffer,
            height: dockArea.height,
            type: 'water'
        });
        
        // Right side of dock
        this.collisionObjects.push({
            x: dockArea.x + dockArea.width,
            y: waterY,
            width: sideBuffer,
            height: dockArea.height,
            type: 'water'
        });
    }
    
    createAtmosphericElements() {
        // Fog particles
        for (let i = 0; i < 50; i++) {
            this.entities.push({
                type: 'fog',
                x: (i * 73.7) % 2048, // Deterministic positioning
                y: (i * 127.3) % 1536,
                size: 20 + (Math.sin(i * 0.7) + 1) * 20, // 20-60 range
                opacity: 0.1 + (Math.sin(i * 1.3) + 1) * 0.1, // 0.1-0.3 range
                driftX: (Math.sin(i * 2.1) - 0.5) * 10,
                driftY: (Math.cos(i * 1.7) - 0.5) * 5,
                render: (ctx) => {
                    ctx.save();
                    ctx.globalAlpha = this.opacity;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                },
                update: (deltaTime) => {
                    this.x += this.driftX * deltaTime;
                    this.y += this.driftY * deltaTime;
                    
                    // Wrap around
                    if (this.x < -50) this.x = 2098;
                    if (this.x > 2098) this.x = -50;
                    if (this.y < -50) this.y = 1586;
                    if (this.y > 1586) this.y = -50;
                }
            });
        }
        
        // Seagulls (distant)
        for (let i = 0; i < 8; i++) {
            this.entities.push({
                type: 'seagull',
                x: (i * 256) % 2048, // Deterministic positioning
                y: 100 + (Math.sin(i * 1.5) + 1) * 100, // 100-300 range
                speed: 30 + (Math.cos(i * 0.8) + 1) * 10, // 30-50 range
                direction: (i / 8) * Math.PI * 2, // Evenly distributed directions
                size: 3 + (Math.sin(i * 1.1) + 1) * 1, // 3-5 range
                directionTimer: 0,
                render: (ctx) => {
                    ctx.fillStyle = '#ffffff';
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.direction);
                    ctx.fillRect(-this.size, -1, this.size * 2, 2);
                    ctx.fillRect(-1, -this.size/2, 2, this.size);
                    ctx.restore();
                },
                update: (deltaTime) => {
                    this.x += Math.cos(this.direction) * this.speed * deltaTime;
                    this.y += Math.sin(this.direction) * this.speed * deltaTime;
                    
                    // Change direction occasionally using deterministic timing
                    this.directionTimer += deltaTime;
                    if (this.directionTimer > 2 + Math.sin(this.x * 0.01) * 2) {
                        this.direction += (Math.sin(this.x * 0.1 + this.y * 0.1) - 0.5) * 0.5;
                        this.directionTimer = 0;
                    }
                    
                    // Wrap around
                    if (this.x < -50) this.x = 2098;
                    if (this.x > 2098) this.x = -50;
                    if (this.y < 50) this.y = 350;
                    if (this.y > 350) this.y = 50;
                }
            });
        }
    }
    
    update(deltaTime) {
        try {
            // Update all entities with safety checks
            this.entities.forEach(entity => {
                if (entity.update) {
                    entity.update(deltaTime);
                }
            });
            
            // Clean up entities marked for removal, but protect static world objects
            this.entities = this.entities.filter(entity => {
                // Never remove static world objects (buildings, lighthouse, dock, etc.)
                const isStaticWorldObject = entity.isStaticWorldObject === true || 
                                          entity.type === 'lighthouse' || 
                                          entity.type === 'building' || 
                                          entity.type === 'dock' || 
                                          entity.type === 'tree' || 
                                          entity.type === 'rock' || 
                                          entity.type === 'sign' || 
                                          entity.type === 'sailboat' || 
                                          entity.type === 'lamppost';
                
                if (isStaticWorldObject) {
                    return true; // Always keep static objects
                }
                
                // Remove entities marked for removal
                return !entity.shouldRemove;
            });
            
            // Limit only dynamic entity count to prevent performance issues
            const dynamicEntities = this.entities.filter(entity => 
                entity.type === 'shadow_figure' || 
                entity.type === 'fog' || 
                entity.type === 'seagull'
            );
            
            if (dynamicEntities.length > 60) {
                // Remove excess dynamic entities, keeping the most recent ones
                const excessCount = dynamicEntities.length - 60;
                const oldestDynamicEntities = dynamicEntities.slice(0, excessCount);
                
                // Mark oldest dynamic entities for removal
                oldestDynamicEntities.forEach(entity => {
                    const index = this.entities.indexOf(entity);
                    if (index > -1) {
                        this.entities.splice(index, 1);
                    }
                });
            }
            
            // Environmental effects based on sanity
            if (this.game.sanity < 50) {
                this.addHallucinationEntities(deltaTime);
            }
        } catch (error) {
            console.error('Error in World.update:', error);
            // Only reset dynamic entities if there's a critical error, never static ones
            this.entities = this.entities.filter(entity => {
                const isStaticWorldObject = entity.isStaticWorldObject === true || 
                                          entity.type === 'lighthouse' || 
                                          entity.type === 'building' || 
                                          entity.type === 'dock' || 
                                          entity.type === 'tree' || 
                                          entity.type === 'rock' || 
                                          entity.type === 'sign' || 
                                          entity.type === 'sailboat' || 
                                          entity.type === 'lamppost';
                return isStaticWorldObject;
            });
        }
    }
    
    addHallucinationEntities(deltaTime) {
        // Limit the number of shadow figures to prevent performance issues
        const existingShadowFigures = this.entities.filter(entity => entity.type === 'shadow_figure').length;
        if (existingShadowFigures >= 3) return; // Max 3 shadow figures at once
        
        // Occasionally add shadow figures at low sanity using deterministic timing
        const time = this.game.time;
        const sanityFactor = (1 - this.game.sanity / 100);
        const spawnChance = Math.sin(time * 0.3) * sanityFactor;
        
        // Reduce spawn frequency and add cooldown
        if (!this.lastShadowSpawn) this.lastShadowSpawn = 0;
        const timeSinceLastSpawn = time - this.lastShadowSpawn;
        
        if (spawnChance > 0.8 && timeSinceLastSpawn > 3) { // Spawn less frequently and with cooldown
            const player = this.game.player;
            const angleIndex = Math.floor(time * 0.5) % 8; // Deterministic angle selection
            const angle = (angleIndex / 8) * Math.PI * 2;
            const distanceVariation = Math.sin(time * 0.7) * 100;
            const distance = 200 + distanceVariation + 100;
            
            const shadowFigure = {
                type: 'shadow_figure',
                x: player.x + Math.cos(angle) * distance,
                y: player.y + Math.sin(angle) * distance,
                opacity: 0.3 + (Math.sin(time * 1.2) + 1) * 0.2, // 0.3-0.7 range
                lifetime: 2 + (Math.cos(time * 0.8) + 1) * 1.5, // 2-5 second range
                render: function(ctx) {
                    ctx.save();
                    ctx.globalAlpha = this.opacity;
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(this.x - 10, this.y - 20, 20, 40);
                    ctx.restore();
                },
                update: function(deltaTime) {
                    this.lifetime -= deltaTime;
                    this.opacity -= deltaTime * 0.2;
                    
                    if (this.lifetime <= 0 || this.opacity <= 0) {
                        // Mark for removal instead of trying to remove immediately
                        this.shouldRemove = true;
                    }
                }
            };
            
            this.entities.push(shadowFigure);
            this.lastShadowSpawn = time;
        }
        
        // Clean up entities marked for removal
        this.entities = this.entities.filter(entity => !entity.shouldRemove);
    }
    
    render(ctx) {
        try {
            const map = this.maps[this.currentMap];
            
            if (this.playerInsideLighthouse) {
                // Interior rendering - darker, more confined
                this.renderLighthouseInterior(ctx, map);
            } else {
                // Exterior rendering - normal world
                this.renderExterior(ctx, map);
            }
            
            // Render area indicators (debug - can be removed)
            if (false) { // Set to true for debugging
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.lineWidth = 2;
                map.areas.forEach(area => {
                    ctx.strokeRect(area.x, area.y, area.width, area.height);
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    ctx.font = '16px Courier New';
                    ctx.fillText(area.name, area.x + 10, area.y + 20);
                });
            }
        } catch (error) {
            console.error('Error in World.render():', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    renderExterior(ctx, map) {
        // Enhanced background with ground texture
        this.renderGround(ctx, map);
        
        // Render water/harbor area with improved texture
        this.renderWater(ctx, map);
        
        // Render entities (sorted by Y position for depth)
        const sortedEntities = [...this.entities].sort((a, b) => (a.y || 0) - (b.y || 0));
        
        sortedEntities.forEach(entity => {
            // Don't render lighthouse interior entities when outside
            if (!entity.isLighthouseInterior && entity.render) {
                entity.render(ctx);
            }
        });
        
        // Render interactables
        this.renderInteractables(ctx);
    }
    
    renderLighthouseInterior(ctx, map) {
        // Dark interior background
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(0, 0, map.width, map.height);
        
        // Add a subtle warm light area around the player
        const lightRadius = 150;
        const gradient = ctx.createRadialGradient(
            this.game.player.x, this.game.player.y, 0,
            this.game.player.x, this.game.player.y, lightRadius
        );
        gradient.addColorStop(0, 'rgba(40, 30, 20, 0.3)');
        gradient.addColorStop(0.7, 'rgba(20, 15, 10, 0.6)');
        gradient.addColorStop(1, 'rgba(10, 8, 5, 0.9)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, map.width, map.height);
        ctx.restore();
        
        // Render only lighthouse interior entities
        const sortedEntities = [...this.entities].sort((a, b) => (a.y || 0) - (b.y || 0));
        
        sortedEntities.forEach(entity => {
            // Only render lighthouse interior entities and the lighthouse structure itself
            if ((entity.isLighthouseInterior || entity.type === 'lighthouse') && entity.render) {
                entity.render(ctx);
            }
        });
        
        // Render interactables (interior ones will be visible)
        this.renderInteractables(ctx);
        
        // Add atmospheric interior effects
        this.renderInteriorAtmosphere(ctx);
    }
    
    renderInteriorAtmosphere(ctx) {
        // Add some dust motes or floating particles
        const time = this.game.time;
        
        for (let i = 0; i < 10; i++) {
            const x = 480 + (i * 17) % 120; // Constrain to lighthouse interior area
            const y = 350 + (i * 23) % 200;
            const driftX = Math.sin(time * 0.5 + i * 0.7) * 2;
            const driftY = Math.cos(time * 0.3 + i * 0.9) * 1;
            
            ctx.save();
            ctx.globalAlpha = 0.1 + Math.sin(time + i) * 0.05;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + driftX, y + driftY, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    renderGround(ctx, map) {
        try {
            // Base ground color
            ctx.fillStyle = '#2a3a2a';
            ctx.fillRect(0, 0, map.width, 800);
            
            // Add ground texture with grass patches and dirt
            this.renderGroundTexture(ctx, map);
            
            // Add cobblestone paths
            this.renderPaths(ctx);
        } catch (error) {
            console.error('Error in renderGround:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    renderGroundTexture(ctx, map) {
        // Temporarily disabled - this method has nested loops that might be causing issues
        return;
        
        // Grass texture
        ctx.save();
        for (let x = 0; x < map.width; x += 8) {
            for (let y = 0; y < 800; y += 8) {
                const grassVariation = Math.sin(x * 0.1) * Math.cos(y * 0.1);
                const brightness = 0.3 + grassVariation * 0.1;
                ctx.fillStyle = `rgb(${Math.floor(42 * brightness)}, ${Math.floor(58 * (brightness + 0.2))}, ${Math.floor(42 * brightness)})`;
                
                // Random grass patches
                if (Math.sin(x * 0.05 + y * 0.03) > 0.3) {
                    ctx.fillRect(x, y, 4, 4);
                }
                
                // Dirt patches
                if (Math.sin(x * 0.07 + y * 0.05) < -0.5) {
                    ctx.fillStyle = `rgb(${Math.floor(58 * brightness)}, ${Math.floor(48 * brightness)}, ${Math.floor(32 * brightness)})`;
                    ctx.fillRect(x, y, 3, 3);
                }
            }
        }
        ctx.restore();
    }
    
    renderPaths(ctx) {
        // Main path from dock to lighthouse
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(400, 880);
        ctx.lineTo(550, 650);
        ctx.stroke();
        
        // Connecting path from lighthouse to town square entrance
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 35;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(550, 650);
        ctx.lineTo(750, 580);
        ctx.lineTo(870, 550); // Align with new building layout
        ctx.stroke();
        
        // Town square main street (horizontal) - centered on statue, extended to reach all buildings
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 35;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(870, 550);
        ctx.lineTo(1400, 550); // Extended to reach far-right buildings
        ctx.stroke();
        
        // Vertical streets - aligned with building rows
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        
        // West vertical street
        ctx.beginPath();
        ctx.moveTo(950, 440);
        ctx.lineTo(950, 660);
        ctx.stroke();
        
        // Center vertical street (through statue area)
        ctx.beginPath();
        ctx.moveTo(1070, 440);
        ctx.lineTo(1070, 660);
        ctx.stroke();
        
        // East vertical street
        ctx.beginPath();
        ctx.moveTo(1200, 440);
        ctx.lineTo(1200, 660);
        ctx.stroke();
        
        // Far-east vertical street to reach the rightmost buildings
        ctx.beginPath();
        ctx.moveTo(1320, 440);
        ctx.lineTo(1320, 660);
        ctx.stroke();
        
        // Cobblestone texture on main path (dock to lighthouse)
        ctx.save();
        for (let i = 0; i < 25; i++) {
            const t = i / 24;
            // Use deterministic positioning based on index
            const offsetX = Math.sin(i * 2.3) * 15;
            const offsetY = Math.cos(i * 1.7) * 15;
            const x = 400 + (150 * t) + offsetX;
            const y = 880 - (230 * t) + offsetY;
            
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            const radius = 3 + Math.sin(i * 0.8) * 1.5;
            ctx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#777777';
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Cobblestone texture on connecting path (lighthouse to town)
        // This path has two segments that need proper alignment
        for (let i = 0; i < 30; i++) { // Increased density for better coverage
            const t = i / 29;
            let x, y;
            
            if (t < 0.6) {
                // First segment: lighthouse (550, 650) to bend point (750, 580)
                const segmentT = t / 0.6; // Normalize to 0-1 for this segment
                const startX = 550, startY = 650;
                const endX = 750, endY = 580;
                
                // Linear interpolation along the actual path
                x = startX + (endX - startX) * segmentT;
                y = startY + (endY - startY) * segmentT;
                
                // Add perpendicular scatter to the path direction
                const pathAngle = Math.atan2(endY - startY, endX - startX);
                const perpAngle = pathAngle + Math.PI / 2;
                const scatter = Math.sin(i * 2.1) * 15; // Scatter amount
                x += Math.cos(perpAngle) * scatter;
                y += Math.sin(perpAngle) * scatter;
            } else {
                // Second segment: bend point (750, 580) to town entrance (900, 580)
                const segmentT = (t - 0.6) / 0.4; // Normalize to 0-1 for this segment
                const startX = 750, startY = 580;
                const endX = 900, endY = 580;
                
                // Linear interpolation along the horizontal path
                x = startX + (endX - startX) * segmentT;
                y = startY + (endY - startY) * segmentT; // This will be 0 since it's horizontal
                
                // Add perpendicular scatter (vertical for horizontal path)
                const scatter = Math.cos(i * 1.6) * 12;
                y += scatter;
            }
            
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            const radius = 2.5 + Math.sin(i * 0.9) * 1;
            ctx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#777777';
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Cobblestone texture on town square paths
        // Horizontal main street - extended to cover the full path
        for (let i = 0; i < 45; i++) { // Increased from 30 to 45 to cover extended street
            const x = 800 + (i * 13.3) + Math.sin(i * 1.8) * 10;
            const y = 580 + Math.cos(i * 2.2) * 8;
            
            ctx.fillStyle = '#666666';
            ctx.beginPath();
            const radius = 2 + Math.sin(i * 0.7) * 1;
            ctx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#777777';
            ctx.beginPath();
            ctx.arc(x - 0.5, y - 0.5, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Vertical streets - expanded to include all four streets
        for (let street = 0; street < 4; street++) {
            const streetPositions = [950, 1070, 1200, 1320]; // All four vertical streets
            const baseX = streetPositions[street];
            for (let i = 0; i < 15; i++) {
                const x = baseX + Math.sin(i * 1.5 + street * 2) * 8;
                const y = 520 + (i * 8) + Math.cos(i * 1.3 + street * 1.5) * 6;
                
                ctx.fillStyle = '#666666';
                ctx.beginPath();
                const radius = 2 + Math.sin(i * 0.6 + street) * 0.8;
                ctx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    renderWater(ctx, map) {
        // Base water color with depth variation
        const gradient = ctx.createLinearGradient(0, 800, 0, map.height);
        gradient.addColorStop(0, '#0a1a2a');
        gradient.addColorStop(0.3, '#051520');
        gradient.addColorStop(1, '#020a12');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 800, map.width, map.height - 800);
        
        // Water animation and texture
        const time = this.game.time;
        const sanity = this.game.sanity;
        const sanityFactor = (100 - sanity) / 100; // 0 to 1, higher = more disturbed
        
        // Sanity-based wave intensity
        const baseWaveIntensity = 1;
        const sanityWaveIntensity = baseWaveIntensity + sanityFactor * 2;
        
        ctx.save();
        
        // Extended water texture layers throughout the entire water area
        this.renderWaterTextureLayers(ctx, map, time, sanityWaveIntensity);
        
        // Shoreline waves and foam (at the water edge)
        this.renderShoreline(ctx, map, time, sanityWaveIntensity);
        
        // Surface disturbance effects based on sanity
        this.renderSanityBasedWaterEffects(ctx, map, time, sanityFactor);
        
        // Mysterious dark patches (moves slowly, appears and disappears)
        this.renderWaterDarkPatches(ctx, map, time, sanityFactor);
        
        // Eerie water reflections
        this.renderWaterReflections(ctx, map, time, sanityFactor);
        
        // Occasional ripples from unseen creatures
        this.renderCreatureRipples(ctx, map, time, sanityFactor);
        
        ctx.restore();
    }
    
    renderWaterTextureLayers(ctx, map, time, waveIntensity) {
        const waterStartY = 800;
        const waterHeight = map.height - waterStartY;
        const sanity = this.game.sanity;
        const sanityFactor = (100 - sanity) / 100;
        
        // Make water more varied and less uniform
        // Deep water currents (slow, large waves) - with random variation
        for (let y = waterStartY; y < map.height; y += 30 + Math.sin(y * 0.01) * 15) {
            for (let x = 0; x < map.width; x += 25 + Math.cos(x * 0.008) * 12) {
                const deepWave = Math.sin((x * 0.005) + (y * 0.003) + (time * 0.8)) * 8 * waveIntensity;
                const deepWave2 = Math.cos((x * 0.007) + (y * 0.004) + (time * 0.6)) * 6 * waveIntensity;
                const randomOffset = Math.sin(x * 0.02 + y * 0.015) * 4;
                
                // Vary intensity based on depth and add randomness
                const depthFactor = (y - waterStartY) / waterHeight;
                const randomIntensity = 0.8 + Math.sin(x * 0.03 + y * 0.025) * 0.4;
                const intensity = (0.3 + depthFactor * 0.4) * randomIntensity;
                
                // Random size variation
                const waveSize = 12 + Math.sin(x * 0.01 + y * 0.008) * 6;
                const waveSize2 = 8 + Math.cos(x * 0.015 + y * 0.012) * 4;
                
                ctx.save();
                ctx.globalAlpha = intensity;
                ctx.fillStyle = '#0f1f2f';
                ctx.fillRect(x + deepWave + randomOffset, y, waveSize, waveSize2);
                ctx.fillStyle = '#1a2a3a';
                ctx.fillRect(x + 8 + deepWave2 - randomOffset, y + 3, waveSize2, waveSize2 - 2);
                ctx.restore();
            }
        }
        
        // Medium water texture with irregular patterns
        for (let y = waterStartY; y < map.height; y += 20 + Math.sin(y * 0.015) * 8) {
            for (let x = 0; x < map.width; x += 20 + Math.cos(x * 0.012) * 10) {
                const mediumWave = Math.sin((x * 0.01) + (y * 0.008) + (time * 2)) * 4 * waveIntensity;
                const mediumWave2 = Math.cos((x * 0.015) + (y * 0.01) + (time * 1.5)) * 3 * waveIntensity;
                const turbulence = Math.sin(x * 0.05 + y * 0.04 + time * 3) * 2;
                
                const depthFactor = (y - waterStartY) / waterHeight;
                const randomIntensity = 0.7 + Math.sin(x * 0.025 + y * 0.02) * 0.5;
                const intensity = (0.4 + depthFactor * 0.3) * randomIntensity;
                
                // Add sanity-based chaos to medium waves
                const sanityTurbulence = sanityFactor * Math.sin(x * 0.08 + y * 0.06 + time * 4) * 3;
                
                const waveSize = 8 + Math.sin(x * 0.02 + y * 0.018) * 4;
                
                ctx.save();
                ctx.globalAlpha = intensity;
                ctx.fillStyle = sanityFactor > 0.5 ? '#2a3a4a' : '#1a2a3a';
                ctx.fillRect(x + mediumWave + turbulence + sanityTurbulence, y, waveSize, 6);
                ctx.fillStyle = sanityFactor > 0.5 ? '#3a4a5a' : '#2a3a4a';
                ctx.fillRect(x + 6 + mediumWave2 - turbulence, y + 2, waveSize - 2, 4);
                ctx.restore();
            }
        }
        
        // Surface detail texture with high variation and sanity effects
        for (let y = waterStartY; y < map.height; y += 10 + Math.sin(y * 0.02) * 5) {
            for (let x = 0; x < map.width; x += 12 + Math.cos(x * 0.018) * 6) {
                const surfaceWave = Math.sin((x * 0.02) + (y * 0.015) + (time * 3)) * 2 * waveIntensity;
                const surfaceWave2 = Math.cos((x * 0.025) + (y * 0.02) + (time * 2.5)) * 1.5 * waveIntensity;
                const microTurbulence = Math.sin(x * 0.1 + y * 0.08 + time * 5) * 1;
                
                // Strong sanity-based effects on surface waves
                const sanityEffect = sanityFactor * Math.sin(x * 0.1 + y * 0.12 + time * 6) * 4;
                const sanityIntensity = 1 + sanityFactor * 2;
                
                const depthFactor = (y - waterStartY) / waterHeight;
                const randomIntensity = 0.6 + Math.sin(x * 0.04 + y * 0.035) * 0.6;
                const intensity = (0.5 + depthFactor * 0.2) * randomIntensity * sanityIntensity;
                
                const waveSize = 3 + Math.sin(x * 0.03 + y * 0.025) * 2 + sanityFactor * 2;
                
                ctx.save();
                ctx.globalAlpha = Math.min(intensity * 0.6, 0.9);
                
                // Color varies with sanity and position
                if (sanityFactor > 0.6) {
                    ctx.fillStyle = '#4a5a6a'; // Rougher, more violent water
                } else if (sanityFactor > 0.3) {
                    ctx.fillStyle = '#3a4a5a'; // Slightly disturbed
                } else {
                    ctx.fillStyle = '#2a3a4a'; // Normal
                }
                
                ctx.fillRect(x + surfaceWave + microTurbulence + sanityEffect, y, Math.abs(waveSize), Math.abs(waveSize - 1));
                
                // Enhanced foam highlights with sanity effects
                const foamThreshold = 1.5 - sanityFactor * 0.8; // Lower threshold at low sanity
                if (Math.abs(surfaceWave + sanityEffect) > foamThreshold) {
                    const foamIntensity = 0.3 + sanityFactor * 0.4;
                    ctx.fillStyle = `rgba(200, 220, 240, ${foamIntensity})`;
                    ctx.fillRect(x + surfaceWave + sanityEffect, y, Math.abs(waveSize - 1), 2);
                }
                
                if (Math.abs(surfaceWave2 + microTurbulence) > 1) {
                    const foamIntensity = 0.2 + sanityFactor * 0.3;
                    ctx.fillStyle = `rgba(180, 200, 220, ${foamIntensity})`;
                    ctx.fillRect(x + 3 + surfaceWave2 + microTurbulence, y + 1, 2, 2);
                }
                ctx.restore();
            }
        }
        
        // Add chaotic patches for very low sanity
        if (sanityFactor > 0.4) {
            for (let i = 0; i < Math.floor(sanityFactor * 15); i++) {
                const patchX = (i * 123 + Math.sin(time * 1.2 + i) * 80) % map.width;
                const patchY = waterStartY + 50 + (i * 67) % (waterHeight - 100);
                const chaoticWave = Math.sin(time * 4 + i * 2) * 8 * sanityFactor;
                const patchSize = 15 + sanityFactor * 10;
                
                ctx.save();
                ctx.globalAlpha = sanityFactor * 0.6;
                ctx.fillStyle = '#5a6a7a'; // Very rough water
                ctx.fillRect(patchX + chaoticWave, patchY, patchSize, patchSize * 0.6);
                
                // White foam for chaotic patches
                if (sanityFactor > 0.7) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(patchX + chaoticWave + 2, patchY + 2, patchSize - 4, 3);
                }
                ctx.restore();
            }
        }
    }
    
    renderShoreline(ctx, map, time, waveIntensity) {
        const waterStartY = 800;
        const shorelineDepth = 25; // How far into the water the shoreline effects extend
        
        // Create choppy shoreline waves
        ctx.save();
        
        // Primary shoreline waves (larger, more prominent)
        for (let x = 0; x < map.width; x += 12) {
            const waveHeight = Math.sin((x * 0.02) + (time * 2.5)) * 6 * waveIntensity;
            const waveHeight2 = Math.cos((x * 0.025) + (time * 3)) * 4 * waveIntensity;
            const combinedWave = waveHeight + waveHeight2;
            
            // Shoreline water (darker blue-green)
            ctx.fillStyle = '#1a3a4a';
            ctx.fillRect(x, waterStartY + combinedWave, 8, 12 + Math.abs(combinedWave));
            
            // Foam and whitecaps
            if (Math.abs(combinedWave) > 4) {
                ctx.fillStyle = 'rgba(220, 240, 255, 0.6)';
                ctx.fillRect(x, waterStartY + combinedWave, 6, 3);
                ctx.fillStyle = 'rgba(200, 220, 240, 0.4)';
                ctx.fillRect(x + 1, waterStartY + combinedWave + 1, 4, 2);
            }
        }
        
        // Secondary shoreline texture (finer details)
        for (let x = 0; x < map.width; x += 8) {
            const smallWave1 = Math.sin((x * 0.03) + (time * 4)) * 3 * waveIntensity;
            const smallWave2 = Math.cos((x * 0.035) + (time * 3.5)) * 2 * waveIntensity;
            const microWave = smallWave1 + smallWave2;
            
            // Fine water texture at shore edge
            ctx.fillStyle = '#2a4a5a';
            ctx.fillRect(x, waterStartY + microWave, 4, 8 + Math.abs(microWave) * 0.5);
            
            // Micro foam
            if (Math.abs(microWave) > 2) {
                ctx.fillStyle = 'rgba(180, 200, 220, 0.5)';
                ctx.fillRect(x, waterStartY + microWave, 3, 2);
            }
        }
        
        // Beach foam line (wet sand effect)
        for (let x = 0; x < map.width; x += 15) {
            const foamLine = Math.sin((x * 0.015) + (time * 1.8)) * 3;
            const foamIntensity = (Math.sin((x * 0.01) + (time * 2.2)) + 1) * 0.3;
            
            if (foamIntensity > 0.2) {
                // Wet sand/shore foam
                ctx.fillStyle = `rgba(160, 180, 200, ${foamIntensity})`;
                ctx.fillRect(x, waterStartY - 8 + foamLine, 10, 4);
                
                // Retreating water on shore
                ctx.fillStyle = `rgba(30, 50, 70, ${foamIntensity * 0.7})`;
                ctx.fillRect(x + 2, waterStartY - 6 + foamLine, 6, 2);
            }
        }
        
        // Irregular shoreline edge (not a straight line)
        ctx.fillStyle = '#0a2a3a';
        for (let x = 0; x < map.width; x += 6) {
            const edgeVariation1 = Math.sin((x * 0.018) + (time * 2.8)) * 4;
            const edgeVariation2 = Math.cos((x * 0.022) + (time * 2.3)) * 3;
            const shoreEdge = edgeVariation1 + edgeVariation2;
            
            // Create irregular water edge
            ctx.fillRect(x, waterStartY + shoreEdge, 4, 6 - shoreEdge * 0.3);
        }
        
        // Occasional larger waves crashing
        const crashWavePhase = Math.sin(time * 0.8);
        if (crashWavePhase > 0.7) {
            for (let i = 0; i < 3; i++) {
                const crashX = (i * 400 + Math.sin(time * 0.5 + i) * 100) % map.width;
                const crashIntensity = (crashWavePhase - 0.7) * 3.33; // 0 to 1
                
                // Large crash wave
                ctx.fillStyle = `rgba(60, 80, 100, ${crashIntensity * 0.8})`;
                const crashHeight = crashIntensity * 15;
                ctx.fillRect(crashX - 20, waterStartY - crashHeight, 40, crashHeight + 8);
                
                // Crash foam
                ctx.fillStyle = `rgba(255, 255, 255, ${crashIntensity * 0.9})`;
                ctx.fillRect(crashX - 25, waterStartY - crashHeight, 50, 6);
                
                // Spray effect
                for (let spray = 0; spray < 8; spray++) {
                    const sprayX = crashX - 30 + spray * 8;
                    const sprayY = waterStartY - crashHeight - (Math.sin(spray * 1.3 + time * 2) + 1) * 5;
                    const spraySize = 1 + Math.cos(spray * 0.8 + time * 1.5) * 0.5;
                    ctx.fillStyle = `rgba(200, 220, 240, ${crashIntensity * 0.6})`;
                    ctx.fillRect(sprayX, sprayY, Math.abs(spraySize), Math.abs(spraySize) + 1);
                }
            }
        }
        
        ctx.restore();
    }
    
    renderSanityBasedWaterEffects(ctx, map, time, sanityFactor) {
        if (sanityFactor < 0.1) return; // No effects at very high sanity
        
        const waterStartY = 800;
        
        // Rough, chaotic water patterns when sanity is low - much more prominent
        const roughnessIntensity = sanityFactor * 20; // Increased intensity
        
        // Violent surface disturbances with better visibility
        for (let y = waterStartY; y < map.height; y += 15 - sanityFactor * 5) { // Denser at low sanity
            for (let x = 0; x < map.width; x += 15 - sanityFactor * 5) {
                const chaoticWave = Math.sin((x * 0.03) + (y * 0.025) + (time * 5)) * roughnessIntensity;
                const chaoticWave2 = Math.cos((x * 0.035) + (y * 0.03) + (time * 4.5)) * roughnessIntensity;
                const verticalChaos = Math.sin((x * 0.04) + (time * 6)) * roughnessIntensity * 0.8;
                
                // Lower threshold for chaos activation
                if (Math.abs(chaoticWave) > 5 || Math.abs(chaoticWave2) > 5 || sanityFactor > 0.4) {
                    ctx.save();
                    ctx.globalAlpha = sanityFactor * 0.7; // More visible
                    
                    // More dramatic color changes
                    if (sanityFactor > 0.7) {
                        ctx.fillStyle = '#5a6a7a'; // Very violent, light water
                    } else if (sanityFactor > 0.4) {
                        ctx.fillStyle = '#4a5a6a'; // Moderately rough
                    } else {
                        ctx.fillStyle = '#3a4a5a'; // Slightly disturbed
                    }
                    
                    const waveSize = 8 + sanityFactor * 6;
                    ctx.fillRect(x + chaoticWave, y + chaoticWave2 + verticalChaos, waveSize, waveSize);
                    
                    // Enhanced white foam for rough water
                    if (sanityFactor > 0.3) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${sanityFactor * 0.6})`;
                        ctx.fillRect(x + chaoticWave + 2, y + chaoticWave2 + verticalChaos + 2, waveSize - 4, 3);
                    }
                    
                    // Add spray effects for very rough water
                    if (sanityFactor > 0.6 && Math.abs(chaoticWave + chaoticWave2) > 10) {
                        for (let spray = 0; spray < 3; spray++) {
                            const sprayX = x + chaoticWave + spray * 3;
                            const sprayY = y + chaoticWave2 + verticalChaos - (spray + 1) * 2;
                            ctx.fillStyle = `rgba(240, 255, 255, ${sanityFactor * 0.4})`;
                            ctx.fillRect(sprayX, sprayY, 2, 2);
                        }
                    }
                    
                    ctx.restore();
                }
            }
        }
        
        // Add whirlpool-like disturbances at very low sanity
        if (sanityFactor > 0.5) {
            const whirlpoolCount = Math.floor(sanityFactor * 4);
            for (let w = 0; w < whirlpoolCount; w++) {
                const centerX = (w * 400 + Math.sin(time * 0.7 + w) * 100) % map.width;
                const centerY = waterStartY + 100 + (w * 200) % (map.height - waterStartY - 200);
                const whirlStrength = sanityFactor * Math.sin(time * 2 + w) * 15;
                
                for (let radius = 10; radius < 60; radius += 15) {
                    const angleOffset = (time * 3 + w * 2) % (Math.PI * 2);
                    for (let angle = 0; angle < Math.PI * 2; angle += 0.8) {
                        const x = centerX + Math.cos(angle + angleOffset) * radius;
                        const y = centerY + Math.sin(angle + angleOffset) * radius;
                        const waveHeight = Math.sin(angle * 3 + time * 4) * whirlStrength;
                        
                        ctx.save();
                        ctx.globalAlpha = sanityFactor * 0.5 * (1 - radius / 60);
                        ctx.fillStyle = '#6a7a8a';
                        ctx.fillRect(x, y + waveHeight, 4, 6);
                        
                        // Foam around whirlpool
                        if (radius < 30) {
                            ctx.fillStyle = `rgba(255, 255, 255, ${sanityFactor * 0.4})`;
                            ctx.fillRect(x + 1, y + waveHeight, 2, 2);
                        }
                        ctx.restore();
                    }
                }
            }
        }
        
        // Sanity-based color distortion in water - more prominent
        if (sanityFactor > 0.3) {
            ctx.save();
            ctx.globalAlpha = (sanityFactor - 0.3) * 0.5; // More visible
            
            // Add more dramatic color distortions
            const distortionColor = sanityFactor > 0.8 ? '#4a1a1a' : 
                                  sanityFactor > 0.6 ? '#3a2a1a' : '#2a2a3a';
            
            for (let i = 0; i < 8; i++) { // More distortion patches
                const x = (i * 150 + Math.sin(time * 0.8 + i) * 80) % map.width;
                const y = waterStartY + 80 + Math.cos(time * 0.6 + i * 2) * 60;
                const pulseSize = 40 + Math.sin(time * 1.5 + i) * 25 + sanityFactor * 30;
                
                ctx.fillStyle = distortionColor;
                ctx.beginPath();
                ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Add disturbing ripple effects
                if (sanityFactor > 0.6) {
                    ctx.strokeStyle = distortionColor;
                    ctx.lineWidth = 2;
                    for (let ring = 1; ring <= 3; ring++) {
                        ctx.beginPath();
                        ctx.arc(x, y, pulseSize + ring * 15, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            
            ctx.restore();
        }
    }
    
    renderWaterDarkPatches(ctx, map, time, sanityFactor) {
        // More and darker patches at low sanity
        const patchCount = Math.floor(8 + sanityFactor * 4);
        
        for (let i = 0; i < patchCount; i++) {
            const x = (i * 180 + Math.sin(time * 0.3 + i) * 60) % map.width;
            const y = 850 + Math.cos(time * 0.2 + i * 2) * 80;
            const baseOpacity = (Math.sin(time * 0.4 + i * 1.5) + 1) * 0.2;
            const opacity = baseOpacity + sanityFactor * 0.3;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = sanityFactor > 0.6 ? '#000000' : '#000510';
            
            const radius = 30 + Math.sin(time * 0.5 + i) * 15 + sanityFactor * 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    renderWaterReflections(ctx, map, time, sanityFactor) {
        ctx.save();
        ctx.globalAlpha = 0.2 + sanityFactor * 0.3;
        
        // More chaotic reflections at low sanity
        const reflectionIntensity = 1 + sanityFactor * 2;
        
        for (let i = 0; i < 40; i++) {
            const baseX = (i * 45) % map.width;
            const baseY = 820 + (i * 35) % (map.height - 820);
            
            const x = baseX + Math.sin(time * 1.5 * reflectionIntensity + i * 0.3) * 15;
            const y = baseY + Math.cos(time * 1.2 * reflectionIntensity + i * 0.4) * 8;
            
            const flicker = Math.sin(time * 3 * reflectionIntensity + i) * 0.5 + 0.5;
            ctx.globalAlpha = (0.2 + sanityFactor * 0.3) * flicker;
            
            const size = 2 + Math.sin(time * 0.8 + i * 0.5) * 1.5;
            
            // Color varies with sanity
            if (sanityFactor > 0.7) {
                ctx.fillStyle = '#6a4a8a'; // Purplish at very low sanity
            } else if (sanityFactor > 0.4) {
                ctx.fillStyle = '#5a6a8a'; // Slightly off-color
            } else {
                ctx.fillStyle = '#4a6a8a'; // Normal
            }
            
            ctx.fillRect(x, y, Math.abs(size), Math.abs(size));
        }
        ctx.restore();
    }
    
    renderCreatureRipples(ctx, map, time, sanityFactor) {
        // More frequent and disturbing ripples at low sanity
        const rippleTrigger = 0.8 - sanityFactor * 0.3;
        
        if (Math.sin(time * 0.7) > rippleTrigger) {
            const rippleCount = 1 + Math.floor(sanityFactor * 3);
            
            for (let r = 0; r < rippleCount; r++) {
                const rippleX = map.width * (0.2 + r * 0.3) + Math.sin(time * 0.3 + r) * 150;
                const rippleY = 850 + Math.cos(time * 0.25 + r * 2) * 120;
                
                const maxRadius = 4 + Math.floor(sanityFactor * 3);
                
                for (let ring = 1; ring <= maxRadius; ring++) {
                    const opacity = (0.3 / ring) + sanityFactor * 0.2;
                    ctx.strokeStyle = `rgba(100, 120, 140, ${opacity})`;
                    ctx.lineWidth = 1 + sanityFactor;
                    ctx.beginPath();
                    ctx.arc(rippleX, rippleY, ring * 20 + Math.sin(time * 4 + r) * 8, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
    }
    
    renderStaticObject(ctx, obj) {
        switch (obj.type) {
            case 'lighthouse':
                this.renderLighthouse(ctx, obj);
                break;
                
            case 'dock':
                this.renderDock(ctx, obj);
                break;
                
            case 'building':
                this.renderBuilding(ctx, obj);
                break;
                
            case 'tree':
                this.renderTree(ctx, obj);
                break;
                
            case 'rock':
                this.renderRock(ctx, obj);
                break;
                
            case 'sign':
                this.renderSign(ctx, obj);
                break;
                
            case 'sailboat':
                this.renderSailboat(ctx, obj);
                break;
                
            case 'lamppost':
                this.renderLamppost(ctx, obj);
                break;
                
            case 'stairs':
                this.renderStairs(ctx, obj);
                break;
                
            case 'desk':
                this.renderDesk(ctx, obj);
                break;
                
            case 'lens':
                this.renderLens(ctx, obj);
                break;
        }
    }
    
    renderLighthouse(ctx, obj) {
        // Lighthouse shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + 5, obj.y + obj.height + 2, obj.width, 8);
        
        // Lighthouse base structure
        ctx.fillStyle = '#9aabbb';
        ctx.fillRect(obj.x, obj.y + obj.height - 50, obj.width, 50);
        
        // Main lighthouse tower
        ctx.fillStyle = '#8a9ba8';
        ctx.fillRect(obj.x + 10, obj.y, obj.width - 20, obj.height - 50);
        
        // Stone texture on lighthouse
        ctx.save();
        ctx.fillStyle = '#7a8b98';
        for (let y = obj.y; y < obj.y + obj.height - 50; y += 15) {
            for (let x = obj.x + 10; x < obj.x + obj.width - 10; x += 20) {
                // Use deterministic pattern based on position
                if (Math.sin(x * 0.1 + y * 0.15) > 0.4) {
                    ctx.fillRect(x + Math.sin(x * 0.05) * 3, y, 8, 3);
                }
            }
        }
        ctx.restore();
        
        // Lighthouse top/lantern room
        ctx.fillStyle = '#6a7b88';
        ctx.fillRect(obj.x + 5, obj.y - 30, obj.width - 10, 40);
        
        // Lantern room windows
        ctx.fillStyle = '#4a5b68';
        ctx.fillRect(obj.x + 10, obj.y - 25, 15, 20);
        ctx.fillRect(obj.x + obj.width - 25, obj.y - 25, 15, 20);
        ctx.fillRect(obj.x + obj.width/2 - 7, obj.y - 25, 14, 20);
        
        // Light beam (varies with time and sanity) - but not visible when inside
        const lightIntensity = this.game.gameTime > 18 || this.game.gameTime < 6 ? 
            0.9 - (this.game.sanity / 100) * 0.2 : 0.4;
        
        // Don't render the external light beam when player is inside the lighthouse
        if (lightIntensity > 0.3 && !this.playerInsideLighthouse) {
            ctx.save();
            
            const centerX = obj.x + obj.width/2;
            const centerY = obj.y - 10;
            
            // Rotating beam effect
            const rotationSpeed = 0.5; // Speed of rotation
            const currentRotation = (this.game.time * rotationSpeed) % (Math.PI * 2);
            
            // Main concentrated light beam (rotating)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(currentRotation);
            
            // Create radial gradient for main beam
            const beamGradient = ctx.createLinearGradient(0, 0, 300, 0);
            beamGradient.addColorStop(0, `rgba(255, 255, 170, ${lightIntensity * 0.8})`);
            beamGradient.addColorStop(0.3, `rgba(255, 255, 170, ${lightIntensity * 0.6})`);
            beamGradient.addColorStop(0.7, `rgba(255, 255, 170, ${lightIntensity * 0.3})`);
            beamGradient.addColorStop(1, `rgba(255, 255, 170, 0)`);
            
            ctx.fillStyle = beamGradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(300, -25);
            ctx.lineTo(300, 25);
            ctx.closePath();
            ctx.fill();
            
            // Add atmospheric scattering effect
            const scatterGradient = ctx.createLinearGradient(0, 0, 300, 0);
            scatterGradient.addColorStop(0, `rgba(255, 255, 200, ${lightIntensity * 0.4})`);
            scatterGradient.addColorStop(0.5, `rgba(255, 255, 200, ${lightIntensity * 0.2})`);
            scatterGradient.addColorStop(1, `rgba(255, 255, 200, 0)`);
            
            ctx.fillStyle = scatterGradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(300, -40);
            ctx.lineTo(300, 40);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
            
            // Main light source (bright center)
            const lightGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
            lightGradient.addColorStop(0, `rgba(255, 255, 220, ${lightIntensity})`);
            lightGradient.addColorStop(0.5, `rgba(255, 255, 190, ${lightIntensity * 0.7})`);
            lightGradient.addColorStop(1, `rgba(255, 255, 170, ${lightIntensity * 0.3})`);
            
            ctx.fillStyle = lightGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Secondary ambient light (larger, softer glow)
            const ambientGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60);
            ambientGradient.addColorStop(0, `rgba(255, 255, 170, ${lightIntensity * 0.3})`);
            ambientGradient.addColorStop(0.5, `rgba(255, 255, 170, ${lightIntensity * 0.15})`);
            ambientGradient.addColorStop(1, `rgba(255, 255, 170, 0)`);
            
            ctx.fillStyle = ambientGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
            ctx.fill();
            
            // Add subtle flickering effect to simulate lighthouse mechanics
            const flicker = 0.95 + Math.sin(this.game.time * 8) * 0.05;
            ctx.globalAlpha = lightIntensity * flicker;
            
            // Core light (very bright center)
            ctx.fillStyle = `rgba(255, 255, 255, ${lightIntensity * 0.9})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // When inside lighthouse, add subtle interior lighting effects from above
        if (this.playerInsideLighthouse && lightIntensity > 0.3) {
            const centerX = obj.x + obj.width/2;
            const topY = obj.y + 20; // Light filtering down from above
            
            // Soft overhead glow
            const interiorGradient = ctx.createRadialGradient(centerX, topY, 0, centerX, topY, 80);
            interiorGradient.addColorStop(0, `rgba(255, 255, 200, ${lightIntensity * 0.15})`);
            interiorGradient.addColorStop(0.5, `rgba(255, 255, 200, ${lightIntensity * 0.08})`);
            interiorGradient.addColorStop(1, `rgba(255, 255, 200, 0)`);
            
            ctx.fillStyle = interiorGradient;
            ctx.beginPath();
            ctx.arc(centerX, topY, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Door
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(obj.x + 35, obj.y + obj.height - 45, 30, 40);
        
        // Door details
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(obj.x + 38, obj.y + obj.height - 42, 24, 34);
        
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(obj.x + 58, obj.y + obj.height - 25, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Door panels
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 1;
        ctx.strokeRect(obj.x + 40, obj.y + obj.height - 40, 8, 15);
        ctx.strokeRect(obj.x + 52, obj.y + obj.height - 40, 8, 15);
        ctx.strokeRect(obj.x + 40, obj.y + obj.height - 22, 8, 15);
        ctx.strokeRect(obj.x + 52, obj.y + obj.height - 22, 8, 15);
    }
    
    renderDock(ctx, obj) {
        // Dock shadow (in water)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(obj.x + 3, obj.y + obj.height + 2, obj.width, 8);
        
        // Shore section of dock (first 20% on land)
        const shoreLength = obj.height * 0.2;
        ctx.fillStyle = '#9a7a5a'; // Lighter color for shore section
        ctx.fillRect(obj.x, obj.y, obj.width, shoreLength);
        
        // Water section of dock (remaining 80% over water)
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(obj.x, obj.y + shoreLength, obj.width, obj.height - shoreLength);
        
        // Wood planks texture (running widthwise across the dock)
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < obj.height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + i);
            ctx.lineTo(obj.x + obj.width, obj.y + i);
            ctx.stroke();
        }
        
        // Crossbeams (running lengthwise along the dock sides)
        ctx.strokeStyle = '#7a5a3a';
        ctx.lineWidth = 3;
        // Left side beam
        ctx.beginPath();
        ctx.moveTo(obj.x + 8, obj.y);
        ctx.lineTo(obj.x + 8, obj.y + obj.height);
        ctx.stroke();
        // Right side beam
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width - 8, obj.y);
        ctx.lineTo(obj.x + obj.width - 8, obj.y + obj.height);
        ctx.stroke();
        // Center beam
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/2, obj.y);
        ctx.lineTo(obj.x + obj.width/2, obj.y + obj.height);
        ctx.stroke();
        
        // Wood grain details
        ctx.save();
        ctx.fillStyle = '#7a5a3a';
        for (let x = obj.x; x < obj.x + obj.width; x += 6) {
            for (let y = obj.y; y < obj.y + obj.height; y += 12) {
                // Use deterministic pattern based on position instead of random
                if (Math.sin(x * 0.7 + y * 0.3) > 0.6) {
                    ctx.fillRect(x, y, 1, 6);
                }
            }
        }
        ctx.restore();
        
        // Support posts extending into water (only for water section)
        const waterStart = obj.y + shoreLength;
        for (let i = 25; i < obj.height - shoreLength - 25; i += 45) {
            // Main support post (centered)
            ctx.fillStyle = '#6a4a2a';
            ctx.fillRect(obj.x + obj.width/2 - 6, waterStart + i, 12, 35);
            
            // Post cap above dock
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(obj.x + obj.width/2 - 8, waterStart + i - 3, 16, 6);
            
            // Metal reinforcement bands
            ctx.fillStyle = '#888888';
            ctx.fillRect(obj.x + obj.width/2 - 6, waterStart + i + 5, 12, 3);
            ctx.fillRect(obj.x + obj.width/2 - 6, waterStart + i + 20, 12, 3);
            
            // Weathering and algae on underwater portion
            ctx.fillStyle = '#4a5a3a';
            ctx.fillRect(obj.x + obj.width/2 - 3, waterStart + i + 10, 3, 25);
            
            // Diagonal support braces
            ctx.strokeStyle = '#6a4a2a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width/2, waterStart + i);
            ctx.lineTo(obj.x + 15, waterStart + i + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(obj.x + obj.width/2, waterStart + i);
            ctx.lineTo(obj.x + obj.width - 15, waterStart + i + 15);
            ctx.stroke();
        }
        
        // Dock edge details
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        
        // Ropes and nautical details
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obj.x + 20, obj.y + 40);
        ctx.quadraticCurveTo(obj.x + obj.width/2, obj.y + 60, obj.x + obj.width - 20, obj.y + 80);
        ctx.stroke();
        
        // Rope coils
        ctx.fillStyle = '#8a7a6a';
        ctx.beginPath();
        ctx.arc(obj.x + 25, obj.y + 50, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(obj.x + obj.width - 25, obj.y + 90, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Dock cleats for tying boats
        ctx.fillStyle = '#666666';
        ctx.fillRect(obj.x + 10, obj.y + 60, 8, 4);
        ctx.fillRect(obj.x + obj.width - 18, obj.y + 120, 8, 4);
    }
    
    renderBuilding(ctx, obj) {
        // Building shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + 3, obj.y + obj.height + 1, obj.width, 6);
        
        // Main building structure
        ctx.fillStyle = '#6a6a8a';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Building texture (brick pattern)
        ctx.save();
        ctx.fillStyle = '#5a5a7a';
        for (let y = obj.y; y < obj.y + obj.height; y += 8) {
            for (let x = obj.x; x < obj.x + obj.width; x += 16) {
                const offsetX = (Math.floor((y - obj.y) / 8) % 2) * 8;
                ctx.fillRect(x + offsetX, y, 14, 6);
            }
        }
        
        // Mortar lines
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 1;
        for (let y = obj.y + 8; y < obj.y + obj.height; y += 8) {
            ctx.beginPath();
            ctx.moveTo(obj.x, y);
            ctx.lineTo(obj.x + obj.width, y);
            ctx.stroke();
        }
        ctx.restore();
        
        // Detailed roof
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(obj.x - 8, obj.y - 20, obj.width + 16, 25);
        
        // Roof tiles
        ctx.save();
        ctx.fillStyle = '#3a3a5a';
        for (let y = obj.y - 18; y < obj.y + 3; y += 4) {
            for (let x = obj.x - 6; x < obj.x + obj.width + 6; x += 8) {
                const offsetX = (Math.floor((y - (obj.y - 18)) / 4) % 2) * 4;
                ctx.fillRect(x + offsetX, y, 6, 3);
            }
        }
        ctx.restore();
        
        // Chimney
        ctx.fillStyle = '#5a3a3a';
        ctx.fillRect(obj.x + obj.width - 20, obj.y - 35, 12, 20);
        
        // Windows with frames and details
        const windowsLit = this.game.gameTime > 18 || this.game.gameTime < 6;
        
        // Window frames
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(obj.x + 8, obj.y + 18, 20, 25);
        ctx.fillRect(obj.x + obj.width - 28, obj.y + 18, 20, 25);
        
        // Window glass
        ctx.fillStyle = windowsLit ? '#ffff88' : '#2a2a4a';
        ctx.fillRect(obj.x + 10, obj.y + 20, 16, 21);
        ctx.fillRect(obj.x + obj.width - 26, obj.y + 20, 16, 21);
        
        // Window cross frames
        ctx.strokeStyle = '#6a6a6a';
        ctx.lineWidth = 2;
        // Left window
        ctx.beginPath();
        ctx.moveTo(obj.x + 18, obj.y + 20);
        ctx.lineTo(obj.x + 18, obj.y + 41);
        ctx.moveTo(obj.x + 10, obj.y + 30);
        ctx.lineTo(obj.x + 26, obj.y + 30);
        ctx.stroke();
        
        // Right window
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width - 18, obj.y + 20);
        ctx.lineTo(obj.x + obj.width - 18, obj.y + 41);
        ctx.moveTo(obj.x + obj.width - 26, obj.y + 30);
        ctx.lineTo(obj.x + obj.width - 10, obj.y + 30);
        ctx.stroke();
        
        // Window glow at night
        if (windowsLit) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ffff88';
            ctx.fillRect(obj.x + 8, obj.y + 18, 20, 25);
            ctx.fillRect(obj.x + obj.width - 28, obj.y + 18, 20, 25);
            ctx.restore();
        }
        
        // Door
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(obj.x + obj.width/2 - 8, obj.y + obj.height - 25, 16, 25);
        
        // Door frame
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(obj.x + obj.width/2 - 10, obj.y + obj.height - 27, 20, 2);
        ctx.fillRect(obj.x + obj.width/2 - 10, obj.y + obj.height - 25, 2, 25);
        ctx.fillRect(obj.x + obj.width/2 + 8, obj.y + obj.height - 25, 2, 25);
        
        // Door handle
        ctx.fillStyle = '#cc9900';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2 + 4, obj.y + obj.height - 13, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderTree(ctx, obj) {
        // Tree shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2 + 2, obj.y + obj.height + 3, obj.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tree trunk with texture
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(obj.x + obj.width/3, obj.y + obj.height/2, obj.width/3, obj.height/2);
        
        // Bark texture
        ctx.save();
        ctx.fillStyle = '#3a2a1a';
        for (let y = obj.y + obj.height/2; y < obj.y + obj.height; y += 4) {
            // Use deterministic pattern based on position
            if (Math.sin(y * 0.3 + obj.x * 0.1) > 0.2) {
                ctx.fillRect(obj.x + obj.width/3 + Math.sin(y * 0.2) * (obj.width/6), y, 2, 3);
            }
        }
        ctx.restore();
        
        // Tree canopy (multiple layers for depth)
        ctx.fillStyle = '#1a3a2a';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/3, obj.width/2 + 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2a4a3a';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/3, obj.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Foliage texture
        ctx.save();
        ctx.fillStyle = '#3a5a4a';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = obj.x + obj.width/2 + Math.cos(angle) * (obj.width/3);
            const y = obj.y + obj.height/3 + Math.sin(angle) * (obj.width/3);
            ctx.beginPath();
            // Use deterministic size based on position
            const size = 3 + Math.sin(x * 0.1 + y * 0.1) * 2;
            ctx.arc(x, y, Math.abs(size), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    
    renderRock(ctx, obj) {
        // Rock shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2 + 2, obj.y + obj.height/2 + 3, obj.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main rock shape (irregular)
        ctx.fillStyle = '#6a6a6a';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2, obj.y + obj.height/2, obj.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock texture and shading
        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2 - 2, obj.y + obj.height/2 - 2, obj.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#7a7a7a';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width/2 + 3, obj.y + obj.height/2 + 1, obj.width/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock cracks
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/4, obj.y + obj.height/3);
        ctx.lineTo(obj.x + 3*obj.width/4, obj.y + 2*obj.height/3);
        ctx.stroke();
    }
    
    renderSign(ctx, obj) {
        // Sign post shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + obj.width/2 + 2, obj.y + obj.height + 1, 8, 4);
        
        // Sign post
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(obj.x + obj.width/2 - 4, obj.y + obj.height/3, 8, obj.height * 2/3);
        
        // Sign board
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height/2);
        
        // Sign board frame
        ctx.strokeStyle = '#4a3a2a';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height/2);
        
        // Sign text area
        ctx.fillStyle = '#f0f0e0';
        ctx.fillRect(obj.x + 3, obj.y + 3, obj.width - 6, obj.height/2 - 6);
        
        // Sign text
        ctx.fillStyle = '#2a2a2a';
        ctx.font = '4px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('WELCOME TO', obj.x + obj.width/2, obj.y + 10);
        ctx.fillText('PALE HARBOR', obj.x + obj.width/2, obj.y + 15);
        ctx.textAlign = 'left';
        
        // Weathering effects
        ctx.fillStyle = 'rgba(90, 70, 50, 0.3)';
        ctx.fillRect(obj.x + 2, obj.y + obj.height/2 - 8, obj.width - 4, 6);
        
        // Sign post cap
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(obj.x + obj.width/2 - 6, obj.y + obj.height/3 - 3, 12, 6);
    }
    
    renderSailboat(ctx, obj) {
        const time = this.game.time;
        
        // Water bobbing effect - boat moves up and down
        const bobOffset = Math.sin(time * 1.5) * 3 + Math.cos(time * 0.8) * 2;
        const boatY = obj.y + bobOffset;
        
        // Boat shadow in water (moves with bobbing)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + 2, boatY + obj.height + 2, obj.width, 6);
        
        // Main boat hull
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(obj.x + 5, boatY + obj.height - 15, obj.width - 10, 15);
        
        // Boat bow (pointed front)
        ctx.fillStyle = '#8a6a4a';
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width - 5, boatY + obj.height - 15);
        ctx.lineTo(obj.x + obj.width + 5, boatY + obj.height - 7);
        ctx.lineTo(obj.x + obj.width - 5, boatY + obj.height);
        ctx.closePath();
        ctx.fill();
        
        // Hull details and planking
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(obj.x + 5, boatY + obj.height - 12 + i * 4);
            ctx.lineTo(obj.x + obj.width - 5, boatY + obj.height - 12 + i * 4);
            ctx.stroke();
        }
        
        // Mast
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(obj.x + obj.width/2 - 2, boatY + obj.height - 60, 4, 45);
        
        // Main sail
        ctx.fillStyle = '#f0f0e0';
        const sailSway = Math.sin(time * 2) * 2; // Sail sways in the wind
        ctx.save();
        ctx.translate(obj.x + obj.width/2, boatY + obj.height - 45);
        ctx.rotate(sailSway * 0.05); // Slight rotation for wind effect
        ctx.fillRect(-15, -20, 30, 25);
        ctx.restore();
        
        // Sail details (patches and wear)
        ctx.fillStyle = 'rgba(200, 200, 180, 0.7)';
        ctx.fillRect(obj.x + obj.width/2 - 10, boatY + obj.height - 55, 8, 3);
        ctx.fillRect(obj.x + obj.width/2 + 2, boatY + obj.height - 50, 6, 4);
        
        // Jib sail (smaller front sail)
        ctx.fillStyle = '#e8e8d0';
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/2, boatY + obj.height - 40);
        ctx.lineTo(obj.x + obj.width/2 + 12 + sailSway, boatY + obj.height - 35);
        ctx.lineTo(obj.x + obj.width/2 + 8 + sailSway, boatY + obj.height - 20);
        ctx.closePath();
        ctx.fill();
        
        // Rigging (ropes)
        ctx.strokeStyle = '#4a4a3a';
        ctx.lineWidth = 1;
        // Main mast to bow
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/2, boatY + obj.height - 55);
        ctx.lineTo(obj.x + obj.width - 2, boatY + obj.height - 12);
        ctx.stroke();
        
        // Main mast to stern
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width/2, boatY + obj.height - 55);
        ctx.lineTo(obj.x + 8, boatY + obj.height - 12);
        ctx.stroke();
        
        // Rope connecting to dock
        ctx.strokeStyle = '#8a7a6a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obj.x + 5, boatY + obj.height - 8); // From boat
        
        // Rope has some slack and sway
        const ropeSlack = Math.sin(time * 1.2) * 5;
        const dockX = 420; // Near the center of the dock
        const dockY = 850; // Edge of the dock facing the water
        const midX = (obj.x + 5 + dockX) / 2; // Halfway to dock
        const midY = boatY + obj.height - 15 + ropeSlack;
        
        ctx.quadraticCurveTo(midX, midY, dockX, dockY); // To dock
        ctx.stroke();
        
        // Rope attachment point on boat
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(obj.x + 5, boatY + obj.height - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Small details
        // Boat name on hull
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('MARY', obj.x + obj.width/2, boatY + obj.height - 5);
        ctx.textAlign = 'left';
        
        // Small cabin/wheelhouse
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(obj.x + obj.width/2 - 8, boatY + obj.height - 25, 16, 10);
        
        // Cabin window
        ctx.fillStyle = '#4a6a8a';
        ctx.fillRect(obj.x + obj.width/2 - 4, boatY + obj.height - 22, 8, 4);
        
        // Window reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(obj.x + obj.width/2 - 3, boatY + obj.height - 21, 3, 2);
    }
    
    renderLamppost(ctx, obj) {
        const time = this.game.time;
        const gameTime = this.game.gameTime;
        
        // Lamppost shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + 2, obj.y + obj.height + 1, obj.width, 6);
        
        // Lamppost base (wider at bottom)
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(obj.x, obj.y + obj.height - 8, obj.width + 4, 8);
        
        // Main lamppost pole
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(obj.x + 2, obj.y + 15, obj.width - 4, obj.height - 15);
        
        // Lamppost top fixture
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(obj.x - 2, obj.y + 10, obj.width + 4, 15);
        
        // Glass lamp housing
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(obj.x, obj.y + 12, obj.width, 11);
        
        // Light source (flickers based on time and conditions)
        const isNight = gameTime > 18 || gameTime < 7; // Turn on at 6 PM, off at 7 AM
        if (isNight) {
            // Flickering effect - more erratic at low sanity
            const sanityFactor = this.game.sanity / 100;
            const baseFlicker = Math.sin(time * 4 + obj.x * 0.01) * 0.3 + 0.7;
            const chaosFlicker = Math.sin(time * 12 + obj.x * 0.03) * (1 - sanityFactor) * 0.4;
            const finalIntensity = Math.max(0.2, baseFlicker + chaosFlicker);
            
            // Light bulb
            ctx.save();
            ctx.globalAlpha = finalIntensity;
            ctx.fillStyle = '#ffff88';
            ctx.fillRect(obj.x + 2, obj.y + 14, obj.width - 4, 7);
            ctx.restore();
            
            // Light glow effect (simple rectangles to avoid gradient issues)
            ctx.save();
            ctx.globalAlpha = finalIntensity * 0.2;
            ctx.fillStyle = '#ffff88';
            ctx.fillRect(obj.x - 15, obj.y + 5, obj.width + 30, 25);
            ctx.restore();
            
            // Ground illumination
            ctx.save();
            ctx.globalAlpha = finalIntensity * 0.15;
            ctx.fillStyle = '#ffff88';
            ctx.fillRect(obj.x - 12, obj.y + obj.height, obj.width + 24, 8);
            ctx.restore();
        } else {
            // Dim/off during day
            ctx.fillStyle = '#888888';
            ctx.fillRect(obj.x + 2, obj.y + 14, obj.width - 4, 7);
        }
        
        // Lamp housing details
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(obj.x, obj.y + 12, obj.width, 11);
        
        // Mounting bracket
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(obj.x + obj.width/2 - 1, obj.y + 23, 2, 8);
    }
    
    renderStairs(ctx, obj) {
        // Spiral staircase - render as a series of curved steps
        ctx.save();
        
        // Stair base/foundation
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(obj.x, obj.y + obj.height - 5, obj.width, 5);
        
        // Individual steps (spiral appearance)
        const numSteps = 6;
        for (let i = 0; i < numSteps; i++) {
            const stepY = obj.y + obj.height - (i * 5) - 5;
            const stepWidth = obj.width - (i * 2);
            const stepX = obj.x + i;
            
            // Step tread
            ctx.fillStyle = `rgb(${90 - i * 5}, ${74 - i * 3}, ${58 - i * 2})`;
            ctx.fillRect(stepX, stepY, stepWidth, 3);
            
            // Step edge highlight
            ctx.fillStyle = `rgb(${100 - i * 5}, ${84 - i * 3}, ${68 - i * 2})`;
            ctx.fillRect(stepX, stepY, stepWidth, 1);
        }
        
        // Central support post
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(obj.x + obj.width/2 - 2, obj.y, 4, obj.height);
        
        // Handrail suggestion (curved line)
        ctx.strokeStyle = '#6a5a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.width, obj.y + obj.height);
        ctx.quadraticCurveTo(obj.x + obj.width/2, obj.y + obj.height/2, obj.x, obj.y + 5);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderDesk(ctx, obj) {
        // Desk shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(obj.x + 2, obj.y + obj.height + 1, obj.width, 3);
        
        // Desk top
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(obj.x, obj.y, obj.width, 4);
        
        // Desk front
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(obj.x, obj.y + 4, obj.width, obj.height - 8);
        
        // Desk legs
        ctx.fillStyle = '#6a4a2a';
        ctx.fillRect(obj.x + 2, obj.y + obj.height - 4, 3, 4);
        ctx.fillRect(obj.x + obj.width - 5, obj.y + obj.height - 4, 3, 4);
        
        // Papers/clutter on desk
        ctx.fillStyle = '#f0f0e0';
        ctx.fillRect(obj.x + 3, obj.y + 1, 6, 2);
        ctx.fillRect(obj.x + 12, obj.y + 1, 4, 2);
        
        // Ink stains
        ctx.fillStyle = 'rgba(20, 20, 40, 0.6)';
        ctx.fillRect(obj.x + 8, obj.y + 1, 2, 1);
    }
    
    renderLens(ctx, obj) {
        // Lens housing shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(obj.x + 2, obj.y + obj.height + 1, obj.width, 4);
        
        // Lens housing (metallic)
        ctx.fillStyle = '#7a8a9a';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Lens housing highlights
        ctx.fillStyle = '#9aabbb';
        ctx.fillRect(obj.x, obj.y, obj.width, 3);
        ctx.fillRect(obj.x, obj.y, 3, obj.height);
        
        // Lens itself (if not collected)
        if (!this.entities.find(e => e.type === 'lens' && e.collected)) {
            // Glass lens with mystical glow
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#e0f0ff';
            ctx.fillRect(obj.x + 4, obj.y + 4, obj.width - 8, obj.height - 8);
            
            // Mystical glow effect
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#a0c0ff';
            ctx.fillRect(obj.x + 2, obj.y + 2, obj.width - 4, obj.height - 4);
            
            // Center focal point
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(obj.x + obj.width/2 - 2, obj.y + obj.height/2 - 2, 4, 4);
            ctx.restore();
        }
        
        // Housing details
        ctx.strokeStyle = '#5a6a7a';
        ctx.lineWidth = 1;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
    
    renderInteractables(ctx) {
        const player = this.game.player;
        let closestItem = null;
        let closestDistance = Infinity;
        
        this.interactables.forEach(item => {
            // Only skip items that are actually collected (removed from world)
            // Furniture like desks should remain visible even after being searched
            if (item.collected === true) return;
            
            // Special case: skip searched items only if they're meant to disappear
            // Desk, stairs, lens, and other furniture should always be visible even when searched/used
            if (item.searched === true && item.type !== 'desk' && item.type !== 'stairs' && item.type !== 'lens' && 
                item.type !== 'bookshelf' && item.type !== 'bed' && item.type !== 'coat' && item.type !== 'plant' && 
                item.type !== 'lamp' && item.type !== 'instruments') return;
            
            // Calculate distance to player
            const distance = Math.sqrt(
                Math.pow(player.x - (item.x + item.width/2), 2) + 
                Math.pow(player.y - (item.y + item.height/2), 2)
            );
            
            // Track closest interactable
            if (distance < 50 && distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
            
            // Render the item
            switch (item.type) {
                case 'door':
                    // Door is rendered as part of lighthouse
                    break;
                    
                case 'item':
                    ctx.fillStyle = '#ffaa00';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    
                    // Glow effect
                    ctx.save();
                    ctx.globalAlpha = 0.3 + Math.sin(this.game.time * 3) * 0.2;
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);
                    ctx.restore();
                    break;
                    
                case 'statue':
                    // Detailed statue rendering
                    this.renderStatue(ctx, item);
                    break;
                    
                case 'stairs':
                    // Render spiral staircase
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Add steps detail
                    for (let i = 0; i < 4; i++) {
                        ctx.fillStyle = '#A0522D';
                        ctx.fillRect(item.x + 2, item.y + i * 7, item.width - 4, 3);
                    }
                    break;
                    
                case 'desk':
                    // Render keeper's desk
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Add desk details
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(item.x + 2, item.y + 2, item.width - 4, 8); // Desktop
                    ctx.fillRect(item.x + 2, item.y + 12, 8, item.height - 14); // Drawer
                    break;
                    
                case 'lens':
                    // Render lighthouse lens
                    ctx.save();
                    ctx.fillStyle = '#C0C0C0';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Add lens shine effect
                    ctx.globalAlpha = 0.5 + Math.sin(this.game.time * 2) * 0.3;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
                    ctx.restore();
                    break;
                    
                case 'bookshelf':
                    // Render bookshelf
                    ctx.fillStyle = '#4a3a2a';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Add shelf lines
                    for (let i = 1; i < 4; i++) {
                        ctx.fillStyle = '#3a2a1a';
                        ctx.fillRect(item.x, item.y + i * 10, item.width, 2);
                    }
                    // Add books
                    ctx.fillStyle = '#2a4a2a';
                    ctx.fillRect(item.x + 2, item.y + 5, 3, 8);
                    ctx.fillStyle = '#4a2a2a';
                    ctx.fillRect(item.x + 6, item.y + 5, 4, 8);
                    ctx.fillStyle = '#2a2a4a';
                    ctx.fillRect(item.x + 2, item.y + 15, 5, 8);
                    break;
                    
                case 'plant':
                    // Render dying plant
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(item.x + 3, item.y + 10, 6, 5); // Pot
                    ctx.fillStyle = '#4a2a1a';
                    ctx.fillRect(item.x + 5, item.y + 5, 2, 10); // Stem
                    // Withered leaves
                    ctx.fillStyle = '#5a4a2a';
                    ctx.fillRect(item.x + 3, item.y + 3, 3, 4);
                    ctx.fillRect(item.x + 8, item.y + 4, 3, 3);
                    ctx.fillRect(item.x + 4, item.y + 8, 4, 3);
                    break;
                    
                case 'bed':
                    // Render keeper's cot
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Mattress
                    ctx.fillStyle = '#8B7355';
                    ctx.fillRect(item.x + 1, item.y + 1, item.width - 2, item.height - 8);
                    // Pillow
                    ctx.fillStyle = '#A0A0A0';
                    ctx.fillRect(item.x + 2, item.y + 2, 6, 4);
                    break;
                    
                case 'lamp':
                    // Render oil lamp
                    ctx.fillStyle = '#DAA520';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Flame effect
                    ctx.save();
                    ctx.globalAlpha = 0.7 + Math.sin(this.game.time * 8) * 0.3;
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(item.x + 2, item.y, 4, 6);
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = '#FF4500';
                    ctx.fillRect(item.x + 3, item.y + 1, 2, 4);
                    ctx.restore();
                    break;
                    
                case 'instruments':
                    // Render weather instruments
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Barometer circle
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(item.x + 2, item.y + 5, 2, 0, Math.PI * 2);
                    ctx.stroke();
                    // Thermometer
                    ctx.fillStyle = '#C0C0C0';
                    ctx.fillRect(item.x + 1, item.y + 12, 1, 6);
                    break;
                    
                case 'coat':
                    // Render keeper's coat
                    ctx.fillStyle = '#2F4F4F';
                    ctx.fillRect(item.x, item.y, item.width, item.height);
                    // Coat details
                    ctx.fillStyle = '#1C3A3A';
                    ctx.fillRect(item.x + 1, item.y + 5, 6, 15); // Body
                    ctx.fillRect(item.x + 2, item.y + 8, 4, 2);  // Collar
                    // Buttons
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(item.x + 3, item.y + 10, 1, 1);
                    ctx.fillRect(item.x + 3, item.y + 13, 1, 1);
                    break;
            }
        });
        
        // Show interaction prompt only for the closest item
        if (closestItem) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '14px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('Press E to interact', closestItem.x + closestItem.width/2, closestItem.y - 10);
            ctx.textAlign = 'left';
        }
    }
    
    checkCollision(bounds) {
        // Check world boundaries
        const map = this.maps[this.currentMap];
        if (bounds.x < 0 || bounds.y < 0 || 
            bounds.x + bounds.width > map.width || 
            bounds.y + bounds.height > map.height) {
            return true;
        }
        
        // Check collision objects
        for (let obj of this.collisionObjects) {
            if (bounds.x < obj.x + obj.width &&
                bounds.x + bounds.width > obj.x &&
                bounds.y < obj.y + obj.height &&
                bounds.y + bounds.height > obj.y) {
                return true;
            }
        }
        
        return false;
    }
    
    getAreaAt(x, y) {
        const map = this.maps[this.currentMap];
        
        for (let area of map.areas) {
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                return area.name;
            }
        }
        
        return null;
    }
    
    getInteractablesNear(x, y, radius) {
        return this.interactables.filter(item => {
            // Only skip items that are actually collected (removed from world)
            if (item.collected === true) return false;
            
            // Special case: skip searched items only if they're meant to disappear
            // Desk, stairs, lens, and other furniture should always be interactable even when searched/used
            if (item.searched === true && item.type !== 'desk' && item.type !== 'stairs' && item.type !== 'lens' && 
                item.type !== 'bookshelf' && item.type !== 'bed' && item.type !== 'coat' && item.type !== 'plant' && 
                item.type !== 'lamp' && item.type !== 'instruments') return false;
            
            const distance = Math.sqrt(
                Math.pow(x - (item.x + item.width/2), 2) + 
                Math.pow(y - (item.y + item.height/2), 2)
            );
            
            return distance <= radius;
        }).sort((a, b) => {
            // Sort by distance - closest first
            const distA = Math.sqrt(Math.pow(x - (a.x + a.width/2), 2) + Math.pow(y - (a.y + a.height/2), 2));
            const distB = Math.sqrt(Math.pow(x - (b.x + b.width/2), 2) + Math.pow(y - (b.y + b.height/2), 2));
            return distA - distB;
        });
    }
    
    renderStatue(ctx, item) {
        const x = item.x;
        const y = item.y;
        const w = item.width;
        const h = item.height;
        
        ctx.save();
        
        // Base/pedestal
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(x - 5, y + h - 10, w + 10, 12);
        
        // Main statue body - weathered stone
        const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
        gradient.addColorStop(0, '#9a9a9a');
        gradient.addColorStop(0.3, '#8a8a8a');
        gradient.addColorStop(0.7, '#7a7a7a');
        gradient.addColorStop(1, '#6a6a6a');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
        
        // Add weathering texture and cracks
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1;
        
        // Vertical weathering cracks
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 10);
        ctx.lineTo(x + 7, y + 30);
        ctx.moveTo(x + 25, y + 15);
        ctx.lineTo(x + 24, y + 40);
        ctx.moveTo(x + 32, y + 8);
        ctx.lineTo(x + 33, y + 25);
        ctx.stroke();
        
        // Horizontal weathering lines
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 20);
        ctx.lineTo(x + 15, y + 21);
        ctx.moveTo(x + 20, y + 35);
        ctx.lineTo(x + 35, y + 36);
        ctx.stroke();
        
        // Figure details
        // Head
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(x + 12, y + 5, 16, 18);
        
        // Face shadow
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 13, y + 10, 14, 8);
        
        // Arms/shoulders
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 5, y + 23, 30, 12);
        
        // Torso detailing
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(x + 10, y + 25, 20, 25);
        
        // Clothing/robe fold lines
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 30);
        ctx.lineTo(x + 28, y + 32);
        ctx.moveTo(x + 10, y + 40);
        ctx.lineTo(x + 30, y + 42);
        ctx.stroke();
        
        // Moss/weathering stains
        ctx.fillStyle = 'rgba(50, 80, 50, 0.4)';
        ctx.fillRect(x + 2, y + 45, 8, 10);
        ctx.fillRect(x + 30, y + 25, 6, 15);
        ctx.fillRect(x + 15, y + 55, 10, 5);
        
        // Shadow at base
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x - 3, y + h, w + 6, 8);
        
        // Sanity-based effects
        if (this.game.sanity < 60) {
            // Glowing red eyes
            ctx.fillStyle = '#ff4444';
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 3;
            ctx.fillRect(x + 16, y + 12, 3, 3);
            ctx.fillRect(x + 23, y + 12, 3, 3);
            ctx.shadowBlur = 0;
            
            // Dark aura around statue at very low sanity
            if (this.game.sanity < 30) {
                ctx.fillStyle = 'rgba(20, 0, 0, 0.2)';
                ctx.fillRect(x - 10, y - 5, w + 20, h + 15);
                
                // Moving shadow effects
                const time = this.game.time;
                const shadowOffset = Math.sin(time * 2) * 3;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(x + shadowOffset - 8, y + h + 5, w + 16, 6);
            }
        }
        
        // Inscription plaque at base (partially readable)
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(x + 8, y + h - 8, 24, 6);
        ctx.fillStyle = '#4a4a4a';
        ctx.font = '8px monospace';
        ctx.fillText('...watch...', x + 10, y + h - 3);
        
        ctx.restore();
    }
}
