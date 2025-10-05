// userdashboard.js - UPDATED WITH FIREBASE AUTH
let nav = 0;
let clicked = null;
let events = [];
let bookings = [];

const API_BASE_URL = window.location.hostname.includes('azurewebsites.net') 
    ? 'https://pawfectfind-backend.azurewebsites.net' 
    : 'http://localhost:8000';

// DOM Elements
const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get current user ID from Firebase
function getCurrentUserId() {
    // Check if Firebase auth is available
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        const user = firebase.auth().currentUser;
        console.log('✅ Using Firebase user:', user.email, 'UID:', user.uid);
        return user.uid; // This is the Firebase UID that matches your booking-confirmation.html
    }
    
    // Check if user is stored in global variable (from HTML)
    if (window.currentFirebaseUser) {
        console.log('✅ Using window Firebase user:', window.currentFirebaseUser.email);
        return window.currentFirebaseUser.uid;
    }
    
    // Check if auth instance is available
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        console.log('✅ Using firebaseAuth user:', window.firebaseAuth.currentUser.email);
        return window.firebaseAuth.currentUser.uid;
    }
    
    console.warn('⚠️ No Firebase user found, using demo mode');
    return 'demo-user'; // Fallback
}

// Enhanced function that waits for auth
async function getCurrentUserWithWait() {
    const maxWaitTime = 3000; // 3 seconds max
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
        const userId = getCurrentUserId();
        if (userId && userId !== 'demo-user') {
            return userId;
        }
        // Wait 100ms before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Please log in to view your bookings');
}

// Update UI with user info
function updateUserInterface() {
    const user = getCurrentFirebaseUser();
    
    if (user) {
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        const userName = user.displayName || user.email.split('@')[0];
        if (pageTitle) {
            pageTitle.textContent = `${userName}'s Dashboard`;
        }
        
        console.log('✅ UI updated for user:', user.email);
    }
}

// Get Firebase user object
function getCurrentFirebaseUser() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        return firebase.auth().currentUser;
    }
    if (window.currentFirebaseUser) {
        return window.currentFirebaseUser;
    }
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        return window.firebaseAuth.currentUser;
    }
    return null;
}

// Fetch bookings from database
async function fetchBookings() {
    try {
        const userId = await getCurrentUserWithWait();
        console.log('📅 Fetching bookings for Firebase user:', userId);
        
        // Show loading state
        const calendarElement = document.getElementById('calendar');
        if (calendarElement) {
            calendarElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Loading your bookings...</div>';
        }
        
        const response = await fetch(`${API_BASE_URL}/api/bookings/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.status}`);
        }
        
        bookings = await response.json();
        console.log('✅ Bookings loaded:', bookings.length, 'bookings for user', userId);
        
        // Convert bookings to calendar events
        events = bookings.map(booking => ({
            date: formatDateForCalendar(new Date(booking.booking_date)),
            title: `${booking.service_type}`,
            bookingData: booking
        }));
        
        loadCalendar();
        
        // Also fetch the specific data for upcoming and history
        await fetchUpcomingAppointments();
        await fetchServiceHistory();
        
    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        
        // Show error message
        const calendarElement = document.getElementById('calendar');
        if (calendarElement) {
            if (error.message.includes('Please log in')) {
                calendarElement.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Please log in to view your bookings<br>
                        <small><a href="login.html" style="color: #552c1f;">Click here to login</a></small>
                    </div>
                `;
            } else {
                calendarElement.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Failed to load bookings<br>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }
        
        // Fallback to localStorage if API fails
        loadFromLocalStorage();
    }
}

// Fetch upcoming appointments
async function fetchUpcomingAppointments() {
    try {
        const userId = await getCurrentUserWithWait();
        console.log('📅 Fetching upcoming appointments for user:', userId);
        
        const response = await fetch(`${API_BASE_URL}/api/bookings/upcoming/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        
        const upcomingAppointments = await response.json();
        console.log('✅ Upcoming appointments:', upcomingAppointments);
        updateUpcomingAppointments(upcomingAppointments);
        
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        // Show empty state
        updateUpcomingAppointments([]);
    }
}

// Fetch service history
async function fetchServiceHistory() {
    try {
        const userId = await getCurrentUserWithWait();
        console.log('📅 Fetching service history for user:', userId);
        
        const response = await fetch(`${API_BASE_URL}/api/bookings/history/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch service history');
        
        const serviceHistory = await response.json();
        console.log('✅ Service history:', serviceHistory);
        updateServiceHistory(serviceHistory);
        
    } catch (error) {
        console.error('Error fetching service history:', error);
        // Show empty state
        updateServiceHistory([]);
    }
}

// Fallback to localStorage
function loadFromLocalStorage() {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    }
    loadCalendar();
}

// Format date for calendar (MM/DD/YYYY)
function formatDateForCalendar(date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Format date for display
function formatDateForDisplay(dateString) {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function openModal(date) {
    clicked = date;
    const eventForDay = events.find(e => e.date === clicked);

    if (eventForDay) {
        const booking = eventForDay.bookingData;
        document.getElementById('eventText').innerHTML = `
            <strong>${booking.service_type}</strong><br>
            <small>Vendor: ${booking.vendor_name}</small><br>
            <small>Time: ${booking.booking_time}</small><br>
            <small>Customer: ${booking.customer_name}</small>
        `;
        deleteEventModal.style.display = 'block';
    } else {
        newEventModal.style.display = 'block';
    }

    backDrop.style.display = 'block';
}

function loadCalendar() {
    const dt = new Date();

    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById('monthDisplay').innerText = 
        `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';

    for(let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;
            const eventsForDay = events.filter(e => e.date === dayString);

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (eventsForDay.length > 0) {
                eventsForDay.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.innerText = event.title;
                    eventDiv.title = `${event.title}\nVendor: ${event.bookingData.vendor_name}\nTime: ${event.bookingData.booking_time}`;
                    daySquare.appendChild(eventDiv);
                });
            }

            daySquare.addEventListener('click', () => openModal(dayString));
        } else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);    
    }
}

