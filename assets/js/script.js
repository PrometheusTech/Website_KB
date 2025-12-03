// ============ SEARCH FUNCTIONALITY ============

const searchIcon = document.getElementById('searchIcon');
const searchBox = document.getElementById('searchBox');
const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.getElementById('suggestions');
const searchResultMessage = document.getElementById('searchResultMessage');
const wordCounter = document.querySelector('.word-counter');

// Extract all text from the page for searching
function getPageText() {
    const bodyText = document.body.innerText;
    return bodyText;
}

// Get unique words from page
function getPageWords() {
    const pageText = getPageText();
    const words = pageText.match(/\b\w+\b/g) || [];
    return [...new Set(words.map(w => w.toLowerCase()))].sort();
}

// Check if word exists as complete word in page
function wordExistsInPage(word) {
    const pageText = getPageText().toLowerCase();
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`);
    return regex.test(pageText);
}

// Toggle search box
searchIcon.addEventListener('click', function(e) {
    e.stopPropagation();
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
        searchInput.focus();
    }
});

// Close search box when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.header__search')) {
        searchBox.classList.remove('active');
        suggestionsContainer.classList.remove('active');
        searchResultMessage.classList.remove('active');
    }
});

// Search input listener
searchInput.addEventListener('input', function() {
    const searchText = this.value.trim();
    
    // Update word counter
    wordCounter.textContent = `${searchText.length}/50`;
    
    // Limit to 50 characters
    if (searchText.length > 50) {
        this.value = searchText.substring(0, 50);
        wordCounter.textContent = '50/50';
    }
    
    searchResultMessage.classList.remove('active');
    
    if (searchText.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }
    
    // Get suggestions
    const pageWords = getPageWords();
    const suggestions = pageWords.filter(word => 
        word.startsWith(searchText.toLowerCase())
    ).slice(0, 3);
    
    // Show suggestions
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</div>`
        ).join('');
        suggestionsContainer.classList.add('active');
        
        // Add click listeners to suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                searchInput.value = this.dataset.suggestion;
                wordCounter.textContent = `${this.dataset.suggestion.length}/50`;
                suggestionsContainer.classList.remove('active');
                performSearch(this.dataset.suggestion);
            });
        });
    } else {
        suggestionsContainer.classList.remove('active');
    }
});

// Search on Enter key
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch(this.value.trim());
    }
});

// Perform search function
function performSearch(searchTerm) {
    if (!searchTerm) return;
    
    clearHighlights();
    suggestionsContainer.classList.remove('active');
    
    // Check if the complete word(s) exist in the page
    if (wordExistsInPage(searchTerm)) {
        // Find and highlight the word
        highlightWord(searchTerm);
        scrollToFirstHighlight();
        searchResultMessage.classList.remove('active');
    } else {
        // Show no result message
        searchResultMessage.innerHTML = 'No result found. Try looking it in our Collection in the "More" Section!';
        searchResultMessage.classList.add('active');
    }
}

// Highlight word in page
function highlightWord(word) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let hasHighlighted = false;
    
    function highlightNode(node) {
        if (node.nodeType === 3) { // Text node
            const text = node.textContent;
            if (new RegExp(`\\b${word}\\b`, 'i').test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(new RegExp(`\\b${word}\\b`, 'g'), `<span class="search-highlight">$&</span>`);
                node.parentNode.replaceChild(span, node);
                hasHighlighted = true;
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'HEAD') {
            for (let i = 0; i < node.childNodes.length; i++) {
                highlightNode(node.childNodes[i]);
            }
        }
    }
    
    highlightNode(document.body);
    return hasHighlighted;
}

// Clear highlights
function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        while (highlight.firstChild) {
            parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
    });
    document.body.normalize();
}

// Scroll to first highlight
function scrollToFirstHighlight() {
    setTimeout(function() {
        const firstHighlight = document.querySelector('.search-highlight');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// ============ CONTACT FORM VALIDATION ============

const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const messageCounter = document.querySelector('.message-counter');
const successModal = document.getElementById('successModal');
const confirmBtn = document.getElementById('confirmBtn');

let isModalOpen = false;

// Message counter
contactMessage.addEventListener('input', function() {
    messageCounter.textContent = `${this.value.length}/5000`;
    
    if (this.value.length > 5000) {
        this.value = this.value.substring(0, 5000);
        messageCounter.textContent = '5000/5000';
    }
});

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form submission
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = contactName.value.trim();
    const email = contactEmail.value.trim();
    const message = contactMessage.value.trim();
    
    // Validation
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    if (message.length > 5000) {
        alert('Message exceeds 5000 words limit');
        return;
    }
    
    // Show success modal
    showSuccessModal();
});

// Show success modal
function showSuccessModal() {
    isModalOpen = true;
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Hide success modal
function hideSuccessModal() {
    isModalOpen = false;
    successModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Allow scrolling
    
    // Reset form
    contactForm.reset();
    messageCounter.textContent = '0/5000';
}

// Confirm button
confirmBtn.addEventListener('click', function() {
    hideSuccessModal();
});

// Prevent scrolling when modal is open
document.addEventListener('scroll', function() {
    if (isModalOpen) {
        window.scrollTo(0, window.lastScrollPosition);
    }
}, true);

document.addEventListener('scroll', function() {
    if (!isModalOpen) {
        window.lastScrollPosition = window.scrollY;
    }
}, true);
