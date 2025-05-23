document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const fileSelect = document.getElementById('fileSelect');
    const messageContainer = document.getElementById('message-container');
    
    // Get journal name from data attribute
    const journalElement = document.querySelector('[data-journal]');
    const journal = journalElement ? journalElement.getAttribute('data-journal') : null;
    
    // Debug log to see what journal name we're getting
    console.log('Journal name from data attribute:', journal);
    
    // Exit if we don't have the required elements or we're not on a journal page
    if (!dropArea || !fileElem || !fileSelect || !journal) {
        console.log('Missing required elements or not on a journal page');
        return;
    }

    // Connect the button to the hidden file input
    fileSelect.addEventListener('click', function() {
        fileElem.click();
    });
    
    // Handle file selection via the file input
    fileElem.addEventListener('change', function() {
        if (fileElem.files.length) {
            uploadFile(fileElem.files[0]);
        }
    });
    
    // Set up the drag & drop event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Add highlighting when dragging over the drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle drop event
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            uploadFile(files[0]);
        }
    }
    
    // Function to upload file
    function uploadFile(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            showMessage('Please select an image file (PNG, JPG, JPEG, GIF).', 'error');
            return;
        }
        
        // Create form data with the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Show loading state
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Uploading...';
        dropArea.appendChild(loadingIndicator);
        
        // Log what journal we're uploading to
        console.log('Uploading to journal:', journal);
        
        // Send the file to the server
        fetch(`/upload/${journal}/js`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            
            // Check if the response is ok before trying to parse JSON
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Response body:', text);
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful, server response:', data);
            
            // If using the flipbook, we need to reload the page
            // to see the new content with turn.js
            if (document.getElementById('flipbook')) {
                window.location.reload();
                return;
            }
            
            // Otherwise, add the new page to the book container
            const bookContainer = document.querySelector('.book-container');
            if (bookContainer) {
                const page = document.createElement('div');
                page.className = 'page';
                
                const img = document.createElement('img');
                img.src = `/static/${data.filepath}`;  // Use the filepath from server response
                img.className = 'scrap-img';
                img.alt = 'Scrapbook image';
                
                const captionContainer = document.createElement('div');
                captionContainer.className = 'caption-container';
                captionContainer.textContent = '';
                
                page.appendChild(img);
                page.appendChild(captionContainer);
                
                // Insert the new page before the upload page
                const uploadPage = document.querySelector('.upload-page');
                if (uploadPage) {
                    bookContainer.insertBefore(page, uploadPage);
                } else {
                    bookContainer.appendChild(page);
                }
            }
            
            // Remove loading indicator
            if (dropArea.contains(loadingIndicator)) {
                dropArea.removeChild(loadingIndicator);
            }
            
            showMessage('Image uploaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error details:', error);
            
            // Remove loading indicator
            if (dropArea.contains(loadingIndicator)) {
                dropArea.removeChild(loadingIndicator);
            }
            
            // Show detailed error message
            showMessage(error.message || 'Upload failed. Please try again.', 'error');
        });
    }
    
    // Helper function to show messages
    function showMessage(message, type) {
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `flash-message flash-${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 5000);
    }
    
    // If turn.js is available, initialize the flipbook
    if (typeof $.fn.turn !== 'undefined' && document.getElementById('flipbook')) {
        const flipbook = $("#flipbook");
        
        // Make sure there are pages before initializing
        if (flipbook.children().length > 0) {
            try {
                flipbook.turn({
                    width: 800,
                    height: 600,
                    autoCenter: true,
                    gradients: true,
                    acceleration: true,
                    elevation: 50,
                    when: {
                        turning: function(e, page, view) {
                            console.log('Turning to page: ' + page);
                        },
                        turned: function(e, page) {
                            console.log('Now on page: ' + page);
                        },
                        start: function(e, pageObject) {
                            if (pageObject.next == 1) {
                                e.preventDefault();
                            }
                        }
                    }
                });
                
                // Add keyboard navigation
                $(document).keydown(function(e) {
                    if (e.keyCode == 37) { // left arrow
                        flipbook.turn('previous');
                    } else if (e.keyCode == 39) { // right arrow
                        flipbook.turn('next');
                    }
                });
                
                console.log('Flipbook initialized successfully');
            } catch (error) {
                console.error('Error initializing flipbook:', error);
                // Fallback to simple display
                document.getElementById('flipbook').style.display = 'flex';
                document.getElementById('flipbook').style.flexWrap = 'wrap';
                document.getElementById('flipbook').style.justifyContent = 'center';
                document.getElementById('flipbook').style.gap = '20px';
            }
        } else {
            console.log('No pages to initialize flipbook');
        }
    }
});