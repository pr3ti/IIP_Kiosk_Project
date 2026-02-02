// ============================================================
// KIOSK-STATUS-MONITOR.JS - TABLE OF CONTENTS (CTRL+F SEARCHABLE)
// ============================================================
// 
// 1. CONFIGURATION & STATE VARIABLES
//    const CHECK_INTERVAL                 - Interval for status checks (10 seconds) (DONE BY PRETI)
//    const CONSECUTIVE_FAILURES_THRESHOLD - Number of failures before redirect (DONE BY PRETI)
//    let consecutiveFailures              - Counter for consecutive failed checks (DONE BY PRETI)
//    let statusCheckInterval              - Interval timer reference (DONE BY PRETI)
//    let isMonitoring                     - Flag indicating if monitoring is active (DONE BY PRETI)
// 
// 2. STATUS CHECKING FUNCTIONS
//    async function checkKioskStatus()    - Check if kiosk server is online (DONE BY PRETI)
// 
// 3. FAILURE & OFFLINE HANDLING
//    function handleFailure()             - Handle failed status check (DONE BY PRETI)
//    function handleServerOffline()       - Handle confirmed server offline status (DONE BY PRETI)
//    function redirectToOffline()         - Redirect to offline page via gateway (DONE BY PRETI)
// 
// 4. MONITORING CONTROL FUNCTIONS
//    function startMonitoring()           - Start monitoring kiosk status (DONE BY PRETI)
//    function stopMonitoring()            - Stop monitoring kiosk status (DONE BY PRETI)
//
// 5. INITIALIZATION
//    function init()                      - Initialize monitoring when page loads (DONE BY PRETI)
//
// ============================================================

(function() {
    'use strict';
    
    // =================== 1. CONFIGURATION & STATE VARIABLES =================== 
    // Check interval set to 10 seconds
    const CHECK_INTERVAL = 10000;
    
    // Redirect after 2 consecutive failures
    const CONSECUTIVE_FAILURES_THRESHOLD = 2;
    
    // Counter for consecutive failed checks
    let consecutiveFailures = 0;
    
    // Interval timer reference
    let statusCheckInterval = null;
    
    // Flag indicating if monitoring is active
    let isMonitoring = false;
    
    // =================== 2. STATUS CHECKING FUNCTIONS =================== 
    // Check if kiosk server is online via status endpoint
    async function checkKioskStatus() {
        try {
            const response = await fetch('/api/status', {
                method: 'GET',
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                console.warn('Status check failed - server may be offline');
                handleFailure();
                return;
            }
            
            const data = await response.json();
            
            // Check if kiosk is offline
            if (data.online === false) {
                console.log('Kiosk server is offline - redirecting...');
                handleServerOffline(data);
                return;
            }
            
            // Server is online - reset failure counter
            if (data.online === true) {
                consecutiveFailures = 0;
            }
            
        } catch (error) {
            console.warn('Error checking kiosk status:', error.message);
            handleFailure();
        }
    }
    
    // =================== 3. FAILURE & OFFLINE HANDLING =================== 
    // Increment failure counter and redirect if threshold reached
    function handleFailure() {
        consecutiveFailures++;
        
        if (consecutiveFailures >= CONSECUTIVE_FAILURES_THRESHOLD) {
            console.log(`${consecutiveFailures} consecutive failures - server appears offline`);
            redirectToOffline();
        }
    }
    
    // Handle confirmed server offline status from API
    function handleServerOffline(statusData) {
        console.log('Server status:', statusData);
        
        // Stop monitoring before redirect
        stopMonitoring();
        
        // Redirect to trigger offline page
        redirectToOffline();
    }
    
    // Reload page so gateway serves offline.html
    function redirectToOffline() {
        console.log('Redirecting to offline page...');
        
        // Stop monitoring
        stopMonitoring();
        
        // Reload page - gateway will serve offline.html when kiosk is offline
        window.location.reload();
    }
    
    // =================== 4. MONITORING CONTROL FUNCTIONS =================== 
    // Start periodic status checking
    function startMonitoring() {
        if (isMonitoring) {
            console.log('Status monitoring already running');
            return;
        }
        
        console.log('Starting kiosk status monitoring...');
        console.log(`Checking every ${CHECK_INTERVAL / 1000} seconds`);
        
        isMonitoring = true;
        consecutiveFailures = 0;
        
        // Check immediately
        checkKioskStatus();
        
        // Then check periodically
        statusCheckInterval = setInterval(checkKioskStatus, CHECK_INTERVAL);
    }
    
    // Stop periodic status checking and clear interval
    function stopMonitoring() {
        if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
            statusCheckInterval = null;
        }
        isMonitoring = false;
        console.log('Stopped kiosk status monitoring');
    }
    
    // =================== 5. INITIALIZATION =================== 
    // Initialize monitoring when page loads and expose control methods
    function init() {
        // Start monitoring when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startMonitoring);
        } else {
            // DOM already loaded
            startMonitoring();
        }
        
        // Clean up on page unload
        window.addEventListener('beforeunload', stopMonitoring);
        
        // Expose to window for manual control if needed
        window.kioskStatusMonitor = {
            start: startMonitoring,
            stop: stopMonitoring,
            checkNow: checkKioskStatus,
            isRunning: () => isMonitoring
        };
    }
    
    // Auto-initialize
    init();
    
    console.log('Kiosk Status Monitor loaded');
})();