// ============================================================
// FEEDBACK.JS - TABLE OF CONTENTS
// ============================================================
// 
// 1. GLOBAL VARIABLES & CONSTANTS
//    let selectedRetention            - Selected retention option (DONE BY PRETI)
//    let selectedTheme                - Currently selected overlay theme (DONE BY PRETI)
//    let userData                     - Object storing user input and answers (DONE BY PRETI)
//    let stream                       - Camera video stream object
//    let photoData                    - Base64 encoded photo data (DONE BY PRETI)
//    let currentDevice                - 'desktop' or 'mobile' device type (DONE BY PRETI)
//    let inactivityTimer              - Timer for inactivity timeout (DONE BY PRETI)
//    const INACTIVITY_TIMEOUT         - 5 minutes timeout duration (DONE BY PRETI)
//
// 2. INITIALIZATION & SETUP FUNCTIONS
//    async function loadDynamicQRCode() - Load dynamic QR code from server (DONE BY PRETI)
//    function detectDeviceType()      - Detect mobile/desktop device (DONE BY PRETI)
//    DOMContentLoaded                 - Application bootstrap

//
// 3. INACTIVITY TIMER FUNCTIONS
//    function startInactivityTimer()  - Start 5-minute countdown (DONE BY PRETI)
//    function resetInactivityTimer()  - Reset on user interaction (DONE BY PRETI)
//    function returnToLandingPage()   - Return to start when timeout (DONE BY PRETI)
//    function showTimeoutNotification() - Show timeout message (DONE BY PRETI)
//
// 4. QUESTION MANAGEMENT FUNCTIONS
//    async function loadFeedbackQuestions() - Load questions from database (DONE BY PRETI)
//    function updateFeedbackForm()    - Update form with questions (DONE BY PRETI)
//    function createQuestionElement() - Create question UI (DONE BY PRETI)
//    function selectQuestionRating()  - Handle star rating (DONE BY PRETI)
//    function initializeQuestionEventListeners() - Setup question events (DONE BY PRETI)
//    function showNoQuestionsMessage() - Show message if no questions (DONE BY PRETI)
//    function getQuestionType()       - Determine question type (DONE BY PRETI)
//    function validateRequiredQuestions() - Validate required answers (DONE BY PRETI)
// 
// 5. FORM SUBMISSION FUNCTIONS
//    function submitFeedback()        - Submit feedback form (DONE BY PRETI)
//    function submitDetails()         - Submit user details
//    function submitPledge()          - Submit pledge and redirect
//
// 6. PHOTO HANDLING FUNCTIONS
//    function handlePhotoUpload()     - Handle file upload (mobile)
//    function continueToStyleFromUpload() - Continue from upload to style
//    function retakePhotoFromUpload() - Retake photo from upload page
//    async function initializeCamera() - Initialize camera (desktop only)
//    function capturePhoto()          - Capture with countdown/redirect
//    function takePhoto()             - Take photo from camera stream 
//    function continueToStyle()       - Go to style page after photo (DONE BY PRETI)
//    function saveOriginalPhoto()     - Save original to server (DONE BY PRETI)
//    function saveProcessedPhoto()    - Save processed photo to server (DONE BY PRETI)
//
// 7. OVERLAY & THEME FUNCTIONS
//    async function loadOverlayOptions() - Load overlays from database (DONE BY PRETI)
//    function loadDefaultOverlayOptions() - Fallback default overlays (DONE BY PRETI)
//    function generateColorFromThemeId() - Generate consistent colors (DONE BY PRETI)
//    function selectTheme()           - Select theme and update preview (DONE BY PRETI)
//    function updateThemePreview()    - Update theme preview image (DONE BY PRETI)
//    function updatePreviewWithCutout() - Update preview with positioning (DONE BY PRETI)
//    function processFinalPhoto()     - Process final photo with overlay (DONE BY PRETI)
//
// 8. PAGE NAVIGATION FUNCTIONS
//    function showConsentPage()       - Show consent page
//    function selectOption()          - Select retention option (DONE BY PRETI)
//    function showDetailsPage()       - Show details page
//    function retakePhotoFromStyle()  - Retake photo from style page (DONE BY PRETI)
//    function confirmStyle()          - Confirm and go to confirmation (DONE BY PRETI)
//    function updateConfirmationDetails() - Update confirmation page
//    function goBackToStyle()         - Go back to style page
//    function finalSubmit()           - Final submission with saving (DONE BY PRETI)
//    function submitAnother()         - Reset and start new submission
//
// 9. BACK NAVIGATION FUNCTIONS
//    function goBackToLanding()       - Consent to Landing (DONE BY PRETI)
//    function goBackToConsent()       - Details to Consent 
//    function goBackToDetails()       - Feedback to Details
//    function goBackToFeedback()      - Pledge to Feedback
//    function goBackToPledge()        - Photo/Upload to Pledge
//    function goBackToPhoto()         - Style to Photo/Upload (DONE BY PRETI)
//
// 10. EVENT LISTENERS & CLEANUP
//     window.addEventListener('beforeunload') - Clean up camera and timers (DONE BY PRETI)
//     document.addEventListener('click') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('keypress') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('mousemove') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('touchstart') - Reset inactivity timer (DONE BY PRETI)
//
// 11. LEADERBOARD NAVIGATION
//     function viewLeaderboard()       - Navigate to leaderboard page (DONE BY PRETI)

