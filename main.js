import testTexts from "./texts.js";
import TypingTest from "./TypingTest.js";

const containerElement = document.getElementById('text-display');
const textContainerP = containerElement.querySelector('p');
const inputElement = document.getElementById('typing-input');
const restartButton = document.getElementById('restart-button');
const modal = document.getElementById('modal');
const modalRestartButton = document.getElementById('modal-restart-button');

const statsElements = {
    wpm: document.getElementById('wpm-value'),
    errors: document.getElementById('error-value'),
    time: document.getElementById('time-value')
};

let typingTestInstance = null;
let currentText = '';

function getRandomText() {
    const index = Math.floor(Math.random() * testTexts.length);
    return testTexts[index];
}

function initializeTest() {
    currentText = getRandomText();
    
    // Create a fresh P element for the text display so TypingTest can populate spans inside it
    containerElement.innerHTML = '<p></p>';
    const freshTextDisplayP = containerElement.querySelector('p');
    
    // Clear the input and enable it
    inputElement.value = '';
    inputElement.disabled = false;
    inputElement.focus();
    
    // Reset stats display
    statsElements.wpm.textContent = 0;
    statsElements.errors.textContent = 0;
    statsElements.time.textContent = '0s';
    
    typingTestInstance = new TypingTest(currentText, freshTextDisplayP, inputElement, statsElements);

    // Override finishTest to trigger modal display
    const originalFinishTest = typingTestInstance.finishTest.bind(typingTestInstance);
    typingTestInstance.finishTest = () => {
        const results = originalFinishTest();
        showResults(results);
    };
}

function handleRestart() {
    modal.classList.add('hidden');
    initializeTest();
}

function showResults(results) {
    document.getElementById('final-wpm').textContent = results.wpm;
    document.getElementById('final-errors').textContent = results.errors;
    modal.classList.remove('hidden');
}


// Event Listeners
restartButton.addEventListener('click', handleRestart);
modalRestartButton.addEventListener('click', handleRestart);

// Initial setup
document.addEventListener('DOMContentLoaded', initializeTest);
