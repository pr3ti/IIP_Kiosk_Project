// ============================================================
// ADMIN.JS - TABLE OF CONTENTS
// ============================================================
// 
// GLOBAL VARIABLES
//   - currentPhotoViewingId        - Track currently viewed photo ID
//   - currentDownloadType          - Track current download operation type
//   - currentDeleteFeedbackId      - Track feedback ID pending deletion
//   - currentEmailViewingId        - Track email ID being viewed
//   - currentAuditPage             - Current audit logs pagination page
//   - auditLogsPerPage             - Items per page for audit logs
//   - fallbackUsers                - Fallback authentication data for development
//
// AUTHENTICATION & SESSION MANAGEMENT
//   - handleLogin()                - Admin login with API and fallback
//   - handleLogout()               - Log out admin user with audit logging
//   - updateUIForUser()            - Update UI based on user role
//   - formatRoleName()             - Format role names for display
//
// AUDIT LOGS FUNCTIONALITY
//   - loadAuditLogs()              - Load audit log entries with pagination
//   - updateAuditTable()           - Update audit logs table display
//   - getAuditBadgeType()          - Determine badge style based on action type
//   - updateAuditPagination()      - Update pagination controls
//   - prevAuditPage()              - Navigate to previous audit page
//   - nextAuditPage()              - Navigate to next audit page
//
// DASHBOARD MANAGEMENT
//   - loadDashboardData()          - Load dashboard statistics from API
//   - updateDashboardStats()       - Update dashboard stat cards
//   - updateRecentActivity()       - Update recent activity section
//   - createStatusItem()           - Create status item element
//   - updateLastUpdated()          - Update last updated timestamp
//   - getDefaultStats()            - Get fallback statistics for offline mode
//   - refreshDashboard()           - Refresh dashboard data
//
// FEEDBACK DATA MANAGEMENT
//   - loadFeedbackData()           - Load feedback data from API
//   - updateFeedbackTable()        - Update feedback table with data
//   - escapeHtml()                 - Escape HTML for safe display
//   - refreshFeedbackData()        - Refresh feedback data
//
// PLEDGE & CONTENT VIEWING
//   - viewPledge()                 - Display pledge content in popup
//   - closePledgePopup()           - Close pledge popup
//   - viewQuestionAnswers()        - Load and display question answers
//   - createQuestionAnswersPopup() - Create Q&A popup interface
//   - formatAnswer()               - Format answer based on question type
//   - closeQAPopup()               - Close Q&A popup
//
// PHOTO MANAGEMENT
//   - viewRawPhoto()               - View raw photo without password
//   - viewProcessedPhoto()         - View processed photo without password
//   - showRawPhotoPopup()          - Show raw photo popup
//   - showProcessedPhotoPopup()    - Show processed photo popup
//   - createPhotoPopup()           - Create photo viewing popup
//   - handlePhotoError()           - Handle photo loading errors
//   - downloadPhoto()              - Download photo file
//   - closePhotoPopup()            - Close photo popup
//
// EMAIL MANAGEMENT
//   - viewEncryptedEmail()         - Request email viewing with password
//   - createEmailPasswordModal()   - Create password verification modal for email
//   - verifyEmailAccess()          - Verify password for email access
//   - showEmailPopup()             - Display decrypted email in popup
//   - cancelEmailView()            - Cancel email viewing
//   - closeEmailModal()            - Close email password modal
//   - closeEmailPopup()            - Close email display popup
//
// OVERLAY MANAGEMENT
//   - loadOverlayData()            - Load overlay themes from API
//   - showOverlayMessage()         - Display overlay status message
//   - createOverlaysTable()        - Placeholder for creating overlays table
//   - updateOverlayTable()         - Update overlay grid display
//   - viewOverlay()                - View overlay image in popup
//   - closeOverlayPreview()        - Close overlay preview
//   - handleOverlayImageError()    - Handle overlay image loading errors
//   - downloadOverlay()            - Download overlay image
//
// OVERLAY MANAGEMENT - ADD & DELETE
//   - showAddOverlayModal()        - Show add overlay modal (System Admin only)
//   - closeAddOverlayModal()       - Close add overlay modal
//   - handleAddOverlay()           - Handle overlay creation with file upload
//   - deleteOverlay()              - Request overlay deletion (System Admin only)
//   - performOverlayDeletion()     - Execute overlay deletion
//
// USER MANAGEMENT
//   - loadUserManagementData()     - Load admin users data
//   - updateUserManagementTable()  - Update users management table
//   - getFallbackUsers()           - Get fallback user data for development
//
// USER MANAGEMENT - EDIT, ADD, DELETE
//   - editUser()                   - Open user edit modal (System Admin only)
//   - handleEditUser()             - Process user updates
//   - closeEditUserModal()         - Close edit user modal
//   - deleteUser()                 - Request user deletion (System Admin only)
//   - performUserDeletion()        - Execute user deletion
//   - addUser()                    - Open add user modal (System Admin only)
//   - handleAddUser()              - Process new user creation
//   - closeAddUserModal()          - Close add user modal
//
// QUESTION MANAGEMENT
//   - loadQuestionManagementData() - Load question data from API
//   - updateQuestionManagementTable() - Update question display
//   - formatQuestionType()         - Format question type for display
//   - showAddQuestionModal()       - Show add question modal (System Admin only)
//   - closeAddQuestionModal()      - Close add question modal
//   - toggleOptionsField()         - Show/hide options based on question type
//   - addOptionField()             - Add option input field
//   - removeOptionField()          - Remove option input field
//   - handleAddQuestion()          - Process new question creation
//
// QUESTION MANAGEMENT - EDIT & DELETE
//   - editQuestion()               - Open question edit modal (System Admin only)
//   - handleEditQuestion()         - Process question updates (safe editing)
//   - closeEditQuestionModal()     - Close edit question modal
//   - deleteQuestion()             - Delete question (System Admin only)
//
// SECURITY & ACCESS CONTROL
//   - downloadExcel()              - Request Excel download (System Admin only)
//   - downloadPhotos()             - Request photos download (System Admin only)
//   - showDownloadPasswordModal()  - Show download password prompt
//   - verifyDownloadAccess()       - Verify password for downloads
//   - closeDownloadModal()         - Close download modal
//
// FEEDBACK DELETION
//   - deleteFeedback()             - Request feedback deletion with password
//   - showDeletePasswordModal()    - Show deletion password prompt
//   - verifyDeleteAccess()         - Verify password for deletion
//   - performFeedbackDeletion()    - Execute feedback deletion
//   - closeDeleteModal()           - Close delete modal
//
// NAVIGATION & PAGE MANAGEMENT
//   - showPage()                   - Navigate between pages with role-based access control
//
// DIGITAL TREE MANAGEMENT
//   - loadDigitalTreeData()        - Load digital tree visitor data
//   - updateDigitalTreeTable()     - Update digital tree table
//   - refreshTreeData()            - Refresh tree data
//
// INITIALIZATION & EVENT HANDLERS
//   - DOMContentLoaded event       - Check login status on page load
//   - testDatabase()               - Test database connection
//
// ============================================================

// ==================== GLOBAL VARIABLES ====================

// Photo viewing state
let currentPhotoViewingId = null;

// Download modals
let currentDownloadType = null;

// Feedback deletion tracking
let currentDeleteFeedbackId = null;

// Email viewing
let currentEmailViewingId = null;

// Audit logs pagination
let currentAuditPage = 1;
const auditLogsPerPage = 50;

// Fallback authentication data
const fallbackUsers = {
    'systemadmin': {
        password: 'SystemAdmin123!',
        role: 'system_admin',
        full_name: 'System Administrator'
    },
    'admin': {
        password: 'admin123',
        role: 'IT_admin',
        full_name: 'IT Administrator'
    },
    'staff': {
        password: 'staff123',
        role: 'IT_staff',
        full_name: 'IT Staff'
    }
};

// ==================== AUTHENTICATION & SESSION MANAGEMENT ====================

// Handle login
async function handleLogin(event) {
    console.log('Login function called');
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username:', username, 'Password:', password ? '***' : 'empty');
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    try {
        console.log('Attempting API login...');
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            console.log('Login successful via API');
            // Store logged in user
            sessionStorage.setItem('loggedUser', data.user.username);
            sessionStorage.setItem('userRole', data.user.role);
            
            // Update UI and apply role-based access
            updateUIForUser(data.user.username, data.user.role);
            
            // Load dashboard data
            await loadDashboardData();
            
            // Show dashboard
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
        } else {
            console.log('API login failed, trying fallback...');
            // Fallback to local authentication if database fails
            if (fallbackUsers[username] && fallbackUsers[username].password === password) {
                console.log('Fallback login successful');
                sessionStorage.setItem('loggedUser', username);
                sessionStorage.setItem('userRole', fallbackUsers[username].role);
                
                updateUIForUser(username, fallbackUsers[username].role);
                await loadDashboardData();
                
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
            } else {
                console.log('All login methods failed');
                alert('Invalid username or password');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to local authentication
        if (fallbackUsers[username] && fallbackUsers[username].password === password) {
            console.log('Fallback login successful after error');
            sessionStorage.setItem('loggedUser', username);
            sessionStorage.setItem('userRole', fallbackUsers[username].role);
            
            updateUIForUser(username, fallbackUsers[username].role);
            await loadDashboardData();
            
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
        } else {
            alert('Invalid username or password. Error: ' + error.message);
        }
    }
}

// Handle logout
function handleLogout() {
    const username = sessionStorage.getItem('loggedUser');
    
    // Log the logout
    fetch('/api/admin/logout-audit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: username })
    }).catch(() => {}); // Don't worry if it fails
    
    sessionStorage.clear();
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('login-form').reset();
}