//
// ==================== 1. GLOBAL VARIABLES & CONSTANTS ====================
let selectedRetention = null;
let selectedTheme = 'nature';
let userData = {};
let stream = null;
let photoData = null;
let currentDevice = 'desktop'; // 'desktop' or 'mobile'
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 300000; // 5 minutes (300,000 milliseconds)

// ==================== 2. INITIALIZATION & SETUP FUNCTIONS ====================

// Load dynamic QR code from server
async function loadDynamicQRCode() {
    try {
        const response = await fetch('/api/generate-qr');
        const data = await response.json();
        
        if (data.success && data.qrSvg) {
            const qrContainer = document.querySelector('.qr-code');
            if (qrContainer) {
                // Replace the dummy QR code with dynamic one
                qrContainer.innerHTML = data.qrSvg;
                
                // Update the description with the actual IP
                const qrDescription = document.querySelector('.qr-description');
                if (qrDescription) {
                    qrDescription.innerHTML = `
                        Scan to open: <strong>${data.url}</strong><br>
                        Point your mobile camera here to open on your phone
                    `;
                }
                
                console.log('Dynamic QR code loaded:', data.url);
            }
        }
    } catch (error) {
        console.log('Using static QR code (fallback):', error.message);
        // Keep the existing dummy QR code if dynamic loading fails
    }
}

// Detect if user is on mobile or desktop
function detectDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    currentDevice = isMobile ? 'mobile' : 'desktop';
    console.log('Detected device:', currentDevice);
    
    // Update UI classes for device-specific styling
    document.body.classList.add(`device-${currentDevice}`);
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    applyFormUIConfig();
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Add class to body to show content after scaling is ready
        setTimeout(() => {
            document.body.classList.add('scale-applied');
            
            // Force reflow to ensure smooth transition
            void document.body.offsetHeight;
        }, 50);
    }
    
    // Handle page transitions
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // When page changes, ensure scaling is maintained
                if (isMobile && !document.body.classList.contains('scale-applied')) {
                    document.body.classList.add('scale-applied');
                }
            }
        });
    });
    
    // Observe body for page changes
    observer.observe(document.body, {
        childList: true,
        subtree: false
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Load dynamic QR code
    loadDynamicQRCode();
    
    // Detect device type
    detectDeviceType();
    
    const pledgeTextarea = document.getElementById('pledge-text');
    if (pledgeTextarea) {
        pledgeTextarea.addEventListener('input', function() {
            document.getElementById('char-count').textContent = this.value.length;
            resetInactivityTimer(); // Reset timer on user input
        });
    }

    // Add event listener for capture button
    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', capturePhoto);
    }

    // Load overlay options from database
    loadOverlayOptions();
    
    // Load feedback questions from database
    loadFeedbackQuestions();

    // Start inactivity timer
    startInactivityTimer();
});


// ==================== 3. INACTIVITY TIMER FUNCTIONS ====================

// Start 5-minute inactivity countdown
function startInactivityTimer() {
    // Clear any existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Set new timer for 5 minutes
    inactivityTimer = setTimeout(() => {
        returnToLandingPage();
    }, INACTIVITY_TIMEOUT);
    
    console.log('Inactivity timer started: 5 minutes');
}

// Reset timer on user interaction
function resetInactivityTimer() {
    startInactivityTimer();
}

// Return to landing page when timeout reached
function returnToLandingPage() {
    console.log('Inactivity timeout reached - returning to landing page');
    
    // Stop camera stream if active
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Clear any existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // Reset all data
    selectedRetention = null;
    selectedTheme = 'nature';
    userData = {};
    photoData = null;
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => form.reset());
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    
    // Reset character counter if it exists
    const charCount = document.getElementById('char-count');
    if (charCount) charCount.textContent = '0';
    
    // Reset proceed button if it exists
    const proceedBtn = document.getElementById('proceedBtn');
    if (proceedBtn) proceedBtn.disabled = true;
    
    // Hide all pages correctly - each page is a .container div
    const allPages = document.querySelectorAll('.container');
    allPages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show landing page
    const landingPage = document.getElementById('landing-page');
    if (landingPage) {
        landingPage.style.display = 'flex';
    }
    
    // Show notification
    showTimeoutNotification();
    
    console.log('✅ Successfully returned to landing page');
}

// Show timeout notification message
function showTimeoutNotification() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-radius: 12px;
        padding: 16px 20px;
        color: #92400e;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6V10L12 12" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
                <circle cx="10" cy="10" r="8" stroke="#f59e0b" stroke-width="2"/>
            </svg>
            <span>Session timed out. Please start again.</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}


// ==================== 4. QUESTION MANAGEMENT FUNCTIONS ====================

