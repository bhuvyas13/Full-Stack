// static/js/chatbot.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing chatbot');
    
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    console.log('Elements found:', {
        chatMessages: !!chatMessages,
        userInput: !!userInput,
        sendButton: !!sendButton
    });

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Fallback responses when API is unavailable
    const fallbackResponses = [
        "I apologize, but I'm having trouble connecting to my fashion database right now. Please try again later.",
        "For casual summer outfits, lightweight fabrics like cotton and linen are perfect. Pair with sandals or sneakers for a complete look.",
        "A well-fitted blazer can transform any outfit from casual to professional instantly.",
        "When building a wardrobe, focus on versatile pieces that can be mixed and matched.",
        "For winter layering, start with a thin base layer, add an insulating middle layer, and finish with a protective outer layer.",
        "Accessories can completely transform a simple outfit. Try statement earrings or a bold scarf.",
        "Sorry, I'm currently experiencing technical difficulties. Our team is working on it!"
    ];

    // Function to get a random fallback response
    function getFallbackResponse(query) {
        // If the query contains certain keywords, try to give a relevant response
        if (query.toLowerCase().includes("summer") || query.toLowerCase().includes("hot")) {
            return fallbackResponses[1];
        } else if (query.toLowerCase().includes("winter") || query.toLowerCase().includes("cold")) {
            return fallbackResponses[4];
        } else if (query.toLowerCase().includes("accessories")) {
            return fallbackResponses[5];
        } else if (query.toLowerCase().includes("professional") || query.toLowerCase().includes("work")) {
            return fallbackResponses[2];
        } else if (query.toLowerCase().includes("wardrobe") || query.toLowerCase().includes("essentials")) {
            return fallbackResponses[3];
        } else {
            // Return a general error message or a random response
            return fallbackResponses[0];
        }
    }

    // Function to send a message to the API and get a response
    async function sendMessage(message) {
        console.log('Sending message to API:', message);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });
            
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                
                // If the server returned a specific response for the error, use it
                if (errorData.response) {
                    return errorData.response;
                }
                
                // Otherwise use our fallback
                return "I'm having trouble with my fashion database right now. " +
                       "Here's what I can tell you about your question: " + 
                       getFallbackResponse(message);
            }
            
            const data = await response.json();
            console.log('API response data:', data);
            return data.response;
        } catch (error) {
            console.error('Error communicating with API:', error);
            return "I'm having trouble accessing my fashion database right now. " +
                   "Here's what I can tell you about " + message + ": " + 
                   getFallbackResponse(message);
        }
    }

    // Function to handle sending messages
    async function handleSend() {
        const message = userInput.value.trim();
        
        if (message.length === 0) {
            return;
        }
        
        // Add user message to chat
        addMessage(message, true);
        
        // Clear input field
        userInput.value = '';
        
        // Show loading indicator
        const loadingMessage = 'Thinking...';
        const loadingMessageDiv = document.createElement('div');
        loadingMessageDiv.className = 'message bot-message';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content';
        loadingContent.textContent = loadingMessage;
        
        loadingMessageDiv.appendChild(loadingContent);
        chatMessages.appendChild(loadingMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Get bot response
        const botResponse = await sendMessage(message);
        
        // Remove loading message
        chatMessages.removeChild(loadingMessageDiv);
        
        // Add bot response to chat
        addMessage(botResponse);
    }

    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', handleSend);
        console.log('Send button event listener added');
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
        console.log('User input keypress event listener added');
    }
});