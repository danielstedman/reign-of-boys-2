/**
 * Renderer.js - Handles rendering units, terrain, and effects with pixel art
 */

const Renderer = {
    // Asset paths
    assetPaths: {
        units: {
            Crown: {
                'Knight': 'assets/units/crown/knight.png',
                'Archer': 'assets/units/crown/archer.png',
                'Mage': 'assets/units/crown/wizard.png',
                'Paladin': 'assets/units/crown/paladin.png',
                'Scout': 'assets/units/crown/scout.png',
                'Royal Guard': 'assets/units/crown/militia.png',
                'Battlemage': 'assets/units/crown/wizard.png',
                'Cleric': 'assets/units/crown/cleric.png',
                'Cavalier': 'assets/units/crown/cavalry.png'
            },
            Horde: {
                'Berserker': 'assets/units/horde/berserker.png',
                'Shaman': 'assets/units/horde/shaman.png',
                'Grunt': 'assets/units/horde/orc.png',
                'Warg Rider': 'assets/units/horde/wolfrider.png',
                'Troll': 'assets/units/horde/troll.png',
                'Headhunter': 'assets/units/horde/goblin.png',
                'War Chief': 'assets/units/horde/bloodboy.png',
                'Witch Doctor': 'assets/units/horde/shaman.png',
                'Ogre': 'assets/units/horde/ogre.png'
            }
        },
        terrain: {
            'grass': 'assets/terrain/dirt_ne.png',
            'dark-grass': 'assets/terrain/dirt_ne.png',
            'water': 'assets/terrain/sand.png',
            'forest': 'assets/terrain/dirt_ne.png',
            'mountain': 'assets/terrain/dirt_ne.png',
            'castle': 'assets/terrain/dirt_ne.png'
        },
        effects: {
            'arrow': 'assets/effects/arrow0.png',
            'fireball': 'assets/effects/fireball.png',
            'magic': 'assets/effects/blueblast.png'
        }
    },
    
    // Asset cache
    assetCache: {},
    
    // Initialize renderer
    init: function() {
        // Preload assets
        this.preloadAssets();
    },
    
    // Preload assets
    preloadAssets: function() {
        // Preload unit sprites
        for (const faction in this.assetPaths.units) {
            for (const unitType in this.assetPaths.units[faction]) {
                const path = this.assetPaths.units[faction][unitType];
                this.loadImage(path);
            }
        }
        
        // Preload terrain sprites
        for (const terrainType in this.assetPaths.terrain) {
            const path = this.assetPaths.terrain[terrainType];
            this.loadImage(path);
        }
        
        // Preload effect sprites
        for (const effectType in this.assetPaths.effects) {
            const path = this.assetPaths.effects[effectType];
            this.loadImage(path);
        }
    },
    
    // Load image and cache it
    loadImage: function(path) {
        if (!this.assetCache[path]) {
            const img = new Image();
            img.onload = () => {
                console.log(`Successfully loaded asset: ${path}`);
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${path}`);
            };
            img.src = path;
            this.assetCache[path] = img;
            
            // Log loading
            console.log(`Loading asset: ${path}`);
        }
        return this.assetCache[path];
    },
    
    // Get health bar color based on health percentage
    getHealthBarColor: function(healthPercent) {
        if (healthPercent > 0.7) {
            return '#44cc44'; // Green for healthy (>70%)
        } else if (healthPercent > 0.3) {
            return '#cccc44'; // Yellow for damaged (30-70%)
        } else {
            return '#cc4444'; // Red for critical (<30%)
        }
    },
    
    // Render unit
    renderUnit: function(unit, cell) {
        // Clear any existing content
        cell.innerHTML = '';
        
        // Create unit container
        const unitElement = document.createElement('div');
        unitElement.className = `unit ${unit.faction.toLowerCase()}`;
        
        // Create sprite element
        const sprite = document.createElement('div');
        sprite.className = 'unit-sprite';
        
        // Get sprite path
        let spritePath = null;
        if (this.assetPaths.units[unit.faction] && this.assetPaths.units[unit.faction][unit.type]) {
            spritePath = this.assetPaths.units[unit.faction][unit.type];
        }
        
        if (spritePath) {
            // Set background image
            sprite.style.backgroundImage = `url('${spritePath}')`;
            console.log(`Setting sprite for ${unit.type}: ${spritePath}`);
        } else {
            // Fallback to text
            sprite.textContent = unit.icon || unit.type[0];
            console.warn(`No sprite found for ${unit.type}, using text fallback`);
        }
        
        // Add sprite to unit element
        unitElement.appendChild(sprite);
        
        // Create health bar container (positioned at bottom)
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'health-bar-container';
        healthBarContainer.style.position = 'absolute';
        healthBarContainer.style.bottom = '0';
        healthBarContainer.style.left = '0';
        healthBarContainer.style.width = '100%';
        healthBarContainer.style.height = '4px';
        healthBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        healthBarContainer.style.zIndex = '5';
        
        // Calculate health percentage
        const healthPercent = unit.health / unit.maxHealth;
        
        // Create health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.style.width = `${healthPercent * 100}%`;
        healthBar.style.height = '100%';
        healthBar.style.backgroundColor = this.getHealthBarColor(healthPercent);
        
        // Add health bar to container
        healthBarContainer.appendChild(healthBar);
        
        // Add health bar container to unit element
        unitElement.appendChild(healthBarContainer);
        
        // Add unit element to cell
        cell.appendChild(unitElement);
        
        // Add hero indicator if applicable
        if (unit.isHero) {
            const heroIndicator = document.createElement('div');
            heroIndicator.className = 'hero-indicator';
            heroIndicator.textContent = '★';
            heroIndicator.style.position = 'absolute';
            heroIndicator.style.top = '0';
            heroIndicator.style.right = '0';
            heroIndicator.style.color = '#ffcc00';
            heroIndicator.style.textShadow = '0 0 2px #000';
            heroIndicator.style.fontSize = '12px';
            heroIndicator.style.zIndex = '10';
            unitElement.appendChild(heroIndicator);
        }
    },
    
    // Render terrain
    renderTerrain: function(cell, terrainType) {
        // Set terrain class
        cell.className = `cell ${terrainType}`;
        
        // Get terrain sprite path
        const spritePath = this.assetPaths.terrain[terrainType];
        
        if (spritePath) {
            // Set background image
            cell.style.backgroundImage = `url('${spritePath}')`;
            cell.style.backgroundSize = 'cover';
        }
    },
    
    // Render attack effect
    renderAttackEffect: function(attacker, defender, type = 'arrow') {
        // Create effect element
        const effect = document.createElement('div');
        effect.className = 'attack-effect';
        
        // Get effect sprite path
        const spritePath = this.assetPaths.effects[type];
        
        if (spritePath) {
            // Set background image
            effect.style.backgroundImage = `url('${spritePath}')`;
            effect.style.backgroundSize = 'contain';
            effect.style.backgroundPosition = 'center';
            effect.style.backgroundRepeat = 'no-repeat';
        }
        
        // Calculate start and end positions
        const attackerCell = document.querySelector(`.cell[data-x="${attacker.x}"][data-y="${attacker.y}"]`);
        const defenderCell = document.querySelector(`.cell[data-x="${defender.x}"][data-y="${defender.y}"]`);
        
        if (attackerCell && defenderCell) {
            const attackerRect = attackerCell.getBoundingClientRect();
            const defenderRect = defenderCell.getBoundingClientRect();
            
            const startX = attackerRect.left + attackerRect.width / 2;
            const startY = attackerRect.top + attackerRect.height / 2;
            const endX = defenderRect.left + defenderRect.width / 2;
            const endY = defenderRect.top + defenderRect.height / 2;
            
            // Position effect
            effect.style.position = 'absolute';
            effect.style.left = `${startX}px`;
            effect.style.top = `${startY}px`;
            effect.style.width = '20px';
            effect.style.height = '20px';
            effect.style.zIndex = '1000';
            
            // Add to document
            document.body.appendChild(effect);
            
            // Animate effect
            const duration = 500; // ms
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                
                effect.style.left = `${currentX}px`;
                effect.style.top = `${currentY}px`;
                
                // Calculate angle for rotation
                const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                effect.style.transform = `rotate(${angle}deg)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Remove effect after animation
                    setTimeout(() => {
                        document.body.removeChild(effect);
                    }, 100);
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
};