// Load questions from the database
async function loadFeedbackQuestions() {
    try {
        const response = await fetch('/api/admin/questions');
        const data = await response.json();
        
        if (data.success && data.questions.length > 0) {
            updateFeedbackForm(data.questions);
        } else {
            // Show message if no questions found
            showNoQuestionsMessage();
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showNoQuestionsMessage();
    }
}

// Update the feedback form with ALL questions from database
function updateFeedbackForm(questions) {
    const container = document.getElementById('questions-container');
    if (!container) {
        console.error('Questions container not found');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (!questions || questions.length === 0) {
        console.log('No questions found');
        showNoQuestionsMessage();
        return;
    }
    
    console.log(`Loading ${questions.length} questions from database`);
    
    // Add ALL questions from database
    questions.forEach((question) => {
        if (!question.is_active) return;
        
        const questionNumber = question.display_order; 
        const questionElement = createQuestionElement(question, questionNumber);
        container.appendChild(questionElement);
    });
    
    // Add event listeners
    setTimeout(() => {
        initializeQuestionEventListeners();
    }, 100);
}

// Create question element based on question type
function createQuestionElement(question, questionNumber) {
    const questionGroup = document.createElement('div');
    questionGroup.className = 'question-group';
    questionGroup.setAttribute('data-question-id', question.id);
    
    const requiredIndicator = question.is_required ? ' *' : '';
    
    let questionHTML = `
        <label class="question-label">${questionNumber}. ${question.question_text}${requiredIndicator}</label>
    `;
    
    // Generate appropriate input based on question type
    switch (question.question_type) {
        case 'text':
            questionHTML += `
                <textarea 
                    id="q${question.id}" 
                    name="q${question.id}" 
                    rows="4" 
                    placeholder="Type your answer here..." 
                    ${question.is_required ? 'required' : ''}
                    oninput="resetInactivityTimer()"
                ></textarea>
            `;
            break;
            
        case 'yesno':
            questionHTML += `
                <div style="display: flex; gap: 15px; margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input 
                            type="radio" 
                            name="q${question.id}" 
                            value="yes" 
                            ${question.is_required ? 'required' : ''}
                            onclick="resetInactivityTimer()"
                        >
                        <span>Yes</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input 
                            type="radio" 
                            name="q${question.id}" 
                            value="no"
                            onclick="resetInactivityTimer()"
                        >
                        <span>No</span>
                    </label>
                </div>
            `;
            break;
            
        case 'rating':
            questionHTML += `
                <div class="rating-buttons" style="margin-top: 10px;">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <button 
                            type="button" 
                            class="rating-btn question-rating" 
                            data-question-id="${question.id}"
                            data-rating="${star}"
                            onclick="selectQuestionRating(${question.id}, ${star}, this); resetInactivityTimer()"
                            ${question.is_required ? 'data-required="true"' : ''}
                        >
                            ${star}
                        </button>
                    `).join('')}
                </div>
                <input 
                    type="hidden" 
                    id="q${question.id}" 
                    name="q${question.id}" 
                    ${question.is_required ? 'required' : ''}
                >
            `;
            break;
            
        case 'choice':
            if (question.options && question.options.length > 0) {
                questionHTML += `
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                        ${question.options.map(option => `
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input 
                                    type="radio" 
                                    name="q${question.id}" 
                                    value="${option.option_label}"
                                    ${question.is_required ? 'required' : ''}
                                    onclick="resetInactivityTimer()"
                                >
                                <span>${option.option_label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            }
            break;
            
        default:
            questionHTML += `
                <textarea 
                    id="q${question.id}" 
                    name="q${question.id}" 
                    rows="4" 
                    placeholder="Type your answer here..." 
                    ${question.is_required ? 'required' : ''}
                    oninput="resetInactivityTimer()"
                ></textarea>
            `;
    }
    
    questionGroup.innerHTML = questionHTML;
    return questionGroup;
}

// Handle star rating selection for dynamic questions
function selectQuestionRating(questionId, rating, element) {
    // Remove selected class from all buttons in this question group
    const questionGroup = element.closest('.question-group');
    const buttons = questionGroup.querySelectorAll('.question-rating');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    element.classList.add('selected');
    
    // Update the hidden input
    const hiddenInput = document.getElementById(`q${questionId}`);
    if (hiddenInput) {
        hiddenInput.value = rating;
    }
    
    console.log(`Selected rating ${rating} for question ${questionId}`);
}

// Initialize event listeners for dynamic questions
function initializeQuestionEventListeners() {
    console.log('Question event listeners initialized');
}

// Show message when no questions exist
function showNoQuestionsMessage() {
    const container = document.getElementById('questions-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 16px;">
                <circle cx="12" cy="12" r="10" stroke="#94a3b8" stroke-width="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <h3 style="color: #475569; margin-bottom: 8px;">No Questions Available</h3>
            <p>Please contact the administrator to set up feedback questions.</p>
        </div>
    `;
    
    // Disable submit button
    const submitBtn = document.querySelector('#feedback-page .consent-button');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'No Questions Available';
    }
}

// Helper function to determine question type
function getQuestionType(questionElement) {
    if (questionElement.querySelector('textarea')) return 'text';
    if (questionElement.querySelector('.question-rating')) return 'rating';
    if (questionElement.querySelector('input[type="radio"]')) {
        // Check if it's yes/no or multiple choice
        const radios = questionElement.querySelectorAll('input[type="radio"]');
        const values = Array.from(radios).map(radio => radio.value);
        if (values.includes('yes') && values.includes('no')) {
            return 'yesno';
        } else {
            return 'choice';
        }
    }
    return 'unknown';
}

// Validate that all required questions are answered
function validateRequiredQuestions() {
    const requiredQuestions = document.querySelectorAll('#questions-container .question-group[data-question-id]');
    
    for (const question of requiredQuestions) {
        const questionId = question.getAttribute('data-question-id');
        const isRequired = question.querySelector('[required]') !== null;
        
        if (isRequired) {
            const questionType = getQuestionType(question);
            let hasAnswer = false;
            
            switch (questionType) {
                case 'text':
                    const textarea = question.querySelector('textarea');
                    hasAnswer = textarea && textarea.value.trim() !== '';
                    break;
                    
                case 'yesno':
                case 'choice':
                    const selectedRadio = question.querySelector('input[type="radio"]:checked');
                    hasAnswer = selectedRadio !== null;
                    break;
                    
                case 'rating':
                    const hiddenInput = question.querySelector('input[type="hidden"]');
                    hasAnswer = hiddenInput && hiddenInput.value !== '';
                    break;
            }
            
            if (!hasAnswer) {
                // Scroll to the question and highlight it
                question.scrollIntoView({ behavior: 'smooth', block: 'center' });
                question.style.border = '2px solid #ef4444';
                question.style.borderRadius = '8px';
                question.style.padding = '10px';
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    question.style.border = '';
                    question.style.padding = '';
                }, 3000);
                
                return false;
            }
        }
    }
    
    return true;
}