// Update UI for user role
function updateUIForUser(username, role) {
    // Update user info in header
    document.getElementById('logged-username').textContent = username;
    document.getElementById('logged-role').textContent = formatRoleName(role);
    document.querySelector('.user-avatar').textContent = username[0].toUpperCase();
    
    // Show/hide administration section based on role
    const adminSection = document.querySelector('.sidebar-section:nth-child(2)');
    if (role === 'system_admin') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
    
    // Show/hide download buttons based on role
    const downloadButtons = document.querySelectorAll('.btn-secondary');
    if (role === 'system_admin') {
        downloadButtons.forEach(btn => btn.style.display = 'inline-block');
    } else {
        downloadButtons.forEach(btn => btn.style.display = 'none');
    }
    
    // If current page is an admin page and user is not system admin, redirect to dashboard
    const currentPage = document.querySelector('.page.active');
    if (currentPage && !currentPage.id.includes('dashboard') && role !== 'system_admin') {
        showPage('dashboard');
    }
}

// Format role name for display
function formatRoleName(role) {
    const roleMap = {
        'system_admin': 'System Admin',
        'IT_admin': 'IT Admin',
        'IT_staff': 'IT Staff'
    };
    return roleMap[role] || role;
}

// ==================== AUDIT LOGS FUNCTIONALITY ====================

async function loadAuditLogs() {
    try {
        const response = await fetch(`/api/admin/audit-logs?limit=${auditLogsPerPage}&offset=${(currentAuditPage - 1) * auditLogsPerPage}`);
        const data = await response.json();
        
        if (data.success) {
            updateAuditTable(data.logs);
            updateAuditPagination(data.total);
        }
    } catch (error) {
        console.error('Error loading audit logs:', error);
    }
}

function updateAuditTable(logs) {
    const tbody = document.getElementById('audit-logs-body');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                    No audit logs found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td><strong>${log.admin_username}</strong></td>
            <td><span class="badge badge-${getAuditBadgeType(log.action)}">${log.action}</span></td>
            <td>${log.target_type ? `${log.target_type} #${log.target_id}` : '—'}</td>
            <td style="font-size: 12px; color: #64748b;">${log.ip_address || '—'}</td>
        </tr>
    `).join('');
}

function getAuditBadgeType(action) {
    if (action.includes('DELETE')) return 'warning';
    if (action.includes('LOGIN') || action.includes('DOWNLOAD') || action.includes('EMAIL')) return 'security';
    if (action.includes('ADD') || action.includes('EDIT')) return 'active';
    return 'system';
}

function updateAuditPagination(total) {
    document.getElementById('audit-page-info').textContent = `Page ${currentAuditPage}`;
    document.getElementById('prev-audit-btn').disabled = currentAuditPage <= 1;
    document.getElementById('next-audit-btn').disabled = (currentAuditPage * auditLogsPerPage) >= total;
}

function prevAuditPage() {
    if (currentAuditPage > 1) {
        currentAuditPage--;
        loadAuditLogs();
    }
}

function nextAuditPage() {
    currentAuditPage++;
    loadAuditLogs();
}

// ==================== DASHBOARD MANAGEMENT ====================

// Load dashboard data from database
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dashboard API response:', data);
        
        if (data.success) {
            updateDashboardStats(data.stats);
            updateRecentActivity(data.recentActivity);
            updateLastUpdated();
        } else {
            console.error('Failed to load dashboard data:', data.error);
            alert('Error loading dashboard data: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to default data
        updateDashboardStats(getDefaultStats());
        alert('Error connecting to server. Please check if the server is running.');
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    console.log('Updating dashboard with stats:', stats);
    
    // Update stat cards with real data from database (5 cards)
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 5) {
        statCards[0].querySelector('.stat-value').textContent = stats.totalVisitors;
        statCards[1].querySelector('.stat-value').textContent = stats.todaysVisitors;
        statCards[2].querySelector('.stat-value').textContent = stats.feedbackSubmissions;
        statCards[3].querySelector('.stat-value').textContent = stats.usersWithEmail;
        statCards[4].querySelector('.stat-value').textContent = stats.recentSubmissions;
    } else {
        console.error('Not enough stat cards found, expected 5 but found:', statCards.length);
    }
}

// Update recent activity section
function updateRecentActivity(activity) {
    const systemStatusSection = document.querySelector('.status-section:first-child');
    const dataManagementSection = document.querySelector('.status-section:last-child');
    
    if (!systemStatusSection || !dataManagementSection) {
        console.error('Status sections not found');
        return;
    }
    
    // Clear existing status items (except headers)
    systemStatusSection.querySelectorAll('.status-item').forEach(item => item.remove());
    dataManagementSection.querySelectorAll('.status-item').forEach(item => item.remove());
    
    // Add system status items
    activity.systemStatus.forEach(item => {
        const statusItem = createStatusItem(item.label, item.value, item.badgeType);
        systemStatusSection.appendChild(statusItem);
    });
    
    // Add data management items
    activity.dataManagement.forEach(item => {
        const statusItem = createStatusItem(item.label, item.value, item.badgeType);
        dataManagementSection.appendChild(statusItem);
    });
}

// Create status item element
function createStatusItem(label, value, badgeType) {
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    
    statusItem.innerHTML = `
        <span>${label}</span>
        <span class="badge badge-${badgeType}">${value}</span>
    `;
    
    return statusItem;
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const lastUpdatedElement = document.querySelector('.last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Last updated: ${timeString}`;
    }
}

function getDefaultStats() {
    return {
        totalVisitors: 0,
        todaysVisitors: 0,
        feedbackSubmissions: 0,
        usersWithEmail: 0,
        recentSubmissions: 0
    };
}

// Refresh dashboard data
function refreshDashboard() {
    loadDashboardData();
}

// ==================== FEEDBACK DATA MANAGEMENT ====================

