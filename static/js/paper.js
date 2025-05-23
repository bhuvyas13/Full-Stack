document.addEventListener('DOMContentLoaded', function() {
    console.log('Frame wall initialized');
    const papers = document.querySelectorAll('.paper:not(.paper-5)'); // Exclude paper-5 from draggable elements
    const eventsFrame = document.querySelector('.paper-5'); // Get the events frame separately
    const robot = document.querySelector('.robot-container');
    
    // Position events frame in top right corner
    if (eventsFrame) {
        eventsFrame.style.position = 'fixed';
        eventsFrame.style.top = '20px';
        eventsFrame.style.right = '20px';
        eventsFrame.style.left = 'auto';
        eventsFrame.style.zIndex = '15';
        
        // Make it only clickable, not draggable
        eventsFrame.addEventListener('click', function() {
            const link = eventsFrame.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    }
    
    // Get saved frame positions from local storage
    if (!localStorage.getItem('framePositions')) {
        const initialPositions = {};
        papers.forEach(paper => {
            const id = paper.classList[1]; // paper-1, paper-2, etc.
            initialPositions[id] = {
                top: paper.style.top || getComputedStyle(paper).top,
                left: paper.style.left || getComputedStyle(paper).left,
                zIndex: paper.style.zIndex || getComputedStyle(paper).zIndex
            };
        });
        localStorage.setItem('framePositions', JSON.stringify(initialPositions));
    } else {
        // Restore saved positions
        try {
            const savedPositions = JSON.parse(localStorage.getItem('framePositions'));
            papers.forEach(paper => {
                const id = paper.classList[1];
                if (savedPositions[id]) {
                    paper.style.top = savedPositions[id].top;
                    paper.style.left = savedPositions[id].left;
                    paper.style.zIndex = savedPositions[id].zIndex;
                }
            });
        } catch (e) {
            console.error('Error restoring frame positions:', e);
            localStorage.removeItem('framePositions');
        }
    }
    
    // Set up draggable functionality for each paper (except events frame)
    papers.forEach(paper => {
        makeDraggable(paper);
    });
    
    // Set up robot click handler
    if (robot) {
        robot.addEventListener('click', function() {
            const link = robot.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        });
    }
    
    // Set up reset button
    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('framePositions');
            location.reload();
        });
    }
});

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let clickStartTime = 0;
    const clickThreshold = 150; // milliseconds - reduced from 200
    const moveThreshold = 2; // pixels - reduced from 5 to make it more responsive
    
    element.addEventListener('mousedown', dragMouseDown);
    
    function dragMouseDown(e) {
        e.preventDefault(); // Prevent default behavior to improve responsiveness
        clickStartTime = Date.now();
        
        // Get the highest z-index and add 1
        const highestZ = getHighestZIndex();
        element.style.zIndex = highestZ + 1;
        
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', closeDragElement);
        
        element.classList.add('dragging');
    }
    
    function elementDrag(e) {
        e.preventDefault(); // Prevent default to ensure smooth dragging
        
        // Start dragging immediately with minimal threshold
        if (Math.abs(e.clientX - pos3) > moveThreshold || Math.abs(e.clientY - pos4) > moveThreshold) {
            isDragging = true;
        }
        
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set the element's new position immediately
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement(e) {
        // Stop moving when mouse button is released
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        
        // Remove dragging class
        element.classList.remove('dragging');
        
        // Check if it was a click (short time and small movement)
        const clickDuration = Date.now() - clickStartTime;
        if (!isDragging && clickDuration < clickThreshold) {
            const link = element.getAttribute('data-link');
            if (link) {
                window.location.href = link;
            }
        }
        
        // Save the new position if we dragged
        if (isDragging) {
            saveFrameState(element);
        }
        
        // Reset drag state
        isDragging = false;
    }
}

function getHighestZIndex() {
    const papers = document.querySelectorAll('.paper');
    let highest = 0;
    
    papers.forEach(paper => {
        const zIndex = parseInt(getComputedStyle(paper).zIndex, 10);
        if (zIndex > highest) {
            highest = zIndex;
        }
    });
    
    return highest;
}

function saveFrameState(element) {
    const id = element.classList[1];
    let savedPositions = JSON.parse(localStorage.getItem('framePositions')) || {};
    
    savedPositions[id] = {
        top: element.style.top,
        left: element.style.left,
        zIndex: element.style.zIndex
    };
    
    localStorage.setItem('framePositions', JSON.stringify(savedPositions));
}