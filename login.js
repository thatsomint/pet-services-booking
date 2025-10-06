  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyD7K7u4qUTI9C5kOr4dUe6ND6EfnxeXU-Y",
    authDomain: "pawfectfind-cc73e.firebaseapp.com",
    projectId: "pawfectfind-cc73e",
    storageBucket: "pawfectfind-cc73e.firebasestorage.app",
    messagingSenderId: "9138302822",
    appId: "1:9138302822:web:945e4e5e46e1a7b0f7a2a7"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    //inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('authMessage');

    try {
        // Firebase - sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login successful! Redirecting...';
        
        // Check for pending booking
        const pendingBooking = localStorage.getItem('pendingBooking');
        const loginRedirectSource = localStorage.getItem('loginRedirectSource');
        
        setTimeout(() => {
            if (pendingBooking) {
                      // Redirect to booking confirmation with saved data
                      const bookingData = JSON.parse(pendingBooking);
                      window.location.href = `booking-confirmation.html?service=${encodeURIComponent(bookingData.service)}&vendor=${encodeURIComponent(bookingData.vendor)}&date=${encodeURIComponent(bookingData.date)}&time=${encodeURIComponent(bookingData.time)}&price=${encodeURIComponent(bookingData.price)}&vendorId=${encodeURIComponent(bookingData.vendorId)}`;
                      
                      // Clear the stored data
                      localStorage.removeItem('pendingBooking');
                      localStorage.removeItem('loginRedirectSource');
                } else {
                      // Default redirect to dashboard
                      window.location.href = 'userdashboard.html';
                }
        }, 1000);
        
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Invalid email or password. Please try again.';
    }
});