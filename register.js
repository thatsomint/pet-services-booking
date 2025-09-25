  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

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

  // submit button from registerForm
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // inputs
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('authMessage');

    if (password !== confirmPassword) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Passwords do not match';
        return;
    }

    try {
      // Firebase - create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      messageDiv.style.color = 'green';
      messageDiv.textContent = 'Registration successful! Redirecting to Login Page.';

      setTimeout(() => {
      window.location.href = 'login.html'; 
      }, 1000);
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please try again.';
    }
  });