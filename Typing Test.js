class TypingTest {
    constructor(targetText, textDisplayElement, inputElement, statsElements) {
        this.targetText = targetText;
        this.textDisplayElement = textDisplayElement;
        this.inputElement = inputElement;
        this.stats = {
            wpm: statsElements.wpm,
            errors: statsElements.errors,
            time: statsElements.time
        };

        this.timer = null;
        this.startTime = 0;
        this.running = false;
        this.errorCount = 0;
        this.characterIndex = 0;

        this.setupTextDisplay();
        this.inputElement.addEventListener('input', this.handleInput.bind(this));
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    setupTextDisplay() {
        this.textDisplayElement.innerHTML = '';
        this.targetText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.id = `char-${index}`;
            this.textDisplayElement.appendChild(span);
        });
        this.updateTextHighlighting();
    }

    startTest() {
        if (this.running) return;
        this.running = true;
        this.startTime = Date.now();
        this.timer = setInterval(this.updateTimer.bind(this), 1000);
        this.inputElement.disabled = false;
        this.inputElement.focus();
    }

    finishTest() {
        if (!this.running) return;
        this.running = false;
        clearInterval(this.timer);
        this.inputElement.disabled = true;

        // Calculate final WPM based on gross WPM (5 characters per word)
        const totalTimeMinutes = (Date.now() - this.startTime) / 60000;
        const totalTypedCharacters = this.targetText.length;
        const grossWPM = (totalTypedCharacters / 5) / totalTimeMinutes;

        this.updateStats(grossWPM, this.errorCount, totalTimeMinutes * 60);

        // Show results modal (handled in main.js, we emit an event/return results)
        return {
            wpm: Math.round(grossWPM),
            errors: this.errorCount
        };
    }

    updateTimer() {
        const currentTime = Date.now();
        const elapsedTimeSeconds = Math.floor((currentTime - this.startTime) / 1000);

        // Calculate WPM mid-test
        const totalTimeMinutes = (currentTime - this.startTime) / 60000;
        let currentWPM = 0;
        if (totalTimeMinutes >= 0.1) { // Calculate WPM only after a short period
            const typedCharacters = this.characterIndex;
            currentWPM = Math.round((typedCharacters / 5) / totalTimeMinutes);
        }

        this.updateStats(currentWPM, this.errorCount, elapsedTimeSeconds);
    }

    updateStats(wpm, errors, seconds) {
        this.stats.wpm.textContent = wpm >= 0 ? wpm : 0;
        this.stats.errors.textContent = errors;
        this.stats.time.textContent = `${Math.floor(seconds)}s`;
    }

    handleInput(event) {
        if (!this.running) {
            this.startTest();
        }

        const typedText = event.target.value;
        this.characterIndex = typedText.length;

        // Check for completion
        if (typedText.length >= this.targetText.length) {
            this.inputElement.value = this.targetText; // Ensure full text is displayed
            this.updateTextHighlighting();
            const results = this.finishTest();

            // To notify main.js about completion, we can use a custom event or callback.
            // Since main.js overrides finishTest, it will handle the UI update.
            return;
        }

        this.validateInput(typedText);
        this.updateTextHighlighting();
    }

    handleKeyDown(event) {
        // We rely on the input event for validation and state updates. 
        // No special keydown handling is needed unless specific key behaviors need adjustment (like spacebar handling, etc.)
    }

    validateInput(typedText) {
        let newErrorCount = 0;

        // Only count errors up to the current length of typed text
        for (let i = 0; i < typedText.length; i++) {
            const targetChar = this.targetText[i];
            const typedChar = typedText[i];

            if (typedChar !== targetChar) {
                newErrorCount++;
            }
        }

        this.errorCount = newErrorCount;
        this.stats.errors.textContent = this.errorCount;
    }

    updateTextHighlighting() {
        const typedText = this.inputElement.value;
        const currentLength = typedText.length;

        for (let i = 0; i < this.targetText.length; i++) {
            const span = document.getElementById(`char-${i}`);

            // Safety check for spans that might not exist if text loading failed
            if (!span) continue; 

            span.className = '';

            if (i === currentLength && this.running) {
                // Current position marker (cursor)
                span.classList.add('current');
            } else if (i < currentLength) {
                // Typed characters
                const targetChar = this.targetText[i];
                const typedChar = typedText[i];

                if (typedChar === targetChar) {
                    span.classList.add('correct');
                } else {
                    span.classList.add('incorrect');
                }
            }
            // Characters not yet reached remain unstyled
        }

        // If the test is finished, ensure no character remains highlighted as 'current'
        if (!this.running && currentLength >= this.targetText.length) {
             const currentSpan = document.querySelector('.current');
             if (currentSpan) currentSpan.classList.remove('current');
        }
    }

    reset() {
        clearInterval(this.timer);
        this.running = false;
        this.startTime = 0;
        this.errorCount = 0;
        this.characterIndex = 0;

        this.inputElement.value = '';
        this.inputElement.disabled = false;
        this.inputElement.focus();

        this.updateStats(0, 0, 0);
        this.setupTextDisplay();
    }
}

export default TypingTest;
