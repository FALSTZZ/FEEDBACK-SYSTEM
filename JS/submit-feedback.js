const restrictedWords = [
    // General English profanities
    'shit', 'fuck', 'fucking', 'fucked', 'f*ck', 'fuk', 'fux', 'fukc',
    'bitch', 'b*tch', 'biatch', 'b1tch',
    'asshole', 'ass', 'a**', 'arse', 'jackass',
    'bastard', 'b@stard',
    'crap', 'piss', 'dick', 'd1ck', 'c0ck', 'cock',
    'cunt', 'kunt', 'c*nt',
    'slut', 'whore', 'w*hore', 'h0e', 'hoe',
    'douche', 'douchebag',
    'damn', 'hell',
    'retard', 'r3tard', 'moron', 'imbecile', 'loser',
    'suck', 'sucks', 'you suck', 'suk', 'dik', 'suk ma dik',

    // Mild insults
    'stupid', 'idiot', 'dumb', 'fool', 'jerk',
    'crazy', 'psycho', 'nutjob', 'weirdo',

    // Violent/hateful
    'hate', 'kill', 'die', 'go die', 'i hate you', 'KYS',

    // UK/Global variants
    'bloody', 'bollocks', 'bugger', 'tosser', 'wanker', 'git', 'twat', 'prick',

    // Filipino/Tagalog profanities (including censored/masked)
    'bobo', 'b0bo', 'b0b0',
    'tanga', 't@nga', 't@ng@', 'tang@',
    'gago', 'g@g0', 'g@go', 'gagu', 'gaga',
    'ulol', 'ul*l', 'u1ol',
    'tarantado', 'tarantad0', 'tarantada', 'tarantad@',
    'putangina', 'putang ina', 'p*ta', 'puta', 'put@', 'put4',
    'pokpok', 'pokp0k',
    'peste', 'p3ste',
    'leche', 'l3che',
    'hayop', 'h@yop',
    'inutil', 'inut1l',
    'punyeta', 'p*nyeta',
    'siraulo', 'sira ulo', 'sirang ulo',
    'gunggong', 'gung0ng',
    'bwisit', 'bw1sit',
    'demonyo', 'dem0nyo',
    'ampota', 'amp0ta', 'ampucha', 'ampuch@',
    'bruha', 'aswang', 'engkanto',
    'abnoy', 'abnormal', 'timang', 'tim@ng',
    'bobita', 'bobit@',

    // Racial/gender/orientation-based slurs (filtered to prevent hate speech)
    'nigger', 'nigga', 'niga', 'n1gga', 'n1gr', 'kike', 'chink', 'gook', 'beaner',
    'fag', 'faggot', 'f4g', 'dyke', 'tranny', 'queer'  // when used derogatorily
];


// Function to check for restricted words
function containsRestrictedWords(text) {
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return restrictedWords.some(word =>
        cleanText.includes(word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );
}



document.addEventListener('DOMContentLoaded', function() {

    
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Add this line to get the caution message element
    const cautionMessage = document.getElementById('cautionMessage');
    // Handle file input
    const fileInput = document.getElementById('attachment');
    const fileInputButton = document.querySelector('.file-input-button');
    const fileName = document.querySelector('.file-name');
    
    if (fileInput && fileInputButton && fileName) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showCautionMessage('Please select an image file (JPG, PNG, etc.)');
                    fileInput.value = '';
                    fileName.textContent = 'No file chosen';
                    return;
                }

                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showCautionMessage('File size must be less than 5MB');
                    fileInput.value = '';
                    fileName.textContent = 'No file chosen';
                    return;
                }

                fileName.textContent = file.name;
            } else {
                fileName.textContent = 'No file chosen';
            }
        });

        fileInputButton.addEventListener('click', () => {
            fileInput.click();
        });
    }

    
    // Check if editing feedback
    const editFeedback = JSON.parse(sessionStorage.getItem('editFeedback'));
    if (editFeedback) {
        // Fill form with current data
        document.getElementById('feedbackType').value = editFeedback.type;
        document.getElementById('subject').value = editFeedback.subject;
        document.getElementById('message').value = editFeedback.message;
        
        if (editFeedback.attachment) {
            fileName.textContent = editFeedback.attachment;
        }
        
        // Remove edit data
        sessionStorage.removeItem('editFeedback');
    }
    
    // Form submission
    const feedbackForm = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');
    
    feedbackForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        if (containsRestrictedWords(subject) || containsRestrictedWords(message)) {
            const offendingField = containsRestrictedWords(subject) ? 'subject' : 'message';
            showCautionMessage(`Please remove inappropriate words from the ${offendingField}`);
            return;
        }
    
        try {

            let attachmentData = null;
            const file = fileInput.files[0];

            if (file) {
                try {
                    attachmentData = await getFileData(file);
                } catch (error) {
                    showCautionMessage(error.message);
                    return;
                }
            }

            const feedback = {
                id: generateUniqueId(),
                username: currentUser.username,
                type: document.getElementById('feedbackType').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                attachment: attachmentData,
                date: new Date().toISOString(),
                status: 'pending',
                response: null
            };

            
            
            // Save feedback
            saveUserFeedback(feedback);
            

            // Store feedback in sessionStorage for undo functionality
            sessionStorage.setItem('undoFeedback', JSON.stringify(feedback));

            // Show success message
            successMessage.classList.add('show');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            showCautionMessage('Error submitting feedback. Please try again.');
        }
    });
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    
    cancelBtn.addEventListener('click', function() {
        // Redirect back to home page
        window.location.href = 'home.html';
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.querySelector('span').textContent;
            
            // Handle navigation
            switch(linkText) {
                case 'Home':
                    window.location.href = 'home.html';
                    break;
                case 'Submit Feedback':
                    // Already on this page, do nothing
                    break;
                case 'View Feedback':
                    window.location.href = 'view-feedback.html';
                    break;
                case 'Logout':
                    // Remove current user from session storage
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    break;
            }
        });
    });







    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Redirect if user already has feedback
    if (userFeedbacks.length > 0) {
        window.location.href = 'home.html';
        return;
    }

});

// Generate unique ID for feedback
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Save user feedback to local storage
function saveUserFeedback(feedback) {
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Get user's feedbacks
    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Add new feedback
    userFeedbacks.push(feedback);
    
    // Save to local storage
    localStorage.setItem(userFeedbackKey, JSON.stringify(userFeedbacks));
    
    // Update storage usage
    updateStorageUsage();
}

// Update storage usage information
function updateStorageUsage() {
    // Calculate total storage used
    let totalSize = 0;
    
    // Calculate size of each storage item
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Approximate size in bytes (UTF-16 encoding)
    }
    
    // Convert to KB
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    // Calculate percentage of 5MB (typical local storage limit)
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    // Store usage information
    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}




function getFileData(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('File size must be less than 5MB'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                type: file.type,
                data: e.target.result,
                size: file.size
            };
            resolve(imageData);
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
    });
}


// Add this function to submit feedback to admin
function submitFeedbackToAdmin(feedback) {
    // Get existing admin feedbacks
    const adminFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    
    // Add the new feedback
    adminFeedbacks.push(feedback);
    
    // Save updated feedbacks to admin storage
    localStorage.setItem('feedbacks', JSON.stringify(adminFeedbacks));
}

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