function updateUpcomingAppointments(upcomingAppointments = []) {
    const appointmentsContainer = document.querySelector('.appointments-list');
    if (!appointmentsContainer) return;

    appointmentsContainer.innerHTML = '';

    if (upcomingAppointments.length === 0) {
        appointmentsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No upcoming appointments</p>';
        return;
    }

    upcomingAppointments.slice(0, 3).forEach(appointment => {
        const appointmentItem = document.createElement('div');
        appointmentItem.className = 'appointment-item';
        
        const badgeClass = getServiceBadgeClass(appointment.service_type);
        
        appointmentItem.innerHTML = `
            <div class="appointment-badge ${badgeClass}">${appointment.service_type}</div>
            <div class="appointment-date">${formatDateForDisplay(appointment.booking_date)}</div>
            <div class="appointment-time">Time: ${appointment.booking_time}</div>
            <div class="appointment-vendor">${appointment.vendor_name}</div>
        `;
        
        appointmentsContainer.appendChild(appointmentItem);
    });
}

function updateServiceHistory(serviceHistory = []) {
    const historyContainer = document.querySelector('.history-list');
    if (!historyContainer) {
        // Fallback to the section card
        const sectionCard = document.querySelector('.section-card');
        if (sectionCard) {
            historyContainer = sectionCard;
        } else {
            return;
        }
    }

    // Clear existing items but keep the heading
    const existingItems = historyContainer.querySelectorAll('.booking-item');
    existingItems.forEach(item => item.remove());

    // Also clear any loading messages
    const loadingMessages = historyContainer.querySelectorAll('p');
    loadingMessages.forEach(msg => msg.remove());

    if (serviceHistory.length === 0) {
        historyContainer.innerHTML += '<p style="text-align: center; color: #666; padding: 20px;">No service history found</p>';
        return;
    }

    serviceHistory.slice(0, 4).forEach(service => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        
        const statusClass = service.status === 'completed' ? 'status-completed' : 'status-upcoming';
        const statusText = service.status === 'completed' ? '✓ Completed' : '⏰ Upcoming';
        
        bookingItem.innerHTML = `
            <div style="flex: 1;">
                <div class="booking-service">${service.service_type}</div>
                <div class="booking-time">${formatDateForDisplay(service.booking_date)} • ${service.vendor_name}</div>
                <div class="booking-price">Amount: $${service.price || '0.00'}</div>
            </div>
            <div class="${statusClass}">${statusText}</div>
        `;
        
        historyContainer.appendChild(bookingItem);
    });
}

function getServiceBadgeClass(serviceType) {
    const serviceClasses = {
        'Grooming': 'grooming',
        'Vet': 'vet',
        'Sitting': 'sitting',
        'Training': 'training',
        'Hotel': 'hotel',
        'Pet Grooming': 'grooming',
        'Pet Sitting': 'sitting',
        'Pet Hotel': 'hotel',
        'Vet Appointment': 'vet'
    };
    return serviceClasses[serviceType] || 'grooming';
}

function closeModal() {
    eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitleInput.value = '';
    clicked = null;
    loadCalendar();
}

function saveEvent() {
    if (eventTitleInput.value) {
        eventTitleInput.classList.remove('error');

        events.push({
            date: clicked,
            title: eventTitleInput.value,
        });

        localStorage.setItem('events', JSON.stringify(events));
        closeModal();
    } else {
        eventTitleInput.classList.add('error');
    }
}

function deleteEvent() {
    events = events.filter(e => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}

function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        loadCalendar();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        loadCalendar();
    });

    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton').addEventListener('click', closeModal);
    document.getElementById('deleteButton').addEventListener('click', deleteEvent);
    document.getElementById('closeButton').addEventListener('click', closeModal);

    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            if (action.includes('Emergency')) {
                alert('Connecting you to emergency vet services...');
            } else if (action.includes('Grooming')) {
                window.location.href = 'booking.html?service=grooming';
            } else if (action.includes('Sitters')) {
                window.location.href = 'booking.html?service=sitting';
            } else if (action.includes('Hotel')) {
                window.location.href = 'booking.html?service=hotel';
            } else if (action.includes('Pet Profile')) {
                window.location.href = 'profile.html?tab=pets';
            }
        });
    });
}

// Refresh data every 30 seconds to catch new bookings
function startAutoRefresh() {
    setInterval(() => {
        fetchBookings();
    }, 30000); // 30 seconds
}

// Initialize everything
function initializeDashboard() {
    updateUserInterface();
    initButtons();
    fetchBookings();
    fetchUpcomingAppointments();
    fetchServiceHistory();
    startAutoRefresh();
}

// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined') {
        // Wait for auth state
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('🔥 Firebase user detected:', user.email);
                window.currentFirebaseUser = user;
                initializeDashboard();
            } else {
                console.log('❌ No user signed in');
                // Show login prompt but don't initialize dashboard
                const calendarElement = document.getElementById('calendar');
                if (calendarElement) {
                    calendarElement.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i><br>
                            Please log in to view your dashboard<br>
                            <small><a href="login.html" style="color: #552c1f;">Click here to login</a></small>
                        </div>
                    `;
                }
            }
        });
    } else {
        console.warn('Firebase not loaded, trying to initialize anyway');
        initializeDashboard();
    }
});