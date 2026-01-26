// ============================================================
// ADMIN.JS - TABLE OF CONTENTS
// ============================================================
// 
// 1. GLOBAL VARIABLES & STATE MANAGEMENT
//    let currentDownloadType          - Track current download operation type (DONE BY PRETI)
//    let currentDeleteFeedbackId      - Track feedback ID pending deletion (DONE BY PRETI)
//    let currentEmailViewingId        - Track email ID being viewed (DONE BY PRETI)
//    let currentAuditPage             - Current audit logs pagination page (DONE BY PRETI)
//    let auditLogsPerPage             - Items per page for audit logs (DONE BY PRETI)
//    let currentSortField             - Current audit sort column (DONE BY PRETI)
//    let currentSortDirection         - Audit sort direction (DONE BY PRETI)
//    let allAuditLogs                 - Store all loaded audit logs (DONE BY PRETI)
//    let filteredAuditLogs            - Store filtered audit logs (DONE BY PRETI)
//    let allFeedbackData              - ALL not_archived records (DONE BY PRETI)
//    let filteredFeedbackData         - Filtered feedback results (DONE BY PRETI)
//    let feedbackCurrentPage          - Current feedback page (DONE BY PRETI)
//    const feedbackItemsPerPage       - Items per page for feedback (25) (DONE BY PRETI)
//    let allArchiveData               - ALL archived records (DONE BY PRETI)
//    let filteredArchiveData          - Filtered archive results (DONE BY PRETI)
//    let archiveCurrentPage           - Current archive page (DONE BY PRETI)
//    const archiveItemsPerPage        - Items per page for archive (25) (DONE BY PRETI)
//    let allLeaderboardData           - ALL leaderboard records (DONE BY PRETI)
//    let filteredLeaderboardData      - Filtered leaderboard results (DONE BY PRETI)
//    let leaderboardCurrentPage       - Current leaderboard page (DONE BY PRETI)
//    const leaderboardItemsPerPage    - Items per page for leaderboard (25) (DONE BY PRETI)
//    let decryptedEmailMap            - Map of decrypted emails {feedbackId: email} (DONE BY PRETI)
//    let isAnyEmailDecrypted          - Flag for feedback decryption state (DONE BY PRETI)
//    let encryptedFeedbackIds         - Array of encrypted feedback IDs (current page) (DONE BY PRETI)
//    let decryptedArchiveEmailMap     - Map of decrypted archive emails (DONE BY PRETI)
//    let isAnyArchiveEmailDecrypted   - Flag for archive decryption state (DONE BY PRETI)
//    let encryptedArchiveIds          - Array of encrypted archive IDs (current page) (DONE BY PRETI)
//    let dataExportUnlocked           - Track data export session unlock status (DONE BY PRETI)
//    let dataExportUnlockTime         - Track data export unlock timestamp (DONE BY PRETI)
//    window.questionsDataMap          - Store question data for edit functions (DONE BY PRETI)
//    function showNotification()      - Show notification message to user (DONE BY PRETI)
//
// 2. AUTHENTICATION & SESSION MANAGEMENT
//    async function handleLogin()     - Admin login with API authentication (DONE BY PRETI)
//    function handleLogout()          - Log out admin user with audit logging (DONE BY PRETI)
//    function updateUIForUser()       - Update UI based on user role (DONE BY PRETI)
//    function formatRoleName()        - Format role names for display (DONE BY PRETI)
//
// 3. AUDIT LOGS MANAGEMENT
//    async function loadAuditLogs()   - Load all audit log entries (DONE BY PRETI)
//    function populateUserFilter()    - Populate user filter dropdown (DONE BY PRETI)
//    function filterAuditLogs()       - Filter logs by search, action, user, target, IP, date (DONE BY PRETI)
//    function sortFilteredLogs()      - Sort filtered logs by current sort field (DONE BY PRETI)
//    function sortAuditLogs()         - Handle column header clicks for sorting (DONE BY PRETI)
//    function displayAuditLogsPage()  - Display current page of filtered logs (DONE BY PRETI)
//    function updateAuditTable()      - Update audit logs table display (DONE BY PRETI)
//    function getAuditBadgeType()     - Determine badge style based on action type (DONE BY PRETI)
//    function updateAuditPagination() - Update pagination controls (DONE BY PRETI)
//    function prevAuditPage()         - Navigate to previous audit page (DONE BY PRETI)
//    function nextAuditPage()         - Navigate to next audit page (DONE BY PRETI)
//    function toggleAdvancedFilters() - Show/hide advanced filter panel (DONE BY PRETI)
//    function clearAllFilters()       - Reset all filters to default (DONE BY PRETI)
//    function setDateRangePreset()    - Set date range (today/week/month) (DONE BY PRETI)
//    function updateFilterIndicators() - Highlight active filters (DONE BY PRETI)
//    function updateResultsCounts()   - Update result count displays (DONE BY PRETI)
//    async function downloadAuditExcel() - Download filtered logs as CSV/Excel (DONE BY PRETI)
//
// 4. DASHBOARD MANAGEMENT
//    async function loadDashboardData() - Load dashboard statistics from API (DONE BY PRETI)
//    function updateDashboardStats()  - Update dashboard stat cards (DONE BY PRETI)
//    function updateRecentActivity()  - Update recent activity section (DONE BY PRETI)
//    function createStatusItem()      - Create status item element (DONE BY PRETI)
//    function updateLastUpdated()     - Update last updated timestamp (DONE BY PRETI)
//    function getDefaultStats()       - Get fallback statistics for offline mode (DONE BY PRETI)
//    function refreshDashboard()      - Refresh dashboard data (DONE BY PRETI)
//
// 5. FEEDBACK DATA MANAGEMENT (NOT_ARCHIVED)
//    async function loadFeedbackData() - Load ALL feedback data (not_archived) (DONE BY PRETI)
//    function filterFeedbackData()    - Filter feedback based on all active filters (DONE BY PRETI)
//    function updateFeedbackCounts()  - Update feedback count displays (DONE BY PRETI)
//    function renderFeedbackPage()    - Render current page of feedback (25 records) (DONE BY PRETI)
//    function updateFeedbackPaginationControls() - Update feedback pagination controls (DONE BY PRETI)
//    function prevFeedbackPage()      - Navigate to previous feedback page (DONE BY PRETI)
//    function nextFeedbackPage()      - Navigate to next feedback page (DONE BY PRETI)
//    function refreshFeedbackData()   - Refresh feedback data (DONE BY PRETI)
//
// 6. ARCHIVE DATA MANAGEMENT (ARCHIVED)
//    async function loadArchiveData() - Load ALL archive data (archived) (DONE BY PRETI)
//    function filterArchiveData()     - Filter archive data (DONE BY PRETI)
//    function updateArchiveCounts()   - Update archive count displays (DONE BY PRETI)
//    function renderArchivePage()     - Render current page of archive (25 records) (DONE BY PRETI)
//    function updateArchivePaginationControls() - Update archive pagination controls (DONE BY PRETI)
//    function prevArchivePage()       - Navigate to previous archive page (DONE BY PRETI)
//    function nextArchivePage()       - Navigate to next archive page (DONE BY PRETI)
//    function refreshArchiveData()    - Refresh archive data (DONE BY PRETI)
//
// 7. FILTER CONTROLS (BOTH TABS)
//    function toggleFeedbackAdvancedFilters() - Toggle feedback advanced filters panel (DONE BY PRETI)
//    function toggleArchiveAdvancedFilters() - Toggle archive advanced filters panel (DONE BY PRETI)
//    function setFeedbackDateRangePreset() - Set feedback date range preset (DONE BY PRETI)
//    function setArchiveDateRangePreset() - Set archive date range preset (DONE BY PRETI)
//    function clearAllFeedbackFilters() - Clear all feedback filters (DONE BY PRETI)
//    function clearAllArchiveFilters() - Clear all archive filters (DONE BY PRETI)
//
// 8. ENCRYPTION MANAGEMENT (PAGE-SPECIFIC)
//    function updateEncryptionButtons() - Update feedback encryption buttons (DONE BY PRETI)
//    function updateArchiveEncryptionButtons() - Update archive encryption buttons (DONE BY PRETI)
//    async function decryptAllEmails() - Decrypt emails on current feedback page (DONE BY PRETI)
//    async function decryptAllArchiveEmails() - Decrypt emails on current archive page (DONE BY PRETI)
//    function reEncryptAllEmails()    - Re-encrypt feedback emails (DONE BY PRETI)
//    function reEncryptAllArchiveEmails() - Re-encrypt archive emails (DONE BY PRETI)
//
// 9. PLEDGE & CONTENT VIEWING
//    function viewPledge()            - Display pledge content in popup (DONE BY PRETI)
//    function closePledgePopup()      - Close pledge popup (DONE BY PRETI)
//    async function viewQuestionAnswers() - Load and display question answers (DONE BY PRETI)
//    function createQuestionAnswersPopup() - Create Q&A popup interface (DONE BY PRETI)
//    function formatAnswer()          - Format answer based on question type (DONE BY PRETI)
//    function closeQAPopup()          - Close Q&A popup (DONE BY PRETI)
//
// 10. PHOTO MANAGEMENT
//     async function viewRawPhoto()   - View raw photo without password (DONE BY PRETI)
//     async function viewProcessedPhoto() - View processed photo without password (DONE BY PRETI)
//     function showRawPhotoPopup()    - Show raw photo popup (DONE BY PRETI)
//     function showProcessedPhotoPopup() - Show processed photo popup (DONE BY PRETI)
//     function createPhotoPopup()     - Create photo viewing popup (DONE BY PRETI)
//     function handlePhotoError()     - Handle photo loading errors (DONE BY PRETI)
//     function downloadPhoto()        - Download photo file (DONE BY PRETI)
//     function closePhotoPopup()      - Close photo popup (DONE BY PRETI)
//
// 11. EMAIL MANAGEMENT
//     function showPasswordPrompt()   - Custom password prompt with hidden input (DONE BY PRETI)
//     function showEmailPopup()       - Display decrypted email in popup (DONE BY PRETI)
//     function closeEmailPopup()      - Close email display popup (DONE BY PRETI)
//
// 12. OVERLAY MANAGEMENT
//     async function loadOverlayData() - Load overlay themes from API (DONE BY PRETI)
//     function showOverlayMessage()   - Display overlay status message (DONE BY PRETI)
//     function createOverlaysTable()  - Placeholder for creating overlays table (DONE BY PRETI)
//     function updateOverlayTable()   - Update overlay grid display (DONE BY PRETI)
//     function viewOverlay()          - View overlay image in popup (DONE BY PRETI)
//     function closeOverlayPreview()  - Close overlay preview (DONE BY PRETI)
//     function handleOverlayImageError() - Handle overlay image loading errors (DONE BY PRETI)
//     function downloadOverlay()      - Download overlay image (DONE BY PRETI)
//     function showAddOverlayModal()  - Show add overlay modal (System Admin only) (DONE BY PRETI)
//     function closeAddOverlayModal() - Close add overlay modal (DONE BY PRETI)
//     async function handleAddOverlay() - Handle overlay creation with file upload (DONE BY PRETI)
//     async function deleteOverlay()  - Request overlay deletion (System Admin only) (DONE BY PRETI)
//     async function performOverlayDeletion() - Execute overlay deletion (DONE BY PRETI)
// 
// 13. USER MANAGEMENT 
//     let currentUserTab                - Track current tab ('active' or 'deleted') (DONE BY PRETI)
//     function switchUserTab()          - Switch between Active/Deleted users tabs (DONE BY PRETI)
//     async function loadUserManagementData() - Load users based on current tab (DONE BY PRETI)
//     async function loadActiveUsers()  - Load active admin users (DONE BY PRETI)
//     async function loadDeletedUsers() - Load deleted admin users (DONE BY PRETI)
//     function updateActiveUsersTable() - Update active users table (DONE BY PRETI)
//     function updateDeletedUsersTable() - Update deleted users table (DONE BY PRETI)
//     function updateUserManagementTable() - Legacy wrapper for backward compatibility (DONE BY PRETI)
//     function addUser()                - Open add user modal (System Admin only) (DONE BY PRETI)
//     async function handleAddUser()    - Process new user creation (DONE BY PRETI)
//     function closeAddUserModal()      - Close add user modal (DONE BY PRETI)
//     function editUser()               - Open user edit modal (System Admin only) (DONE BY PRETI)
//     async function handleEditUser()   - Process user updates (DONE BY PRETI)
//     function closeEditUserModal()     - Close edit user modal (DONE BY PRETI)
//     async function deleteUser()       - Soft delete user (DONE BY PRETI)
//     async function performUserDeletion() - Execute soft deletion (DONE BY PRETI)
//     async function restoreUser()      - Restore soft-deleted user (DONE BY PRETI)
//     async function permanentDeleteUser() - Permanently delete from database (DONE BY PRETI)
//     function getFallbackUsers()       - Get fallback user data for development (DONE BY PRETI)
//     function formatRoleName()         - Format role display names (DONE BY PRETI)
//
// 14. QUESTION MANAGEMENT
//     async function loadQuestionManagementData() - Load question data from API (DONE BY PRETI)
//     function updateQuestionManagementTable() - Update question display (DONE BY PRETI)
//     function formatQuestionType()   - Format question type for display (DONE BY PRETI)
//     function showAddQuestionModal() - Show add question modal (System Admin only) (DONE BY PRETI)
//     function closeAddQuestionModal() - Close add question modal (DONE BY PRETI)
//     function toggleOptionsField()   - Show/hide options based on question type (DONE BY PRETI)
//     function addOptionField()       - Add option input field (DONE BY PRETI)
//     function removeOptionField()    - Remove option input field (DONE BY PRETI)
//     async function handleAddQuestion() - Process new question creation (DONE BY PRETI)
//     function editQuestionById()     - Helper to retrieve question data and call edit (DONE BY PRETI)
//     function editQuestion()         - Open question edit modal (System Admin only) (DONE BY PRETI)
//     async function handleEditQuestion() - Process question updates (safe editing) (DONE BY PRETI)
//     function closeEditQuestionModal() - Close edit question modal (DONE BY PRETI)
//     async function deleteQuestion() - Delete question (System Admin only) (DONE BY PRETI)
//
// 15. DATA EXPORT MANAGEMENT
//     function initDataExportPage()   - Initialize data export page with access control (DONE BY PRETI)
//     async function unlockDataExport() - Unlock data export with password verification (DONE BY PRETI)
//     function updateExportSessionInfo() - Update session info display (DONE BY PRETI)
//     async function downloadExport() - Download export file (Excel/CSV/Zip) (DONE BY PRETI)
//
// 16. FEEDBACK DELETION
//     async function deleteFeedback() - Request feedback deletion with password (DONE BY PRETI)
//     async function deleteArchiveFeedback() - Request archive feedback deletion (DONE BY PRETI)
//     function showDeletePasswordModal() - Show deletion password prompt (DONE BY PRETI)
//     async function verifyDeleteAccess() - Verify password for deletion (DONE BY PRETI)
//     async function performFeedbackDeletion() - Execute feedback deletion (DONE BY PRETI)
//     function closeDeleteModal()     - Close delete modal (DONE BY PRETI)
//
// 17. NAVIGATION & PAGE MANAGEMENT
//     function showPage()             - Navigate between pages with role-based access control (DONE BY PRETI)
//     function initializeArchivePage() - Initialize archive page (placeholder) (DONE BY PRETI)
//
// 18. DIGITAL TREE MANAGEMENT
//     async function loadDigitalTreeData() - Load digital tree visitor data (DONE BY PRETI)
//     function updateDigitalTreeTable() - Update digital tree table (DONE BY PRETI)
//     function refreshTreeData()      - Refresh tree data (DONE BY PRETI)
//
// 19. UTILITY FUNCTIONS
//     function escapeHtml()           - Escape HTML for safe display (DONE BY PRETI)
//
// 20. THEME SETTINGS - HELPER FUNCTIONS
//     function showConfirmDialog()    - Show confirmation dialog (DONE BY PRETI)
//
// 21. THEME CONFIGURATION
//     function getDefaultThemeSettings() - Get default theme color settings (DONE BY PRETI)
//     function initThemeSettings()    - Initialize theme settings page (DONE BY PRETI)
//     function loadThemeSettings()    - Load theme settings from localStorage (DONE BY PRETI)
//     function migrateOldColors()     - Migrate old color format to new structure (DONE BY PRETI)
//     function getCustomDefaultColors() - Get custom default colors (DONE BY PRETI)
//     function saveIndividualPageSettings() - Save page-specific color overrides (DONE BY PRETI)
//     function loadIndividualPageSettings() - Load page-specific color overrides (DONE BY PRETI)
//     function saveThemeSettings()    - Save theme settings to localStorage (DONE BY PRETI)
//     function showSaveMessage()      - Show save confirmation message (DONE BY PRETI)
//
// 22. THEME MANAGEMENT FUNCTIONS
//     function renderSectionList()    - Render list of theme sections (DONE BY PRETI)
//     function selectSection()        - Select theme section for editing (DONE BY PRETI)
//     function updateSectionTitle()   - Update section title display (DONE BY PRETI)
//     function renderThemeControls()  - Render color controls for section (DONE BY PRETI)
//     function createColorGroup()     - Create group of color controls (DONE BY PRETI)
//     function createColorControl()   - Create individual color control (DONE BY PRETI)
//     function updateColor()          - Update color value from picker (DONE BY PRETI)
//     function updateColorFromHex()   - Update color value from hex input (DONE BY PRETI)
//     function toggleGlobalThemeOverride() - Toggle global theme override for section (DONE BY PRETI)
//     function resetSectionToGlobal() - Reset section colors to global theme (DONE BY PRETI)
//     async function resetAllToDefaults() - Reset all theme settings to defaults (DONE BY PRETI)
//     function updatePreview()        - Update theme preview display (DONE BY PRETI)
//     function applyThemeSettings()   - Apply theme colors to all pages (DONE BY PRETI)
//
// 23. SAVED THEMES MANAGEMENT
//     let savedThemesCache            - Cache saved themes data (DONE BY PRETI)
//     async function loadSavedThemes() - Load user saved themes from database (DONE BY PRETI)
//     function updateSavedThemesUI()  - Update saved themes UI display (DONE BY PRETI)
//     function createSavedThemeCard() - Create saved theme card element (DONE BY PRETI)
//     function extractPreviewColors() - Extract preview colors from theme data (DONE BY PRETI)
//     function captureCurrentThemeData() - Capture current theme configuration (DONE BY PRETI)
//     async function saveCurrentTheme() - Save current theme to database (DONE BY PRETI)
//     function clearSaveThemeForm()   - Clear save theme form inputs (DONE BY PRETI)
//     function applyThemeData()       - Apply theme data to UI (DONE BY PRETI)
//     async function activateSavedTheme() - Set theme as active for user (DONE BY PRETI)
//     async function renameSavedTheme() - Rename saved theme (DONE BY PRETI)
//     function createRenameModal()    - Create rename modal interface (DONE BY PRETI)
//     async function performRename()  - Execute theme rename operation (DONE BY PRETI)
//     function closeRenameModal()     - Close rename modal (DONE BY PRETI)
//     async function deleteSavedTheme() - Delete saved theme from database (DONE BY PRETI)
//     async function refreshSavedThemes() - Refresh saved themes list (DONE BY PRETI)
//     async function loadActiveThemeOnLogin() - Load and apply active theme on page load (DONE BY PRETI)
//     function applyDefaultTheme()    - Apply default theme colors (DONE BY PRETI)
//     function initSavedThemesSection() - Initialize saved themes section (DONE BY PRETI)
//
// 24. ARCHIVE DELETION FUNCTIONS (System Admin Only)
//     function initializeDeletionControls() - Show/hide deletion controls based on user role (DONE BY PRETI)
//     function toggleSelectAllArchive() - Toggle select all checkboxes in archive (DONE BY PRETI)
//     function updateArchiveSelectionCount() - Update selected count and enable/disable delete button (DONE BY PRETI)
//     function setQuickDeleteDate()   - Set quick date for bulk deletion (DONE BY PRETI) 
//     async function previewBulkDelete() - Preview records to be deleted by date (DONE BY PRETI) 
//     async function deleteSelectedArchive() - Delete selected archive records (DONE BY PRETI) 
//     async function bulkDeleteByDate() - Bulk delete records before date (DONE BY PRETI)
//     function showDeletionConfirmationModal() - Show deletion confirmation modal (DONE BY PRETI) 
//     function refreshArchiveData()   - Refresh archive data after deletion (DONE BY PRETI) 
//
// 25. INITIALIZATION & EVENT HANDLERS
//     window.addEventListener('DOMContentLoaded') - Check login status on page load (DONE BY PRETI)
//
// 26. LEADERBOARD MANAGEMENT
//     async function loadAdminLeaderboard() - Load leaderboard data from API (DONE BY PRETI)
//     function filterLeaderboardData() - Filter leaderboard data by search term (DONE BY PRETI)
//     function clearLeaderboardSearch() - Clear leaderboard search (DONE BY PRETI)
//     function renderLeaderboardPage() - Render current page of leaderboard (DONE BY PRETI)
//     function updateLeaderboardPaginationControls() - Update leaderboard pagination controls (DONE BY PRETI)
//     function prevLeaderboardPage()  - Navigate to previous leaderboard page (DONE BY PRETI)
//     function nextLeaderboardPage()  - Navigate to next leaderboard page (DONE BY PRETI)
// 
// 27. VIP MANAGEMENT (DONE BY ZAH)
//     let vipData                   - Store ACTIVE VIP records only (DONE BY ZAH)
//     const VIP_API                 - VIP API endpoint helpers (DONE BY ZAH)
//     function getVipElements()     - Get VIP page DOM elements (DONE BY ZAH)
//     function escapeHtmlSafe()     - Escape HTML for safe rendering (DONE BY ZAH)
//     function formatVipDate()      - Format VIP created_at timestamp (DONE BY ZAH)
//     async function fetchVipJson() - Fetch wrapper for VIP API calls (DONE BY ZAH)
//     function renderVipList()      - Render VIP list cards in the VIP page (DONE BY ZAH)
//     async function loadVipData()  - Load ACTIVE VIP data from API and update UI (DONE BY ZAH)
//     function loadVipManagementData() - Called when opening VIP page via showPage('vip') (DONE BY ZAH)
//     async function addVip()       - Add VIP name to database and refresh list (DONE BY ZAH)


// ==================== 1. GLOBAL VARIABLES & STATE MANAGEMENT ====================

// Download modals
let currentDownloadType = null;

// Feedback deletion tracking
let currentDeleteFeedbackId = null;

// Email viewing
let currentEmailViewingId = null;

// Audit logs pagination and filtering
let currentAuditPage = 1;
let auditLogsPerPage = 50;
let currentSortField = 'created_at';
let currentSortDirection = 'desc';
let allAuditLogs = [];
let filteredAuditLogs = [];

// Global variables for feedback (not_archived)
let allFeedbackData = []; // ALL not_archived records
let filteredFeedbackData = []; // Filtered results
let feedbackCurrentPage = 1;
const feedbackItemsPerPage = 25;

// Global variables for archive (archived)
let allArchiveData = []; // ALL archived records
let filteredArchiveData = []; // Filtered results
let archiveCurrentPage = 1;
const archiveItemsPerPage = 25;

// Decryption state (per-page only)

// Global variables for leaderboard
let allLeaderboardData = []; // ALL leaderboard records
let filteredLeaderboardData = []; // Filtered results
let leaderboardCurrentPage = 1;
const leaderboardItemsPerPage = 25;
let decryptedEmailMap = {}; // {feedbackId: decryptedEmail}
let isAnyEmailDecrypted = false;
let encryptedFeedbackIds = [];

// Archive decryption state (separate)
let decryptedArchiveEmailMap = {};
let isAnyArchiveEmailDecrypted = false;
let encryptedArchiveIds = [];

// Data export session
let dataExportUnlocked = false;
let dataExportUnlockTime = null;

// Question management - store question data to avoid JSON.stringify issues in onclick
window.questionsDataMap = new Map();

//
//  Show notification message to user
//  @param {string} message - Message to display
//  @param {string} type - Type of notification: 'success', 'error', 'info', 'warning'
//  
function showNotification(message, type = 'info') {
    // Check if you have an existing notification system
    
    if (type === 'error') {
        alert('❌ ' + message);
    } else if (type === 'success') {
        alert('✅ ' + message);
    } else if (type === 'warning') {
        alert('⚠️ ' + message);
    } else {
        alert('ℹ️ ' + message);
    }
}