// Load feedback data
async function loadFeedbackData() {
    try {
        console.log('Loading feedback data...');
        const response = await fetch('/api/admin/feedback');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Feedback API response:', data);
        
        // DEBUG: Check the actual data structure
        if (data.success && data.feedback && data.feedback.length > 0) {
            console.log('🔍 First feedback item structure:', data.feedback[0]);
            console.log('📊 Data retention value:', data.feedback[0].data_retention);
            console.log('📊 Data retention type:', typeof data.feedback[0].data_retention);
        }
        
        if (data.success) {
            updateFeedbackTable(data.feedback);
        } else {
            console.error('Failed to load feedback data:', data.error);
            alert('Error loading feedback data: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading feedback data:', error);
        alert('Error connecting to server. Please check if the server is running.');
    }
}

function updateFeedbackTable(feedbackData) {
    const tbody = document.querySelector('#feedback-data-page table tbody');
    if (!tbody) {
        console.error('Feedback table tbody not found');
        return;
    }
    
    tbody.innerHTML = ''; // Clear existing rows
    
    if (feedbackData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px;">
                    No feedback data available
                </td>
            </tr>
        `;
        return;
    }
    
    const userRole = sessionStorage.getItem('userRole');
    const isSystemAdmin = userRole === 'system_admin';
    
    feedbackData.forEach(feedback => {
        const row = document.createElement('tr');
        
        // Check if pledge (comment) exists
        const hasPledge = feedback.pledge && feedback.pledge.trim() !== '';
        
        // Format email for privacy - show masked email for non-admins
        let emailDisplay;
        if (isSystemAdmin && feedback.email_encrypted) {
            emailDisplay = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #94a3b8; font-size: 12px;">🔒 Encrypted</span>
                    <button class="btn-view" onclick="viewEncryptedEmail(${feedback.id})" style="padding: 2px 6px; font-size: 10px;">
                        👁️ View
                    </button>
                </div>
            `;
        } else if (feedback.email) {
            emailDisplay = feedback.email.replace(/(?<=.).(?=.*@)/g, '*');
        } else {
            emailDisplay = 'No email';
        }
        
        // Format date
        const date = new Date(feedback.date).toLocaleDateString();
        
        // Check if photos exist
        const hasRawPhoto = feedback.photo_path && feedback.photo_path !== '';
        const hasProcessedPhoto = feedback.processed_photo_path && feedback.processed_photo_path !== '';
        
        // Check if there are question answers
        const hasQuestionAnswers = feedback.question_answers && feedback.question_answers.length > 0;
        
        // DEBUG: Log the data retention value to console
        console.log('Feedback ID:', feedback.id, 'Data Retention:', feedback.data_retention);

        // Determine data retention badge type and display text
        let dataRetentionDisplay = '';

        if (feedback.data_retention === '7days' || feedback.data_retention === '7day') {
            dataRetentionDisplay = '<span class="badge badge-warning">7 DAY</span>';
        } else if (feedback.data_retention === 'indefinite') {
            dataRetentionDisplay = '<span class="badge badge-permanent">PERMANENT</span>';
        } else {
            // Fallback for null, undefined, or any other values
            dataRetentionDisplay = '<span class="badge badge-permanent">PERMANENT</span>';
        }
        
        row.innerHTML = `
            <td>${feedback.name || 'Anonymous'}</td>
            <td>${emailDisplay}</td>
            <td>${feedback.visits || 1}</td>
            <td>
                ${hasPledge ? 
                    `<button class="btn-view" onclick="viewPledge(${feedback.id}, '${escapeHtml(feedback.pledge)}')">
                        👁️ View Pledge
                    </button>` : 
                    '<span style="color: #94a3b8; font-size: 12px;">No pledge</span>'
                }
            </td>
            <td>
                ${hasQuestionAnswers ? 
                    `<button class="btn-view" onclick="viewQuestionAnswers(${feedback.id})">
                        👁️ View Q&A
                    </button>` : 
                    '<span style="color: #94a3b8; font-size: 12px;">No answers</span>'
                }
            </td>
            <td>${dataRetentionDisplay}</td>
            <td>
                ${hasRawPhoto ? 
                    `<button class="btn-view" onclick="viewRawPhoto(${feedback.id})">👁️ View Raw</button>` : 
                    '<span style="color: #94a3b8; font-size: 12px;">No raw photo</span>'
                }
            </td>
            <td>
                ${hasProcessedPhoto ? 
                    `<button class="btn-view" onclick="viewProcessedPhoto(${feedback.id})">👁️ View Processed</button>` : 
                    '<span style="color: #94a3b8; font-size: 12px;">No processed photo</span>'
                }
            </td>
            <td>${date}</td>
            <td>
                <button class="btn-delete" onclick="deleteFeedback(${feedback.id})">🗑️ Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Helper function to escape HTML for safe display
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh feedback data
function refreshFeedbackData() {
    loadFeedbackData();
}

// ==================== PLEDGE & CONTENT VIEWING ====================

// View pledge popup
function viewPledge(feedbackId, pledgeText) {
    console.log('Viewing pledge for ID:', feedbackId, 'Text:', pledgeText);
    
    const pledgePopup = document.createElement('div');
    pledgePopup.className = 'pledge-popup';
    pledgePopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const hasPledge = pledgeText && pledgeText.trim() !== '';
    
    pledgePopup.innerHTML = `
        <div class="pledge-container" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b;">Pledge</h3>
                <button onclick="closePledgePopup()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            ${hasPledge ? `
                <div style="
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 20px;
                ">
                    <div style="
                        font-size: 15px;
                        line-height: 1.6;
                        color: #1e293b;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        text-align: left;
                    ">
                        ${pledgeText}
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #64748b; margin-bottom: 15px;">
                    Feedback ID: ${feedbackId} • Viewed by ${sessionStorage.getItem('loggedUser')}
                </div>
            ` : `
                <div style="
                    background: #f8fafc;
                    padding: 40px 25px;
                    border-radius: 12px;
                    border: 2px dashed #e2e8f0;
                    margin-bottom: 20px;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px; color: #cbd5e1;">📝</div>
                    <div style="color: #64748b; font-size: 14px;">
                        No pledge provided
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #64748b; margin-bottom: 15px;">
                    Feedback ID: ${feedbackId}
                </div>
            `}
            
            <button onclick="closePledgePopup()" style="
                padding: 10px 20px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                width: 100%;
            ">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(pledgePopup);
}

// Close pledge popup
function closePledgePopup() {
    const popup = document.querySelector('.pledge-popup');
    if (popup) {
        popup.remove();
    }
}

// View question answers popup
function viewQuestionAnswers(feedbackId) {
    // First, get the specific feedback data to access question answers
    fetch('/api/admin/feedback')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feedback = data.feedback.find(f => f.id === feedbackId);
                if (!feedback) {
                    alert('Feedback not found');
                    return;
                }

                createQuestionAnswersPopup(feedbackId, feedback.question_answers || []);
            }
        })
        .catch(error => {
            console.error('Error fetching feedback data:', error);
            alert('Error loading question answers');
        });
}

// Create question answers popup
function createQuestionAnswersPopup(feedbackId, questionAnswers) {
    const qaPopup = document.createElement('div');
    qaPopup.className = 'qa-popup';
    qaPopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 20px;
        box-sizing: border-box;
    `;

    qaPopup.innerHTML = `
        <div class="qa-container" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            max-width: 700px;
            max-height: 80vh;
            width: 90%;
            text-align: left;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #1e293b;">Questions & Answers - ID: ${feedbackId}</h3>
                <button onclick="closeQAPopup()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <div style="flex: 1; overflow-y: auto; margin-bottom: 20px;">
                ${questionAnswers.length > 0 ? 
                    questionAnswers.map((qa, index) => `
                        <div class="qa-item" style="
                            background: #f8fafc;
                            padding: 20px;
                            border-radius: 8px;
                            margin-bottom: 15px;
                            border-left: 4px solid #667eea;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <h4 style="margin: 0; color: #1e293b; font-size: 15px; flex: 1;">
                                    Q${index + 1}: ${qa.question_text}
                                </h4>
                                <span style="
                                    background: #e0e7ff;
                                    color: #3730a3;
                                    padding: 4px 8px;
                                    border-radius: 6px;
                                    font-size: 11px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                ">
                                    ${qa.question_type}
                                </span>
                            </div>
                            
                            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <strong style="color: #475569; font-size: 13px;">Answer:</strong>
                                <div style="color: #1e293b; margin-top: 6px; font-size: 14px;">
                                    ${formatAnswer(qa.answer_value, qa.question_type, qa.option_label)}
                                </div>
                            </div>
                        </div>
                    `).join('') 
                    : 
                    `<div style="text-align: center; padding: 40px; color: #64748b;">
                        <div style="font-size: 48px; margin-bottom: 16px;">❓</div>
                        <h4 style="color: #64748b; margin-bottom: 10px;">No Questions Answered</h4>
                        <p>This user did not answer any questions in their feedback submission.</p>
                    </div>`
                }
            </div>
            
            <div style="font-size: 12px; color: #64748b; margin-bottom: 15px; flex-shrink: 0;">
                Viewed by: ${sessionStorage.getItem('loggedUser')} at ${new Date().toLocaleTimeString()}
            </div>
            
            <div style="flex-shrink: 0; text-align: center;">
                <button onclick="closeQAPopup()" style="
                    padding: 10px 20px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(qaPopup);
}

// Format answer based on question type
function formatAnswer(answerValue, questionType, optionLabel) {
    if (!answerValue) return '<span style="color: #94a3b8; font-style: italic;">No answer provided</span>';
    
    switch (questionType) {
        case 'yesno':
            // Handle both 'yes'/'no' and '1'/'0' formats
            if (answerValue.toLowerCase() === 'yes' || answerValue === '1' || answerValue === 'true') {
                return '✅ Yes';
            } else if (answerValue.toLowerCase() === 'no' || answerValue === '0' || answerValue === 'false') {
                return '❌ No';
            } else {
                return answerValue; // Fallback for unexpected values
            }
        case 'stars':
            const stars = parseInt(answerValue);
            return '★'.repeat(stars) + '☆'.repeat(5 - stars) + ` (${stars}/5)`;
        case 'choice':
            return optionLabel || answerValue;
        case 'text':
        default:
            return answerValue;
    }
}

// Close Q&A popup
function closeQAPopup() {
    const popup = document.querySelector('.qa-popup');
    if (popup) {
        popup.remove();
    }
}

// ==================== PHOTO MANAGEMENT ====================

// View raw photo - NO PASSWORD REQUIRED
async function viewRawPhoto(feedbackId) {
    showRawPhotoPopup(feedbackId);
}

// View processed photo - NO PASSWORD REQUIRED
async function viewProcessedPhoto(feedbackId) {
    showProcessedPhotoPopup(feedbackId);
}

// Show raw photo in popup
function showRawPhotoPopup(feedbackId) {
    // First, get the photo path from the feedback data
    fetch('/api/admin/feedback')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feedback = data.feedback.find(f => f.id === feedbackId);
                if (!feedback) {
                    alert('Feedback not found');
                    return;
                }

                const photoPath = feedback.photo_path;
                if (!photoPath) {
                    alert('No raw photo available for this feedback');
                    return;
                }

                createPhotoPopup(feedbackId, photoPath, 'Raw');
            }
        })
        .catch(error => {
            console.error('Error fetching feedback data:', error);
            alert('Error loading photo information');
        });
}

// Show processed photo in popup
function showProcessedPhotoPopup(feedbackId) {
    // First, get the photo path from the feedback data
    fetch('/api/admin/feedback')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const feedback = data.feedback.find(f => f.id === feedbackId);
                if (!feedback) {
                    alert('Feedback not found');
                    return;
                }

                const photoPath = feedback.processed_photo_path;
                if (!photoPath) {
                    alert('No processed photo available for this feedback');
                    return;
                }

                createPhotoPopup(feedbackId, photoPath, 'Processed');
            }
        })
        .catch(error => {
            console.error('Error fetching feedback data:', error);
            alert('Error loading photo information');
        });
}

// Generic function to create photo popup - Same size for both raw and processed
function createPhotoPopup(feedbackId, photoPath, photoType) {
    // Create photo popup
    const photoPopup = document.createElement('div');
    photoPopup.className = 'photo-popup';
    photoPopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 20px;
        box-sizing: border-box;
    `;

    // Construct the full URL to the photo
    const photoUrl = `/uploads/${photoPath}`;
    
    // Use the SAME sizing for both raw and processed photos
    const containerStyle = `
        max-width: 90vw;
        max-height: 90vh;
        width: auto;
        height: auto;
        padding: 20px;
    `;

    const imageStyle = `
        max-width: 100%;
        max-height: 70vh;
        width: auto;
        height: auto;
        object-fit: contain;
    `;

    photoPopup.innerHTML = `
        <div class="photo-container" style="
            background: white;
            border-radius: 12px;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            ${containerStyle}
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #1e293b; font-size: 16px;">${photoType} Photo - ID: ${feedbackId}</h3>
                <button onclick="closePhotoPopup()" style="
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 2px 8px;
                ">×</button>
            </div>
            
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 15px;
                flex: 1;
                overflow: hidden;
            ">
                <img src="${photoUrl}" 
                     alt="${photoType.toLowerCase()} photo for feedback ${feedbackId}" 
                     style="
                        ${imageStyle}
                        border-radius: 6px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                     "
                     onerror="handlePhotoError(this, ${feedbackId}, '${photoType.toLowerCase()}')">
            </div>
            
            <div style="font-size: 11px; color: #64748b; margin-bottom: 10px; flex-shrink: 0;">
                ${photoType} photo • Accessed by ${sessionStorage.getItem('loggedUser')} at ${new Date().toLocaleTimeString()}
            </div>
            
            <div style="flex-shrink: 0;">
                <button onclick="downloadPhoto('${photoUrl}', 'feedback_${feedbackId}_${photoType.toLowerCase()}_photo.jpg')" 
                        style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    📥 Download ${photoType}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(photoPopup);
}

// Handle photo loading errors
function handlePhotoError(imgElement, feedbackId, photoType = 'raw') {
    console.error(`Failed to load ${photoType} photo for feedback ID:`, feedbackId);
    
    // Create a fallback display
    const container = imgElement.parentElement;
    container.innerHTML = `
        <div style="
            width: 400px;
            height: 400px;
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #64748b;
        ">
            <div style="font-size: 64px; margin-bottom: 16px;">📷</div>
            <div style="font-size: 14px; text-align: center;">
                <div>${photoType.charAt(0).toUpperCase() + photoType.slice(1)} photo not found or failed to load</div>
                <div style="font-size: 12px; margin-top: 8px;">Feedback ID: ${feedbackId}</div>
                <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">
                    The ${photoType} photo file may have been deleted or moved
                </div>
            </div>
        </div>
    `;
}

// Download photo function
function downloadPhoto(photoUrl, filename) {
    fetch(photoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Photo not found');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Download error:', error);
            alert('Error downloading photo: ' + error.message);
        });
}

// Close photo popup
function closePhotoPopup() {
    const popup = document.querySelector('.photo-popup');
    if (popup) {
        popup.remove();
    }
}

// ==================== EMAIL MANAGEMENT ====================

// View encrypted email with password protection
async function viewEncryptedEmail(feedbackId) {
    currentEmailViewingId = feedbackId;
    
    // Create password verification modal for email
    const passwordModal = createEmailPasswordModal();
    document.body.appendChild(passwordModal);
    
    // Show modal
    passwordModal.style.display = 'flex';
}

// Create password modal for email access
function createEmailPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'email-access-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="password-prompt" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 400px;
            text-align: center;
        ">
            <div class="modal-icon" style="font-size: 48px; margin-bottom: 20px;">🔒</div>
            <h3 style="margin-bottom: 10px; color: #1e293b;">Email Access Required</h3>
            <p style="color: #64748b; margin-bottom: 25px; font-size: 14px;">
                System Administrator password required to view encrypted email
            </p>
            
            <div class="form-group" style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                    Your System Admin Password
                </label>
                <input type="password" id="email-access-password" 
                    placeholder="Enter your system admin password" 
                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button type="button" onclick="cancelEmailView()" style="
                    flex: 1;
                    padding: 12px;
                    background: #64748b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Cancel</button>
                <button type="button" onclick="verifyEmailAccess()" style="
                    flex: 1;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">View Email</button>
            </div>
            
            <div id="email-access-error" style="
                color: #dc2626;
                font-size: 13px;
                margin-top: 15px;
                display: none;
            ">Invalid password. Please try again.</div>
        </div>
    `;
    
    return modal;
}

// Verify email access
async function verifyEmailAccess() {
    const password = document.getElementById('email-access-password').value;
    const errorDiv = document.getElementById('email-access-error');
    const username = sessionStorage.getItem('loggedUser');
    
    if (!password) {
        errorDiv.textContent = 'Please enter your password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    console.log('🔐 Debug - Email access attempt:', { username, feedbackId: currentEmailViewingId });
    
    try {
        const response = await fetch('/api/admin/decrypt-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': username
            },
            body: JSON.stringify({ 
                feedbackId: currentEmailViewingId,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Password verified, show email
            showEmailPopup(currentEmailViewingId, data.decryptedEmail);
            closeEmailModal();
        } else {
            errorDiv.textContent = data.error || 'Invalid password';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        errorDiv.textContent = 'Error verifying password';
        errorDiv.style.display = 'block';
    }
}

// Show email in popup
function showEmailPopup(feedbackId, decryptedEmail) {
    const emailPopup = document.createElement('div');
    emailPopup.className = 'email-popup';
    emailPopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    `;

    emailPopup.innerHTML = `
        <div class="email-container" style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 500px;
            max-height: 300px;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #1e293b;">Decrypted Email - ID: ${feedbackId}</h3>
                <button onclick="closeEmailPopup()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <div style="
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #e2e8f0;
                margin-bottom: 20px;
                word-break: break-all;
            ">
                <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Decrypted Email:</div>
                <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${decryptedEmail}</div>
            </div>
            
            <div style="font-size: 12px; color: #64748b; margin-bottom: 15px;">
                Email accessed by: ${sessionStorage.getItem('loggedUser')} at ${new Date().toLocaleTimeString()}
            </div>
            
            <button onclick="closeEmailPopup()" style="
                padding: 8px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            ">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(emailPopup);
}

// Close email modal
function cancelEmailView() {
    closeEmailModal();
}

function closeEmailModal() {
    const modal = document.querySelector('.email-access-modal');
    if (modal) {
        modal.remove();
    }
    currentEmailViewingId = null;
}

// Close email popup
function closeEmailPopup() {
    const popup = document.querySelector('.email-popup');
    if (popup) {
        popup.remove();
    }
}

// ==================== OVERLAY MANAGEMENT ====================

// Load overlay data
async function loadOverlayData() {
    try {
        console.log('🎨 Loading overlay data...');
        const response = await fetch('/api/admin/overlays');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Overlay API response:', data);
        
        if (data.success) {
            if (data.message === 'Overlays table does not exist yet') {
                updateOverlayTable([]);
                showOverlayMessage('No overlays table found in database. Please run the database setup.');
            } else {
                updateOverlayTable(data.overlays);
            }
        } else {
            console.error('Failed to load overlay data:', data.error);
            alert('Error loading overlay data: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading overlay data:', error);
        alert('Error connecting to server. Please check if the server is running.');
    }
}

// Show overlay message
function showOverlayMessage(message) {
    const overlayGrid = document.querySelector('.overlay-grid');
    if (overlayGrid) {
        overlayGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 40px; color: #64748b;">
                <div style="font-size: 64px; margin-bottom: 20px;">📁</div>
                <h3 style="color: #64748b; margin-bottom: 15px; font-size: 18px;">No Overlay Data</h3>
                <p style="margin-bottom: 25px; line-height: 1.5;">${message}</p>
                <button class="btn-primary" onclick="createOverlaysTable()" style="margin-top: 10px;">
                    Create Overlays Table
                </button>
            </div>
        `;
    }
}

// Create overlays table (placeholder)
function createOverlaysTable() {
    alert('This would create the overlays table in the database. You need to run the database setup script.');
}

// Update overlay table
function updateOverlayTable(overlays) {
    const overlayGrid = document.querySelector('.overlay-grid');
    if (!overlayGrid) {
        console.error('Overlay grid not found');
        return;
    }
    
    overlayGrid.innerHTML = '';
    
    if (overlays.length === 0) {
        overlayGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
                <h3 style="color: #64748b; margin-bottom: 10px;">No Overlays Found</h3>
                <p>No overlay data available in the database.</p>
            </div>
        `;
        return;
    }
    
    overlays.forEach(overlay => {
        const overlayCard = document.createElement('div');
        overlayCard.className = 'overlay-card';
        overlayCard.innerHTML = `
            <div class="overlay-card-content">
                <div class="overlay-info-row">
                    <span class="overlay-label">ID:</span>
                    <span class="overlay-value">${overlay.id}</span>
                </div>
                <div class="overlay-info-row">
                    <span class="overlay-label">Display Name:</span>
                    <span class="overlay-value">${overlay.display_name}</span>
                </div>
                <div class="overlay-info-row">
                    <span class="overlay-label">Theme ID:</span>
                    <span class="overlay-value">${overlay.theme_id}</span>
                </div>
                <div class="overlay-info-row">
                    <span class="overlay-label">Desktop File:</span>
                    <span class="overlay-value" style="font-size: 12px; word-break: break-all;">${overlay.desktop_filename}</span>
                </div>
                <div class="overlay-info-row">
                    <span class="overlay-label">Mobile File:</span>
                    <span class="overlay-value" style="font-size: 12px; word-break: break-all;">${overlay.mobile_filename}</span>
                </div>
                <div class="overlay-info-row">
                    <span class="overlay-label">Display Order:</span>
                    <span class="overlay-value">${overlay.display_order}</span>
                </div>
                ${overlay.created_at ? `
                <div class="overlay-info-row">
                    <span class="overlay-label">Created:</span>
                    <span class="overlay-value">${new Date(overlay.created_at).toLocaleDateString()}</span>
                </div>
                ` : ''}
            </div>
            <div class="card-actions">
                <div class="view-buttons">
                    <button class="btn-view-overlay" onclick="viewOverlay('${overlay.desktop_filename}', '${overlay.display_name} - Desktop')">
                        🖥️ View Desktop
                    </button>
                    <button class="btn-view-overlay mobile" onclick="viewOverlay('${overlay.mobile_filename}', '${overlay.display_name} - Mobile')">
                        📱 View Mobile
                    </button>
                </div>
                <div class="action-buttons">
                    <button class="btn-delete" onclick="deleteOverlay(${overlay.id})">Delete</button>
                </div>
            </div>
        `;
        
        overlayGrid.appendChild(overlayCard);
    });
}

// View overlay function
function viewOverlay(imagePath, title) {
    console.log('Viewing overlay:', imagePath, title);
    
    const overlayPopup = document.createElement('div');
    overlayPopup.className = 'overlay-preview-popup';
    overlayPopup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 20px;
        box-sizing: border-box;
    `;

    const isMobile = title.includes('Mobile');
    const maxWidth = isMobile ? '400px' : '600px';
    const maxHeight = isMobile ? '700px' : '500px';

    overlayPopup.innerHTML = `
        <div class="overlay-preview-container" style="
            background: white;
            border-radius: 12px;
            padding: 25px;
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            width: 90vw;
            height: auto;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #1e293b; font-size: 18px;">${title}</h3>
                <button onclick="closeOverlayPreview()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <div style="
                flex: 1;
                max-height: calc(100% - 120px);
                overflow: auto;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #f8fafc;
                border-radius: 8px;
                padding: 15px;
            ">
                <img src="${imagePath}" 
                     alt="${title}" 
                     style="
                        max-width: 100%;
                        max-height: 100%;
                        width: auto;
                        height: auto;
                        object-fit: contain;
                        border-radius: 6px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                     "
                     onerror="handleOverlayImageError(this, '${title}')">
            </div>
            
            <div style="font-size: 12px; color: #64748b; margin-top: 15px; flex-shrink: 0;">
                Path: ${imagePath}
            </div>
            
            <div style="margin-top: 15px; flex-shrink: 0;">
                <button onclick="downloadOverlay('${imagePath}', '${title.replace(/[^a-zA-Z0-9]/g, '_')}.png')" 
                        style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                    📥 Download Image
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlayPopup);
}

// Close overlay preview
function closeOverlayPreview() {
    const popup = document.querySelector('.overlay-preview-popup');
    if (popup) {
        popup.remove();
    }
}

// Handle overlay image error
function handleOverlayImageError(imgElement, title) {
    console.error('Failed to load overlay image:', imgElement.src);
    
    const container = imgElement.parentElement;
    container.innerHTML = `
        <div style="
            width: 300px;
            height: 200px;
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #64748b;
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
            <div style="font-size: 14px; text-align: center;">
                <div>Overlay image not found</div>
                <div style="font-size: 12px; margin-top: 8px;">${title}</div>
                <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">
                    The image file may have been moved or deleted
                </div>
            </div>
        </div>
    `;
}

// Download overlay
function downloadOverlay(imageUrl, filename) {
    fetch(imageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Overlay image not found');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Download error:', error);
            alert('Error downloading overlay: ' + error.message);
        });
}

// ==================== OVERLAY MANAGEMENT -  ADD & DELETE ====================

// Show add overlay modal
function showAddOverlayModal() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'add-overlay-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="add-overlay-form" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Add New Overlay</h3>
                <button onclick="closeAddOverlayModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <form id="add-overlay-form" onsubmit="handleAddOverlay(event)">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Display Name
                    </label>
                    <input type="text" id="overlay-display-name" 
                        placeholder="e.g., Summer Theme" 
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        This is the name users will see
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Theme ID
                    </label>
                    <input type="text" id="overlay-theme-id" 
                        placeholder="e.g., summer" 
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        pattern="[a-z0-9]+" 
                        title="Lowercase letters and numbers only, no spaces"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Lowercase letters and numbers only, no spaces. This will be used for filenames.
                    </div>
                </div>
                
                <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 25px 0;">
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Desktop Overlay File (PNG)
                    </label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="file" id="desktop-overlay-file" 
                            accept=".png" 
                            style="flex: 1; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;"
                            required>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        PNG file for desktop devices (1920x1080 recommended)
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Mobile Overlay File (PNG)
                    </label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="file" id="mobile-overlay-file" 
                            accept=".png" 
                            style="flex: 1; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px;"
                            required>
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        PNG file for mobile devices (1080x1350 recommended)
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #1e293b;">Important:</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
                        <li>Both desktop and mobile files are required</li>
                        <li>Only PNG files are accepted</li>
                        <li>Files will be automatically named: [theme_id]ThemeDesktop.png and [theme_id]ThemeMobile.png</li>
                        <li>Maximum 6 overlays allowed</li>
                    </ul>
                </div>
                
                <div id="overlay-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="closeAddOverlayModal()" style="
                        flex: 1;
                        padding: 12px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Add Overlay</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close add overlay modal
function closeAddOverlayModal() {
    const modal = document.querySelector('.add-overlay-modal');
    if (modal) {
        modal.remove();
    }
}

// Handle add overlay
async function handleAddOverlay(event) {
    event.preventDefault();
    
    const displayName = document.getElementById('overlay-display-name').value;
    const themeId = document.getElementById('overlay-theme-id').value;
    const desktopFile = document.getElementById('desktop-overlay-file').files[0];
    const mobileFile = document.getElementById('mobile-overlay-file').files[0];
    const errorDiv = document.getElementById('overlay-error');
    
    errorDiv.style.display = 'none';
    
    if (!desktopFile || !mobileFile) {
        errorDiv.textContent = 'Both desktop and mobile overlay files are required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (desktopFile.type !== 'image/png' || mobileFile.type !== 'image/png') {
        errorDiv.textContent = 'Only PNG files are accepted';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!/^[a-z0-9]+$/.test(themeId)) {
        errorDiv.textContent = 'Theme ID must contain only lowercase letters and numbers, no spaces';
        errorDiv.style.display = 'block';
        return;
    }
    
    const username = sessionStorage.getItem('loggedUser');
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('theme_id', themeId);
        formData.append('desktop_file', desktopFile);
        formData.append('mobile_file', mobileFile);
        
        const response = await fetch('/api/admin/overlays', {
            method: 'POST',
            headers: {
                'x-username': username
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Overlay added successfully!');
            closeAddOverlayModal();
            loadOverlayData();
        } else {
            errorDiv.textContent = data.error || 'Failed to add overlay';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error adding overlay:', error);
        errorDiv.textContent = 'Error adding overlay: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

// Delete overlay
async function deleteOverlay(overlayId) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/overlays');
        const data = await response.json();
        
        if (data.success) {
            const overlay = data.overlays.find(o => o.id === overlayId);
            if (!overlay) {
                alert('Overlay not found!');
                return;
            }
            
            const confirmMessage = `Are you sure you want to delete the overlay "${overlay.display_name}"?\n\nThis will:\n• Remove the overlay from the database\n• Delete the desktop file: ${overlay.desktop_filename}\n• Delete the mobile file: ${overlay.mobile_filename}\n\nThis action cannot be undone!`;
            
            if (confirm(confirmMessage)) {
                await performOverlayDeletion(overlayId);
            }
        } else {
            alert('Error fetching overlay details');
        }
    } catch (error) {
        console.error('Error fetching overlay details:', error);
        alert('Error fetching overlay details');
    }
}

// Perform overlay deletion
async function performOverlayDeletion(overlayId) {
    console.log('🗑️ Deleting overlay ID:', overlayId);
    
    try {
        const username = sessionStorage.getItem('loggedUser');
        if (!username) {
            alert('User session not found. Please login again.');
            return;
        }
        
        const response = await fetch(`/api/admin/overlays/${overlayId}`, {
            method: 'DELETE',
            headers: {
                'x-username': username
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete overlay');
        }
        
        if (data.success) {
            if (data.fileError) {
                alert(`✅ Overlay deleted from database but there was an issue with files: ${data.fileError}`);
            } else {
                alert('✅ Overlay and associated files deleted successfully!');
            }
            loadOverlayData();
        } else {
            alert('❌ Failed to delete overlay: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting overlay:', error);
        alert('❌ Error deleting overlay: ' + error.message);
    }
}

// Event listeners for overlay preview
document.addEventListener('click', function(event) {
    const popup = document.querySelector('.overlay-preview-popup');
    if (popup && event.target === popup) {
        closeOverlayPreview();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeOverlayPreview();
    }
});

// ==================== USER MANAGEMENT ====================

// Load user management data
async function loadUserManagementData() {
    try {
        console.log('👥 Loading user management data...');
        const response = await fetch('/api/admin/users');
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User management API response:', data);
        
        if (data.success && data.users) {
            updateUserManagementTable(data.users);
        } else if (data.error) {
            console.error('API returned error:', data.error);
            alert('Error loading user data: ' + data.error);
            console.log('Using fallback user data for development');
            updateUserManagementTable(getFallbackUsers());
        } else if (Array.isArray(data)) {
            updateUserManagementTable(data);
        } else {
            console.error('Unexpected response structure:', data);
            alert('Unexpected response from server');
            console.log('Using fallback user data for development');
            updateUserManagementTable(getFallbackUsers());
        }
    } catch (error) {
        console.error('Error loading user management data:', error);
        alert('Error connecting to server: ' + error.message);
        console.log('Using fallback user data due to connection error');
        updateUserManagementTable(getFallbackUsers());
    }
}

// Update user management table
function updateUserManagementTable(usersData) {
    const tbody = document.querySelector('#users-page table tbody');
    if (!tbody) {
        console.error('User management table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                    <h3 style="color: #64748b; margin-bottom: 10px;">No Admin Users Found</h3>
                    <p>No user data available or database connection issue.</p>
                    <button class="btn-primary" onclick="loadUserManagementData()" style="margin-top: 15px;">
                        Retry Loading
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    const currentUser = sessionStorage.getItem('loggedUser');
    const currentUserRole = sessionStorage.getItem('userRole');
    const isSystemAdmin = currentUserRole === 'system_admin';
    
    usersData.forEach(user => {
        const row = document.createElement('tr');
        
        const safeUser = {
            id: user.id || 0,
            username: user.username || 'Unknown',
            full_name: user.full_name || user.username || 'Unknown',
            role: user.role || 'IT_staff',
            department: user.department || 'IT',
            is_active: user.is_active !== undefined ? user.is_active : 1
        };
        
        const isCurrentUser = safeUser.username === currentUser;
        const isSystemAdminUser = safeUser.role === 'system_admin';
        const canEdit = isSystemAdmin && (!isSystemAdminUser || isCurrentUser);
        const canDelete = isSystemAdmin && !isSystemAdminUser && !isCurrentUser;
        
        const showEditButton = canEdit && !isSystemAdminUser;
        const showDeleteButton = canDelete;
        
        row.innerHTML = `
            <td>${safeUser.username}</td>
            <td>${safeUser.full_name}</td>
            <td>${formatRoleName(safeUser.role)}</td>
            <td>${safeUser.department}</td>
            <td>
                <span class="badge ${safeUser.is_active ? 'badge-active' : 'badge-warning'}">
                    ${safeUser.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </td>
            <td>
                ${showEditButton ? `
                    <button class="btn-edit" onclick="editUser(${safeUser.id}, '${safeUser.username}', '${safeUser.role}', '${safeUser.full_name.replace(/'/g, "\\'")}')">
                        Edit
                    </button>
                ` : ''}
                ${showDeleteButton ? `
                    <button class="btn-delete" onclick="deleteUser(${safeUser.id}, '${safeUser.username}')">
                        Delete
                    </button>
                ` : ''}
                ${!showEditButton && !showDeleteButton ? `
                    <span style="color: #94a3b8; font-size: 12px;">No actions</span>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Edit user
function editUser(userId, username, currentRole, fullName) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'edit-user-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="edit-user-form" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Edit User: ${username}</h3>
                <button onclick="closeEditUserModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <form id="edit-user-form" onsubmit="handleEditUser(event, ${userId})">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Username
                    </label>
                    <input type="text" id="edit-username" 
                        value="${username}"
                        placeholder="Enter username"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Username can be changed (must be unique)
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Display Name
                    </label>
                    <input type="text" id="edit-full-name" 
                        value="${fullName}"
                        placeholder="Enter display name"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        This name will be displayed in the admin panel
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Role
                    </label>
                    <select id="edit-user-role" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        font-size: 15px;
                        background: white;
                    ">
                        <option value="IT_admin" ${currentRole === 'IT_admin' ? 'selected' : ''}>IT Admin</option>
                        <option value="IT_staff" ${currentRole === 'IT_staff' ? 'selected' : ''}>IT Staff</option>
                    </select>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        ${currentRole === 'system_admin' ? 
                          'System Admin role cannot be changed' : 
                          'Select the user role and permissions'}
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        New Password (optional)
                    </label>
                    <input type="password" id="edit-user-password" 
                        placeholder="Leave blank to keep current password"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Only enter if you want to change the password
                    </div>
                </div>
                
                <div id="edit-user-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="closeEditUserModal()" style="
                        flex: 1;
                        padding: 12px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (currentRole === 'system_admin') {
        const roleSelect = document.getElementById('edit-user-role');
        roleSelect.innerHTML = '<option value="system_admin" selected>System Admin</option>';
        roleSelect.disabled = true;
    }
}

// Fallback user data
function getFallbackUsers() {
    return [
        {
            id: 1,
            username: 'systemadmin',
            full_name: 'System Administrator',
            role: 'system_admin',
            department: 'IT',
            is_active: 1,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            username: 'admin',
            full_name: 'IT Administrator',
            role: 'IT_admin',
            department: 'IT',
            is_active: 1,
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            username: 'staff',
            full_name: 'IT Staff',
            role: 'IT_staff',
            department: 'IT',
            is_active: 1,
            created_at: new Date().toISOString()
        }
    ];
}

// ==================== USER MANAGEMENT - EDIT, ADD, DELETE ====================

// Handle edit user
async function handleEditUser(event, userId) {
    event.preventDefault();
    
    const username = document.getElementById('edit-username').value;
    const fullName = document.getElementById('edit-full-name').value;
    const role = document.getElementById('edit-user-role').value;
    const password = document.getElementById('edit-user-password').value;
    const errorDiv = document.getElementById('edit-user-error');
    
    errorDiv.style.display = 'none';
    
    if (!username.trim()) {
        errorDiv.textContent = 'Username is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!fullName.trim()) {
        errorDiv.textContent = 'Display name is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    const currentUsername = sessionStorage.getItem('loggedUser');
    if (!currentUsername) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-username': currentUsername
            },
            body: JSON.stringify({
                username: username,
                full_name: fullName,
                role: role,
                password: password || undefined
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ User updated successfully!');
            closeEditUserModal();
            loadUserManagementData();
            
            const loggedUser = sessionStorage.getItem('loggedUser');
            if (loggedUser && data.updatedUser && data.updatedUser.username !== loggedUser) {
                sessionStorage.setItem('loggedUser', data.updatedUser.username);
                document.getElementById('logged-username').textContent = data.updatedUser.username;
                document.querySelector('.user-avatar').textContent = data.updatedUser.username[0].toUpperCase();
            }
        } else {
            errorDiv.textContent = data.error || 'Failed to update user';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating user:', error);
        errorDiv.textContent = 'Error updating user: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

// Close edit user modal
function closeEditUserModal() {
    const modal = document.querySelector('.edit-user-modal');
    if (modal) {
        modal.remove();
    }
}

// Delete user
async function deleteUser(userId, username) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const currentUser = sessionStorage.getItem('loggedUser');
    if (username === currentUser) {
        alert('You cannot delete your own account.');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete the user "${username}"?\n\nThis action cannot be undone!`;
    
    if (confirm(confirmMessage)) {
        await performUserDeletion(userId);
    }
}

// Perform user deletion
async function performUserDeletion(userId) {
    console.log('🗑️ Deleting user ID:', userId);
    
    try {
        const username = sessionStorage.getItem('loggedUser');
        if (!username) {
            alert('User session not found. Please login again.');
            return;
        }
        
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'x-username': username
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user');
        }
        
        if (data.success) {
            alert('✅ User deleted successfully!');
            loadUserManagementData();
        } else {
            alert('❌ Failed to delete user: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('❌ Error deleting user: ' + error.message);
    }
}

// Add user
function addUser() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'add-user-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="add-user-form" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Add New User</h3>
                <button onclick="closeAddUserModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <form id="add-user-form" onsubmit="handleAddUser(event)">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Username *
                    </label>
                    <input type="text" id="add-username" 
                        placeholder="Enter username"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Username must be unique
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Display Name *
                    </label>
                    <input type="text" id="add-full-name" 
                        placeholder="Enter display name"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        This name will be displayed in the admin panel
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Role *
                    </label>
                    <select id="add-user-role" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        font-size: 15px;
                        background: white;
                    " required>
                        <option value="">-- Select Role --</option>
                        <option value="IT_admin">IT Admin</option>
                        <option value="IT_staff">IT Staff</option>
                    </select>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Select the user role and permissions
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Password *
                    </label>
                    <input type="password" id="add-user-password" 
                        placeholder="Enter password"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Password is required for new users
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Confirm Password *
                    </label>
                    <input type="password" id="add-user-confirm-password" 
                        placeholder="Confirm password"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Please confirm the password
                    </div>
                </div>
                
                <div id="add-user-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="closeAddUserModal()" style="
                        flex: 1;
                        padding: 12px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Add User</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Handle add user
async function handleAddUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('add-username').value;
    const fullName = document.getElementById('add-full-name').value;
    const role = document.getElementById('add-user-role').value;
    const password = document.getElementById('add-user-password').value;
    const confirmPassword = document.getElementById('add-user-confirm-password').value;
    const errorDiv = document.getElementById('add-user-error');
    
    errorDiv.style.display = 'none';
    
    if (!username.trim()) {
        errorDiv.textContent = 'Username is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!fullName.trim()) {
        errorDiv.textContent = 'Display name is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!role) {
        errorDiv.textContent = 'Role is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!password) {
        errorDiv.textContent = 'Password is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long';
        errorDiv.style.display = 'block';
        return;
    }
    
    const currentUsername = sessionStorage.getItem('loggedUser');
    if (!currentUsername) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': currentUsername
            },
            body: JSON.stringify({
                username: username,
                full_name: fullName,
                role: role,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ User added successfully!');
            closeAddUserModal();
            loadUserManagementData();
        } else {
            errorDiv.textContent = data.error || 'Failed to add user';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error adding user:', error);
        errorDiv.textContent = 'Error adding user: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

// Close add user modal
function closeAddUserModal() {
    const modal = document.querySelector('.add-user-modal');
    if (modal) {
        modal.remove();
    }
}

// ==================== QUESTION MANAGEMENT ====================

// Load question management data
async function loadQuestionManagementData() {
    try {
        console.log('❓ Loading question management data...');
        const response = await fetch('/api/admin/questions');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Question API response:', data);
        
        if (data.success) {
            updateQuestionManagementTable(data.questions);
        } else {
            console.error('Failed to load question data:', data.error);
            alert('Error loading question data: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading question data:', error);
        alert('Error connecting to server. Please check if the server is running.');
    }
}

// Update question management table
function updateQuestionManagementTable(questionsData) {
    const container = document.getElementById('questions-container');
    if (!container) {
        console.error('Questions container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!questionsData || questionsData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 40px; color: #64748b;">
                <div style="font-size: 64px; margin-bottom: 20px;">❓</div>
                <h3 style="color: #64748b; margin-bottom: 15px; font-size: 18px;">No Questions Found</h3>
                <p style="margin-bottom: 25px; line-height: 1.5;">
                    No questions have been set up yet. Add your first question to start collecting feedback.
                </p>
                <button class="btn-primary" onclick="showAddQuestionModal()">
                    Add First Question
                </button>
            </div>
        `;
        return;
    }
    
    questionsData.forEach(question => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-text">${question.question_text}</div>
                <div class="question-actions">
                    <button class="btn-edit" onclick="editQuestion(${question.id}, '${question.question_text.replace(/'/g, "\\'")}', '${question.question_type}', ${question.is_required}, ${question.display_order}, ${question.is_active}, ${JSON.stringify(question.options || [])})">Edit</button>
                    <button class="btn-delete" onclick="deleteQuestion(${question.id})">Delete</button>
                </div>
            </div>
            
            <div class="question-meta">
                <span class="question-type">${formatQuestionType(question.question_type)}</span>
                <span class="question-required">${question.is_required ? 'REQUIRED' : 'OPTIONAL'}</span>
                <span class="question-active">${question.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                <span style="color: #64748b; font-size: 12px;">Order: ${question.display_order}</span>
            </div>
            
            ${question.options && question.options.length > 0 ? `
                <div class="question-options">
                    <strong style="font-size: 13px; color: #475569;">Options:</strong>
                    ${question.options.map(option => `
                        <div class="option-item">
                            <span class="option-label">${option.option_label}</span>
                            <span class="option-order">Order: ${option.display_order}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        container.appendChild(questionCard);
    });
}

// Format question type for display
function formatQuestionType(type) {
    const typeMap = {
        'text': 'Text Input',
        'yesno': 'Yes/No',
        'stars': 'Star Rating',
        'choice': 'Multiple Choice'
    };
    return typeMap[type] || type;
}

// Show add question modal
function showAddQuestionModal() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'add-question-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="add-question-form" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Add New Question</h3>
                <button onclick="closeAddQuestionModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <form id="add-question-form" onsubmit="handleAddQuestion(event)">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Text
                    </label>
                    <textarea id="question-text" 
                        placeholder="Enter your question here..."
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; min-height: 80px;"
                        required></textarea>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Type *
                    </label>
                    <select id="question-type" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        font-size: 15px;
                        background: white;
                    " onchange="toggleOptionsField(this.value)" required>
                        <option value="">-- Select Question Type --</option>
                        <option value="text">Text Input</option>
                        <option value="yesno">Yes/No</option>
                        <option value="stars">Star Rating</option>
                        <option value="choice">Multiple Choice</option>
                    </select>
                </div>
                
                <div id="options-container" style="display: none;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Options (for Multiple Choice only)
                    </label>
                    <div id="options-list" class="options-list">
                        <!-- Options will be added here dynamically -->
                    </div>
                    <button type="button" class="add-option" onclick="addOptionField()" style="
                        background: #f1f5f9;
                        border: 1px dashed #cbd5e1;
                        color: #475569;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 10px;
                        font-size: 14px;
                    ">+ Add Option</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Display Order
                        </label>
                        <input type="number" id="display-order" 
                            value="0"
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                            min="0">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Required
                        </label>
                        <select id="is-required" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 15px;
                            background: white;
                        ">
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="is-active" checked style="width: 16px; height: 16px;">
                        <span style="font-weight: 600; color: #1e293b;">Active Question</span>
                    </label>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Inactive questions won't be shown in the feedback form
                    </div>
                </div>
                
                <div id="question-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="closeAddQuestionModal()" style="
                        flex: 1;
                        padding: 12px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Add Question</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';
}

// Close add question modal
function closeAddQuestionModal() {
    const modal = document.querySelector('.add-question-modal');
    if (modal) {
        modal.remove();
    }
    if (document.getElementById('questions-page').classList.contains('active')) {
        loadQuestionManagementData();
    }
}

// Toggle options field based on question type
function toggleOptionsField(questionType) {
    const optionsContainer = document.getElementById('options-container');
    const optionsList = document.getElementById('options-list');
    
    if (questionType === 'choice') {
        optionsContainer.style.display = 'block';
        if (optionsList.children.length === 0) {
            addOptionField();
        }
    } else {
        optionsContainer.style.display = 'none';
        optionsList.innerHTML = '';
    }
}

// Add option field
function addOptionField() {
    const optionsList = document.getElementById('options-list');
    const optionId = Date.now();
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input-group';
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option label" 
            style="flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;"
            required>
        <input type="number" placeholder="Order" value="0" min="0"
            style="width: 80px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <button type="button" class="remove-option" onclick="removeOptionField(this)">Remove</button>
    `;
    
    optionsList.appendChild(optionDiv);
}

// Remove option field
function removeOptionField(button) {
    const optionGroup = button.parentElement;
    optionGroup.remove();
}

// Handle add question
async function handleAddQuestion(event) {
    event.preventDefault();
    
    const questionText = document.getElementById('question-text').value;
    const questionType = document.getElementById('question-type').value;
    const displayOrder = parseInt(document.getElementById('display-order').value) || 0;
    const isRequired = document.getElementById('is-required').value === '1';
    const isActive = document.getElementById('is-active').checked;
    const errorDiv = document.getElementById('question-error');
    
    errorDiv.style.display = 'none';
    
    if (!questionText.trim()) {
        errorDiv.textContent = 'Question text is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!questionType) {
        errorDiv.textContent = 'Please select a question type';
        errorDiv.style.display = 'block';
        return;
    }
    
    let options = [];
    
    if (questionType === 'choice') {
        const optionInputs = document.querySelectorAll('#options-list .option-input-group');
        if (optionInputs.length === 0) {
            errorDiv.textContent = 'At least one option is required for multiple choice questions';
            errorDiv.style.display = 'block';
            return;
        }
        
        optionInputs.forEach((group, index) => {
            const labelInput = group.querySelector('input[type="text"]');
            const orderInput = group.querySelector('input[type="number"]');
            
            if (labelInput.value.trim()) {
                options.push({
                    option_label: labelInput.value.trim(),
                    display_order: parseInt(orderInput.value) || index
                });
            }
        });
        
        if (options.length === 0) {
            errorDiv.textContent = 'At least one valid option is required for multiple choice questions';
            errorDiv.style.display = 'block';
            return;
        }
    }
    
    const username = sessionStorage.getItem('loggedUser');
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/admin/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': username
            },
            body: JSON.stringify({
                question_text: questionText,
                question_type: questionType,
                display_order: displayOrder,
                is_required: isRequired,
                is_active: isActive,
                options: options
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Question added successfully!');
            closeAddQuestionModal();
            loadQuestionManagementData();
        } else {
            errorDiv.textContent = data.error || 'Failed to add question';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error adding question:', error);
        errorDiv.textContent = 'Error adding question: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

// ==================== QUESTION MANAGEMENT - EDIT & DELETE ====================

// Edit question
function editQuestion(questionId, currentQuestionText, questionType, isRequired, displayOrder, isActive, options) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'edit-question-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="edit-question-form" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Edit Question</h3>
                <button onclick="closeEditQuestionModal()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <!-- DATA INTEGRITY WARNING -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 16px;">💡</span>
                    <strong style="color: #92400e;">Safe Editing Enabled</strong>
                </div>
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.4;">
                    <strong>Historical data protection:</strong> Existing answers will maintain their original question context. 
                    Changes only affect new submissions.
                </p>
            </div>
            
            <form id="edit-question-form" onsubmit="handleEditQuestion(event, ${questionId})">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Text
                    </label>
                    <textarea id="edit-question-text" 
                        placeholder="Enter your question here..."
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; min-height: 80px;"
                        required>${currentQuestionText}</textarea>
                </div>
                
                <!-- QUESTION TYPE LOCKED -->
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Type
                    </label>
                    <input type="text" value="${formatQuestionType(questionType)}" 
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; background: #f8fafc;"
                        readonly>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Question type cannot be changed to preserve data integrity
                    </div>
                </div>
                
                ${questionType === 'choice' && options && options.length > 0 ? `
                <!-- OPTIONS DISPLAY ONLY -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Existing Options
                    </label>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                        ${options.map(option => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                <span>${option.option_label}</span>
                                <span style="color: #64748b; font-size: 12px;">Order: ${option.display_order}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Options cannot be modified to preserve existing answer data
                    </div>
                </div>
                ` : ''}
                
                <!-- SAFE FIELDS TO EDIT -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Display Order
                        </label>
                        <input type="number" id="edit-display-order" 
                            value="${displayOrder}"
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                            min="0">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Required
                        </label>
                        <select id="edit-is-required" style="
                            width: 100%;
                            padding: 12px 16px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 15px;
                            background: white;
                        ">
                            <option value="1" ${isRequired ? 'selected' : ''}>Yes</option>
                            <option value="0" ${!isRequired ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="edit-is-active" ${isActive ? 'checked' : ''} style="width: 16px; height: 16px;">
                        <span style="font-weight: 600; color: #1e293b;">Active Question</span>
                    </label>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Inactive questions won't be shown in NEW feedback forms
                    </div>
                </div>
                
                <div id="edit-question-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="closeEditQuestionModal()" style="
                        flex: 1;
                        padding: 12px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Handle edit question
async function handleEditQuestion(event, questionId) {
    event.preventDefault();
    
    const questionText = document.getElementById('edit-question-text').value;
    const displayOrder = parseInt(document.getElementById('edit-display-order').value) || 0;
    const isRequired = document.getElementById('edit-is-required').value === '1';
    const isActive = document.getElementById('edit-is-active').checked;
    const errorDiv = document.getElementById('edit-question-error');
    
    errorDiv.style.display = 'none';
    
    if (!questionText.trim()) {
        errorDiv.textContent = 'Question text is required';
        errorDiv.style.display = 'block';
        return;
    }
    
    const username = sessionStorage.getItem('loggedUser');
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/questions/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-username': username
            },
            body: JSON.stringify({
                question_text: questionText,
                display_order: displayOrder,
                is_required: isRequired,
                is_active: isActive
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Question updated successfully!\n\nNote: Existing answers will keep the original question text.');
            closeEditQuestionModal();
            loadQuestionManagementData();
        } else {
            errorDiv.textContent = data.error || 'Failed to update question';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating question:', error);
        errorDiv.textContent = 'Error updating question: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

// Close edit question modal
function closeEditQuestionModal() {
    const modal = document.querySelector('.edit-question-modal');
    if (modal) {
        modal.remove();
    }
}

// Delete question
async function deleteQuestion(questionId) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        try {
            const username = sessionStorage.getItem('loggedUser');
            if (!username) {
                alert('User session not found. Please login again.');
                return;
            }
            
            const response = await fetch(`/api/admin/questions/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'x-username': username
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Question deleted successfully!');
                loadQuestionManagementData();
            } else {
                alert('❌ Failed to delete question: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('❌ Error deleting question: ' + error.message);
        }
    }
}

// ==================== SECURITY & ACCESS CONTROL ====================

// Download Excel function
async function downloadExcel() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    currentDownloadType = 'excel';
    showDownloadPasswordModal();
}

// Download Photos function
async function downloadPhotos() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    currentDownloadType = 'photos';
    showDownloadPasswordModal();
}

// Show download password modal
function showDownloadPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'download-access-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const downloadTypeText = currentDownloadType === 'excel' ? 'Excel' : 'Photos';
    
    modal.innerHTML = `
        <div class="password-prompt" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 400px;
            text-align: center;
        ">
            <div class="modal-icon" style="font-size: 48px; margin-bottom: 20px;">
                ${currentDownloadType === 'excel' ? '📊' : '📷'}
            </div>
            <h3 style="margin-bottom: 10px; color: #1e293b;">Download ${downloadTypeText}</h3>
            <p style="color: #64748b; margin-bottom: 25px; font-size: 14px;">
                System Administrator password required to download ${downloadTypeText.toLowerCase()}
            </p>
            
            <div class="form-group" style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                    Your System Admin Password
                </label>
                <input type="password" id="download-access-password" 
                    placeholder="Enter your system admin password" 
                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button type="button" onclick="closeDownloadModal()" style="
                    flex: 1;
                    padding: 12px;
                    background: #64748b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Cancel</button>
                <button type="button" onclick="verifyDownloadAccess()" style="
                    flex: 1;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Download ${downloadTypeText}</button>
            </div>
            
            <div id="download-access-error" style="
                color: #dc2626;
                font-size: 13px;
                margin-top: 15px;
                display: none;
            "></div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Verify download access
async function verifyDownloadAccess() {
    const password = document.getElementById('download-access-password').value;
    const errorDiv = document.getElementById('download-access-error');
    const username = sessionStorage.getItem('loggedUser');
    
    if (!password) {
        errorDiv.textContent = 'Please enter your password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const endpoint = currentDownloadType === 'excel' 
            ? '/api/admin/download-excel' 
            : '/api/admin/download-photos';
        
        const response = await fetch(`${endpoint}?password=${encodeURIComponent(password)}`, {
            method: 'GET',
            headers: {
                'x-username': username
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            const filename = currentDownloadType === 'excel' 
                ? 'feedback_data.csv' 
                : 'feedback_photos.zip';
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            closeDownloadModal();
        } else {
            const data = await response.json();
            errorDiv.textContent = data.error || 'Download failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Download error:', error);
        errorDiv.textContent = 'Error downloading file';
        errorDiv.style.display = 'block';
    }
}

// Close download modal
function closeDownloadModal() {
    const modal = document.querySelector('.download-access-modal');
    if (modal) {
        modal.remove();
    }
    currentDownloadType = null;
}

// ==================== FEEDBACK DELETION ====================

// Delete feedback with password verification
async function deleteFeedback(feedbackId) {
    currentDeleteFeedbackId = feedbackId;
    showDeletePasswordModal();
}

// Show delete password modal
function showDeletePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'delete-access-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="password-prompt" style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 400px;
            text-align: center;
        ">
            <div class="modal-icon" style="font-size: 48px; margin-bottom: 20px;">🗑️</div>
            <h3 style="margin-bottom: 10px; color: #1e293b;">Delete Feedback</h3>
            <p style="color: #64748b; margin-bottom: 25px; font-size: 14px;">
                Please enter your password to confirm deletion of feedback ID: ${currentDeleteFeedbackId}
            </p>
            
            <div class="form-group" style="margin-bottom: 20px; text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                    Your Password
                </label>
                <input type="password" id="delete-access-password" 
                    placeholder="Enter your account password" 
                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;">
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button type="button" onclick="closeDeleteModal()" style="
                    flex: 1;
                    padding: 12px;
                    background: #64748b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Cancel</button>
                <button type="button" onclick="verifyDeleteAccess()" style="
                    flex: 1;
                    padding: 12px;
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Delete Feedback</button>
            </div>
            
            <div id="delete-access-error" style="
                color: #dc2626;
                font-size: 13px;
                margin-top: 15px;
                display: none;
            "></div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Verify delete access with password
async function verifyDeleteAccess() {
    const password = document.getElementById('delete-access-password').value;
    const errorDiv = document.getElementById('delete-access-error');
    const username = sessionStorage.getItem('loggedUser');
    
    if (!password) {
        errorDiv.textContent = 'Please enter your password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!username) {
        errorDiv.textContent = 'User session not found. Please login again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await performFeedbackDeletion(currentDeleteFeedbackId);
            closeDeleteModal();
        } else {
            errorDiv.textContent = 'Invalid password. Please try again.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error verifying password:', error);
        errorDiv.textContent = 'Error verifying password';
        errorDiv.style.display = 'block';
    }
}

// Perform the actual feedback deletion
async function performFeedbackDeletion(feedbackId) {
    console.log('🗑️ Deleting feedback ID:', feedbackId);
    
    try {
        const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete feedback');
        }
        
        if (data.success) {
            alert('✅ Feedback deleted successfully!');
            loadFeedbackData();
        } else {
            alert('❌ Failed to delete feedback: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('❌ Error deleting feedback: ' + error.message);
    }
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.querySelector('.delete-access-modal');
    if (modal) {
        modal.remove();
    }
    currentDeleteFeedbackId = null;
}

// ==================== NAVIGATION & PAGE MANAGEMENT ====================

// Show page with role-based access control
function showPage(pageName) {
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user is trying to access admin pages without system_admin role
    const adminPages = ['overlay', 'users', 'audit', 'questions'];
    if (adminPages.includes(pageName) && userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');
    
    // Add active class to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
    
    // Load data for specific pages
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'feedback-data') {
        loadFeedbackData();
    } else if (pageName === 'digital-tree') {
        loadDigitalTreeData();
    } else if (pageName === 'overlay') {
        loadOverlayData();
    } else if (pageName === 'users') {
        loadUserManagementData();
    } else if (pageName === 'questions') {
        loadQuestionManagementData();
    }
}

// ==================== DIGITAL TREE MANAGEMENT ====================

// Load digital tree data
async function loadDigitalTreeData() {
    try {
        console.log('🌳 Loading digital tree data...');
        const response = await fetch('/api/tree');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Tree API response:', data);
        
        updateDigitalTreeTable(data);
        
    } catch (error) {
        console.error('Error loading tree data:', error);
        updateDigitalTreeTable([]);
        alert('Error loading tree data: ' + error.message);
    }
}

// Update the digital tree table
function updateDigitalTreeTable(treeData) {
    const tbody = document.querySelector('#digital-tree-page table tbody');
    if (!tbody) {
        console.error('Digital tree table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    // Update current year display
    const currentYear = new Date().getFullYear();
    const currentYearSpan = document.getElementById('current-year');
    const treeCountSpan = document.getElementById('tree-count');
    
    if (currentYearSpan) {
        currentYearSpan.textContent = currentYear;
    }
    
    if (!treeData || treeData.length === 0) {
        if (treeCountSpan) {
            treeCountSpan.textContent = '0';
        }
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🌳</div>
                    <h3 style="color: #64748b; margin-bottom: 10px;">No Tree Data Found</h3>
                    <p>No visitors have been recorded for ${currentYear} yet.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Update tree count
    if (treeCountSpan) {
        treeCountSpan.textContent = treeData.length;
    }
    
    // Add each visitor to the table
    treeData.forEach(visitor => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${visitor.name || 'Anonymous'}</td>
            <td>${visitor.visit_count || 1}</td>
            <td>${visitor.last_visit ? new Date(visitor.last_visit).toLocaleDateString() : 'N/A'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Refresh tree data
function refreshTreeData() {
    loadDigitalTreeData();
}

// ==================== INITIALIZATION & EVENT HANDLERS ====================

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status...');
    const loggedUser = sessionStorage.getItem('loggedUser');
    if (loggedUser) {
        console.log('User already logged in:', loggedUser);
        const userRole = sessionStorage.getItem('userRole');
        updateUIForUser(loggedUser, userRole);
        
        // Load dashboard data
        loadDashboardData();
        
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    } else {
        console.log('No user logged in');
    }
});

// Test database connection
async function testDatabase() {
    try {
        const response = await fetch('/api/admin/test-db');
        const data = await response.json();
        console.log('Database test result:', data);
        return data;
    } catch (error) {
        console.error('Database test failed:', error);
        return null;
    }
}