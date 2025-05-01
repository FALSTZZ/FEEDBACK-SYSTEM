document.addEventListener('DOMContentLoaded', function() {
   // Check if user is logged in as admin
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
   if (!currentUser || currentUser.role !== 'admin') {
       // Redirect to login if not logged in as admin
       window.location.href = 'login.html';
       return;
   }
   
   // Initialize local storage if needed
   initializeLocalStorage();
   
   // Load dashboard data
   loadDashboardData();
   
   // Tab navigation
   const navLinks = document.querySelectorAll('.nav-links li[data-tab]');
   const tabContents = document.querySelectorAll('.tab-content');
   
   navLinks.forEach(link => {
       link.addEventListener('click', function() {
           const tabId = this.getAttribute('data-tab');
           
           // Remove active class from all links and tabs
           navLinks.forEach(l => l.classList.remove('active'));
           tabContents.forEach(t => t.classList.remove('active'));
           
           // Add active class to clicked link and corresponding tab
           this.classList.add('active');
           document.getElementById(tabId).classList.add('active');
           
           // Load tab-specific data
           switch(tabId) {
               case 'dashboard':
                   loadDashboardData();
                   break;
               case 'feedbacks':
                   loadFeedbacksData();
                   break;
               case 'students':
                   loadStudentsData();
                   break;
               
           }
       });
   });
   
   // Logout functionality
   const logoutLink = document.querySelector('.nav-links li:last-child');
   logoutLink.addEventListener('click', function() {
       // Clear session storage
       sessionStorage.removeItem('currentUser');
       window.location.href = 'login.html';
   });
   
   // Add student modal
   const addStudentBtn = document.getElementById('addStudentBtn');
   const addStudentModal = document.getElementById('addStudentModal');
   const cancelAddStudentBtn = document.getElementById('cancelAddStudentBtn');
   const addStudentForm = document.getElementById('addStudentForm');
   const closeAddStudentBtn = addStudentModal.querySelector('.close-btn');
   
   addStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.add('show');
   });
   
   cancelAddStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
   });
   
   closeAddStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
   });
   
   // Add student form submission
   addStudentForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const username = document.getElementById('newUsername').value.trim();
       const password = document.getElementById('newPassword').value.trim();
       const email = document.getElementById('newEmail').value.trim();
       
       // Validate inputs
       if (!username || !password || !email) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Check if username already exists
       const users = JSON.parse(localStorage.getItem('users')) || [];
       if (users.some(user => user.username === username)) {
           showSuccessMessage('Username already exists', false);
           return;
       }
       
       // Add new student
       users.push({
           username: username,
           password: password,
           email: email,
           role: 'student'
       });
       
       // Save to local storage
       localStorage.setItem('users', JSON.stringify(users));
       
       // Update storage usage
       updateStorageUsage();
       
       // Show success message
       showSuccessMessage('Student account created successfully');
       
       // Close modal and reset form
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
       
       // Reload students data
       loadStudentsData();
   });
   
   // Feedback response modal
   const feedbackResponseModal = document.getElementById('feedbackResponseModal');
   const cancelResponseBtn = document.getElementById('cancelResponseBtn');
   const feedbackResponseForm = document.getElementById('feedbackResponseForm');
   const closeFeedbackResponseBtn = feedbackResponseModal.querySelector('.close-btn');
   
   cancelResponseBtn.addEventListener('click', function() {
       feedbackResponseModal.classList.remove('show');
       feedbackResponseForm.reset();
   });
   
   closeFeedbackResponseBtn.addEventListener('click', function() {
       feedbackResponseModal.classList.remove('show');
       feedbackResponseForm.reset();
   });
   
   // Feedback response form submission
   feedbackResponseForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const feedbackId = document.getElementById('feedbackId').value;
       const status = document.getElementById('feedbackStatus').value;
       const response = document.getElementById('responseMessage').value.trim();
       
       // Validate inputs
       if (!feedbackId || !status || !response) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Update feedback
       const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
       const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
       
       if (feedbackIndex !== -1) {
           feedbacks[feedbackIndex].status = status;
           feedbacks[feedbackIndex].response = response;
           
           // Save to local storage
           localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
           
           // Update storage usage
           updateStorageUsage();
           
           // Add to recent activity
           addRecentActivity(`Responded to feedback from ${feedbacks[feedbackIndex].username}`);
           
           // Show success message
           showSuccessMessage('Response sent successfully');
           
           // Close modal and reset form
           feedbackResponseModal.classList.remove('show');
           feedbackResponseForm.reset();
           
           // Reload feedbacks data
           loadFeedbacksData();
       }
   });
   
   // Reset password modal
   const resetPasswordModal = document.getElementById('resetPasswordModal');
   const cancelResetBtn = document.getElementById('cancelResetBtn');
   const resetPasswordForm = document.getElementById('resetPasswordForm');
   const closeResetPasswordBtn = resetPasswordModal.querySelector('.close-btn');
   
   cancelResetBtn.addEventListener('click', function() {
       resetPasswordModal.classList.remove('show');
       resetPasswordForm.reset();
   });
   
   closeResetPasswordBtn.addEventListener('click', function() {
       resetPasswordModal.classList.remove('show');
       resetPasswordForm.reset();
   });
   
   // Reset password form submission
   resetPasswordForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const username = document.getElementById('resetUsername').value;
       const newPassword = document.getElementById('newResetPassword').value.trim();
       
       // Validate inputs
       if (!username || !newPassword) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Update user password
       const users = JSON.parse(localStorage.getItem('users')) || [];
       const userIndex = users.findIndex(u => u.username === username);
       
       if (userIndex !== -1) {
           // Update the password
           users[userIndex].password = newPassword;
           
           // Save to local storage
           localStorage.setItem('users', JSON.stringify(users));
           
           // Update storage usage
           updateStorageUsage();
           
           // Add to recent activity
           addRecentActivity(`Reset password for ${username}`);
           
           // Show success message
           showSuccessMessage('Password reset successfully');
           
           // Close modal and reset form
           resetPasswordModal.classList.remove('show');
           resetPasswordForm.reset();
       } else {
           // Show error if user not found
           showSuccessMessage('User not found', false);
       }
   });
   
   // Search functionality for feedbacks
   const feedbackSearchInput = document.getElementById('feedbackSearchInput');
   const feedbackFilterType = document.getElementById('feedbackFilterType');
   const feedbackFilterStatus = document.getElementById('feedbackFilterStatus');
   
   function filterFeedbacks() {
       const searchTerm = feedbackSearchInput.value.toLowerCase();
       const selectedType = feedbackFilterType.value;
       const selectedStatus = feedbackFilterStatus.value;
       
       const feedbackItems = document.querySelectorAll('#adminFeedbackList .feedback-item');
       const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
       
       let hasResults = false;
       
       feedbackItems.forEach(item => {
           const subject = item.querySelector('.feedback-subject').textContent.toLowerCase();
           const preview = item.querySelector('.feedback-preview').textContent.toLowerCase();
           const username = item.getAttribute('data-username').toLowerCase();
           const type = item.getAttribute('data-type');
           const status = item.getAttribute('data-status');
           
           const matchesSearch = subject.includes(searchTerm) || preview.includes(searchTerm) || username.includes(searchTerm);
           const matchesType = selectedType === 'all' || type === selectedType;
           const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
           
           if (matchesSearch && matchesType && matchesStatus) {
               item.style.display = 'block';
               hasResults = true;
           } else {
               item.style.display = 'none';
           }
       });
       
       noFeedbacksMessage.style.display = hasResults ? 'none' : 'block';
   }
   
   feedbackSearchInput.addEventListener('input', filterFeedbacks);
   feedbackFilterType.addEventListener('change', filterFeedbacks);
   feedbackFilterStatus.addEventListener('change', filterFeedbacks);
   
   // Search functionality for students
   const studentSearchInput = document.getElementById('studentSearchInput');
   
   studentSearchInput.addEventListener('input', function() {
       const searchTerm = studentSearchInput.value.toLowerCase();
       const studentRows = document.querySelectorAll('#studentsTableBody tr');
       const noStudentsMessage = document.getElementById('noStudentsMessage');
       
       let hasResults = false;
       
       studentRows.forEach(row => {
           const username = row.querySelector('td:first-child').textContent.toLowerCase();
           const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
           
           if (username.includes(searchTerm) || email.includes(searchTerm)) {
               row.style.display = '';
               hasResults = true;
           } else {
               row.style.display = 'none';
           }
       });
       
       noStudentsMessage.style.display = hasResults ? 'none' : 'block';
   });
   
   // Initial load of dashboard data
   loadDashboardData();

   // Add this in the DOMContentLoaded event listener
    document.getElementById('clearActivityBtn').addEventListener('click', clearAllRecentActivity);













    // Semester transition handling
    const proceedSemesterBtn = document.getElementById('proceedSemesterBtn');
    const semesterConfirmModal = document.getElementById('semesterConfirmModal');
    const finalConfirmModal = document.getElementById('finalConfirmModal');

    // First modal buttons
    const firstYes = document.getElementById('firstYes');
    const firstNo = document.getElementById('firstNo');
    const firstCloseBtn = semesterConfirmModal.querySelector('.close-btn');

    // Second modal buttons
    const secondYes = document.getElementById('secondYes');
    const secondNo = document.getElementById('secondNo');
    const secondCloseBtn = finalConfirmModal.querySelector('.close-btn');

    // Show first confirmation modal
    proceedSemesterBtn.addEventListener('click', () => {
        semesterConfirmModal.classList.add('show');
    });

    // First modal handlers
    firstNo.addEventListener('click', () => {
        semesterConfirmModal.classList.remove('show');
    });

    firstCloseBtn.addEventListener('click', () => {
        semesterConfirmModal.classList.remove('show');
    });

    firstYes.addEventListener('click', () => {
        finalConfirmModal.classList.add('show');
    });

    // Second modal handlers
    secondNo.addEventListener('click', () => {
        semesterConfirmModal.classList.remove('show');
        finalConfirmModal.classList.remove('show');
    });

    secondCloseBtn.addEventListener('click', () => {
        semesterConfirmModal.classList.remove('show');
        finalConfirmModal.classList.remove('show');
    });

    secondYes.addEventListener('click', () => {
        // Clear all data except admin account
        const adminUser = {
            username: 'DatamexAdmin123',
            password: 'DTMXADMIN123',
            role: 'admin',
            email: 'admin@datamex.edu'
        };
        
        // Clear localStorage
        localStorage.clear();
        
        // Reinitialize with just admin account
        localStorage.setItem('users', JSON.stringify([adminUser]));
        
        // Show success message
        showSuccessMessage('Successfully proceeded to next semester!');
        
        // Refresh the page after a brief delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    });
});

