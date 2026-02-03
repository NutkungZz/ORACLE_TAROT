// App State
let shuffledDeck = [];
let selectedCards = [];
let selectedIndices = new Set();

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const selectionScreen = document.getElementById('selection-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const continueBtn = document.getElementById('continue-btn');
const newReadingBtn = document.getElementById('new-reading-btn');
const cardDeck = document.getElementById('card-deck');
const selectedCountSpan = document.getElementById('selected-count');
const cardsRemainingSpan = document.getElementById('cards-remaining');
const readingText = document.getElementById('reading-text');
const copyBtn = document.getElementById('copy-btn');
const copyStatus = document.getElementById('copy-status');

// Utility Functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function randomOrientation() {
    return Math.random() < 0.5 ? 'upright' : 'reversed';
}

// Initialize and shuffle deck
function initializeDeck() {
    shuffledDeck = shuffleArray(tarotCards);
    selectedCards = [];
    selectedIndices.clear();
    selectedCountSpan.textContent = '0';
    cardsRemainingSpan.textContent = '10';
    continueBtn.disabled = true;
}

// Render card backs for selection
function renderCardDeck() {
    cardDeck.innerHTML = '';

    // Create 78 card backs
    for (let i = 0; i < shuffledDeck.length; i++) {
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.dataset.index = i;

        cardBack.addEventListener('click', () => selectCard(i, cardBack));

        cardDeck.appendChild(cardBack);
    }
}

// Handle card selection
function selectCard(index, element) {
    if (selectedIndices.has(index) || selectedCards.length >= 10) {
        return;
    }

    // Add card to selected list with random orientation
    const card = shuffledDeck[index];
    const orientation = randomOrientation();

    selectedCards.push({
        card: card,
        orientation: orientation
    });

    selectedIndices.add(index);
    element.classList.add('selected');

    // Update UI
    const count = selectedCards.length;
    selectedCountSpan.textContent = count;
    cardsRemainingSpan.textContent = 10 - count;

    // Enable continue button when 10 cards selected
    if (count === 10) {
        continueBtn.disabled = false;
    }
}

// Generate reading text for Claude
function generateReadingText() {
    let text = "CELTIC CROSS TAROT READING\n";
    text += "=" + "=".repeat(50) + "\n\n";
    text += "Please interpret this Celtic Cross spread:\n\n";

    selectedCards.forEach((item, index) => {
        const position = celticCrossPositions[index];
        const card = item.card;
        const orientation = item.orientation;
        const meaning = orientation === 'upright' ? card.upright : card.reversed;

        text += `Position ${position.position}: ${position.name}\n`;
        text += `Card: ${card.name} (${card.suit})\n`;
        text += `Orientation: ${orientation.toUpperCase()}\n`;
        text += `Keywords: ${meaning}\n`;
        text += `Context: ${position.description}\n`;
        text += "-".repeat(50) + "\n\n";
    });

    text += "=" + "=".repeat(50) + "\n";
    text += "Please provide a comprehensive interpretation of this Celtic Cross reading,\n";
    text += "considering the positions, card meanings, and their relationships to each other.\n";
    text += "Focus on the story the cards tell together and practical guidance.\n";

    return text;
}

// Display results in Celtic Cross layout
function displayResults() {
    // Populate visual layout
    selectedCards.forEach((item, index) => {
        const position = index + 1;
        const cardElement = document.querySelector(`.card-pos-${position}`);

        if (cardElement) {
            const orientation = item.orientation;
            const orientationClass = orientation === 'reversed' ? 'reversed' : '';
            const rotationStyle = orientation === 'reversed' ? 'transform: rotate(180deg);' : '';

            cardElement.innerHTML = `
                <div class="card-image-container">
                    <img src="${item.card.image}" alt="${item.card.name}" class="card-image" style="${rotationStyle}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div class="card-image-fallback" style="display: none;">
                        <div class="card-name">${item.card.name}</div>
                    </div>
                </div>
                <div class="card-info">
                    <div class="card-name-small">${item.card.name}</div>
                    <div class="orientation ${orientationClass}">${orientation.toUpperCase()}</div>
                    <div class="position-name">${celticCrossPositions[index].name}</div>
                </div>
            `;
        }
    });

    // Generate and display text for copying
    const readingTextContent = generateReadingText();
    readingText.value = readingTextContent;

    showScreen(resultsScreen);
}

// Copy to clipboard
function copyToClipboard() {
    readingText.select();
    readingText.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(readingText.value)
        .then(() => {
            copyStatus.textContent = '✓ Copied to clipboard! Paste this to Claude for your interpretation.';
            setTimeout(() => {
                copyStatus.textContent = '';
            }, 3000);
        })
        .catch(err => {
            // Fallback for older browsers
            try {
                document.execCommand('copy');
                copyStatus.textContent = '✓ Copied to clipboard! Paste this to Claude for your interpretation.';
                setTimeout(() => {
                    copyStatus.textContent = '';
                }, 3000);
            } catch (e) {
                copyStatus.textContent = '✗ Failed to copy. Please select and copy manually.';
            }
        });
}

// Reset for new reading
function startNewReading() {
    initializeDeck();
    renderCardDeck();
    showScreen(selectionScreen);
}

// Event Listeners
startBtn.addEventListener('click', () => {
    initializeDeck();
    renderCardDeck();
    showScreen(selectionScreen);
});

continueBtn.addEventListener('click', displayResults);

copyBtn.addEventListener('click', copyToClipboard);

newReadingBtn.addEventListener('click', startNewReading);

// Initialize app
console.log('Oracle Tarot initialized with', tarotCards.length, 'cards');
