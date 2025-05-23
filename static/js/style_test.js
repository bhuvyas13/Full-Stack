// static/js/enhanced_style_test.js - Fixed version

// Immediately execute to check if script loads properly
(function() {
    console.log('Enhanced style test script loading...');
    
    // Make sure we run as soon as possible
    function initializeTest() {
        console.log('Enhanced style test initializing...');
        
        // DOM Elements
        const introSection = document.getElementById('intro-section');
        const questionSection = document.getElementById('question-section');
        const resultsSection = document.getElementById('results-section');
        const questionContent = document.getElementById('question-content');
        const progressFill = document.getElementById('progress-fill');
        const currentQuestionNum = document.getElementById('current-question');
        const startButton = document.getElementById('start-test');
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        const optionA = document.getElementById('option-a');
        const optionB = document.getElementById('option-b');
        const retakeButton = document.getElementById('retake-test-btn');
        const saveResultsButton = document.getElementById('save-results-btn');
        const downloadResultsButton = document.getElementById('download-results-btn');
        const connectStyleButton = document.getElementById('connect-style-btn');
        const findBuddiesButton = document.getElementById('find-buddies-btn');

        // Log key elements to debug
        console.log('Key elements found:', {
            introSection: !!introSection,
            questionSection: !!questionSection,
            resultsSection: !!resultsSection,
            startButton: !!startButton
        });

        // Test state
        let currentQuestion = 0;
        let answers = Array(16).fill(null); // Store answers for 16 questions
        let dimensions = {
            boldSubtle: 0,        // B/S - Bold (0) vs Subtle (4)
            structuredFlowing: 0, // T/F - Structured (0) vs Flowing (4)
            classicInnovative: 0, // C/I - Classic (0) vs Innovative (4)
            minimalExpressive: 0  // M/E - Minimal (0) vs Expressive (4)
        };
        
        // Check if we have saved results from a previous session
        checkForSavedResults();

        // Questions data
        const questions = [
            {
                category: "Bold vs Subtle",
                text: "When getting dressed for an important event, I prefer:",
                options: {
                    a: "Making a statement with eye-catching elements that stand out in a crowd",
                    b: "Creating a refined look with understated elegance that reveals itself in the details"
                },
                dimension: "boldSubtle",
                aValue: 0, // Bold
                bValue: 1  // Subtle
            },
            {
                category: "Structured vs Flowing",
                text: "I feel most comfortable in clothing that:",
                options: {
                    a: "Has clean lines and a defined shape that creates a polished silhouette",
                    b: "Drapes naturally and moves with my body, adapting to my movements"
                },
                dimension: "structuredFlowing",
                aValue: 0, // Structured
                bValue: 1  // Flowing
            },
            {
                category: "Classic vs Innovative",
                text: "When considering new additions to my wardrobe, I'm drawn to:",
                options: {
                    a: "Timeless pieces with proven staying power that won't look dated next season",
                    b: "Forward-thinking designs that incorporate innovative elements or creative twists"
                },
                dimension: "classicInnovative",
                aValue: 0, // Classic
                bValue: 1  // Innovative
            },
            {
                category: "Minimal vs Expressive",
                text: "When it comes to accessories and details, I prefer:",
                options: {
                    a: "A clean, selective approach with few, carefully chosen elements",
                    b: "Rich variety that creates visual interest through multiple layers or details"
                },
                dimension: "minimalExpressive",
                aValue: 0, // Minimal
                bValue: 1  // Expressive
            },
            // Second round of questions
            {
                category: "Bold vs Subtle",
                text: "The colors in my wardrobe tend to be:",
                options: {
                    a: "Vibrant, contrasting, or statement-making",
                    b: "Muted, harmonious, or tone-on-tone"
                },
                dimension: "boldSubtle",
                aValue: 0, // Bold
                bValue: 1  // Subtle
            },
            {
                category: "Structured vs Flowing",
                text: "When shopping for pants or bottoms, I typically choose:",
                options: {
                    a: "Tailored styles with precise fits and clear structure",
                    b: "Relaxed styles with movement and natural drape"
                },
                dimension: "structuredFlowing",
                aValue: 0, // Structured
                bValue: 1  // Flowing
            },
            {
                category: "Classic vs Innovative",
                text: "My approach to fashion trends is:",
                options: {
                    a: "Cautious – I adopt trends selectively and prefer proven styles",
                    b: "Enthusiastic – I enjoy experimenting with new concepts and directions"
                },
                dimension: "classicInnovative",
                aValue: 0, // Classic
                bValue: 1  // Innovative
            },
            {
                category: "Minimal vs Expressive",
                text: "My ideal outfit makes me feel:",
                options: {
                    a: "Streamlined and focused, with a sense of intentional restraint",
                    b: "Dynamic and interesting, with elements that invite engagement"
                },
                dimension: "minimalExpressive",
                aValue: 0, // Minimal
                bValue: 1  // Expressive
            },
            // Third round of questions
            {
                category: "Bold vs Subtle",
                text: "When someone compliments my style, I'd rather hear that I look:",
                options: {
                    a: "Striking, commanding, or distinctive",
                    b: "Graceful, sophisticated, or tasteful"
                },
                dimension: "boldSubtle",
                aValue: 0, // Bold
                bValue: 1  // Subtle
            },
            {
                category: "Structured vs Flowing",
                text: "I prefer fabrics that:",
                options: {
                    a: "Hold their shape and create structured forms",
                    b: "Have fluidity and softness in their movement"
                },
                dimension: "structuredFlowing",
                aValue: 0, // Structured
                bValue: 1  // Flowing
            },
            {
                category: "Classic vs Innovative",
                text: "In my wardrobe planning, I prioritize:",
                options: {
                    a: "Building a cohesive collection of reliable standards that work well together",
                    b: "Introducing fresh perspectives and unexpected elements that keep things interesting"
                },
                dimension: "classicInnovative",
                aValue: 0, // Classic
                bValue: 1  // Innovative
            },
            {
                category: "Minimal vs Expressive",
                text: "My perfect outfit is one that:",
                options: {
                    a: "Embodies perfect simplicity with nothing unnecessary",
                    b: "Creates a rich visual experience with thoughtful details"
                },
                dimension: "minimalExpressive",
                aValue: 0, // Minimal
                bValue: 1  // Expressive
            },
            // Fourth round of questions
            {
                category: "Bold vs Subtle",
                text: "When entering a room, I'd prefer my outfit to:",
                options: {
                    a: "Command attention and make a memorable impression",
                    b: "Convey understated confidence without drawing immediate focus"
                },
                dimension: "boldSubtle",
                aValue: 0, // Bold
                bValue: 1  // Subtle
            },
            {
                category: "Structured vs Flowing",
                text: "The silhouettes I'm most drawn to are:",
                options: {
                    a: "Architectural with defined edges and precise proportions",
                    b: "Organic with natural lines and adaptive shapes"
                },
                dimension: "structuredFlowing",
                aValue: 0, // Structured
                bValue: 1  // Flowing
            },
            {
                category: "Classic vs Innovative",
                text: "In fashion, I believe:",
                options: {
                    a: "True style transcends trends and builds on established principles",
                    b: "Fashion should evolve and challenge conventions to remain relevant"
                },
                dimension: "classicInnovative",
                aValue: 0, // Classic
                bValue: 1  // Innovative
            },
            {
                category: "Minimal vs Expressive",
                text: "My approach to getting dressed is guided by:",
                options: {
                    a: "The principle that less is more – focusing on quality and essentials",
                    b: "The joy of creative expression – playing with various elements"
                },
                dimension: "minimalExpressive",
                aValue: 0, // Minimal
                bValue: 1  // Expressive
            }
        ];

        // Style personality types based on dimension combinations
        const styleTypes = {
            'BSCM': {
                name: 'The Dynamic Executive',
                mbti: 'ENTJ',
                mbtiUrl: 'https://www.16personalities.com/entj-personality',
                traits: 'Bold structured silhouettes with classic, minimal details',
                characteristics: 'Strategic efficiency, commanding presence, disciplined approach, preference for proven solutions',
                imagePath: '/static/images/BSCM.png'
            },
            'BSCE': {
                name: 'The Elegant Maximalist',
                mbti: 'ENFJ',
                mbtiUrl: 'https://www.16personalities.com/enfj-personality',
                traits: 'Bold structured silhouettes with classic, expressive details',
                characteristics: 'Polished luxury, confident sophistication, traditional richness, calculated expressiveness',
                imagePath: '/static/images/BSCE.png'
            },
            'BSIE': {
                name: 'The Visionary Architect',
                mbti: 'ENTP',
                mbtiUrl: 'https://www.16personalities.com/entp-personality',
                traits: 'Bold structured silhouettes with innovative, expressive details',
                characteristics: 'Forward-thinking statements, structured experimentation, controlled avante-garde elements',
                imagePath: '/static/images/BSIE.png'
            },
            'BSIM': {
                name: 'The Strategic Innovator',
                mbti: 'ENTJ',
                mbtiUrl: 'https://www.16personalities.com/entj-personality',
                traits: 'Bold structured silhouettes with innovative, minimal details',
                characteristics: 'Forward-thinking precision, structured originality, focused innovation',
                imagePath: '/static/images/BSIM.png'
            },
            'BFCM': {
                name: 'The Refined Dynamist',
                mbti: 'ESFJ',
                mbtiUrl: 'https://www.16personalities.com/esfj-personality',
                traits: 'Bold flowing silhouettes with classic, minimal details',
                characteristics: 'Graceful confidence, movement with purpose, timeless fluidity',
                imagePath: '/static/images/BFCM.png'
            },
            'BFCE': {
                name: 'The Expressive Dramatist',
                mbti: 'ESFP',
                mbtiUrl: 'https://www.16personalities.com/esfp-personality',
                traits: 'Bold flowing silhouettes with classic, expressive details',
                characteristics: 'Dramatic flair, traditional showmanship, charismatic presence',
                imagePath: '/static/images/BFCE.png'
            },
            'BFIE': {
                name: 'The Creative Trendsetter',
                mbti: 'ENFP',
                mbtiUrl: 'https://www.16personalities.com/enfp-personality',
                traits: 'Bold flowing silhouettes with innovative, expressive details',
                characteristics: 'Dynamic creativity, visible innovation, dramatic experimentation',
                imagePath: '/static/images/BFIE.png'
            },
            'BFIM': {
                name: 'The Fluid Modernist',
                mbti: 'ENTP',
                mbtiUrl: 'https://www.16personalities.com/entp-personality',
                traits: 'Bold flowing silhouettes with innovative, minimal details',
                characteristics: 'Dynamic simplicity, bold minimalism with movement, innovative fluidity',
                imagePath: '/static/images/BFIM.png'
            },
            'SSCM': {
                name: 'The Refined Traditionalist',
                mbti: 'ISTJ',
                mbtiUrl: 'https://www.16personalities.com/istj-personality',
                traits: 'Subtle structured silhouettes with classic, minimal details',
                characteristics: 'Measured precision, understated quality, reliable consistency, careful attention to detail',
                imagePath: '/static/images/SSCM.png'
            },
            'SSCE': {
                name: 'The Detailed Classicist',
                mbti: 'ISFJ',
                mbtiUrl: 'https://www.16personalities.com/isfj-personality',
                traits: 'Subtle structured silhouettes with classic, expressive details',
                characteristics: 'Refined detail, quiet sophistication, thoughtful traditionalism',
                imagePath: '/static/images/SSCE.png'
            },
            'SSIE': {
                name: 'The Quiet Innovator',
                mbti: 'INTJ',
                mbtiUrl: 'https://www.16personalities.com/intj-personality',
                traits: 'Subtle structured silhouettes with innovative, expressive details',
                characteristics: 'Intellectual creativity, understated experimentation, thoughtful originality',
                imagePath: '/static/images/SSIE.png'
            },
            'SSIM': {
                name: 'The Precise Futurist',
                mbti: 'INTP',
                mbtiUrl: 'https://www.16personalities.com/intp-personality',
                traits: 'Subtle structured silhouettes with innovative, minimal details',
                characteristics: 'Understated precision, quiet innovation, intellectual minimalism',
                imagePath: '/static/images/SSIM.png'
            },
            'SFCM': {
                name: 'The Gentle Classicist',
                mbti: 'ISFJ',
                mbtiUrl: 'https://www.16personalities.com/isfj-personality',
                traits: 'Subtle flowing silhouettes with classic, minimal details',
                characteristics: 'Graceful simplicity, quiet elegance, timeless ease',
                imagePath: '/static/images/SFCM.png'
            },
            'SFCE': {
                name: 'The Romantic Traditionalist',
                mbti: 'ISFP',
                mbtiUrl: 'https://www.16personalities.com/isfp-personality',
                traits: 'Subtle flowing silhouettes with classic, expressive details',
                characteristics: 'Soft sophistication, quiet richness, gentle expressiveness',
                imagePath: '/static/images/SFCE.png'
            },
            'SFIE': {
                name: 'The Ethereal Innovator',
                mbti: 'INFP',
                mbtiUrl: 'https://www.16personalities.com/infp-personality',
                traits: 'Subtle flowing silhouettes with innovative, expressive details',
                characteristics: 'Delicate experimentation, quiet avant-garde, poetic innovation',
                imagePath: '/static/images/SFIE.png'
            },
            'SFIM': {
                name: 'The Serene Modernist',
                mbti: 'INFJ',
                mbtiUrl: 'https://www.16personalities.com/infj-personality',
                traits: 'Subtle flowing silhouettes with innovative, minimal details',
                characteristics: 'Gentle modernism, thoughtful simplicity, quiet progressive elements',
                imagePath: '/static/images/SFIM.png'
            }
        };

        // Style category placeholders with default images for faster loading
        const categoryImages = {
            'B': '/static/images/bold_category.jpg',   // Bold styles 
            'S': '/static/images/subtle_category.jpg', // Subtle styles
            'DEFAULT': '/static/images/style_placeholder.jpg' // Default placeholder
        };

        // Event Listeners - CRITICAL FIX: Check if elements exist before adding listeners
        if (startButton) {
            console.log('Adding start button listener');
            startButton.addEventListener('click', function(e) {
                console.log('Start button clicked!');
                startTest();
                e.preventDefault(); // Prevent default behavior
            });
        } else {
            console.error('Start button not found!');
        }
        
        if (prevButton) prevButton.addEventListener('click', previousQuestion);
        if (nextButton) nextButton.addEventListener('click', nextQuestion);
        if (optionA) optionA.addEventListener('click', () => selectOption('a'));
        if (optionB) optionB.addEventListener('click', () => selectOption('b'));
        if (retakeButton) retakeButton.addEventListener('click', retakeTest);
        if (saveResultsButton) saveResultsButton.addEventListener('click', saveResults);
        if (downloadResultsButton) downloadResultsButton.addEventListener('click', downloadResults);
        if (connectStyleButton) connectStyleButton.addEventListener('click', connectAndStyle);
        if (findBuddiesButton) findBuddiesButton.addEventListener('click', findStyleBuddies);

        // Preload category images for faster loading
        function preloadCategoryImages() {
            Object.values(categoryImages).forEach(imagePath => {
                const img = new Image();
                img.src = imagePath;
            });
        }
        
        // Call preload function immediately
        preloadCategoryImages();
        
        // Check if we have saved results
        function checkForSavedResults() {
            // First try to get from localStorage for quick access
            const savedResults = localStorage.getItem('styleTestResults');
            
            if (savedResults) {
                try {
                    const parsedResults = JSON.parse(savedResults);
                    // Show the results directly if we have them
                    dimensions = parsedResults.dimensions;
                    showResults();
                    return;
                } catch (e) {
                    console.error("Error parsing saved results", e);
                    // Continue to server-side check if local parsing fails
                }
            }
            
            // If no localStorage results, try to get from server
            fetch('/get_style_test')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.results) {
                        // We have server-side results
                        dimensions = {
                            boldSubtle: data.results.boldSubtle || 0,
                            structuredFlowing: data.results.structuredFlowing || 0,
                            classicInnovative: data.results.classicInnovative || 0,
                            minimalExpressive: data.results.minimalExpressive || 0,
                            styleCode: data.results.styleCode,
                            percentages: {
                                boldSubtle: (data.results.boldSubtle / 4) * 100 || 0,
                                structuredFlowing: (data.results.structuredFlowing / 4) * 100 || 0,
                                classicInnovative: (data.results.classicInnovative / 4) * 100 || 0,
                                minimalExpressive: (data.results.minimalExpressive / 4) * 100 || 0
                            }
                        };
                        showResults();
                    }
                })
                .catch(error => {
                    console.error("Error fetching style test results:", error);
                });
        }

        // Functions
        function startTest() {
            console.log('Starting test...');
            if (!introSection || !questionSection) {
                console.error('Required sections not found!', {
                    introSection, 
                    questionSection
                });
                return;
            }
            
            introSection.style.display = 'none';
            questionSection.style.display = 'block';
            if (resultsSection) resultsSection.style.display = 'none';
            loadQuestion(0);
        }

        function loadQuestion(index) {
            const question = questions[index];
            if (!question) {
                console.error(`Question at index ${index} not found!`);
                return;
            }
            
            // Create and set content for question
            const html = `
                <div class="question-category">${question.category}</div>
                <div class="question-text">${question.text}</div>
            `;
            
            if (questionContent) {
                questionContent.innerHTML = html;
            } else {
                console.error('Question content container not found!');
                return;
            }
            
            // Update options
            if (optionA) optionA.textContent = question.options.a;
            if (optionB) optionB.textContent = question.options.b;
            
            // Update selection state
            if (optionA) optionA.classList.remove('selected');
            if (optionB) optionB.classList.remove('selected');
            
            if (answers[index] === 'a') {
                if (optionA) optionA.classList.add('selected');
                if (nextButton) nextButton.disabled = false;
            } else if (answers[index] === 'b') {
                if (optionB) optionB.classList.add('selected');
                if (nextButton) nextButton.disabled = false;
            } else {
                if (nextButton) nextButton.disabled = true;
            }
            
            // Update progress
            if (currentQuestionNum) currentQuestionNum.textContent = index + 1;
            const progressPercentage = ((index + 1) / questions.length) * 100;
            if (progressFill) progressFill.style.width = `${progressPercentage}%`;
            
            // Update navigation buttons
            if (prevButton) prevButton.disabled = index === 0;
            
            // If on last question, change next button text
            if (nextButton) {
                if (index === questions.length - 1) {
                    nextButton.textContent = 'See Results';
                } else {
                    nextButton.textContent = 'Next';
                }
            }
            
            // Update current question index
            currentQuestion = index;
        }

        function selectOption(option) {
            // Remove selected class from both options
            if (optionA) optionA.classList.remove('selected');
            if (optionB) optionB.classList.remove('selected');
            
            // Add selected class to chosen option
            if (option === 'a') {
                if (optionA) optionA.classList.add('selected');
            } else {
                if (optionB) optionB.classList.add('selected');
            }
            
            // Store answer
            answers[currentQuestion] = option;
            
            // Enable next button
            if (nextButton) nextButton.disabled = false;
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                loadQuestion(currentQuestion - 1);
            }
        }

        function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                loadQuestion(currentQuestion + 1);
            } else {
                calculateResults();
                showResults();
            }
        }

        function calculateResults() {
            // Reset dimensions
            dimensions = {
                boldSubtle: 0,
                structuredFlowing: 0,
                classicInnovative: 0,
                minimalExpressive: 0
            };
            
            // Calculate dimensions based on answers
            answers.forEach((answer, index) => {
                const question = questions[index];
                const dimension = question.dimension;
                
                if (answer === 'a') {
                    dimensions[dimension] += question.aValue;
                } else if (answer === 'b') {
                    dimensions[dimension] += question.bValue;
                }
            });
            
            // Normalize to percentages (4 questions per dimension, max 4 points)
            const dimensionPercentages = {
                boldSubtle: (dimensions.boldSubtle / 4) * 100,
                structuredFlowing: (dimensions.structuredFlowing / 4) * 100,
                classicInnovative: (dimensions.classicInnovative / 4) * 100,
                minimalExpressive: (dimensions.minimalExpressive / 4) * 100
            };
            
            // Determine style code
            const styleCode = determineStyleCode(dimensions);
            
            // Store in state for display
            dimensions.percentages = dimensionPercentages;
            dimensions.styleCode = styleCode;
            
            // Also store answers
            dimensions.answers = answers;
        }

        function determineStyleCode(dimensions) {
            // Threshold for determining binary classification
            const threshold = 2; // 2 out of 4 questions
            
            // Determine each letter based on the score
            const boldSubtle = dimensions.boldSubtle < threshold ? 'B' : 'S';
            const structuredFlowing = dimensions.structuredFlowing < threshold ? 'S' : 'F';
            const classicInnovative = dimensions.classicInnovative < threshold ? 'C' : 'I';
            const minimalExpressive = dimensions.minimalExpressive < threshold ? 'M' : 'E';
            
            return boldSubtle + structuredFlowing + classicInnovative + minimalExpressive;
        }
        
        function showResults() {
            console.log('Showing results...');
            
            // Hide intro and question sections
            if (introSection) introSection.style.display = 'none';
            if (questionSection) questionSection.style.display = 'none';
            
            // Show results section
            if (!resultsSection) {
                console.error('Results section not found!');
                return;
            }
            
            resultsSection.style.display = 'block';
            
            // Get style type data
            const styleCode = dimensions.styleCode;
            const styleType = styleTypes[styleCode] || {
                name: 'Unique Style Blend',
                mbti: 'Custom type',
                mbtiUrl: 'https://www.16personalities.com/',
                traits: 'Your style combines elements in a unique way',
                characteristics: 'You have a personalized approach to fashion',
                imagePath: categoryImages.DEFAULT
            };
            
            // Update DOM with results
            const styleCodeEl = document.getElementById('style-code');
            const stylePersonalityEl = document.getElementById('style-personality');
            
            if (styleCodeEl) styleCodeEl.textContent = styleCode;
            if (stylePersonalityEl) stylePersonalityEl.textContent = styleType.name;
            
            // Create MBTI link to 16personalities
            const mbtiMatch = document.getElementById('mbti-match');
            if (mbtiMatch) {
                mbtiMatch.textContent = '';  // Clear existing content
                
                const mbtiLink = document.createElement('a');
                mbtiLink.href = styleType.mbtiUrl;
                mbtiLink.textContent = styleType.mbti;
                mbtiLink.target = "_blank";
                mbtiLink.title = "Learn more about this personality type on 16Personalities.com";
                mbtiMatch.appendChild(mbtiLink);
            }
            
            const keyTraitsEl = document.getElementById('key-traits');
            const characteristicsEl = document.getElementById('characteristics');
            
            if (keyTraitsEl) keyTraitsEl.textContent = styleType.traits;
            if (characteristicsEl) characteristicsEl.textContent = styleType.characteristics;
            
            // Update dimension bars
            const bars = {
                boldSubtle: document.getElementById('bold-subtle-bar'),
                structuredFlowing: document.getElementById('structured-flowing-bar'),
                classicInnovative: document.getElementById('classic-innovative-bar'),
                minimalExpressive: document.getElementById('minimal-expressive-bar')
            };
            
            const percentages = {
                boldSubtle: document.getElementById('bold-subtle-percentage'),
                structuredFlowing: document.getElementById('structured-flowing-percentage'),
                classicInnovative: document.getElementById('classic-innovative-percentage'),
                minimalExpressive: document.getElementById('minimal-expressive-percentage')
            };
            
            if (bars.boldSubtle) bars.boldSubtle.style.width = `${dimensions.percentages.boldSubtle}%`;
            if (bars.structuredFlowing) bars.structuredFlowing.style.width = `${dimensions.percentages.structuredFlowing}%`;
            if (bars.classicInnovative) bars.classicInnovative.style.width = `${dimensions.percentages.classicInnovative}%`;
            if (bars.minimalExpressive) bars.minimalExpressive.style.width = `${dimensions.percentages.minimalExpressive}%`;
            
            if (percentages.boldSubtle) percentages.boldSubtle.textContent = `${Math.round(dimensions.percentages.boldSubtle)}% Subtle`;
            if (percentages.structuredFlowing) percentages.structuredFlowing.textContent = `${Math.round(dimensions.percentages.structuredFlowing)}% Flowing`;
            if (percentages.classicInnovative) percentages.classicInnovative.textContent = `${Math.round(dimensions.percentages.classicInnovative)}% Innovative`;
            if (percentages.minimalExpressive) percentages.minimalExpressive.textContent = `${Math.round(dimensions.percentages.minimalExpressive)}% Expressive`;
            
            // First show a placeholder image for immediate display
            const personalityImage = document.getElementById('personality-image');
            if (personalityImage) {
                // Use the category image first (faster loading)
                const categoryImage = categoryImages[styleCode.charAt(0)] || categoryImages.DEFAULT;
                personalityImage.src = categoryImage;
                personalityImage.alt = 'Loading ' + styleType.name + ' image...';
                
                // Apply size constraints
                personalityImage.style.maxWidth = '250px';
                personalityImage.style.maxHeight = '300px';
                personalityImage.style.width = 'auto';
                personalityImage.style.height = 'auto';
                personalityImage.style.margin = '0 auto';
                personalityImage.style.display = 'block';
                
                // Then load the actual style-specific image
                const styleImage = new Image();
                styleImage.onload = function() {
                    // When the specific style image loads, replace the placeholder
                    personalityImage.src = styleType.imagePath;
                    personalityImage.alt = styleType.name;
                };
                
                styleImage.onerror = function() {
                    // If the specific image fails to load, keep using the category placeholder
                    // but update the alt text to be more accurate
                    personalityImage.alt = styleType.name;
                };
                
                // Start loading the specific image in the background
                styleImage.src = styleType.imagePath;
            }
            
            // Make sure the Connect & Style button is visible
            const connectStyleSection = document.querySelector('.connect-style');
            if (connectStyleSection) {
                connectStyleSection.style.display = 'block';
            }
        }
        
        function retakeTest() {
            // Reset answers
            answers = Array(16).fill(null);
            
            // Reset dimensions
            dimensions = {
                boldSubtle: 0,
                structuredFlowing: 0,
                classicInnovative: 0,
                minimalExpressive: 0
            };
            
            // Clear saved results
            localStorage.removeItem('styleTestResults');
            
            // Clear server-side results
            fetch('/clear_style_test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .catch(error => {
                console.error("Error clearing style test:", error);
            });
            
            // Hide results section
            if (resultsSection) resultsSection.style.display = 'none';
            
            // Show intro section
            if (introSection) introSection.style.display = 'block';
            
            // Reset progress
            if (progressFill) progressFill.style.width = '6.25%';
            if (currentQuestionNum) currentQuestionNum.textContent = '1';
        }

        function saveResults() {
            // Store the results in localStorage for quick access
            const resultsToSave = {
                dimensions: dimensions,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('styleTestResults', JSON.stringify(resultsToSave));
            
            // Also save to server
            fetch('/save_style_test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    styleCode: dimensions.styleCode,
                    boldSubtle: dimensions.boldSubtle,
                    structuredFlowing: dimensions.structuredFlowing,
                    classicInnovative: dimensions.classicInnovative,
                    minimalExpressive: dimensions.minimalExpressive,
                    answers: dimensions.answers
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success notification
                    const saveNote = document.querySelector('.save-note');
                    if (saveNote) {
                        saveNote.textContent = 'Style profile saved successfully!';
                        saveNote.style.color = '#444'; // Change to success color
                        
                        // Reset after 3 seconds
                        setTimeout(() => {
                            saveNote.textContent = 'Your style profile has been saved to your account';
                            saveNote.style.color = '#666';
                        }, 3000);
                    }
                } else {
                    console.error("Failed to save style test:", data.message);
                    // Show error message
                    const saveNote = document.querySelector('.save-note');
                    if (saveNote) {
                        saveNote.textContent = 'Failed to save. ' + (data.message || 'Please try again.');
                        saveNote.style.color = '#d32f2f'; // Error color
                    }
                }
            })
            .catch(error => {
                console.error("Error saving style test:", error);
                // Show error message
                const saveNote = document.querySelector('.save-note');
                if (saveNote) {
                    saveNote.textContent = 'Error saving results. Please try again.';
                    saveNote.style.color = '#d32f2f'; // Error color
                }
            });
        }
        
        function downloadResults() {
            // Get style type data
            const styleCode = dimensions.styleCode;
            const styleType = styleTypes[styleCode] || {
                name: 'Unique Style Blend',
                mbti: 'Custom type',
                traits: 'Your style combines elements in a unique way',
                characteristics: 'You have a personalized approach to fashion'
            };
            
            // Create download content
            const results = {
                styleCode: styleCode,
                styleName: styleType.name,
                mbtiType: styleType.mbti,
                traits: styleType.traits,
                characteristics: styleType.characteristics,
                dimensions: {
                    boldSubtle: Math.round(dimensions.percentages.boldSubtle) + '% Subtle',
                    structuredFlowing: Math.round(dimensions.percentages.structuredFlowing) + '% Flowing',
                    classicInnovative: Math.round(dimensions.percentages.classicInnovative) + '% Innovative',
                    minimalExpressive: Math.round(dimensions.percentages.minimalExpressive) + '% Expressive'
                },
                testDate: new Date().toLocaleString()
            };
            
            // Create text content for the download
            let textContent = `वस्त्रनीति (Vastraniti) Style Personality Test Results\n\n`;
            textContent += `Style Code: ${results.styleCode}\n`;
            textContent += `Style Personality: ${results.styleName}\n`;
            textContent += `MBTI Correlation: ${results.mbtiType}\n\n`;
            textContent += `Key Fashion Traits:\n${results.traits}\n\n`;
            textContent += `Style Characteristics:\n${results.characteristics}\n\n`;
            textContent += `Your Style Dimensions:\n`;
            textContent += `Bold vs Subtle: ${results.dimensions.boldSubtle}\n`;
            textContent += `Structured vs Flowing: ${results.dimensions.structuredFlowing}\n`;
            textContent += `Classic vs Innovative: ${results.dimensions.classicInnovative}\n`;
            textContent += `Minimal vs Expressive: ${results.dimensions.minimalExpressive}\n\n`;
            textContent += `Test Taken On: ${results.testDate}\n\n`;
            textContent += `Visit वस्त्रनीति (Vastraniti) for more style insights and connections.\n`;
            
            // Create a blob for download
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Vastraniti_StyleProfile_${results.styleCode}.txt`;
            
            // Add to DOM, trigger download, then clean up
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        
        function connectAndStyle() {
            // Redirect to events page
            window.location.href = '/events';
        }

        function findStyleBuddies() {
            // For now, this is the same as connectAndStyle
            window.location.href = '/events';
        }

        // Share buttons functionality
        document.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', function() {
                const platform = this.getAttribute('data-platform');
                const styleCode = dimensions.styleCode;
                const styleType = styleTypes[styleCode] ? styleTypes[styleCode].name : 'Unique Style';
                const shareText = `I just discovered my fashion personality: ${styleCode} - ${styleType}! Take the Vastraniti Style Test to find yours.`;
                const shareUrl = encodeURIComponent(window.location.href);
                
                let shareLink = '';
                
                switch(platform) {
                    case 'facebook':
                        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(shareText)}`;
                        break;
                    case 'twitter':
                        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;
                        break;
                    case 'pinterest':
                        shareLink = `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${encodeURIComponent(shareText)}`;
                        break;
                    case 'instagram':
                        // Instagram doesn't support direct sharing via URL
                        alert('To share on Instagram, take a screenshot of your results and share it to your story or feed!');
                        return;
                }
                
                if (shareLink) {
                    window.open(shareLink, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // Check if document is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document already loaded, initializing style test immediately');
        initializeTest();
    } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', initializeTest);
    }
})();