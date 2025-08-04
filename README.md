# The Pale Harbor
*A 2D Psychological Horror Game*

## Overview
The Pale Harbor is a psychological horror game set in a fog-shrouded coastal town. You play as a lighthouse keeper investigating the mysterious disappearance of the previous keeper. As you explore the town and uncover its dark secrets, your grip on reality slowly deteriorates.

## Story
You arrive at the remote Pale Harbor to take over lighthouse duties after the previous keeper vanished without a trace. The lighthouse beacon hasn't been seen for three days, and the town is eerily quiet. As you investigate, you'll discover that something sinister lurks in the fog-covered harbor, and your own sanity becomes as much an enemy as any supernatural threat.

## Features

### Core Gameplay
- **Top-down 2D exploration** with atmospheric pixel art style
- **Psychological horror mechanics** that affect gameplay based on your sanity
- **Day/night cycle** that influences the intensity of supernatural events
- **Interactive dialogue system** with typewriter effects and sanity-based text distortions
- **Inventory management** for collecting and using key items
- **Environmental storytelling** through discoverable notes and journals

### Horror Elements
- **Dynamic sanity system** that affects visual and audio presentation
- **Atmospheric effects** including fog, lighting, and weather
- **Hallucinations and false realities** at low sanity levels
- **Disturbing visual distortions** that increase with psychological stress
- **Ambient horror audio** generated procedurally
- **Time-based events** with increased supernatural activity during night hours

### Technical Features
- **HTML5 Canvas rendering** for smooth 2D graphics
- **Web Audio API** for dynamic sound generation
- **Responsive controls** with keyboard input
- **Modular code structure** for easy expansion and modification

## Controls

### Movement
- **WASD** or **Arrow Keys**: Move player character
- **Shift + Movement**: Run (consumes stamina, avoid overuse)

### Interaction
- **E**: Interact with objects, doors, and items
- **Space**: Advance dialogue and conversations
- **I**: Toggle inventory display (currently shows in sidebar)

### Item Usage
Items in The Pale Harbor are used **automatically** when you interact with objects that require them:

- **Keys**: Automatically used when interacting with locked doors
- **Lantern**: Automatically used when exploring dark areas like wells
- **Books/Journals**: Provide knowledge that unlocks new interactions
- **Tools**: Automatically applied when interacting with compatible objects

**How it works:**
1. Collect items by interacting with them (press **E**)
2. Approach objects that might need those items
3. Press **E** to interact - if you have the required item, it will be used automatically
4. Some items (like journals) provide knowledge rather than being "consumed"

### Tips for Survival
- **Monitor your sanity**: Low sanity triggers hallucinations and makes the game more difficult
- **Explore during daylight**: Supernatural activity increases at night
- **Read everything**: Notes and journals provide crucial story information
- **Use items wisely**: Some items can restore sanity or provide safety
- **Don't trust everything you see**: At low sanity, hallucinations may appear real

## Game World

### Locations
- **Lighthouse Entrance**: Your starting point and home base
- **Lighthouse Interior**: The mysterious lighthouse with secrets to uncover
- **Harbor Docks**: Weathered docks where strange items wash ashore
- **Town Square**: The empty heart of Pale Harbor with disturbing monuments
- **Additional areas**: Unlocked through story progression

### Key Items
- **Lighthouse Key**: Automatically unlocks the lighthouse door when you interact with it
- **Keeper's Journal**: Found on the dock - unlocks access to the bookshop and provides story context
- **Old Lantern**: Found behind the lighthouse - automatically used when exploring dark areas like the ancient well
- **Cursed Tome**: Found in the bookshop (requires Keeper's Journal first) - provides knowledge needed for lighthouse stairs and well exploration
- **Ship's Log**: Found in the sailboat - provides additional story context
- **Final Entry**: Found at the keeper's desk inside the lighthouse - required for accessing the lighthouse lens
- **Lighthouse Lens**: The ultimate goal - found at the top of the lighthouse (requires Final Entry and Cursed Tome)

**Collection Order Guide:**
1. Start by collecting the **Keeper's Journal** from the dock
2. Find the **Lighthouse Key** hidden in the town square (near coordinates 1180, 690)
3. Get the **Old Lantern** from behind the lighthouse
4. Search the **sailboat** for the Ship's Log
5. Use the journal to access the **bookshop** and get the Cursed Tome
6. Use the key to enter the **lighthouse** and search the keeper's desk
7. Use your knowledge to climb the stairs and claim the **lighthouse lens**

## Sanity System

Your sanity is represented by a blue bar in the upper left. Sanity affects:

### High Sanity (70-100%)
- Clear vision and normal dialogue
- Minimal supernatural interference
- Standard movement speed and controls

### Medium Sanity (30-70%)
- Occasional visual distortions
- Subtle text effects in dialogue
- Slight movement speed reduction
- Periodic unsettling effects

### Low Sanity (0-30%)
- Severe visual hallucinations
- Disturbing dialogue distortions
- Significantly impaired movement
- Frequent horror effects and false realities
- Shadow figures and phantom sounds

### Sanity Loss Triggers
- Supernatural encounters
- Reading disturbing content
- Nighttime exploration
- Interacting with mysterious objects
- Witnessing unexplainable events

### Sanity Recovery
- Finding useful items
- Completing objectives
- Staying in well-lit areas
- Daytime exploration

## Development Information

### Architecture
The game is built with a modular JavaScript architecture:

- **game.js**: Main game engine and state management
- **player.js**: Player character logic and movement
- **world.js**: Environment, collision detection, and world objects
- **dialogue.js**: Text system with typewriter effects and sanity-based modifications
- **horror-effects.js**: Psychological horror effects and atmospheric systems
- **entities.js**: NPCs, creatures, and interactive objects

### Customization
The game is designed to be easily modifiable:

- **Add new locations**: Modify the `maps` object in `world.js`
- **Create new items**: Add entries to interactables in `world.js`
- **Expand dialogue**: Extend the dialogue system with new conversation trees
- **Add horror effects**: Create new effects in the `horror-effects.js` system
- **Modify mechanics**: Adjust sanity loss/gain rates and triggers

### Performance
- Optimized canvas rendering with selective updates
- Efficient collision detection using bounding boxes
- Dynamic loading of effects to maintain smooth framerate
- Scalable architecture for adding content without performance loss

## Browser Compatibility
- **Modern browsers** with HTML5 Canvas and Web Audio API support
- **Tested on**: Chrome, Firefox, Safari, Edge
- **Minimum requirements**: ES6 JavaScript support

## Getting Started
1. Open `index.html` in a modern web browser
2. Use WASD or arrow keys to move
3. Press E to interact with highlighted objects
4. Follow the story through dialogue and exploration
5. Monitor your sanity and survive the night

## Expansion Ideas
The game is designed for easy expansion with:
- Additional story chapters and locations
- New types of supernatural encounters
- Expanded inventory and crafting systems
- Multiple endings based on player choices
- Save/load functionality
- More complex puzzle mechanics

---

*Enter the Pale Harbor... if you dare.*
