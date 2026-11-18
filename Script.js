const searchTrigger = document.getElementById('search-trigger');
const searchOverlay = document.getElementById('search-overlay');
const closeSearch = document.getElementById('close-search');
const searchInput = document.getElementById('search-input');

// 1. Toggle visibility when clicking 'Search'
searchTrigger.addEventListener('click', (e) => {
    e.preventDefault(); 
    searchOverlay.classList.toggle('search-overlay-active');
    
    if (searchOverlay.classList.contains('search-overlay-active')) {
        searchInput.focus();
    }
});

// 2. Hide search bar when clicking close button 
closeSearch.addEventListener('click', () => {
    searchOverlay.classList.remove('search-overlay-active');
    resetSearch(); // Shows all products again when closing
});

// 3. LIVE SEARCH LOGIC
searchInput.addEventListener('input', () => {
    const filterValue = searchInput.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        // Grab the text from the product name (e.g., "Elegance Floral Edit - Mint")
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        
        // Grab the text from the image alt attribute as a backup tag system
        const productImgAlt = card.querySelector('.product-img').getAttribute('alt').toLowerCase();

        // If the typed word matches either the name or the image description, show it
        if (productName.includes(filterValue) || productImgAlt.includes(filterValue)) {
            card.style.display = ""; // Shows the product card
        } else {
            card.style.display = "none"; // Hides the product card
        }
    });
});

// Helper function to reset and show all products
function resetSearch() {
    searchInput.value = "";
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => card.style.display = "");
}
// ==========================================
// CATEGORY NAVIGATION FILTER (ALL / CASUAL / FANCY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const filterLinks = document.querySelectorAll('.filter-link');
    const sectionTitle = document.querySelector('.section-title');

    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Highlight active link
            filterLinks.forEach(l => {
                l.style.fontWeight = 'normal';
                l.style.textDecoration = 'none';
            });
            link.style.fontWeight = 'bold';
            link.style.textDecoration = 'underline';

            const filterCategory = link.getAttribute('data-filter').toLowerCase();

            // Update section heading text
            if (sectionTitle) {
                if (filterCategory === 'all') sectionTitle.textContent = 'Trendsetters';
                if (filterCategory === 'casual') sectionTitle.textContent = 'Casual Collection';
                if (filterCategory === 'fancy') sectionTitle.textContent = 'Fancy & Festive Wear';
            }

            // Re-query all product cards (including suits loaded from admin.html / server.js)
            const allCards = document.querySelectorAll('.product-card');

            allCards.forEach(card => {
                const imgAlt = (card.querySelector('img')?.alt || '').toLowerCase();
                const titleText = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
                const combinedText = imgAlt + ' ' + titleText;

                if (filterCategory === 'all') {
                    card.style.display = 'block';
                } else if (filterCategory === 'casual') {
                    // Matches casual, plaid, daily, or co-ord keywords
                    const isCasual = combinedText.includes('casual') || combinedText.includes('plaid') || combinedText.includes('co-ord');
                    card.style.display = isCasual ? 'block' : 'none';
                } else if (filterCategory === 'fancy') {
                    // Matches fancy, festive, party, luxury, or silk keywords
                    const isFancy = combinedText.includes('fancy') || combinedText.includes('festive') || combinedText.includes('party') || combinedText.includes('luxury') || combinedText.includes('silk');
                    card.style.display = isFancy ? 'block' : 'none';
                }
            });

            // Smoothly scroll to the collection shelf
            const collectionSection = document.getElementById('collection');
            if (collectionSection) {
                collectionSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
// ==========================================
// CUSTOM-MADE OUTFIT WHATSAPP INQUIRY MODAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const customTrigger = document.getElementById('custom-order-trigger');
    const customModal = document.getElementById('custom-outfit-modal');
    const closeCustomBtn = document.getElementById('close-custom-modal');
    const customForm = document.getElementById('custom-outfit-form');

    if (customTrigger && customModal) {
        customTrigger.addEventListener('click', () => {
            customModal.style.display = 'flex';
        });

        closeCustomBtn.addEventListener('click', () => {
            customModal.style.display = 'none';
        });

        customModal.addEventListener('click', (e) => {
            if (e.target === customModal) {
                customModal.style.display = 'none';
            }
        });
    }

    if (customForm) {
        customForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const custName = document.getElementById('custom-cust-name').value.trim();
            const childAge = document.getElementById('custom-child-age').value.trim();
            const fabricColor = document.getElementById('custom-fabric-color').value.trim();
            const measurements = document.getElementById('custom-measurements').value.trim() || "Standard size for age";
            const notes = document.getElementById('custom-notes').value.trim();

            const boutiqueWhatsApp = "923100064795";
            const message = `Assalam-o-Alaikum Mimi by Maryam! I would like to inquire about a *Custom-Made Outfit*:\n\n` +
                            `• *Name:* ${custName}\n` +
                            `• *Child's Age:* ${childAge}\n` +
                            `• *Color / Fabric:* ${fabricColor}\n` +
                            `• *Measurements:* ${measurements}\n` +
                            `• *Design Notes:* ${notes}`;

            const whatsappURL = `https://wa.me{boutiqueWhatsApp}?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, '_blank');

            customForm.reset();
            customModal.style.display = 'none';
        });
    }
});