// Initialize local storage with default data if needed
function initializeLocalStorage() {
   // Check if users already exist
   if (!localStorage.getItem('users')) {
       // Create default users
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
       
       // Save to local storage
       localStorage.setItem('users', JSON.stringify(defaultUsers));
   }
   
   // Initialize feedback array if it doesn't exist
   if (!localStorage.getItem('feedbacks')) {
       localStorage.setItem('feedbacks', JSON.stringify([]));
   }
   
   // Initialize recent activity if it doesn't exist
   if (!localStorage.getItem('recentActivity')) {
       localStorage.setItem('recentActivity', JSON.stringify([]));
   }
   
   // Initialize storage usage tracking
   updateStorageUsage();
}

// Load dashboard data
function loadDashboardData() {
   // Get data from local storage
   const users = JSON.parse(localStorage.getItem('users')) || [];
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   const storageUsage = JSON.parse(localStorage.getItem('storageUsage')) || { kilobytes: 0, percent: 0 };
   
   // Count students
   const studentCount = users.filter(user => user.role === 'student').length;
   document.getElementById('totalStudents').textContent = studentCount;
   
   // Count feedbacks
   document.getElementById('totalFeedbacks').textContent = feedbacks.length;
   
   // Count resolved feedbacks
   const resolvedCount = feedbacks.filter(feedback => feedback.status === 'resolved').length;
   document.getElementById('resolvedFeedbacks').textContent = resolvedCount;
   
   // Count pending feedbacks
   const pendingCount = feedbacks.filter(feedback => feedback.status === 'pending').length;
   document.getElementById('pendingFeedbacks').textContent = pendingCount;
   
   // Update storage usage
   const storageProgressBar = document.getElementById('storageProgressBar');
   storageProgressBar.style.width = `${storageUsage.percent}%`;
   
   // Change color based on usage
   if (storageUsage.percent > 80) {
       storageProgressBar.style.backgroundColor = '#F44336'; // Red
   } else if (storageUsage.percent > 60) {
       storageProgressBar.style.backgroundColor = '#FFC107'; // Yellow
   } else {
       storageProgressBar.style.backgroundColor = '#4CAF50'; // Green
   }
   
   document.getElementById('storageDetails').textContent = `${storageUsage.kilobytes} KB used (${storageUsage.percent}%)`;
   
   // Load recent activity
   loadRecentActivity();
}

