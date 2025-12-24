// ============================================================
// TREE.JS - TABLE OF CONTENTS
// ============================================================
// 
// CLASS: TreeManager
//   - constructor()               - Initialize TreeManager instance
// 
// INITIALIZATION & SETUP
//   - init()                     - Initialize tree and load data
//   - loadTreeImage()            - Load tree images with promises
//   - fetchVisitorData()         - Fetch visitor data from API
// 
// TREE VISUALIZATION
//   - createLeaves()             - Create leaf elements for visitors
//   - calculateOvalArea()        - Calculate oval area for leaf placement
//   - updateOvalOverlay()        - Update visual oval overlay
//   - createLeaf()               - Create individual leaf element
//   - findRandomPositionInOval() - Find random position within oval area
// 
// VISUAL EFFECTS & UPDATES
//   - updateLeavesTransparency() - Update tree transparency based on visitors
//   - refreshTree()              - Refresh entire tree visualization
// 
// TREE CONFIGURATION
//   - setOvalPosition()          - Set oval position offsets
//   - addVisitor()               - Add new visitor to tree (manual)
// 
// GLOBAL FUNCTIONS & EVENT LISTENERS
//   - Window load event          - Initialize TreeManager
//   - Auto-refresh interval      - Refresh tree data every 30 seconds
//   - Window resize event        - Refresh tree on resize
// 
// ============================================================

class TreeManager {
    // ==================== INITIALIZATION ====================
    
    constructor() {
        // DOM Elements
        this.treeImage = document.getElementById('treeImage');
        this.treeImageLeaves = document.getElementById('treeImageLeaves');
        this.leavesContainer = document.getElementById('leavesContainer');
        this.loadingMessage = document.getElementById('loadingMessage');
        this.transparencyInfo = document.getElementById('transparencyInfo');
        this.transparencyValue = document.getElementById('transparencyValue');
        
        // Data storage
        this.visitors = [];
        
        // Tree configuration
        this.ovalWidth = 1400;
        this.ovalHeight = 500;
        this.ovalTopOffset = -180;
        this.ovalBottomOffset = 50;
        this.transparencyStep = 0.05;
        this.usersPerStep = 2;
        
        // Initialize the tree manager
        this.init();
    }
    
    // ==================== SETUP METHODS ====================
    
    /**
     * Initialize the tree manager
     */
    async init() {
        await this.loadTreeImage();
        await this.fetchVisitorData();
        this.createLeaves();
        this.updateLeavesTransparency();
        this.loadingMessage.style.display = 'none';
    }
    
    /**
     * Load tree images with promise-based completion checking
     */
    loadTreeImage() {
        return new Promise((resolve) => {
            if (this.treeImage.complete && this.treeImageLeaves.complete) {
                resolve();
            } else {
                let imagesLoaded = 0;
                const checkLoaded = () => {
                    imagesLoaded++;
                    if (imagesLoaded === 2) resolve();
                };
                
                this.treeImage.onload = checkLoaded;
                this.treeImageLeaves.onload = checkLoaded;
            }
        });
    }
    
    /**
     * Fetch visitor data from the API
     */
    async fetchVisitorData() {
        try {
            const response = await fetch('/api/tree');
            this.visitors = await response.json();
            console.log(`Loaded ${this.visitors.length} visitors`);
        } catch (error) {
            console.error('Error fetching visitor data:', error);
            this.visitors = [];
        }
    }
    
    // ==================== TREE VISUALIZATION METHODS ====================
    
    /**
     * Create leaf elements for all visitors
     */
    createLeaves() {
        this.leavesContainer.innerHTML = '';
        const treeRect = this.treeImage.getBoundingClientRect();
        const containerRect = this.leavesContainer.getBoundingClientRect();
        const ovalArea = this.calculateOvalArea(treeRect, containerRect);
        
        console.log('Oval area for leaves:', ovalArea);
        this.updateOvalOverlay(ovalArea);
        
        this.visitors.forEach((visitor, index) => {
            this.createLeaf(visitor, index, ovalArea);
        });
    }
    
    /**
     * Calculate the oval area for leaf placement
     */
    calculateOvalArea(treeRect, containerRect) {
        const baseOvalArea = {
            x: treeRect.left - containerRect.left + (treeRect.width - this.ovalWidth) / 2,
            y: treeRect.top - containerRect.top + (treeRect.height - this.ovalHeight) / 2,
            width: this.ovalWidth,
            height: this.ovalHeight
        };
        
        const adjustedY = baseOvalArea.y + this.ovalTopOffset;
        const adjustedHeight = this.ovalHeight - this.ovalTopOffset + this.ovalBottomOffset;
        
        return {
            x: baseOvalArea.x,
            y: adjustedY,
            width: this.ovalWidth,
            height: adjustedHeight
        };
    }
    
