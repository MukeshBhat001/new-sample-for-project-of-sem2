// Global variables
let currentUser = null;
let searchData = [];
let isStudentDiscount = false;
let basePrices = {
    'tour': 500,
    'hiking': 800
};

// Enhanced functionality with student discount
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced website loaded successfully!');
    
    // Initialize all functionality
    initializeNavigation();
    initializeAuth();
    initializeSearch();
    initializeBooking();
    initializeAnimations();
    initializeScrollEffects();
    initializeSearchData();
    loadUserSession();
    initializeStudentDiscount();
    
    // Weather functionality
    const weatherForm = document.getElementById('weatherForm');
    if (weatherForm) {
        weatherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const cityInput = document.getElementById('cityInput');
            const city = cityInput.value.trim();
            
            if (city) {
                console.log(`Searching weather for: ${city}`);
                getWeatherForCity(city);
            } else {
                showNotification('Please enter a city name', 'error');
            }
        });
    }

    // Contact form functionality
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[placeholder="Your Name"]').value;
            const email = contactForm.querySelector('input[placeholder="Your Email"]').value;
            const subject = contactForm.querySelector('input[placeholder="Subject"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Save contact message to localStorage
            const contacts = JSON.parse(localStorage.getItem('nepalTourismContacts') || '[]');
            contacts.push({
                id: Date.now(),
                name,
                email,
                subject,
                message,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('nepalTourismContacts', JSON.stringify(contacts));
            
            showNotification(`Thank you ${name}! Your message has been sent successfully.`, 'success');
            contactForm.reset();
        });
    }
    
    console.log('All enhanced functionality initialized successfully!');
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            console.log('Mobile menu toggled');
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link, .dropdown-item').forEach(n => n.addEventListener('click', (e) => {
            // Don't close menu if clicking dropdown toggle
            if (!e.target.closest('.dropdown-toggle')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('Mobile menu closed');
            }
        }));

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Handle dropdown toggle on mobile
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                const dropdown = this.closest('.nav-dropdown');
                dropdown.classList.toggle('active');
            }
        });
    }
}

// Authentication functionality
function initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal('loginModal'));
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => openModal('signupModal'));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('nepalTourismUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('nepalTourismCurrentUser', JSON.stringify(user));
        updateAuthUI();
        closeModal('loginModal');
        showNotification('Welcome back, ' + user.name + '!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('nepalTourismUsers') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showNotification('User already exists with this email', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('nepalTourismUsers', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('nepalTourismCurrentUser', JSON.stringify(newUser));
    
    updateAuthUI();
    closeModal('signupModal');
    showNotification('Account created successfully! Welcome, ' + name + '!', 'success');
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('nepalTourismCurrentUser');
    updateAuthUI();
    showNotification('Logged out successfully', 'success');
}

// Load user session
function loadUserSession() {
    const savedUser = localStorage.getItem('nepalTourismCurrentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// Update authentication UI
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userMenu) userMenu.classList.remove('hidden');
        if (userName) userName.textContent = currentUser.name;
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (signupBtn) signupBtn.style.display = 'flex';
        if (userMenu) userMenu.classList.add('hidden');
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    console.log('Initializing search...');
    console.log('Search input found:', !!searchInput);
    console.log('Search results found:', !!searchResults);
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        searchInput.addEventListener('focus', () => {
            console.log('Search input focused');
            if (searchInput.value.trim()) {
                handleSearch({ target: searchInput });
            } else {
                showPopularSearches();
            }
        });
        
        // Clear search results when input is empty
        searchInput.addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                showPopularSearches();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
            searchResults?.classList.add('hidden');
        }
    });
}

// Initialize search data
function initializeSearchData() {
    searchData = [
        { name: 'Kathmandu', type: 'Tourism', url: 'kathmandu.html', description: 'Historic capital with ancient temples' },
        { name: 'Pokhara', type: 'Tourism', url: 'pokhara.html', description: 'Beautiful lake city and adventure hub' },
        { name: 'Chitwan National Park', type: 'Tourism', url: 'chitwan.html', description: 'Wildlife safari and nature experience' },
        { name: 'Lumbini', type: 'Tourism', url: 'lumbini.html', description: 'Birthplace of Lord Buddha' },
        { name: 'Everest Base Camp', type: 'Hiking', url: 'everest-base-camp.html', description: 'World\'s most famous trek' },
        { name: 'Annapurna Circuit', type: 'Hiking', url: 'annapurna-circuit.html', description: 'Classic Himalayan adventure' },
        { name: 'Langtang Valley', type: 'Hiking', url: 'langtang-valley.html', description: 'Valley of glaciers trek' },
        { name: 'Manaslu Circuit', type: 'Hiking', url: '#', description: 'Remote mountain adventure' },
        { name: 'Gokyo Lakes', type: 'Hiking', url: '#', description: 'Beautiful high-altitude lakes' },
        { name: 'Bandipur', type: 'Tourism', url: '#', description: 'Medieval hilltop town' }
    ];
}

