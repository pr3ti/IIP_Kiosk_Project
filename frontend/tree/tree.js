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
        
        // Data storage
        this.visitors = [];
        
        // Tree configuration
        this.ovalWidth = 1400;
        this.ovalHeight = 500;
        this.ovalTopOffset = 0;
        this.ovalBottomOffset = 0;

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
    // Update the trunk image based on submission milestones (every 5)
        
    updateTreeStage(totalSubmissions) {
        if (!this.treeImage) return;

        let trunkImage;
        let currentScale = 1.0; 

        // Milestones starting from Stage 1
        if (totalSubmissions >= 20) {
            trunkImage = 'stage4.png';
            currentScale = 1.0;      
            this.ovalTopOffset = -180; 
        } else if (totalSubmissions >= 15) {
            trunkImage = 'stage3.png';
            currentScale = 0.75;     
            this.ovalTopOffset = -100;
        } else if (totalSubmissions >= 10) {
            trunkImage = 'stage2.png';
            currentScale = 0.55;     
            this.ovalTopOffset = -40;
        } else {
            // Default to Stage 1 for anything less than 10
            trunkImage = 'stage1.png';
            currentScale = 0.35;     
            this.ovalTopOffset = 30;
        }

        // This fixes the "straight line" issue:
        // We force a height proportional to the width so leaves can scatter vertically.
        this.ovalWidth = 1400 * currentScale;
        this.ovalHeight = 730 * currentScale; 

        this.treeImage.src = `/assets/Tree/${trunkImage}`;
        
        // Hide the unused leaves reference image
        if (this.treeImageLeaves) {
            this.treeImageLeaves.style.display = 'none';
        }

        this.refreshTree();
    }

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
 
    calculateOvalArea(treeRect, containerRect) {
        const centerX = treeRect.left - containerRect.left + (treeRect.width / 2);
    
        // 2. Find the vertical center point where branches begin
        // We use a percentage (e.g., 40% from the top of the tree image) 
        // so it scales as the tree grows taller.
        const centerY = treeRect.top - containerRect.top + (treeRect.height * 0.4);

        return {
            x: centerX - (this.ovalWidth / 2),
            y: centerY - (this.ovalHeight / 2) + this.ovalTopOffset,
            width: this.ovalWidth,
            height: this.ovalHeight
        };
    } 
   
    /*
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

        // 1. Decide direction (Left/Right)
        const side = Math.random() > 0.5 ? 'LeftLeaf.png' : 'RightLeaf.png';

        // 2. The 2-minute rule (Adjusted for UTC+8/Local sync)
        const visitTime = new Date(visitor.created_at); 
        const now = new Date();

        // Calculate difference in milliseconds
        const diffInMs = now.getTime() - visitTime.getTime();
        const diffInMinutes = diffInMs / 60000;

        // 3. Select image based on age
        let finalLeafImage;
        if (diffInMinutes >= 0 && diffInMinutes <= 2) {
            finalLeafImage = 'New' + side;
        } else {
            finalLeafImage = 'Old' + side;
        }

        leaf.style.backgroundImage = `url('/assets/Tree/${finalLeafImage}')`;
        
        const leafSize = 80 + ((visitor.visit_count || 1) * 5);
        leaf.style.width = leafSize + 'px';
        leaf.style.height = leafSize + 'px';

        const position = this.findRandomPositionInOval(ovalArea, leafSize);
        leaf.style.left = position.x + 'px';
        leaf.style.top = position.y + 'px';

        const nameElement = document.createElement('div');
        nameElement.className = 'leaf-name';
        nameElement.textContent = visitor.name || '';
        leaf.appendChild(nameElement);
        this.leavesContainer.appendChild(leaf);
    }

    findRandomPositionInOval(ovalArea, leafSize) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random());
        
        // Calculate position relative to the CENTER of the ovalArea
        const offsetX = (ovalArea.width / 2) * distance * Math.cos(angle);
        const offsetY = (ovalArea.height / 2) * distance * Math.sin(angle);
        
        const x = (ovalArea.x + ovalArea.width / 2) + offsetX - (leafSize / 2);
        const y = (ovalArea.y + ovalArea.height / 2) + offsetY - (leafSize / 2);
        
        return { x, y };
    } 
    
    // ==================== VISUAL EFFECTS & UPDATES ====================
    
    /**
     * Update tree transparency (disabled)
     */
    updateLeavesTransparency() {
        this.treeImageLeaves.style.opacity = '1';
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