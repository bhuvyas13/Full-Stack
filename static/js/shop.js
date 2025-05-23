document.addEventListener('DOMContentLoaded', () => {
    // Comprehensive location data for India (all states and major cities)
    const locationData = {
        "India": {
            "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur", "Other"],
            "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Other"],
            "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Other"],
            "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah", "Other"],
            "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Other"],
            "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Other"],
            "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Other"],
            "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Other"],
            "Himachal Pradesh": ["Shimla", "Mandi", "Dharamshala", "Solan", "Kullu", "Manali", "Other"],
            "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Hazaribagh", "Deoghar", "Other"],
            "Karnataka": ["Bangalore", "Mysore", "Hubli-Dharwad", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Shimoga", "Udupi", "Other"],
            "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Kottayam", "Palakkad", "Alappuzha", "Malappuram", "Other"],
            "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Ratlam", "Other"],
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded", "Sangli", "Lavasa", "Other"],
            "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Other"],
            "Meghalaya": ["Shillong", "Tura", "Jowai", "Other"],
            "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Other"],
            "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Other"],
            "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Other"],
            "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Other"],
            "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Other"],
            "Sikkim": ["Gangtok", "Namchi", "Mangan", "Other"],
            "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Other"],
            "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Secunderabad", "Other"],
            "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Other"],
            "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Allahabad", "Ghaziabad", "Noida", "Gorakhpur", "Other"],
            "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Other"],
            "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Howrah", "Other"],
            "Andaman and Nicobar Islands": ["Port Blair", "Other"],
            "Chandigarh": ["Chandigarh", "Other"],
            "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Other"],
            "Delhi": ["New Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central Delhi", "Other"],
            "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Other"],
            "Ladakh": ["Leh", "Kargil", "Other"],
            "Lakshadweep": ["Kavaratti", "Agatti", "Other"],
            "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Other"]
        },
        "Other": {
            "Add Custom": ["Add Custom"]
        }
    };

    // Enhanced city coordinates database with precise locations
    const cityCoordinates = {
        // Major metros
        "Mumbai": [19.0760, 72.8777, 12],
        "Delhi": [28.7041, 77.1025, 12],
        "Bangalore": [12.9716, 77.5946, 12],
        "Chennai": [13.0827, 80.2707, 12],
        "Kolkata": [22.5726, 88.3639, 12],
        "Hyderabad": [17.3850, 78.4867, 12],
        "Pune": [18.5204, 73.8567, 12],
        "Ahmedabad": [23.0225, 72.5714, 12],
        "Jaipur": [26.9124, 75.7873, 12],
        "Surat": [21.1702, 72.8311, 12],
        "Lucknow": [26.8467, 80.9462, 12],
        "Kanpur": [26.4499, 80.3319, 12],
        "Nagpur": [21.1458, 79.0882, 12],
        "Visakhapatnam": [17.6868, 83.2185, 12],
        "Indore": [22.7196, 75.8577, 12],
        "Patna": [25.5941, 85.1376, 12],
        "Chandigarh": [30.7333, 76.7794, 12],
        "Coimbatore": [11.0168, 76.9558, 12],
        "Kochi": [9.9312, 76.2673, 12],
        "Guwahati": [26.1445, 91.7362, 12],
        "New Delhi": [28.6139, 77.2090, 12],
        "Thane": [19.2183, 72.9781, 12],
        "Bhopal": [23.2599, 77.4126, 12],
        "Vadodara": [22.3072, 73.1812, 12],
        // Additional cities
        "Agra": [27.1767, 78.0081, 12],
        "Amritsar": [31.6340, 74.8723, 12],
        "Dehradun": [30.3165, 78.0322, 12],
        "Goa": [15.2993, 73.9386, 12],
        "Panaji": [15.4909, 73.8278, 12],
        "Shimla": [31.1048, 77.1734, 12],
        "Udaipur": [24.5854, 73.7125, 12],
        "Varanasi": [25.3176, 82.9739, 12],
        "Rishikesh": [30.0869, 78.2676, 12],
        "Jodhpur": [26.2389, 73.0243, 12],
        "Mysore": [12.2958, 76.6394, 12],
        "Lavasa": [18.4095, 73.5062, 12],
        "Other": [20.5937, 78.9629, 5]
    };

    // Map of state coordinates for India (for zooming to states)
    const stateCoordinates = {
        "Andhra Pradesh": [15.9129, 79.7400, 7],
        "Arunachal Pradesh": [28.2180, 94.7278, 7],
        "Assam": [26.2006, 92.9376, 7],
        "Bihar": [25.0961, 85.3131, 7],
        "Chhattisgarh": [21.2787, 81.8661, 7],
        "Goa": [15.2993, 74.1240, 8],
        "Gujarat": [22.2587, 71.1924, 7],
        "Haryana": [29.0588, 76.0856, 7],
        "Himachal Pradesh": [31.1048, 77.1734, 7],
        "Jharkhand": [23.6102, 85.2799, 7],
        "Karnataka": [15.3173, 75.7139, 7],
        "Kerala": [10.8505, 76.2711, 7],
        "Madhya Pradesh": [22.9734, 78.6569, 7],
        "Maharashtra": [19.7515, 75.7139, 7],
        "Manipur": [24.6637, 93.9063, 7],
        "Meghalaya": [25.4670, 91.3662, 7],
        "Mizoram": [23.1645, 92.9376, 7],
        "Nagaland": [26.1584, 94.5624, 7],
        "Odisha": [20.9517, 85.0985, 7],
        "Punjab": [31.1471, 75.3412, 7],
        "Rajasthan": [27.0238, 74.2179, 7],
        "Sikkim": [27.5330, 88.5122, 7],
        "Tamil Nadu": [11.1271, 78.6569, 7],
        "Telangana": [18.1124, 79.0193, 7],
        "Tripura": [23.9408, 91.9882, 7],
        "Uttar Pradesh": [26.8467, 80.9462, 7],
        "Uttarakhand": [30.0668, 79.0193, 7],
        "West Bengal": [22.9868, 87.8550, 7],
        "Andaman and Nicobar Islands": [11.7401, 92.6586, 7],
        "Chandigarh": [30.7333, 76.7794, 9],
        "Dadra and Nagar Haveli and Daman and Diu": [20.1809, 73.0169, 8],
        "Delhi": [28.7041, 77.1025, 10],
        "Jammu and Kashmir": [33.7782, 76.5762, 7],
        "Ladakh": [34.1526, 77.5770, 7],
        "Lakshadweep": [10.5667, 72.6417, 8],
        "Puducherry": [11.9416, 79.8083, 9],
        "Other": [20.5937, 78.9629, 5]
    };

    // Initialize the main map
    const map = L.map('market-map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize the location picker map
    const locationPickerMap = L.map('location-picker-map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(locationPickerMap);
    let locationMarker = null;

    // Add a click event to the location picker map for precise pin placement
    locationPickerMap.on('click', (e) => {
        // Update marker position
        updateLocationMarker(e.latlng.lat, e.latlng.lng, locationPickerMap);
        
        // Update hidden fields
        document.getElementById('market-lat').value = e.latlng.lat;
        document.getElementById('market-lng').value = e.latlng.lng;
        
        console.log(`Map clicked: Lat ${e.latlng.lat}, Lng ${e.latlng.lng}`);
    });

    // Function to update marker on the map
    function updateLocationMarker(lat, lng, targetMap) {
        // Remove existing marker if any
        if (locationMarker) {
            targetMap.removeLayer(locationMarker);
        }
        
        // Create a new marker at the specified coordinates
        locationMarker = L.marker([lat, lng]).addTo(targetMap);
        
        // Update the hidden form fields
        document.getElementById('market-lat').value = lat;
        document.getElementById('market-lng').value = lng;
    }

    // Market data and markers
    let markets = [];
    const markers = L.layerGroup().addTo(map);

    // Modal functionality
    const modal = document.getElementById('add-market-modal');
    const addBtn = document.getElementById('add-market-btn');
    const closeBtn = document.querySelector('.close-modal');

    addBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        resetForm();
    };
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetForm();
        }
    };

    // Function to populate state dropdown based on country
    function populateStates() {
        const countrySelect = document.getElementById('market-country');
        const stateSelect = document.getElementById('market-state');
        
        // Clear existing options
        stateSelect.innerHTML = '<option value="">Select State (Optional)</option>';
        
        // Get states for selected country
        const states = Object.keys(locationData[countrySelect.value] || {});
        
        // Populate state options
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
        
        // State is always enabled (optional)
        stateSelect.disabled = false;
        
        // Reset city select
        const citySelect = document.getElementById('market-city');
        citySelect.innerHTML = '<option value="">Select City/District (Optional)</option>';
        citySelect.disabled = false;
    }

    // Function to populate city dropdown based on state
    function populateCities() {
        const countrySelect = document.getElementById('market-country');
        const stateSelect = document.getElementById('market-state');
        const citySelect = document.getElementById('market-city');
        
        // Clear existing options
        citySelect.innerHTML = '<option value="">Select City/District (Optional)</option>';
        
        // If no state is selected, leave city dropdown with just the empty option
        if (!stateSelect.value) {
            return;
        }
        
        // Get cities for selected state
        const cities = locationData[countrySelect.value][stateSelect.value] || [];
        
        // Populate city options
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        
        // City is always enabled (optional)
        citySelect.disabled = false;
        
        // Update map view based on selection if it's a known location
        if (stateSelect.value !== "Add Custom") {
            updateMapView(stateSelect.value);
        }
    }

    // Enhanced function to update map view based on location and automatically set pin
    function updateMapView(location) {
        // Default coordinates for India
        let lat = 20.5937;
        let lng = 78.9629;
        let zoom = 5;
        
        // Check if it's a city first
        if (cityCoordinates[location]) {
            [lat, lng, zoom] = cityCoordinates[location];
            
            // For cities, we set a precise marker automatically
            if (zoom >= 10) {
                // Center both maps 
                map.setView([lat, lng], zoom);
                locationPickerMap.setView([lat, lng], zoom);
                
                // Update marker on location picker map
                updateLocationMarker(lat, lng, locationPickerMap);
                
                console.log(`City coordinates set: ${location} at Lat ${lat}, Lng ${lng}, Zoom ${zoom}`);
                return;
            }
        } 
        // Then check if it's a state
        else if (stateCoordinates[location]) {
            [lat, lng, zoom] = stateCoordinates[location];
        }
        
        // Update both maps without adding a marker for states (less specific)
        locationPickerMap.setView([lat, lng], zoom);
        map.setView([lat, lng], zoom);
        
        console.log(`View updated to: ${location} at Lat ${lat}, Lng ${lng}, Zoom ${zoom}`);
    }

    // Function to get precise city coordinates
    function getCityCoordinates(cityName) {
        // Return precise coordinates if available
        if (cityCoordinates[cityName] && cityCoordinates[cityName].length >= 2) {
            return [cityCoordinates[cityName][0], cityCoordinates[cityName][1]];
        }
        
        // Default to India coordinates if the city isn't found
        return [20.5937, 78.9629];
    }

    // Load markets from the server
    function loadMarkets() {
        // Show loading indicator
        document.getElementById('market-list').innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading markets...</p>
            </div>
        `;
        
        fetch('/api/markets')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    markets = data;
                    updateMarketMarkers();
                    updateMarketList();
                } else {
                    console.error('Invalid data format received:', data);
                    document.getElementById('market-list').innerHTML = '<div class="no-results">Error loading markets. Please try again later.</div>';
                }
            })
            .catch(error => {
                console.error('Error loading markets:', error);
                document.getElementById('market-list').innerHTML = '<div class="no-results">Error loading markets. Please try again later.</div>';
            });
    }

    // Update markers on the map
    function updateMarketMarkers(filteredMarkets = markets) {
        markers.clearLayers();
        
        if (!filteredMarkets || filteredMarkets.length === 0) {
            return;
        }
        
        filteredMarkets.forEach(market => {
            // Verify coordinates exist and are valid
            if (market.location && 
                market.location.coordinates && 
                market.location.coordinates.length === 2 &&
                !isNaN(market.location.coordinates[0]) && 
                !isNaN(market.location.coordinates[1])) {
                
                // Create marker with exact coordinates
                const marker = L.marker([
                    market.location.coordinates[1], // Latitude 
                    market.location.coordinates[0]  // Longitude
                ]);
                
                const popupContent = `
                    <div class="market-popup">
                        <h3>${market.name}</h3>
                        <p><strong>Location:</strong> ${market.city ? market.city + ', ' : ''}${market.state || ''}</p>
                        <p><strong>Best for:</strong> ${market.best_for}</p>
                        <p><strong>Price range:</strong> ${market.price_range}</p>
                        ${market.tips ? `<p><strong>Tips:</strong> ${market.tips}</p>` : ''}
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                markers.addLayer(marker);
            } else {
                console.warn('Invalid market coordinates:', market);
            }
        });
    }

    // Update the sidebar market list
    function updateMarketList(filteredMarkets = markets) {
        const marketList = document.getElementById('market-list');
        
        if (!filteredMarkets || filteredMarkets.length === 0) {
            marketList.innerHTML = '<div class="no-results">No markets found matching your criteria</div>';
            return;
        }
        
        marketList.innerHTML = filteredMarkets.map(market => {
            // Ensure coordinates exist before accessing them
            const lat = market.location && market.location.coordinates ? market.location.coordinates[1] : null;
            const lng = market.location && market.location.coordinates ? market.location.coordinates[0] : null;
            
            if (lat === null || lng === null) {
                console.warn('Market missing coordinates:', market);
            }
            
            return `
                <div class="market-card" data-lat="${lat}" data-lng="${lng}">
                    <h4>${market.name}</h4>
                    <p class="location">${market.city ? market.city + ', ' : ''}${market.state || ''}</p>
                    <p class="best-for"><strong>Best for:</strong> ${market.best_for}</p>
                    <p class="price"><strong>Price:</strong> ${market.price_range}</p>
                    ${market.tips ? `<p class="tips">${market.tips.substring(0, 60)}${market.tips.length > 60 ? '...' : ''}</p>` : ''}
                </div>
            `;
        }).join('');
        
        // Add click event to market cards
        document.querySelectorAll('.market-card').forEach(card => {
            card.addEventListener('click', () => {
                const lat = parseFloat(card.dataset.lat);
                const lng = parseFloat(card.dataset.lng);
                
                // Validate coordinates before attempting to use them
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.setView([lat, lng], 15);
                    
                    // Highlight the corresponding marker
                    markers.eachLayer(marker => {
                        const markerLatLng = marker.getLatLng();
                        // Use a small tolerance for floating point comparisons
                        const latDiff = Math.abs(markerLatLng.lat - lat);
                        const lngDiff = Math.abs(markerLatLng.lng - lng);
                        
                        if (latDiff < 0.0001 && lngDiff < 0.0001) {
                            marker.openPopup();
                        }
                    });
                } else {
                    console.error('Invalid coordinates for market card:', card);
                }
            });
        });
    }

    // Enhanced filter markets function
    function filterMarkets() {
        const searchTerm = document.getElementById('location-search').value.toLowerCase();
        const category = document.getElementById('category-filter').value;
        const price = document.getElementById('price-filter').value;
        
        let filtered = markets;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(market => 
                market.name.toLowerCase().includes(searchTerm) || 
                (market.city && market.city.toLowerCase().includes(searchTerm)) ||
                (market.state && market.state.toLowerCase().includes(searchTerm)) ||
                (market.best_for && market.best_for.toLowerCase().includes(searchTerm)) ||
                (market.tips && market.tips.toLowerCase().includes(searchTerm)))
        }
        
        // Apply category filter
        if (category !== 'all') {
            filtered = filtered.filter(market => 
                (market.category && market.category.toLowerCase() === category.toLowerCase()) ||
                (market.best_for && market.best_for.toLowerCase().includes(category.toLowerCase())))
        }
        
        // Apply price filter
        if (price !== 'all') {
            filtered = filtered.filter(market => {
                // Ensure price_range exists
                if (!market.price_range) return false;
                
                const priceRange = market.price_range.toLowerCase();
                if (price === 'budget') return priceRange.includes('under ₹500') || priceRange.includes('₹100-500');
                if (price === 'mid') return priceRange.includes('₹500-2000') || priceRange.includes('₹1000-2000');
                if (price === 'premium') return priceRange.includes('₹2000+') || priceRange.includes('above ₹2000');
                return true;
            });
        }
        
        updateMarketMarkers(filtered);
        updateMarketList(filtered);
    }

    // Function to reset the form completely
    function resetForm() {
        document.getElementById('market-form').reset();
        
        // Reset location marker
        if (locationMarker) {
            locationPickerMap.removeLayer(locationMarker);
            locationMarker = null;
        }
        
        // Reset hidden lat/lng values
        document.getElementById('market-lat').value = '';
        document.getElementById('market-lng').value = '';
        
        // Reset state and city dropdowns
        document.getElementById('market-state').innerHTML = '<option value="">Select State (Optional)</option>';
        document.getElementById('market-city').innerHTML = '<option value="">Select City/District (Optional)</option>';
        
        // Enable dropdowns
        document.getElementById('market-state').disabled = false;
        document.getElementById('market-city').disabled = false;
        
        // Center map back to India
        locationPickerMap.setView([20.5937, 78.9629], 5);
        
        // Remove any success messages
        const successMsg = document.querySelector('.success-message');
        if (successMsg) {
            successMsg.remove();
        }
    }

    // Handle form submission with enhanced validation
    document.getElementById('market-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Get form values
        const marketName = document.getElementById('market-name').value.trim();
        const marketCategory = document.getElementById('market-category').value;
        const marketPrice = document.getElementById('market-price').value.trim();
        const marketBest = document.getElementById('market-best').value.trim();
        
        // Basic validation
        if (!marketName || !marketCategory || !marketPrice || !marketBest) {
            alert('Please fill all required fields');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            return;
        }
        
        // Get coordinates from map or city
        let lat = document.getElementById('market-lat').value;
        let lng = document.getElementById('market-lng').value;
        
        // If coordinates are not set but city is selected, use city coordinates
        if ((!lat || !lng) && document.getElementById('market-city').value) {
            const city = document.getElementById('market-city').value;
            // Try to get coordinates from our cityCoordinates lookup
            const cityCoords = getCityCoordinates(city);
            if (cityCoords) {
                lat = cityCoords[0];
                lng = cityCoords[1];
                // Update the hidden fields
                document.getElementById('market-lat').value = lat;
                document.getElementById('market-lng').value = lng;
                
                console.log(`Using coordinates for ${city}: Lat ${lat}, Lng ${lng}`);
            }
        }
        
        const marketData = {
            name: marketName,
            state: document.getElementById('market-state').value || "Other",
            city: document.getElementById('market-city').value || "Other",
            country: document.getElementById('market-country').value || "India",
            area: document.getElementById('market-area').value || "",
            category: marketCategory,
            price_range: marketPrice,
            best_for: marketBest,
            tips: document.getElementById('market-tips').value || "",
            location: {
                type: 'Point',
                coordinates: [
                    parseFloat(lng) || 78.9629, // Default to India coordinates if not set
                    parseFloat(lat) || 20.5937
                ]
            }
        };
        
        console.log('Submitting market data:', marketData);
        
        // Send to server
        fetch('/api/markets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(marketData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            if (data.success) {
                // Create and show a success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = 'Market added successfully!';
                document.querySelector('.modal-content').appendChild(successMsg);
                
                // Hide the success message after 3 seconds
                setTimeout(() => {
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.remove(), 500);
                }, 3000);
                
                // Reset form and close modal
                resetForm();
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 1500);
                
                // Refresh the market list with new data
                loadMarkets();
            } else {
                alert('Error: ' + (data.message || 'Failed to add market'));
            }
        })
        .catch(error => {
            console.error('Error submitting market:', error);
            alert('An error occurred while adding the market. Please try again later.');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
    });

    // Event listeners for filters
    document.getElementById('location-search').addEventListener('input', filterMarkets);
    document.getElementById('category-filter').addEventListener('change', filterMarkets);
    document.getElementById('price-filter').addEventListener('change', filterMarkets);
    document.getElementById('search-btn').addEventListener('click', filterMarkets);

    // Event listeners for dropdowns
    document.getElementById('market-country').addEventListener('change', populateStates);
    document.getElementById('market-state').addEventListener('change', populateCities);
    document.getElementById('market-city').addEventListener('change', function() {
        if (this.value && this.value !== 'Other') {
            updateMapView(this.value);
        }
    });

    // Initial population of states based on default country
    if (document.getElementById('market-country').value) {
        populateStates();
    }

    // Initial load of markets
    loadMarkets();
    
    // Add Lavasa to coordinates if not present
    if (!cityCoordinates["Lavasa"]) {
        cityCoordinates["Lavasa"] = [18.4095, 73.5062, 12];
    }
    
    console.log('Fashion Market Explorer initialized successfully');
});