// ==================== 2. AUTHENTICATION & SESSION MANAGEMENT ====================

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
            console.log('✅ Login successful');
            // Store logged in user
            sessionStorage.setItem('loggedUser', data.user.username);
            sessionStorage.setItem('userRole', data.user.role);
            await loadActiveThemeOnLogin();

            // Load active theme on login
            setTimeout(() => {
                loadActiveThemeOnLogin();
            }, 500);
            
            // Update UI and apply role-based access
            updateUIForUser(data.user.username, data.user.role);
            
            // Load dashboard data
            await loadDashboardData();
            
            // Show dashboard
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
        } else {
            console.log('❌ Login failed:', data.error);
            alert(data.error || 'Invalid username or password');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        alert('Login failed. Please check your connection and try again.');
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
    }).catch(() => {});
    
    sessionStorage.clear();
    
    // Reload page to ensure clean state for next login
    window.location.reload();
}

// Update UI for user role
function updateUIForUser(username, role) {
    // Update user info in header
    document.getElementById('logged-username').textContent = username;
    document.getElementById('logged-role').textContent = formatRoleName(role);
    document.querySelector('.user-avatar').textContent = username[0].toUpperCase();
    
    // MAIN section: Always visible for ALL roles
    // Contains: Dashboard, Feedback Data, Digital Tree, Leaderboard, Style & Theme Settings
    const mainSection = document.getElementById('main-section');
    if (mainSection) {
        mainSection.style.display = 'block';
    }
    
    // ADMINISTRATION section: ONLY visible for system_admin
    // Contains: Overlay Management, Question Management, User Management, VIP Management, Archive, Audit Logs, Data Export
    const adminSection = document.getElementById('admin-section');
    if (role === 'system_admin') {
        if (adminSection) adminSection.style.display = 'block';
    } else {
        // Hide for IT_staff and IT_admin
        if (adminSection) adminSection.style.display = 'none';
    }
    
    // Show/hide ONLY decrypt/download buttons based on role
    // Filter buttons should be visible for ALL roles
    const decryptButtons = document.querySelectorAll('#decrypt-emails-btn, #decrypt-archive-all-btn, #re-encrypt-btn, #re-encrypt-archive-all-btn');
    if (role === 'system_admin') {
        decryptButtons.forEach(btn => btn.style.display = 'inline-block');
    } else {
        decryptButtons.forEach(btn => btn.style.display = 'none');
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

// ==================== 3. AUDIT LOGS MANAGEMENT ====================

// Load all audit logs
async function loadAuditLogs() {
    try {
        console.log('📋 Loading audit logs...');
        const response = await fetch(`/api/admin/audit-logs?limit=10000&offset=0`);
        const data = await response.json();
        
        if (data.success) {
            allAuditLogs = data.logs || [];
            console.log(`✅ Loaded ${allAuditLogs.length} audit logs`);
            
            // Populate filter dropdowns
            populateUserFilter();
            
            // Reset to first page
            currentAuditPage = 1;
            
            // Apply filters and display
            filterAuditLogs();
            
            // Update total count
            document.getElementById('total-logs').textContent = allAuditLogs.length;
        }
    } catch (error) {
        console.error('❌ Error loading audit logs:', error);
        allAuditLogs = [];
        filteredAuditLogs = [];
        updateAuditTable([]);
    }
}

// Populate user filter dropdown with unique users
function populateUserFilter() {
    const userFilter = document.getElementById('filter-user');
    if (!userFilter) return;
    
    // Get unique usernames
    const uniqueUsers = [...new Set(allAuditLogs.map(log => log.admin_username))].filter(Boolean).sort();
    
    // Clear existing options except "All Users"
    userFilter.innerHTML = '<option value="">All Users</option>';
    
    // Add user options
    uniqueUsers.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        userFilter.appendChild(option);
    });
}

// Filter audit logs based on all criteria
function filterAuditLogs() {
    const searchTerm = document.getElementById('audit-search-input')?.value.toLowerCase() || '';
    const filterAction = document.getElementById('filter-action')?.value || '';
    const filterUser = document.getElementById('filter-user')?.value || '';
    const filterTargetType = document.getElementById('filter-target-type')?.value || '';
    const filterIp = document.getElementById('filter-ip')?.value.toLowerCase() || '';
    const filterDateFrom = document.getElementById('filter-date-from')?.value || '';
    const filterDateTo = document.getElementById('filter-date-to')?.value || '';
    
    filteredAuditLogs = allAuditLogs.filter(log => {
        // Global search filter - searches ALL columns
        const searchMatch = !searchTerm || 
            (log.admin_username && log.admin_username.toLowerCase().includes(searchTerm)) ||
            (log.action && log.action.toLowerCase().includes(searchTerm)) ||
            (log.target_type && log.target_type.toLowerCase().includes(searchTerm)) ||
            (log.target_id && log.target_id.toString().toLowerCase().includes(searchTerm)) ||
            (log.ip_address && log.ip_address.toLowerCase().includes(searchTerm)) ||
            (log.user_agent && log.user_agent.toLowerCase().includes(searchTerm)) ||
            (log.created_at && new Date(log.created_at).toLocaleString().toLowerCase().includes(searchTerm));
        
        // Action filter
        const actionMatch = !filterAction || (log.action && log.action.includes(filterAction));
        
        // User filter
        const userMatch = !filterUser || (log.admin_username === filterUser);
        
        // Target Type filter
        const targetMatch = !filterTargetType || (log.target_type === filterTargetType);
        
        // IP Address filter
        const ipMatch = !filterIp || (log.ip_address && log.ip_address.toLowerCase().includes(filterIp));
        
        // Date range filter
        let dateMatch = true;
        if (filterDateFrom || filterDateTo) {
            const logDate = new Date(log.created_at);
            logDate.setHours(0, 0, 0, 0); // Reset time for date comparison
            
            if (filterDateFrom) {
                const fromDate = new Date(filterDateFrom);
                fromDate.setHours(0, 0, 0, 0);
                dateMatch = dateMatch && logDate >= fromDate;
            }
            
            if (filterDateTo) {
                const toDate = new Date(filterDateTo);
                toDate.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && logDate <= toDate;
            }
        }
        
        return searchMatch && actionMatch && userMatch && targetMatch && ipMatch && dateMatch;
    });
    
    // Apply sorting
    sortFilteredLogs();
    
    // Reset to first page when filtering
    currentAuditPage = 1;
    
    // Update UI
    updateFilterIndicators();
    displayAuditLogsPage();
    updateAuditPagination(filteredAuditLogs.length);
    updateResultsCounts();
}

// Sort filtered logs
function sortFilteredLogs() {
    filteredAuditLogs.sort((a, b) => {
        let aVal = a[currentSortField];
        let bVal = b[currentSortField];
        
        // Handle dates
        if (currentSortField === 'created_at') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Handle nulls
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Compare
        if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Sort audit logs by column
function sortAuditLogs(field) {
    if (currentSortField === field) {
        // Toggle direction
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to ascending
        currentSortField = field;
        currentSortDirection = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('.sort-indicator').forEach(el => {
        el.className = 'sort-indicator';
    });
    
    const indicator = document.getElementById(`sort-${field}`);
    if (indicator) {
        indicator.className = `sort-indicator ${currentSortDirection}`;
    }
    
    // Re-filter (which includes sorting)
    filterAuditLogs();
}

// Display current page of filtered audit logs
function displayAuditLogsPage() {
    const startIndex = (currentAuditPage - 1) * auditLogsPerPage;
    const endIndex = startIndex + auditLogsPerPage;
    const pageData = filteredAuditLogs.slice(startIndex, endIndex);
    
    updateAuditTable(pageData);
}

// Update audit logs table
function updateAuditTable(logs) {
    const tbody = document.getElementById('audit-logs-body');
    if (!tbody) return;
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">No audit logs found</div>
                    <div class="empty-state-text">
                        ${allAuditLogs.length === 0 
                            ? 'No audit logs have been recorded yet.' 
                            : 'Try adjusting your filters to see more results.'}
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td><strong>${escapeHtml(log.admin_username)}</strong></td>
            <td><span class="badge badge-${getAuditBadgeType(log.action)}">${escapeHtml(log.action)}</span></td>
            <td>${log.target_type ? `${escapeHtml(log.target_type)} #${log.target_id}` : '–'}</td>
            <td style="font-size: 12px; color: #64748b;">${escapeHtml(log.ip_address) || '–'}</td>
        </tr>
    `).join('');
}

// Get badge type for action
function getAuditBadgeType(action) {
    if (action.includes('DELETE')) return 'warning';
    if (action.includes('LOGIN') || action.includes('DOWNLOAD') || action.includes('EMAIL')) return 'security';
    if (action.includes('ADD') || action.includes('EDIT')) return 'active';
    return 'system';
}

// Update pagination
function updateAuditPagination(total) {
    const totalPages = Math.ceil(total / auditLogsPerPage);
    document.getElementById('audit-page-info').textContent = `Page ${currentAuditPage} of ${totalPages || 1}`;
    document.getElementById('prev-audit-btn').disabled = currentAuditPage <= 1;
    document.getElementById('next-audit-btn').disabled = currentAuditPage >= totalPages;
}

// Previous page
function prevAuditPage() {
    if (currentAuditPage > 1) {
        currentAuditPage--;
        displayAuditLogsPage();
        updateAuditPagination(filteredAuditLogs.length);
    }
}

// Next page
function nextAuditPage() {
    const totalPages = Math.ceil(filteredAuditLogs.length / auditLogsPerPage);
    if (currentAuditPage < totalPages) {
        currentAuditPage++;
        displayAuditLogsPage();
        updateAuditPagination(filteredAuditLogs.length);
    }
}

// Toggle advanced filters panel
function toggleAdvancedFilters() {
    const panel = document.getElementById('advanced-filters-panel');
    const icon = document.getElementById('filter-toggle-icon');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        icon.classList.add('rotated');
    } else {
        panel.style.display = 'none';
        icon.classList.remove('rotated');
    }
}

// Clear all filters
function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('audit-search-input');
    if (searchInput) searchInput.value = '';
    
    // Clear all filter dropdowns
    const filterAction = document.getElementById('filter-action');
    if (filterAction) filterAction.value = '';
    
    const filterUser = document.getElementById('filter-user');
    if (filterUser) filterUser.value = '';
    
    const filterTargetType = document.getElementById('filter-target-type');
    if (filterTargetType) filterTargetType.value = '';
    
    const filterIp = document.getElementById('filter-ip');
    if (filterIp) filterIp.value = '';
    
    // Clear date filters
    const filterDateFrom = document.getElementById('filter-date-from');
    if (filterDateFrom) filterDateFrom.value = '';
    
    const filterDateTo = document.getElementById('filter-date-to');
    if (filterDateTo) filterDateTo.value = '';
    
    // Re-filter
    filterAuditLogs();
}

// Set date range preset
function setDateRangePreset(preset) {
    const today = new Date();
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    
    if (!filterDateFrom || !filterDateTo) return;
    
    // Set end date to today
    filterDateTo.value = today.toISOString().split('T')[0];
    
    // Set start date based on preset
    let startDate = new Date();
    
    switch (preset) {
        case 'today':
            startDate = new Date(today);
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
    }
    
    filterDateFrom.value = startDate.toISOString().split('T')[0];
    
    // Apply filter
    filterAuditLogs();
}

// Update filter indicators (highlight active filters)
function updateFilterIndicators() {
    // Count active filters
    let activeCount = 0;
    
    const searchInput = document.getElementById('audit-search-input');
    const filterAction = document.getElementById('filter-action');
    const filterUser = document.getElementById('filter-user');
    const filterTargetType = document.getElementById('filter-target-type');
    const filterIp = document.getElementById('filter-ip');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    
    // Check and highlight each filter
    if (searchInput && searchInput.value) {
        activeCount++;
    }
    
    if (filterAction && filterAction.value) {
        activeCount++;
        filterAction.classList.add('has-value');
    } else if (filterAction) {
        filterAction.classList.remove('has-value');
    }
    
    if (filterUser && filterUser.value) {
        activeCount++;
        filterUser.classList.add('has-value');
    } else if (filterUser) {
        filterUser.classList.remove('has-value');
    }
    
    if (filterTargetType && filterTargetType.value) {
        activeCount++;
        filterTargetType.classList.add('has-value');
    } else if (filterTargetType) {
        filterTargetType.classList.remove('has-value');
    }
    
    if (filterIp && filterIp.value) {
        activeCount++;
        filterIp.classList.add('has-value');
    } else if (filterIp) {
        filterIp.classList.remove('has-value');
    }
    
    if (filterDateFrom && filterDateFrom.value) {
        activeCount++;
        filterDateFrom.classList.add('has-value');
    } else if (filterDateFrom) {
        filterDateFrom.classList.remove('has-value');
    }
    
    if (filterDateTo && filterDateTo.value) {
        activeCount++;
        filterDateTo.classList.add('has-value');
    } else if (filterDateTo) {
        filterDateTo.classList.remove('has-value');
    }
    
    // Update active filters count
    const activeFiltersCount = document.getElementById('active-filters-count');
    if (activeFiltersCount) {
        activeFiltersCount.textContent = activeCount;
    }
    
    // Show/hide results info bar
    const resultsInfoBar = document.getElementById('results-info-bar');
    if (resultsInfoBar) {
        if (activeCount > 0 || filteredAuditLogs.length !== allAuditLogs.length) {
            resultsInfoBar.style.display = 'flex';
        } else {
            resultsInfoBar.style.display = 'none';
        }
    }
}

// Update results counts
function updateResultsCounts() {
    const filteredCount = document.getElementById('filtered-count');
    const totalCount = document.getElementById('total-count');
    const resultsCount = document.getElementById('results-count');
    const totalLogs = document.getElementById('total-logs');
    
    if (filteredCount) filteredCount.textContent = filteredAuditLogs.length;
    if (totalCount) totalCount.textContent = allAuditLogs.length;
    if (resultsCount) resultsCount.textContent = filteredAuditLogs.length;
    if (totalLogs) totalLogs.textContent = allAuditLogs.length;
}

// Download audit logs as Excel
async function downloadAuditExcel() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    try {
        // Prepare data for Excel (use filtered results)
        const excelData = filteredAuditLogs.map(log => ({
            'Time': new Date(log.created_at).toLocaleString(),
            'User': log.admin_username,
            'Action': log.action,
            'Target Type': log.target_type || '',
            'Target ID': log.target_id || '',
            'IP Address': log.ip_address || '',
            'User Agent': log.user_agent || ''
        }));
        
        if (excelData.length === 0) {
            alert('No audit logs to download. Try adjusting your filters.');
            return;
        }
        
        // Convert to CSV
        const headers = Object.keys(excelData[0]);
        const csvContent = [
            headers.join(','),
            ...excelData.map(row => 
                headers.map(header => {
                    const value = String(row[header] || '');
                    // Escape quotes and wrap in quotes if contains comma or quotes
                    return value.includes(',') || value.includes('"') || value.includes('\n')
                        ? `"${value.replace(/"/g, '""')}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Downloaded ${excelData.length} audit logs`);
        
        // Log the download action
        const loggedUsername = sessionStorage.getItem('loggedUser');
        if (loggedUsername) {
            try {
                await fetch('/api/admin/logout-audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: loggedUsername
                    })
                });
            } catch (err) {
                console.error('Failed to log download action:', err);
            }
        }
        
    } catch (error) {
        console.error('❌ Error downloading audit logs:', error);
        alert('Error downloading audit logs: ' + error.message);
    }
}

// ==================== 4. DASHBOARD MANAGEMENT ====================

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

// ==================== 5. FEEDBACK DATA MANAGEMENT (NOT_ARCHIVED) ====================


// Load ALL feedback data (archive_status = 'not_archived')
async function loadFeedbackData() {
    try {
        console.log('📊 Loading feedback data (not_archived)...');
        
        const response = await fetch('/api/admin/feedback', {
            headers: {
                'x-username': sessionStorage.getItem('loggedUser')
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allFeedbackData = data.feedback || [];
            feedbackCurrentPage = 1;
            
            console.log(`✅ Loaded ${allFeedbackData.length} feedback records`);
            
            // Reset decryption
            decryptedEmailMap = {};
            isAnyEmailDecrypted = false;
            
            // Apply filters
            filterFeedbackData();
        } else {
            throw new Error(data.error || 'Failed to load feedback data');
        }
    } catch (error) {
        console.error('❌ Error loading feedback:', error);
        
        // Show error in table
        const tbody = document.getElementById('feedback-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #ef4444;">
                        ❌ Error connecting to server<br>
                        <small class="text-muted">${error.message}</small>
                    </td>
                </tr>
            `;
        }
        
        updateFeedbackPaginationControls(0, 0);
    }
}

// Filter feedback data based on all active filters
function filterFeedbackData() {
    const searchTerm = document.getElementById('feedback-search-input')?.value.toLowerCase() || '';
    const dateFrom = document.getElementById('feedback-filter-date-from')?.value || '';
    const dateTo = document.getElementById('feedback-filter-date-to')?.value || '';
    const emailFilter = document.getElementById('feedback-filter-email')?.value || '';
    const visitsFilter = document.getElementById('feedback-filter-visits')?.value || '';
    const retentionFilter = document.getElementById('feedback-filter-retention')?.value || '';
    
    // Count active filters
    let activeFiltersCount = 0;
    if (searchTerm) activeFiltersCount++;
    if (dateFrom || dateTo) activeFiltersCount++;
    if (emailFilter) activeFiltersCount++;
    if (visitsFilter) activeFiltersCount++;
    if (retentionFilter) activeFiltersCount++;
    
    // Filter ALL data
    filteredFeedbackData = allFeedbackData.filter(item => {
        let matches = true;
        
        // Global search filter
        if (searchTerm) {
            const searchableText = [
                item.name || '',
                item.email_encrypted || '',
                item.pledge || '',
                item.date || ''
            ].join(' ').toLowerCase();
            
            matches = matches && searchableText.includes(searchTerm);
        }
        
        // Date range filter
        if (dateFrom || dateTo) {
            const itemDate = new Date(item.date);
            if (dateFrom) {
                matches = matches && itemDate >= new Date(dateFrom);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                matches = matches && itemDate <= toDate;
            }
        }
        
        // Email filter proper detection
        if (emailFilter) {
            const hasEmail = item.email_encrypted && 
                            item.email_encrypted.trim() !== '' && 
                            item.email_encrypted.toLowerCase() !== 'no email provided';
            
            if (emailFilter === 'has_email') {
                matches = matches && hasEmail;
            } else if (emailFilter === 'no_email') {
                matches = matches && !hasEmail;
            }
        }
        
        // Visits filter
        if (visitsFilter) {
            const visits = parseInt(item.visits) || 0;
            if (visitsFilter === '6+') {
                matches = matches && visits >= 6;
            } else {
                matches = matches && visits === parseInt(visitsFilter);
            }
        }
        
        // Data retention filter - Handle both formats
        if (retentionFilter) {
            const itemRetention = (item.data_retention || '').toLowerCase();
            const filterValue = retentionFilter.toLowerCase();
            
            if (filterValue === '7days' || filterValue === '7day') {
                matches = matches && (itemRetention === '7days' || itemRetention === '7day');
            } else if (filterValue === 'indefinite') {
                matches = matches && itemRetention === 'indefinite';
            }
        }
        
        return matches;
    });
    
    // Update UI counts
    updateFeedbackCounts(allFeedbackData.length, filteredFeedbackData.length, activeFiltersCount);
    
    // Reset to page 1
    feedbackCurrentPage = 1;
    
    // Reset decryption when filters change
    decryptedEmailMap = {};
    isAnyEmailDecrypted = false;
    
    // Render filtered data
    renderFeedbackPage();
}

// Update feedback count displays
 
function updateFeedbackCounts(total, filtered, activeFilters) {
    const elements = {
        'feedback-filtered-count': filtered,
        'feedback-total-count': total,
        'feedback-results-count': filtered,
        'feedback-total-records': total,
        'feedback-active-filters-count': activeFilters
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    
    // Show/hide results info bar
    const infoBar = document.getElementById('feedback-results-info-bar');
    if (infoBar) {
        infoBar.style.display = activeFilters > 0 ? 'block' : 'none';
    }
}

// Render current page of feedback (25 records)
function renderFeedbackPage() {
    const tbody = document.getElementById('feedback-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Get current user role
    const userRole = sessionStorage.getItem('userRole');
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredFeedbackData.length / feedbackItemsPerPage);
    const startIndex = (feedbackCurrentPage - 1) * feedbackItemsPerPage;
    const endIndex = startIndex + feedbackItemsPerPage;
    const pageData = filteredFeedbackData.slice(startIndex, endIndex);
    
    // Collect encrypted IDs from current page ONLY
    encryptedFeedbackIds = [];
    pageData.forEach(item => {
        if (item.email_encrypted && 
            item.email_encrypted.trim() !== '' && 
            item.email_encrypted.toLowerCase() !== 'no email provided') {
            encryptedFeedbackIds.push(item.id);
        }
    });
    
    // Show no data message
    if (filteredFeedbackData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #64748b;">
                    ${allFeedbackData.length === 0 
                        ? 'No feedback data available.'
                        : 'No results match your filters. Try adjusting your search criteria.'}
                </td>
            </tr>
        `;
        updateFeedbackPaginationControls(0, 0);
        updateEncryptionButtons();
        return;
    }
    
    // Render each row with proper styling
    pageData.forEach(feedback => {
        const row = tbody.insertRow();
        row.setAttribute('data-feedback-id', feedback.id);
        row.setAttribute('data-retention', feedback.data_retention || 'indefinite');
        
        // Name
        row.insertCell(0).textContent = feedback.name || 'Anonymous';
        
        // Email - WITH ICONS AND COLORS
        const emailCell = row.insertCell(1);
        emailCell.className = 'email-cell';
        
        if (decryptedEmailMap[feedback.id]) {
            // Decrypted - GREEN with unlock icon
            emailCell.innerHTML = `<span class="text-success font-weight-600">🔓 ${decryptedEmailMap[feedback.id]}</span>`;
        } else if (feedback.email_encrypted && 
                   feedback.email_encrypted.trim() !== '' && 
                   feedback.email_encrypted.toLowerCase() !== 'no email provided') {
            // Encrypted - GRAY with lock icon
            emailCell.innerHTML = `<span class="text-muted">🔒 [Encrypted]</span>`;
        } else {
            // No email - LIGHT GRAY
            emailCell.innerHTML = `<span class="text-light-gray">No email provided</span>`;
        }
        
        // Visits
        row.insertCell(2).textContent = feedback.visits || 1;
        
        // Pledge
        const pledgeCell = row.insertCell(3);
        if (feedback.pledge && feedback.pledge.trim() !== '') {
            pledgeCell.innerHTML = `<button class="btn-view" onclick="viewPledge(${feedback.id}, '${escapeHtml(feedback.pledge)}')">View</button>`;
        } else {
            pledgeCell.innerHTML = '<span class="text-muted font-size-12">No pledge</span>';
        }
        
        // Questions & Answers
        const qaCell = row.insertCell(4);
        if (feedback.question_answers && feedback.question_answers.length > 0) {
            qaCell.innerHTML = `<button class="btn-view" onclick="viewQuestionAnswers(${feedback.id})">View</button>`;
        } else {
            qaCell.innerHTML = '<span class="text-muted font-size-12">No answers</span>';
        }
        
        // Data Retention WITH BADGES
        const retentionCell = row.insertCell(5);
        const retention = feedback.data_retention || 'indefinite';
        if (retention === '7days' || retention === '7day') {
            retentionCell.innerHTML = '<span class="badge badge-warning">7 DAYS</span>';
        } else {
            retentionCell.innerHTML = '<span class="badge badge-permanent">INDEFINITE</span>';
        }
        
        // Raw Photo
        const rawPhotoCell = row.insertCell(6);
        if (feedback.photo_path) {
            rawPhotoCell.innerHTML = `<button class="btn-view" onclick="viewRawPhoto(${feedback.id})">View</button>`;
        } else {
            rawPhotoCell.innerHTML = '<span class="text-muted font-size-12">No raw photo</span>';
        }
        
        // Processed Photo
        const processedPhotoCell = row.insertCell(7);
        if (feedback.processed_photo_path) {
            processedPhotoCell.innerHTML = `<button class="btn-view" onclick="viewProcessedPhoto(${feedback.id})">View</button>`;
        } else {
            processedPhotoCell.innerHTML = '<span class="text-muted font-size-12">No processed photo</span>';
        }
        
        // Date
        row.insertCell(8).textContent = new Date(feedback.date).toLocaleString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Actions
        const actionsCell = row.insertCell(9);
        
        // IT_staff: View only, cannot delete
        if (userRole === 'IT_staff') {
            actionsCell.innerHTML = `<span class="text-muted font-size-12">View only</span>`;
        } 
        // IT_admin and system_admin: Can delete
        else if (userRole === 'IT_admin' || userRole === 'system_admin') {
            actionsCell.innerHTML = `<button class="btn-delete" onclick="deleteFeedback(${feedback.id})">🗑️ Delete</button>`;
        }
        // Default fallback
        else {
            actionsCell.innerHTML = `<span class="text-muted font-size-12">-</span>`;
        }
    });
    
    updateFeedbackPaginationControls(filteredFeedbackData.length, totalPages);
    updateEncryptionButtons();
}

// Update pagination controls
function updateFeedbackPaginationControls(totalItems, totalPages) {
    const prevBtn = document.getElementById('prev-feedback-btn');
    const nextBtn = document.getElementById('next-feedback-btn');
    const pageInfo = document.getElementById('feedback-page-info');
    
    if (prevBtn) prevBtn.disabled = feedbackCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = feedbackCurrentPage >= totalPages || totalPages === 0;
    
    if (pageInfo) {
        pageInfo.textContent = totalPages > 0 
            ? `Page ${feedbackCurrentPage} of ${totalPages} (${totalItems} total)`
            : 'Page 1 of 0 (0 total)';
    }
}

// Navigate to previous page
function prevFeedbackPage() {
    if (feedbackCurrentPage > 1) {
        feedbackCurrentPage--;
        decryptedEmailMap = {}; // Reset decryption
        isAnyEmailDecrypted = false;
        renderFeedbackPage();
    }
}

// Navigate to next page
function nextFeedbackPage() {
    const totalPages = Math.ceil(filteredFeedbackData.length / feedbackItemsPerPage);
    if (feedbackCurrentPage < totalPages) {
        feedbackCurrentPage++;
        decryptedEmailMap = {}; // Reset decryption
        isAnyEmailDecrypted = false;
        renderFeedbackPage();
    }
}

// Refresh feedback data
function refreshFeedbackData() {
    loadFeedbackData();
}

// ==================== 6. ARCHIVE DATA MANAGEMENT (ARCHIVED) ====================


// Load ALL archive data (archive_status = 'archived')
async function loadArchiveData() {
    try {
        console.log('📚 Loading archive data (archived)...');
        
        const response = await fetch('/api/admin/archive', {
            headers: {
                'x-username': sessionStorage.getItem('loggedUser')
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allArchiveData = data.feedback || [];
            archiveCurrentPage = 1;
            
            console.log(`✅ Loaded ${allArchiveData.length} archive records`);
            
            // Reset decryption
            decryptedArchiveEmailMap = {};
            isAnyArchiveEmailDecrypted = false;
            
            // Apply filters
            filterArchiveData();
        } else {
            throw new Error(data.error || 'Failed to load archive data');
        }
    } catch (error) {
        console.error('❌ Error loading archive:', error);
        
        // Show error in table
        const tbody = document.getElementById('archive-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #ef4444;">
                        ❌ Error connecting to server<br>
                        <small class="text-muted">${error.message}</small>
                    </td>
                </tr>
            `;
        }
        
        updateArchivePaginationControls(0, 0);
    }
}

