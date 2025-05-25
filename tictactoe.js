    let gameState = {
        currentPlayer: 1,
        board: Array(9).fill(null),
        playerEmojis: [[], []], 
        playerCategories: [null, null],
        gameWon: false,
        restrictedCells: [[], []], 
        scores: [0, 0], 
        roundsPlayed: 0,
        winStreak: [0, 0], 
        soundEnabled: true,
        winningCells: [] 
    };

    //emoji categories 
    const emojiCategories = {
        animals: {
            name: "🐾 Wild Animals",
            emojis: ["🦁", "🐯", "🐺", "🦊", "🐻", "🐼", "🐨", "🦘", "🦔", "🐸"]
        },
        food: {
            name: "🍕 Delicious Food",
            emojis: ["🍕", "🍟", "🍔", "🍩", "🍪", "🍰", "🧁", "🍭", "🍯", "🥨"]
        },
        sports: {
            name: "⚽ Epic Sports", 
            emojis: ["⚽", "🏀", "🏈", "🎾", "🏐", "🏓", "🏸", "🥎", "🏒", "🥍"]
        },
        nature: {
            name: "🌿 Beautiful Nature",
            emojis: ["🌸", "🌺", "🌻", "🌷", "🌹", "🌿", "🍀", "🌲", "🌵", "🌾"]
        },
        space: {
            name: "🚀 Cosmic Adventure",
            emojis: ["🚀", "🛸", "⭐", "🌟", "💫", "🌙", "☄️", "🪐", "🛰️", "👽"]
        },
        gems: {
            name: "💎 Precious Treasures",
            emojis: ["💎", "💍", "👑", "🔮", "💰", "🏆", "⚡", "✨", "🌟", "💫"]
        },
        ocean: {
            name: "🌊 Ocean Depths",
            emojis: ["🐠", "🐟", "🦈", "🐙", "🦀", "🐚", "🌊", "🏖️", "⛵", "🏝️"]
        },
        magic: {
            name: "🔮 Mystical Magic",
            emojis: ["🔮", "✨", "🪄", "🧙", "🦄", "🐉", "🧚", "🍄", "⚡", "🌙"]
        }
    };

    // Audio synthesis for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playSound(type) {
        if (!gameState.soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'place':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'vanish':
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'win':
                // Epic win sound sequence
                [0, 0.1, 0.2, 0.3, 0.4].forEach((delay, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    const freq = [523, 659, 784, 1047, 1319][i]; // C, E, G, C, E
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + delay);
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.3);
                    
                    osc.start(audioContext.currentTime + delay);
                    osc.stop(audioContext.currentTime + delay + 0.3);
                });
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
        }
    }

    function toggleSound() {
        gameState.soundEnabled = !gameState.soundEnabled;
        document.getElementById('sound-toggle').textContent = gameState.soundEnabled ? '🔊' : '🔇';
        
        if (gameState.soundEnabled) {
            // Resume audio context if needed
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            playSound('place'); // Test sound
        }
    }

    // Particle system for celebrations
    function createParticles(emoji, count = 20) {
        const particlesContainer = document.getElementById('particles');
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particlesContainer.contains(particle)) {
                    particlesContainer.removeChild(particle);
                }
            }, 4000);
        }
    }

    // Initialize setup screen
    function initSetup() {
        const player1Grid = document.getElementById('player1-categories');
        const player2Grid = document.getElementById('player2-categories');
        
        [player1Grid, player2Grid].forEach((grid, playerIndex) => {
            grid.innerHTML = '';
            Object.keys(emojiCategories).forEach(categoryKey => {
                const category = emojiCategories[categoryKey];
                const btn = document.createElement('button');
                btn.className = 'category-btn';
                btn.innerHTML = `
                    <div style="font-size: 1.8rem; margin-bottom: 8px;">
                        ${category.emojis.slice(0, 3).join(' ')}
                    </div>
                    <div>${category.name}</div>
                `;
                btn.onclick = () => selectCategory(playerIndex, categoryKey);
                grid.appendChild(btn);
            });
        });
    }

    function selectCategory(playerIndex, categoryKey) {
        gameState.playerCategories[playerIndex] = categoryKey;
        
        // Update visual selection
        const grid = document.getElementById(`player${playerIndex + 1}-categories`);
        grid.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.category-btn').classList.add('selected');
        
        // Play selection sound
        playSound('place');
    }

    function startGame() {
        if (!gameState.playerCategories[0] || !gameState.playerCategories[1]) {
            alert('Both players must select categories! 🎯');
            playSound('error');
            return;
        }
        
        if (gameState.playerCategories[0] === gameState.playerCategories[1]) {
            alert('Players must choose different categories! 🔄');
            playSound('error');
            return;
        }
        
        document.getElementById('setup-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('score-board').style.display = 'flex';
        
        initGameBoard();
        updateDisplay();
        updateScoreBoard();
        
        // Welcome sound
        playSound('place');
    }

    function initGameBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.onclick = () => makeMove(i);
            board.appendChild(cell);
        }
    }

    function getRandomEmoji(playerIndex) {
        const category = emojiCategories[gameState.playerCategories[playerIndex]];
        const randomIndex = Math.floor(Math.random() * category.emojis.length);
        return category.emojis[randomIndex];
    }

    function makeMove(cellIndex) {
        if (gameState.gameWon || gameState.board[cellIndex] !== null) return;
        
        const playerIndex = gameState.currentPlayer - 1;
        const emoji = getRandomEmoji(playerIndex);
        
        // Check if this is the 4th emoji and if cell is restricted
        if (gameState.playerEmojis[playerIndex].length === 3 && 
            gameState.restrictedCells[playerIndex].includes(cellIndex)) {
            // Visual feedback for invalid move
            const cell = document.getElementById('game-board').children[cellIndex];
            cell.classList.add('restricted');
            playSound('error');
            setTimeout(() => {
                cell.classList.remove('restricted');
            }, 500);
            return;
        }
        
        // Handle vanishing emoji logic
        if (gameState.playerEmojis[playerIndex].length === 3) {
            const oldestEmojiIndex = gameState.playerEmojis[playerIndex].shift();
            gameState.board[oldestEmojiIndex] = null;
            
            // Add visual vanishing effect
            const oldCell = document.getElementById('game-board').children[oldestEmojiIndex];
            oldCell.classList.add('vanishing');
            playSound('vanish');
            
            setTimeout(() => {
                oldCell.textContent = '';
                oldCell.classList.remove('vanishing');
            }, 800);
            
            // Update restricted cells
            gameState.restrictedCells[playerIndex] = [oldestEmojiIndex];
        }
        
        // Place new emoji
        gameState.board[cellIndex] = {
            player: gameState.currentPlayer,
            emoji: emoji
        };
        gameState.playerEmojis[playerIndex].push(cellIndex);
        
        // Visual placing effect
        const cell = document.getElementById('game-board').children[cellIndex];
        cell.classList.add('placing');
        cell.textContent = emoji;
        playSound('place');
        
        setTimeout(() => {
            cell.classList.remove('placing');
        }, 600);
        
        // Check for win
        if (checkWin()) {
            gameState.gameWon = true;
            gameState.scores[playerIndex]++;
            gameState.roundsPlayed++;
            gameState.winStreak[playerIndex]++;
            gameState.winStreak[1 - playerIndex] = 0; // Reset opponent's streak
            
            highlightWinningCells();
            showWinMessage();
            updateScoreBoard();
            
            // Create celebration particles
            const winnerCategory = emojiCategories[gameState.playerCategories[playerIndex]];
            const celebrationEmoji = winnerCategory.emojis[Math.floor(Math.random() * winnerCategory.emojis.length)];
            createParticles(celebrationEmoji, 30);
            createParticles('🎉', 15);
            createParticles('✨', 20);
            
            playSound('win');
            return;
        }
        
        // Switch players
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateDisplay();
    }

    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState.board[a] && 
                gameState.board[b] && 
                gameState.board[c] &&
                gameState.board[a].player === gameState.board[b].player &&
                gameState.board[b].player === gameState.board[c].player) {
                gameState.winningCells = pattern;
                return true;
            }
        }
        return false;
    }

    function highlightWinningCells() {
        gameState.winningCells.forEach(cellIndex => {
            const cell = document.getElementById('game-board').children[cellIndex];
            cell.classList.add('winning');
        });
    }

    function showWinMessage() {
        const winMsg = document.getElementById('win-message');
        const playerIndex = gameState.currentPlayer - 1;
        const streak = gameState.winStreak[playerIndex];
        
        let message = `🎉 Player ${gameState.currentPlayer} Wins! 🎉`;
        if (streak > 1) {
            message += `<br><small>🔥 ${streak} Win Streak! 🔥</small>`;
        }
        
        winMsg.innerHTML = message;
        winMsg.style.display = 'block';
    }

    function updateDisplay() {
        // Update player info
        [1, 2].forEach(player => {
            const playerIndex = player - 1;
            const info = document.getElementById(`player${player}-info`);
            const emojiDisplay = document.getElementById(`player${player}-emoji`);
            const countDisplay = document.getElementById(`player${player}-count`);
            const comboIndicator = document.getElementById(`player${player}-combo`);
            const streakIndicator = document.getElementById(`player${player}-streak`);
            
            // Show current player
            info.classList.toggle('active', gameState.currentPlayer === player && !gameState.gameWon);
            
            // Show next emoji
            if (gameState.playerCategories[playerIndex]) {
                emojiDisplay.textContent = getRandomEmoji(playerIndex);
            }
            
            // Show emoji count
            const count = gameState.playerEmojis[playerIndex].length;
            countDisplay.textContent = `Emojis: ${count}/3`;
            
            // Show combo indicator when player has 2 emojis
            comboIndicator.classList.toggle('active', count >= 2 && !gameState.gameWon);
            
            // Show win streak
            const streak = gameState.winStreak[playerIndex];
            if (streak > 0) {
                streakIndicator.textContent = `🔥 Win Streak: ${streak}`;
                streakIndicator.classList.add('active');
            } else {
                streakIndicator.classList.remove('active');
            }
        });
    }

    function updateScoreBoard() {
        document.getElementById('player1-score').querySelector('.score-value').textContent = gameState.scores[0];
        document.getElementById('player2-score').querySelector('.score-value').textContent = gameState.scores[1];
        document.getElementById('rounds-played').querySelector('.score-value').textContent = gameState.roundsPlayed;
        
        // Highlight winner
        document.getElementById('player1-score').classList.remove('winner');
        document.getElementById('player2-score').classList.remove('winner');
        
        if (gameState.gameWon) {
            const winnerScore = document.getElementById(`player${gameState.currentPlayer}-score`);
            winnerScore.classList.add('winner');
        }
    }

    function playAgain() {
        // Reset game state but keep scores
        gameState.currentPlayer = 1;
        gameState.board = Array(9).fill(null);
        gameState.playerEmojis = [[], []];
        gameState.gameWon = false;
        gameState.restrictedCells = [[], []];
        gameState.winningCells = [];
        
        // Clear board visually
        const cells = document.getElementById('game-board').children;
        for (let cell of cells) {
            cell.textContent = '';
            cell.classList.remove('winning', 'vanishing', 'placing', 'restricted');
        }
        
        document.getElementById('win-message').style.display = 'none';
        updateDisplay();
        playSound('place');
    }

    function resetGame() {
        // Full reset
        gameState = {
            currentPlayer: 1,
            board: Array(9).fill(null),
            playerEmojis: [[], []],
            playerCategories: [null, null],
            gameWon: false,
            restrictedCells: [[], []],
            scores: [0, 0],
            roundsPlayed: 0,
            winStreak: [0, 0],
            soundEnabled: gameState.soundEnabled,
            winningCells: []
        };
        
        document.getElementById('win-message').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('score-board').style.display = 'none';
        document.getElementById('setup-screen').style.display = 'block';
        
        initSetup();
        playSound('place');
    }

    function toggleHelp() {
        const helpSection = document.getElementById('help-section');
        helpSection.classList.toggle('active');
    }

    // Initialize the game
    initSetup();
    
    // Handle audio context for mobile
    document.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });