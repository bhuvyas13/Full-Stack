/**
 * events.js - Updated for new section categories
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Events.js loaded successfully');
    
    // Initialize flash messages container
    initializeFlashMessagesContainer();
    
    // Section tab functionality
    initSectionTabs();
    
    // Initialize match buttons
    initializeMatchButtons();
    
    // Initialize suggestion forms
    initializeSuggestionForms();
    
    // Initialize like suggestion buttons
    initializeLikeButtons();
    
    // Initialize volunteer buttons
    initializeVolunteerButtons();
    
    // Initialize respond buttons
    initializeRespondButtons();
    
    // Initialize create challenge button
    initializeCreateChallengeButton();
    
    // Initialize create request button
    initializeCreateRequestButton();
    
    // Initialize message buttons
    initializeMessageButtons();
    
    // Fix missing images
    fixMissingImages();
});

/**
 * Initialize section tabs for switching between challenges, matches, and requests
 */
function initSectionTabs() {
    const tabButtons = document.querySelectorAll('.role-btn');
    const sections = document.querySelectorAll('.section');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and sections
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Show corresponding section
            const targetRole = this.getAttribute('data-role');
            const targetSection = document.getElementById(`${targetRole}-section`);
            
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Store user preference in session storage
            sessionStorage.setItem('activeSection', targetRole);
            
            // Track user action
            storeUserAction('view_section', targetRole);
        });
    });
    
    // Check if there's a stored preference
    const storedSection = sessionStorage.getItem('activeSection');
    if (storedSection) {
        const storedButton = document.querySelector(`.role-btn[data-role="${storedSection}"]`);
        const storedSectionElement = document.getElementById(`${storedSection}-section`);
        
        if (storedButton && storedSectionElement) {
            // Remove active class from all buttons and sections
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Activate stored preference
            storedButton.classList.add('active');
            storedButton.setAttribute('aria-pressed', 'true');
            storedSectionElement.classList.add('active');
        }
    }
}

/**
 * Initialize flash messages container
 */
function initializeFlashMessagesContainer() {
    // Check if the container already exists
    if (!document.querySelector('.flash-messages')) {
        const flashContainer = document.createElement('div');
        flashContainer.className = 'flash-messages';
        document.body.appendChild(flashContainer);
    }
}

/**
 * Show a flash message
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info, warning)
 */
function showFlashMessage(message, type = 'info') {
    const flashContainer = document.querySelector('.flash-messages');
    if (!flashContainer) {
        console.error('Flash messages container not found');
        return;
    }
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    
    flashContainer.appendChild(flashMessage);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        flashMessage.style.opacity = '0';
        setTimeout(() => {
            if (flashMessage.parentNode) {
                flashMessage.parentNode.removeChild(flashMessage);
            }
        }, 500);
    }, 5000);
}

/**
 * Get CSRF token with multiple fallback strategies
 * @returns {string|null} The CSRF token or null if not found
 */
function getCsrfToken() {
    console.log("Searching for CSRF token...");
    
    // Strategy 1: Try to get token from meta tag first
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken && metaToken.getAttribute('content')) {
        console.log("Found CSRF token in meta tag");
        return metaToken.getAttribute('content');
    }
    
    // Strategy 2: Check for hidden input fields
    const csrfInput = document.querySelector('input[name="_csrf_token"], input[name="csrf_token"]');
    if (csrfInput && csrfInput.value) {
        console.log("Found CSRF token in input field");
        return csrfInput.value;
    }
    
    // Strategy 3: Check cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrf_token=')) {
            console.log("Found CSRF token in cookie");
            return cookie.substring('csrf_token='.length, cookie.length);
        }
    }
    
    // If we get here, no token was found
    console.warn("CSRF token not found. Generating a fallback token.");
    
    // Generate a temporary token if needed - this is a fallback only!
    const tempToken = Math.random().toString(36).substring(2, 15);
    
    // Try to add the token as a meta tag
    let head = document.querySelector('head');
    if (head) {
        let meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        meta.setAttribute('content', tempToken);
        head.appendChild(meta);
        console.log("Added temporary CSRF token meta tag");
    }
    
    return tempToken;
}

/**
 * Make authorized fetch request with proper error handling and CSRF token
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options including method, body, etc.
 * @returns {Promise} A promise that resolves to the response JSON
 */
async function authorizedFetch(url, options = {}) {
    // Set default options
    const csrfToken = getCsrfToken();
    console.log("Using CSRF token:", csrfToken ? "Token found" : "No token");
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken || ''
        }
    };
    
    // Merge options
    const fetchOptions = { ...defaultOptions, ...options };
    
    // Merge headers
    fetchOptions.headers = { ...defaultOptions.headers, ...options.headers || {} };
    
    // Add CSRF token to body for POST requests if not already present
    if (fetchOptions.method === 'POST' && fetchOptions.body && 
        typeof fetchOptions.body === 'string' && fetchOptions.body.indexOf('_csrf_token') === -1) {
        try {
            // Try to add CSRF token to JSON body
            const bodyObj = JSON.parse(fetchOptions.body);
            bodyObj._csrf_token = csrfToken;
            fetchOptions.body = JSON.stringify(bodyObj);
        } catch (e) {
            console.warn("Could not add CSRF token to body - not valid JSON");
        }
    }
    
    console.log("Sending request to:", url);
    try {
        const response = await fetch(url, fetchOptions);
        
        // Handle HTTP errors
        if (!response.ok) {
            // Log the response for debugging
            console.error("HTTP error:", response.status, response.statusText);
            
            try {
                const responseText = await response.text();
                console.error("Response body:", responseText);
            } catch (textError) {
                console.error("Could not read response body");
            }
            
            // Handle specific status codes
            if (response.status === 401) {
                showFlashMessage('You must be logged in to perform this action.', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                throw new Error('Unauthorized');
            }
            
            if (response.status === 403) {
                showFlashMessage('Permission denied. You cannot perform this action.', 'error');
                throw new Error('Forbidden');
            }
            
            if (response.status === 429) {
                showFlashMessage('Too many requests. Please try again later.', 'warning');
                throw new Error('Rate limited');
            }
            
            // Try to get error message from response
            try {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
            } catch (jsonError) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        
        // Parse JSON response
        try {
            return await response.json();
        } catch (jsonError) {
            // If not JSON, return text
            return await response.text();
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Store user actions in session and database for analytics
 * @param {string} actionType - The type of action
 * @param {string} targetId - The ID of the target (challenge, user, etc.)
 * @param {string} details - Additional details
 */
async function storeUserAction(actionType, targetId, details = '') {
    try {
        await authorizedFetch('/events', {
            method: 'POST',
            body: JSON.stringify({
                action: 'store_action',
                action_type: actionType,
                target_id: targetId,
                details: details
            })
        });
        console.log('Action stored successfully:', { actionType, targetId, details });
    } catch (error) {
        console.error('Error storing action:', error);
        // Non-critical - don't show error to user for analytics
    }
}

/**
 * Fix missing images with default image fallbacks
 */
function fixMissingImages() {
    // Default image paths
    const defaultAvatarPath = '/static/images/default-avatar.png';
    const defaultItemPath = '/static/images/default-item.png';
    
    // Create hidden test images to check if default images exist
    function checkImageExists(imagePath, callback) {
        const img = new Image();
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = imagePath;
    }
    
    // First verify our default images exist
    checkImageExists(defaultAvatarPath, function(avatarExists) {
        if (!avatarExists) {
            console.warn(`Default avatar image not found at ${defaultAvatarPath}. Creating a fallback.`);
            // If default avatar doesn't exist, we'll use a data URI as absolute fallback
            const fallbackAvatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Ccircle%20fill%3D%22%23ccc%22%20cx%3D%2216%22%20cy%3D%2216%22%20r%3D%2216%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M16%208a5%205%200%201%200%200%2010a5%205%200%201%200%200-10zm0%2015c-5.3%200-8%202.7-8%204v1h16v-1c0-1.3-2.7-4-8-4z%22%2F%3E%3C%2Fsvg%3E';
            document.querySelectorAll(`img[src="${defaultAvatarPath}"]`).forEach(img => {
                img.src = fallbackAvatar;
            });
        }
    });
    
    checkImageExists(defaultItemPath, function(itemExists) {
        if (!itemExists) {
            console.warn(`Default item image not found at ${defaultItemPath}. Creating a fallback.`);
            // If default item image doesn't exist, we'll use a data URI as absolute fallback
            const fallbackItem = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22180%22%20height%3D%22120%22%20viewBox%3D%220%200%20180%20120%22%3E%3Crect%20fill%3D%22%23eee%22%20width%3D%22180%22%20height%3D%22120%22%2F%3E%3Ctext%20fill%3D%22%23999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%22.35em%22%20text-anchor%3D%22middle%22%20x%3D%2290%22%20y%3D%2260%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
            document.querySelectorAll(`img[src="${defaultItemPath}"]`).forEach(img => {
                img.src = fallbackItem;
            });
        }
    });
    
    // Fix all images with empty, null, or undefined src
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Check if src is empty, null, or undefined or points to the current page
        const isSrcInvalid = !img.src || 
                              img.src === 'null' || 
                              img.src === 'undefined' || 
                              img.src === window.location.href ||
                              img.src.endsWith('/null') ||
                              img.src.endsWith('/undefined');
        
        if (isSrcInvalid) {
            // Set default image based on the context
            if (img.closest('.match-card') || 
                img.closest('.challenge-user') || 
                img.closest('.suggestion-user') ||
                img.closest('.request-user') ||
                img.closest('.story-users')) {
                img.src = defaultAvatarPath;
            } else if (img.closest('.challenge-content')) {
                img.src = defaultItemPath;
            } else {
                // Default fallback
                img.src = defaultAvatarPath;
            }
        }
        
        // Add error handler to handle image load failures
        if (!img.hasAttribute('data-error-handler-added')) {
            img.setAttribute('data-error-handler-added', 'true');
            img.onerror = function() {
                console.log('Image failed to load:', this.src);
                // Prevent infinite loops by checking if we're already using a default
                if (this.src === defaultAvatarPath || this.src === defaultItemPath) {
                    // Already using default, do nothing to prevent infinite loop
                    this.onerror = null;
                    return;
                }
                
                // Determine default image based on context
                if (this.closest('.match-card') || 
                    this.closest('.challenge-user') || 
                    this.closest('.suggestion-user') ||
                    this.closest('.request-user')) {
                    this.src = defaultAvatarPath;
                } else if (this.closest('.challenge-content')) {
                    this.src = defaultItemPath;
                } else {
                    this.src = defaultAvatarPath;
                }
                
                // Remove the error handler to prevent infinite loops
                this.onerror = null;
            };
        }
    });
}

/**
 * Initialize match connection buttons 
 */
function initializeMatchButtons() {
    const connectForms = document.querySelectorAll('.connect-form');
    
    connectForms.forEach(form => {
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        if (form.parentNode) {
            form.parentNode.replaceChild(newForm, form);
        }
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const receiverId = this.querySelector('input[name="receiver_id"]').value;
            const submitButton = this.querySelector('button[type="submit"]');
            const matchCard = this.closest('.match-card');
            
            if (!receiverId || !submitButton || !matchCard) {
                console.error('Missing required elements', { receiverId, submitButton, matchCard });
                return;
            }
            
            // Disable button during processing
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            try {
                const data = await authorizedFetch('/events', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'connect',
                        receiver_id: receiverId
                    })
                });
                
                if (data.success) {
                    console.log('Connection request sent successfully');
                    
                    // Update UI
                    submitButton.textContent = 'Pending';
                    submitButton.classList.add('pending-btn');
                    submitButton.disabled = true;
                    
                    // Add pending badge
                    const badge = document.createElement('div');
                    badge.className = 'match-badge pending';
                    badge.textContent = 'Pending';
                    
                    // Remove existing badge if there is one
                    const existingBadge = matchCard.querySelector('.match-badge');
                    if (existingBadge) {
                        existingBadge.remove();
                    }
                    
                    matchCard.prepend(badge);
                    
                    // Show success message
                    showFlashMessage('Connection request sent successfully!', 'success');
                    
                    // Store action for analytics
                    storeUserAction('connect', receiverId);
                } else {
                    // Show error and reset button
                    showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Connect';
                }
                
            } catch (error) {
                console.error('Error sending connection request:', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Connect';
                showFlashMessage('An error occurred. Please try again.', 'error');
            }
        });
    });
}

/**
 * Initialize suggestion forms with proper validation and error handling
 */
function initializeSuggestionForms() {
    const suggestionForms = document.querySelectorAll('.add-suggestion-form');
    
    suggestionForms.forEach(form => {
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        if (form.parentNode) {
            form.parentNode.replaceChild(newForm, form);
        }
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const textarea = this.querySelector('textarea');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!textarea || !submitButton) {
                console.error('Missing form elements', { textarea, submitButton });
                return;
            }
            
            const suggestionText = textarea.value.trim();
            
            if (!suggestionText) {
                // Show error message for empty suggestion
                showFlashMessage('Please enter a suggestion before submitting.', 'error');
                return;
            }
            
            // Get challenge ID from form action or hidden input
            let challengeId = '';
            const challengeInput = this.querySelector('input[name="challenge_id"]');
            if (challengeInput) {
                challengeId = challengeInput.value;
            } else {
                // Try getting it from a data attribute on the form
                challengeId = this.getAttribute('data-challenge-id');
            }
            
            if (!challengeId) {
                console.error('Challenge ID not found');
                showFlashMessage('Challenge ID is missing. Please refresh the page and try again.', 'error');
                return;
            }
            
            // Disable form during submission
            textarea.disabled = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            try {
                const data = await authorizedFetch('/events', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'add_suggestion',
                        challenge_id: challengeId,
                        suggestion_text: suggestionText
                    })
                });
                
                if (data.success) {
                    console.log('Suggestion added successfully:', data.suggestion);
                    
                    // Create new suggestion HTML
                    const suggestionsList = this.closest('.challenge-comments').querySelector('.suggestions-list');
                    const noSuggestions = this.closest('.challenge-comments').querySelector('.no-suggestions');
                    
                    if (noSuggestions) {
                        // Remove "no suggestions" message if it exists
                        noSuggestions.remove();
                    }
                    
                    // Create suggestions list if it doesn't exist
                    if (!suggestionsList) {
                        const newList = document.createElement('div');
                        newList.className = 'suggestions-list';
                        this.closest('.challenge-comments').insertBefore(newList, this);
                    }
                    
                    // Add the new suggestion to the list
                    const suggestion = data.suggestion;
                    const newSuggestion = createSuggestionElement(suggestion);
                    
                    // Get the suggestions list (which should exist now)
                    const list = this.closest('.challenge-comments').querySelector('.suggestions-list');
                    list.appendChild(newSuggestion);
                    
                    // Update the suggestion count
                    const countElement = this.closest('.challenge-comments').querySelector('h4');
                    if (countElement) {
                        const countMatch = countElement.textContent.match(/\d+/);
                        if (countMatch) {
                            const currentCount = parseInt(countMatch[0], 10);
                            countElement.textContent = countElement.textContent.replace(/\d+/, currentCount + 1);
                        }
                    }
                    
                    // Clear form
                    textarea.value = '';
                    
                    // Scroll to the new suggestion
                    newSuggestion.scrollIntoView({ behavior: 'smooth' });
                    
                    // Show success message
                    showFlashMessage('Your suggestion was added successfully!', 'success');
                    
                    // Store action for analytics
                    storeUserAction('suggest', challengeId, suggestionText.substring(0, 50));
                    
                } else {
                    console.error('Error adding suggestion:', data);
                    showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                }
                
                // Re-enable form
                textarea.disabled = false;
                submitButton.disabled = false;
                submitButton.textContent = 'Add Suggestion';
                
            } catch (error) {
                console.error('Error adding suggestion:', error);
                textarea.disabled = false;
                submitButton.disabled = false;
                submitButton.textContent = 'Add Suggestion';
                showFlashMessage('An error occurred. Please try again.', 'error');
            }
        });
    });
}

/**
 * Initialize like suggestion buttons with proper event delegation
 */
function initializeLikeButtons() {
    // Use event delegation for like buttons
    document.addEventListener('click', async function(e) {
        // Check if clicked element is a like button and not already liked
        if (e.target && e.target.classList.contains('like-suggestion-btn') && !e.target.classList.contains('liked')) {
            const suggestionId = e.target.getAttribute('data-suggestion-id');
            
            if (!suggestionId) {
                console.error('Suggestion ID not found');
                return;
            }
            
            // Disable button during processing
            e.target.disabled = true;
            const originalText = e.target.textContent;
            e.target.textContent = 'Processing...';
            
            try {
                const data = await authorizedFetch('/events', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'like_suggestion',
                        suggestion_id: suggestionId
                    })
                });
                
                if (data.success) {
                    console.log('Suggestion liked successfully');
                    
                    // Update UI to show liked status
                    e.target.textContent = 'Liked!';
                    e.target.classList.add('liked');
                    e.target.disabled = true;
                    
                    // Show success message near the button
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'A message has been sent to this stylist to connect!';
                    successMessage.style.fontSize = '12px';
                    successMessage.style.color = '#4caf50';
                    successMessage.style.marginTop = '5px';
                    e.target.parentNode.appendChild(successMessage);
                    
                    // Fade out and remove after a few seconds
                    setTimeout(() => {
                        successMessage.style.opacity = '0';
                        successMessage.style.transition = 'opacity 1s';
                        setTimeout(() => {
                            if (successMessage.parentNode) {
                                successMessage.parentNode.removeChild(successMessage);
                            }
                        }, 1000);
                    }, 3000);
                    
                    // Show global success message
                    showFlashMessage('You liked this suggestion! A message has been sent to connect.', 'success');
                    
                    // Store action for analytics
                    storeUserAction('like', suggestionId);
                    
                } else {
                    // Show error
                    console.error('Error liking suggestion:', data);
                    showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                    e.target.disabled = false;
                    e.target.textContent = originalText;
                }
                
            } catch (error) {
                console.error('Error liking suggestion:', error);
                e.target.disabled = false;
                e.target.textContent = originalText;
                showFlashMessage('An error occurred. Please try again.', 'error');
            }
        }
    });
}

/**
/**
 * Initialize volunteer buttons with proper event delegation
 */
function initializeVolunteerButtons() {
    document.addEventListener('click', async function(e) {
        if (e.target && e.target.classList.contains('volunteer-btn') && !e.target.classList.contains('volunteered')) {
            const challengeId = e.target.getAttribute('data-challenge-id');
            
            if (!challengeId) {
                console.error('Challenge ID not found');
                return;
            }
            
            // Disable button during processing
            e.target.disabled = true;
            const originalText = e.target.textContent;
            e.target.textContent = 'Processing...';
            
            try {
                const data = await authorizedFetch('/events', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'volunteer',
                        challenge_id: challengeId
                    })
                });
                
                if (data.success) {
                    console.log('Successfully volunteered for challenge');
                    
                    // Update UI
                    e.target.textContent = 'Volunteered!';
                    e.target.classList.add('volunteered');
                    e.target.disabled = true;
                    
                    // Store volunteered status in DB and session
                    storeUserAction('volunteer', challengeId);
                    
                    // Show success message
                    showFlashMessage('Thank you for volunteering! The challenge creator has been notified.', 'success');
                    
                } else {
                    // Check if the error is because user already volunteered
                    if (data.error && data.error.toLowerCase().includes('already volunteered')) {
                        // Update UI to show already volunteered state
                        e.target.textContent = 'Volunteered!';
                        e.target.classList.add('volunteered');
                        e.target.disabled = true;
                        
                        // Show informational message instead of error
                        showFlashMessage('You have already volunteered for this challenge!', 'info');
                    } else {
                        // Show regular error
                        console.error('Error volunteering:', data);
                        showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                        e.target.disabled = false;
                        e.target.textContent = originalText;
                    }
                }
                
            } catch (error) {
                console.error('Error volunteering:', error);
                e.target.disabled = false;
                e.target.textContent = originalText;
                showFlashMessage('An error occurred. Please try again.', 'error');
            }
        }
    });
}

/**
 * Initialize respond buttons for style requests
 */
function initializeRespondButtons() {
    document.addEventListener('click', async function(e) {
        if (e.target && e.target.classList.contains('respond-btn')) {
            const requestId = e.target.getAttribute('data-request-id');
            
            if (!requestId) {
                console.error('Request ID not found');
                return;
            }
            
            // Create modal for response
            const modal = createResponseModal(requestId);
            document.body.appendChild(modal);
            
            // Show modal
            modal.style.display = 'flex';
            
            // Close modal on X click
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }
            });
            
            // Handle form submission
            const form = modal.querySelector('.response-form');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const responseText = this.querySelector('textarea').value.trim();
                const submitButton = this.querySelector('button[type="submit"]');
                
                if (!responseText) {
                    showFlashMessage('Please enter a response before submitting.', 'error');
                    return;
                }
                
                // Disable form during submission
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
                
                try {
                    const data = await authorizedFetch('/events', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'respond_to_request',
                            request_id: requestId,
                            response_text: responseText
                        })
                    });
                    
                    if (data.success) {
                        // Close modal
                        modal.style.display = 'none';
                        setTimeout(() => {
                            modal.remove();
                        }, 300);
                        
                        // Show success message
                        showFlashMessage('Your response has been sent successfully!', 'success');
                        
                        // Store action for analytics
                        storeUserAction('respond_to_request', requestId);
                    } else {
                        showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                        submitButton.disabled = false;
                        submitButton.textContent = 'Send Response';
                    }
                    
                } catch (error) {
                    console.error('Error sending response:', error);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Response';
                    showFlashMessage('An error occurred. Please try again.', 'error');
                }
            });
        }
    });
}

/**
 * Create a response modal for style requests
 * @param {string} requestId - The ID of the request to respond to
 * @returns {HTMLElement} The modal element
 */
function createResponseModal(requestId) {
    const modal = document.createElement('div');
    modal.className = 'modal response-modal';
    
    const csrfToken = getCsrfToken();
    const csrfInput = csrfToken ? `<input type="hidden" name="_csrf_token" value="${csrfToken}">` : '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Respond to Style Request</h3>
            <form class="response-form">
                <input type="hidden" name="action" value="respond_to_request">
                <input type="hidden" name="request_id" value="${requestId}">
                ${csrfInput}
                <div class="form-group">
                    <label for="response-text">Your Style Advice</label>
                    <textarea id="response-text" name="response_text" rows="6" required maxlength="2000" placeholder="Share your styling advice here..."></textarea>
                </div>
                <button type="submit" class="btn">Send Response</button>
            </form>
        </div>
    `;
    
    return modal;
}

/**
 * Initialize create challenge button and form handling
 */
/**
 * Initialize create challenge button and form handling
 */
function initializeCreateChallengeButton() {
    const createChallengeBtn = document.querySelector('.create-challenge-btn');
    
    if (createChallengeBtn) {
        createChallengeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create modal for challenge creation
            const modal = document.createElement('div');
            modal.className = 'modal challenge-modal';
            
            const csrfToken = getCsrfToken();
            const csrfInput = csrfToken ? `<input type="hidden" name="_csrf_token" value="${csrfToken}">` : '';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>Create a Style Challenge</h3>
                    <form id="create-challenge-form">
                        <input type="hidden" name="action" value="create_challenge">
                        ${csrfInput}
                        <div class="form-group">
                            <label for="challenge-title">Challenge Title</label>
                            <input type="text" id="challenge-title" name="title" required maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="challenge-description">Description</label>
                            <textarea id="challenge-description" name="description" rows="4" required maxlength="1000"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="challenge-image">Upload Item Image</label>
                            <input type="file" id="challenge-image" name="image" accept="image/*">
                            <div class="form-help">Allowed file types: png, jpg, jpeg, gif (Max 16MB)</div>
                        </div>
                        <button type="submit" class="btn">Create Challenge</button>
                    </form>
                </div>
            `;
            
            // Add modal to body
            document.body.appendChild(modal);
            
            // Show modal
            modal.style.display = 'flex';
            
            // Close modal on X click
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }
            });
            
            // Handle form submission
            const form = modal.querySelector('#create-challenge-form');
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const title = this.querySelector('#challenge-title').value.trim();
                const description = this.querySelector('#challenge-description').value.trim();
                const imageFile = this.querySelector('#challenge-image').files[0];
                
                if (!title || !description) {
                    showFlashMessage('Please fill in all required fields', 'error');
                    return;
                }
                
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('action', 'create_challenge');
                formData.append('title', title);
                formData.append('description', description);
                
                if (imageFile) {
                    // Validate file size
                    if (imageFile.size > 16 * 1024 * 1024) {
                        showFlashMessage('Image file is too large. Maximum size is 16MB.', 'error');
                        return;
                    }
                    
                    // Validate file type
                    const fileExt = imageFile.name.split('.').pop().toLowerCase();
                    if (!['png', 'jpg', 'jpeg', 'gif'].includes(fileExt)) {
                        showFlashMessage('Invalid file type. Allowed types: png, jpg, jpeg, gif', 'error');
                        return;
                    }
                    
                    // Explicitly add the file to formData
                    formData.append('image', imageFile);
                }
                
                // Add CSRF token to formData
                if (csrfToken) {
                    formData.append('_csrf_token', csrfToken);
                }
                
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';
                
                // Create loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
                modal.querySelector('.modal-content').appendChild(loadingOverlay);
                
                // Log FormData contents for debugging
                console.log("Submitting challenge with image:", imageFile ? imageFile.name : "No image");
                
                // Ensure we don't set any Content-Type header as it will break the multipart/form-data boundary
                const fetchOptions = {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrfToken || ''
                    },
                    body: formData
                };
                
                console.log("Fetch options:", fetchOptions);
                
                fetch('/events', fetchOptions)
                .then(response => {
                    console.log("Server response status:", response.status);
                    if (!response.ok) {
                        return response.text().then(text => {
                            console.error("Error response text:", text);
                            throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
                        });
                    }
                    return response.json().catch(() => response.text());
                })
                .then(data => {
                    console.log("Server response data:", data);
                    
                    // Handle both JSON and text responses
                    let success = false;
                    let message = '';
                    
                    if (typeof data === 'object' && data !== null) {
                        success = data.success;
                        message = data.message || '';
                    } else if (typeof data === 'string' && data.includes('success')) {
                        success = true;
                        message = 'Challenge created successfully!';
                    }
                    
                    if (success) {
                        console.log('Challenge created successfully:', data);
                        
                        // Close modal
                        modal.style.display = 'none';
                        
                        // Show success message
                        showFlashMessage('Your style challenge has been created successfully!', 'success');
                        
                        // Store action for analytics
                        storeUserAction('create_challenge', 'new', title);
                        
                        // Reload the page to show the new challenge
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        console.error('Error creating challenge:', data);
                        showFlashMessage(message || 'An error occurred. Please try again.', 'error');
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                        
                        // Remove loading overlay
                        if (loadingOverlay.parentNode) {
                            loadingOverlay.parentNode.removeChild(loadingOverlay);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error creating challenge:', error);
                    showFlashMessage('An error occurred. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                    
                    // Remove loading overlay
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                });
            });
        });
    }
}