// Enhanced search with better matching
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) {
        console.log('Search results element not found');
        return;
    }
    
    if (query.length === 0) {
        showPopularSearches();
        return;
    }
    
    if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }
    
    const results = searchData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    
    console.log('Search results found:', results.length);
    displaySearchResults(results);
}

// Display search results with better styling and positioning
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchResults) {
        console.log('Search results container not found');
        return;
    }
    
    // Ensure proper positioning
    if (searchContainer) {
        const searchBox = searchContainer.querySelector('.search-box');
        if (searchBox) {
            const rect = searchBox.getBoundingClientRect();
            const containerRect = searchContainer.getBoundingClientRect();
            
            // Position results relative to search box
            searchResults.style.position = 'absolute';
            searchResults.style.top = '100%';
            searchResults.style.left = '0';
            searchResults.style.right = '0';
            searchResults.style.marginTop = '8px';
        }
    }
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <span>No results found</span>
                <small>Try searching for destinations like "Kathmandu" or "Everest"</small>
            </div>
        `;
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="navigateToResult('${result.url}')">
                <div class="search-result-meta">
                    <strong>${result.name}</strong> 
                    <span class="search-result-type">${result.type}</span>
                </div>
                <small>${result.description}</small>
            </div>
        `).join('');
    }
    
    searchResults.classList.remove('hidden');
    console.log('Search results displayed with proper positioning');
}

