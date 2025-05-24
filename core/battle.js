/**
 * Battle.js - Battle simulation logic
 */

const Battle = {
    // Battle configuration
    turnOrder: [],
    currentUnitIndex: 0,
    
    // Pacing configuration - adjusted for better comprehension
    pacing: {
        movementDelay: 50,       // Very fast for routine movement
        combatDelay: 300,        // Slower for combat actions to follow battle log
        criticalEventDelay: 500, // Longer pause for dramatic events
        turnTransitionDelay: 80  // Quick transition between turns
    },
    
    // Battle statistics
    stats: {
        turns: 0,
        damageDealt: { Crown: 0, Horde: 0 },
        unitsKilled: { Crown: 0, Horde: 0 },
        criticalHits: { Crown: 0, Horde: 0 },
        movesExecuted: { Crown: 0, Horde: 0 }
    },
    
    // Stalemate tracking
    actionTaken: false,
    
    // Start the battle phase
    startBattle: function() {
        console.log("Battle.startBattle called. Starting battle phase.");
        
        // Update UI
        document.getElementById('end-deployment').textContent = 'Next Turn';
        
        // Set game phase
        GameState.phase = 'battle';
        GameState.turn = 1;
        
        // Reset battle statistics
        this.resetStats();
        
        // Clear battle log and add battle start message
        UI.battleLog.clear();
        UI.battleLog.addEntry('<strong>Battle Phase Begins!</strong>', 'highlight');
        
        // Determine turn order (all units from both factions)
        this.determineTurnOrder();
        
        // Start first turn
        this.executeTurn();
    },
    
    // Reset battle statistics
    resetStats: function() {
        this.stats = {
            turns: 0,
            damageDealt: { Crown: 0, Horde: 0 },
            unitsKilled: { Crown: 0, Horde: 0 },
            criticalHits: { Crown: 0, Horde: 0 },
            movesExecuted: { Crown: 0, Horde: 0 }
        };
        this.actionTaken = false;
    },
    
    // Determine turn order based on unit speed
    determineTurnOrder: function() {
        // Get all living units
        const allUnits = GameState.getAllLivingUnits();
        
        // Sort by move speed (higher goes first)
        this.turnOrder = allUnits.sort((a, b) => b.moveSpeed - a.moveSpeed);
        this.currentUnitIndex = 0;
    },
    
    // Execute a single turn
    executeTurn: function() {
        // Check for victory or stalemate
        const victor = GameState.checkVictory();
        if (victor) {
            this.endBattle(victor);
            return;
        }
        
        // Rebuild turn order to remove dead units
        if (this.currentUnitIndex === 0) {
            this.determineTurnOrder();
            
            // If no units left after rebuilding turn order, check victory again
            if (this.turnOrder.length === 0) {
                const victor = GameState.checkVictory();
                if (victor) {
                    this.endBattle(victor);
                } else {
                    // This should not happen, but just in case
                    this.endBattle('draw');
                }
                return;
            }
            
            // New turn started
            GameState.recordAction('newTurn');
        }
        
        // Get current unit
        const unit = this.turnOrder[this.currentUnitIndex];
        
        // Skip dead units (should not happen after rebuilding turn order, but just in case)
        if (!unit || unit.health <= 0) {
            this.nextUnit();
            return;
        }
        
        // Log turn
        UI.battleLog.addEntry(`${unit.faction}'s ${unit.type} is taking action...`);
        
        // Execute AI for unit with appropriate pacing
        setTimeout(() => {
            this.executeUnitAI(unit);
        }, this.pacing.turnTransitionDelay);
    },
    
    // Move to next unit in turn order
    nextUnit: function() {
        this.currentUnitIndex = (this.currentUnitIndex + 1) % this.turnOrder.length;
        
        // If we've gone through all units, start a new turn
        if (this.currentUnitIndex === 0) {
            GameState.turn++;
            this.stats.turns++;
            
            // Check if any actions were taken this turn
            if (!this.actionTaken) {
                // No actions taken this turn, might be a stalemate
                console.log("No actions taken this turn, checking for stalemate");
            }
            
            // Reset action flag for new turn
            this.actionTaken = false;
            
            UI.battleLog.addEntry(`<strong>Turn ${GameState.turn} begins!</strong>`, 'highlight');
        }
        
        // Execute next turn with a slight delay
        setTimeout(() => {
            this.executeTurn();
        }, this.pacing.turnTransitionDelay);
    },
    
    // Execute AI for a unit
    executeUnitAI: function(unit) {
        // Find target
        const target = this.findTarget(unit);
        
        if (target) {
            // Check if target is in range
            const distance = this.calculateDistance(unit, target);
            
            if (distance <= unit.range) {
                // Attack target
                this.executeAttack(unit, target);
                this.actionTaken = true;
                GameState.recordAction('attack');
            } else {
                // Move toward target
                const moved = this.moveTowardTarget(unit, target);
                if (moved) {
                    this.actionTaken = true;
                    GameState.recordAction('move');
                }
            }
        } else {
            UI.battleLog.addEntry(`${unit.faction}'s ${unit.type} has no targets in sight.`);
            // Move to next unit after a short delay
            setTimeout(() => {
                this.nextUnit();
            }, this.pacing.movementDelay);
        }
    },
    
    // Find closest enemy unit
    findTarget: function(unit) {
        // Get enemy faction
        const enemyFaction = (unit.faction === 'Crown') ? 'Horde' : 'Crown';
        
        // Get living enemy units
        const enemyUnits = GameState.getLivingFactionUnits(enemyFaction);
        
        if (enemyUnits.length === 0) {
            return null;
        }
        
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemyUnits.forEach(enemy => {
            const distance = this.calculateDistance(unit, enemy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    },
    
    // Calculate distance between two units
    calculateDistance: function(unitA, unitB) {
        const dx = Math.abs(unitA.x - unitB.x);
        const dy = Math.abs(unitA.y - unitB.y);
        return dx + dy; // Manhattan distance
    },
    
    // Execute attack between units
    executeAttack: function(attacker, defender) {
        // Calculate damage (with some randomness)
        const baseDamage = attacker.attack;
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        const damage = Math.floor(baseDamage * randomFactor);
        
        // Check for critical hit (15% chance)
        const isCritical = Math.random() < 0.15;
        const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;
        
        // Update statistics
        this.stats.damageDealt[attacker.faction] += finalDamage;
        if (isCritical) {
            this.stats.criticalHits[attacker.faction]++;
        }
        
        // Apply damage
        const killed = defender.takeDamage(finalDamage);
        
        // Update defender display
        Board.updateUnit(defender.x, defender.y);
        
        // Use renderer for attack effect if available
        if (typeof Renderer !== 'undefined') {
            const effectType = attacker.type.includes('Mage') || attacker.type.includes('Wizard') ? 'magic' : 'arrow';
            Renderer.renderAttackEffect(attacker, defender, effectType);
        }
        
        // Log attack with appropriate formatting
        if (killed) {
            // Update kill statistics
            this.stats.unitsKilled[attacker.faction]++;
            
            // Death event - use bold red text and longer pause
            UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} attacks ${defender.faction}'s ${defender.type} for ${finalDamage} damage and <strong style="color: red;">KILLS</strong> it!`, 'kill');
            
            // Remove unit from board
            Board.removeUnit(defender.x, defender.y);
            
            // Check for hero promotion (10% chance on kill)
            if (!attacker.isHero && Math.random() < 0.1) {
                // Hero promotion - use longer pause
                setTimeout(() => {
                    attacker.promoteToHero();
                    Board.updateUnit(attacker.x, attacker.y);
                    UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} has been promoted to <strong>HERO</strong> status!`, 'highlight');
                    
                    // Move to next unit after a longer delay for dramatic effect
                    setTimeout(() => {
                        this.nextUnit();
                    }, this.pacing.criticalEventDelay);
                }, this.pacing.combatDelay);
            } else {
                // Move to next unit after a longer delay for death event
                setTimeout(() => {
                    this.nextUnit();
                }, this.pacing.criticalEventDelay);
            }
        } else if (isCritical) {
            // Critical hit - use bold text and medium pause
            UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} lands a <strong>CRITICAL HIT</strong> on ${defender.faction}'s ${defender.type} for ${finalDamage} damage! ${defender.health}/${defender.maxHealth} HP remaining.`, 'critical');
            
            // Move to next unit after a medium delay for critical hit
            setTimeout(() => {
                this.nextUnit();
            }, this.pacing.combatDelay);
        } else {
            // Normal attack - use normal text and standard combat delay
            UI.battleLog.addEntry(`${attacker.faction}'s ${attacker.type} attacks ${defender.faction}'s ${defender.type} for ${finalDamage} damage. ${defender.health}/${defender.maxHealth} HP remaining.`);
            
            // Move to next unit after standard combat delay
            setTimeout(() => {
                this.nextUnit();
            }, this.pacing.combatDelay);
        }
    },
    
    // Move unit toward target
    moveTowardTarget: function(unit, target) {
        // Calculate direction
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        
        // Determine move direction (prioritize larger difference)
        let newX = unit.x;
        let newY = unit.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Move horizontally
            newX = unit.x + (dx > 0 ? 1 : -1);
        } else {
            // Move vertically
            newY = unit.y + (dy > 0 ? 1 : -1);
        }
        
        // Check if new position is valid
        const cell = Board.getCell(newX, newY);
        if (cell && !cell.unit) {
            // Update move statistics
            this.stats.movesExecuted[unit.faction]++;
            
            // Remove unit from current position
            Board.removeUnit(unit.x, unit.y);
            
            // Update unit position
            unit.x = newX;
            unit.y = newY;
            
            // Place unit at new position
            Board.placeUnit(newX, newY, unit);
            
            UI.battleLog.addEntry(`${unit.faction}'s ${unit.type} moves to position (${newX}, ${newY}).`);
            
            // Move to next unit after a shorter delay for movement
            setTimeout(() => {
                this.nextUnit();
            }, this.pacing.movementDelay);
            
            return true;
        } else {
            UI.battleLog.addEntry(`${unit.faction}'s ${unit.type} cannot move to position (${newX}, ${newY}).`);
            
            // Move to next unit after a shorter delay for failed movement
            setTimeout(() => {
                this.nextUnit();
            }, this.pacing.movementDelay);
            
            return false;
        }
    },
    
    // End the battle
    endBattle: function(victor) {
        GameState.phase = 'end';
        
        if (victor === 'draw') {
            UI.battleLog.addEntry('<strong>Battle ends in a draw! Both sides have been annihilated.</strong>', 'highlight');
        } else if (victor === 'stalemate') {
            UI.battleLog.addEntry('<strong>Battle ends in a stalemate! Neither side can defeat the other.</strong>', 'highlight');
            victor = this.determineWinnerByStrength();
        } else {
            UI.battleLog.addEntry(`<strong>${victor} is victorious!</strong>`, 'highlight');
        }
        
        // Show victory screen
        this.showVictoryScreen(victor);
        
        // Update UI
        document.getElementById('end-deployment').textContent = 'New Game';
    },
    
    // Determine winner by remaining strength in case of stalemate
    determineWinnerByStrength: function() {
        const crownUnits = GameState.getLivingFactionUnits('Crown');
        const hordeUnits = GameState.getLivingFactionUnits('Horde');
        
        if (crownUnits.length > hordeUnits.length) {
            return 'Crown';
        } else if (hordeUnits.length > crownUnits.length) {
            return 'Horde';
        } else {
            // If equal number of units, compare total health
            const crownHealth = crownUnits.reduce((total, unit) => total + unit.health, 0);
            const hordeHealth = hordeUnits.reduce((total, unit) => total + unit.health, 0);
            
            if (crownHealth > hordeHealth) {
                return 'Crown';
            } else if (hordeHealth > crownHealth) {
                return 'Horde';
            } else {
                return 'draw';
            }
        }
    },
    
    // Show victory screen with battle statistics
    showVictoryScreen: function(victor) {
        // Create victory screen overlay
        const victoryScreen = document.createElement('div');
        victoryScreen.className = 'victory-screen';
        victoryScreen.innerHTML = `
            <div class="victory-content">
                <h1 class="victory-title">${victor === 'draw' ? 'MUTUAL DESTRUCTION' : victor.toUpperCase() + ' VICTORY'}</h1>
                <div class="victory-subtitle">${victor === 'draw' ? 'Both sides have been annihilated!' : victor + ' has conquered the battlefield!'}</div>
                
                <div class="battle-stats">
                    <h2>Battle Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-row">
                            <div class="stat-label">Turns:</div>
                            <div class="stat-value">${this.stats.turns}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Damage Dealt:</div>
                            <div class="stat-value crown">${this.stats.damageDealt.Crown}</div>
                            <div class="stat-value horde">${this.stats.damageDealt.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Units Killed:</div>
                            <div class="stat-value crown">${this.stats.unitsKilled.Crown}</div>
                            <div class="stat-value horde">${this.stats.unitsKilled.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Critical Hits:</div>
                            <div class="stat-value crown">${this.stats.criticalHits.Crown}</div>
                            <div class="stat-value horde">${this.stats.criticalHits.Horde}</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Moves Executed:</div>
                            <div class="stat-value crown">${this.stats.movesExecuted.Crown}</div>
                            <div class="stat-value horde">${this.stats.movesExecuted.Horde}</div>
                        </div>
                    </div>
                </div>
                
                <button id="close-victory" class="pixel-button">Continue</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(victoryScreen);
        
        // Add event listener to close button
        document.getElementById('close-victory').addEventListener('click', function() {
            document.body.removeChild(victoryScreen);
        });
    }
};
