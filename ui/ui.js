/**
 * UI.js - DOM manipulation helpers and UI management
 */

// UI Management
const UI = {
    // Screen management
    screens: {
        welcome: document.getElementById('welcome-screen'),
        gameBoard: document.getElementById('game-board-screen')
    },
    
    // Show a specific screen and hide others
    showScreen: function(screenId) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        this.screens[screenId].classList.add('active');
    },
    
    // Battle log management
    battleLog: {
        container: document.getElementById('battle-log'),
        
        // Add entry to battle log with optional styling
        addEntry: function(text, type = 'normal') {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            entry.innerHTML = text;
            this.container.appendChild(entry);
            this.container.scrollTop = this.container.scrollHeight;
            
            // Apply visual effects based on entry type
            switch(type) {
                case 'kill':
                    entry.style.color = '#ff3333';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #ff3333';
                    break;
                case 'critical':
                    entry.style.color = '#ffcc00';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #ffcc00';
                    break;
                case 'highlight':
                    entry.style.color = '#33ccff';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #33ccff';
                    break;
                case 'spell':
                    entry.style.color = '#cc33ff';
                    entry.style.fontWeight = 'bold';
                    entry.style.borderLeft = '3px solid #cc33ff';
                    break;
                default:
                    entry.style.borderLeft = '3px solid #666';
            }
            
            // Add a subtle animation for new entries
            entry.style.animation = 'fadeIn 0.3s ease-in-out';
        },
        
        // Clear the battle log
        clear: function() {
            this.container.innerHTML = '';
        }
    },
    
    // Unit roster management
    unitRoster: {
        container: document.getElementById('unit-roster'),
        
        // Update the unit roster display
        update: function(units) {
            this.container.innerHTML = '';
            
            if (!units || units.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.textContent = 'No units deployed';
                this.container.appendChild(emptyMsg);
                return;
            }
            
            units.forEach(unit => {
                const unitElement = document.createElement('div');
                unitElement.className = 'roster-unit';
                unitElement.innerHTML = `
                    <div class="unit-icon ${unit.faction.toLowerCase()}">${unit.icon || unit.type[0]}</div>
                    <div class="unit-info">
                        <div class="unit-name">${unit.type}</div>
                        <div class="unit-stats">HP: ${unit.health}/${unit.maxHealth} | ATK: ${unit.attack}</div>
                    </div>
                `;
                this.container.appendChild(unitElement);
            });
        }
    },
    
    // Initialize welcome screen animations
    initWelcomeAnimations: function() {
        const animationArea = document.querySelector('.animation-area');
        
        // Create blood drip animations
        for (let i = 0; i < 10; i++) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = `${Math.random() * 100}%`;
            drip.style.animationDelay = `${Math.random() * 3}s`;
            animationArea.appendChild(drip);
        }
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize welcome screen
    UI.showScreen('welcome');
    UI.initWelcomeAnimations();
    
    // NOTE: All button event listeners are now centralized in controls.js
    // No button event listeners should be registered here to avoid conflicts
});
