// frontend/js/screen-flow.js
// Screen Flow Configuration for ESG Kiosk - SIMPLIFIED WITH EXPLICIT BACK

class ScreenFlow {
    constructor() {
        this.flowConfig = {
            // Welcome screen always goes to consent
            welcomeScreen: {
                next: 'consentScreen',
                back: null, // No back from welcome
                description: 'Welcome to ESG Centre'
            },
            
            // Consent screen requires validation before proceeding
            consentScreen: {
                next: 'detailsScreen',
                back: 'welcomeScreen',
                validate: 'consent',
                description: 'Privacy and consent agreement',
                businessRule: 'User must consent to camera usage and data privacy'
            },

            // Details screen requires name validation
            detailsScreen: {
                next: 'feedbackScreen',
                back: 'consentScreen',
                validate: 'name',
                description: 'User personal details',
                businessRule: 'Name is required and must be valid'
            },
            
            // Feedback screen - no special validation
            feedbackScreen: {
                next: 'pledgeScreen',
                back: 'detailsScreen',
                description: 'User feedback and rating'
            },
            
            // Pledge screen - no special validation
            pledgeScreen: {
                next: 'photoScreen',
                back: 'feedbackScreen',
                description: 'Sustainability pledge'
            },
            
            // Photo screen - optional, with confirmation
            photoScreen: {
                next: 'confirmationScreen',
                back: 'pledgeScreen',
                validate: 'photo',
                description: 'Photo capture with RP overlay',
                businessRule: 'Photo is optional but recommended'
            },
            
            // Confirmation screen goes to thank you
            confirmationScreen: {
                next: 'thankYouScreen',
                back: 'photoScreen',
                description: 'Review and submit feedback'
            },
            
            // Thank you screen can restart the flow
            thankYouScreen: {
                next: 'welcomeScreen',
                back: 'confirmationScreen',
                description: 'Submission confirmation'
            }
        };

        console.log('✅ Screen flow configuration loaded with explicit back navigation');
    }

    // Get the next screen based on current screen
    getNextScreen(currentScreenId, appState = {}) {
        const currentConfig = this.flowConfig[currentScreenId];
        
        if (!currentConfig) {
            console.error('❌ No configuration found for screen:', currentScreenId);
            return null;
        }

        console.log(`🔄 Navigation: ${currentScreenId} → ${currentConfig.next}`);
        return currentConfig.next;
    }

    // Get the previous screen explicitly defined in config
    getPreviousScreen(currentScreenId) {
        const currentConfig = this.flowConfig[currentScreenId];
        
        if (!currentConfig) {
            console.error('❌ No configuration found for screen:', currentScreenId);
            return this.getFallbackPreviousScreen(currentScreenId);
        }

        const previousScreen = currentConfig.back;
        console.log(`🔙 Back navigation: ${currentScreenId} → ${previousScreen}`);
        
        return previousScreen;
    }

    // Fallback logic for previous screen when no explicit back defined
    getFallbackPreviousScreen(currentScreenId) {
        const fallbackMap = {
            'consentScreen': 'welcomeScreen',
            'detailsScreen': 'consentScreen',
            'feedbackScreen': 'detailsScreen',
            'pledgeScreen': 'feedbackScreen',
            'photoScreen': 'pledgeScreen',
            'confirmationScreen': 'photoScreen',
            'thankYouScreen': 'confirmationScreen'
        };

        const fallbackScreen = fallbackMap[currentScreenId] || 'welcomeScreen';
        return fallbackScreen;
    }

    // Check if a screen requires validation
    requiresValidation(screenId) {
        const config = this.flowConfig[screenId];
        return config && config.validate;
    }

    // Get validation type for a screen
    getValidationType(screenId) {
        const config = this.flowConfig[screenId];
        return config ? config.validate : null;
    }

    // Update the flow configuration
    updateFlow(newFlowConfig) {
        if (this.validateFlowConfig(newFlowConfig)) {
            this.flowConfig = { ...this.flowConfig, ...newFlowConfig };
            console.log('✅ Screen flow updated successfully');
            return true;
        } else {
            console.error('❌ Invalid flow configuration');
            return false;
        }
    }

    // Validate flow configuration integrity
    validateFlowConfig(config) {
        const requiredScreens = [
            'welcomeScreen', 'consentScreen', 'feedbackScreen', 
            'pledgeScreen', 'detailsScreen', 'photoScreen', 
            'confirmationScreen', 'thankYouScreen'
        ];

        // Check all required screens are present
        for (const screenId of requiredScreens) {
            if (!config[screenId]) {
                console.error(`Missing screen configuration: ${screenId}`);
                return false;
            }

            if (!config[screenId].next) {
                console.error(`Missing next screen for: ${screenId}`);
                return false;
            }

            // Back is optional, but recommended
            if (config[screenId].back === undefined) {
                console.warn(`No back screen defined for: ${screenId}, will use fallback`);
            }
        }

        return true;
    }

    // Get the entire flow as a readable string
    getFlowDescription() {
        let flow = 'Screen Flow:\n';
        
        for (const [screenId, config] of Object.entries(this.flowConfig)) {
            flow += `📱 ${screenId}\n`;
            flow += `   → Next: ${config.next}\n`;
            flow += `   ← Back: ${config.back || 'none'}\n`;
            if (config.validate) {
                flow += `   ✓ Validation: ${config.validate}\n`;
            }
            flow += `   📝 ${config.description}\n\n`;
        }

        return flow;
    }

    // Get screen configuration for debugging
    getScreenConfig(screenId) {
        return this.flowConfig[screenId] || null;
    }

    // Get the complete flow configuration (read-only)
    getFlowConfig() {
        return JSON.parse(JSON.stringify(this.flowConfig));
    }
}

// Initialize screen flow when loaded
window.screenFlow = new ScreenFlow();

// Easy-to-use function for frontend team to modify flow order
window.updateScreenFlow = function(newFlowOrder) {
    return window.screenFlow.updateFlow(newFlowOrder);
};

// Debug function to show current flow
window.showFlow = function() {
    console.log(window.screenFlow.getFlowDescription());
};