/**
 * Initialize create request button and form handling
 */
function initializeCreateRequestButton() {
    const createRequestBtns = document.querySelectorAll('.create-request-btn');
    
    createRequestBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show the create request modal
            const modalTemplate = document.getElementById('create-request-modal-template');
            if (!modalTemplate) {
                console.error('Create request modal template not found');
                return;
            }
            
            // Clone the modal from template
            const modal = modalTemplate.cloneNode(true);
            modal.id = 'create-request-modal';
            modal.style.display = 'flex';
            
            // Add to body
            document.body.appendChild(modal);
            
            // Close modal on X click
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }
            });
            
            // Handle form submission
            const form = modal.querySelector('#create-request-form');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const title = this.querySelector('#request-title').value.trim();
                const description = this.querySelector('#request-description').value.trim();
                const category = this.querySelector('#request-category').value;
                
                if (!title || !description || !category) {
                    showFlashMessage('Please fill in all required fields', 'error');
                    return;
                }
                
                // Disable form during submission
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';
                
                try {
                    const data = await authorizedFetch('/events', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'create_request',
                            title: title,
                            description: description,
                            category: category
                        })
                    });
                    
                    if (data.success) {
                        console.log('Request created successfully:', data);
                        
                        // Close modal
                        modal.style.display = 'none';
                        
                        // Show success message
                        showFlashMessage('Your style request has been created successfully!', 'success');
                        
                        // Store action for analytics
                        storeUserAction('create_request', 'new', title);
                        
                        // Reload the page to show the new request
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        console.error('Error creating request:', data);
                        showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Create Request';
                    }
                    
                } catch (error) {
                    console.error('Error creating request:', error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Request';
                    showFlashMessage('An error occurred. Please try again.', 'error');
                }
            });
        });
    });
}

/**
 * Initialize message buttons with modal functionality
 */
function initializeMessageButtons() {
    // Use event delegation for message buttons that might be dynamically added
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('message-btn')) {
            e.preventDefault();
            
            // Get user ID from href, data attribute, or closest form
            let userId = '';
            
            // Try from data attribute
            userId = e.target.getAttribute('data-user-id');
            
            // Try from href if it's a link
            if (!userId && e.target.href) {
                const urlParams = new URLSearchParams(e.target.href.split('?')[1]);
                userId = urlParams.get('user_id');
            }
            
            // Try from closest form
            if (!userId) {
                const form = e.target.closest('form');
                if (form) {
                    const userIdInput = form.querySelector('input[name="receiver_id"]');
                    if (userIdInput) {
                        userId = userIdInput.value;
                    }
                }
            }
            
            if (!userId) {
                console.error('User ID not found');
                showFlashMessage('User ID is missing. Please refresh the page and try again.', 'error');
                return;
            }
            
            // Create chat modal
            const modalTemplate = document.getElementById('message-modal-template');
            if (!modalTemplate) {
                console.error('Message modal template not found');
                return;
            }
            
            // Clone the modal from template
            const modal = modalTemplate.cloneNode(true);
            modal.id = 'message-modal';
            modal.style.display = 'flex';
            
            // Set receiver ID in the form
            const receiverIdInput = modal.querySelector('input[name="receiver_id"]');
            if (receiverIdInput) {
                receiverIdInput.value = userId;
            }
            
            // Add to body
            document.body.appendChild(modal);
            
            // Close modal on X click
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
            
            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }
            });
            
            // Load message history
            loadMessageHistory(userId);
            
            // Handle form submission
            const form = modal.querySelector('#send-message-form');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const messageText = this.querySelector('textarea').value.trim();
                
                if (!messageText) {
                    return;
                }
                
                // Disable form during submission
                const textarea = this.querySelector('textarea');
                const submitBtn = this.querySelector('button[type="submit"]');
                textarea.disabled = true;
                submitBtn.disabled = true;
                
                try {
                    const data = await authorizedFetch('/events', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'send_message',
                            receiver_id: userId,
                            message: messageText
                        })
                    });
                    
                    if (data.success) {
                        console.log('Message sent successfully:', data);
                        
                        // Clear textarea
                        textarea.value = '';
                        
                        // Add message to history
                        addMessageToHistory({
                            sender_id: 'current_user',
                            receiver_id: userId,
                            message: messageText,
                            created_at: 'Just now',
                            is_current_user: true
                        });
                        
                        // Store message in DB if needed
                        storeUserAction('message', userId, messageText.substring(0, 50));
                        
                    } else {
                        console.error('Error sending message:', data);
                        showFlashMessage(data.error || 'An error occurred. Please try again.', 'error');
                    }
                    
                    // Re-enable form
                    textarea.disabled = false;
                    submitBtn.disabled = false;
                    
                } catch (error) {
                    console.error('Error sending message:', error);
                    showFlashMessage('An error occurred. Please try again.', 'error');
                    textarea.disabled = false;
                    submitBtn.disabled = false;
                }
            });
        }
    });
}