// Load feedbacks data
function loadFeedbacksData() {
   // Get feedbacks from local storage
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   
   // Get feedback list container
   const feedbackList = document.getElementById('adminFeedbackList');
   const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
   
   // Clear existing content
   feedbackList.innerHTML = '';
   
   // Check if there are any feedbacks
   if (feedbacks.length === 0) {
       noFeedbacksMessage.style.display = 'block';
       noFeedbacksMessage.querySelector('p').textContent = 'No feedbacks have been submitted yet';
       return;
   }
   
   // Sort feedbacks by date (newest first)
   feedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));
   
   // Create feedback items
   feedbacks.forEach(feedback => {
       // Create feedback item
       const feedbackItem = createAdminFeedbackItem(feedback);
       
       // Add to list
       feedbackList.appendChild(feedbackItem);
   });
   
   // Hide no results message
   noFeedbacksMessage.style.display = 'none';
}

// Create admin feedback item
function createAdminFeedbackItem(feedback) {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.setAttribute('data-type', feedback.type);
    feedbackItem.setAttribute('data-status', feedback.status);
    feedbackItem.setAttribute('data-username', feedback.username);
    feedbackItem.setAttribute('data-id', feedback.id);
    
    // Format date
    const date = new Date(feedback.date);
    const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    // Add attachment section if feedback has attachment
    const attachmentHtml = feedback.attachment ? `
        <div class="attachment-section">
            <a href="#" class="attachment-link">
                <i class='bx bx-paperclip'></i> ${feedback.attachment.name}
            </a>
        </div>
    ` : '<div class="no-attachment">No attachment</div>';

    // Update the feedback item HTML to include attachment
    feedbackItem.innerHTML = `
        <div class="feedback-header">
            <div class="feedback-type ${feedback.type}">${capitalizeFirstLetter(feedback.type)}</div>
            <div class="feedback-date">${formattedDate}</div>
        </div>
        <div class="feedback-user">From: <strong>${feedback.username}</strong></div>
        <h3 class="feedback-subject">${feedback.subject}</h3>
        <p class="feedback-preview">message: ${feedback.message.substring(0, 100)}${feedback.message.length > 100 ? '...' : ''}</p>
        Attachment: ${attachmentHtml}
        <div class="feedback-status">
            <span class="status ${feedback.status}">${capitalizeFirstLetter(feedback.status)}</span>
            <div class="feedback-actions">
                <button class="action-btn respond-btn">Respond</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        </div>
    `;
    
        // Add this inside createAdminFeedbackItem after creating the feedback item
    if (feedback.attachment) {
        const attachmentEl = feedbackItem.querySelector('.attachment-link');
        attachmentEl.addEventListener('click', (e) => {
            e.preventDefault();
            handleAttachmentClick(feedback.attachment);
        });
    }

    // Add event listeners
    const respondBtn = feedbackItem.querySelector('.respond-btn');
    respondBtn.addEventListener('click', () => showFeedbackResponseModal(feedback));
    
    const deleteBtn = feedbackItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteFeedback(feedback.id));


    return feedbackItem;
}