    /**
     * Update the visual oval overlay for debugging
     */
    updateOvalOverlay(ovalArea) {
        let ovalOverlay = document.getElementById('ovalOverlay');
        if (!ovalOverlay) {
            ovalOverlay = document.createElement('div');
            ovalOverlay.id = 'ovalOverlay';
            document.getElementById('treeContainer').appendChild(ovalOverlay);
        }
        
        ovalOverlay.style.width = ovalArea.width + 'px';
        ovalOverlay.style.height = ovalArea.height + 'px';
        ovalOverlay.style.left = ovalArea.x + 'px';
        ovalOverlay.style.top = ovalArea.y + 'px';
        ovalOverlay.style.transform = 'none';
    }
    
    /**
     * Create an individual leaf element for a visitor
     */
    createLeaf(visitor, index, ovalArea) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        
        // Randomly choose leaf type and calculate size
        const leafType = Math.random() > 0.5 ? 'leafleft.png' : 'leafright.png';
        const leafSize = 80 + (visitor.visit_count * 5);
        
        // Set leaf styles
        leaf.style.width = leafSize + 'px';
        leaf.style.height = leafSize + 'px';
        leaf.style.backgroundImage = `url('/assets/Tree/${leafType}')`;
        leaf.style.backgroundSize = 'contain';
        leaf.style.backgroundRepeat = 'no-repeat';
        leaf.style.backgroundPosition = 'center';
        
        // Position the leaf within the oval area
        const position = this.findRandomPositionInOval(ovalArea, leafSize);
        leaf.style.left = position.x + 'px';
        leaf.style.top = position.y + 'px';
        
        // Create name label
        const nameElement = document.createElement('div');
        nameElement.className = 'leaf-name';
        nameElement.textContent = visitor.name || '';
        
        const fontSize = Math.max(10, Math.min(14, leafSize / 6));
        nameElement.style.fontSize = fontSize + 'px';
        
        leaf.appendChild(nameElement);
        this.leavesContainer.appendChild(leaf);
        
        // Add tooltip with visitor information
        if (visitor.name && typeof visitor.visit_count === 'number') {
            leaf.title = `${visitor.name} - ${visitor.visit_count} visit${visitor.visit_count > 1 ? 's' : ''}`;
        }
    }
    
    /**
     * Find a random position within the oval area for leaf placement
     */
    findRandomPositionInOval(ovalArea, leafSize) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random());
        
        const ovalX = ovalArea.width / 2 + distance * (ovalArea.width / 2) * Math.cos(angle);
        const ovalY = ovalArea.height / 2 + distance * (ovalArea.height / 2) * Math.sin(angle);
        
        const x = ovalArea.x + ovalX - leafSize / 2;
        const y = ovalArea.y + ovalY - leafSize / 2;
        
        return { x, y };
    }
    
    // ==================== VISUAL EFFECTS & UPDATES ====================
    
    /**
     * Update tree transparency based on number of visitors
     */
    updateLeavesTransparency() {
        const userCount = this.visitors.length;
        const steps = Math.floor(userCount / this.usersPerStep);
        const newTransparency = Math.min(1.0, steps * this.transparencyStep);
        
        this.treeImageLeaves.style.opacity = newTransparency;
        const transparencyPercentage = Math.round(newTransparency * 100);
        this.transparencyValue.textContent = transparencyPercentage;
        
        console.log(`User count: ${userCount}, Transparency: ${newTransparency}`);
    }
    
    /**
     * Refresh the entire tree visualization
     */
    refreshTree() {
        this.createLeaves();
        this.updateLeavesTransparency();
    }
    
    // ==================== CONFIGURATION METHODS ====================
    
    /**
     * Set the oval position offsets
     */
    setOvalPosition(topOffset, bottomOffset) {
        this.ovalTopOffset = topOffset;
        this.ovalBottomOffset = bottomOffset;
        this.refreshTree();
    }
    
    /**
     * Add a new visitor to the tree (manual addition)
     */
    addVisitor(name, visitCount = 1) {
        this.visitors.push({
            name: name,
            visit_count: visitCount
        });
        this.refreshTree();
    }
}

// ==================== GLOBAL VARIABLES ====================

let treeManager;

// ==================== EVENT LISTENERS ====================

/**
 * Initialize TreeManager when window loads
 */
window.addEventListener('load', () => {
    treeManager = new TreeManager();
});

/**
 * Auto-refresh tree data every 30 seconds
 */
setInterval(() => {
    if (treeManager) {
        treeManager.fetchVisitorData().then(() => {
            treeManager.refreshTree();
        });
    }
}, 30000);

/**
 * Refresh tree on window resize
 */
window.addEventListener('resize', () => {
    if (treeManager) {
        setTimeout(() => {
            treeManager.refreshTree();
        }, 100);
    }
});