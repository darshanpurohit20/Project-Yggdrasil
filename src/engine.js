const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../data/state.json');

const INITIAL_STATE = {
    day: 0,
    trees: [
        {
            id: "tree_0",
            rootX: 500,
            active: true,
            branches: [
                {
                    id: "b_0_0",
                    x1: 500, y1: 1000,
                    x2: 500, y2: 850,
                    angle: 0, length: 150, depth: 0, active: true
                }
            ],
            leaves: []
        }
    ],
    logs: ["🌱 A new seed was planted in the digital soil."]
};

function loadState() {
    if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
    return INITIAL_STATE;
}

function saveState(state) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// angle is in radians, 0 is straight UP.
function getNextPoint(x, y, angle, length) {
    return {
        x: x + length * Math.sin(angle),
        y: y - length * Math.cos(angle)
    };
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function sprout() {
    let state = loadState();
    state.day += 1;
    let logMsg = `🌿 Day ${state.day}: The morning sun encourages new growth.`;
    
    let newBranchesAdded = 0;
    
    // Process active trees
    for (let tree of state.trees) {
        if (!tree.active) continue;
        
        const currentBranches = [...tree.branches];
        let hasActive = false;
        
        for (let branch of currentBranches) {
            if (!branch.active) continue;
            hasActive = true;
            
            // Stop logic
            if (branch.depth >= 10 || Math.random() < 0.1) {
                branch.active = false;
                continue;
            }
            
            // Decide to fork or go straight
            branch.active = false; // Current branch stops, new ones continue
            
            let isFork = Math.random() < 0.4;
            let numNew = isFork ? 2 : 1;
            
            for (let i = 0; i < numNew; i++) {
                let newLength = branch.length * randomInRange(0.75, 0.95);
                let angleOffset = isFork 
                    ? (i === 0 ? randomInRange(-0.6, -0.2) : randomInRange(0.2, 0.6)) // Fork Left, Fork Right
                    : randomInRange(-0.1, 0.1); // Wander
                    
                let newAngle = branch.angle + angleOffset;
                let nextP = getNextPoint(branch.x2, branch.y2, newAngle, newLength);
                
                tree.branches.push({
                    id: `b_${tree.id}_${tree.branches.length}`,
                    x1: branch.x2, y1: branch.y2,
                    x2: nextP.x, y2: nextP.y,
                    angle: newAngle,
                    length: newLength,
                    depth: branch.depth + 1,
                    active: true
                });
                newBranchesAdded++;
            }
        }
        
        if (!hasActive && tree.active) {
            tree.active = false;
            logMsg = `🍂 Day ${state.day}: A tree has reached its full majesty and stands still.`;
            
            // Plant a new seed!
            let newRootX = randomInRange(100, 900);
            state.trees.push({
                id: `tree_${state.trees.length}`,
                rootX: newRootX,
                active: true,
                branches: [
                    {
                        id: `b_${state.trees.length}_0`,
                        x1: newRootX, y1: 1000,
                        x2: newRootX, y2: 850 + randomInRange(-50, 50),
                        angle: randomInRange(-0.2, 0.2), 
                        length: randomInRange(100, 180), 
                        depth: 0, 
                        active: true
                    }
                ],
                leaves: []
            });
            logMsg += ` 🌰 A new seed drops at x=${Math.floor(newRootX)}.`;
        }
    }
    
    if (newBranchesAdded > 0) {
        logMsg = `🌿 Day ${state.day}: Sprouted ${newBranchesAdded} new branches.`;
    }
    
    state.logs.unshift(logMsg);
    if (state.logs.length > 30) state.logs.pop(); // Keep only last 30 logs
    
    saveState(state);
    console.log(logMsg);
}

function bloom() {
    let state = loadState();
    let leavesAdded = 0;
    
    for (let tree of state.trees) {
        for (let branch of tree.branches) {
            // Only outer branches can have leaves
            if (branch.depth > 4) {
                // Chance to grow a leaf if it doesn't have too many
                if (Math.random() < 0.3) {
                    let lx = branch.x2 + randomInRange(-10, 10);
                    let ly = branch.y2 + randomInRange(-10, 10);
                    
                    // Colors: standard greens, with rare chance of autumn or blossoms
                    let colors = ["#2ecc71", "#27ae60", "#1abc9c", "#e74c3c", "#f1c40f", "#e84393"];
                    let color = Math.random() < 0.8 
                        ? colors[Math.floor(randomInRange(0, 3))]  // Regular leaves
                        : colors[Math.floor(randomInRange(3, 6))]; // Flowers/Rare
                        
                    tree.leaves.push({
                        x: lx, 
                        y: ly, 
                        r: randomInRange(3, 8),
                        color: color
                    });
                    leavesAdded++;
                }
            }
        }
    }
    
    let logMsg = `🌸 Midday bloom: The canopy thickened with ${leavesAdded} new foliage elements.`;
    state.logs.unshift(logMsg);
    if (state.logs.length > 30) state.logs.pop();
    
    saveState(state);
    console.log(logMsg);
}

function rest() {
    let state = loadState();
    let logMsg = `🌙 Evening rests the ecosystem. Day ${state.day} comes to a close.`;
    state.logs.unshift(logMsg);
    if (state.logs.length > 30) state.logs.pop();
    
    // Simulate slight wind in branches by trivially adjusting random branches
    for (let tree of state.trees) {
        for (let branch of tree.branches) {
            if (Math.random() < 0.1 && !branch.active) {
                // Micro sway
                branch.angle += (Math.random() - 0.5) * 0.01;
            }
        }
    }
    
    saveState(state);
    console.log(logMsg);
}

module.exports = { sprout, bloom, rest, loadState };