// Show feedback response modal
function showFeedbackResponseModal(feedback) {
   const modal = document.getElementById('feedbackResponseModal');
   
   // Set modal content
   document.getElementById('responseModalUsername').textContent = feedback.username;
   document.getElementById('responseModalSubject').textContent = feedback.subject;
   document.getElementById('responseModalType').textContent = capitalizeFirstLetter(feedback.type);
   document.getElementById('responseModalMessage').textContent = feedback.message;
   
   
   // Handle attachment in modal
   const attachmentRow = modal.querySelector('.attachment-row');
   if (feedback.attachment) {
       attachmentRow.style.display = 'flex';
       const modalAttachment = attachmentRow.querySelector('.attachment-link');
       if (modalAttachment) {
           // Remove existing event listeners
           const newModalAttachment = modalAttachment.cloneNode(true);
           modalAttachment.parentNode.replaceChild(newModalAttachment, modalAttachment);
           
           // Update attachment link
           newModalAttachment.innerHTML = `
               <i class='bx bx-paperclip'></i>
               ${feedback.attachment.name}
           `;

           // Add new click handler
           newModalAttachment.addEventListener('click', (e) => {
               e.preventDefault();
               handleAttachmentClick(feedback.attachment);
           });
       }
   } else {
       attachmentRow.innerHTML = '<span class="detail-label">Attachment:</span><div class="no-attachment">No attachment</div>';
       attachmentRow.style.display = 'flex';
   }

   // Set form fields - Keep these after attachment handling
   document.getElementById('feedbackStatus').value = feedback.status;
   if (feedback.response) {
       document.getElementById('responseMessage').value = feedback.response;
   } else {
       document.getElementById('responseMessage').value = '';
   }
   document.getElementById('feedbackId').value = feedback.id;
  
   // Show modal last
   modal.classList.add('show');
}

