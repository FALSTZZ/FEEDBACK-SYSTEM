document.addEventListener('DOMContentLoaded', function() {
    // Tsek kung naka-log in ang user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    // Check for existing feedback
    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Get the submit feedback card
    const submitFeedbackCard = document.querySelector('.card#newFeedback');
    
    // Hide submit feedback card if user already has feedback
    if (userFeedbacks.length > 0) {
        submitFeedbackCard.style.display = 'none';
    }
    
    if (!currentUser) {
        // I-redirect sa login page kung hindi naka-log in
        window.location.href = 'login.html';
        return;
    }
    
    // I-update ang pangalan ng user sa header
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = `Hello, ${currentUser.username}`;
    }
    
    // Kunin ang mga card elements
    const newFeedbackCard = document.getElementById('newFeedback');
    const viewFeedbackCard = document.getElementById('viewFeedback');
    
    // Magdagdag ng click event listener sa mga card
    newFeedbackCard.addEventListener('click', function() {
        // Pumunta sa page ng feedback submission
        window.location.href = 'submit-feedback.html';
    });

    viewFeedbackCard.addEventListener('click', function() {
        // Pumunta sa page ng feedback history
        window.location.href = 'view-feedback.html';
    });

    // Kunin ang lahat ng nav links
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Magdagdag ng click event listener sa mga nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Kunin ang text content ng na-click na link
            const linkText = this.querySelector('span').textContent;
            
            // Ayusin ang navigation batay sa na-click na link
            switch(linkText) {
                case 'Home':
                    window.location.href = 'home.html';
                    break;
                case 'Logout':
                    // Check for pending feedback before logout
                    const pendingFeedback = JSON.parse(sessionStorage.getItem('undoFeedback'));
                    if (pendingFeedback) {
                        
                        sessionStorage.removeItem('undoFeedback');
                    }
                    // Then proceed with logout
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    break;
            }
        });
    });
    
    // Tsek kung may undo notification
    const undoData = JSON.parse(sessionStorage.getItem('undoFeedback'));
    if (undoData) {
        showUndoNotification(undoData);
    }






    

});

// Function para magpakita ng undo notification
function showUndoNotification(feedbackData) {
    const notification = document.createElement('div');
    notification.className = 'undo-notification';
    
    const message = document.createElement('span');
    message.textContent = 'Feedback submitted. ';
    
    const undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';
    undoButton.className = 'undo-button';
    
    const countdown = document.createElement('div');
    countdown.className = 'countdown';
    
    const countdownText = document.createElement('span');
    countdownText.className = 'countdown-text';
    
    let feedbackSubmitted = false;

    const removeNotification = () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    };

    // Add notification elements
    countdown.appendChild(countdownText);
    notification.appendChild(message);
    notification.appendChild(undoButton);
    notification.appendChild(countdown);
    document.body.appendChild(notification);

    let timeLeft = 6;
    countdownText.textContent = `(${timeLeft}s)`;
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownText.textContent = `(${timeLeft}s)`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            removeNotification();
            // Submit feedback when timer ends
            if (!feedbackSubmitted) {
                submitFeedbackToAdmin(feedbackData);
                feedbackSubmitted = true;
            }
            sessionStorage.removeItem('undoFeedback');
        }
    }, 1000);

    // Modify logout handler
    const logoutBtn = document.querySelector('.nav-links li:last-child');
    logoutBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        
        // If undo was clicked, ensure feedback is removed
        if (feedbackSubmitted) {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
            const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
            const updatedFeedbacks = userFeedbacks.filter(f => f.id !== feedbackData.id);
            localStorage.setItem(userFeedbackKey, JSON.stringify(updatedFeedbacks));
        } 
        // If timer was still running, submit to admin
        else if (timeLeft > 0) {
            submitFeedbackToAdmin(feedbackData);
        }
        
        sessionStorage.removeItem('undoFeedback');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // Handle undo button click
    undoButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        removeNotification();

        // Remove feedback from user's storage when undoing
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
        const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
        const updatedFeedbacks = userFeedbacks.filter(f => f.id !== feedbackData.id);
        localStorage.setItem(userFeedbackKey, JSON.stringify(updatedFeedbacks));

        sessionStorage.removeItem('undoFeedback');
        feedbackSubmitted = true;
        window.location.href = 'submit-feedback.html';
    });

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Function para magsubmit ng feedback sa admin
function submitFeedbackToAdmin(feedbackData) {
    // Get existing admin feedbacks
    const adminFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    
    // Check if feedback already exists in admin feedbacks
    const exists = adminFeedbacks.some(f => f.id === feedbackData.id);
    
    // Only add if not already in admin feedbacks
    if (!exists) {
        // Add feedback with sentToAdmin flag
        adminFeedbacks.push({...feedbackData, sentToAdmin: true});
        localStorage.setItem('feedbacks', JSON.stringify(adminFeedbacks));
        
        // Update storage usage
        updateStorageUsage();
    }
}

// Update ang impormasyon ng storage usage
function updateStorageUsage() {
    // Kalkulahin ang kabuuang storage na nagamit
    let totalSize = 0;
    
    // Kalkulahin ang size ng bawat storage item
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Tinatayang size sa bytes (UTF-16 encoding)
    }
    
    // I-convert sa KB
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    // Kalkulahin ang porsyento ng 5MB (karaniwang limit ng local storage)
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    // I-save ang usage information
    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}