// Add placeholder search on focus with better styling
function showPopularSearches() {
    const searchResults = document.getElementById('searchResults');
    const popularSearches = [
        { name: 'Everest Base Camp', type: 'Hiking', url: 'everest-base-camp.html', description: 'World\'s most famous trek to the base of Mount Everest' },
        { name: 'Kathmandu', type: 'Tourism', url: 'kathmandu.html', description: 'Historic capital with ancient temples and UNESCO sites' },
        { name: 'Pokhara', type: 'Tourism', url: 'pokhara.html', description: 'Beautiful lake city and adventure hub' },
        { name: 'Annapurna Circuit', type: 'Hiking', url: 'annapurna-circuit.html', description: 'Classic Himalayan adventure trek' },
        { name: 'Chitwan National Park', type: 'Tourism', url: 'chitwan.html', description: 'Wildlife safari and jungle experience' }
    ];
    
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="search-result-header">
                <i class="fas fa-fire"></i>
                Popular Destinations
            </div>
            ${popularSearches.map(result => `
                <div class="search-result-item" onclick="navigateToResult('${result.url}')">
                    <div class="search-result-meta">
                        <strong>${result.name}</strong> 
                        <span class="search-result-type">${result.type}</span>
                    </div>
                    <small>${result.description}</small>
                </div>
            `).join('')}
        `;
        searchResults.classList.remove('hidden');
    }
}

// Navigate to search result
function navigateToResult(url) {
    if (url && url !== '#') {
        window.location.href = url;
    }
    document.getElementById('searchResults').classList.add('hidden');
}

// Perform search
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        console.log('Searching for:', query);
        showNotification(`Searching for "${query}"...`, 'info');
    }
}

// Booking functionality
function initializeBooking() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
}

// Student discount functionality
function initializeStudentDiscount() {
    const studentIdImage = document.getElementById('studentIdImage');
    if (studentIdImage) {
        studentIdImage.addEventListener('change', handleFileUpload);
    }
    
    // Listen for changes in form fields to update price
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('change', updatePriceSummary);
    }
}

// Toggle student discount section
function toggleStudentDiscount() {
    const studentSection = document.getElementById('studentSection');
    const discountRow = document.getElementById('discountRow');
    
    if (studentSection && discountRow) {
        isStudentDiscount = !isStudentDiscount;
        
        if (isStudentDiscount) {
            studentSection.classList.remove('hidden');
            discountRow.classList.remove('hidden');
            showNotification('Student discount section opened. Please fill in your details.', 'info');
        } else {
            studentSection.classList.add('hidden');
            discountRow.classList.add('hidden');
            // Clear student fields
            document.getElementById('collegeName').value = '';
            document.getElementById('studentId').value = '';
            document.getElementById('studentIdImage').value = '';
            removeFile();
        }
        
        updatePriceSummary();
    }
}

// Handle file upload for student ID
function handleFileUpload(e) {
    const file = e.target.files[0];
    const filePreview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                filePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
            showNotification('Student ID image uploaded successfully', 'success');
        } else {
            showNotification('Please upload a valid image file', 'error');
            e.target.value = '';
        }
    }
}

// Remove uploaded file
function removeFile() {
    const filePreview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    const studentIdImage = document.getElementById('studentIdImage');
    
    if (filePreview && previewImage && studentIdImage) {
        filePreview.classList.add('hidden');
        previewImage.src = '';
        studentIdImage.value = '';
    }
}

// Update price summary
function updatePriceSummary() {
    const destination = document.getElementById('bookingDestination')?.value;
    const people = parseInt(document.getElementById('bookingPeople')?.value) || 1;
    const basePrice = document.getElementById('basePrice');
    const discountAmount = document.getElementById('discountAmount');
    const totalPrice = document.getElementById('totalPrice');
    
    if (!basePrice || !totalPrice) return;
    
    // Determine base price based on destination type
    let pricePerPerson = basePrices.tour; // default
    if (destination && (destination.includes('Trek') || destination.includes('Base Camp') || destination.includes('Circuit'))) {
        pricePerPerson = basePrices.hiking;
    }
    
    const base = pricePerPerson * people;
    let discount = 0;
    let total = base;
    
    if (isStudentDiscount) {
        discount = base * 0.5; // 50% discount
        total = base - discount;
    }
    
    basePrice.textContent = `$${base}`;
    if (discountAmount) discountAmount.textContent = `-$${discount}`;
    totalPrice.textContent = `$${total}`;
}

// Open booking modal with proper validation
function openBookingModal(type, destination = '') {
    if (!currentUser) {
        showNotification('Please login to book a trip', 'error');
        setTimeout(() => openModal('loginModal'), 500);
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    const title = document.getElementById('bookingTitle');
    const destinationSelect = document.getElementById('bookingDestination');
    
    if (!modal || !title || !destinationSelect) {
        console.error('Booking modal elements not found');
        return;
    }
    
    // Set title based on type
    if (type === 'tour') {
        title.innerHTML = '<i class="fas fa-map-marked-alt"></i> Book Your Tour';
        populateDestinations(destinationSelect, 'tour');
    } else if (type === 'hiking') {
        title.innerHTML = '<i class="fas fa-hiking"></i> Book Your Trek';
        populateDestinations(destinationSelect, 'hiking');
    }
    
    // Pre-select destination if provided
    if (destination) {
        setTimeout(() => {
            destinationSelect.value = destination;
            updatePriceSummary();
        }, 100);
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Reset student discount
    isStudentDiscount = false;
    const studentSection = document.getElementById('studentSection');
    const discountRow = document.getElementById('discountRow');
    if (studentSection) studentSection.classList.add('hidden');
    if (discountRow) discountRow.classList.add('hidden');
    
    updatePriceSummary();
    openModal('bookingModal');
}

// Populate destinations
function populateDestinations(select, type) {
    const tourDestinations = [
        'Kathmandu City Tour',
        'Pokhara Lake Tour',
        'Chitwan Safari',
        'Lumbini Pilgrimage',
        'Bandipur Heritage Tour'
    ];
    
    const hikingDestinations = [
        'Everest Base Camp Trek',
        'Annapurna Circuit Trek',
        'Langtang Valley Trek',
        'Manaslu Circuit Trek',
        'Gokyo Lakes Trek'
    ];
    
    const destinations = type === 'tour' ? tourDestinations : hikingDestinations;
    
    select.innerHTML = '<option value="">Select Destination</option>' +
        destinations.map(dest => `<option value="${dest}">${dest}</option>`).join('');
}

// Handle booking
function handleBooking(e) {
    e.preventDefault();
    
    const bookingData = {
        id: Date.now(),
        userId: currentUser.id,
        name: document.getElementById('bookingName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        destination: document.getElementById('bookingDestination').value,
        date: document.getElementById('bookingDate').value,
        people: document.getElementById('bookingPeople').value,
        message: document.getElementById('bookingMessage').value,
        isStudent: isStudentDiscount,
        studentDetails: isStudentDiscount ? {
            collegeName: document.getElementById('collegeName').value,
            studentId: document.getElementById('studentId').value,
            hasIdImage: document.getElementById('studentIdImage').files.length > 0
        } : null,
        totalPrice: document.getElementById('totalPrice').textContent,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Validate student details if discount is applied
    if (isStudentDiscount) {
        if (!bookingData.studentDetails.collegeName || !bookingData.studentDetails.studentId || !bookingData.studentDetails.hasIdImage) {
            showNotification('Please complete all student verification details', 'error');
            return;
        }
    }
    
    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('nepalTourismBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('nepalTourismBookings', JSON.stringify(bookings));
    
    closeModal('bookingModal');
    
    // Show confirmation
    showBookingConfirmation(bookingData);
    
    // Reset form
    e.target.reset();
    isStudentDiscount = false;
    removeFile();
}

// Show booking confirmation
function showBookingConfirmation(booking) {
    const studentDiscountText = booking.isStudent ? 
        `<p style="color: var(--success-color); font-weight: 600;"><i class="fas fa-graduation-cap"></i> Student Discount Applied (50% off)</p>` : '';
    
    const confirmationHTML = `
        <div class="modal" id="confirmationModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle" style="color: var(--success-color);"></i> Booking Confirmed!</h3>
                    <button class="close-btn" onclick="closeModal('confirmationModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="text-align: center; padding: 1rem 0;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: var(--success-color);">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4 style="color: var(--success-color); margin-bottom: 1rem;">Your booking has been confirmed!</h4>
                    ${studentDiscountText}
                    <div style="background: var(--gray-100); padding: 1.5rem; border-radius: 16px; margin: 1rem 0; text-align: left;">
                        <p><strong><i class="fas fa-hashtag"></i> Booking ID:</strong> #${booking.id}</p>
                        <p><strong><i class="fas fa-map-marker-alt"></i> Destination:</strong> ${booking.destination}</p>
                        <p><strong><i class="fas fa-calendar"></i> Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                        <p><strong><i class="fas fa-users"></i> People:</strong> ${booking.people}</p>
                        <p><strong><i class="fas fa-dollar-sign"></i> Total Price:</strong> ${booking.totalPrice}</p>
                        <p><strong><i class="fas fa-envelope"></i> Contact:</strong> ${booking.email}</p>
                    </div>
                    <p style="color: var(--gray-600); margin: 1rem 0;">
                        <i class="fas fa-info-circle"></i> We will contact you within 24 hours to confirm the details and arrange payment.
                    </p>
                    <button class="btn btn-primary" onclick="closeModal('confirmationModal')">
                        <i class="fas fa-thumbs-up"></i>
                        <span>Great!</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
        const modal = document.getElementById('confirmationModal');
        if (modal) modal.remove();
    }, 15000);
}

