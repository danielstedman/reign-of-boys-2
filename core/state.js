/**
 * State.js - Central game state management
 */

// Main game state object
const GameState = {
    // Game configuration
    gameMode: null, // 'single', 'local', 'remote'
    playerFaction: null, // 'Crown', 'Horde', etc.
    opponentFaction: null,
    
    // Game phase tracking
    phase: 'menu', // 'menu', 'deployment', 'battle', 'end'
    currentPlayer: null,
    turn: 0,
    
    // Stalemate detection
    lastActionTurn: 0,
    actionsThisTurn: 0,
    
    // Unit tracking
    units: {
        Crown: [],
        Horde: []
    },
    
    // Points system for deployment
    points: {
        Crown: 1000,
        Horde: 1000
    },
    
    // Initialize game state
    init: function(gameMode, playerFaction, opponentFaction) {
        this.gameMode = gameMode;
        this.playerFaction = playerFaction;
        this.opponentFaction = opponentFaction;
        this.phase = 'deployment';
        this.currentPlayer = playerFaction;
        this.turn = 0;
        this.lastActionTurn = 0;
        this.actionsThisTurn = 0;
        
        // Reset units
        this.units = {
            Crown: [],
            Horde: []
        };
        
        // Reset points
        this.points = {
            Crown: 1000,
            Horde: 1000
        };
    },
    
    // Reset game state
    reset: function() {
        this.gameMode = null;
        this.playerFaction = null;
        this.opponentFaction = null;
        this.phase = 'menu';
        this.currentPlayer = null;
        this.turn = 0;
        this.lastActionTurn = 0;
        this.actionsThisTurn = 0;
        
        // Reset units
        this.units = {
            Crown: [],
            Horde: []
        };
        
        // Reset points
        this.points = {
            Crown: 1000,
            Horde: 1000
        };
    },
    
    // Switch current player
    switchPlayer: function() {
        this.currentPlayer = (this.currentPlayer === 'Crown') ? 'Horde' : 'Crown';
    },
    
    // Add unit to faction
    addUnit: function(faction, unit) {
        if (!this.units[faction]) {
            this.units[faction] = [];
        }
        
        this.units[faction].push(unit);
    },
    
    // Remove unit from faction
    removeUnit: function(faction, unit) {
        if (!this.units[faction]) {
            return false;
        }
        
        const index = this.units[faction].indexOf(unit);
        if (index !== -1) {
            this.units[faction].splice(index, 1);
            return true;
        }
        
        return false;
    },
    
    // Get all units (both factions)
    getAllUnits: function() {
        return [...this.units.Crown, ...this.units.Horde];
    },
    
    // Get all living units (both factions)
    getAllLivingUnits: function() {
        const allUnits = this.getAllUnits();
        return allUnits.filter(unit => unit.health > 0);
    },
    
    // Get living units for a specific faction
    getLivingFactionUnits: function(faction) {
        if (!this.units[faction]) {
            return [];
        }
        return this.units[faction].filter(unit => unit.health > 0);
    },
    
    // Check if a faction has any living units
    hasFactionLivingUnits: function(faction) {
        return this.getLivingFactionUnits(faction).length > 0;
    },
    
    // Record an action for stalemate detection
    recordAction: function(actionType) {
        this.lastActionTurn = this.turn;
        this.actionsThisTurn++;
        
        // Reset counter at the start of a new turn
        if (actionType === 'newTurn') {
            this.actionsThisTurn = 0;
        }
    },
    
    // Check for stalemate conditions
    checkStalemate: function() {
        // If no actions for 3 turns, it's a stalemate
        if (this.turn - this.lastActionTurn >= 3) {
            return true;
        }
        
        // If we've gone through all units and no one could act
        if (this.turn > 0 && this.actionsThisTurn === 0) {
            // Check if any unit can potentially move or attack
            const livingUnits = this.getAllLivingUnits();
            
            // If there are units from both factions but none can act, it's a stalemate
            const crownUnits = this.getLivingFactionUnits('Crown');
            const hordeUnits = this.getLivingFactionUnits('Horde');
            
            if (crownUnits.length > 0 && hordeUnits.length > 0) {
                // Check if any unit can potentially reach an enemy
                let canAct = false;
                
                for (const unit of livingUnits) {
                    const enemyFaction = unit.faction === 'Crown' ? 'Horde' : 'Crown';
                    const enemies = this.getLivingFactionUnits(enemyFaction);
                    
                    // If there's at least one enemy and this unit can potentially reach it
                    if (enemies.length > 0) {
                        canAct = true;
                        break;
                    }
                }
                
                if (!canAct) {
                    return true;
                }
            }
        }
        
        return false;
    },
    
    // Check for victory conditions
    checkVictory: function() {
        const crownHasUnits = this.hasFactionLivingUnits('Crown');
        const hordeHasUnits = this.hasFactionLivingUnits('Horde');
        
        // Check for victory by elimination
        if (!crownHasUnits && !hordeHasUnits) {
            return 'draw';
        } else if (!crownHasUnits) {
            return 'Horde';
        } else if (!hordeHasUnits) {
            return 'Crown';
        }
        
        // Check for stalemate
        if (this.checkStalemate()) {
            // In case of stalemate, the faction with more living units wins
            const crownUnits = this.getLivingFactionUnits('Crown').length;
            const hordeUnits = this.getLivingFactionUnits('Horde').length;
            
            if (crownUnits > hordeUnits) {
                return 'Crown';
            } else if (hordeUnits > crownUnits) {
                return 'Horde';
            } else {
                return 'draw';
            }
        }
        
        return null; // No winner yet
    }
};
