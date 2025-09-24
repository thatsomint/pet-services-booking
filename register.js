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
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password, 
                full_name: fullName, 
                phone_number: phone 
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            messageDiv.style.color = 'green';
            messageDiv.textContent = 'Registration successful! Redirecting...';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Network error. Please try again.';
    }

    // Firebase - create user
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    alert("Your account has been created!");
    // ...
    })
    .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    // ..
    });

    });
