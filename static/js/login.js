// static/js/login.js - Complete Fixed Version

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const signupTab = document.getElementById('signupTab');
    const signinTab = document.getElementById('signinTab');
    const signupForm = document.getElementById('signupForm');
    const signinForm = document.getElementById('signinForm');
    const stepIndicator = document.getElementById('stepIndicator');
    const formTitle = document.getElementById('formTitle');
    
    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupForm.style.display = 'block';
        signinForm.style.display = 'none';
        stepIndicator.style.display = 'flex';
        formTitle.textContent = 'Create Your Account';
    });
    
    signinTab.addEventListener('click', () => {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        stepIndicator.style.display = 'none';
        formTitle.textContent = 'Sign In to Your Account';
    });
    
    // Inside the signup form submit handler
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate password match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Add photo data to form
        const photoData = document.getElementById('photoData').value;
        if (!photoData) {
            if (!confirm('No photo selected. Do you want to continue without a profile photo?')) {
                return;
            }
        }
        
        // Submit the form data using fetch API
        const formData = new FormData(this);
        
        fetch('/register', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Registration successful, redirecting to /home');
                window.location.href = '/home';
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });

    // Inside the signin form submit handler
    document.getElementById('signinForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Submit the form data using fetch API
        const formData = new FormData(this);
        
        fetch('/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful, redirecting to /home');
                window.location.href = '/home';
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
    });
    
    // Step navigation
    window.currentStep = 1;
    
    window.updateStepIndicator = function() {
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === window.currentStep);
        });
    };
    
    window.nextStep = function(step) {
        document.getElementById(`step${step}`).classList.remove('active');
        document.getElementById(`step${step + 1}`).classList.add('active');
        window.currentStep = step + 1;
        window.updateStepIndicator();
    };
    
    window.prevStep = function(step) {
        document.getElementById(`step${step}`).classList.remove('active');
        document.getElementById(`step${step - 1}`).classList.add('active');
        window.currentStep = step - 1;
        window.updateStepIndicator();
    };
    
    // FIXED AND IMPROVED CAMERA FUNCTIONALITY
    const cameraBtn = document.getElementById('cameraBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photoDisplay = document.getElementById('photoDisplay');
    const placeholderText = document.getElementById('placeholder-text');
    const cameraContainer = document.querySelector('.camera-container');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    
    let stream = null;
    
    // Function to display an image in the polaroid
    function displayImageInPolaroid(imageUrl) {
        try {
            console.log("Displaying image in polaroid");
            
            // Make sure polaroid container stays visible
            photoDisplay.style.height = '300px';
            photoDisplay.style.width = '100%';
            photoDisplay.style.display = 'block';
            photoDisplay.style.backgroundColor = 'transparent';
            
            // Make sure placeholder is hidden
            if (placeholderText) {
                placeholderText.style.display = 'none';
            }
            
            // Add a class for styling
            photoDisplay.classList.add('has-image');
            
            // Create an image element to replace the content
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            // Clear previous content and add the image
            photoDisplay.innerHTML = '';
            photoDisplay.appendChild(img);
            
            // Store in hidden field for form submission
            document.getElementById('photoData').value = imageUrl;
            
            console.log('Photo displayed successfully in polaroid');
        } catch (error) {
            console.error('Error displaying image in polaroid:', error);
        }
    }
    
    // Check for browser camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("Camera API is supported in this browser");
    } else {
        console.warn('Camera functionality not available in this browser');
        cameraBtn.disabled = true;
        cameraBtn.title = 'Camera not supported in this browser';
        cameraBtn.style.opacity = '0.5';
    }
    
    // COMPLETELY REWRITTEN: Camera button click handler
    cameraBtn.addEventListener('click', async function(e) {
        // Prevent any default behavior
        e.preventDefault();
        e.stopPropagation();
        
        console.log("Camera button clicked - debug mode");
        
        try {
            // 1. First make sure the polaroid doesn't collapse
            // This is critical - ensure the polaroid-image maintains its dimensions
            photoDisplay.style.height = '300px';
            photoDisplay.style.width = '100%';
            photoDisplay.style.display = 'block';
            photoDisplay.style.backgroundColor = '#333';
            
            // 2. Hide placeholder text but keep the photoDisplay visible
            if (placeholderText) {
                placeholderText.style.display = 'none';
            }
            
            // 3. Make camera container visible first
            cameraContainer.style.display = 'block';
            cameraContainer.style.position = 'absolute';
            cameraContainer.style.top = '0';
            cameraContainer.style.left = '0';
            cameraContainer.style.width = '100%';
            cameraContainer.style.height = '100%';
            cameraContainer.style.zIndex = '10';
            
            // 4. Make camera action buttons visible
            const cameraActions = document.querySelector('.camera-actions');
            if (cameraActions) {
                cameraActions.style.display = 'flex';
                cameraActions.style.zIndex = '20';
            }
            
            // 5. Stop any existing camera stream
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            
            // 6. Request camera with extremely basic constraints
            console.log("Requesting camera access with minimal constraints");
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            
            console.log("Camera access granted");
            
            // 7. Set video source and make it visible
            video.srcObject = stream;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.display = 'block';
            
            // 8. Force video to play
            try {
                await video.play();
                console.log("Video is now playing");
            } catch (playError) {
                console.error("Error playing video:", playError);
                alert("Error starting video stream. Please ensure you've granted camera permissions.");
            }
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check your browser permissions or try uploading a photo instead.');
            
            // Reset the display on error
            if (placeholderText) {
                placeholderText.style.display = 'block';
            }
            cameraContainer.style.display = 'none';
            video.style.display = 'none';
        }
    });
    
    // FIXED: Improved capture button handler
    captureBtn.addEventListener('click', () => {
        try {
            console.log("Capture button clicked");
            
            // Check if stream exists
            if (!stream) {
                console.error("No active camera stream");
                alert("Camera is not active. Please try again.");
                return;
            }
            
            // If video isn't ready yet, wait a bit
            if (!video.videoWidth) {
                console.log("Video not ready yet, waiting 500ms before capture");
                setTimeout(() => captureBtn.click(), 500);
                return;
            }
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            console.log("Capturing photo with dimensions:", canvas.width, "x", canvas.height);
            
            // Draw video to canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get the image data
            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Display the captured image
            displayImageInPolaroid(imageDataUrl);
            
            // Stop the camera stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            
            // Hide video elements
            video.style.display = 'none';
            cameraContainer.style.display = 'none';
            
            console.log('Photo capture complete');
        } catch (error) {
            console.error('Error capturing photo:', error);
            alert('Failed to capture photo. Please try again or use the upload option instead.');
        }
    });
    
    // FIXED: Improved retake button handler
    retakeBtn.addEventListener('click', async () => {
        try {
            console.log("Retake button clicked");
            
            // Stop any existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            
            // Reset the display
            photoDisplay.classList.remove('has-image');
            photoDisplay.innerHTML = '';
            
            // Make sure camera container remains visible
            cameraContainer.style.display = 'block';
            
            // Use the same function as the camera button for consistency
            // Just call the camera button click to reuse all the setup logic
            cameraBtn.click();
            
        } catch (error) {
            console.error('Error in retake process:', error);
            alert('Could not restart camera. Please try refreshing the page.');
        }
    });
    
    // File upload handlers
    uploadBtn.addEventListener('click', () => {
        console.log("Upload button clicked");
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        try {
            console.log("File input changed");
            
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                console.log("Selected file:", file.name, file.type, file.size, "bytes");
                
                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file (jpg, png, etc.)');
                    return;
                }
                
                const reader = new FileReader();
                
                // Show upload progress
                const uploadProgress = document.querySelector('.upload-progress');
                const progressBar = document.querySelector('.upload-progress-bar');
                
                if (uploadProgress && progressBar) {
                    uploadProgress.style.display = 'block';
                    progressBar.style.width = '0%';
                    
                    // Monitor upload progress (this is simulated, but could be real with actual upload)
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        progressBar.style.width = `${progress}%`;
                        
                        if (progress >= 100) {
                            clearInterval(interval);
                            setTimeout(() => {
                                uploadProgress.style.display = 'none';
                            }, 500);
                        }
                    }, 150);
                }
                
                reader.onload = (event) => {
                    console.log("File loaded by FileReader");
                    
                    // Create image to get dimensions
                    const img = new Image();
                    
                    img.onload = () => {
                        try {
                            console.log("Image loaded, dimensions:", img.width, "x", img.height);
                            
                            // Create a canvas to resize the image if needed
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // Set dimensions (max width 400px while maintaining aspect ratio)
                            const maxWidth = 400;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > maxWidth) {
                                height = Math.floor((maxWidth / width) * height);
                                width = maxWidth;
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            
                            console.log("Resizing to:", width, "x", height);
                            
                            // Draw the image on the canvas
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // Get the resized image data
                            const resizedImageData = canvas.toDataURL('image/jpeg', 0.9);
                            
                            // Display the uploaded and resized image
                            displayImageInPolaroid(resizedImageData);
                            
                            console.log('Photo uploaded and processed successfully');
                        } catch (error) {
                            console.error('Error processing uploaded image:', error);
                            alert('Failed to process the image. Please try again with a different image.');
                        }
                    };
                    
                    img.onerror = (e) => {
                        console.error('Error loading the image:', e);
                        alert('Failed to load the image. The file might be corrupted or not a valid image.');
                    };
                    
                    img.src = event.target.result;
                };
                
                reader.onerror = (e) => {
                    console.error('Error reading the file:', e);
                    alert('Failed to read the file. Please try again with a different image.');
                };
                
                console.log("Starting file read as Data URL");
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Error in file upload process:', error);
        }
    });
});