/**
 * Load message history for a user
 * @param {string} userId - The ID of the user to load messages for
 */
async function loadMessageHistory(userId) {
    const messageHistory = document.getElementById('message-history');
    
    if (!messageHistory) {
        console.error('Message history container not found');
        return;
    }
    
    try {
        const data = await authorizedFetch('/events', {
            method: 'POST',
            body: JSON.stringify({
                action: 'get_messages',
                user_id: userId
            })
        });
        
        if (data.success) {
            console.log('Messages loaded successfully:', data);
            
            // Clear loading message
            messageHistory.innerHTML = '';
            
            // Check if there are messages
            if (data.messages && data.messages.length > 0) {
                // Add messages to history
                data.messages.forEach(message => {
                    addMessageToHistory(message);
                });
            } else {
                // Show empty state
                messageHistory.innerHTML = '<p class="no-messages">No messages yet. Send one now!</p>';
            }
            
        } else {
            console.error('Error loading messages:', data);
            messageHistory.innerHTML = '<p class="error-message">Error loading messages. Please try again.</p>';
        }
        
    } catch (error) {
        console.error('Error loading messages:', error);
        messageHistory.innerHTML = '<p class="error-message">Error loading messages. Please try again.</p>';
    }
}

/**
 * Add a message to the history
 * @param {Object} message - The message object to add
 */
function addMessageToHistory(message) {
    const messageHistory = document.getElementById('message-history');
    
    if (!messageHistory) {
        console.error('Message history container not found');
        return;
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message-item ${message.is_current_user ? 'sent' : 'received'}`;
    
    // Sanitize message content to prevent XSS
    const safeMessageText = message.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${safeMessageText}</p>
            <span class="message-time">${message.created_at}</span>
        </div>
    `;
    
    // Add to history
    messageHistory.appendChild(messageElement);
    
    // Scroll to bottom
    messageHistory.scrollTop = messageHistory.scrollHeight;
}

/**
 * Create a suggestion element from data
 * @param {Object} suggestion - The suggestion object
 * @returns {HTMLElement} The suggestion element
 */
function createSuggestionElement(suggestion) {
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'suggestion';
    
    // Use default avatar if profile image is missing
    const profileImage = suggestion.user && suggestion.user.profile_image ? 
                          suggestion.user.profile_image : 
                          '/static/images/default-avatar.png';
    
    const userName = suggestion.user && suggestion.user.name ? 
                      suggestion.user.name : 
                      'Anonymous User';
    
    // Sanitize content to prevent XSS
    const safeUserName = userName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeSuggestionText = suggestion.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    const userHTML = `
        <div class="suggestion-user">
            <img src="${profileImage}" alt="${safeUserName}" class="suggestion-user-img" onerror="this.onerror=null; this.src='/static/images/default-avatar.png';">
            <span>${safeUserName}</span>
        </div>
    `;
    
    const textHTML = `<p class="suggestion-text">${safeSuggestionText}</p>`;
    
    const actionsHTML = `
        <div class="suggestion-actions">
            <span class="suggestion-time">${suggestion.created_at || 'Just now'}</span>
            ${suggestion.can_like ? `<button class="like-suggestion-btn" data-suggestion-id="${suggestion.id}">I like this!</button>` : ''}
        </div>
    `;
    
    suggestionElement.innerHTML = userHTML + textHTML + actionsHTML;
    return suggestionElement;
}