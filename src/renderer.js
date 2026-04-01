const fs = require('fs');
const path = require('path');
const { loadState } = require('./engine');

const SVG_FILE = path.join(__dirname, '../bonsai.svg');
const LOG_FILE = path.join(__dirname, '../data/chronicle.md');
const README_FILE = path.join(__dirname, '../README.md');

function generateSVG(state) {
    let width = 1000;
    let height = 1000;
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#0f2027;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#203a43;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2c5364;stop-opacity:1" />
        </linearGradient>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <radialGradient id="moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="70%" stop-color="#f1c40f" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#f1c40f" stop-opacity="0" />
        </radialGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#sky)" />
    
    <!-- Moon / Sun -->
    <circle cx="200" cy="200" r="80" fill="url(#moon)" filter="url(#glow)" />
    
    <!-- Digital Soil -->
    <path d="M0 980 Q 250 950 500 980 T 1000 980 L 1000 1000 L 0 1000 Z" fill="#1e272e" />
    <path d="M0 990 Q 300 960 600 990 T 1000 990 L 1000 1000 L 0 1000 Z" fill="#2d3436" />
    
    <!-- Trees -->
    <g id="forest">
`;

    // Render branches
    for (let tree of state.trees) {
        let maxDepth = Math.max(...tree.branches.map(b => b.depth));
        
        for (let branch of tree.branches) {
            // Stroke width gets thinner as depth increases
            let sw = Math.max(1, 15 - (branch.depth * 1.2));
            // Color gets slightly lighter (wood tone)
            let color = "#5c4033"; 
            if (branch.depth > 3) color = "#6d4c41";
            if (branch.depth > 6) color = "#8d6e63";
            
            svgContent += `        <line x1="${branch.x1}" y1="${branch.y1}" x2="${branch.x2}" y2="${branch.y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" />\n`;
        }
        
        // Render Leaves
        for (let leaf of tree.leaves) {
            svgContent += `        <circle cx="${leaf.x}" cy="${leaf.y}" r="${leaf.r}" fill="${leaf.color}" opacity="0.85" filter="url(#glow)" />\n`;
        }
    }

    svgContent += `
    </g>
    
    <!-- Stats Overlay -->
    <text x="30" y="50" fill="#ecf0f1" font-family="monospace" font-size="20">Project Yggdrasil // Epoch ${state.day}</text>
    <text x="30" y="80" fill="#bdc3c7" font-family="monospace" font-size="14">Trees: ${state.trees.length}</text>
    <text x="30" y="100" fill="#bdc3c7" font-family="monospace" font-size="14">Branches: ${state.trees.reduce((acc, t) => acc + t.branches.length, 0)}</text>
    <text x="30" y="120" fill="#bdc3c7" font-family="monospace" font-size="14">Foliage: ${state.trees.reduce((acc, t) => acc + t.leaves.length, 0)}</text>
</svg>`;

    fs.writeFileSync(SVG_FILE, svgContent);
    console.log(`🖼  SVG updated at ${SVG_FILE}`);
}

function updateReadme(state) {
    let recentLogs = state.logs.slice(0, 5).map(l => `- ${l}`).join('\n');
    let totalBranches = state.trees.reduce((acc, t) => acc + t.branches.length, 0);
    let totalLeaves = state.trees.reduce((acc, t) => acc + t.leaves.length, 0);
    
    let readmeContent = `# Project Yggdrasil 🌳

> The Living Forest: A procedural digital ecosystem that evolves 3 times a day via GitHub Actions.

![Yggdrasil Forest](./bonsai.svg)

### 📊 Ecosystem Stats
- **Epoch (Days Alive):** ${state.day}
- **Trees Planted:** ${state.trees.length}
- **Total Branches:** ${totalBranches}
- **Total Foliage:** ${totalLeaves}

### 📖 Botanist's Log (Latest entries)
${recentLogs}

---
*Generated procedurally by GitHub Actions. This repository is alive.*
`;

    fs.writeFileSync(README_FILE, readmeContent);
    
    // Also save the full chronicle
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    let chronicle = `# The Chronicles of Yggdrasil\n\n${state.logs.map(l => `- ${l}`).join('\n')}\n`;
    fs.writeFileSync(LOG_FILE, chronicle);
    
    console.log(`📝 README and Chronicles updated.`);
}

function render() {
    let state = loadState();
    generateSVG(state);
    updateReadme(state);
}

module.exports = { render };