// ==================== 5. FORM SUBMISSION FUNCTIONS ====================

// Submit feedback form with dynamic questions
function submitFeedback(event) {
    event.preventDefault();
    
    // Collect all answers
    userData.answers = {};
    
    const allQuestions = document.querySelectorAll('#questions-container .question-group[data-question-id]');
    allQuestions.forEach(question => {
        const questionId = question.getAttribute('data-question-id');
        const questionType = getQuestionType(question);
        
        let answerValue = '';
        
        switch (questionType) {
            case 'text':
                const textarea = question.querySelector('textarea');
                answerValue = textarea ? textarea.value : '';
                break;
                
            case 'yesno':
                const selectedRadio = question.querySelector('input[type="radio"]:checked');
                answerValue = selectedRadio ? selectedRadio.value : '';
                break;
                
            case 'rating':
                const hiddenInput = question.querySelector('input[type="hidden"]');
                answerValue = hiddenInput ? hiddenInput.value : '';
                break;
                
            case 'choice':
                const selectedChoice = question.querySelector('input[type="radio"]:checked');
                answerValue = selectedChoice ? selectedChoice.value : '';
                break;
        }
        
        userData.answers[questionId] = answerValue;
        userData[`q${questionId}`] = answerValue; // for backward compatibility
    });
    
    // Validate required questions
    if (!validateRequiredQuestions()) {
        alert('Please answer all required questions before continuing.');
        return;
    }
    
    document.getElementById('feedback-page').style.display = 'none';
    document.getElementById('pledge-page').style.display = 'flex';
    resetInactivityTimer();
}

// Submit user details form
function submitDetails(event) {
    event.preventDefault();
    userData.name = document.getElementById('user-name').value;
    userData.email = document.getElementById('user-email').value;
    
    if (userData.name && userData.email) {
        document.getElementById('details-page').style.display = 'none';
        document.getElementById('feedback-page').style.display = 'flex';
        resetInactivityTimer();
    }
}

// Submit pledge and redirect to appropriate photo method
function submitPledge(event) {
    event.preventDefault();
    userData.pledge = document.getElementById('pledge-text').value;

    document.getElementById('pledge-page').style.display = 'none';

    // MOBILE: Use file upload instead of camera
    if (currentDevice === 'mobile') {
        document.getElementById('file-upload-page').style.display = 'flex';
    } else {
        // DESKTOP: Use camera as before
        document.getElementById('photo-page').style.display = 'flex';
        initializeCamera();
    }

    resetInactivityTimer();
}


// ==================== 6. PHOTO HANDLING FUNCTIONS ====================

// Handle photo upload from file input (mobile)
function handlePhotoUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate it's an image file
    if (!file.type.match('image.*')) {
        alert('Please upload an image file (JPG, PNG, etc.)');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Please upload an image smaller than 5MB.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        // Set the photo data
        photoData = e.target.result;

        // Show preview
        const previewImg = document.getElementById('uploaded-photo-preview');
        const previewContainer = document.getElementById('photo-preview');
        const continueBtn = document.getElementById('upload-continue-btn');

        previewImg.src = photoData;
        previewContainer.style.display = 'block';
        continueBtn.disabled = false;

        // Auto-scroll to show preview
        previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        resetInactivityTimer();
    };

    reader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };

    reader.readAsDataURL(file);
}