// Stats Modal functionality
function openStatsModal(type) {
    const modal = document.getElementById('statsModal');
    const title = document.getElementById('statsTitle');
    const content = document.getElementById('statsContent');
    
    if (!modal || !title || !content) return;
    
    const statsData = {
        peaks: {
            title: '<i class="fas fa-mountain"></i> Nepal\'s Highest Peaks',
            content: `
                <div class="stats-detail-grid">
                    <div class="stats-detail-item">
                        <img src="public/everest.jpg" alt="Mount Everest">
                        <h4>Mount Everest (8,848.86m)</h4>
                        <p>The world's highest mountain, known as Sagarmatha in Nepali and Chomolungma in Tibetan. Located in the Mahalangur Himal sub-range of the Himalayas.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Solukhumbu District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1953</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/k2.jpg" alt="K2">
                        <h4>K2 (8,611m)</h4>
                        <p>The second-highest mountain in the world, located on the China-Pakistan border. Known as the "Savage Mountain" due to its difficulty and danger.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Karakoram Range</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1954</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/kanchanjunga.jpg" alt="Kangchenjunga">
                        <h4>Kangchenjunga (8,586m)</h4>
                        <p>The third-highest mountain in the world, located on the border between Nepal and Sikkim, India. Sacred to the people of Darjeeling and Sikkim.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Nepal-India Border</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1955</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/lhotse.jpg" alt="Lhotse">
                        <h4>Lhotse (8,516m)</h4>
                        <p>The fourth-highest mountain in the world, connected to Everest via the South Col. Its name means "South Peak" in Tibetan.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Solukhumbu District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1956</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/makalu.jpg" alt="Makalu">
                        <h4>Makalu (8,485m)</h4>
                        <p>The fifth-highest mountain in the world, known for its perfect pyramid structure. Located in the Mahalangur Himalayas.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Sankhuwasabha District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1955</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/cho oyu.jpg" alt="Cho Oyu">
                        <h4>Cho Oyu (8,188m)</h4>
                        <p>The sixth-highest mountain in the world, located on the China-Nepal border. Considered the easiest of the 8,000m peaks to climb.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Solukhumbu District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1954</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/dhaulagiri.jpg" alt="Dhaulagiri">
                        <h4>Dhaulagiri I (8,167m)</h4>
                        <p>The seventh-highest mountain in the world, located in north central Nepal. Its name means "White Mountain" in Sanskrit.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Myagdi District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1960</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/k2.jpg" alt="Manaslu">
                        <h4>Manaslu (8,163m)</h4>
                        <p>The eighth-highest mountain in the world, located in the Mansiri Himal. Its name means "Mountain of the Spirit" in Sanskrit.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Gorkha District</span>
                            <span><i class="fas fa-calendar"></i> First climbed: 1956</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="openBookingModal('hiking', 'Everest Base Camp Trek')">
                        <i class="fas fa-hiking"></i>
                        <span>Book Mountain Trek</span>
                    </button>
                </div>
            `
        },
        unesco: {
            title: '<i class="fas fa-landmark"></i> UNESCO World Heritage Sites',
            content: `
                <div class="stats-detail-grid">
                    <div class="stats-detail-item">
                        <img src="public/kathmandudurbarsquare.jpg" alt="Kathmandu Durbar Square">
                        <h4>Kathmandu Durbar Square</h4>
                        <p>A historic palace complex with temples and courtyards, showcasing traditional Newar architecture and craftsmanship.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/patandurbarsquare.jpg" alt="Patan Durbar Square">
                        <h4>Patan Durbar Square</h4>
                        <p>Ancient royal palace complex with exquisite temples, courtyards, and traditional architecture in Lalitpur.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/bhaktapurdurbarsquare.jpg" alt="Bhaktapur Durbar Square">
                        <h4>Bhaktapur Durbar Square</h4>
                        <p>Medieval city center with palaces, temples, and traditional buildings showcasing ancient Newar culture.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/swoyambhunath.jpg" alt="Swayambhunath">
                        <h4>Swayambhunath Stupa</h4>
                        <p>Ancient Buddhist stupa also known as the Monkey Temple, perched on a hilltop overlooking Kathmandu Valley.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/boudhanath.jpg" alt="Boudhanath">
                        <h4>Boudhanath Stupa</h4>
                        <p>One of the largest Buddhist stupas in the world and a major pilgrimage site for Tibetan Buddhists.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/pashupatinath.jpg" alt="Pashupatinath">
                        <h4>Pashupatinath Temple</h4>
                        <p>Sacred Hindu temple complex dedicated to Lord Shiva, located on the banks of the Bagmati River.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/lumbini.jpg" alt="Lumbini">
                        <h4>Lumbini</h4>
                        <p>The birthplace of Lord Buddha, featuring the Maya Devi Temple and monasteries from various countries.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1997</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/chitwan.jpg" alt="Chitwan National Park">
                        <h4>Chitwan National Park</h4>
                        <p>Nepal's first national park, home to endangered species including one-horned rhinoceros and Bengal tigers.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1984</span>
                            <span><i class="fas fa-tag"></i> Natural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/sagarmathanationalpark.jpg" alt="Sagarmatha National Park">
                        <h4>Sagarmatha National Park</h4>
                        <p>Home to Mount Everest and diverse Himalayan wildlife, including snow leopards and red pandas.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Natural</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/changunarayan.jpg" alt="Changu Narayan">
                        <h4>Changu Narayan Temple</h4>
                        <p>Ancient Hindu temple dedicated to Lord Vishnu, featuring the oldest stone inscription in Nepal.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> Inscribed: 1979</span>
                            <span><i class="fas fa-tag"></i> Cultural</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="openBookingModal('tour', 'Kathmandu City Tour')">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>Book Heritage Tour</span>
                    </button>
                </div>
            `
        },
        ethnic: {
            title: '<i class="fas fa-users"></i> Ethnic Groups of Nepal',
            content: `
                <div class="stats-detail-grid">
                    <div class="stats-detail-item">
                        <img src="public/sherpa.jpg" alt="Sherpa Culture">
                        <h4>Sherpa</h4>
                        <p>Mountain people known for their mountaineering skills and Buddhist culture. Primarily found in the Everest region.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Solukhumbu, Dolakha</span>
                            <span><i class="fas fa-users"></i> ~150,000</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/gurung.jpg" alt="Gurung Culture">
                        <h4>Gurung</h4>
                        <p>Indigenous people of the Himalayas known for their bravery and service in the British and Indian armies.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Gandaki Province</span>
                            <span><i class="fas fa-users"></i> ~500,000</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/tamang.jpg" alt="Tamang Culture">
                        <h4>Tamang</h4>
                        <p>Tibetan-origin people with rich Buddhist traditions, known for their unique language and cultural practices.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Central Nepal</span>
                            <span><i class="fas fa-users"></i> ~1.5 million</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/tharu.jpg" alt="Tharu Culture">
                        <h4>Tharu</h4>
                        <p>Indigenous people of the Terai region with unique cultural traditions and resistance to malaria.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Terai Region</span>
                            <span><i class="fas fa-users"></i> ~1.7 million</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/newar.jpg" alt="Newar Culture">
                        <h4>Newar</h4>
                        <p>Indigenous people of Kathmandu Valley, known for their art, architecture, and rich cultural heritage.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Kathmandu Valley</span>
                            <span><i class="fas fa-users"></i> ~1.2 million</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/magar.jpg" alt="Magar Culture">
                        <h4>Magar</h4>
                        <p>One of the oldest indigenous groups in Nepal, known for their martial traditions and service in armies.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-map-marker-alt"></i> Western Nepal</span>
                            <span><i class="fas fa-users"></i> ~1.9 million</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="openBookingModal('tour', 'Cultural Heritage Tour')">
                        <i class="fas fa-users"></i>
                        <span>Book Cultural Tour</span>
                    </button>
                </div>
            `
        },
        routes: {
            title: '<i class="fas fa-route"></i> Trekking Routes in Nepal',
            content: `
                <div class="stats-detail-grid">
                    <div class="stats-detail-item">
                        <img src="public/everestbasecamp.jpg" alt="Everest Region">
                        <h4>Everest Region (Khumbu)</h4>
                        <p>Home to the world's highest peaks including Everest, Lhotse, and Cho Oyu. Over 50 trekking routes available.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Moderate to Extreme</span>
                            <span><i class="fas fa-route"></i> 50+ Routes</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/annapurna.jpg" alt="Annapurna Region">
                        <h4>Annapurna Region</h4>
                        <p>Most popular trekking region with diverse landscapes and cultures. Over 200 different trekking routes.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Easy to Hard</span>
                            <span><i class="fas fa-route"></i> 200+ Routes</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/everest.jpg" alt="Langtang Region">
                        <h4>Langtang Region</h4>
                        <p>Closest trekking region to Kathmandu with beautiful valleys and Tamang culture. Over 30 trekking routes.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Easy to Moderate</span>
                            <span><i class="fas fa-route"></i> 30+ Routes</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/everest.jpg" alt="Manaslu Region">
                        <h4>Manaslu Region</h4>
                        <p>Remote and less crowded region around the eighth highest mountain. Over 25 trekking routes available.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Moderate to Hard</span>
                            <span><i class="fas fa-route"></i> 25+ Routes</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/dolpo region.jpg" alt="Dolpo Region">
                        <h4>Dolpo Region</h4>
                        <p>Remote trans-Himalayan region with unique Tibetan culture and landscapes. Over 15 challenging routes.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Hard to Extreme</span>
                            <span><i class="fas fa-route"></i> 15+ Routes</span>
                        </div>
                    </div>
                    <div class="stats-detail-item">
                        <img src="public/makalu.jpg" alt="Makalu Region">
                        <h4>Makalu Region</h4>
                        <p>Pristine wilderness area around the fifth highest mountain with diverse ecosystems and wildlife.</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-mountain"></i> Difficulty: Moderate to Hard</span>
                            <span><i class="fas fa-route"></i> 20+ Routes</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="openBookingModal('hiking', 'Custom Trekking Route')">
                        <i class="fas fa-hiking"></i>
                        <span>Book Custom Trek</span>
                    </button>
                </div>
            `
        }
    };
    
    const data = statsData[type];
    if (data) {
        title.innerHTML = data.title;
        content.innerHTML = data.content;
        openModal('statsModal');
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // If it's a confirmation modal, remove it from DOM
        if (modalId === 'confirmationModal') {
            modal.remove();
        }
    }
}

