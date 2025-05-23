// static/js/image_preloader.js

// This script preloads style category images 
document.addEventListener('DOMContentLoaded', function() {
    // Category placeholder images to preload
    const imagesToPreload = [
        '/static/images/bold_category.jpg',
        '/static/images/subtle_category.jpg',
        '/static/images/style_placeholder.jpg'
    ];
    
    // Preload category images
    imagesToPreload.forEach(imagePath => {
        const img = new Image();
        img.src = imagePath;
    });
    
    // Optimize image loading for all style personality types
    const styleCodePrefixes = ['B', 'S']; // Bold and Subtle main categories
    const styleSubCategories = ['S', 'F']; // Structured and Flowing
    const styleApproaches = ['C', 'I']; // Classic and Innovative
    const styleDetails = ['M', 'E']; // Minimal and Expressive
    
    // Generate image paths for all potential styles
    const styleCombinations = [];
    styleCodePrefixes.forEach(prefix => {
        styleSubCategories.forEach(subCat => {
            styleApproaches.forEach(approach => {
                styleDetails.forEach(detail => {
                    styleCombinations.push(`${prefix}${subCat}${approach}${detail}`);
                });
            });
        });
    });
    
    // Queue system for loading images
    // We'll load the most common ones first, then others in the background
    const commonStyles = ['BSCM', 'SSCM', 'BFIE', 'SFIE']; // Most common style types
    
    // Preload common styles immediately
    commonStyles.forEach(styleCode => {
        const img = new Image();
        img.src = `/static/images/${styleCode}.png`;
    });
    
    // Queue the rest for background loading with slight delays
    // to not overload the browser
    let queueIndex = 0;
    const loadQueue = styleCombinations.filter(style => !commonStyles.includes(style));
    
    function loadNextInQueue() {
        if (queueIndex >= loadQueue.length) return;
        
        const styleCode = loadQueue[queueIndex];
        const img = new Image();
        img.onload = function() {
            // Successfully loaded - move to next after a small delay
            setTimeout(loadNextInQueue, 100);
        };
        img.onerror = function() {
            // Failed to load - just move to next
            setTimeout(loadNextInQueue, 50);
        };
        img.src = `/static/images/${styleCode}.png`;
        queueIndex++;
    }
    
    // Start loading queue after a short delay
    setTimeout(loadNextInQueue, 1000);
});