// Delete feedback
function deleteFeedback(feedbackId) {
   if (!confirm('Are you sure you want to delete this feedback?')) {
       return;
   }
   
   // Get feedbacks
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   
   // Find feedback
   const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
   
   if (feedbackIndex !== -1) {
       // Get username for activity log
       const username = feedbacks[feedbackIndex].username;
       
       // Remove feedback
       feedbacks.splice(feedbackIndex, 1);
       
       // Save to local storage
       localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
       
       // Update storage usage
       updateStorageUsage();
       
       // Add to recent activity
       addRecentActivity(`Deleted feedback from ${username}`);
       
       // Show success message
       showSuccessMessage('Feedback deleted successfully');
       
       // Reload feedbacks data
       loadFeedbacksData();
   }
}

// Load students data
function loadStudentsData() {
   // Get users from local storage
   const users = JSON.parse(localStorage.getItem('users')) || [];
   
   // Filter students
   const students = users.filter(user => user.role === 'student');
   
   // Get students table body
   const studentsTableBody = document.getElementById('studentsTableBody');
   const noStudentsMessage = document.getElementById('noStudentsMessage');
   
   // Clear existing content
   studentsTableBody.innerHTML = '';
   
   // Check if there are any students
   if (students.length === 0) {
       noStudentsMessage.style.display = 'block';
       return;
   }
   
   // Create student rows
   students.forEach(student => {
       // Count feedbacks for this student
       const userFeedbackKey = `userFeedbacks_${student.username}`;
       const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
       
       // Create table row
       const row = document.createElement('tr');
       
       row.innerHTML = `
           <td>${student.username}</td>
           <td>${student.email}</td>
           <td>${userFeedbacks.length}</td>
           <td>
               <button class="action-btn edit">Reset Password</button>
               <button class="action-btn delete">Delete Account</button>
           </td>
       `;
       
       // Add event listeners
       const resetPasswordBtn = row.querySelector('.edit');
       resetPasswordBtn.addEventListener('click', () => showManualResetPasswordModal(student));
       
       const deleteAccountBtn = row.querySelector('.delete');
       deleteAccountBtn.addEventListener('click', () => deleteStudentAccount(student.username));
       
       // Add to table
       studentsTableBody.appendChild(row);
   });
   
   // Hide no results message
   noStudentsMessage.style.display = 'none';
}