function switchModal(fromModal, toModal) {
    closeModal(fromModal);
    setTimeout(() => openModal(toModal), 300);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                animation: slideInRight 0.4s ease-out;
                backdrop-filter: blur(10px);
            }
            .notification-content {
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: white;
                font-weight: 500;
            }
            .notification-success .notification-content { 
                background: linear-gradient(135deg, var(--success-color), #059669);
            }
            .notification-error .notification-content { 
                background: linear-gradient(135deg, var(--error-color), #dc2626);
            }
            .notification-info .notification-content { 
                background: linear-gradient(135deg, var(--accent-secondary), #1d4ed8);
            }
            .notification-warning .notification-content { 
                background: linear-gradient(135deg, var(--warning-color), #d97706);
            }
            .notification button {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease;
            }
            .notification button:hover {
                background: rgba(255,255,255,0.3);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.4s ease-out reverse';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.place-card, .stat-card, .place-detail');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Initialize scroll effects
function initializeScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    if (window.scrollY > 100) {
                        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.1)';
                    } else {
                        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Enhanced Weather API function
async function getWeatherForCity(cityName) {
    const weatherResult = document.getElementById('weatherResult');
    const cityNameElement = document.getElementById('cityName');
    const temperatureElement = document.getElementById('temperature');
    const conditionElement = document.getElementById('condition');
    const humidityElement = document.getElementById('humidity');
    const windSpeedElement = document.getElementById('windSpeed');
    
    if (!weatherResult) {
        console.error('Weather result element not found');
        return;
    }
    
    console.log(`Fetching weather for: ${cityName}`);
    
    // Show loading state
    weatherResult.classList.remove('hidden');
    cityNameElement.textContent = `Loading weather for ${cityName}...`;
    temperatureElement.innerHTML = '<div class="loading"></div>';
    conditionElement.innerHTML = '<div class="loading"></div>';
    humidityElement.innerHTML = '<div class="loading"></div>';
    windSpeedElement.innerHTML = '<div class="loading"></div>';
    
    try {
        // Simulate API delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get simulated weather data
        const weatherData = getSimulatedWeather(cityName);
        
        console.log('Weather data received:', weatherData);
        
        // Update the weather display with animation
        setTimeout(() => {
            cityNameElement.textContent = `Weather in ${weatherData.city}`;
            temperatureElement.textContent = `${weatherData.temperature}°C`;
            conditionElement.textContent = weatherData.condition;
            humidityElement.textContent = `${weatherData.humidity}%`;
            windSpeedElement.textContent = `${weatherData.windSpeed} km/h`;
            
            // Add success animation
            weatherResult.style.animation = 'fadeIn 0.5s ease-in';
        }, 100);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        cityNameElement.textContent = 'Weather information unavailable';
        temperatureElement.textContent = '--°C';
        conditionElement.textContent = 'Unable to fetch data';
        humidityElement.textContent = '--%';
        windSpeedElement.textContent = '-- km/h';
    }
}

// Enhanced simulated weather data
function getSimulatedWeather(cityName) {
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour <= 18;
    
    const weatherOptions = {
        'kathmandu': {
            city: 'Kathmandu',
            temperature: Math.floor(Math.random() * 10) + (isDay ? 20 : 15),
            condition: ['Partly Cloudy', 'Clear Sky', 'Light Haze', 'Sunny'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 30) + 50,
            windSpeed: Math.floor(Math.random() * 15) + 5
        },
        'pokhara': {
            city: 'Pokhara',
            temperature: Math.floor(Math.random() * 8) + (isDay ? 22 : 18),
            condition: ['Clear Sky', 'Partly Cloudy', 'Mountain Mist', 'Sunny'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 25) + 55,
            windSpeed: Math.floor(Math.random() * 12) + 3
        },
        'chitwan': {
            city: 'Chitwan',
            temperature: Math.floor(Math.random() * 12) + (isDay ? 25 : 20),
            condition: ['Hot and Sunny', 'Partly Cloudy', 'Humid', 'Tropical'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 20) + 65,
            windSpeed: Math.floor(Math.random() * 10) + 5
        },
        'lukla': {
            city: 'Lukla',
            temperature: Math.floor(Math.random() * 15) + (isDay ? 10 : 5),
            condition: ['Clear Mountain Air', 'Cloudy', 'Windy', 'Cold and Clear'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 20) + 40,
            windSpeed: Math.floor(Math.random() * 20) + 10
        }
    };
    
    const cityKey = cityName.toLowerCase();
    if (weatherOptions[cityKey]) {
        return weatherOptions[cityKey];
    } else {
        return {
            city: cityName,
            temperature: Math.floor(Math.random() * 15) + (isDay ? 18 : 12),
            condition: ['Partly Cloudy', 'Clear Sky', 'Cloudy'][Math.floor(Math.random() * 3)],
            humidity: Math.floor(Math.random() * 30) + 45,
            windSpeed: Math.floor(Math.random() * 15) + 5
        };
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            closeModal(modal.id);
        });
        
        // Close search results
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
        
        // Close mobile menu
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Enter key on search
    if (e.key === 'Enter' && e.target.id === 'searchInput') {
        performSearch();
    }
});

// Add current year to footer
document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2024', currentYear);
        console.log(`Footer year updated to: ${currentYear}`);
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log('Enhanced page fully loaded');
    console.log(`Load time: ${performance.now()}ms`);
});