// Filter archive data (same logic as feedback)
function filterArchiveData() {
    const searchTerm = document.getElementById('archive-search-input')?.value.toLowerCase() || '';
    const dateFrom = document.getElementById('archive-filter-date-from')?.value || '';
    const dateTo = document.getElementById('archive-filter-date-to')?.value || '';
    const emailFilter = document.getElementById('archive-filter-email')?.value || '';
    const visitsFilter = document.getElementById('archive-filter-visits')?.value || '';
    const retentionFilter = document.getElementById('archive-filter-retention')?.value || '';
    
    // Count active filters
    let activeFiltersCount = 0;
    if (searchTerm) activeFiltersCount++;
    if (dateFrom || dateTo) activeFiltersCount++;
    if (emailFilter) activeFiltersCount++;
    if (visitsFilter) activeFiltersCount++;
    if (retentionFilter) activeFiltersCount++;
    
    // Filter ALL data
    filteredArchiveData = allArchiveData.filter(item => {
        let matches = true;
        
        // Global search
        if (searchTerm) {
            const searchableText = [
                item.name || '',
                item.email_encrypted || '',
                item.pledge || '',
                item.date || ''
            ].join(' ').toLowerCase();
            
            matches = matches && searchableText.includes(searchTerm);
        }
        
        // Date range
        if (dateFrom || dateTo) {
            const itemDate = new Date(item.date);
            if (dateFrom) matches = matches && itemDate >= new Date(dateFrom);
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                matches = matches && itemDate <= toDate;
            }
        }
        
        // Email filter
        if (emailFilter) {
            const hasEmail = item.email_encrypted && 
                            item.email_encrypted.trim() !== '' && 
                            item.email_encrypted.toLowerCase() !== 'no email provided';
            
            if (emailFilter === 'has_email') {
                matches = matches && hasEmail;
            } else if (emailFilter === 'no_email') {
                matches = matches && !hasEmail;
            }
        }
        
        // Visits
        if (visitsFilter) {
            const visits = parseInt(item.visits) || 0;
            if (visitsFilter === '6+') {
                matches = matches && visits >= 6;
            } else {
                matches = matches && visits === parseInt(visitsFilter);
            }
        }
        
        // Retention
        if (retentionFilter) {
            const itemRetention = (item.data_retention || '').toLowerCase();
            const filterValue = retentionFilter.toLowerCase();
            
            if (filterValue === '7days' || filterValue === '7day') {
                matches = matches && (itemRetention === '7days' || itemRetention === '7day');
            } else if (filterValue === 'indefinite') {
                matches = matches && itemRetention === 'indefinite';
            }
        }
        
        return matches;
    });
    
    // Update UI counts
    updateArchiveCounts(allArchiveData.length, filteredArchiveData.length, activeFiltersCount);
    
    // Reset to page 1
    archiveCurrentPage = 1;
    
    // Reset decryption
    decryptedArchiveEmailMap = {};
    isAnyArchiveEmailDecrypted = false;
    
    // Render
    renderArchivePage();
}

// Update archive count displays
function updateArchiveCounts(total, filtered, activeFilters) {
    const elements = {
        'archive-filtered-count': filtered,
        'archive-total-count': total,
        'archive-results-count': filtered,
        'archive-total': total,
        'archive-active-filters-count': activeFilters
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
    
    const infoBar = document.getElementById('archive-results-info-bar');
    if (infoBar) {
        infoBar.style.display = activeFilters > 0 ? 'block' : 'none';
    }
}

// Render current page of archive (SAME STYLING AS FEEDBACK)
function renderArchivePage() {
    const tbody = document.getElementById('archive-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Get current user role
    const userRole = sessionStorage.getItem('userRole');
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredArchiveData.length / archiveItemsPerPage);
    const startIndex = (archiveCurrentPage - 1) * archiveItemsPerPage;
    const endIndex = startIndex + archiveItemsPerPage;
    const pageData = filteredArchiveData.slice(startIndex, endIndex);
    
    // Collect encrypted IDs from current page
    encryptedArchiveIds = [];
    pageData.forEach(item => {
        if (item.email_encrypted && 
            item.email_encrypted.trim() !== '' && 
            item.email_encrypted.toLowerCase() !== 'no email provided') {
            encryptedArchiveIds.push(item.id);
        }
    });
    
    // Show no data message
    if (filteredArchiveData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #64748b;">
                    ${allArchiveData.length === 0 
                        ? 'No archived feedback found. Feedback older than 3 months will appear here.'
                        : 'No results match your filters. Try adjusting your search criteria.'}
                </td>
            </tr>
        `;
        updateArchivePaginationControls(0, 0);
        updateArchiveEncryptionButtons();
        return;
    }
    
    // Render each row - EXACT SAME STYLING AS FEEDBACK
    pageData.forEach(feedback => {
        const row = tbody.insertRow();
        row.setAttribute('data-feedback-id', feedback.id);
        row.setAttribute('data-retention', feedback.data_retention || 'indefinite');
        
        // Checkbox - only for system_admin
        const checkboxCell = row.insertCell(0);
        checkboxCell.className = 'checkbox-col';
        if (userRole === 'system_admin') {
            checkboxCell.innerHTML = `<input type="checkbox" class="archive-select-checkbox" value="${feedback.id}" onchange="updateArchiveSelectionCount()">`;
        } else {
            checkboxCell.innerHTML = `<span class="text-muted">-</span>`;
        }
        
        // Name
        row.insertCell(1).textContent = feedback.name || 'Anonymous';
        
        // Email - WITH ICONS AND COLORS (same as feedback)
        const emailCell = row.insertCell(2);
        emailCell.className = 'email-cell';
        
        if (decryptedArchiveEmailMap[feedback.id]) {
            emailCell.innerHTML = `<span class="text-success font-weight-600">🔓 ${decryptedArchiveEmailMap[feedback.id]}</span>`;
        } else if (feedback.email_encrypted && 
                   feedback.email_encrypted.trim() !== '' && 
                   feedback.email_encrypted.toLowerCase() !== 'no email provided') {
            emailCell.innerHTML = `<span class="text-muted">🔒 [Encrypted]</span>`;
        } else {
            emailCell.innerHTML = `<span class="text-light-gray">No email provided</span>`;
        }
        
        // Visits
        row.insertCell(3).textContent = feedback.visits || 1;
        
        // Pledge
        const pledgeCell = row.insertCell(4);
        if (feedback.pledge && feedback.pledge.trim() !== '') {
            pledgeCell.innerHTML = `<button class="btn-view" onclick="viewPledge(${feedback.id}, '${escapeHtml(feedback.pledge)}')">View</button>`;
        } else {
            pledgeCell.innerHTML = '<span class="text-muted font-size-12">No pledge</span>';
        }
        
        // Questions & Answers
        const qaCell = row.insertCell(5);
        if (feedback.question_answers && feedback.question_answers.length > 0) {
            qaCell.innerHTML = `<button class="btn-view" onclick="viewQuestionAnswers(${feedback.id})">View</button>`;
        } else {
            qaCell.innerHTML = '<span class="text-muted font-size-12">No answers</span>';
        }
        
        // Data Retention WITH BADGES (same as feedback)
        const retentionCell = row.insertCell(6);
        const retention = feedback.data_retention || 'indefinite';
        if (retention === '7days' || retention === '7day') {
            retentionCell.innerHTML = '<span class="badge badge-warning">7 DAYS</span>';
        } else {
            retentionCell.innerHTML = '<span class="badge badge-permanent">INDEFINITE</span>';
        }
        
        // Raw Photo
        const rawPhotoCell = row.insertCell(7);
        if (feedback.photo_path) {
            rawPhotoCell.innerHTML = `<button class="btn-view" onclick="viewRawPhoto(${feedback.id})">View</button>`;
        } else {
            rawPhotoCell.innerHTML = '<span class="text-muted font-size-12">No raw photo</span>';
        }
        
        // Processed Photo
        const processedPhotoCell = row.insertCell(8);
        if (feedback.processed_photo_path) {
            processedPhotoCell.innerHTML = `<button class="btn-view" onclick="viewProcessedPhoto(${feedback.id})">View</button>`;
        } else {
            processedPhotoCell.innerHTML = '<span class="text-muted font-size-12">No processed photo</span>';
        }
        
        // Date
        row.insertCell(9).textContent = new Date(feedback.date).toLocaleString('en-SG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Actions - ROLE-BASED DELETE BUTTON
        const actionsCell = row.insertCell(10);
        
        // IT_staff: View only, cannot delete
        if (userRole === 'IT_staff') {
            actionsCell.innerHTML = `<span class="text-muted font-size-12">View only</span>`;
        } 
        // IT_admin and system_admin: Can delete
        else if (userRole === 'IT_admin' || userRole === 'system_admin') {
            actionsCell.innerHTML = `<button class="btn-delete" onclick="deleteArchiveFeedback(${feedback.id})">🗑️ Delete</button>`;
        }
        // Default fallback
        else {
            actionsCell.innerHTML = `<span class="text-muted font-size-12">-</span>`;
        }
    });
    
    updateArchivePaginationControls(filteredArchiveData.length, totalPages);
    updateArchiveEncryptionButtons();
}

// Update archive pagination controls
function updateArchivePaginationControls(totalItems, totalPages) {
    const prevBtn = document.getElementById('prev-archive-btn');
    const nextBtn = document.getElementById('next-archive-btn');
    const pageInfo = document.getElementById('archive-page-info');
    
    if (prevBtn) prevBtn.disabled = archiveCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = archiveCurrentPage >= totalPages || totalPages === 0;
    
    if (pageInfo) {
        pageInfo.textContent = totalPages > 0 
            ? `Page ${archiveCurrentPage} of ${totalPages} (${totalItems} total)`
            : 'Page 1 of 0 (0 total)';
    }
}

// Navigate archive pages
function prevArchivePage() {
    if (archiveCurrentPage > 1) {
        archiveCurrentPage--;
        decryptedArchiveEmailMap = {};
        isAnyArchiveEmailDecrypted = false;
        renderArchivePage();
    }
}

function nextArchivePage() {
    const totalPages = Math.ceil(filteredArchiveData.length / archiveItemsPerPage);
    if (archiveCurrentPage < totalPages) {
        archiveCurrentPage++;
        decryptedArchiveEmailMap = {};
        isAnyArchiveEmailDecrypted = false;
        renderArchivePage();
    }
}

function refreshArchiveData() {
    loadArchiveData();
}

// ==================== 7. FILTER CONTROLS (BOTH TABS) ====================

function toggleFeedbackAdvancedFilters() {
    const panel = document.getElementById('feedback-advanced-filters-panel');
    const icon = document.getElementById('feedback-filter-toggle-icon');
    if (panel && icon) {
        const isHidden = panel.style.display === 'none' || !panel.style.display;
        panel.style.display = isHidden ? 'block' : 'none';
        icon.textContent = isHidden ? '▲' : '▼';
    }
}

function toggleArchiveAdvancedFilters() {
    const panel = document.getElementById('archive-advanced-filters-panel');
    const icon = document.getElementById('archive-filter-toggle-icon');
    if (panel && icon) {
        const isHidden = panel.style.display === 'none' || !panel.style.display;
        panel.style.display = isHidden ? 'block' : 'none';
        icon.textContent = isHidden ? '▲' : '▼';
    }
}

function setFeedbackDateRangePreset(preset) {
    const today = new Date();
    const fromInput = document.getElementById('feedback-filter-date-from');
    const toInput = document.getElementById('feedback-filter-date-to');
    if (!fromInput || !toInput) return;
    
    toInput.value = today.toISOString().split('T')[0];
    let fromDate = new Date();
    
    if (preset === 'today') fromDate = today;
    else if (preset === 'week') fromDate.setDate(today.getDate() - 7);
    else if (preset === 'month') fromDate.setMonth(today.getMonth() - 1);
    
    fromInput.value = fromDate.toISOString().split('T')[0];
    filterFeedbackData();
}

function setArchiveDateRangePreset(preset) {
    const today = new Date();
    const fromInput = document.getElementById('archive-filter-date-from');
    const toInput = document.getElementById('archive-filter-date-to');
    if (!fromInput || !toInput) return;
    
    toInput.value = today.toISOString().split('T')[0];
    let fromDate = new Date();
    
    if (preset === 'today') fromDate = today;
    else if (preset === 'week') fromDate.setDate(today.getDate() - 7);
    else if (preset === 'month') fromDate.setMonth(today.getMonth() - 1);
    
    fromInput.value = fromDate.toISOString().split('T')[0];
    filterArchiveData();
}

function clearAllFeedbackFilters() {
    ['feedback-search-input', 'feedback-filter-date-from', 'feedback-filter-date-to',
     'feedback-filter-email', 'feedback-filter-visits', 'feedback-filter-retention'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    feedbackCurrentPage = 1;
    filterFeedbackData();
}

function clearAllArchiveFilters() {
    ['archive-search-input', 'archive-filter-date-from', 'archive-filter-date-to',
     'archive-filter-email', 'archive-filter-visits', 'archive-filter-retention'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    archiveCurrentPage = 1;
    filterArchiveData();
}

// ==================== 8. ENCRYPTION MANAGEMENT (PAGE-SPECIFIC) ====================

// Update feedback encryption buttons
function updateEncryptionButtons() {
    const decryptBtn = document.getElementById('decrypt-emails-btn');
    const reEncryptBtn = document.getElementById('re-encrypt-btn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'system_admin') {
        if (decryptBtn) decryptBtn.style.display = 'none';
        if (reEncryptBtn) reEncryptBtn.style.display = 'none';
        return;
    }
    
    // Decrypt button
    if (encryptedFeedbackIds.length > 0 && !isAnyEmailDecrypted) {
        if (decryptBtn) {
            decryptBtn.style.display = 'inline-block';
            decryptBtn.innerHTML = `🔓 Decrypt Page (${encryptedFeedbackIds.length})`;
        }
    } else {
        if (decryptBtn) decryptBtn.style.display = 'none';
    }
    
    // Re-encrypt button
    if (isAnyEmailDecrypted) {
        if (reEncryptBtn) {
            reEncryptBtn.style.display = 'inline-block';
            const count = Object.keys(decryptedEmailMap).length;
            reEncryptBtn.innerHTML = `🔒 Re-encrypt Page (${count})`;
        }
    } else {
        if (reEncryptBtn) reEncryptBtn.style.display = 'none';
    }
}

// Update archive encryption buttons
function updateArchiveEncryptionButtons() {
    const decryptBtn = document.getElementById('decrypt-archive-emails-btn');
    const reEncryptBtn = document.getElementById('re-encrypt-archive-btn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'system_admin') {
        if (decryptBtn) decryptBtn.style.display = 'none';
        if (reEncryptBtn) reEncryptBtn.style.display = 'none';
        return;
    }
    
    // Decrypt button
    if (encryptedArchiveIds.length > 0 && !isAnyArchiveEmailDecrypted) {
        if (decryptBtn) {
            decryptBtn.style.display = 'inline-block';
            decryptBtn.innerHTML = `🔓 Decrypt Page (${encryptedArchiveIds.length})`;
        }
    } else {
        if (decryptBtn) decryptBtn.style.display = 'none';
    }
    
    // Re-encrypt button
    if (isAnyArchiveEmailDecrypted) {
        if (reEncryptBtn) {
            reEncryptBtn.style.display = 'inline-block';
            const count = Object.keys(decryptedArchiveEmailMap).length;
            reEncryptBtn.innerHTML = `🔒 Re-encrypt Page (${count})`;
        }
    } else {
        if (reEncryptBtn) reEncryptBtn.style.display = 'none';
    }
}

//Decrypt all emails on current feedback page (MAX 25)
async function decryptAllEmails() {
    if (sessionStorage.getItem('userRole') !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    if (encryptedFeedbackIds.length === 0) {
        alert('No encrypted emails on this page.');
        return;
    }
    
    const password = await showPasswordPrompt(`🔓 Decrypt ${encryptedFeedbackIds.length} emails on this page? It might take a few seconds/minutes.\n\nEnter your System Admin password:`);
    if (!password) return;
    
    try {
        const username = sessionStorage.getItem('loggedUser');
        let successCount = 0;
        let passwordVerified = false;
        
        for (const feedbackId of encryptedFeedbackIds) {
            const response = await fetch('/api/admin/decrypt-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': username
                },
                body: JSON.stringify({ feedbackId, password, username })
            });
            
            const data = await response.json();
            
            // Check first response if password is wrong, stop immediately
            if (!passwordVerified) {
                if (!data.success) {
                    // Wrong password on first attempt
                    alert('❌ Incorrect password. Decryption cancelled.\n\nPlease try again with the correct System Admin password.');
                    console.error('❌ Authentication failed: Invalid password');
                    return; // Exit function don't set isAnyEmailDecrypted
                }
                passwordVerified = true;
            }
            
            if (data.success) {
                decryptedEmailMap[feedbackId] = data.decryptedEmail;
                successCount++;
            } else {
                console.warn(`⚠️ Failed to decrypt email for feedback ID: ${feedbackId}`);
            }
        }
        
        // Only set flag if at least one email was successfully decrypted
        if (successCount > 0) {
            isAnyEmailDecrypted = true;
            renderFeedbackPage();
            console.log(`✅ Successfully decrypted ${successCount} of ${encryptedFeedbackIds.length} emails`);
            
            if (successCount < encryptedFeedbackIds.length) {
                alert(`⚠️ Partially completed: ${successCount} of ${encryptedFeedbackIds.length} emails decrypted.\n\nSome emails could not be decrypted.`);
            }
        } else {
            alert('❌ No emails were decrypted. Please try again.');
            console.error('❌ Decryption failed: No emails were successfully decrypted');
        }
    } catch (error) {
        console.error('❌ Decryption error:', error);
        alert('❌ Network error occurred during decryption.\n\nPlease check your connection and try again.');
    }
}

//Decrypt all emails on current archive page (MAX 25)
async function decryptAllArchiveEmails() {
    if (sessionStorage.getItem('userRole') !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    if (encryptedArchiveIds.length === 0) {
        alert('No encrypted emails on this page.');
        return;
    }
    
    const password = await showPasswordPrompt(`🔓 Decrypt ${encryptedArchiveIds.length} emails on this page? It might take a few seconds/minutes.\n\nEnter your System Admin password:`);
    if (!password) return;
    
    try {
        const username = sessionStorage.getItem('loggedUser');
        let successCount = 0;
        let passwordVerified = false;
        
        for (const feedbackId of encryptedArchiveIds) {
            const response = await fetch('/api/admin/decrypt-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': username
                },
                body: JSON.stringify({ feedbackId, password, username })
            });
            
            const data = await response.json();
            
            // Check first response if password is wrong, stop immediately
            if (!passwordVerified) {
                if (!data.success) {
                    // Wrong password on first attempt
                    alert('❌ Incorrect password. Decryption cancelled.\n\nPlease try again with the correct System Admin password.');
                    console.error('❌ Authentication failed: Invalid password');
                    return; // Exit function - don't set isAnyArchiveEmailDecrypted
                }
                passwordVerified = true;
            }
            
            if (data.success) {
                decryptedArchiveEmailMap[feedbackId] = data.decryptedEmail;
                successCount++;
            } else {
                console.warn(`⚠️ Failed to decrypt email for feedback ID: ${feedbackId}`);
            }
        }
        
        // Only set flag if at least one email was successfully decrypted
        if (successCount > 0) {
            isAnyArchiveEmailDecrypted = true;
            renderArchivePage();
            console.log(`✅ Successfully decrypted ${successCount} of ${encryptedArchiveIds.length} archive emails`);
            
            if (successCount < encryptedArchiveIds.length) {
                alert(`⚠️ Partially completed: ${successCount} of ${encryptedArchiveIds.length} emails decrypted.\n\nSome emails could not be decrypted.`);
            }
        } else {
            alert('❌ No emails were decrypted. Please try again.');
            console.error('❌ Decryption failed: No emails were successfully decrypted');
        }
    } catch (error) {
        console.error('❌ Decryption error:', error);
        alert('❌ Network error occurred during decryption.\n\nPlease check your connection and try again.');
    }
}

//Re-encrypt feedback emails
function reEncryptAllEmails() {
    decryptedEmailMap = {};
    isAnyEmailDecrypted = false;
    renderFeedbackPage();
    console.log('🔒 All feedback emails re-encrypted');
}

//Re-encrypt archive emails
function reEncryptAllArchiveEmails() {
    decryptedArchiveEmailMap = {};
    isAnyArchiveEmailDecrypted = false;
    renderArchivePage();
    console.log('🔒 All archive emails re-encrypted');
}

// ==================== 9. PLEDGE & CONTENT VIEWING ====================

// View pledge
function viewPledge(feedbackId, pledgeText) {
    const popup = document.createElement('div');
    popup.className = 'pledge-popup';
    popup.style.cssText = `
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

    popup.innerHTML = `
        <div class="pledge-container" style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            width: 90vw;
            text-align: left;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #1e293b;">Pledge - ID: ${feedbackId}</h3>
                <button onclick="closePledgePopup()" style="
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
                overflow-y: auto;
                flex: 1;
                white-space: pre-wrap;
                line-height: 1.6;
            ">
                ${pledgeText || '<em>No pledge text available</em>'}
            </div>
            
            <div style="font-size: 12px; color: #64748b; margin-bottom: 15px; flex-shrink: 0;">
                Viewed by: ${sessionStorage.getItem('loggedUser')} at ${new Date().toLocaleTimeString()}
            </div>
            
            <button onclick="closePledgePopup()" style="
                padding: 10px 20px;
                background: #0A1E81;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                align-self: flex-end;
                flex-shrink: 0;
            ">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(popup);
}

// Close pledge popup
function closePledgePopup() {
    const popup = document.querySelector('.pledge-popup');
    if (popup) {
        popup.remove();
    }
}

// View question answers
async function viewQuestionAnswers(feedbackId) {
    try {
        const response = await fetch(`/api/admin/feedback/${feedbackId}/questions`);
        const data = await response.json();
        
        if (data.success) {
            createQuestionAnswersPopup(feedbackId, data.answers);
        } else {
            alert('Error loading question answers: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading question answers:', error);
        alert('Error loading question answers: ' + error.message);
    }
}

// Create Q&A popup
function createQuestionAnswersPopup(feedbackId, answers) {
    const popup = document.createElement('div');
    popup.className = 'qa-popup';
    popup.style.cssText = `
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

    const answersHtml = answers && answers.length > 0 
        ? answers.map(answer => `
            <div class="qa-item" style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">${answer.question_text}</div>
                <div style="color: #475569; padding-left: 10px; border-left: 3px solid #e2e8f0;">
                    ${formatAnswer(answer.answer_value, answer.question_type)}
                </div>
            </div>
        `).join('')
        : '<div style="color: #64748b; text-align: center; padding: 40px;">No question answers available</div>';

    popup.innerHTML = `
        <div class="qa-container" style="
            background: white;
            padding: 25px;
            border-radius: 12px;
            max-width: 700px;
            max-height: 80vh;
            width: 90vw;
            text-align: left;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
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
            
            <div style="
                overflow-y: auto;
                flex: 1;
                padding-right: 10px;
            ">
                ${answersHtml}
            </div>
            
            <div style="font-size: 12px; color: #64748b; margin-top: 20px; flex-shrink: 0;">
                Viewed by: ${sessionStorage.getItem('loggedUser')} at ${new Date().toLocaleTimeString()}
            </div>
            
            <button onclick="closeQAPopup()" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #0A1E81;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                align-self: flex-end;
                flex-shrink: 0;
            ">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(popup);
}

// Format answer based on question type
function formatAnswer(answer, questionType) {
    if (!answer) return '<em>No answer provided</em>';
    
    switch(questionType) {
        case 'rating':
            const rating = parseInt(answer) || 0;
            // Display as number 1-5
            if (rating >= 1 && rating <= 5) {
                return `Rating: ${rating}/5`;
            } else {
                return `Rating: ${rating}`;
            }
        case 'yesno':
            return answer === '1' ? 'Yes' : 'No';
        case 'choice':
            return answer;
        default:
            return answer;
    }
}

// Close Q&A popup
function closeQAPopup() {
    const popup = document.querySelector('.qa-popup');
    if (popup) {
        popup.remove();
    }
}

// ==================== 10. PHOTO MANAGEMENT ====================

// View raw photo
async function viewRawPhoto(feedbackId) {
    showRawPhotoPopup(feedbackId);
}

// View processed photo 
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

// Generic function to create photo popup Same size for both raw and processed
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
                        class="modal-btn-primary font-size-11 p-6-12">
                    ⬇️ Download ${photoType}
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

// ==================== 11. EMAIL MANAGEMENT ====================

// Custom password prompt with hidden input (replacement for native prompt)
// Returns a Promise that resolves with the password or null if cancelled
function showPasswordPrompt(message) {
    return new Promise((resolve) => {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create prompt box
        const promptBox = document.createElement('div');
        promptBox.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;
        
        promptBox.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; white-space: pre-line;">${message}</div>
            </div>
            <input type="password" id="password-prompt-input" 
                placeholder="Enter password" 
                style="
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 14px;
                    box-sizing: border-box;
                    margin-bottom: 15px;
                "
            />
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="password-prompt-cancel" style="
                    padding: 8px 16px;
                    background: #e2e8f0;
                    color: #475569;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Cancel</button>
                <button id="password-prompt-ok" style="
                    padding: 8px 16px;
                    background: #0A1E81;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">OK</button>
            </div>
        `;
        
        modal.appendChild(promptBox);
        document.body.appendChild(modal);
        
        const input = document.getElementById('password-prompt-input');
        const okBtn = document.getElementById('password-prompt-ok');
        const cancelBtn = document.getElementById('password-prompt-cancel');
        
        // Focus input
        setTimeout(() => input.focus(), 100);
        
        // Handle OK button
        const handleOk = () => {
            const password = input.value;
            modal.remove();
            resolve(password || null);
        };
        
        // Handle Cancel button
        const handleCancel = () => {
            modal.remove();
            resolve(null);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        });
        
        // Handle click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
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
                background: #0A1E81;
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

// ==================== 12. OVERLAY MANAGEMENT ====================

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
                    <button class="btn-view-overlay" onclick="viewOverlay('${overlay.desktop_filename}', '${overlay.mobile_filename}', '${overlay.display_name}', '${overlay.theme_id}')">
                        🔍 Preview Both
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

// View overlay function shows both desktop and mobile
function viewOverlay(desktopImagePath, mobileImagePath, title, themeId) {
    console.log('Viewing overlay:', title);
    
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

    overlayPopup.innerHTML = `
        <div class="overlay-preview-container" style="
            background: white;
            border-radius: 12px;
            padding: 25px;
            max-width: 900px;
            max-height: 90vh;
            width: 90vw;
            height: auto;
            text-align: center;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #1e293b; font-size: 20px;">${title}</h3>
                <button onclick="closeOverlayPreview()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #64748b;
                    padding: 5px 10px;
                ">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; flex: 1;">
                <!-- Desktop Preview -->
                <div style="
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <span style="font-size: 24px;">🖥️</span>
                        <h4 style="margin: 0; color: #475569; font-size: 16px;">Desktop Version</h4>
                    </div>
                    
                    <div style="
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: white;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        padding: 15px;
                        min-height: 300px;
                    ">
                        <img src="${desktopImagePath}" 
                             alt="${title} - Desktop" 
                             style="
                                max-width: 100%;
                                max-height: 300px;
                                width: auto;
                                height: auto;
                                object-fit: contain;
                                border-radius: 4px;
                             "
                             onerror="handleOverlayImageError(this, '${title} - Desktop')">
                    </div>
                    
                    <div style="font-size: 12px; color: #64748b; margin-top: 10px; word-break: break-all;">
                        ${desktopImagePath}
                    </div>
                    
                    <button onclick="downloadOverlay('${desktopImagePath}', '${title.replace(/[^a-zA-Z0-9]/g, '_')}_desktop.png')" 
                            style="
                                margin-top: 15px;
                                padding: 8px 16px;
                                background: #0A1E81;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                width: 100%;
                            ">
                        ⬇️ Download Desktop
                    </button>
                </div>
                
                <!-- Mobile Preview -->
                <div style="
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <span style="font-size: 24px;">📱</span>
                        <h4 style="margin: 0; color: #475569; font-size: 16px;">Mobile Version</h4>
                    </div>
                    
                    <div style="
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: white;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        padding: 15px;
                        min-height: 300px;
                    ">
                        <img src="${mobileImagePath}" 
                             alt="${title} - Mobile" 
                             style="
                                max-width: 100%;
                                max-height: 300px;
                                width: auto;
                                height: auto;
                                object-fit: contain;
                                border-radius: 4px;
                             "
                             onerror="handleOverlayImageError(this, '${title} - Mobile')">
                    </div>
                    
                    <div style="font-size: 12px; color: #64748b; margin-top: 10px; word-break: break-all;">
                        ${mobileImagePath}
                    </div>
                    
                    <button onclick="downloadOverlay('${mobileImagePath}', '${title.replace(/[^a-zA-Z0-9]/g, '_')}_mobile.png')" 
                            style="
                                margin-top: 15px;
                                padding: 8px 16px;
                                background: #3b82f6;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                width: 100%;
                            ">
                        ⬇️ Download Mobile
                    </button>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 14px;">
                    <div>
                        <strong style="color: #475569; font-size: 13px;">Theme ID:</strong><br>
                        <span class="text-theme">${themeId}</span>
                    </div>
                    <div>
                        <strong style="color: #475569; font-size: 13px;">Display Name:</strong><br>
                        <span class="text-theme">${title}</span>
                    </div>
                    <div>
                        <strong style="color: #475569; font-size: 13px;">Previewed by:</strong><br>
                        <span class="text-theme">${sessionStorage.getItem('loggedUser')}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 25px; text-align: center; flex-shrink: 0;">
                <button onclick="closeOverlayPreview()" style="
                    padding: 10px 30px;
                    background: #64748b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                ">
                    Close Preview
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

// Show add overlay modal (System Admin only)
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
            max-width: 600px;
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
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Display Name *
                    </label>
                    <input type="text" id="overlay-display-name" 
                        placeholder="Enter overlay display name"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Name shown in the overlay selection menu
                    </div>
                </div>
                
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Theme ID *
                    </label>
                    <input type="text" id="overlay-theme-id" 
                        placeholder="Enter theme ID (e.g., 'christmas', 'spring')"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Unique identifier for the overlay theme
                    </div>
                </div>
                
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Display Order *
                    </label>
                    <input type="number" id="overlay-display-order" 
                        placeholder="Enter display order (e.g., 1, 2, 3)"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        min="1"
                        value="1"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Determines position in the overlay selection menu
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- Desktop Image -->
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Desktop Image *
                        </label>
                        <input type="file" id="desktop-overlay-image" 
                            accept=".png,.jpg,.jpeg,.webp"
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                            required>
                        <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                            Recommended: 1920x1080px PNG
                        </div>
                    </div>
                    
                    <!-- Mobile Image -->
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                            Mobile Image *
                        </label>
                        <input type="file" id="mobile-overlay-image" 
                            accept=".png,.jpg,.jpeg,.webp"
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                            required>
                        <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                            Recommended: 1080x1920px PNG
                        </div>
                    </div>
                </div>
                
                <div id="add-overlay-error" style="
                    color: #dc2626;
                    font-size: 13px;
                    margin-bottom: 15px;
                    display: none;
                "></div>
                
                <div id="add-overlay-success" style="
                    color: #10b981;
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
                        background: linear-gradient(135deg, #10b981, #059669);
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

// Handle overlay creation with file upload
async function handleAddOverlay(event) {
    event.preventDefault();
    
    const displayName = document.getElementById('overlay-display-name').value.trim();
    const themeId = document.getElementById('overlay-theme-id').value.trim();
    const displayOrder = document.getElementById('overlay-display-order').value;
    const desktopFileInput = document.getElementById('desktop-overlay-image');
    const mobileFileInput = document.getElementById('mobile-overlay-image');
    const errorDiv = document.getElementById('add-overlay-error');
    const successDiv = document.getElementById('add-overlay-success');
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate inputs
    if (!displayName || !themeId || !displayOrder) {
        errorDiv.textContent = 'All fields are required';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!desktopFileInput.files[0] || !mobileFileInput.files[0]) {
        errorDiv.textContent = 'Both desktop and mobile images are required';
        errorDiv.style.display = 'block';
        return;
    }
    
    const username = sessionStorage.getItem('loggedUser');
    const userRole = sessionStorage.getItem('userRole');
    
    if (userRole !== 'system_admin') {
        errorDiv.textContent = 'Access denied. System Administrator privileges required.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('display_name', displayName);
        formData.append('theme_id', themeId);
        formData.append('display_order', displayOrder);
        formData.append('desktop_file', desktopFileInput.files[0]);
        formData.append('mobile_file', mobileFileInput.files[0]);
        formData.append('username', username);
        
        const response = await fetch('/api/admin/overlays', {
            method: 'POST',
            headers: {
                'x-username': username
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = '✅ Overlay added successfully!';
            successDiv.style.display = 'block';
            
            // Clear form after successful upload
            document.getElementById('overlay-display-name').value = '';
            document.getElementById('overlay-theme-id').value = '';
            document.getElementById('overlay-display-order').value = '1';
            desktopFileInput.value = '';
            mobileFileInput.value = '';
            
            // Refresh overlay data after a delay
            setTimeout(() => {
                closeAddOverlayModal();
                loadOverlayData();
            }, 1500);
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

// Delete overlay (System Admin only)
async function deleteOverlay(overlayId) {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete this overlay? This action cannot be undone.`)) {
        await performOverlayDeletion(overlayId);
    }
}