// Continue to style page from upload (mobile)
function continueToStyleFromUpload() {
    if (!photoData) {
        alert('Please upload a photo first.');
        return;
    }

    document.getElementById('file-upload-page').style.display = 'none';
    document.getElementById('style-page').style.display = 'flex';
    resetInactivityTimer();

    // Update the preview immediately
    updatePreviewWithCutout();
}

// Retake photo from upload page (mobile)
function retakePhotoFromUpload() {
    // Reset file input
    document.getElementById('photo-input').value = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('upload-continue-btn').disabled = true;
    photoData = null;

    // Trigger click on file input again
    document.getElementById('photo-input').click();
}

// Initialize camera with mobile device check
async function initializeCamera() {
    // Don't initialize camera for mobile users
    if (currentDevice === 'mobile') {
        return;
    }

    try {
        console.log('Initializing camera for device:', currentDevice);
        
        // Stop any existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // Get camera stream with device-specific constraints
        const constraints = {
            video: { 
                facingMode: 'user',
                width: { ideal: currentDevice === 'mobile' ? 720 : 1280 },
                height: { ideal: currentDevice === 'mobile' ? 1280 : 720 }
            } 
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        const video = document.getElementById('video');
        video.srcObject = stream;

        // Show camera
        document.getElementById('camera-container').style.display = 'block';

        console.log('Camera initialized for', currentDevice);
        
        // Add event listener to video for user interaction
        video.addEventListener('click', resetInactivityTimer);
        
    } catch (error) {
        console.error('Camera error:', error);
        if (error.name === 'NotAllowedError') {
            alert('Camera access was denied. Please allow camera permissions to take a photo.');
        }
    }
}

// Capture photo with countdown timer (desktop) or redirect to upload (mobile)
function capturePhoto() {
    // For mobile, redirect to file upload
    if (currentDevice === 'mobile') {
        document.getElementById('photo-page').style.display = 'none';
        document.getElementById('file-upload-page').style.display = 'flex';
        resetInactivityTimer();
        return;
    }

    try {
        const captureBtn = document.getElementById('capture-btn');
        const countdownOverlay = document.getElementById('countdown-overlay');
        const countdownText = document.getElementById('countdown-text');
        
        if (!stream) {
            alert('Camera not ready. Please wait for camera to initialize.');
            return;
        }

        // Disable capture button during countdown
        captureBtn.disabled = true;
        
        let countdown = 6;
        countdownText.textContent = countdown;
        countdownOverlay.style.display = 'flex';
        console.log('Starting countdown...');

        const countdownInterval = setInterval(() => {
            countdown--;
            countdownText.textContent = countdown;
            console.log('Countdown:', countdown);
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownOverlay.style.display = 'none';
                console.log('Countdown finished, taking photo...');
                
                // Take the photo
                takePhoto();
                
                // Re-enable capture button
                captureBtn.disabled = false;
            }
        }, 1000);
    } catch (error) {
        console.error('Error in capturePhoto:', error);
        alert('Error capturing photo: ' + error.message);
    }
}

// Take photo from camera stream (desktop)
function takePhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('photo-canvas');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    photoData = canvas.toDataURL('image/png');
    
    // Stop camera stream after taking photo
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    // Immediately go to style page (don't save photo yet)
    continueToStyle();
}

// Continue to style page after photo capture
function continueToStyle() {
    if (photoData) {
        // Update the preview with properly positioned photo
        updatePreviewWithCutout();
        
        document.getElementById('photo-page').style.display = 'none';
        document.getElementById('style-page').style.display = 'flex';
        resetInactivityTimer();
    } else {
        alert('Please capture a photo first.');
    }
}

// Save original photo to server
function saveOriginalPhoto() {
    if (!photoData) return Promise.resolve();
    
    return fetch('/api/feedback/save-photo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            photo: photoData,
            userName: userData.name || 'anonymous',
            device: currentDevice
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Original photo saved successfully:', data);
        userData.photoId = data.filename;
        userData.device = currentDevice;
        return data;
    })
    .catch(error => {
        console.error('Error saving original photo:', error);
        throw error;
    });
}

// Save processed photo with overlay to server
function saveProcessedPhoto() {
    if (!userData.processedPhoto) return Promise.resolve();
    
    return fetch('/api/feedback/save-processed-photo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            photo: userData.processedPhoto,
            userName: userData.name || 'anonymous',
            device: currentDevice,
            theme: selectedTheme
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Processed photo saved:', data);
        userData.processedPhotoId = data.filename;
        return data;
    })
    .catch(error => {
        console.error('Error saving processed photo:', error);
        throw error;
    });
}


// ==================== 7. OVERLAY & THEME FUNCTIONS ====================