// Error handling for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.log(`Image failed to load: ${this.src}`);
            this.style.backgroundColor = '#f0f0f0';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.alt = 'Image not available';
        });
    });
});

console.log('Enhanced script loaded with premium UI and student discount functionality!');

// Gallery and Lightbox functionality
let currentImageIndex = 0;
let galleryImages = [];

// Initialize gallery data for each page
function initializeGalleryData() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    const galleryData = {
        'everest-base-camp': [
            { src: '', title: 'Everest Base Camp', description: 'The iconic base camp at 5,364m elevation' },
            { src: '', title: 'Kala Patthar Sunrise', description: 'Breathtaking sunrise view from Kala Patthar' },
            { src: '', title: 'Namche Bazaar', description: 'The bustling Sherpa capital and trading hub' },
            { src: '', title: 'Tengboche Monastery', description: 'Ancient Buddhist monastery with mountain views' },
            { src: '', title: 'Suspension Bridge', description: 'Crossing the dramatic suspension bridges' },
            { src: '', title: 'Sherpa Village', description: 'Traditional Sherpa village life' },
            { src: '', title: 'Himalayan Views', description: 'Spectacular mountain panoramas' },
            { src: '', title: 'Trekking Trail', description: 'The challenging mountain trails' }
        ],
        'annapurna-circuit': [
            { src: '', title: 'Thorong La Pass', description: 'The highest point of the circuit at 5,416m' },
            { src: '', title: 'Annapurna Range', description: 'Majestic Annapurna mountain range' },
            { src: '', title: 'Manang Village', description: 'High altitude village with Tibetan culture' },
            { src: '', title: 'Muktinath Temple', description: 'Sacred temple for Hindus and Buddhists' },
            { src: '', title: 'Rhododendron Forest', description: 'Beautiful rhododendron blooms in spring' },
            { src: '', title: 'Marsyangdi Valley', description: 'Lush green valley with river views' },
            { src: '', title: 'Tibetan Plateau', description: 'High altitude desert landscape' },
            { src: '', title: 'Local Culture', description: 'Rich cultural diversity along the trail' }
        ],
        'langtang-valley': [
            { src: '', title: 'Kyanjin Gompa', description: 'Ancient monastery at 3,870m elevation' },
            { src: '', title: 'Langtang Lirung', description: 'The dominant peak of Langtang region' },
            { src: '', title: 'Tserko Ri Summit', description: 'Panoramic views from 4,984m summit' },
            { src: '', title: 'Tamang Village', description: 'Traditional Tamang culture and lifestyle' },
            { src: '', title: 'Rhododendron Bloom', description: 'Spectacular spring rhododendron forests' },
            { src: '', title: 'Yak Herds', description: 'Traditional yak herding in alpine meadows' },
            { src: '', title: 'Alpine Meadows', description: 'Beautiful high altitude grasslands' },
            { src: '', title: 'Glacier Views', description: 'Stunning glacier formations and ice falls' }
        ],
        'kathmandu': [
            { src: '', title: 'Durbar Square', description: 'UNESCO World Heritage Site with ancient palaces' },
            { src: '', title: 'Swayambhunath Stupa', description: 'The famous Monkey Temple overlooking the valley' },
            { src: '', title: 'Boudhanath Stupa', description: 'One of the largest Buddhist stupas in the world' },
            { src: '', title: 'Pashupatinath Temple', description: 'Sacred Hindu temple dedicated to Lord Shiva' },
            { src: '', title: 'Thamel Streets', description: 'Bust', title: 'Newar Architecture', description: 'Traditional Newari architectural masterpieces' },
            { src: '', title: 'Local Markets', description: 'Vibrant local markets and street life' },
            { src: '', title: 'Cultural Festivals', description: 'Colorful traditional festivals and celebrations' }
        ],
        'pokhara': [
            { src: '', title: 'Phewa Lake', description: 'Serene lake with mountain reflections' },
            { src: '', title: 'World Peace Pagoda', description: 'Buddhist monument with panoramic views' },
            { src: '', title: 'Sarangkot Sunrise', description: 'Spectacular sunrise over the Himalayas' },
            { src: '', title: 'Davis Falls', description: 'Unique waterfall flowing into underground tunnel' },
            { src: '', title: 'Paragliding Adventure', description: 'Thrilling paragliding over Pokhara valley' },
            { src: '', title: 'Mountain Reflections', description: 'Perfect mountain reflections in the lake' },
            { src: '', title: 'Lakeside Evening', description: 'Peaceful evening atmosphere by the lake' },
            { src: '', title: 'Lake Boating', description: 'Traditional boat rides on Phewa Lake' }
        ],
        'chitwan': [
            { src: '', title: 'One-Horned Rhinoceros', description: 'Endangered rhino species in their natural habitat' },
            { src: '', title: 'Royal Bengal Tiger', description: 'Majestic tigers roaming the jungle' },
            { src: '', title: 'Elephant Safari', description: 'Traditional elephant back jungle safari' },
            { src: '', title: 'Canoe Ride', description: 'Peaceful canoe rides on Rapti River' },
            { src: '', title: 'Bird Watching', description: 'Over 500 bird species in the park' },
            { src: '', title: 'Tharu Cultural Show', description: 'Traditional Tharu dance and culture' },
            { src: '', title: 'Jungle Walking', description: 'Guided walks through dense jungle' },
            { src: '', title: 'Sunset Safari', description: 'Beautiful sunset views during safari' }
        ],
        'lumbini': [
            { src: '', title: 'Maya Devi Temple', description: 'Sacred birthplace of Lord Buddha' },
            { src: '', title: 'Ashoka Pillar', description: 'Ancient pillar erected by Emperor Ashoka' },
            { src: '', title: 'Sacred Pond', description: 'Holy pond where Queen Maya Devi bathed' },
            { src: '', title: 'Myanmar Monastery', description: 'Beautiful Myanmar-style monastery' },
            { src: '', title: 'Thai Monastery', description: 'Elegant Thai architectural monastery' },
            { src: '', title: 'Japanese Peace Pagoda', description: 'Serene Japanese-style peace pagoda' },
            { src: '', title: 'Prayer Flags', description: 'Colorful Buddhist prayer flags' },
            { src: '', title: 'Meditation Garden', description: 'Peaceful gardens for meditation and reflection' }
        ]
    };
    
    galleryImages = galleryData[currentPage] || [];
}

