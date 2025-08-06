class UltimateHangman {
    constructor() {
        this.word = '';
        this.guessedWord = [];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.score = 0;
        this.gameActive = false;
        this.hints = 0;
        
        this.bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        this.faceParts = ['leftEye', 'rightEye', 'mouth'];
        
        this.wordList = [
            'JAVASCRIPT', 'PYTHON', 'COMPUTER', 'PROGRAMMING', 'ALGORITHM',
            'FUNCTION', 'VARIABLE', 'BOOLEAN', 'STRING', 'ARRAY',
            'OBJECT', 'METHOD', 'CLASS', 'INHERITANCE', 'POLYMORPHISM',
            'ENCAPSULATION', 'ABSTRACTION', 'FRAMEWORK', 'LIBRARY', 'DATABASE'
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createAlphabetGrid();
        this.bindEvents();
        this.updateDisplay();
    }
    
    createAlphabetGrid() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const alphabetGrid = document.getElementById('alphabetGrid');
        
        alphabetGrid.innerHTML = '';
        for (let letter of alphabet) {
            const btn = document.createElement('button');
            btn.className = 'alphabet-btn';
            btn.textContent = letter;
            btn.onclick = () => this.guessLetter(letter);
            alphabetGrid.appendChild(btn);
        }
    }
    
    bindEvents() {
        document.getElementById('submitWordBtn').onclick = () => this.submitWord();
        document.getElementById('randomWordBtn').onclick = () => this.useRandomWord();
        document.getElementById('makeGuessBtn').onclick = () => this.makeGuess();
        document.getElementById('resetButton').onclick = () => this.resetGame();
        document.getElementById('playAgainBtn').onclick = () => this.resetGame();
        document.getElementById('hintButton').onclick = () => this.getHint();
        
        // Enter key listeners
        document.getElementById('wordInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.submitWord();
        };
        
        document.getElementById('guessInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.makeGuess();
        };
        
        // Auto-uppercase and letter filtering
        document.getElementById('wordInput').oninput = (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        };
        
        document.getElementById('guessInput').oninput = (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
        };
    }
    
    submitWord() {
        const input = document.getElementById('wordInput').value.trim();
        if (input.length < 3) {
            this.showMessage('Word must be at least 3 letters long!', 'error');
            return;
        }
        
        this.startGame(input);
    }
    
    useRandomWord() {
        const randomWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        this.startGame(randomWord);
    }
    
    startGame(word) {
        this.word = word.toUpperCase();
        this.guessedWord = Array(this.word.length).fill('_');
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameActive = true;
        this.hints = Math.floor(this.word.length / 3); // Allow hints based on word length
        
        document.getElementById('wordSetup').style.display = 'none';
        document.getElementById('gamePlay').style.display = 'block';
        document.getElementById('hintButton').style.display = 'inline-block';
        
        this.updateDisplay();
        this.showMessage(`Game started! Word has ${this.word.length} letters.`, 'info');
    }
    
    guessLetter(letter) {
        if (!this.gameActive || this.guessedLetters.includes(letter)) return;
        
        this.guessedLetters.push(letter);
        const btn = [...document.querySelectorAll('.alphabet-btn')].find(b => b.textContent === letter);
        
        if (this.word.includes(letter)) {
            // Correct guess
            for (let i = 0; i < this.word.length; i++) {
                if (this.word[i] === letter) {
                    this.guessedWord[i] = letter;
                }
            }
            btn.className = 'alphabet-btn used correct';
            this.score += 10;
            this.playSound('correct');
            
            // Check for win
            if (!this.guessedWord.includes('_')) {
                this.gameWon();
                return;
            }
        } else {
            // Wrong guess
            btn.className = 'alphabet-btn used wrong';
            this.wrongGuesses++;
            this.drawBodyPart();
            this.playSound('wrong');
            
            // Check for game over
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                this.gameOver();
                return;
            }
        }
        
        this.updateDisplay();
    }
    
    makeGuess() {
        const input = document.getElementById('guessInput');
        const letter = input.value.trim();
        
        if (letter) {
            this.guessLetter(letter);
            input.value = '';
        }
    }
    
    drawBodyPart() {
        if (this.wrongGuesses <= this.bodyParts.length) {
            const part = document.getElementById(this.bodyParts[this.wrongGuesses - 1]);
            part.classList.add('show');
            
            // Add face parts for dramatic effect
            if (this.wrongGuesses === 1) {
                setTimeout(() => {
                    this.faceParts.forEach((facePart, index) => {
                        setTimeout(() => {
                            document.getElementById(facePart).classList.add('show');
                        }, index * 200);
                    });
                }, 300);
            }
        }
    }
    
    getHint() {
        if (this.hints <= 0) {
            this.showMessage('No hints remaining!', 'error');
            return;
        }
        
        const unguessedLetters = this.word.split('').filter(letter => 
            !this.guessedLetters.includes(letter) && letter !== ' '
        );
        
        if (unguessedLetters.length > 0) {
            const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            this.guessLetter(randomLetter);
            this.hints--;
            this.score -= 10;
            this.updateDisplay();
            this.showMessage(`Hint used! Letter: ${randomLetter}`, 'info');
        }
    }
    
    gameWon() {
        this.gameActive = false;
        this.score += 50 + (this.maxWrongGuesses - this.wrongGuesses) * 10; // Bonus for fewer wrong guesses
        
        this.showGameModal(`
            <div style="color: #2ecc71; font-size: 3rem; margin-bottom: 20px;">
                <i class="fas fa-trophy"></i>
            </div>
            <h2>🎉 CONGRATULATIONS! 🎉</h2>
            <p>You guessed the word: <strong>${this.word}</strong></p>
            <p>Final Score: <strong>${this.score}</strong></p>
            <p>Wrong Guesses: ${this.wrongGuesses}/${this.maxWrongGuesses}</p>
        `);
        
        this.playSound('victory');
        this.createConfetti();
    }
    
    gameOver() {
        this.gameActive = false;
        
        this.showGameModal(`
            <div style="color: #e74c3c; font-size: 3rem; margin-bottom: 20px;">
                <i class="fas fa-skull-crossbones"></i>
            </div>
            <h2>💀 GAME OVER 💀</h2>
            <p>The word was: <strong>${this.word}</strong></p>
            <p>Final Score: <strong>${this.score}</strong></p>
            <p>Better luck next time!</p>
        `);
        
        this.playSound('gameOver');
    }
    
    showGameModal(content) {
        document.getElementById('modalContent').innerHTML = content;
        document.getElementById('gameModal').style.display = 'block';
    }
    
    updateDisplay() {
        // Update word display
        const wordDisplay = document.getElementById('wordDisplay');
        wordDisplay.innerHTML = this.guessedWord.map(letter => 
            `<span class="letter-box">${letter}</span>`
        ).join('');
        
        // Update guessed letters
        const guessedContainer = document.getElementById('guessedLetters');
        guessedContainer.innerHTML = this.guessedLetters.map(letter => {
            const isCorrect = this.word.includes(letter);
            return `<span class="guessed-letter ${isCorrect ? 'correct' : 'wrong'}">${letter}</span>`;
        }).join('');
        
        // Update score and lives
        document.getElementById('score').textContent = this.score;
        document.getElementById('livesCount').textContent = this.maxWrongGuesses - this.wrongGuesses;
        
        // Update hint button
        const hintBtn = document.getElementById('hintButton');
        hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Hint (${this.hints}) (-10 points)`;
        hintBtn.disabled = this.hints <= 0;
    }
    
    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 3000);
    }
    
    playSound(type) {
        // Create audio context for sound effects
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let frequency, duration;
        switch (type) {
            case 'correct':
                frequency = 800;
                duration = 0.2;
                break;
            case 'wrong':
                frequency = 300;
                duration = 0.5;
                break;
            case 'victory':
                this.playVictorySound(audioContext);
                return;
            case 'gameOver':
                frequency = 150;
                duration = 1;
                break;
            default:
                return;
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playVictorySound(audioContext) {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        const noteDuration = 0.2;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + noteDuration);
            }, index * 150);
        });
    }
    
    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.transition = 'all 3s ease-out';
                
                confettiContainer.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.style.top = '100vh';
                    confetti.style.transform = `rotate(${Math.random() * 720 + 360}deg)`;
                }, 10);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
        
        setTimeout(() => {
            confettiContainer.remove();
        }, 4000);
    }
    
    resetGame() {
        // Hide modal
        document.getElementById('gameModal').style.display = 'none';
        
        // Reset game state
        this.word = '';
        this.guessedWord = [];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameActive = false;
        this.hints = 0;
        
        // Reset UI
        document.getElementById('wordSetup').style.display = 'block';
        document.getElementById('gamePlay').style.display = 'none';
        document.getElementById('resetButton').style.display = 'none';
        document.getElementById('hintButton').style.display = 'none';
        document.getElementById('wordInput').value = '';
        document.getElementById('guessInput').value = '';
        document.getElementById('message').textContent = '';
        document.getElementById('message').className = 'message';
        
        // Reset hangman drawing
        [...this.bodyParts, ...this.faceParts].forEach(part => {
            const element = document.getElementById(part);
            element.classList.remove('show');
        });
        
        // Reset alphabet grid
        this.createAlphabetGrid();
        this.updateDisplay();
        
        // Focus on word input
        document.getElementById('wordInput').focus();
    }
    
    // Keyboard support
    handleKeyPress(event) {
        if (!this.gameActive) return;
        
        const key = event.key.toUpperCase();
        if (key >= 'A' && key <= 'Z' && !this.guessedLetters.includes(key)) {
            this.guessLetter(key);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const game = new UltimateHangman();
    
    // Add keyboard support
    document.addEventListener('keydown', (event) => {
        game.handleKeyPress(event);
    });
    
    // Close modal when clicking outside
    document.getElementById('gameModal').addEventListener('click', function(event) {
        if (event.target === this) {
            game.resetGame();
        }
    });
    
    // Focus on word input initially
    document.getElementById('wordInput').focus();
});
