/**
 * Board.js - Game board generation and management
 */

const Board = {
    // Board configuration
    config: {
        size: 16,
        cellSize: 32
    },
    
    // Board state
    cells: [],
    
    // Initialize the game board
    init: function() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        this.cells = [];
        
        // Create the 16x16 grid
        for (let y = 0; y < this.config.size; y++) {
            const row = [];
            
            for (let x = 0; x < this.config.size; x++) {
                // Create cell element
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Set terrain type (will be more sophisticated in the future)
                this.setRandomTerrain(cell);
                
                // Mark deployable cells
                // Crown (Player 1) deploys in bottom half
                if (y >= this.config.size / 2) {
                    cell.classList.add('deployable');
                    cell.dataset.faction = 'Crown';
                    
                    // Add click event for deployment
                    cell.addEventListener('click', function() {
                        if (GameState.phase === 'deployment' && 
                            GameState.currentPlayer === 'Crown') {
                            Deploy.placeUnit(x, y);
                        }
                    });
                }
                // Horde (Player 2 / AI) deploys in top half
                else {
                    cell.dataset.faction = 'Horde';
                    
                    // For local 2-player, add click event
                    if (GameState.gameMode === 'local') {
                        cell.classList.add('deployable');
                        cell.addEventListener('click', function() {
                            if (GameState.phase === 'deployment' && 
                                GameState.currentPlayer === 'Horde') {
                                Deploy.placeUnit(x, y);
                            }
                        });
                    }
                }
                
                // Add cell to the board
                boardElement.appendChild(cell);
                row.push({
                    element: cell,
                    x: x,
                    y: y,
                    terrain: cell.dataset.terrain,
                    unit: null
                });
            }
            
            this.cells.push(row);
        }
        
        // Initialize renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.init();
        }
    },
    
    // Set random terrain type for a cell
    setRandomTerrain: function(cell) {
        const terrainTypes = ['grass', 'dark-grass', 'water', 'forest', 'mountain', 'castle'];
        const weights = [0.4, 0.3, 0.1, 0.1, 0.05, 0.05]; // Probability weights
        
        // Simple weighted random selection
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < terrainTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                const terrainType = terrainTypes[i];
                cell.classList.add(terrainType);
                cell.dataset.terrain = terrainType;
                
                // Use renderer for terrain if available
                if (typeof Renderer !== 'undefined') {
                    Renderer.renderTerrain(cell, terrainType);
                }
                break;
            }
        }
    },
    
    // Place a unit on the board
    placeUnit: function(x, y, unit) {
        const cell = this.getCell(x, y);
        
        if (!cell || cell.unit) {
            return false;
        }
        
        // Store unit reference
        cell.unit = unit;
        unit.x = x;
        unit.y = y;
        
        // Use renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.renderUnit(unit, cell.element);
        } else {
            // Fallback to basic rendering
            const unitElement = document.createElement('div');
            unitElement.className = `unit ${unit.faction.toLowerCase()}`;
            unitElement.textContent = unit.icon || unit.type[0];
            
            // Add health bar
            const healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            healthBar.style.width = `${(unit.health / unit.maxHealth) * 100}%`;
            unitElement.appendChild(healthBar);
            
            // Add unit to cell
            cell.element.appendChild(unitElement);
        }
        
        return true;
    },
    
    // Remove a unit from the board
    removeUnit: function(x, y) {
        const cell = this.getCell(x, y);
        
        if (!cell || !cell.unit) {
            return false;
        }
        
        // Remove unit element
        const unitElement = cell.element.querySelector('.unit');
        if (unitElement) {
            cell.element.removeChild(unitElement);
        }
        
        // Clear unit reference
        cell.unit = null;
        
        return true;
    },
    
    // Update unit display (e.g., after taking damage)
    updateUnit: function(x, y) {
        const cell = this.getCell(x, y);
        
        if (!cell || !cell.unit) {
            return false;
        }
        
        // Use renderer if available
        if (typeof Renderer !== 'undefined') {
            Renderer.renderUnit(cell.unit, cell.element);
        } else {
            // Fallback to basic health bar update
            const healthBar = cell.element.querySelector('.health-bar');
            if (healthBar) {
                healthBar.style.width = `${(cell.unit.health / cell.unit.maxHealth) * 100}%`;
            }
        }
        
        return true;
    },
    
    // Get cell at coordinates
    getCell: function(x, y) {
        if (x < 0 || x >= this.config.size || y < 0 || y >= this.config.size) {
            return null;
        }
        
        return this.cells[y][x];
    },
    
    // Clear the board
    clear: function() {
        this.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.unit) {
                    this.removeUnit(cell.x, cell.y);
                }
            });
        });
    }
};