// Open lightbox with specific image
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    if (lightbox && lightboxImage && galleryImages[index]) {
        const image = galleryImages[index];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.title;
        
        if (lightboxTitle) lightboxTitle.textContent = image.title;
        if (lightboxCounter) lightboxCounter.textContent = `${index + 1} of ${galleryImages.length}`;
        
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add keyboard event listener
        document.addEventListener('keydown', handleLightboxKeyboard);
    }
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleLightboxKeyboard);
    }
}

// Navigate to previous image
function prevImage() {
    if (galleryImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }
}

// Navigate to next image
function nextImage() {
    if (galleryImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }
}

// Update lightbox image
function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    if (lightboxImage && galleryImages[currentImageIndex]) {
        const image = galleryImages[currentImageIndex];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.title;
        
        if (lightboxTitle) lightboxTitle.textContent = image.title;
        if (lightboxCounter) lightboxCounter.textContent = `${currentImageIndex + 1} of ${galleryImages.length}`;
    }
}

// Handle keyboard navigation in lightbox
function handleLightboxKeyboard(e) {
    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}

// View all photos (placeholder function)
function viewAllPhotos() {
    showNotification('Full gallery feature coming soon! Currently showing preview images.', 'info');
}

// Close lightbox when clicking outside the image
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('lightbox')) {
        closeLightbox();
    }
});

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGalleryData();
    console.log('Gallery initialized with', galleryImages.length, 'images');
});
