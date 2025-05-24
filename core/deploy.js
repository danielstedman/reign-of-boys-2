/**
 * Deploy.js - Handles unit deployment phase
 */

const Deploy = {
    // Current selected unit type for deployment
    selectedUnitType: null,
    
    // Initialize the deployment phase
    initDeploymentPhase: function() {
        GameState.phase = 'deployment';
        
        // Set current player
        GameState.currentPlayer = 'Crown';
        
        // Update UI to show deployment phase
        document.getElementById('end-deployment').textContent = 'End Deployment';
        
        // Clear any existing units
        Board.clear();
        
        // Initialize unit selection UI
        this.initUnitSelectionUI();
        
        // Add initial message to battle log
        UI.battleLog.clear();
        UI.battleLog.addEntry(`<strong>Deployment Phase</strong>: ${GameState.currentPlayer} is deploying units.`);
        UI.battleLog.addEntry(`You have ${GameState.points[GameState.currentPlayer]} points to spend.`);
    },
    
    // Initialize unit selection UI
    initUnitSelectionUI: function() {
        const unitRoster = document.getElementById('unit-roster');
        unitRoster.innerHTML = '<h4>Select Units to Deploy</h4>';
        
        // Get units for current faction
        const factionUnits = Units.getUnitsByFaction(GameState.currentPlayer);
        
        // Create unit selection buttons
        factionUnits.forEach(unitType => {
            const unitButton = document.createElement('div');
            unitButton.className = 'unit-selection';
            unitButton.innerHTML = `
                <div class="unit-icon ${GameState.currentPlayer.toLowerCase()}">${unitType.icon || unitType.type[0]}</div>
                <div class="unit-info">
                    <div class="unit-name">${unitType.type}</div>
                    <div class="unit-cost">Cost: ${unitType.cost} pts</div>
                    <div class="unit-stats">HP: ${unitType.health} | ATK: ${unitType.attack}</div>
                </div>
            `;
            
            // Add click event to select unit
            unitButton.addEventListener('click', () => {
                this.selectUnitType(unitType);
                
                // Highlight selected unit
                document.querySelectorAll('.unit-selection').forEach(el => {
                    el.classList.remove('selected');
                });
                unitButton.classList.add('selected');
            });
            
            unitRoster.appendChild(unitButton);
        });
    },
    
    // Select a unit type for deployment
    selectUnitType: function(unitType) {
        this.selectedUnitType = unitType;
        
        // Update battle log
        UI.battleLog.addEntry(`Selected ${unitType.type} for deployment (Cost: ${unitType.cost} pts)`);
    },
    
    // Place a unit on the board
    placeUnit: function(x, y) {
        // Check if a unit type is selected
        if (!this.selectedUnitType) {
            UI.battleLog.addEntry('Select a unit type first!', 'error');
            return false;
        }
        
        // Check if player has enough points
        if (GameState.points[GameState.currentPlayer] < this.selectedUnitType.cost) {
            UI.battleLog.addEntry(`Not enough points! You need ${this.selectedUnitType.cost} but have ${GameState.points[GameState.currentPlayer]}.`, 'error');
            return false;
        }
        
        // Create the unit
        const unit = Units.createUnit(
            this.selectedUnitType.type,
            GameState.currentPlayer,
            x, y
        );
        
        // Place unit on board
        if (Board.placeUnit(x, y, unit)) {
            // Deduct points
            GameState.points[GameState.currentPlayer] -= this.selectedUnitType.cost;
            
            // Add unit to game state
            GameState.addUnit(GameState.currentPlayer, unit);
            
            // Update battle log
            UI.battleLog.addEntry(`Deployed ${unit.type} at position (${x}, ${y}). ${GameState.points[GameState.currentPlayer]} points remaining.`);
            
            return true;
        }
        
        return false;
    },
    
    // End deployment phase for current player
    endDeployment: function() {
        console.log("Deploy.endDeployment called. Current game mode:", GameState.gameMode, "Current player:", GameState.currentPlayer);
        
        if (GameState.gameMode === 'local') {
            // Switch to other player for local 2-player
            if (GameState.currentPlayer === 'Crown') {
                console.log("Local 2-player: Switching to Horde player for deployment");
                GameState.currentPlayer = 'Horde';
                UI.battleLog.addEntry(`<strong>Deployment Phase</strong>: ${GameState.currentPlayer} is deploying units.`);
                UI.battleLog.addEntry(`You have ${GameState.points[GameState.currentPlayer]} points to spend.`);
                
                // Update unit selection UI for new faction
                this.initUnitSelectionUI();
            } else {
                console.log("Local 2-player: Both players deployed, starting battle phase");
                // Both players have deployed, start battle
                GameState.phase = 'battle';
                Battle.startBattle();
            }
        } else {
            console.log("Single player: AI deploying units");
            // For single player, AI deploys units
            this.aiDeploy();
            
            console.log("Single player: Starting battle phase");
            // Start battle
            GameState.phase = 'battle';
            Battle.startBattle();
        }
    },
    
    // AI deployment for single player mode
    aiDeploy: function() {
        GameState.currentPlayer = 'Horde';
        UI.battleLog.addEntry(`<strong>AI Deployment</strong>: ${GameState.currentPlayer} is deploying units.`);
        
        // Get units for AI faction
        const factionUnits = Units.getUnitsByFaction(GameState.currentPlayer);
        
        // Simple AI deployment strategy
        let pointsRemaining = GameState.points[GameState.currentPlayer];
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        
        while (pointsRemaining > 0 && attempts < maxAttempts) {
            // Select random unit type weighted by cost
            const unitType = this.selectRandomUnitType(factionUnits, pointsRemaining);
            
            if (!unitType) break;
            
            // Select random position in top half of board
            const x = Math.floor(Math.random() * Board.config.size);
            const y = Math.floor(Math.random() * (Board.config.size / 2));
            
            // Create and place unit
            const unit = Units.createUnit(
                unitType.type,
                GameState.currentPlayer,
                x, y
            );
            
            if (Board.placeUnit(x, y, unit)) {
                // Deduct points
                pointsRemaining -= unitType.cost;
                GameState.points[GameState.currentPlayer] = pointsRemaining;
                
                // Add unit to game state
                GameState.addUnit(GameState.currentPlayer, unit);
                
                UI.battleLog.addEntry(`AI deployed ${unit.type} at position (${x}, ${y}).`);
            }
            
            attempts++;
        }
        
        UI.battleLog.addEntry(`AI deployment complete. ${pointsRemaining} points remaining.`);
        GameState.currentPlayer = 'Crown'; // Switch back to player
    },
    
    // Select random unit type weighted by cost
    selectRandomUnitType: function(unitTypes, maxCost) {
        // Filter units by cost
        const affordableUnits = unitTypes.filter(unit => unit.cost <= maxCost);
        
        if (affordableUnits.length === 0) {
            return null;
        }
        
        // Simple random selection
        return affordableUnits[Math.floor(Math.random() * affordableUnits.length)];
    }
};