// Execute overlay deletion
async function performOverlayDeletion(overlayId) {
    const username = sessionStorage.getItem('loggedUser');
    
    try {
        const response = await fetch(`/api/admin/overlays/${overlayId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-username': username
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Overlay deleted successfully!');
            loadOverlayData();
        } else {
            alert('❌ Failed to delete overlay: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting overlay:', error);
        alert('❌ Error deleting overlay: ' + error.message);
    }
}

// ==================== 13. USER MANAGEMENT (UPDATED WITH SOFT DELETE 2026-01-09) ====================

// Track current user management tab
let currentUserTab = 'active'; // 'active' or 'deleted'

// Switch between active and deleted users tabs
function switchUserTab(tab) {
    currentUserTab = tab;
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.user-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide sections
    const activeSection = document.getElementById('active-users-section');
    const deletedSection = document.getElementById('deleted-users-section');
    
    if (tab === 'active') {
        activeSection.style.display = 'block';
        deletedSection.style.display = 'none';
        loadActiveUsers();
    } else {
        activeSection.style.display = 'none';
        deletedSection.style.display = 'block';
        loadDeletedUsers();
    }
}

// Load user management data (wrapper function)
async function loadUserManagementData() {
    // Load based on current tab
    if (currentUserTab === 'active') {
        await loadActiveUsers();
    } else {
        await loadDeletedUsers();
    }
}

// Load active users
async function loadActiveUsers() {
    try {
        console.log('👤 Loading active users...');
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Active users API response:', data);
        
        if (data.success && data.users) {
            updateActiveUsersTable(data.users);
        } else {
            alert('Error loading active users: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading active users:', error);
        alert('Error connecting to server: ' + error.message);
    }
}

// Load deleted users
async function loadDeletedUsers() {
    try {
        console.log('🗑️ Loading deleted users...');
        const response = await fetch('/api/admin/users/deleted');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Deleted users API response:', data);
        
        if (data.success && data.users) {
            updateDeletedUsersTable(data.users);
        } else {
            alert('Error loading deleted users: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error loading deleted users:', error);
        alert('Error connecting to server: ' + error.message);
    }
}

// Update active users table
function updateActiveUsersTable(usersData) {
    const tbody = document.getElementById('active-users-tbody');
    if (!tbody) {
        console.error('Active users table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">👤</div>
                    <h3 style="color: #64748b; margin-bottom: 10px;">No Active Users Found</h3>
                    <p>No active user data available.</p>
                    <button class="btn-primary" onclick="loadActiveUsers()" style="margin-top: 15px;">
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
        const isProtectedRootUser = safeUser.username === 'systemadmin';
        const canEdit = isSystemAdmin && !isProtectedRootUser;
        const canDelete = isSystemAdmin && !isProtectedRootUser && !isCurrentUser;
        
        row.innerHTML = `
            <td>
                ${safeUser.username}
                ${isProtectedRootUser ? ' <span style="color: #10b981; font-size: 10px; margin-left: 5px;">(ROOT)</span>' : ''}
            </td>
            <td>${safeUser.full_name}</td>
            <td>${formatRoleName(safeUser.role)}</td>
            <td>${safeUser.department}</td>
            <td>
                <span class="badge ${safeUser.is_active ? 'badge-active' : 'badge-warning'}">
                    ${safeUser.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </td>
            <td>
                ${canEdit ? `
                    <button class="btn-edit" onclick="editUser(${safeUser.id}, '${safeUser.username}', '${safeUser.role}', '${safeUser.full_name.replace(/'/g, "\\'")}')">
                        Edit
                    </button>
                ` : ''}
                ${canDelete ? `
                    <button class="btn-delete" onclick="deleteUser(${safeUser.id}, '${safeUser.username}')">
                        Delete
                    </button>
                ` : ''}
                ${!canEdit && !canDelete ? `
                    <span class="text-muted font-size-12">${isProtectedRootUser ? 'Protected' : 'No actions'}</span>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update deleted users table
function updateDeletedUsersTable(usersData) {
    const tbody = document.getElementById('deleted-users-tbody');
    if (!tbody) {
        console.error('Deleted users table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                    <h3 style="color: #64748b; margin-bottom: 10px;">No Deleted Users</h3>
                    <p>There are no deleted users to display.</p>
                </td>
            </tr>
        `;
        return;
    }
    
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
            is_active: user.is_active !== undefined ? user.is_active : 1,
            deleted_at: user.deleted_at,
            deleted_by: user.deleted_by || 'Unknown'
        };
        
        const isProtectedRootUser = safeUser.username === 'systemadmin';
        const canRestore = isSystemAdmin && !isProtectedRootUser;
        const canPermanentDelete = isSystemAdmin && !isProtectedRootUser;
        
        const deletedDate = safeUser.deleted_at ? new Date(safeUser.deleted_at).toLocaleDateString() : 'Unknown';
        
        row.innerHTML = `
            <td>
                ${safeUser.username}
                ${isProtectedRootUser ? ' <span style="color: #10b981; font-size: 10px; margin-left: 5px;">(ROOT)</span>' : ''}
            </td>
            <td>
                ${safeUser.full_name}
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                    Deleted: ${deletedDate} by ${safeUser.deleted_by}
                </div>
            </td>
            <td>${formatRoleName(safeUser.role)}</td>
            <td>${safeUser.department}</td>
            <td>
                <span class="badge badge-danger">
                    DELETED
                </span>
            </td>
            <td>
                ${canRestore ? `
                    <button class="btn-success" onclick="restoreUser(${safeUser.id}, '${safeUser.username}')" style="background: #10b981;">
                        🔄 Restore
                    </button>
                ` : ''}
                ${canPermanentDelete ? `
                    <button class="btn-delete" onclick="permanentDeleteUser(${safeUser.id}, '${safeUser.username}')">
                        🗑️ Permanent Delete
                    </button>
                ` : ''}
                ${!canRestore && !canPermanentDelete ? `
                    <span class="text-muted font-size-12">No actions</span>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Legacy function for backward compatibility
function updateUserManagementTable(usersData) {
    updateActiveUsersTable(usersData);
}

// Add new user
function addUser() {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
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
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Username *
                    </label>
                    <input type="text" id="add-username" 
                        placeholder="Enter username"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Must be unique (lowercase letters, numbers, underscore)
                    </div>
                </div>
                
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Full Name *
                    </label>
                    <input type="text" id="add-full-name" 
                        placeholder="Enter full name"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        This name will be displayed in the admin panel
                    </div>
                </div>
                
                <div class="form-group" class="mb-20">
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
                        <option value="">Select a role</option>
                        <option value="system_admin">System Admin</option>
                        <option value="IT_admin">IT Admin</option>
                        <option value="IT_staff">IT Staff</option>
                    </select>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Select the user role and permissions
                    </div>
                </div>
                
                <div class="form-group" style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Password *
                    </label>
                    <input type="password" id="add-user-password" 
                        placeholder="Enter secure password"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Minimum 8 characters recommended
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

// Handle add user form submission
async function handleAddUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('add-username').value.trim();
    const fullName = document.getElementById('add-full-name').value.trim();
    const role = document.getElementById('add-user-role').value;
    const password = document.getElementById('add-user-password').value;
    const errorDiv = document.getElementById('add-user-error');
    
    // Validate inputs
    if (!username || !fullName || !role || !password) {
        errorDiv.textContent = 'All fields are required';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username must contain only lowercase letters, numbers, and underscores';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': sessionStorage.getItem('loggedUser')
            },
            body: JSON.stringify({
                username,
                full_name: fullName,
                role,
                password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ User added successfully!');
            closeAddUserModal();
            loadActiveUsers(); // Reload active users
        } else {
            errorDiv.textContent = data.error || 'Failed to add user';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error adding user:', error);
        errorDiv.textContent = 'Error connecting to server: ' + error.message;
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

// Edit user - UPDATED to pass full_name
function editUser(userId, username, currentRole, fullName) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    // Check if trying to edit protected root account
    if (username === 'systemadmin') {
        alert('⚠️ The root account "systemadmin" cannot be edited. This is a protected system account.');
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
                <div class="form-group" class="mb-20">
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
                
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Full Name
                    </label>
                    <input type="text" id="edit-full-name" 
                        value="${fullName || ''}"
                        placeholder="Enter full name"
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px;"
                        required>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        This name will be displayed in the admin panel
                    </div>
                </div>
                
                <div class="form-group" class="mb-20">
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
                        <option value="system_admin" ${currentRole === 'system_admin' ? 'selected' : ''}>System Admin</option>
                        <option value="IT_admin" ${currentRole === 'IT_admin' ? 'selected' : ''}>IT Admin</option>
                        <option value="IT_staff" ${currentRole === 'IT_staff' ? 'selected' : ''}>IT Staff</option>
                    </select>
                    <div style="font-size: 12px; color: #64748b; margin-top: 5px;">
                        Select the user role and permissions
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
                        background: linear-gradient(135deg, #0A1E81, #764ba2);
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

// Handle edit user form submission
async function handleEditUser(event, userId) {
    event.preventDefault();
    
    const username = document.getElementById('edit-username').value.trim();
    const fullName = document.getElementById('edit-full-name').value.trim();
    const role = document.getElementById('edit-user-role').value;
    const password = document.getElementById('edit-user-password').value;
    const errorDiv = document.getElementById('edit-user-error');
    
    // Validate inputs
    if (!username || !fullName || !role) {
        errorDiv.textContent = 'Username, display name, and role are required';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username)) {
        errorDiv.textContent = 'Username must contain only lowercase letters, numbers, and underscores';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password if provided
    if (password && password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const updateData = {
            username,
            full_name: fullName,
            role
        };
        
        // Only include password if provided
        if (password) {
            updateData.password = password;
        }
        
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-username': sessionStorage.getItem('loggedUser')
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ User updated successfully!');
            closeEditUserModal();
            loadActiveUsers(); // Reload active users
        } else {
            errorDiv.textContent = data.error || 'Failed to update user';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error updating user:', error);
        errorDiv.textContent = 'Error connecting to server: ' + error.message;
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

// Delete user (soft delete)
async function deleteUser(userId, username) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    const currentUser = sessionStorage.getItem('loggedUser');
    
    // Check if trying to delete protected root account
    if (username === 'systemadmin') {
        alert('❌ The root account "systemadmin" cannot be deleted. This is a protected system account.');
        return;
    }
    
    // Check if trying to delete own account
    if (username === currentUser) {
        alert('⚠️ You cannot delete your own account!');
        return;
    }
    
    // inform user about soft delete
    if (confirm(`Are you sure you want to delete the user "${username}"?\n\n✅ This is a soft delete - the user will be moved to "Deleted Users" and can be restored later.`)) {
        await performUserDeletion(userId, username);
    }
}

// Perform user deletion (soft delete)
async function performUserDeletion(userId, username) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-username': sessionStorage.getItem('loggedUser')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ User "${username}" has been moved to Deleted Users.\n\nYou can restore this user from the "Deleted Users" tab.`);
            loadActiveUsers(); // Reload active users
        } else {
            alert(`❌ Failed to delete user "${username}": ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`❌ Error deleting user "${username}": ${error.message}`);
    }
}

// Restore deleted user
async function restoreUser(userId, username) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    if (confirm(`Are you sure you want to restore the user "${username}"?\n\n✅ This will move them back to Active Users.`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': sessionStorage.getItem('loggedUser')
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ User "${username}" has been restored successfully!`);
                loadDeletedUsers(); // Reload deleted users list
            } else {
                alert(`❌ Failed to restore user "${username}": ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error restoring user:', error);
            alert(`❌ Error restoring user "${username}": ${error.message}`);
        }
    }
}

// Permanently delete user (hard delete - cannot be undone)
async function permanentDeleteUser(userId, username) {
    const currentUserRole = sessionStorage.getItem('userRole');
    if (currentUserRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    // Double confirmation for permanent deletion
    const firstConfirm = confirm(
        `⚠️ WARNING: PERMANENT DELETION\n\n` +
        `You are about to PERMANENTLY delete the user "${username}".\n\n` +
        `This action CANNOT be undone. The user data will be removed from the database forever.\n\n` +
        `Are you absolutely sure?`
    );
    
    if (!firstConfirm) {
        return;
    }
    
    const secondConfirm = confirm(
        `⚠️ FINAL CONFIRMATION\n\n` +
        `Type confirmation: Are you 100% sure you want to permanently delete "${username}"?\n\n` +
        `Click OK to permanently delete, or Cancel to abort.`
    );
    
    if (!secondConfirm) {
        alert('❌ Permanent deletion cancelled.');
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/permanent`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-username': sessionStorage.getItem('loggedUser')
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ User "${username}" has been permanently deleted from the database.`);
            loadDeletedUsers(); // Reload deleted users list
        } else {
            alert(`❌ Failed to permanently delete user "${username}": ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error permanently deleting user:', error);
        alert(`❌ Error permanently deleting user "${username}": ${error.message}`);
    }
}

// Helper function for fallback data (development only)
function getFallbackUsers() {
    return [
        {
            id: 1,
            username: 'systemadmin',
            full_name: 'System Administrator',
            role: 'system_admin',
            department: 'IT',
            is_active: 1
        }
    ];
}

// Helper function to format role names
function formatRoleName(role) {
    const roleMap = {
        'system_admin': 'System Admin',
        'IT_admin': 'IT Admin',
        'IT_staff': 'IT Staff'
    };
    return roleMap[role] || role;
}

// ==================== 14. QUESTION MANAGEMENT ====================

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
    
    // Store questions data in global map for access by edit function
    window.questionsDataMap.clear();
    
    questionsData.forEach(question => {
        // Store full question data in map
        window.questionsDataMap.set(question.id, question);
        
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-text">${question.question_text}</div>
                <div class="question-actions">
                    <button class="btn-edit" onclick="editQuestionById(${question.id})">Edit</button>
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
        'rating': 'Rating (1-5)',
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
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Text *
                    </label>
                    <textarea id="question-text" 
                        placeholder="Enter your question here..."
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; min-height: 80px;"
                        required></textarea>
                </div>
                
                <div class="form-group" class="mb-20">
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
                        <option value="rating">Rating (1-5)</option>
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
                            <option value="0" selected>No</option>
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
                        background: linear-gradient(135deg, #0A1E81, #764ba2);
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
    optionDiv.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        align-items: center;
    `;
    
    optionDiv.innerHTML = `
        <input type="text" placeholder="Option label" 
            style="flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;"
            required>
        <input type="number" placeholder="Order" value="0" min="0"
            style="width: 80px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <button type="button" class="remove-option" onclick="removeOptionField(this)" style="
            background: #fecaca;
            color: #dc2626;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 13px;
        ">Remove</button>
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


function editQuestionById(questionId) {
    const question = window.questionsDataMap.get(questionId);
    if (!question) {
        console.error('Question not found:', questionId);
        alert('Error: Question data not found. Please refresh the page.');
        return;
    }
    
    editQuestion(
        question.id,
        question.question_text,
        question.question_type,
        question.is_required,
        question.display_order,
        question.is_active,
        question.options || []
    );
}

// Edit question modal
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
                    <strong style="margin: 0; font-size: 13px; color: #3e3e3eff; line-height: 1.4;">Historical data protection:</strong> 
                    <p>
                        <strong style="color: #626262ff; font-size: 13px;">Existing answers will maintain their original question context. 
                    Changes only affect new submissions.</strong>
                    </p>
                </p>
            </div>
            
            <form id="edit-question-form" onsubmit="handleEditQuestion(event, ${questionId})">
                <div class="form-group" class="mb-20">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                        Question Text
                    </label>
                    <textarea id="edit-question-text" 
                        placeholder="Enter your question here..."
                        style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; min-height: 80px;"
                        required>${currentQuestionText}</textarea>
                </div>
                
                <!-- QUESTION TYPE LOCKED -->
                <div class="form-group" class="mb-20">
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
                <div class="mb-20">
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
                        background: linear-gradient(135deg, #0A1E81, #764ba2);
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

// ==================== 15. DATA EXPORT MANAGEMENT ====================

// Initialize data export page when tab is clicked
function initDataExportPage() {
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user is system admin
    if (userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        showPage('dashboard');
        return false;
    }
    
    // Pre-fill username
    const username = sessionStorage.getItem('loggedUser');
    document.getElementById('export-username').value = username;
    
    // Show password panel by default
    document.getElementById('data-export-password-panel').style.display = 'flex';
    document.getElementById('data-export-cards').style.display = 'none';
    
    return true;
}

// Unlock data export with password
async function unlockDataExport(event) {
    event.preventDefault();
    
    const username = sessionStorage.getItem('loggedUser');
    const userRole = sessionStorage.getItem('userRole');
    const password = document.getElementById('export-password').value;
    const errorDiv = document.getElementById('export-unlock-error');
    
    // Check if user is system admin
    if (userRole !== 'system_admin') {
        errorDiv.textContent = 'Access denied. System Administrator privileges required.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!password) {
        errorDiv.textContent = 'Please enter your password';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/admin/data-export/unlock', {
            method: 'POST',
            credentials: 'same-origin', // Include session cookie
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store unlock status
            dataExportUnlocked = true;
            dataExportUnlockTime = new Date();
            
            // Hide password panel, show export cards
            document.getElementById('data-export-password-panel').style.display = 'none';
            document.getElementById('data-export-cards').style.display = 'block';
            
            // Update session info
            updateExportSessionInfo(30); // 30 minutes
            
            // Clear password field
            document.getElementById('export-password').value = '';
            errorDiv.style.display = 'none';
            
            console.log('✅ Data export unlocked for 30 minutes');
        } else {
            errorDiv.textContent = data.error || 'Invalid password';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error unlocking data export:', error);
        errorDiv.textContent = 'Error connecting to server';
        errorDiv.style.display = 'block';
    }
}

// Update session info display
function updateExportSessionInfo(expiresInMinutes) {
    const infoElement = document.getElementById('export-session-info');
    if (infoElement) {
        const expiryTime = new Date(Date.now() + expiresInMinutes * 60000);
        infoElement.textContent = `Session expires at ${expiryTime.toLocaleTimeString()}`;
    }
}

// Download export file (CSV or ZIP)
async function downloadExport(exportType) {
    try {
        const username = sessionStorage.getItem('loggedUser');
        const userRole = sessionStorage.getItem('userRole');
        
        if (!username || userRole !== 'system_admin') {
            alert('System Administrator privileges required');
            return;
        }
        
        console.log(`🔥 Downloading export: ${exportType}`);
        
        const response = await fetch(`/api/admin/data-export/${exportType}`, {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Download failed');
        }
        
        // Get filename from Content-Disposition header or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'export.csv';
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename=(.+)/);
            if (match) {
                filename = match[1].replace(/['"]/g, '');
            }
        }
        
        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log(`✅ Download complete: ${filename}`);
        
    } catch (error) {
        console.error('❌ Download error:', error);
        alert('Error downloading export: ' + error.message);
    }
}

// ==================== 16. FEEDBACK DELETION ====================

// Delete feedback with password verification
async function deleteFeedback(feedbackId) {
    currentDeleteFeedbackId = feedbackId;
    showDeletePasswordModal();
}

// Delete archive feedback (placeholder)
async function deleteArchiveFeedback(feedbackId) {
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

// ==================== 17. NAVIGATION & PAGE MANAGEMENT ====================

// Show page with role-based access control
function showPage(pageName) {
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user is trying to access admin pages without system_admin role
    const adminPages = ['overlay', 'users', 'audit', 'questions', 'vip', 'archive', 'data-export'];
    if (adminPages.includes(pageName) && userRole !== 'system_admin') {
        alert('Access denied. System Administrator privileges required.');
        return;
    }
    
    // Special handling for data export page
    if (pageName === 'data-export') {
        if (!initDataExportPage()) {
            return;
        }
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
    if (event && event.target) {
        event.target.closest('.nav-item').classList.add('active');
    }
    
    // Load data for specific pages
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'feedback-data') {
        loadFeedbackData();
    } else if (pageName === 'digital-tree') {
        loadDigitalTreeData();
    } else if (pageName === 'leaderboard') {
        loadAdminLeaderboard();
    } else if (pageName === 'overlay') {
        loadOverlayData();
    } else if (pageName === 'users') {
        loadUserManagementData();
    } else if (pageName === 'vip') {
        loadVipManagementData();
    } else if (pageName === 'questions') {
        loadQuestionManagementData();
    } else if (pageName === 'audit') {
        loadAuditLogs();
    } else if (pageName === 'archive') {
        loadArchiveData();
        initializeDeletionControls();
    } else if (pageName === 'theme-settings') {
        initThemeSettings();
    }
}

// Initialize archive page
function initializeArchivePage() {
    loadArchiveData();
    initializeDeletionControls();
}

// ==================== 18. DIGITAL TREE MANAGEMENT ====================

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

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 25. INITIALIZATION & EVENT HANDLERS ====================

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking login status...');
    const loggedUser = sessionStorage.getItem('loggedUser');
    if (loggedUser) {
        console.log('User already logged in:', loggedUser);
        const userRole = sessionStorage.getItem('userRole');
        updateUIForUser(loggedUser, userRole);
        
        // Load user's theme settings on page load
        console.log('🎨 Loading user theme settings...');
        
        // Load theme from localStorage
        if (typeof loadThemeSettings === 'function') {
            loadThemeSettings();
        }
        
        // Load individual page settings
        if (typeof loadIndividualPageSettings === 'function') {
            loadIndividualPageSettings();
        }
        
        // Apply the theme
        if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
            console.log('✅ User theme applied on page load');
        }
        
        // Load dashboard data
        loadDashboardData();
        
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    } else {
        console.log('No user logged in');
    }
});

// ==================== 19. UTILITY FUNCTIONS ====================

// Add spinner animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ==================== 20. THEME SETTINGS - HELPER FUNCTIONS ====================

// Expands pattern selectors into actual selector arrays
// Patterns support:
// - '*-page' → matches all elements with IDs ending in '-page'
// - 'page-*' → matches all elements with IDs starting with 'page-'
// - '*-page .class' → matches pattern IDs with descendant selectors

function expandSelectorPatterns(config) {
    if (!config) return [];
    
    // If it's already an array, return it
    if (Array.isArray(config)) {
        return config;
    }
    
    // If it's an object with pattern/explicit structure
    const result = [];
    
    // Add explicit selectors first
    if (config.explicit && Array.isArray(config.explicit)) {
        result.push(...config.explicit);
    }
    
    // Expand auto patterns
    if (config.auto && Array.isArray(config.auto)) {
        config.auto.forEach(pattern => {
            const expanded = expandPattern(pattern);
            result.push(...expanded);
        });
    }
    
    return result;
}

// Expands a single pattern into matching selectors
function expandPattern(pattern) {
    const pageIds = [
        'dashboard-page',
        'feedback-data-page',
        'digital-tree-page',
        'overlay-page',
        'questions-page',
        'users-page',
        'archive-page',
        'audit-page',
        'data-export-page',
        'theme-settings-page'
    ];
    
    // Handle '*-page' pattern
    if (pattern === '*-page') {
        return pageIds.map(id => `#${id}`);
    }
    
    // Handle '*-page descendant' pattern (e.g., '*-page .page-header h2')
    const descendantMatch = pattern.match(/^\*-page\s+(.+)$/);
    if (descendantMatch) {
        const descendant = descendantMatch[1];
        return pageIds.map(id => `#${id} ${descendant}`);
    }
    
    // Handle '*-page-specific' pattern (e.g., '*-page-specific .section-header h3')
    const specificMatch = pattern.match(/^\*-page-specific\s+(.+)$/);
    if (specificMatch) {
        const descendant = specificMatch[1];
        // Exclude login-page and admin-dashboard from page-specific patterns
        const specificPages = pageIds.filter(id => id !== 'login-page');
        return specificPages.map(id => `#${id} ${descendant}`);
    }
    
    // If no pattern matches, return the original
    return [pattern];
}

// Validates that selectors actually exist in the DOM
function validateSelectors(selectorMapping) {
    const results = {
        total: 0,
        found: 0,
        missing: [],
        suggestions: []
    };
    
    // Collect all selectors
    const allSelectors = new Set();
    
    Object.keys(selectorMapping).forEach(sectionId => {
        const section = selectorMapping[sectionId];
        Object.keys(section).forEach(category => {
            Object.keys(section[category]).forEach(optionId => {
                const config = section[category][optionId];
                const selectors = expandSelectorPatterns(config);
                selectors.forEach(sel => allSelectors.add(sel));
            });
        });
    });
    
    // Test each unique selector
    allSelectors.forEach(selector => {
        results.total++;
        
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.found++;
            } else {
                results.missing.push(selector);
                
                // Try to suggest corrections for common typos
                const suggestion = suggestCorrection(selector, allSelectors);
                if (suggestion) {
                    results.suggestions.push({
                        selector: selector,
                        suggestion: suggestion
                    });
                }
            }
        } catch (e) {
            // Invalid selector syntax
            results.missing.push(selector);
            console.error(`Invalid selector syntax: ${selector}`, e);
        }
    });
    
    return results;
}

// Suggests corrections for typos in selectors
function suggestCorrection(selector, allSelectors) {
    // Simple Levenshtein distance for suggestions
    const candidates = Array.from(allSelectors).filter(s => s !== selector);
    
    let bestMatch = null;
    let bestDistance = Infinity;
    
    candidates.forEach(candidate => {
        const distance = levenshteinDistance(selector, candidate);
        if (distance < bestDistance && distance <= 3) {
            bestDistance = distance;
            bestMatch = candidate;
        }
    });
    
    return bestMatch;
}

// Simple Levenshtein distance algorithm
function levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[b.length][a.length];
}

// ==================== 21. THEME CONFIGURATION ====================

const themeConfig = {
    sections: [
        { id: 'saved-themes', name: 'Saved Themes', icon: '💾', isSavedThemes: true }, 
        { id: 'global', name: 'Admin Overall Theme', icon: '🌐', isGlobal: true },
        { id: 'admin-dashboard', name: 'Admin Panel (Header + Sidebar)', icon: '⚙️' },
        { id: 'dashboard-page', name: 'Dashboard', icon: '📊' },
        { id: 'feedback-data-page', name: 'Feedback Data', icon: '💬' },
        { id: 'digital-tree-page', name: 'Digital Tree', icon: '🌳' },
        { id: 'leaderboard-page', name: 'Leaderboard', icon: '🏆' },
        { id: 'overlay-page', name: 'Overlay Management', icon: '🎨', requiredRole: 'system_admin' },
        { id: 'questions-page', name: 'Question Management', icon: '❓', requiredRole: 'system_admin' },
        { id: 'users-page', name: 'User Management', icon: '👥', requiredRole: 'system_admin' },
        { id: 'archive-page', name: 'Archive', icon: '📚', requiredRole: 'system_admin' },
        { id: 'audit-page', name: 'Audit Logs', icon: '📋', requiredRole: 'system_admin' },
        { id: 'data-export-page', name: 'Data Export', icon: '📦', requiredRole: 'system_admin' },
        { id: 'theme-settings-page', name: 'Style & Theme Settings', icon: '🎨' }
    ],
    
    // Selector mapping grouped
    selectorMapping: {
        // GLOBAL THEME - Affects ALL pages and elements
        'global': {
            general: {
                'page-background': {
                    auto: ['*-page'],
                    explicit: [
                        '#theme-settings-page .theme-preview',
                        'body',
                        '.page-content'
                    ]
                },
                'primary-text': {
                    auto: ['*-page .page-header h2'],
                    explicit: [
                        '.section-header h3',
                        '.page-header h2',
                        'h1', 'h2', 'h3',
                        '#admin-dashboard .header-left h1',
                        '#admin-dashboard .username'
                    ]
                },
                'secondary-text': {
                    auto: ['*-page .page-header p'],
                    explicit: [
                        '.page-header p',
                        'p',
                        '.description',
                        '.subtitle',
                        '#admin-dashboard .header-left p',
                        '#admin-dashboard .user-role'
                    ]
                }
            },
            header: {
                'admin-header-bg': ['#admin-dashboard .admin-header'],
                'primary-header-text': ['#admin-dashboard .header-left h1', '#admin-dashboard .username'],
                'secondary-header-text': ['#admin-dashboard .header-left p', '#admin-dashboard .user-role']
            },
            navbar: {
                'navbar-background': ['#admin-dashboard .sidebar'],
                'navbar-primary-text': ['#admin-dashboard .sidebar-section h3'],
                'navbar-secondary-text': ['#admin-dashboard .nav-item'],
                'navbar-active-selection': ['#admin-dashboard .nav-item.active'],
                'navbar-hover': ['#admin-dashboard .nav-item:hover']
            },
            card: {
                'card-background': {
                    explicit: [
                        '#dashboard-page .stat-card',
                        '#dashboard-page .activity-section',
                        '#feedback-data-page .feedback-section',
                        '#digital-tree-page .tree-section',
                        '#overlay-page .overlay-section',
                        '#questions-page .user-section',
                        '#users-page .user-section',
                        '#archive-page .feedback-section',
                        '#audit-page .audit-section',
                        '#data-export-page .password-panel-card',
                        '#data-export-page .export-card',
                        '#theme-settings-page .theme-section-list',
                        '#theme-settings-page .theme-settings-form',
                        '#theme-settings-page .preview-card',
                        '.card',
                        '.stat-card',
                        '.info-card',
                        '.data-card'
                    ]
                },
                'card-header-background': {
                    explicit: ['#theme-settings-page .theme-sidebar-header', '#theme-settings-page .theme-panel-header']
                },
                'card-border-color': {
                    explicit: [
                        '#dashboard-page .stat-card',
                        '#dashboard-page .activity-section',
                        '.card',
                        '.stat-card',
                        '.info-card'
                    ]
                },
                'card-primary-text': {
                    auto: ['*-page-specific .section-header h3'],
                    explicit: [
                        '#dashboard-page .stat-value',
                        '#dashboard-page .stat-label',
                        '#dashboard-page .last-updated',
                        '#data-export-page .password-panel-card h2',
                        '#data-export-page .form-group label',
                        '#data-export-page .export-card-title',
                        '#data-export-page .export-card-description',
                        '#data-export-page .export-card-meta',
                        '#theme-settings-page .theme-sidebar-header h3',
                        '#theme-settings-page .preview-card h5',
                        '.card h3',
                        '.card h4',
                        '.card h5',
                        '.section-header h3'
                    ]
                },
                'card-secondary-text': {
                    explicit: [
                        '#data-export-page .panel-subtitle',
                        '#theme-settings-page .preview-card p',
                        '#theme-settings-page .theme-section-item',
                        '.card p',
                        '.card-description',
                        '.card-meta'
                    ]
                },
                'card-item-hover-bg': {
                    explicit: ['#theme-settings-page .theme-section-item:hover']
                },
                'card-item-hover-text': {
                    explicit: ['#theme-settings-page .theme-section-item:hover']
                },
                'card-item-active-bg': {
                    explicit: ['#theme-settings-page .theme-section-item.active']
                },
                'card-item-active-text': {
                    explicit: ['#theme-settings-page .theme-section-item.active']
                }
            },
            buttons: {
                'button-color': {
                    auto: ['*-page .btn-primary', '*-page .btn-secondary'],
                    explicit: [
                        '#admin-dashboard .logout-btn',
                        '#dashboard-page .refresh-btn',
                        '#feedback-data-page #decrypt-emails-btn',
                        '#feedback-data-page #re-encrypt-btn',
                        '#feedback-data-page .btn-warning',
                        '#feedback-data-page .btn-view',
                        '#overlay-page .btn-view-overlay',
                        '#questions-page .btn-edit',
                        '#users-page .btn-edit',
                        '#archive-page .btn-warning',
                        '#archive-page #decrypt-archive-emails-btn',
                        '#archive-page #re-encrypt-archive-btn',
                        '#archive-page .btn-view',
                        '#data-export-page .export-btn',
                        '#theme-settings-page .preview-btn-primary',
                        '.btn-primary',
                        'button.btn-primary',
                        '.btn-secondary',
                        'button.btn-secondary',
                        '.btn-warning',
                        '.btn-view',
                        '.btn-edit',
                        '.btn-view-overlay',
                        '.login-btn',
                        '.logout-btn',
                        '.refresh-btn',
                        '.export-btn'
                    ]
                },
                'button-text-color': {
                    auto: ['*-page .btn-primary', '*-page .btn-secondary'],
                    explicit: [
                        '#admin-dashboard .logout-btn',
                        '#dashboard-page .refresh-btn',
                        '#feedback-data-page #decrypt-emails-btn',
                        '#feedback-data-page #re-encrypt-btn',
                        '#feedback-data-page .btn-warning',
                        '#feedback-data-page .btn-view',
                        '#overlay-page .btn-view-overlay',
                        '#questions-page .btn-edit',
                        '#users-page .btn-edit',
                        '#archive-page .btn-warning',
                        '#archive-page #decrypt-archive-emails-btn',
                        '#archive-page #re-encrypt-archive-btn',
                        '#archive-page .btn-view',
                        '#data-export-page .export-btn',
                        '#theme-settings-page .preview-btn-primary',
                        '.btn-primary',
                        'button.btn-primary',
                        '.btn-secondary',
                        'button.btn-secondary',
                        '.btn-warning',
                        '.btn-view',
                        '.btn-edit',
                        '.btn-view-overlay',
                        '.login-btn',
                        '.logout-btn',
                        '.refresh-btn',
                        '.export-btn'
                    ]
                }
            },
            badges: {
                'badge-7days-background': {
                    explicit: [
                        '#feedback-data-page .badge-warning',
                        '#archive-page .badge-warning',
                        '.badge-warning'
                    ]
                },
                'badge-7days-text': {
                    explicit: [
                        '#feedback-data-page .badge-warning',
                        '#archive-page .badge-warning',
                        '.badge-warning'
                    ]
                },
                'badge-indefinite-background': {
                    explicit: [
                        '#feedback-data-page .badge-permanent',
                        '#archive-page .badge-permanent',
                        '.badge-permanent'
                    ]
                },
                'badge-indefinite-text': {
                    explicit: [
                        '#feedback-data-page .badge-permanent',
                        '#archive-page .badge-permanent',
                        '.badge-permanent'
                    ]
                }
            },
        },
        'admin-dashboard': {
            header: {
                'admin-header-bg': ['#admin-dashboard .admin-header'],
                'primary-header-text': ['#admin-dashboard .header-left h1', '#admin-dashboard .username'],
                'secondary-header-text': ['#admin-dashboard .header-left p', '#admin-dashboard .user-role']
            },
            navbar: {
                'navbar-background': ['#admin-dashboard .sidebar'],
                'navbar-primary-text': ['#admin-dashboard .sidebar-section h3'],
                'navbar-secondary-text': ['#admin-dashboard .nav-item'],
                'navbar-active-selection': ['#admin-dashboard .nav-item.active'],
                'navbar-hover': ['#admin-dashboard .nav-item:hover']
            },
            buttons: {
                'button-color': ['#admin-dashboard .logout-btn'],
                'button-text-color': ['#admin-dashboard .logout-btn']
            }
        },
        
        'dashboard-page': {
            general: {
                'page-background': ['#dashboard-page'],
                'primary-text': ['#dashboard-page .page-header h2'],
                'secondary-text': ['#dashboard-page .page-header p']
            },
            card: {
                'card-background': ['#dashboard-page .stat-card', '#dashboard-page .activity-section'],
                'card-primary-text': ['#dashboard-page .stat-value', '#dashboard-page .section-header h3'],
                'card-secondary-text': ['#dashboard-page .stat-label', '#dashboard-page .last-updated']
            },
            buttons: {
                'button-color': ['#dashboard-page .btn-primary', '#dashboard-page .refresh-btn'],
                'button-text-color': ['#dashboard-page .btn-primary', '#dashboard-page .refresh-btn']
            }
        },
        
        'feedback-data-page': {
            general: {
                'page-background': ['#feedback-data-page'],
                'primary-text': ['#feedback-data-page .page-header h2'],
                'secondary-text': ['#feedback-data-page .page-header p']
            },
            card: {
                'card-background': ['#feedback-data-page .feedback-section'],
                'card-primary-text': ['#feedback-data-page .section-header h3']
            },
            buttons: {
                'button-color': [
                    '#feedback-data-page .btn-primary',
                    '#feedback-data-page .btn-secondary',
                    '#feedback-data-page #decrypt-emails-btn',
                    '#feedback-data-page #re-encrypt-btn',
                    '#feedback-data-page .btn-warning',
                    '#feedback-data-page .btn-view'
                ],
                'button-text-color': [
                    '#feedback-data-page .btn-primary',
                    '#feedback-data-page .btn-secondary',
                    '#feedback-data-page #decrypt-emails-btn',
                    '#feedback-data-page #re-encrypt-btn',
                    '#feedback-data-page .btn-warning',
                    '#feedback-data-page .btn-view'
                ]
            },
            badges: {
                'badge-7days-background': ['#feedback-data-page .badge-warning'],
                'badge-7days-text': ['#feedback-data-page .badge-warning'],
                'badge-indefinite-background': ['#feedback-data-page .badge-permanent'],
                'badge-indefinite-text': ['#feedback-data-page .badge-permanent']
            }
        },
        
        'digital-tree-page': {
            general: {
                'page-background': ['#digital-tree-page'],
                'primary-text': ['#digital-tree-page .page-header h2'],
                'secondary-text': ['#digital-tree-page .page-header p']
            },
            card: {
                'card-background': ['#digital-tree-page .tree-section'],
                'card-primary-text': ['#digital-tree-page .section-header h3']
            },
            buttons: {
                'button-color': ['#digital-tree-page .btn-primary'],
                'button-text-color': ['#digital-tree-page .btn-primary']
            }
        },
        
        'leaderboard-page': {
            general: {
                'page-background': ['#leaderboard-page'],
                'primary-text': ['#leaderboard-page .page-header h2'],
                'secondary-text': ['#leaderboard-page .page-header p']
            },
            card: {
                'card-background': ['#leaderboard-page .leaderboard-section'],
                'card-primary-text': ['#leaderboard-page .section-header h3']
            },
            buttons: {
                'button-color': ['#leaderboard-page .btn-primary', '#leaderboard-page .btn-secondary'],
                'button-text-color': ['#leaderboard-page .btn-primary', '#leaderboard-page .btn-secondary']
            }
        },
        
        'leaderboard-page': {
            general: {
                'page-background': ['#leaderboard-page'],
                'primary-text': ['#leaderboard-page .page-header h2'],
                'secondary-text': ['#leaderboard-page .page-header p']
            },
            card: {
                'card-background': ['#leaderboard-page .leaderboard-section'],
                'card-primary-text': ['#leaderboard-page .section-header h3']
            },
            buttons: {
                'button-color': ['#leaderboard-page .btn-primary', '#leaderboard-page .btn-secondary'],
                'button-text-color': ['#leaderboard-page .btn-primary', '#leaderboard-page .btn-secondary']
            }
        },
        
        'overlay-page': {
            general: {
                'page-background': ['#overlay-page'],
                'primary-text': ['#overlay-page .page-header h2'],
                'secondary-text': ['#overlay-page .page-header p']
            },
            card: {
                'card-background': ['#overlay-page .overlay-section'],
                'card-primary-text': ['#overlay-page .section-header h3']
            },
            buttons: {
                'button-color': ['#overlay-page .btn-primary', '#overlay-page .btn-view-overlay'],
                'button-text-color': ['#overlay-page .btn-primary', '#overlay-page .btn-view-overlay']
            }
        },
        
        'questions-page': {
            general: {
                'page-background': ['#questions-page'],
                'primary-text': ['#questions-page .page-header h2'],
                'secondary-text': ['#questions-page .page-header p']
            },
            card: {
                'card-background': ['#questions-page .user-section'],
                'card-primary-text': ['#questions-page .section-header h3']
            },
            buttons: {
                'button-color': ['#questions-page .btn-primary', '#questions-page .btn-edit'],
                'button-text-color': ['#questions-page .btn-primary', '#questions-page .btn-edit']
            }
        },
        
        'users-page': {
            general: {
                'page-background': ['#users-page'],
                'primary-text': ['#users-page .page-header h2'],
                'secondary-text': ['#users-page .page-header p']
            },
            card: {
                'card-background': ['#users-page .user-section'],
                'card-primary-text': ['#users-page .section-header h3']
            },
            buttons: {
                'button-color': ['#users-page .btn-primary', '#users-page .btn-edit'],
                'button-text-color': ['#users-page .btn-primary', '#users-page .btn-edit']
            }
        },
        
        'archive-page': {
            general: {
                'page-background': ['#archive-page'],
                'primary-text': ['#archive-page .page-header h2'],
                'secondary-text': ['#archive-page .page-header p']
            },
            card: {
                'card-background': ['#archive-page .feedback-section'],
                'card-primary-text': ['#archive-page .section-header h3']
            },
            buttons: {
                'button-color': [
                    '#archive-page .btn-secondary',
                    '#archive-page .btn-primary',
                    '#archive-page .btn-warning',
                    '#archive-page #decrypt-archive-emails-btn',
                    '#archive-page #re-encrypt-archive-btn',
                    '#archive-page .btn-view'
                ],
                'button-text-color': [
                    '#archive-page .btn-secondary',
                    '#archive-page .btn-primary',
                    '#archive-page .btn-warning',
                    '#archive-page #decrypt-archive-emails-btn',
                    '#archive-page #re-encrypt-archive-btn',
                    '#archive-page .btn-view'
                ]
            },
            badges: {
                'badge-7days-background': ['#archive-page .badge-warning'],
                'badge-7days-text': ['#archive-page .badge-warning'],
                'badge-indefinite-background': ['#archive-page .badge-permanent'],
                'badge-indefinite-text': ['#archive-page .badge-permanent']
            }
        },
        
        'audit-page': {
            general: {
                'page-background': ['#audit-page'],
                'primary-text': ['#audit-page .page-header h2'],
                'secondary-text': ['#audit-page .page-header p']
            },
            card: {
                'card-background': ['#audit-page .audit-section'],
                'card-primary-text': ['#audit-page .section-header h3']
            },
            buttons: {
                'button-color': ['#audit-page .btn-secondary', '#audit-page .btn-primary'],
                'button-text-color': ['#audit-page .btn-secondary', '#audit-page .btn-primary']
            }
        },
        
        'data-export-page': {
            login: {
                'data-export-login-background': ['#data-export-page'],
                'data-export-login-card-background': ['#data-export-page .password-panel-card'],
                'data-export-login-card-primary-text': ['#data-export-page .password-panel-card h2'],
                'data-export-login-card-secondary-text': ['#data-export-page .panel-subtitle'],
                'data-export-login-button-color': ['#data-export-page .password-panel-card .btn-primary'],
                'data-export-login-button-text-color': ['#data-export-page .password-panel-card .btn-primary']
            },
            general: {
                'page-background': ['#data-export-page'],
                'primary-text': ['#data-export-page .page-header h2'],
                'secondary-text': ['#data-export-page .page-header p', '#data-export-page .panel-subtitle']
            },
            card: {
                'card-background': [
                    '#data-export-page .export-card',
                    '.data-export-cards .export-card',
                    '.export-card'
                ],
                'card-primary-text': [
                    '#data-export-page .export-card-title',
                    '.data-export-cards .export-card-title',
                    '.export-card-title'
                ],
                'card-secondary-text': [
                    '#data-export-page .export-card-description',
                    '#data-export-page .export-card-meta',
                    '.data-export-cards .export-card-description',
                    '.data-export-cards .export-card-meta',
                    '.export-card-description',
                    '.export-card-meta'
                ]
            },
            buttons: {
                'button-color': ['#data-export-page .export-btn'],
                'button-text-color': ['#data-export-page .export-btn']
            }
        },
        
        'theme-settings-page': {
            general: {
                'page-background': ['#theme-settings-page', '#theme-settings-page .theme-preview'],
                'primary-text': ['#theme-settings-page .page-header h2'],
                'secondary-text': ['#theme-settings-page .page-header p']
            },
            card: {
                'card-header-background': ['#theme-settings-page .theme-sidebar-header', '#theme-settings-page .theme-panel-header'],
                'card-background': ['#theme-settings-page .theme-section-list', '#theme-settings-page .theme-settings-form', '#theme-settings-page .preview-card'],
                'card-item-hover-bg': ['#theme-settings-page .theme-section-item:hover'],
                'card-item-hover-text': ['#theme-settings-page .theme-section-item:hover'],
                'card-item-active-bg': ['#theme-settings-page .theme-section-item.active'],
                'card-item-active-text': ['#theme-settings-page .theme-section-item.active'],
                'card-item-active': ['#theme-settings-page .theme-section-item.active'],
                'card-primary-text': ['#theme-settings-page .theme-sidebar-header h3', '#theme-settings-page .preview-card h5', '#theme-settings-page .theme-panel-header h3'],
                'card-secondary-text': [
                    '#theme-settings-page .preview-card p',
                    '#theme-settings-page .theme-section-item',     
                    '#theme-settings-form .theme-group-title'        
                ],
            },
            buttons: {
                'button-color': [
                    '#theme-settings-page .btn-primary',
                    '#theme-settings-page .btn-secondary',
                    '#theme-settings-page .preview-btn-primary',
                    '#theme-settings-page .preview-btn-secondary'
                ],
                'button-text-color': [
                    '#theme-settings-page .btn-primary',
                    '#theme-settings-page .btn-secondary',
                    '#theme-settings-page .preview-btn-primary',
                    '#theme-settings-page .preview-btn-secondary'
                ]
            }
        },
        'saved-themes': {
            general: {
                'primary-text': ['#saved-themes-panel h3', '#saved-themes-panel h4'],
                'secondary-text': ['#saved-themes-panel p']
            },
            cards: {
                'card-header-background': ['.saved-theme-header']
            }
        }
    },
    
    // color options groupings
    colorOptions: {
        general: [
            { id: 'page-background', label: 'Page Background', default: '#f1f5f9', description: 'Main page background color' },
            { id: 'primary-text', label: 'Primary Text', default: '#1e293b', description: 'Main headings and important text' },
            { id: 'secondary-text', label: 'Secondary Text', default: '#64748b', description: 'Descriptions and secondary text' }
        ],
        header: [
            { id: 'admin-header-bg', label: 'Admin Header Background', default: '#ffffff', description: 'Background for admin panel header' },
            { id: 'primary-header-text', label: 'Header Primary Text', default: '#1e293b', description: 'Main text in admin header' },
            { id: 'secondary-header-text', label: 'Header Secondary Text', default: '#64748b', description: 'Secondary text in admin header' }
        ],
        navbar: [
            { id: 'navbar-background', label: 'Navbar Background', default: '#000738', description: 'Background color for sidebar navigation' },
            { id: 'navbar-primary-text', label: 'Navbar Section Headers', default: '#94a3b8', description: 'Color for navbar section headers' },
            { id: 'navbar-secondary-text', label: 'Navbar Items', default: '#475569', description: 'Color for navbar menu items' },
            { id: 'navbar-active-selection', label: 'Navbar Active Item', default: '#ede9fe', description: 'Background for active navbar item' },
            { id: 'navbar-hover', label: 'Navbar Hover', default: '#f1f5f9', description: 'Background for navbar item hover' }
        ],
        card: [
            { id: 'card-background', label: 'Card Background', default: '#ffffff', description: 'Background for cards and panels' },
            { id: 'card-header-background', label: 'Card Header Background', default: '#f8fafc', description: 'Background for card headers' },
            { id: 'card-border-color', label: 'Card Border', default: '#e2e8f0', description: 'Border color for cards' },
            { id: 'card-primary-text', label: 'Card Primary Text', default: '#1e293b', description: 'Card titles and headings' },
            { id: 'card-secondary-text', label: 'Card Body Text', default: '#64748b', description: 'Card descriptions and labels' },
            { id: 'card-third-text', label: 'Card Tertiary Text', default: '#94a3b8', description: 'Card hints and helper text' },
            { id: 'card-item-hover-bg', label: 'Card Item Hover Background', default: '#f1f5f9', description: 'Hover background for card items' },
            { id: 'card-item-hover-text', label: 'Card Item Hover Text', default: '#64748b', description: 'Hover text color for card items' },
            { id: 'card-item-active-bg', label: 'Card Item Active Background', default: '#ede9fe', description: 'Active state background for card items' },
            { id: 'card-item-active-text', label: 'Card Item Active Text', default: '#7c3aed', description: 'Active state text color for card items' }
        ],
            
        buttons: [
            { id: 'button-color', label: 'Button Background', default: '#0a1e81', description: 'Background color for buttons' },
            { id: 'button-text-color', label: 'Button Text', default: '#ffffff', description: 'Text color for buttons' }
        ],
        badges: [
            { id: 'badge-7days-background', label: '7-Day Retention Badge BG', default: '#9E0000', description: 'Background for 7-day retention badges' },
            { id: 'badge-7days-text', label: '7-Day Retention Badge Text', default: '#ffffffff', description: 'Text color for 7-day retention badges' },
            { id: 'badge-indefinite-background', label: 'Indefinite Retention Badge BG', default: '#2EAD00', description: 'Background for indefinite retention badges' },
            { id: 'badge-indefinite-text', label: 'Indefinite Retention Badge Text', default: '#ffffffff', description: 'Text color for indefinite retention badges' }
        ],
        // slider: [
        //     { id: 'card-slider-color', label: 'Toggle Slider Color', default: '#cbd5e1', description: 'Color for toggle switches' }
        // ],
        login: [
            { id: 'login-background', label: 'Login Panel Background', default: '#ffffffff', description: 'Background for the login/password panel' },
            { id: 'login-card-background', label: 'Login Card Background', default: '#ffffff', description: 'Background for the login card' },
            { id: 'login-card-primary-text', label: 'Login Card Text', default: '#1e293b', description: 'Text color for login card headings' },
            { id: 'login-card-secondary-text', label: 'Login Card Subtitle', default: '#64748b', description: 'Text color for login card subtitle' },
            { id: 'login-button-color', label: 'Login Button Color', default: '#0a1e81', description: 'Background color for login button' },
            { id: 'login-button-text-color', label: 'Login Button Text Color', default: '#ffffff', description: 'Text color for login button' }
        ]
    }
};

// Get color options available for a section
function getColorOptionsForSection(sectionId) {
    const options = [];
    const mapping = themeConfig.selectorMapping[sectionId];
    
    if (!mapping) return options;
    
    // Extract unique option IDs from the mapping
    Object.keys(mapping).forEach(category => {
        Object.keys(mapping[category]).forEach(optionId => {
            // Find the option definition
            let optionDef = null;
            
            // Search in all color option categories
            Object.keys(themeConfig.colorOptions).forEach(categoryKey => {
                const found = themeConfig.colorOptions[categoryKey].find(opt => opt.id === optionId);
                if (found) {
                    optionDef = { ...found, category: categoryKey };
                }
            });
            
            if (optionDef && !options.find(o => o.id === optionId)) {
                options.push(optionDef);
            }
        });
    });
    
    return options;
}

// Get expanded selectors for a specific color option in a section
function getSelectorsForOption(sectionId, optionId) {
    const mapping = themeConfig.selectorMapping[sectionId];
    if (!mapping) return [];
    
    // Search through all categories
    for (const category of Object.keys(mapping)) {
        if (mapping[category][optionId]) {
            return expandSelectorPatterns(mapping[category][optionId]);
        }
    }
    
    return [];
}

// ==================== 22. THEME MANAGEMENT FUNCTIONS ====================

// Store theme settings (loads from localStorage)
let themeSettings = {};
let currentSection = 'global';

// Initialize theme settings page
function initThemeSettings() {
    loadThemeSettings();
    renderSectionList();
    selectSection('global');
    applyThemeSettings();
    initSavedThemesSection();
    
    // Run validation after a short delay to ensure DOM is ready
    setTimeout(() => {
        const validationResults = validateSelectors(themeConfig.selectorMapping);
        console.log('🎨 Theme Validation Results:');
        console.log(`   ✅ ${validationResults.found}/${validationResults.total} selectors found in DOM`);
        
        if (validationResults.missing.length > 0) {
            console.warn(`   ⚠️  ${validationResults.missing.length} selectors not found:`);
            validationResults.missing.forEach(sel => console.warn(`      - ${sel}`));
        }
        
        if (validationResults.suggestions.length > 0) {
            console.log('   💡 Suggestions:');
            validationResults.suggestions.forEach(s => {
                console.log(`      "${s.selector}" → Did you mean "${s.suggestion}"?`);
            });
        }
        
        if (validationResults.missing.length === 0) {
            console.log('   ✨ All selectors validated successfully!');
        }
    }, 1000);
}

// Load theme settings from localStorage (USER-SPECIFIC)
function loadThemeSettings() {
    // Get current user ID from session
    const currentUserId = sessionStorage.getItem('userId') || 
                         sessionStorage.getItem('loggedUser');
    
    if (!currentUserId) {
        console.log('⚠️ No user logged in - using default theme');
        themeSettings = getDefaultThemeSettings();
        return;
    }
    
    // Create user-specific localStorage key
    const storageKey = `adminThemeSettings_user_${currentUserId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
        try {
            themeSettings = JSON.parse(saved);
            migrateOldColors();
            console.log(`✅ Loaded theme settings for user ${currentUserId}`);
        } catch (e) {
            console.error('Failed to parse theme settings:', e);
            themeSettings = getDefaultThemeSettings();
        }
    } else {
        console.log(`ℹ️ No saved settings for user ${currentUserId} - using defaults`);
        themeSettings = getDefaultThemeSettings();
    }
}

// Migrate old color values to new defaults
function migrateOldColors() {
    const colorMigrations = {
        '#7c3aed': '#0a1e81',
        '#0A1E81': '#0a1e81'
    };
    
    Object.keys(themeSettings).forEach(sectionId => {
        if (themeSettings[sectionId] && themeSettings[sectionId].colors) {
            const colors = themeSettings[sectionId].colors;
            
            Object.keys(colors).forEach(optionId => {
                const currentColor = colors[optionId];
                
                if (colorMigrations[currentColor]) {
                    colors[optionId] = colorMigrations[currentColor];
                    console.log(`Migrated ${sectionId}.${optionId}: ${currentColor} → ${colorMigrations[currentColor]}`);
                }
            });
        }
    });
    
    // Save with user-specific key
    const currentUserId = sessionStorage.getItem('userId') || 
                         sessionStorage.getItem('loggedUser');
    if (currentUserId) {
        const storageKey = `adminThemeSettings_user_${currentUserId}`;
        localStorage.setItem(storageKey, JSON.stringify(themeSettings));
    }
}

// Custom default theme - modify these colors to your preference
function getCustomDefaultColors() {
    return {
        // ==================== GENERAL COLORS ====================
        'page-background': '#ffffffff',            // White page background
        'primary-text': '#000000ff',               // Black primary text
        'secondary-text': '#959595ff',             // Gray secondary text
        
        // ==================== ADMIN HEADER COLORS ====================
        'admin-header-bg': '#262626',              // Dark gray header background
        'primary-header-text': '#ffffff',          // White primary header text
        'secondary-header-text': '#b0b0b0',        // Light gray secondary header text
        
        // ==================== NAVBAR COLORS ====================
        'navbar-background': '#16181d',            // Dark navbar background
        'navbar-primary-text': '#808080',          // Gray navbar section headers
        'navbar-secondary-text': '#a0a0a0',        // Light gray navbar items
        'navbar-active-selection': '#2a2d3a',      // Dark gray active item background
        'navbar-hover': '#1f2229',                 // Dark gray hover background
        
        // ==================== CARD COLORS ====================
        'card-background': '#f7f7f7ff',            // Light gray card background
        'card-header-background': '#ffffffff',     // White card header background
        'card-border-color': '#eeeeeeff',          // Light gray card border
        'card-primary-text': '#000000ff',          // Black card primary text
        'card-secondary-text': '#000000ff',        // Black card secondary text
        'card-third-text': '#808080',              // Gray card tertiary text
        'card-item-hover-bg': '#f1f5f9',           // Light blue-gray hover background
        'card-item-hover-text': '#64748b',         // Gray hover text
        'card-item-active-bg': '#ede9fe',          // Light purple active background
        'card-item-active-text': '#7c3aed',        // Purple active text
        
        // ==================== BUTTON COLORS ====================
        'button-color': '#ffffffff',               // White button background
        'button-text-color': '#000000ff',          // Black button text
        
        // ==================== BADGE COLORS ====================
        'badge-7days-background': '#9E0000',       // Red badge background (7-day retention)
        'badge-7days-text': '#ffffffff',           // White badge text (7-day retention)
        'badge-indefinite-background': '#2EAD00',  // Green badge background (indefinite)
        'badge-indefinite-text': '#ffffffff',      // White badge text (indefinite)
        
        // ==================== LOGIN PAGE COLORS ====================
        'login-background': '#ffffffff',           // White login page background
        'login-card-background': '#000000ff',      // Black login card background
        'login-card-primary-text': '#ffffff',      // White login card primary text
        'login-card-secondary-text': '#64748b',    // Gray login card subtitle
        'login-button-color': '#000000ff',         // Black login button background
        'login-button-text-color': '#ffffff',      // White login button text
    };
}

// Get default theme settings
function getDefaultThemeSettings() {
    const defaults = {};
    const customColors = getCustomDefaultColors(); // Get your custom colors
    
    themeConfig.sections.forEach(section => {
        defaults[section.id] = {
            useGlobal: section.id !== 'global',
            colors: {}
        };
        
        const options = getColorOptionsForSection(section.id);
        
        options.forEach(option => {
            // Use custom color if available, otherwise fall back to original default
            defaults[section.id].colors[option.id] = customColors[option.id] || option.default;
        });
    });
    
    return defaults;
}

// Save individual page overrides separately from global theme
// This ensures individual page settings don't get mixed between users
function saveIndividualPageSettings() {
    const currentUserId = sessionStorage.getItem('userId') || 
                         sessionStorage.getItem('loggedUser');
    
    if (!currentUserId) {
        console.error('Cannot save individual page settings: No user logged in');
        return;
    }
    
    // Extract ONLY individual page settings (not global)
    const individualSettings = {};
    
    Object.keys(themeSettings).forEach(sectionId => {
        if (sectionId !== 'global' && themeSettings[sectionId]) {
            // Only save if user has set individual colors (useGlobal = false)
            if (themeSettings[sectionId].useGlobal === false) {
                individualSettings[sectionId] = {
                    useGlobal: false,
                    colors: themeSettings[sectionId].colors || {}
                };
            } else if (themeSettings[sectionId].useGlobal === true) {
                // Save toggle state even if using global
                individualSettings[sectionId] = {
                    useGlobal: true,
                    colors: {}
                };
            }
        }
    });
    
    // Save to user-specific key
    const storageKey = `individualPageSettings_user_${currentUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(individualSettings));
    console.log(`💾 Saved individual page settings for user ${currentUserId}`, individualSettings);
}

// Load individual page overrides
function loadIndividualPageSettings() {
    const currentUserId = sessionStorage.getItem('userId') || 
                         sessionStorage.getItem('loggedUser');
    
    if (!currentUserId) {
        return;
    }
    
    const storageKey = `individualPageSettings_user_${currentUserId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
        try {
            const individualSettings = JSON.parse(saved);
            
            // Merge individual settings into themeSettings
            Object.keys(individualSettings).forEach(sectionId => {
                if (!themeSettings[sectionId]) {
                    themeSettings[sectionId] = { useGlobal: true, colors: {} };
                }
                
                // Apply individual settings
                themeSettings[sectionId].useGlobal = individualSettings[sectionId].useGlobal;
                themeSettings[sectionId].colors = individualSettings[sectionId].colors || {};
            });
            
            console.log(`✅ Loaded individual page settings for user ${currentUserId}`, individualSettings);
        } catch (e) {
            console.error('Failed to parse individual page settings:', e);
        }
    }
}

// Save theme settings to localStorage (USER-SPECIFIC)
function saveThemeSettings() {
    try {
        // Get current user ID
        const currentUserId = sessionStorage.getItem('userId') || 
                             sessionStorage.getItem('loggedUser');
        
        if (!currentUserId) {
            console.error('Cannot save theme: No user logged in');
            alert('Please log in to save theme settings');
            return;
        }
        
        // Save global theme settings
        const storageKey = `adminThemeSettings_user_${currentUserId}`;
        localStorage.setItem(storageKey, JSON.stringify(themeSettings));
        
        // ALSO save individual page settings separately
        saveIndividualPageSettings();
        
        applyThemeSettings();
        showSaveMessage();
        
        console.log(`✅ Saved theme settings for user ${currentUserId}`);
    } catch (e) {
        console.error('Failed to save theme settings:', e);
        alert('Failed to save theme settings. Please try again.');
    }
}

// Show save success message
function showSaveMessage() {
    let message = document.querySelector('.theme-save-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'theme-save-message';
        message.textContent = '✓ Theme settings saved successfully!';
        document.body.appendChild(message);
    }
    
    message.classList.add('show');
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Render section list in sidebar
function renderSectionList() {
    const container = document.getElementById('theme-section-list');
    container.innerHTML = '';
    
    // Get current user role
    const userRole = sessionStorage.getItem('userRole');
    
    // Filter sections based on role
    const visibleSections = themeConfig.sections.filter(section => {
        // If section has no requiredRole, it's visible to everyone
        if (!section.requiredRole) return true;
        
        // If section requires system_admin, only show to system_admin
        return userRole === 'system_admin';
    });
    
    visibleSections.forEach(section => {
        const item = document.createElement('div');
        item.className = 'theme-section-item';
        item.onclick = () => selectSection(section.id);
        
        item.innerHTML = `
            <span class="section-icon">${section.icon}</span>
            <span>${section.name}</span>
            ${section.isGlobal ? '<span class="section-badge">GLOBAL</span>' : ''}
        `;
        
        if (section.id === currentSection) {
            item.classList.add('active');
        }
        
        container.appendChild(item);
    });
}

// Select a section
function selectSection(sectionId) {
    currentSection = sectionId;
    renderSectionList();
    renderThemeControls(sectionId);
    updateSectionTitle(sectionId);
    
    // Special handling for saved-themes UI elements
    const overrideContainer = document.getElementById('override-toggle-container');
    const resetGlobalBtn = document.getElementById('reset-to-global-btn');
    const saveChangesBtn = document.querySelector('.btn-primary[onclick="saveThemeSettings()"]');
    const resetAllBtn = document.querySelector('.btn-secondary[onclick="resetAllToDefaults()"]');
    
    if (sectionId === 'saved-themes') {
        // Hide theme control buttons for saved-themes section
        if (overrideContainer) overrideContainer.style.display = 'none';
        if (resetGlobalBtn) resetGlobalBtn.style.display = 'none';
        if (saveChangesBtn) saveChangesBtn.style.display = 'none';
        if (resetAllBtn) resetAllBtn.style.display = 'none';
    } else {
        // Show theme control buttons for other sections
        if (saveChangesBtn) saveChangesBtn.style.display = '';
        if (resetAllBtn) resetAllBtn.style.display = '';
        // Override toggle and reset button visibility handled elsewhere
    }
}

// Update section title
function updateSectionTitle(sectionId) {
    const section = themeConfig.sections.find(s => s.id === sectionId);
    document.getElementById('current-section-title').textContent = section.name;
    
    const overrideContainer = document.getElementById('override-toggle-container');
    const resetBtn = document.getElementById('reset-to-global-btn');
    
    if (section.isGlobal) {
        overrideContainer.style.display = 'none';
        resetBtn.style.display = 'none';
    } else {
        overrideContainer.style.display = 'flex';
        resetBtn.style.display = 'inline-block';
        
        const useGlobal = themeSettings[sectionId]?.useGlobal ?? true;
        document.getElementById('use-global-theme').checked = useGlobal;
    }
}

// Render theme controls for a section
function renderThemeControls(sectionId) {
    const container = document.getElementById('theme-settings-form');
    
    // Get the saved-themes panel (it's inside the container)
    const savedThemesPanel = document.getElementById('saved-themes-panel');
    
    // SPECIAL HANDLING FOR SAVED-THEMES
    if (sectionId === 'saved-themes') {
        // Hide all other content in container (color groups, etc.)
        Array.from(container.children).forEach(child => {
            if (child.id !== 'saved-themes-panel') {
                child.style.display = 'none';
            }
        });
        
        // Show the saved-themes panel
        if (savedThemesPanel) {
            savedThemesPanel.style.display = 'block';
            
            // Initialize saved themes section
            if (typeof initSavedThemesSection === 'function') {
                initSavedThemesSection();
            } else {
                console.error('initSavedThemesSection function not found');
            }
        } else {
            console.error('saved-themes-panel element not found in HTML');
        }
        
        return; // Exit early don't render color controls
    }
    
    // Hide saved-themes panel, show color controls
    if (savedThemesPanel) {
        savedThemesPanel.style.display = 'none';
    }
    
    // Remove all children EXCEPT saved-themes-panel
    Array.from(container.children).forEach(child => {
        if (child.id !== 'saved-themes-panel') {
            child.remove();
        }
    });
    
    const section = themeConfig.sections.find(s => s.id === sectionId);
    const sectionSettings = themeSettings[sectionId] || { useGlobal: !section.isGlobal, colors: {} };
    const isDisabled = sectionSettings.useGlobal && !section.isGlobal;
    
    const options = getColorOptionsForSection(sectionId);
    
    const groupedOptions = {};
    options.forEach(option => {
        const category = option.category || 'general';
        if (!groupedOptions[category]) {
            groupedOptions[category] = [];
        }
        groupedOptions[category].push(option);
    });
    
    const categoryNames = {
        general: 'General',
        card: 'Card',
        buttons: 'Buttons',
        navbar: 'Navigation',
        adminHeader: 'Header',
        login: 'Login',
        badges: 'Badges',
        sections: 'Sections'
    };
    
    Object.keys(groupedOptions).forEach(category => {
        const groupTitle = categoryNames[category] || category;
        const group = createColorGroup(groupTitle, groupedOptions[category], sectionId, isDisabled);
        container.appendChild(group);
    });
    
    updatePreview(sectionId);
}

// Create a color group
function createColorGroup(title, options, sectionId, isDisabled) {
    const group = document.createElement('div');
    group.className = 'theme-group';
    
    const groupTitle = document.createElement('div');
    groupTitle.className = 'theme-group-title';
    groupTitle.textContent = title;
    group.appendChild(groupTitle);
    
    options.forEach(option => {
        const control = createColorControl(option, sectionId, isDisabled);
        group.appendChild(control);
    });
    
    return group;
}

// Create a color control
function createColorControl(option, sectionId, isDisabled) {
    const control = document.createElement('div');
    control.className = 'theme-control' + (isDisabled ? ' disabled' : '');
    
    const currentColor = themeSettings[sectionId]?.colors[option.id] || option.default;
    
    const selectors = getSelectorsForOption(sectionId, option.id);
    const selectorCount = selectors.length;
    
    const colorPickerValue = currentColor.length === 9 ? currentColor.substring(0, 7) : currentColor;


    control.innerHTML = `
        <div class="theme-control-label">
            <span>${option.label}</span>
            ${selectorCount > 1 ? `<span class="selector-count">(${selectorCount} elements)</span>` : ''}
        </div>
        <div class="theme-control-description">${option.description || ''}</div>
        <div class="theme-control-input">
            <div class="color-picker-wrapper">
                <input type="color" 
                    id="color-${sectionId}-${option.id}" 
                    value="${colorPickerValue}"
                    onchange="updateColor('${sectionId}', '${option.id}', this.value)"
                    ${isDisabled ? 'disabled' : ''}>
                <input type="text" 
                    class="color-hex-input" 
                    id="hex-${sectionId}-${option.id}"
                    value="${currentColor.toUpperCase()}"
                    onchange="updateColorFromHex('${sectionId}', '${option.id}', this.value)"
                    ${isDisabled ? 'disabled' : ''}
                    maxlength="9"
                    pattern="^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$">
            </div>
        </div>
    `;
    
    return control;
}

// Update color from picker
function updateColor(sectionId, colorId, value) {
    if (!themeSettings[sectionId]) {
        themeSettings[sectionId] = { useGlobal: false, colors: {} };
    }
    themeSettings[sectionId].colors[colorId] = value;
    
    const hexInput = document.getElementById(`hex-${sectionId}-${colorId}`);
    if (hexInput) {
        hexInput.value = value.toUpperCase();
    }
    
    updatePreview(sectionId);
}

// Update color from hex input
function updateColorFromHex(sectionId, colorId, value) {
    const hexRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
    if (!hexRegex.test(value)) {
        const currentColor = themeSettings[sectionId]?.colors[colorId];
        const hexInput = document.getElementById(`hex-${sectionId}-${colorId}`);
        if (hexInput && currentColor) {
            hexInput.value = currentColor.toUpperCase();
        }
        return;
    }
    
    if (!themeSettings[sectionId]) {
        themeSettings[sectionId] = { useGlobal: false, colors: {} };
    }
    themeSettings[sectionId].colors[colorId] = value.toUpperCase();
    
    const colorPicker = document.getElementById(`color-${sectionId}-${colorId}`);
    if (colorPicker) {
        colorPicker.value = value;
    }
    
    updatePreview(sectionId);
}

// Toggle global theme override for a section
function toggleGlobalThemeOverride() {
    const useGlobal = document.getElementById('use-global-theme').checked;
    
    if (!themeSettings[currentSection]) {
        themeSettings[currentSection] = { useGlobal: true, colors: {} };
    }
    
    themeSettings[currentSection].useGlobal = useGlobal;
    renderThemeControls(currentSection);
}

// Reset section to global theme
function resetSectionToGlobal() {
    if (currentSection === 'global') return;
    
    if (confirm(`Reset ${themeConfig.sections.find(s => s.id === currentSection).name} to use the Admin Overall Theme?`)) {
        themeSettings[currentSection].useGlobal = true;
        themeSettings[currentSection].colors = { ...themeSettings.global.colors };
        renderThemeControls(currentSection);
        document.getElementById('use-global-theme').checked = true;
    }
}

// Reset all to defaults
async function resetAllToDefaults() {
    if (!confirm('Reset all theme settings to default values? This will also deactivate your active theme. This cannot be undone.')) {
        return;
    }
    
    try {
        // Step 1: Deactivate active theme in database
        console.log('🔄 Deactivating active theme...');
        
        const response = await fetch('/api/admin/saved-themes/deactivate-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('✅ Active theme deactivated');
        } else {
            console.warn('⚠️ Failed to deactivate theme in database');
        }
        
        // Step 2: Reset themeSettings to defaults
        themeSettings = getDefaultThemeSettings();
        
        // Step 3: Clear individual page settings
        const currentUserId = sessionStorage.getItem('userId') || 
                             sessionStorage.getItem('loggedUser');
        if (currentUserId) {
            localStorage.removeItem(`individualPageSettings_user_${currentUserId}`);
            console.log('🗑️ Cleared individual page settings');
        }
        
        // Step 4: Save the reset state
        saveThemeSettings();
        
        // Step 5: Re-render UI
        renderThemeControls(currentSection);
        applyThemeSettings();
        
        // Step 6: Reload saved themes UI to remove "Active" badge
        if (typeof loadSavedThemes === 'function') {
            await loadSavedThemes();
        }
        
        showSaveMessage();
        alert('✅ Reset to defaults complete! Your active theme has been deactivated.');
        
    } catch (error) {
        console.error('❌ Error resetting to defaults:', error);
        alert('Failed to reset settings. Please try again.');
    }
}

// Update preview
function updatePreview(sectionId) {
    const settings = themeSettings[sectionId];
    if (!settings) return;
    
    const colors = settings.colors;
    const preview = document.getElementById('theme-preview');
    
    preview.style.setProperty('--preview-bg', colors['page-background'] || '#ffffff');
    preview.style.setProperty('--preview-card-bg', colors['card-background'] || '#f8fafc');
    preview.style.setProperty('--preview-border', colors['card-border-color'] || '#e2e8f0');
    preview.style.setProperty('--preview-heading', colors['primary-text'] || '#1e293b');
    preview.style.setProperty('--preview-text', colors['secondary-text'] || '#64748b');
    preview.style.setProperty('--preview-btn-bg', colors['button-color'] || '#0a1e81');
    preview.style.setProperty('--preview-btn-text', colors['button-text-color'] || '#ffffff');
}

// Apply theme settings to the actual page using CSS selectors
function applyThemeSettings() {
    let styleEl = document.getElementById('dynamic-theme-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-theme-styles';
        document.head.appendChild(styleEl);
    }
    
    let css = '';
    
    themeConfig.sections.forEach(section => {
        const sectionSettings = themeSettings[section.id];
        if (!sectionSettings) return;
        
        const useGlobal = section.isGlobal ? false : (sectionSettings.useGlobal ?? true);
        const colors = useGlobal && themeSettings.global ? themeSettings.global.colors : sectionSettings.colors;
        
        if (!colors) return;
        
        const mapping = themeConfig.selectorMapping[section.id];
        if (!mapping) return;
        
        Object.keys(mapping).forEach(category => {
            Object.keys(mapping[category]).forEach(optionId => {
                const config = mapping[category][optionId];
                const selectors = expandSelectorPatterns(config);
                const color = colors[optionId];
                
                if (!color || !selectors || selectors.length === 0) return;
                
                let cssProperty = 'color';
                let cssValue = color;
                
                if (optionId.includes('background') || optionId.includes('-bg') || optionId === 'page-background' || 
                    optionId === 'card-background' || optionId === 'navbar-background' || 
                    optionId === 'navbar-hover' ||
                    optionId === 'admin-header-bg' || optionId === 'button-color') {
                    cssProperty = 'background-color';
                    
                    if (optionId === 'button-color') {
                        const selectorList = selectors.join(', ');
                        css += `
                            ${selectorList} {
                                background: ${cssValue} !important;
                                background-color: ${cssValue} !important;
                            }
                        `;
                        return;
                    }
                    
                    if (optionId === 'card-background' && selectors.some(s => s.includes('export-card'))) {
                        const exportCardSelectors = selectors.filter(s => s.includes('export-card')).join(', ');
                        if (exportCardSelectors) {
                            css += `
                                ${exportCardSelectors} {
                                    background: ${cssValue} !important;
                                    background-color: ${cssValue} !important;
                                }
                            `;
                        }
                        const nonExportSelectors = selectors.filter(s => !s.includes('export-card'));
                        if (nonExportSelectors.length === 0) return;
                        const remainingSelectorList = nonExportSelectors.join(', ');
                        css += `
                            ${remainingSelectorList} {
                                ${cssProperty}: ${cssValue} !important;
                            }
                        `;
                        return;
                    }
                } else if (optionId === 'navbar-active-selection') {
                    const selectorList = selectors.join(', ');
                    css += `
                        ${selectorList} {
                            background-color: ${cssValue} !important;
                            border-left-color: ${cssValue} !important;
                        }
                    `;
                    return;
                } else if (optionId.includes('border')) {
                    cssProperty = 'border-color';
                } else if (optionId.includes('text') || optionId.includes('primary') || 
                          optionId.includes('secondary') || optionId === 'button-text-color') {
                    cssProperty = 'color';
                }
                
                const selectorList = selectors.join(', ');
                css += `
                    ${selectorList} {
                        ${cssProperty}: ${cssValue} !important;
                    }
                `;
            });
        });
    });
    
    styleEl.textContent = css;
}

// Helper function to adjust color brightness

// Initialize theme on page load (WAIT FOR LOGIN)
document.addEventListener('DOMContentLoaded', () => {
    // Don't load from localStorage yet - wait for login to determine user
    // Just apply defaults for now
    themeSettings = getDefaultThemeSettings();
    applyThemeSettings();
    console.log('🎨 Applied default theme on page load (waiting for login)');
}); 

// ==================== 23. SAVED THEMES MANAGEMENT ====================
let savedThemesCache = []; // Cache of user's saved themes
let currentThemeData = null; // Store current theme data for saving

// Load all saved themes for the current user
async function loadSavedThemes() {
    try {
        console.log('📚 Loading saved themes...');
        
        const response = await fetch('/api/admin/saved-themes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Check if it's an authentication error
            if (response.status === 401) {
                console.warn('⚠️ Not authenticated yet. Saved themes will load after login.');
                return [];
            }
            throw new Error(data.error || 'Failed to load saved themes');
        }
        
        savedThemesCache = data.themes || [];
        
        console.log(`✅ Loaded ${savedThemesCache.length} saved themes`);
        
        // Update UI
        updateSavedThemesUI();
        
        return savedThemesCache;
        
    } catch (error) {
        console.error('❌ Error loading saved themes:', error);
        
        // Only show notification if not an auth error
        if (error.message !== 'Authentication required') {
            if (typeof showNotification === 'function') {
                showNotification('Failed to load saved themes: ' + error.message, 'error');
            } else {
                console.error('showNotification function not found');
            }
        }
        
        return [];
    }
}

// Update the saved themes UI
function updateSavedThemesUI() {
    const countElement = document.getElementById('saved-themes-count');
    const listElement = document.getElementById('saved-themes-list');
    
    if (!countElement || !listElement) {
        console.warn('⚠️ Saved themes UI elements not found');
        return;
    }
    
    // Update count
    countElement.textContent = savedThemesCache.length;
    
    // Clear list
    listElement.innerHTML = '';
    
    // Show no themes message if empty
    if (savedThemesCache.length === 0) {
        listElement.innerHTML = `
            <div class="no-themes-message">
                <p>No saved themes yet. Save your first theme above!</p>
            </div>
        `;
        return;
    }
    
    // Render each theme card
    savedThemesCache.forEach(theme => {
        const themeCard = createSavedThemeCard(theme);
        listElement.appendChild(themeCard);
    });
}

// Create a saved theme card element
function createSavedThemeCard(theme) {
    const card = document.createElement('div');
    card.className = `saved-theme-card ${theme.is_active ? 'active-theme' : ''}`;
    card.dataset.themeId = theme.id;
    
    // Extract some colors for preview (first 4 colors from theme data)
    const previewColors = extractPreviewColors(theme.theme_data);
    
    // Format date
    const createdDate = new Date(theme.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="saved-theme-header">
            <h5 class="saved-theme-name">${escapeHtml(theme.theme_name)}</h5>
            ${theme.is_active ? '<span class="active-badge">✓ Active</span>' : ''}
        </div>
        
        <div class="saved-theme-preview">
            <div class="color-preview-row">
                ${previewColors.map(color => `
                    <div class="color-preview-box" style="background: ${color};" title="${color}"></div>
                `).join('')}
            </div>
        </div>
        
        <div class="saved-theme-info">
            <small>Created: ${createdDate}</small>
        </div>
        
        <div class="saved-theme-actions">
            ${!theme.is_active ? `
                <button onclick="activateSavedTheme(${theme.id})" class="btn btn-primary" title="Set as active theme and apply immediately">
                    ✓ Set Active
                </button>
            ` : `
                <button class="btn btn-success" disabled title="Currently active">
                    ✓ Active
                </button>
            `}
            <button onclick="renameSavedTheme(${theme.id})" class="btn btn-sm btn-secondary" title="Rename this theme">
                ✏️ Rename
            </button>
            <button onclick="deleteSavedTheme(${theme.id})" class="btn btn-sm btn-danger" title="Delete this theme">
                🗑️ Delete
            </button>
        </div>
    `;
    
    return card;
}

// Extract preview colors from theme data
function extractPreviewColors(themeData) {
    const colors = [];
    
    try {
        // Try to extract some representative colors
        if (themeData.global) {
            const global = themeData.global;
            
            // Handle new format with colors object
            const globalColors = global.colors || global;
            
            if (globalColors['primary-color']) colors.push(globalColors['primary-color']);
            if (globalColors['secondary-color']) colors.push(globalColors['secondary-color']);
            if (globalColors['accent-color']) colors.push(globalColors['accent-color']);
            if (globalColors['page-background']) colors.push(globalColors['page-background']);
        }
        
        // If we don't have enough colors, add some defaults
        while (colors.length < 4) {
            colors.push('#e2e8f0');
        }
        
        return colors.slice(0, 4);
        
    } catch (error) {
        console.error('Error extracting preview colors:', error);
        return ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'];
    }
}

// Capture current theme data from all sections
function captureCurrentThemeData() {
    const themeData = {};
    
    try {
        console.log('📸 Capturing theme data (Global Only)...');
        
        // Check if themeConfig exists
        if (typeof themeConfig === 'undefined' || !themeConfig.selectorMapping) {
            console.error('themeConfig or selectorMapping not defined');
            alert('Theme configuration not loaded. Please refresh the page.');
            return null;
        }
        
        // ONLY capture global section
        const sectionId = 'global';
        const sectionColors = {};
        const selectorMapping = themeConfig.selectorMapping[sectionId];
        
        if (!selectorMapping) {
            console.error('Global section not found in selectorMapping');
            return null;
        }
        
        // Iterate through categories (general, cards, buttons, etc.)
        Object.keys(selectorMapping).forEach(category => {
            const colorGroup = selectorMapping[category];
            
            // Iterate through color keys in each category
            Object.keys(colorGroup).forEach(colorKey => {
                // Use hex- prefix to match the actual input IDs
                const inputId = `hex-${sectionId}-${colorKey}`;
                const input = document.getElementById(inputId);
                
                if (input && input.value) {
                    sectionColors[colorKey] = input.value;
                    console.log(`  ✓ ${sectionId}.${colorKey} = ${input.value}`);
                }
            });
        });
        
        // Save ONLY global colors
        if (Object.keys(sectionColors).length > 0) {
            themeData.global = {
                colors: sectionColors
            };
            console.log(`✅ Captured ${Object.keys(sectionColors).length} global colors`);
        } else {
            console.warn('⚠️ No global colors captured');
            return null;
        }
        
        console.log('✅ Captured theme data (Global Only):', themeData);
        
        // Check if we captured anything
        if (Object.keys(themeData).length === 0) {
            console.warn('⚠️ No theme data captured - no color inputs found or all empty');
            return null;
        }
        
        return themeData;
        
    } catch (error) {
        console.error('❌ Error capturing theme data:', error);
        alert('Failed to capture theme data: ' + error.message);
        return null;
    }
}

// Save current theme with user-provided name
async function saveCurrentTheme() {
    try {
        // Get theme name from input
        const themeNameInput = document.getElementById('new-theme-name');
        
        if (!themeNameInput) {
            alert('Theme name input not found. Please refresh the page.');
            return;
        }
        
        const themeName = themeNameInput.value.trim();
        
        if (!themeName) {
            alert('Please enter a theme name');
            themeNameInput.focus();
            return;
        }
        
        // Check if name already exists
        const nameExists = savedThemesCache.some(theme => 
            theme.theme_name.toLowerCase() === themeName.toLowerCase()
        );
        
        if (nameExists) {
            const confirm = window.confirm(
                `A theme named "${themeName}" already exists. Do you want to save anyway?`
            );
            
            if (!confirm) return;
        }
        
        // Capture current theme data
        const themeData = captureCurrentThemeData();
        
        if (!themeData) {
            alert('Failed to capture current theme data');
            return;
        }
        
        // Check if should set as active
        const setActive = document.getElementById('set-active-on-save');
        const isActive = setActive ? setActive.checked : false;
        
        // Show loading message
        console.log('💾 Saving theme...');
        
        // Send to server
        const response = await fetch('/api/admin/saved-themes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                theme_name: themeName,
                theme_data: themeData,
                is_active: isActive
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to save theme');
        }
        
        console.log('✅ Theme saved successfully:', data);
        alert(`✅ Theme "${themeName}" saved successfully!`);
        
        // Clear form
        clearSaveThemeForm();
        
        // Reload saved themes
        await loadSavedThemes();
        
    } catch (error) {
        console.error('❌ Error saving theme:', error);
        alert('❌ Failed to save theme: ' + error.message);
    }
}

// Clear the save theme form
function clearSaveThemeForm() {
    const themeNameInput = document.getElementById('new-theme-name');
    const setActiveCheckbox = document.getElementById('set-active-on-save');
    
    if (themeNameInput) themeNameInput.value = '';
    if (setActiveCheckbox) setActiveCheckbox.checked = true;
}


// Apply theme data to color inputs
// APPLIES: ONLY Admin Overall (global) colors
// Individual page overrides remain untouched and apply automatically
function applyThemeData(themeData) {
    try {
        console.log('🎨 Applying theme data (Global Only)...', themeData);
        
        if (!themeData || typeof themeData !== 'object') {
            console.error('Invalid theme data:', themeData);
            return;
        }
        
        // Only process global section
        if (!themeData.global || !themeData.global.colors) {
            console.error('No global colors in theme data');
            return;
        }
        
        const globalColors = themeData.global.colors;
        let appliedCount = 0;
        
        console.log('  📂 Applying global colors...');
        
        // Make sure themeSettings has global section
        if (!themeSettings.global) {
            themeSettings.global = { useGlobal: false, colors: {} };
        }
        
        // Apply each color
        Object.keys(globalColors).forEach(colorKey => {
            const colorValue = globalColors[colorKey];
            
            // Update themeSettings (the actual data store)
            themeSettings.global.colors[colorKey] = colorValue;
            
            // Update both the color picker and hex input
            const colorPickerId = `color-global-${colorKey}`;
            const hexInputId = `hex-global-${colorKey}`;
            
            const colorPicker = document.getElementById(colorPickerId);
            const hexInput = document.getElementById(hexInputId);
            
            if (colorPicker && hexInput) {
                // Extract 6-digit hex for color picker (it doesn't support alpha)
                const sixDigitHex = colorValue.length === 9 ? colorValue.substring(0, 7) : colorValue;
                
                // Set both inputs
                colorPicker.value = sixDigitHex;
                hexInput.value = colorValue.toUpperCase();
                appliedCount++;
                
                console.log(`    ✓ ${colorKey} = ${colorValue}`);
            }
        });
        
        // Save to user-specific localStorage so it persists
        const currentUserId = sessionStorage.getItem('userId') || 
                             sessionStorage.getItem('loggedUser');
        if (currentUserId) {
            const storageKey = `adminThemeSettings_user_${currentUserId}`;
            localStorage.setItem(storageKey, JSON.stringify(themeSettings));
            console.log('💾 Saved applied theme to localStorage');
        } else {
            console.warn('⚠️ No user ID found - cannot save to localStorage');
        }
        
        // Apply the theme to the actual page elements
        // This respects individual page toggles automatically
        if (typeof applyThemeSettings === 'function') {
            console.log('🔧 Applying theme to page elements...');
            applyThemeSettings();
            console.log('ℹ️  Individual page overrides will apply on top if toggles are OFF');
        } else {
            console.error('applyThemeSettings function not found!');
        }
        
        console.log(`✅ Theme applied successfully (${appliedCount} global colors)`);
        
        if (appliedCount === 0) {
            console.warn('⚠️ No colors were applied - check if color input IDs match');
        }
        
    } catch (error) {
        console.error('❌ Error applying theme data:', error);
        throw error;
    }
}

// Set a saved theme as the active theme
// This is now the ONLY way to apply a saved theme (Load button removed)
async function activateSavedTheme(themeId) {
    try {
        const theme = savedThemesCache.find(t => t.id === themeId);
        
        if (!theme) {
            showNotification('Theme not found', 'error');
            return;
        }
        
        // Step 1: Show user what's about to happen
        console.log('🔄 Activating theme:', theme.theme_name);
        showNotification(`Applying "${theme.theme_name}"...`, 'info');
        
        // Step 2: Mark as active in database
        const response = await fetch(`/api/admin/saved-themes/${themeId}/activate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to activate theme');
        }
        
        console.log('✅ Database updated - theme is now active');
        
        // Step 3: Apply the theme immediately to current page
        console.log('🎨 Applying theme to page...');
        applyThemeData(theme.theme_data);
        
        // Step 4: Reload saved themes UI to show new active state
        await loadSavedThemes();
        
        // Step 5: Success
        console.log('✅ Theme activation complete!');
        showNotification(`"${theme.theme_name}" is now your active theme!`, 'success');
        
    } catch (error) {
        console.error('❌ Error activating theme:', error);
        showNotification('Failed to activate theme: ' + error.message, 'error');
    }
}

// Rename a saved theme
async function renameSavedTheme(themeId) {
    try {
        const theme = savedThemesCache.find(t => t.id === themeId);
        
        if (!theme) {
            showNotification('Theme not found', 'error');
            return;
        }
        
        // Create rename modal
        const modal = createRenameModal(theme);
        document.body.appendChild(modal);
        
        // Focus input
        const input = modal.querySelector('#rename-theme-input');
        input.focus();
        input.select();
        
    } catch (error) {
        console.error('❌ Error renaming theme:', error);
        showNotification('Failed to rename theme: ' + error.message, 'error');
    }
}

// Create rename modal
function createRenameModal(theme) {
    const modal = document.createElement('div');
    modal.className = 'rename-theme-modal';
    modal.innerHTML = `
        <div class="rename-theme-content">
            <h3>✏️ Rename Theme</h3>
            <p>Enter a new name for "${escapeHtml(theme.theme_name)}"</p>
            
            <div class="form-group">
                <label for="rename-theme-input">New Theme Name *</label>
                <input 
                    type="text" 
                    id="rename-theme-input" 
                    value="${escapeHtml(theme.theme_name)}"
                    maxlength="100"
                />
            </div>
            
            <div class="rename-theme-actions">
                <button class="btn btn-secondary" onclick="closeRenameModal()">
                    Cancel
                </button>
                <button class="btn btn-primary" onclick="performRename(${theme.id})">
                    ✏️ Rename
                </button>
            </div>
        </div>
    `;
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRenameModal();
        }
    });
    
    // Handle Enter key
    const input = modal.querySelector('#rename-theme-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performRename(theme.id);
        }
    });
    
    return modal;
}

// Perform the rename operation
async function performRename(themeId) {
    try {
        const input = document.getElementById('rename-theme-input');
        const newName = input.value.trim();
        
        if (!newName) {
            showNotification('Please enter a theme name', 'error');
            input.focus();
            return;
        }
        
        // Check if name already exists (excluding current theme)
        const nameExists = savedThemesCache.some(theme => 
            theme.id !== themeId && theme.theme_name.toLowerCase() === newName.toLowerCase()
        );
        
        if (nameExists) {
            showNotification('A theme with this name already exists', 'error');
            input.focus();
            return;
        }
        
        const response = await fetch(`/api/admin/saved-themes/${themeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                theme_name: newName
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to rename theme');
        }
        
        console.log('✅ Theme renamed successfully');
        showNotification('Theme renamed successfully!', 'success');
        
        // Close modal
        closeRenameModal();
        
        // Reload saved themes
        await loadSavedThemes();
        
    } catch (error) {
        console.error('❌ Error renaming theme:', error);
        showNotification('Failed to rename theme: ' + error.message, 'error');
    }
}

// Close rename modal
function closeRenameModal() {
    const modal = document.querySelector('.rename-theme-modal');
    if (modal) {
        modal.remove();
    }
}

// Delete a saved theme
async function deleteSavedTheme(themeId) {
    try {
        const theme = savedThemesCache.find(t => t.id === themeId);
        
        if (!theme) {
            showNotification('Theme not found', 'error');
            return;
        }
        
        const confirm = await showConfirmDialog(
            'Delete Theme',
            `Are you sure you want to delete "${theme.theme_name}"? This action cannot be undone.`,
            'Delete',
            'danger'
        );
        
        if (!confirm) return;
        
        console.log('🗑️ Deleting theme:', theme.theme_name);
        
        const response = await fetch(`/api/admin/saved-themes/${themeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete theme');
        }
        
        console.log('✅ Theme deleted successfully');
        showNotification(`Theme "${theme.theme_name}" deleted successfully!`, 'success');
        
        // Reload saved themes
        await loadSavedThemes();
        
    } catch (error) {
        console.error('❌ Error deleting theme:', error);
        showNotification('Failed to delete theme: ' + error.message, 'error');
    }
}

// Refresh saved themes list
async function refreshSavedThemes() {
    showNotification('Refreshing saved themes...', 'info');
    await loadSavedThemes();
    showNotification('Saved themes refreshed!', 'success');
}

// Load and apply the user's active theme on page load
// Call this function after successful login
async function loadActiveThemeOnLogin() {
    try {
        console.log('🔍 Checking for active theme...');
        
        const response = await fetch('/api/admin/saved-themes/active', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.warn('⚠️ Failed to load active theme:', data.error);
            applyDefaultTheme();
            // Still load individual page settings
            loadIndividualPageSettings();
            return;
        }
        
        if (data.theme) {
            console.log('✅ Active theme found:', data.theme.theme_name);
            
            // Apply theme data (global only)
            applyThemeData(data.theme.theme_data);
            
            // Load individual page settings after theme
            loadIndividualPageSettings();
            
            // Re-apply to ensure individual pages override
            if (typeof applyThemeSettings === 'function') {
                applyThemeSettings();
            }
            
            console.log('🎨 Active theme applied with individual page overrides');
        } else {
            console.log('ℹ️ No active theme set - applying default colors');
            applyDefaultTheme();
            // Still load individual page settings
            loadIndividualPageSettings();
        }
        
    } catch (error) {
        console.error('❌ Error loading active theme:', error);
        applyDefaultTheme();
        // Still load individual page settings
        loadIndividualPageSettings();
    }
}

function applyDefaultTheme() {
    try {
        console.log('🎨 Applying default theme colors...');
        
        // Check if getDefaultThemeSettings exists
        if (typeof getDefaultThemeSettings !== 'function') {
            console.error('getDefaultThemeSettings function not found');
            return;
        }
        
        // Get default theme settings
        themeSettings = getDefaultThemeSettings();
        
        // Apply the default theme to the page
        if (typeof applyThemeSettings === 'function') {
            applyThemeSettings();
            console.log('✅ Default theme colors applied');
        } else {
            console.error('applyThemeSettings function not found');
        }
        
    } catch (error) {
        console.error('❌ Error applying default theme:', error);
    }
}

// Initialize saved themes section when theme settings page loads
// Add this to your existing initThemeSettings() function
function initSavedThemesSection() {
    console.log('🎨 Initializing saved themes section...');
    
    // Check if user is logged in
    const loggedUser = sessionStorage.getItem('loggedUser');
    
    if (!loggedUser) {
        console.warn('⚠️ User not logged in. Skipping saved themes load.');
        return;
    }
    
    // Load saved themes
    loadSavedThemes();
}

// Show confirmation dialog
function showConfirmDialog(title, message, confirmText = 'Confirm', type = 'primary') {
    return new Promise((resolve) => {
        const confirmed = confirm(`${title}\n\n${message}`);
        resolve(confirmed);
    });
}
// ==================== 24. ARCHIVE DELETION FUNCTIONS (System Admin Only) ====================

// Show/hide deletion controls based on user role
function initializeDeletionControls() {
    const userRole = sessionStorage.getItem('userRole');
    const deletionControls = document.getElementById('archive-deletion-controls');
    
    if (userRole === 'system_admin' && deletionControls) {
        deletionControls.style.display = 'block';
        console.log('✅ Deletion controls enabled for system_admin');
    } else if (deletionControls) {
        deletionControls.style.display = 'none';
    }
}

// Toggle select all checkboxes in archive
function toggleSelectAllArchive(checkbox) {
    const checkboxes = document.querySelectorAll('.archive-select-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    updateArchiveSelectionCount();
}

// Update selected count and enable/disable delete button
function updateArchiveSelectionCount() {
    const checkboxes = document.querySelectorAll('.archive-select-checkbox:checked');
    const count = checkboxes.length;
    
    const countDisplay = document.getElementById('selected-count');
    const deleteBtn = document.getElementById('delete-selected-btn');
    
    if (countDisplay) {
        countDisplay.textContent = `${count} selected`;
    }
    
    if (deleteBtn) {
        deleteBtn.disabled = count === 0;
    }
    
    // Update select-all checkbox state
    const selectAllCheckbox = document.getElementById('select-all-archive');
    const allCheckboxes = document.querySelectorAll('.archive-select-checkbox');
    
    if (selectAllCheckbox && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = checkboxes.length === allCheckboxes.length;
        selectAllCheckbox.indeterminate = checkboxes.length > 0 && checkboxes.length < allCheckboxes.length;
    }
}

// Set quick date for bulk deletion
function setQuickDeleteDate(value) {
    const dateInput = document.getElementById('bulk-delete-date');
    if (!dateInput || !value) return;
    
    const now = new Date();
    let targetDate = new Date();
    
    switch (value) {
        case '3months':
            targetDate.setMonth(now.getMonth() - 3);
            break;
        case '6months':
            targetDate.setMonth(now.getMonth() - 6);
            break;
        case '1year':
            targetDate.setFullYear(now.getFullYear() - 1);
            break;
        case '2years':
            targetDate.setFullYear(now.getFullYear() - 2);
            break;
        case '3years':
            targetDate.setFullYear(now.getFullYear() - 3);
            break;
        default:
            return;
    }
    
    // Format date as YYYY-MM-DD
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
    
    // Automatically preview
    previewBulkDelete();
}

// Preview bulk deletion count
async function previewBulkDelete() {
    const dateInput = document.getElementById('bulk-delete-date');
    const previewDiv = document.getElementById('preview-count');
    const previewNumber = document.getElementById('preview-number');
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    
    if (!dateInput || !dateInput.value) {
        alert('Please select a date first');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/archive/preview-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': sessionStorage.getItem('loggedUser')
            },
            body: JSON.stringify({
                dateRange: {
                    before: dateInput.value
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (previewNumber) previewNumber.textContent = data.count;
            if (previewDiv) previewDiv.style.display = 'block';
            if (bulkDeleteBtn) bulkDeleteBtn.disabled = data.count === 0;
            
            console.log(`📊 Preview: ${data.count} records will be deleted`);
        } else {
            throw new Error(data.error || 'Failed to preview deletion');
        }
    } catch (error) {
        console.error('❌ Error previewing deletion:', error);
        alert('Error previewing deletion: ' + error.message);
    }
}

// Delete selected archived feedback
async function deleteSelectedArchive() {
    const checkboxes = document.querySelectorAll('.archive-select-checkbox:checked');
    const feedbackIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (feedbackIds.length === 0) {
        alert('Please select at least one record to delete');
        return;
    }
    
    // Show confirmation modal
    const modal = showDeletionConfirmationModal(feedbackIds.length, 'selected');
    
    modal.onconfirm = async (password) => {
        try {
            const response = await fetch('/api/admin/archive/delete-selected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': sessionStorage.getItem('loggedUser')
                },
                body: JSON.stringify({
                    feedbackIds: feedbackIds,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ Successfully deleted ${data.deletedCount} record(s)`);
                
                // Uncheck select-all
                const selectAllCheckbox = document.getElementById('select-all-archive');
                if (selectAllCheckbox) selectAllCheckbox.checked = false;
                
                // Reload archive data
                await loadArchiveData();
            } else {
                throw new Error(data.error || 'Failed to delete records');
            }
        } catch (error) {
            console.error('❌ Error deleting selected:', error);
            alert('Error: ' + error.message);
        }
    };
}

// Bulk delete by date
async function bulkDeleteByDate() {
    const dateInput = document.getElementById('bulk-delete-date');
    const previewNumber = document.getElementById('preview-number');
    
    if (!dateInput || !dateInput.value) {
        alert('Please select a date first');
        return;
    }
    
    const count = previewNumber ? parseInt(previewNumber.textContent) : 0;
    
    if (count === 0) {
        alert('No records found before the selected date');
        return;
    }
    
    // Show confirmation modal
    const modal = showDeletionConfirmationModal(count, 'date', dateInput.value);
    
    modal.onconfirm = async (password) => {
        try {
            const response = await fetch('/api/admin/archive/delete-by-date', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': sessionStorage.getItem('loggedUser')
                },
                body: JSON.stringify({
                    beforeDate: dateInput.value,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`✅ Successfully deleted ${data.deletedCount} record(s) and ${data.photosDeleted} photo(s)`);
                
                // Reset inputs
                dateInput.value = '';
                const quickSelect = document.getElementById('bulk-delete-quick');
                if (quickSelect) quickSelect.value = '';
                
                // Hide preview
                const previewDiv = document.getElementById('preview-count');
                if (previewDiv) previewDiv.style.display = 'none';
                
                // Disable delete button
                const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
                if (bulkDeleteBtn) bulkDeleteBtn.disabled = true;
                
                // Reload archive data
                await loadArchiveData();
            } else {
                throw new Error(data.error || 'Failed to delete records');
            }
        } catch (error) {
            console.error('❌ Error bulk deleting:', error);
            alert('Error: ' + error.message);
        }
    };
}

// Show deletion confirmation modal
function showDeletionConfirmationModal(count, type, date = null) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal deletion-modal-content';
    
    // Create title based on type
    const title = type === 'date' 
        ? `Delete ${count} Records Before ${new Date(date).toLocaleDateString()}?`
        : `Delete ${count} Selected Record${count !== 1 ? 's' : ''}?`;
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>⚠️ Confirm Permanent Deletion</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        
        <div class="modal-body">
            <div class="deletion-modal-warning">
                <h3>🚨 WARNING: This action cannot be undone!</h3>
                <p>You are about to permanently delete:</p>
                <ul>
                    <li><strong>${count}</strong> archived feedback ${count !== 1 ? 'entries' : 'entry'}</li>
                    <li>All associated answers and data</li>
                    <li>All associated photos from the filesystem</li>
                    <li>Orphaned user records (if applicable)</li>
                </ul>
                ${type === 'date' ? `<p><strong>All records archived before ${new Date(date).toLocaleDateString()}</strong></p>` : ''}
            </div>
            
            <div class="backup-checkbox-container">
                <label>
                    <input type="checkbox" id="backup-confirm" required>
                    I confirm that I have exported a backup of this data
                </label>
            </div>
            
            <div class="form-group">
                <label for="delete-password"><strong>Enter your password to confirm:</strong></label>
                <input type="password" id="delete-password" class="confirm-delete-input" 
                       placeholder="Enter your password" required>
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            <button class="btn-danger" id="confirm-delete-btn">Delete Permanently</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Focus password input
    const passwordInput = modal.querySelector('#delete-password');
    setTimeout(() => passwordInput && passwordInput.focus(), 100);
    
    // Handle confirmation
    const confirmBtn = modal.querySelector('#confirm-delete-btn');
    const backupCheckbox = modal.querySelector('#backup-confirm');
    
    const callbackObj = {
        onconfirm: null
    };
    
    confirmBtn.onclick = async () => {
        if (!backupCheckbox.checked) {
            alert('Please confirm that you have exported a backup');
            return;
        }
        
        const password = passwordInput.value;
        
        if (!password) {
            alert('Please enter your password');
            return;
        }
        
        // Disable button while processing
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';
        
        if (callbackObj.onconfirm) {
            await callbackObj.onconfirm(password);
        }
        
        // Remove modal
        overlay.remove();
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return callbackObj;
}

// Initialize deletion controls when archive page loads
function refreshArchiveData() {
    console.log('🔄 Refreshing archive data...');
    loadArchiveData();
}

// ==================== 26. LEADERBOARD MANAGEMENT ====================

// Load leaderboard data from API
async function loadAdminLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard/pledges');
        const data = await response.json();
        
        if (data.success) {
            allLeaderboardData = data.pledges;
            filteredLeaderboardData = data.pledges;
            leaderboardCurrentPage = 1;
            renderLeaderboardPage();
        } else {
            console.error('Failed to load leaderboard:', data.message);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Filter leaderboard data by search term
function filterLeaderboardData() {
    const searchInput = document.getElementById('leaderboard-search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredLeaderboardData = allLeaderboardData;
    } else {
        filteredLeaderboardData = allLeaderboardData.filter(pledge => 
            pledge.name.toLowerCase().includes(searchTerm) ||
            pledge.pledge.toLowerCase().includes(searchTerm)
        );
    }
    
    leaderboardCurrentPage = 1;
    renderLeaderboardPage();
}

// Clear leaderboard search
function clearLeaderboardSearch() {
    const searchInput = document.getElementById('leaderboard-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    filteredLeaderboardData = allLeaderboardData;
    leaderboardCurrentPage = 1;
    renderLeaderboardPage();
}

// Render current page of leaderboard
function renderLeaderboardPage() {
    const tableBody = document.getElementById('leaderboard-table-body');
    const countSpan = document.getElementById('leaderboard-count');
    
    if (!tableBody) return;
    
    // Update count
    if (countSpan) {
        countSpan.textContent = filteredLeaderboardData.length;
    }
    
    if (filteredLeaderboardData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                    No pledges found
                </td>
            </tr>
        `;
        updateLeaderboardPaginationControls();
        return;
    }
    
    // Calculate pagination
    const startIndex = (leaderboardCurrentPage - 1) * leaderboardItemsPerPage;
    const endIndex = startIndex + leaderboardItemsPerPage;
    const pageData = filteredLeaderboardData.slice(startIndex, endIndex);
    
    // Render pledges for current page
    tableBody.innerHTML = pageData.map((pledge, pageIndex) => {
        const date = new Date(pledge.created_at).toLocaleDateString();
        const actualRank = startIndex + pageIndex + 1; // Rank across all pages
        
        // Add medal for top 3 (only on first page)
        let rankDisplay = `<span style="font-size: 14px;">#${actualRank}</span>`;
        if (leaderboardCurrentPage === 1) {
            if (pageIndex === 0) rankDisplay = '<span style="font-size: 18px;">🥇</span> <span style="font-size: 14px;">#1</span>';
            else if (pageIndex === 1) rankDisplay = '<span style="font-size: 18px;">🥈</span> <span style="font-size: 14px;">#2</span>';
            else if (pageIndex === 2) rankDisplay = '<span style="font-size: 18px;">🥉</span> <span style="font-size: 14px;">#3</span>';
        }
        
        return `
            <tr class="data-row">
                <td style="font-weight: 600; text-align: center;">${rankDisplay}</td>
                <td>${escapeHtml(pledge.name)}</td>
                <td style="max-width: 400px;">${escapeHtml(pledge.pledge)}</td>
                <td style="font-weight: 600; color: #6366F1; text-align: center;">
                    ❤️ ${pledge.like_count || 0}
                </td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
    
    updateLeaderboardPaginationControls();
}

// Update leaderboard pagination controls
function updateLeaderboardPaginationControls() {
    const totalPages = Math.ceil(filteredLeaderboardData.length / leaderboardItemsPerPage);
    const pageInfo = document.getElementById('leaderboard-page-info');
    const prevBtn = document.getElementById('prev-leaderboard-btn');
    const nextBtn = document.getElementById('next-leaderboard-btn');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${leaderboardCurrentPage} of ${totalPages} (${filteredLeaderboardData.length} total)`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = leaderboardCurrentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = leaderboardCurrentPage >= totalPages;
    }
}

// Navigate to previous leaderboard page
function prevLeaderboardPage() {
    if (leaderboardCurrentPage > 1) {
        leaderboardCurrentPage--;
        renderLeaderboardPage();
    }
}

// Navigate to next leaderboard page
function nextLeaderboardPage() {
    const totalPages = Math.ceil(filteredLeaderboardData.length / leaderboardItemsPerPage);
    if (leaderboardCurrentPage < totalPages) {
        leaderboardCurrentPage++;
        renderLeaderboardPage();
    }
}

// ==================== 27. VIP MANAGEMENT (DONE BY ZAH) ====================

// VIP Data (Active only)
let vipData = [];

// API base (same origin)
const VIP_API_BASE = "/api/admin";

/*
    Expected API (ACTIVE ONLY for this UI):
    GET  /api/admin/vips?status=active
    POST /api/admin/vips   { name }
*/
const VIP_API = {
    listActive: () => {
        return `${VIP_API_BASE}/vips?status=active`;
    },
    create: () => {
        return `${VIP_API_BASE}/vips`;
    }
};

// DOM helpers (NEW VIP UI)
function getVipElements() {
    return {
        vipPage: document.getElementById("vip-page"),
        vipList: document.getElementById("vip-list"),
        vipCount: document.getElementById("vip-count")
    };
}

// Safe HTML escape (fallback if global helper not available)
function escapeHtmlSafe(value) {
    if (typeof window.escapeHtml === "function") {
        return window.escapeHtml(value);
    }

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Date formatter
function formatVipDate(value) {
    if (!value) return "-";

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleString();
}

// Fetch helper
async function fetchVipJson(url, options = {}) {
    const res = await fetch(url, options);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} - ${text}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return {};
    }

    return res.json();
}

// Render VIP list (NEW UI)
function renderVipList() {
    const { vipList, vipCount } = getVipElements();
    if (!vipList || !vipCount) return;

    vipCount.textContent = `${vipData.length} VIP(s)`;

    if (!vipData.length) {
        vipList.innerHTML = `
            <div class="vip-empty">
                No VIP names yet.
            </div>
        `;
        return;
    }

    vipList.innerHTML = vipData.map((vip) => {
        const name = escapeHtmlSafe(vip.name ?? "");
        const createdAt = formatVipDate(vip.created_at ?? vip.createdAt);

        return `
            <div class="vip-item">
                <div class="vip-item-left">
                    <div class="vip-name">👑 ${name}</div>
                    <div class="vip-date">Added: ${createdAt}</div>
                </div>
            </div>
        `;
    }).join("");
}

// Load VIPs (Active only)
async function loadVipData() {
    const { vipList, vipCount } = getVipElements();
    if (!vipList || !vipCount) return;

    vipCount.textContent = "Loading...";
    vipList.innerHTML = `
        <div class="vip-empty">
            Loading VIPs...
        </div>
    `;

    try {
        const res = await fetchVipJson(VIP_API.listActive());

        // Support formats: [ ... ] OR { vips: [...] } OR { data: [...] }
        vipData = Array.isArray(res) ? res : (res.vips || res.data || []);

        renderVipList();
    } catch (err) {
        console.error("VIP load error:", err);
        vipCount.textContent = "Error";
        vipList.innerHTML = `
            <div class="vip-empty" style="color:#ef4444;">
                Failed to load VIPs.
            </div>
        `;
    }
}

// Loader used by showPage('vip')
function loadVipManagementData() {
    loadVipData();
}

window.loadVipManagementData = loadVipManagementData;

// Add VIP (NEW UI)
async function addVip() {
    const name = prompt("Enter VIP name (exact match):");
    if (!name) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
        alert("VIP name is too short.");
        return;
    }

    try {
        await fetchVipJson(VIP_API.create(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed })
        });

        // Refresh list
        loadVipData();
    } catch (err) {
        console.error("Add VIP error:", err);
        alert("Failed to add VIP.");
    }
}

// Expose for HTML onclick
window.addVip = addVip;

