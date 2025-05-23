// static/js/puzzle.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Puzzle.js loaded successfully');
    
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    const targets = document.querySelectorAll('.puzzle-target');
    const completionMessage = document.querySelector('.completion-message');
    const resetButton = document.querySelector('.reset-button');
    
    // Store the correct position for each piece
    const correctPositions = {};
    
    // Initialize the puzzle
    initPuzzle();
    
    function initPuzzle() {
        console.log('Initializing puzzle');
        
        // Store the correct position for each piece
        targets.forEach(target => {
            const id = target.classList[1].split('-')[1]; // target-1 -> 1
            correctPositions[id] = {
                top: target.offsetTop,
                left: target.offsetLeft
            };
        });
        
        // Set up draggability for each piece
        puzzlePieces.forEach(piece => {
            makeDraggable(piece);
        });
        
        // Set up reset button
        if (resetButton) {
            resetButton.addEventListener('click', resetPuzzle);
        }
        
        // Check if we have saved positions
        const savedPuzzle = localStorage.getItem('puzzlePositions');
        if (savedPuzzle) {
            try {
                const positions = JSON.parse(savedPuzzle);
                
                // Apply saved positions
                puzzlePieces.forEach(piece => {
                    const id = piece.classList[1].split('-')[1]; // piece-1 -> 1
                    if (positions[id]) {
                        piece.style.top = positions[id].top + 'px';
                        piece.style.left = positions[id].left + 'px';
                        
                        // If it was snapped, re-snap it
                        if (positions[id].snapped) {
                            snapToTarget(piece, id);
                        }
                    }
                });
                
                // Check if puzzle is already complete
                checkCompletion();
            } catch (e) {
                console.error('Error restoring puzzle:', e);
                localStorage.removeItem('puzzlePositions');
            }
        }
    }
    
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        element.addEventListener('mousedown', dragMouseDown);
        
        function dragMouseDown(e) {
            e.preventDefault();
            
            // Skip if already snapped
            if (element.classList.contains('snapped')) {
                return;
            }
            
            // Get the highest z-index and add 1
            const highestZ = getHighestZIndex();
            element.style.zIndex = highestZ + 1;
            
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
            
            // Add dragging class for visual feedback
            element.classList.add('dragging');
        }
        
        function elementDrag(e) {
            e.preventDefault();
            
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.removeEventListener('mousemove', elementDrag);
            document.removeEventListener('mouseup', closeDragElement);
            
            // Remove dragging class
            element.classList.remove('dragging');
            
            // Check if piece is close to its target
            const id = element.classList[1].split('-')[1]; // piece-1 -> 1
            checkProximity(element, id);
            
            // Save current state
            savePuzzleState();
            
            // Check if all pieces are in place
            checkCompletion();
        }
    }
    
    function checkProximity(piece, id) {
        // Get the current position
        const currentTop = piece.offsetTop;
        const currentLeft = piece.offsetLeft;
        
        // Get the correct position
        const correctTop = correctPositions[id].top;
        const correctLeft = correctPositions[id].left;
        
        // Check if it's close enough (within 30px)
        const topDiff = Math.abs(currentTop - correctTop);
        const leftDiff = Math.abs(currentLeft - correctLeft);
        
        if (topDiff < 30 && leftDiff < 30) {
            snapToTarget(piece, id);
        }
    }
    
    function snapToTarget(piece, id) {
        // Set the piece to the exact target position
        piece.style.top = correctPositions[id].top + 'px';
        piece.style.left = correctPositions[id].left + 'px';
        
        // Add snapped class
        piece.classList.add('snapped');
        
        // Play a sound (optional)
        playSnapSound();
    }
    
    function playSnapSound() {
        // Create a simple "snap" sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        
        // Create gain node
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    function getHighestZIndex() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        let highest = 0;
        
        pieces.forEach(piece => {
            const zIndex = parseInt(getComputedStyle(piece).zIndex, 10);
            if (zIndex > highest) {
                highest = zIndex;
            }
        });
        
        return highest;
    }
    
    function checkCompletion() {
        const allPieces = document.querySelectorAll('.puzzle-piece');
        let allSnapped = true;
        
        allPieces.forEach(piece => {
            if (!piece.classList.contains('snapped')) {
                allSnapped = false;
            }
        });
        
        if (allSnapped) {
            // Puzzle is complete!
            console.log('Puzzle completed!');
            showCompletionMessage();
        }
    }
    
    function showCompletionMessage() {
        if (completionMessage) {
            completionMessage.classList.add('visible');
        }
    }
    
    function resetPuzzle() {
        // Reset each piece to a random position
        puzzlePieces.forEach(piece => {
            piece.classList.remove('snapped');
            piece.style.top = Math.random() * 400 + 50 + 'px';
            piece.style.left = Math.random() * 600 + 100 + 'px';
            piece.style.zIndex = Math.floor(Math.random() * 10) + 1;
        });
        
        // Hide completion message
        if (completionMessage) {
            completionMessage.classList.remove('visible');
        }
        
        // Clear saved state
        localStorage.removeItem('puzzlePositions');
    }
    
    function savePuzzleState() {
        const positions = {};
        
        puzzlePieces.forEach(piece => {
            const id = piece.classList[1].split('-')[1]; // piece-1 -> 1
            positions[id] = {
                top: piece.offsetTop,
                left: piece.offsetLeft,
                snapped: piece.classList.contains('snapped')
            };
        });
        
        localStorage.setItem('puzzlePositions', JSON.stringify(positions));
    }
});