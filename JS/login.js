document.addEventListener('DOMContentLoaded', function () {
    // Initialize storage and get elements
    initializeLocalStorage();
    const loginForm = document.getElementById('loginForm');
    const cautionMessage = document.getElementById('cautionMessage');
    
    // Track failed attempts
    let failedAttempts = 0;

    function showCautionMessage(message, isSuccess = false) {
        const messageSpan = cautionMessage.querySelector('span');
        const icon = cautionMessage.querySelector('i');

        messageSpan.textContent = message;

        if (isSuccess) {
            cautionMessage.style.backgroundColor = '#4CAF50';
            icon.className = 'bx bx-check-circle';
        } else {
            cautionMessage.style.backgroundColor = '#ff3860';
            icon.className = 'bx bx-x-circle';
        }

        cautionMessage.classList.add('show');

        if (!isSuccess) {
            setTimeout(() => {
                cautionMessage.classList.remove('show');
            }, 3000);
        }
    }

    function disableLoginForm(duration) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const submitButton = document.querySelector('button[type="submit"]');

        // Disable inputs
        usernameInput.disabled = true;
        passwordInput.disabled = true;
        submitButton.disabled = true;

        let timeLeft = Math.floor(duration / 1000);
        cautionMessage.classList.add('show', 'locked');
        
        const countdown = setInterval(() => {
            timeLeft--;
            showCautionMessage(`Too many failed attempts. Try again in ${timeLeft} seconds`);
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                // Re-enable inputs
                usernameInput.disabled = false;
                passwordInput.disabled = false;
                submitButton.disabled = false;
                cautionMessage.classList.remove('show', 'locked');
            }
        }, 1000);
    }

    function calculateDisableDuration() {
        const baseTime = 30; // Base time in seconds
        const attemptSet = Math.floor(failedAttempts / 3); // Which set of 3 attempts we're on
        return baseTime * (1 + attemptSet) * 1000; // Convert to milliseconds
    }

    // Login form submission
    loginForm.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Check for empty fields
        if (username === '' || password === '') {
            showCautionMessage('Please Fill up all fields');
            if (username === '') applyVibrationEffect(document.getElementById('username'));
            if (password === '') applyVibrationEffect(document.getElementById('password'));
            if (navigator.vibrate) navigator.vibrate(100);
            return;
        }

        // Authenticate user
        const authResult = authenticateUser(username, password);

        if (authResult.success) {
            // Reset failed attempts on success
            failedAttempts = 0;

            // Save current user
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: username,
                role: authResult.role
            }));

            showCautionMessage('Login successful! Redirecting...', true);

            // Disable form during redirect
            document.getElementById('username').disabled = true;
            document.getElementById('password').disabled = true;
            document.querySelector('button[type="submit"]').disabled = true;

            setTimeout(() => {
                window.location.href = authResult.role === 'admin' ? 'admin-dashboard.html' : 'home.html';
            }, 2000);
        } else {
            failedAttempts++;
            
            if (failedAttempts % 3 === 0) {
                // Calculate and apply disable duration
                const duration = calculateDisableDuration();
                disableLoginForm(duration);
            } else {
                showCautionMessage(`Invalid credentials. ${3 - (failedAttempts % 3)} attempts remaining`);
            }
        }
    });
});

// Your existing helper functions
function applyVibrationEffect(inputElement) {
    if (!inputElement) return;
    inputElement.classList.add('vibrate-input');
    
    const container = inputElement.parentElement;
    if (container) {
        const icon = container.querySelector('i, .icon, svg, img');
        if (icon) {
            icon.classList.add('vibrate-icon');
            setTimeout(() => icon.classList.remove('vibrate-icon'), 500);
        }
    }
    
    setTimeout(() => inputElement.classList.remove('vibrate-input'), 500);
}

function initializeLocalStorage() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                username: 'DatamexStudent123',
                password: 'DTMX123',
                role: 'student',
                email: 'student@datamex.edu'
            },
            {
                username: 'DatamexAdmin123',
                password: 'DTMXADMIN123',
                role: 'admin',
                email: 'admin@datamex.edu'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('feedbacks')) {
        localStorage.setItem('feedbacks', JSON.stringify([]));
    }

    if (!localStorage.getItem('storageUsage')) {
        updateStorageUsage();
    }
}

function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    return user ? { success: true, role: user.role } : { success: false };
}

function updateStorageUsage() {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2;
    }

    const sizeInKB = (totalSize / 1024).toFixed(2);
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);

    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}