// Show manual reset password modal
function showManualResetPasswordModal(student) {
   const modal = document.getElementById('resetPasswordModal');
   
   // Set modal content
   document.getElementById('resetUsername').value = student.username;
   document.getElementById('resetEmail').value = student.email;
   document.getElementById('newResetPassword').value = '';
   document.getElementById('resetRequestId').value = 'manual';
   
   // Show modal
   modal.classList.add('show');
}

// Delete student account
function deleteStudentAccount(username) {
   if (!confirm(`Are you sure you want to delete the account for ${username}?`)) {
       return;
   }
   
   // Get users
   const users = JSON.parse(localStorage.getItem('users')) || [];
   
   // Remove user
   const updatedUsers = users.filter(user => user.username !== username);
   
   // Save to local storage
   localStorage.setItem('users', JSON.stringify(updatedUsers));
   
   // Remove user feedbacks
   const userFeedbackKey = `userFeedbacks_${username}`;
   localStorage.removeItem(userFeedbackKey);
   
   // Remove user feedbacks from admin list
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   const updatedFeedbacks = feedbacks.filter(feedback => feedback.username !== username);
   localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
   
   // Update storage usage
   updateStorageUsage();
   
   // Add to recent activity
   addRecentActivity(`Deleted account for ${username}`);
   
   // Show success message
   showSuccessMessage('Student account deleted successfully');
   
   // Reload students data
   loadStudentsData();
   
   // Update dashboard counts
   loadDashboardData();
}







// Load recent activity
function loadRecentActivity() {
   // Get recent activity
   const activities = JSON.parse(localStorage.getItem('recentActivity')) || [];
   
   // Get activity list container
   const activityList = document.getElementById('recentActivity');
   
   // Clear existing content
   activityList.innerHTML = '';
   
   // Check if there are any activities
   if (activities.length === 0) {
       activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
       return;
   }
   
   // Sort activities by timestamp (newest first)
   activities.sort((a, b) => b.timestamp - a.timestamp);
   
   // Limit to 10 most recent activities
   const recentActivities = activities.slice(0, 10);
   
   // Create activity items
   recentActivities.forEach(activity => {
       // Create activity item
       const activityItem = document.createElement('div');
       activityItem.className = 'activity-item';
       
       // Determine icon based on activity type
       let icon = 'bx-info-circle';
       if (activity.message.includes('created')) icon = 'bx-user-plus';
       if (activity.message.includes('deleted')) icon = 'bx-trash';
       if (activity.message.includes('reset')) icon = 'bx-key';
       if (activity.message.includes('responded')) icon = 'bx-message-dots';
       
       // Format date
       const date = new Date(activity.timestamp);
       const formattedDate = `${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`;
       
       // Create HTML structure
       activityItem.innerHTML = `
           <div class="activity-icon">
               <i class='bx ${icon}'></i>
           </div>
           <div class="activity-details">
               <div class="activity-message">${activity.message}</div>
               <div class="activity-time">${formattedDate}</div>
           </div>
       `;
       
       // Add to list
       activityList.appendChild(activityItem);
   });
}





// Add recent activity
function addRecentActivity(message) {
   // Get recent activity
   const activities = JSON.parse(localStorage.getItem('recentActivity')) || [];
   
   // Add new activity
   activities.push({
       message: message,
       timestamp: new Date().getTime()
   });
   
   // Limit to 50 most recent activities
   if (activities.length > 50) {
       activities.sort((a, b) => b.timestamp - a.timestamp);
       activities.splice(50);
   }
   
   // Save to local storage
   localStorage.setItem('recentActivity', JSON.stringify(activities));
   
   // Update storage usage
   updateStorageUsage();
}

function clearAllRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) {
        showSuccessMessage('Activity list not found', false);
        return;
    }

    // Check if there are any activities to clear
    const activities = JSON.parse(localStorage.getItem('recentActivity')) || [];
    if (activities.length === 0) {
        showSuccessMessage('No recent activities found to clear', false);
        return;
    }

    if (!confirm('Are you sure you want to delete all recent activity? This cannot be undone.')) {
        return;
    }
    
    // Add fade-out animation
    activityList.style.transition = 'opacity 0.3s ease-out';
    activityList.style.opacity = '0';
    
    setTimeout(() => {
        // Clear recent activity from localStorage
        localStorage.setItem('recentActivity', JSON.stringify([]));
        
        // Update storage usage
        updateStorageUsage();
        
        // Reload recent activity display
        loadRecentActivity();
        
        // Fade back in
        activityList.style.opacity = '1';
        
        // Show success message
        showSuccessMessage('All recent activity cleared successfully');
    }, 300);
}

// Show success message
function showSuccessMessage(message, isSuccess = true) {
   const successMessage = document.getElementById('successMessage');
   const successMessageText = document.getElementById('successMessageText');
   const storageInfoSmall = document.getElementById('storageInfoSmall');
   
   // Set message
   successMessageText.textContent = message;
   
   // Set color based on success/error
   successMessage.style.backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
   
   // Update storage info
   const storageUsage = JSON.parse(localStorage.getItem('storageUsage')) || { kilobytes: 0, percent: 0 };
   storageInfoSmall.textContent = `Storage: ${storageUsage.kilobytes} KB (${storageUsage.percent}% used)`;
   
   // Show message
   successMessage.classList.add('show');
   
   // Hide message after 3 seconds
   setTimeout(function() {
       successMessage.classList.remove('show');
   }, 3000);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
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

// Also, we need to update the login.js file to handle admin authentication:
document.addEventListener('DOMContentLoaded', function() {
   // Add submit event listener to the login form
   const loginFormElement = document.getElementById('loginForm').querySelector('form');
   loginFormElement.addEventListener('submit', function(event) {
       event.preventDefault();
       
       // Get username and password input values
       const username = document.getElementById('username').value.trim();
       const password = document.getElementById('password').value.trim();
       
       // Get users from local storage
       const users = JSON.parse(localStorage.getItem('users')) || [];
       
       // Find user
       const user = users.find(u => u.username === username && u.password === password);
       
       if (user) {
           // Store user info in session storage
           sessionStorage.setItem('currentUser', JSON.stringify({
               username: user.username,
               role: user.role
           }));
           
           // Redirect based on role
           if (user.role === 'admin') {
               window.location.href = 'admin-dashboard.html';
           } else {
               window.location.href = 'home.html';
           }
       } else {
           // Show error message
           const cautionMessage = document.getElementById('cautionMessage');
           cautionMessage.querySelector('span').textContent = 'Invalid username or password';
           cautionMessage.classList.add('show');
           
           // Hide message after 3 seconds
           setTimeout(() => {
               cautionMessage.classList.remove('show');
           }, 3000);
           
           // Apply vibration effect
           applyVibrationEffect(document.getElementById('username'));
           applyVibrationEffect(document.getElementById('password'));
           
           // Use device vibration if available
           if (navigator.vibrate) {
               navigator.vibrate(100);
           }
       }
   });
});






function showAttachment(attachment) {
    const modal = document.createElement('div');
    modal.className = 'attachment-modal';
    
    if (attachment.type.startsWith('image/')) {
        modal.innerHTML = `
            <div class="attachment-content">
                <button class="close-btn"><i class='bx bx-x'></i></button>
                <img src="${attachment.data}" alt="Attachment">
                <a href="${attachment.data}" download="${attachment.name}" class="download-btn">
                    <i class='bx bx-download'></i> Download Image
                </a>
            </div>
        `;
    }
    
    document.body.appendChild(modal);
    
    // Add close handlers
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });
}

function handleAttachmentClick(attachment) {
    if (attachment.type.startsWith('image/')) {
        showAttachment(attachment);
    } else {
        // Direct download for non-image files
        const link = document.createElement('a');
        link.href = attachment.data;
        link.download = attachment.name;
        link.click();
    }
}