// Load overlay options from database
async function loadOverlayOptions() {
    const overlayOptions = document.getElementById('overlay-options');
    if (!overlayOptions) return;

    try {
        // Fetch overlays from the API
        const response = await fetch('/api/admin/overlays');
        const data = await response.json();
        
        if (data.success && data.overlays.length > 0) {
            // Clear existing options
            overlayOptions.innerHTML = '';
            
            // Create theme options from database data
            data.overlays.forEach(overlay => {
                const themeOption = document.createElement('div');
                themeOption.className = 'theme-option';
                themeOption.onclick = () => selectTheme(overlay.theme_id, themeOption);
                
                // Generate a consistent color based on theme_id
                const color = generateColorFromThemeId(overlay.theme_id);
                
                themeOption.innerHTML = `
                    <div class="theme-swatch" style="background: ${color};"></div>
                    <div class="theme-name">${overlay.display_name}</div>
                `;
                
                overlayOptions.appendChild(themeOption);
            });

            // Select the first theme by default
            setTimeout(() => {
                const firstTheme = document.querySelector('.theme-option');
                if (firstTheme && data.overlays.length > 0) {
                    const firstThemeId = data.overlays[0].theme_id;
                    const firstThemeName = data.overlays[0].display_name;
                    selectTheme(firstThemeId, firstTheme);
                    
                    // Update the selected overlay name display
                    document.getElementById('selected-overlay-name').textContent = firstThemeName;
                }
            }, 100);
            
        } else {
            // Fallback to default themes if no overlays in database
            loadDefaultOverlayOptions();
        }
    } catch (error) {
        console.error('Error loading overlays:', error);
        // Fallback to default themes
        loadDefaultOverlayOptions();
    }
}

// Fallback function for default overlays
function loadDefaultOverlayOptions() {
    const overlayOptions = document.getElementById('overlay-options');
    if (!overlayOptions) return;
    
    const defaultThemes = [
        { theme_id: 'nature', display_name: 'Nature Theme' },
        { theme_id: 'modern', display_name: 'Modern Theme' },
        { theme_id: 'vintage', display_name: 'Vintage Theme' }
    ];
    
    defaultThemes.forEach(theme => {
        const themeOption = document.createElement('div');
        themeOption.className = 'theme-option';
        themeOption.onclick = () => selectTheme(theme.theme_id, themeOption);
        
        const color = generateColorFromThemeId(theme.theme_id);
        
        themeOption.innerHTML = `
            <div class="theme-swatch" style="background: ${color};"></div>
            <div class="theme-name">${theme.display_name}</div>
        `;
        
        overlayOptions.appendChild(themeOption);
    });

    // Select first default theme
    setTimeout(() => {
        const firstTheme = document.querySelector('.theme-option');
        if (firstTheme) {
            selectTheme(defaultThemes[0].theme_id, firstTheme);
            document.getElementById('selected-overlay-name').textContent = defaultThemes[0].display_name;
        }
    }, 100);
}

