// frontend/js/navigation.js
// Central Navigation System for ESG Kiosk - DEBUGGING VERSION

class NavigationSystem {
    constructor() {
        this.currentScreen = null;
        this.appState = {
            hasConsented: false,
            currentRating: 0,
            userData: {
                name: '',
                email: '',
                feedback: '',
                pledge: ''
            }
        };
        
        this.initializeNavigation();
    }

    // Initialize the navigation system
    initializeNavigation() {
        console.log('🚀 Initializing navigation system...');
        
        // Set up event listeners
        this.setupNavigationEvents();
        
        // Start with welcome screen
        this.showScreen('welcomeScreen');
        
        console.log('✅ Navigation system initialized');
    }

    // Set up event delegation for all navigation buttons
    setupNavigationEvents() {
        console.log('🔧 Setting up navigation events...');
        
        document.addEventListener('click', (event) => {
            console.log('🎯 Click event detected on:', event.target);
            
            // Handle next buttons
            const nextButton = event.target.closest('[data-next-screen]');
            if (nextButton) {
                console.log('➡️ Next button clicked:', nextButton);
                event.preventDefault();
                event.stopPropagation(); // Prevent other handlers
                this.handleNextButton(nextButton);
                return;
            }
            
            // Handle back buttons
            const backButton = event.target.closest('[data-back-button]');
            if (backButton) {
                console.log('⬅️ Back button clicked:', backButton);
                event.preventDefault();
                event.stopPropagation(); // Prevent other handlers
                this.goBack();
                return;
            }
            
            console.log('🎯 Click was not on navigation button');
        });

        // Handle Enter key on form inputs
        document.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const input = event.target;
                if (input.form && input.closest('.screen.active')) {
                    const nextButton = input.form.querySelector('[data-next-screen]');
                    if (nextButton) {
                        event.preventDefault();
                        this.handleNextButton(nextButton);
                    }
                }
            }
        });
        
        console.log('✅ Navigation events setup complete');
    }

    // Handle next button clicks with validation
    handleNextButton(button) {
        console.log('🔄 Handling next button...');
        const currentScreen = this.getCurrentScreen();
        console.log('Current screen:', currentScreen);

        if (!currentScreen) {
            console.error('❌ No current screen found');
            return;
        }

        const validateType = button.getAttribute('data-validate');
        console.log('Validation type:', validateType);
        
        // Run validation if required
        if (validateType && !this.runValidation(validateType)) {
            console.log('❌ Validation failed');
            return; // Validation failed - don't proceed
        }

        // Save form data from current screen
        this.saveScreenData(currentScreen);

        // Navigate to next screen
        this.navigateToNext(currentScreen);
    }

    // Run specific validation rules
    runValidation(validateType) {
        console.log('🔍 Running validation:', validateType);
        switch (validateType) {
            case 'consent':
                return this.validateConsent();
            case 'name':
                return this.validateName();
            case 'photo':
                return this.validatePhoto();
            default:
                return true; // No validation required
        }
    }

    // Validate consent requirements
    validateConsent() {
        const cameraConsent = document.getElementById('cameraConsent')?.checked;
        const dataConsent = document.getElementById('dataConsent')?.checked;
        
        console.log('📝 Consent validation - camera:', cameraConsent, 'data:', dataConsent);
        
        if (!cameraConsent || !dataConsent) {
            alert('Please consent to both camera usage and data privacy policy to continue.');
            return false;
        }
        
        this.appState.hasConsented = true;
        return true;
    }

    // Validate name input
    validateName() {
        const nameInput = document.getElementById('name');
        if (!nameInput) return true;

        const name = nameInput.value.trim();
        console.log('📝 Name validation:', name);

        if (!name) {
            alert('Please enter your name');
            nameInput.focus();
            return false;
        }

        const nameRegex = /^[a-zA-Z0-9\s\-'.]{1,50}$/;
        if (!nameRegex.test(name)) {
            alert('Please enter a valid name (letters, spaces, hyphens, and apostrophes only)');
            nameInput.focus();
            return false;
        }

        return true;
    }

    // Validate photo capture
    validatePhoto() {
        console.log('📸 Photo validation - capturedPhotoData:', !!window.capturedPhotoData, 'processedPhotoUrl:', !!window.processedPhotoUrl);
        
        if (!window.capturedPhotoData && !window.processedPhotoUrl) {
            const proceed = confirm('No photo taken. Would you like to continue without a photo?');
            return proceed;
        }
        return true;
    }

    // Save data from current screen
    saveScreenData(screenId) {
        console.log('💾 Saving screen data for:', screenId);
        switch (screenId) {
            case 'feedbackScreen':
                this.appState.currentRating = window.currentRating || 0;
                this.appState.userData.feedback = document.getElementById('feedback')?.value || '';
                break;
            case 'pledgeScreen':
                this.appState.userData.pledge = document.getElementById('pledge')?.value || '';
                break;
            case 'detailsScreen':
                this.appState.userData.name = document.getElementById('name')?.value?.trim() || '';
                this.appState.userData.email = document.getElementById('email')?.value?.trim() || '';
                break;
        }
        console.log('💾 App state saved:', this.appState);
    }

    // Navigate to next screen based on flow configuration
    navigateToNext(currentScreenId) {
        console.log('🧭 Navigating from:', currentScreenId);
        
        if (!window.screenFlow) {
            console.error('❌ screenFlow not found!');
            return;
        }

        const nextScreen = window.screenFlow.getNextScreen(currentScreenId, this.appState);
        console.log('Next screen:', nextScreen);
        
        if (nextScreen) {
            this.showScreen(nextScreen);
        } else {
            console.error('❌ No next screen defined for:', currentScreenId);
        }
    }

    // Show a specific screen
    showScreen(screenId) {
        console.log('🖥️ Showing screen:', screenId);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            console.log('✅ Screen activated:', screenId);
            
            // Initialize screen-specific logic
            this.initializeScreen(screenId);
        } else {
            console.error('❌ Screen not found:', screenId);
        }
    }

    // Initialize screen-specific logic
    initializeScreen(screenId) {
        console.log('⚙️ Initializing screen:', screenId);
        switch (screenId) {
            case 'photoScreen':
                if (typeof window.initializePhotoScreen === 'function') {
                    window.initializePhotoScreen();
                }
                break;
            case 'confirmationScreen':
                if (typeof window.updateConfirmationDetails === 'function') {
                    window.updateConfirmationDetails(this.appState);
                }
                break;
        }
    }

    // Get current active screen
    getCurrentScreen() {
        const activeScreen = document.querySelector('.screen.active')?.id;
        console.log('🔍 Current active screen:', activeScreen);
        return activeScreen;
    }

    // Go back to previous screen - FIXED VERSION
    goBack() {
        console.log('🔙 BACK BUTTON PRESSED - Starting back navigation...');
        
        const currentScreen = this.getCurrentScreen();
        console.log('Current screen for back:', currentScreen);

        if (!currentScreen) {
            console.log('No current screen, going to welcome');
            this.showScreen('welcomeScreen');
            return;
        }

        if (!window.screenFlow) {
            console.error('❌ screenFlow not available!');
            this.showScreen('welcomeScreen');
            return;
        }

        const previousScreen = window.screenFlow.getPreviousScreen(currentScreen);
        console.log('Previous screen from flow:', previousScreen);
        
        if (previousScreen) {
            console.log('🔄 Going back to:', previousScreen);
            this.showScreen(previousScreen);
        } else {
            console.log('No previous screen defined, going to welcome');
            this.showScreen('welcomeScreen');
        }
    }

    // Reset the entire application
    resetApp() {
        console.log('🔄 Resetting application...');
        this.appState = {
            hasConsented: false,
            currentRating: 0,
            userData: {
                name: '',
                email: '',
                feedback: '',
                pledge: ''
            }
        };
        
        // Reset global variables
        window.currentRating = 0;
        window.capturedPhotoData = null;
        window.processedPhotoUrl = null;
        
        // Clear form inputs
        this.clearForms();
        
        // Return to welcome screen
        this.showScreen('welcomeScreen');
    }

    // Clear all form inputs
    clearForms() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'button' && input.type !== 'submit') {
                input.value = '';
            }
        });

        // Reset checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset rating stars
        if (typeof window.setRating === 'function') {
            window.setRating(0);
        }
    }

    // Get current app state (for debugging)
    getAppState() {
        return { ...this.appState };
    }
}

// Initialize navigation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded - Initializing navigation...');
    window.navigationSystem = new NavigationSystem();
    console.log('✅ Navigation system ready');
});

// Debug function
window.debugNav = function() {
    console.log('🔍 NAVIGATION DEBUG:');
    console.log('Current screen:', window.navigationSystem?.currentScreen);
    console.log('ScreenFlow available:', !!window.screenFlow);
    if (window.navigationSystem && window.screenFlow) {
        const current = window.navigationSystem.currentScreen;
        console.log('Back target:', window.screenFlow.getPreviousScreen(current));
    }
};