// Generate consistent colors from theme_id
function generateColorFromThemeId(themeId) {
    const colors = [
        '#10b981', '#22c55e', '#06b6d4', '#84cc16', '#3b82f6',
        '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#6366f1'
    ];
    
    // Simple hash to get consistent color for same theme_id
    let hash = 0;
    for (let i = 0; i < themeId.length; i++) {
        hash = themeId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Select theme and update preview
function selectTheme(theme, element) {
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedTheme = theme;
    
    // Update the selected overlay name display
    const selectedOption = element.querySelector('.theme-name');
    if (selectedOption) {
        document.getElementById('selected-overlay-name').textContent = selectedOption.textContent;
    }
    
    // Update preview with selected theme and device
    updateThemePreview();
    resetInactivityTimer();
}

// Update theme preview with correct file paths
function updateThemePreview() {
    const overlayImage = document.getElementById('selected-overlay');
    
    // correct path based on file structure
    const overlayPath = `/assets/overlays/${currentDevice === 'mobile' ? 'MobileOverlay' : 'DesktopOverlay'}/${selectedTheme}Theme${currentDevice === 'mobile' ? 'Mobile' : 'Desktop'}.png`;
    
    console.log('Loading overlay from:', overlayPath);
    overlayImage.src = overlayPath;
    
    // Also update the preview photo if it exists
    updatePreviewWithCutout();
}

// Update preview with cutout and overlay positioning
function updatePreviewWithCutout() {
    const previewPhoto = document.getElementById('preview-photo');
    const overlayImage = document.getElementById('selected-overlay');
    
    if (!previewPhoto || !overlayImage) return;
    
    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d');
    
    // Set canvas size to match preview frame
    const previewDimensions = {
        'desktop': { width: 800, height: 450 },
        'mobile': { width: 324, height: 405 }
    };
    
    const dimensions = previewDimensions[currentDevice];
    previewCanvas.width = dimensions.width;
    previewCanvas.height = dimensions.height;
    
    // Cutout dimensions and positions for preview (scaled down from original)
    const cutoutSpecs = {
        'desktop': {
            cutoutWidth: 640,  // 1536 * (800/1920)
            cutoutHeight: 360, // 864 * (450/1080)
            cutoutX: 80,       // 192 * (800/1920)
            cutoutY: 23        // 55 * (450/1080)
        },
        'mobile': {
            cutoutWidth: 259,  // 864 * (324/1080)
            cutoutHeight: 324, // 1080 * (405/1350)
            cutoutX: 32,       // 108 * (324/1080)
            cutoutY: 15        // 51 * (405/1350)
        }
    };
    
    const cutout = cutoutSpecs[currentDevice];
    
    const img = new Image();
    img.onload = function() {
        // Fill background with white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Calculate scaling to fill the cutout (cover style)
        const scale = Math.max(
            cutout.cutoutWidth / img.width,
            cutout.cutoutHeight / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the scaled image in the cutout
        const x = cutout.cutoutX + (cutout.cutoutWidth - scaledWidth) / 2;
        const y = cutout.cutoutY + (cutout.cutoutHeight - scaledHeight) / 2;
        
        // Draw the scaled photo in the cutout area
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Update the preview image
        previewPhoto.src = previewCanvas.toDataURL('image/png');
        
        console.log('Preview updated with cutout positioning');
    };
    
    img.src = photoData;
}

// Process final photo with overlay for final submission
function processFinalPhoto() {
    return new Promise((resolve) => {
        if (!photoData) {
            resolve();
            return;
        }
        
        // Create a canvas to combine photo and overlay
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on device (full size)
        const deviceDimensions = {
            'desktop': { width: 1920, height: 1080 },
            'mobile': { width: 1080, height: 1350 }
        };
        
        const dimensions = deviceDimensions[currentDevice];
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        
        // Cutout dimensions and positions based on device (full size)
        const cutoutSpecs = {
            'desktop': {
                cutoutWidth: 1536,
                cutoutHeight: 864,
                cutoutX: 192,
                cutoutY: 55
            },
            'mobile': {
                cutoutWidth: 864,
                cutoutHeight: 1080,
                cutoutX: 108,
                cutoutY: 51
            }
        };
        
        const cutout = cutoutSpecs[currentDevice];
        
        // Load the original photo
        const img = new Image();
        img.onload = function() {
            // Fill background with white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate scaling to fill the cutout (cover style)
            const scale = Math.max(
                cutout.cutoutWidth / img.width,
                cutout.cutoutHeight / img.height
            );
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            // Center the scaled image in the cutout
            const x = cutout.cutoutX + (cutout.cutoutWidth - scaledWidth) / 2;
            const y = cutout.cutoutY + (cutout.cutoutHeight - scaledHeight) / 2;
            
            // Draw the scaled photo in the cutout area
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Load and apply the overlay (border)
            const overlayImg = new Image();
            overlayImg.onload = function() {
                // Draw the overlay on top (this should be the border with transparent cutout)
                ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
                
                // Save the final processed photo data (but don't save to server yet)
                userData.processedPhoto = canvas.toDataURL('image/png');
                
                console.log('Final photo processed with overlay and proper cutout positioning');
                resolve();
            };
            
            const overlayPath = `/assets/overlays/${currentDevice === 'mobile' ? 'MobileOverlay' : 'DesktopOverlay'}/${selectedTheme}Theme${currentDevice === 'mobile' ? 'Mobile' : 'Desktop'}.png`;
            console.log('Processing final photo with overlay:', overlayPath);
            overlayImg.src = overlayPath;
            
            // If overlay fails to load, still proceed with the base photo
            overlayImg.onerror = function() {
                console.error('Failed to load overlay:', overlayPath);
                userData.processedPhoto = canvas.toDataURL('image/png');
                resolve();
            };
        };
        
        img.src = photoData;
    });
}


// ==================== 8. PAGE NAVIGATION FUNCTIONS ====================

// Show consent page from landing page
function showConsentPage() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('consent-page').style.display = 'flex';
    resetInactivityTimer();
}

// Select retention option on consent page
function selectOption(option, element) {
    document.querySelectorAll('.retention-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedRetention = option;
    document.getElementById('proceedBtn').disabled = false;
    resetInactivityTimer();
}

// Show details page from consent page
function showDetailsPage() {
    if (selectedRetention) {
        document.getElementById('consent-page').style.display = 'none';
        document.getElementById('details-page').style.display = 'flex';
        resetInactivityTimer();
    }
}

// Retake photo from style page
function retakePhotoFromStyle() {
    // Hide style page
    document.getElementById('style-page').style.display = 'none';
    
    // Show appropriate photo page based on device
    if (currentDevice === 'mobile') {
        // For mobile users, go to file upload page
        document.getElementById('file-upload-page').style.display = 'flex';
    } else {
        // For desktop users, go to camera capture page
        document.getElementById('photo-page').style.display = 'flex';
        // Reinitialize camera for desktop
        initializeCamera();
    }
    
    resetInactivityTimer();
}

// Confirm style and proceed to confirmation page
function confirmStyle() {
    // Process the final photo with overlay but doesnt save yet
    processFinalPhoto().then(() => {
        document.getElementById('style-page').style.display = 'none';
        document.getElementById('confirmation-page').style.display = 'flex';
        resetInactivityTimer();
        
        // Update confirmation page details
        updateConfirmationDetails();
    });
}

// Update confirmation page with user data
function updateConfirmationDetails() {
    // Update confirmation page with user data
    document.getElementById('confirm-name').textContent = userData.name || 'Not provided';
    document.getElementById('confirm-email').textContent = userData.email || 'Not provided';
    document.getElementById('confirm-pledge').textContent = userData.pledge || 'Not provided';
    document.getElementById('confirm-theme').textContent = selectedTheme;
    document.getElementById('confirm-retention').textContent = selectedRetention === 'indefinite' ? 'Indefinite' : '7 Days';
    
    // Show how many questions were answered
    const answeredCount = Object.keys(userData.answers || {}).length;
    document.getElementById('confirm-questions').textContent = `${answeredCount} questions answered`;
}

// Go back from confirmation to style page
function goBackToStyle() {
    document.getElementById('confirmation-page').style.display = 'none';
    document.getElementById('style-page').style.display = 'flex';
    resetInactivityTimer();
}

// Final submission with photo saving
function finalSubmit() {
    const submitBtn = document.querySelector('#confirmation-page .consent-button');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="white" stroke-width="1.5"/>
            <path d="M10 6V10L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Submitting...
    `;
    submitBtn.disabled = true;
    
    // Clear inactivity timer since submission is in progress
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    
    // Save photos and submit data only when user confirms
    Promise.all([
        saveOriginalPhoto(),
        saveProcessedPhoto()
    ]).then(() => {
        // Send final submission to server
        return fetch('/api/feedback/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userData: userData,
                device: currentDevice,
                theme: selectedTheme,
                retention: selectedRetention
            })
        });
    }).then(response => response.json())
    .then(data => {
        console.log('Feedback submitted successfully:', data);
        
        // Show thank you page
        document.getElementById('confirmation-page').style.display = 'none';
        document.getElementById('thankyou-page').style.display = 'flex';
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback. Please try again.');
        
        // Reset button on error
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Restart timer since submission failed
        startInactivityTimer();
    });
}

// Reset everything and return to landing page for new submission
function submitAnother() {
    // Stop camera stream if still active
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Reset all data
    selectedRetention = null;
    selectedTheme = 'nature';
    userData = {};
    photoData = null;
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => form.reset());
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('proceedBtn').disabled = true;
    document.getElementById('char-count').textContent = '0';
    
    // Go back to landing page
    document.getElementById('thankyou-page').style.display = 'none';
    document.getElementById('landing-page').style.display = 'flex';
    
    // Restart inactivity timer
    startInactivityTimer();
}


// ==================== 9. BACK NAVIGATION FUNCTIONS ====================

// From Consent to Landing
function goBackToLanding() {
    document.getElementById('consent-page').style.display = 'none';
    document.getElementById('landing-page').style.display = 'flex';
    resetInactivityTimer();
}

// From Details to Consent
function goBackToConsent() {
    document.getElementById('details-page').style.display = 'none';
    document.getElementById('consent-page').style.display = 'flex';
    resetInactivityTimer();
}

// From Feedback to Details
function goBackToDetails() {
    document.getElementById('feedback-page').style.display = 'none';
    document.getElementById('details-page').style.display = 'flex';
    resetInactivityTimer();
}

// From Pledge to Feedback
function goBackToFeedback() {
    document.getElementById('pledge-page').style.display = 'none';
    document.getElementById('feedback-page').style.display = 'flex';
    resetInactivityTimer();
}

// From Photo/Upload to Pledge
function goBackToPledge() {
    // Stop camera stream if active (for desktop)
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Hide both photo pages
    document.getElementById('photo-page').style.display = 'none';
    document.getElementById('file-upload-page').style.display = 'none';
    
    // Show pledge page
    document.getElementById('pledge-page').style.display = 'flex';
    
    resetInactivityTimer();
}

// From Style to Photo/Upload
function goBackToPhoto() {
    // Hide style page
    document.getElementById('style-page').style.display = 'none';
    
    // Show appropriate photo page based on device
    if (currentDevice === 'mobile') {
        document.getElementById('file-upload-page').style.display = 'flex';
    } else {
        document.getElementById('photo-page').style.display = 'flex';
        // Reinitialize camera for desktop
        initializeCamera();
    }
    
    resetInactivityTimer();
}


// ==================== 10. EVENT LISTENERS & CLEANUP ====================

// Clean up camera when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
});

// Add event listeners for user interactions to reset timer
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

// ==================== 11. LEADERBOARD NAVIGATION ====================

// Navigate to leaderboard page
function viewLeaderboard() {
    window.location.href = '/leaderboard';
}

// ==================== 7. FORM UI CONFIGURATION ====================
// Load and apply form UI settings from server config

async function applyFormUIConfig() {
  try {
    const response = await fetch('/api/feedback/form-ui');
    const config = await response.json();

    // Apply background (CSS variable)
    if (config.background) {
      document.documentElement.style.setProperty('--form-bg', config.background);
    }

    // Apply landing page title
    const titleElement = document.getElementById('form-landing-title');
    if (titleElement && config.landingTitle) {
      titleElement.textContent = config.landingTitle;
    }

    // Apply landing page subtitle
    const subtitleElement = document.getElementById('form-landing-subtitle');
    if (subtitleElement && config.landingSubtitle) {
      subtitleElement.textContent = config.landingSubtitle;
    }
  } catch (error) {
    console.error('Error applying form UI configuration:', error);
  }
}